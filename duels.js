const crypto=require('node:crypto');
const rules=require('./public/engine');
const DURATION=5*60*1000,COUNTDOWN=3000;
const spawnStream=require('./spawn-plan');
const {addTile}=spawnStream;
function player(id,name,seed){const board=Array(16).fill(0);addTile(board,seed,0);addTile(board,seed,1);return{id,name,board,score:0,moves:0,blocked:false};}
function phase(state,now){if(state.forfeit)return'finished';if(!state.startsAt)return'waiting';if(now<state.startsAt)return'countdown';if(now>=state.endsAt)return'finished';return'playing';}
function view(state,id,now=Date.now()){
 const me=state.players.find(p=>p.id===id),other=state.players.find(p=>p.id!==id),status=phase(state,now);
 let winner=null;if(status==='finished'){if(state.forfeit)winner=state.players.find(p=>p.id!==state.forfeit)?.id||null;else if(other&&me.score!==other.score)winner=me.score>other.score?me.id:other.id;}
 return{code:state.code,status,serverNow:now,startsAt:state.startsAt,endsAt:state.endsAt,duration:DURATION,me:{...me,spawnSeed:state.seed,spawnPlan:spawnStream.plan(state.seed,me.moves)},opponent:other||null,winner,forfeit:!!state.forfeit};
}
function registerDuels({app,db,auth,route,rateLimit}){
 const invalid=res=>res.status(404).json({error:'Duel introuvable. Vérifie le code.'});
 async function locked(tx,code){return tx.one('SELECT * FROM duels WHERE code=?'+(process.env.DATABASE_URL?' FOR UPDATE':''),[code]);}
 async function save(tx,state){await tx.run('UPDATE duels SET guest_id=?,state=? WHERE code=?',[state.players[1]?.id||null,JSON.stringify(state),state.code]);}
 app.post('/api/duels',auth,rateLimit,route(async(req,res)=>{
  const seed=crypto.randomBytes(24).toString('hex'),code=crypto.randomBytes(5).toString('hex').toUpperCase();
  const state={code,seed,players:[player(req.user.id,req.user.username,seed)],startsAt:null,endsAt:null,forfeit:null};
  await db.run('DELETE FROM duels WHERE expires < ?',[Date.now()]);
  await db.run('INSERT INTO duels(code,host_id,guest_id,state,expires) VALUES(?,?,NULL,?,?)',[code,req.user.id,JSON.stringify(state),Date.now()+86400000]);
  res.status(201).json({duel:view(state,req.user.id)});
 }));
 app.post('/api/duels/:code/join',auth,rateLimit,route(async(req,res)=>{
  const result=await db.transaction(async tx=>{
   const row=await locked(tx,req.params.code.toUpperCase());if(!row||Number(row.expires)<Date.now())return null;const state=JSON.parse(row.state);
   if(state.players.some(p=>p.id===req.user.id))return{duel:view(state,req.user.id)};
   if(state.players.length>=2||phase(state,Date.now())!=='waiting')return{error:'Ce duel est déjà complet ou terminé.'};
   state.players.push(player(req.user.id,req.user.username,state.seed));state.startsAt=Date.now()+COUNTDOWN;state.endsAt=state.startsAt+DURATION;await save(tx,state);return{duel:view(state,req.user.id)};
  });if(!result)return invalid(res);if(result.error)return res.status(409).json(result);res.json(result);
 }));
 app.get('/api/duels/:code',auth,route(async(req,res)=>{
  const row=await db.one('SELECT * FROM duels WHERE code=?',[req.params.code.toUpperCase()]);if(!row||Number(row.expires)<Date.now())return invalid(res);const state=JSON.parse(row.state);
  if(!state.players.some(p=>p.id===req.user.id))return res.status(403).json({error:'Rejoins ce duel avec son code.'});res.json({duel:view(state,req.user.id)});
 }));
 app.post('/api/duels/:code/move',auth,route(async(req,res)=>{
  const directions=spawnStream.directions(req.body);if(!directions)return res.status(400).json({error:'Directions invalides.'});
  const payload=await db.transaction(async tx=>{
   const row=await locked(tx,req.params.code.toUpperCase());if(!row||Number(row.expires)<Date.now())return null;const state=JSON.parse(row.state),me=state.players.find(p=>p.id===req.user.id);
   if(!me)return{error:'Tu ne participes pas à ce duel.',status:403};
   const status=phase(state,Date.now());if(status!=='playing')return{error:status==='countdown'?'Le duel commence bientôt.':'Le duel est terminé ou attend un adversaire.',status:409,duel:view(state,req.user.id)};
   if(spawnStream.stale(req.body,me))return{error:'Partie resynchronisée.',status:409,duel:view(state,req.user.id)};
   let result,spawned=-1;
   for(const direction of directions){
    result=rules.move(me.board,direction);spawned=-1;
    if(result.changed){spawned=addTile(result.board,state.seed,me.moves+2);me.board=result.board;me.score+=result.gain;me.moves++;me.blocked=!rules.canMove(me.board);}
   }
   await save(tx,state);
   return{duel:view(state,req.user.id),game:{board:me.board,score:me.score,moves:me.moves,won:false},result,spawned};
  });if(!payload)return invalid(res);if(payload.error)return res.status(payload.status).json(payload);res.json(payload);
 }));
 app.post('/api/duels/:code/leave',auth,route(async(req,res)=>{
  const payload=await db.transaction(async tx=>{const row=await locked(tx,req.params.code.toUpperCase());if(!row)return null;const state=JSON.parse(row.state);if(!state.players.some(p=>p.id===req.user.id))return{error:'Accès refusé.'};if(phase(state,Date.now())!=='finished'){state.forfeit=req.user.id;await save(tx,state);}return{duel:view(state,req.user.id)};});
  if(!payload)return invalid(res);if(payload.error)return res.status(403).json(payload);res.json(payload);
 }));
}
module.exports={registerDuels,DURATION,COUNTDOWN,phase,view,addTile};
