const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { openDatabase } = require('./database');
const rules = require('./public/engine');
const {registerDuels}=require('./duels');
const spawnStream=require('./spawn-plan');
const scrypt = promisify(crypto.scrypt);
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const route = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

async function createApp() {
 const db = await openDatabase();
 const app = express();
 app.disable('x-powered-by');
 // Render places exactly one trusted reverse proxy in front of the service.
 if(process.env.RENDER) app.set('trust proxy',1);
 app.use(express.json({limit:'4kb'}));
 app.use('/api',(req,res,next)=>{
  res.set('Cache-Control','no-store');
  if(req.method!=='GET'){
   const origin=req.get('origin');
   if(origin){try{if(new URL(origin).host!==req.get('host'))return res.status(403).json({error:'Origine refusée.'});}catch{return res.sendStatus(403);}}
   if(req.get('sec-fetch-site')==='cross-site')return res.sendStatus(403);
   if(!req.is('application/json'))return res.status(415).json({error:'JSON requis.'});
  }next();
 });
 const attempts=new Map();
 function rateLimit(req,res,next){const key=req.ip,now=Date.now();let value=attempts.get(key);if(!value||value.until<now){value={count:0,until:now+60000};attempts.set(key,value);}if(++value.count>20)return res.status(429).json({error:'Trop de tentatives. Réessaie dans une minute.'});next();}
 const cleanup=setInterval(()=>{for(const [key,value]of attempts)if(value.until<Date.now())attempts.delete(key);db.run('DELETE FROM sessions WHERE expires < ?',[Date.now()]).catch(()=>console.error('Session cleanup failed'));},60000);cleanup.unref();
 function cookie(req){return(req.headers.cookie||'').match(/(?:^|;\s*)fusion_session=([a-f0-9]{64})(?:;|$)/)?.[1];}
 async function user(req){const token=cookie(req);return token?db.one('SELECT users.id,username,best FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?',[hashToken(token),Date.now()]):null;}
 const auth=route(async(req,res,next)=>{req.user=await user(req);if(!req.user)return res.status(401).json({error:'Connecte-toi pour jouer en mode classé.'});next();});
 async function session(req,res,id){const token=crypto.randomBytes(32).toString('hex');await db.run('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)',[hashToken(token),id,Date.now()+7*86400000]);res.cookie('fusion_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*86400000,path:'/'});}
 app.post('/api/register',rateLimit,route(async(req,res)=>{
  const {username,password}=req.body||{};
  if(typeof username!=='string'||! /^[\p{L}\p{N}_-]{3,20}$/u.test(username)||typeof password!=='string'||password.length<10||password.length>128)return res.status(400).json({error:'Pseudo : 3 à 20 lettres, chiffres, _ ou -. Mot de passe : 10 à 128 caractères.'});
  const key=username.normalize('NFKC').toLocaleLowerCase('fr'),salt=crypto.randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
  let found;try{found=await db.one('INSERT INTO users(username,username_key,salt,hash) VALUES(?,?,?,?) RETURNING id',[username,key,salt,hash]);}catch(e){if(e.code==='23505'||(e.code==='ERR_SQLITE_ERROR'&&String(e.message).includes('UNIQUE')))return res.status(409).json({error:'Ce pseudo est déjà pris.'});throw e;}
  await session(req,res,found.id);res.status(201).json({user:{username,best:0}});
 }));
 app.post('/api/login',rateLimit,route(async(req,res)=>{
  const {username,password}=req.body||{};
  if(typeof username!=='string'||username.length>40||typeof password!=='string'||password.length>128)return res.status(400).json({error:'Identifiants invalides.'});
  const found=await db.one('SELECT * FROM users WHERE username_key=?',[username.normalize('NFKC').toLocaleLowerCase('fr')]);
  const hash=await scrypt(password,found?.salt||'invalid-login-salt',64);
  if(!found||!crypto.timingSafeEqual(hash,Buffer.from(found.hash,'hex')))return res.status(401).json({error:'Pseudo ou mot de passe incorrect.'});
  await session(req,res,found.id);res.json({user:{username:found.username,best:found.best}});
 }));
 app.post('/api/logout',route(async(req,res)=>{const token=cookie(req);if(token)await db.run('DELETE FROM sessions WHERE token=?',[hashToken(token)]);res.clearCookie('fusion_session',{path:'/'});res.json({ok:true});}));
 app.get('/api/me',route(async(req,res)=>{const found=await user(req);res.json({user:found?{username:found.username,best:found.best}:null});}));
 app.get('/api/leaderboard',route(async(req,res)=>res.json({entries:await db.all('SELECT username,best FROM users WHERE best>0 ORDER BY best DESC,username ASC LIMIT 50')})));
 function spawn(board){const empty=board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!empty.length)return -1;const index=empty[crypto.randomInt(empty.length)];board[index]=crypto.randomInt(10)<9?2:4;return index;}
 async function readGame(connection,id){const row=await connection.one('SELECT * FROM games WHERE user_id=?',[id]);return row?{board:JSON.parse(row.board),score:row.score,moves:row.moves,won:!!row.won,spawnSeed:'solo:'+id,spawnPlan:spawnStream.plan('solo:'+id,row.moves)}:null;}
 app.get('/api/game',auth,route(async(req,res)=>res.json({game:await readGame(db,req.user.id)})));
 app.post('/api/game',auth,route(async(req,res)=>{
  const game=await db.transaction(async tx=>{await tx.lockUser(req.user.id);const board=Array(16).fill(0);spawn(board);spawn(board);await tx.run('INSERT INTO games(user_id,board,score,moves,won) VALUES(?,?,0,0,0) ON CONFLICT(user_id) DO UPDATE SET board=excluded.board,score=0,moves=0,won=0',[req.user.id,JSON.stringify(board)]);return readGame(tx,req.user.id);});res.json({game});
 }));
 app.post('/api/move',auth,route(async(req,res)=>{
  const directions=spawnStream.directions(req.body);if(!directions)return res.status(400).json({error:'Directions invalides.'});
  const payload=await db.transaction(async tx=>{
   await tx.lockUser(req.user.id);
   const game=await readGame(tx,req.user.id);if(!game)return null;
   if(spawnStream.stale(req.body,game))return{conflict:true,game};
   let result,spawned=-1;
   for(const direction of directions){
    result=rules.move(game.board,direction);spawned=-1;
    if(result.changed){spawned=spawnStream.addTile(result.board,'solo:'+req.user.id,game.moves+2);game.board=result.board;game.score+=result.gain;game.moves++;game.won=game.won||game.board.some(v=>v>=2048);}
   }
   await tx.run('UPDATE games SET board=?,score=?,moves=?,won=? WHERE user_id=?',[JSON.stringify(game.board),game.score,game.moves,+game.won,req.user.id]);
   await tx.run('UPDATE users SET best=CASE WHEN best < ? THEN ? ELSE best END WHERE id=?',[game.score,game.score,req.user.id]);
   game.spawnPlan=spawnStream.plan('solo:'+req.user.id,game.moves);
   const current=await tx.one('SELECT best FROM users WHERE id=?',[req.user.id]);
   return {game,result,spawned,best:current.best};
  });
  if(!payload)return res.status(409).json({error:'Commence une partie classée.'});
  if(payload.conflict)return res.status(409).json({...payload,error:'Partie resynchronisée.'});
  res.json(payload);
 }));
 registerDuels({app,db,auth,route,rateLimit});
 app.get('/healthz',route(async(req,res)=>{await db.one('SELECT 1 AS ok');res.json({ok:true});}));
 app.use(express.static(path.join(__dirname,'public'),{setHeaders(res,file){res.setHeader('Cache-Control',file.endsWith('.html')?'no-store':'no-cache');}}));
 app.use((err,req,res,next)=>{if(err.type==='entity.parse.failed')return res.status(400).json({error:'JSON invalide.'});console.error('Request failed:',err.code||err.name);res.status(500).json({error:'Erreur serveur. Réessaie.'});});
 return {app,db,async close(){clearInterval(cleanup);await db.close();}};
}
if(require.main===module)createApp().then(({app})=>app.listen(process.env.PORT||3000,()=>console.log(`Fusion 2048 running on port ${process.env.PORT||3000}`))).catch(err=>{console.error('Startup failed:',err.code||err.message);process.exitCode=1;});
module.exports={createApp};
