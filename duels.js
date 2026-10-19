const crypto=require('node:crypto');
const rules=require('./public/engine');
const DURATION=5*60*1000,COUNTDOWN=3000;
const spawnStream=require('./spawn-plan');
const {addTile}=spawnStream;
const modes=require('./game-modes');
const {friends}=require('./social');
function player(id,name,seed){const board=Array(16).fill(0);addTile(board,seed,0);addTile(board,seed,1);return{id,name,board,score:0,moves:0,blocked:false};}
function eliminated(state,now,grace=modes.GRACE){return state.mode==='sudden'?state.players.filter(p=>p.lostAt||(p.comboDeadline&&now>=p.comboDeadline+grace)).sort((a,b)=>a.comboDeadline-b.comboDeadline):[];}
function phase(state,now){if(state.forfeit||state.targetWinner||eliminated(state,now).length)return'finished';if(!state.startsAt)return'waiting';if(now<state.startsAt)return'countdown';if(now>=state.endsAt)return'finished';return'playing';}
function view(state,id,now=Date.now()){
 const me=state.players.find(p=>p.id===id),other=state.players.find(p=>p.id!==id),status=phase(state,now),lost=eliminated(state,now);
 let winner=null,reason=null;if(status==='finished'){
  if(state.forfeit){winner=state.players.find(p=>p.id!==state.forfeit)?.id||null;reason='forfeit';}
  else if(state.targetWinner){winner=state.targetWinner;reason='target';}
  else if(lost.length){reason='combo';winner=lost.length===2&&lost[0].comboDeadline===lost[1].comboDeadline?null:state.players.find(p=>p.id!==lost[0].id)?.id||null;}
  else{reason='time';if(other&&me.score!==other.score)winner=me.score>other.score?me.id:other.id;}
 }
 const series=JSON.parse(JSON.stringify(state.series||{round:1,wins:{},draws:0}));if(status==='finished'&&other){if(winner)series.wins[winner]=(series.wins[winner]||0)+1;else series.draws++;}
 return{series,rematchVotes:state.rematchVotes||[],nextCode:state.nextCode||null,code:state.code,mode:state.mode||'classic',status,serverNow:now,startsAt:state.startsAt,endsAt:state.endsAt,duration:modes.get(state.mode).duelMs,me:{...me,spawnSeed:state.seed,spawnPlan:spawnStream.plan(state.seed,me.moves)},opponent:other||null,winner,reason,forfeit:!!state.forfeit};
}
function registerDuels({app,db,auth,route,rateLimit}){
 const invalid=res=>res.status(404).json({error:'Duel introuvable. Vérifie le code.'});
 async function locked(tx,code){return tx.one('SELECT * FROM duels WHERE code=?'+(process.env.DATABASE_URL?' FOR UPDATE':''),[code]);}
 async function save(tx,state){await tx.run('UPDATE duels SET guest_id=?,state=? WHERE code=?',[state.players[1]?.id||null,JSON.stringify(state),state.code]);}
 app.post('/api/duels',auth,rateLimit,route(async(req,res)=>{
  if(!modes.validMode(req.body?.mode))return res.status(400).json({error:'Mode inconnu.'});
  const mode=modes.get(req.body?.mode).id;
  const invitedId=req.body?.friendId;if(invitedId!==undefined&&!await friends(db,req.user.id,invitedId))return res.status(403).json({error:'Ce joueur doit être ton ami.'});
  const seed=crypto.randomBytes(24).toString('hex'),code=crypto.randomBytes(5).toString('hex').toUpperCase();
  const state={code,seed,mode,invitedId:invitedId||null,players:[player(req.user.id,req.user.username,seed)],startsAt:null,endsAt:null,forfeit:null};
  await db.run('DELETE FROM duels WHERE expires < ?',[Date.now()]);
  await db.run('INSERT INTO duels(code,host_id,guest_id,state,expires) VALUES(?,?,NULL,?,?)',[code,req.user.id,JSON.stringify(state),Date.now()+86400000]);
  res.status(201).json({duel:view(state,req.user.id)});
 }));
 app.post('/api/duels/:code/join',auth,rateLimit,route(async(req,res)=>{
  const result=await db.transaction(async tx=>{
   const row=await locked(tx,req.params.code.toUpperCase());if(!row||Number(row.expires)<Date.now())return null;const state=JSON.parse(row.state);
   if(state.players.some(p=>p.id===req.user.id))return{duel:view(state,req.user.id)};
   if(state.invitedId&&state.invitedId!==req.user.id)return{error:'Ce duel est réservé à un ami.'};
   if(state.players.length>=2||phase(state,Date.now())!=='waiting')return{error:'Ce duel est déjà complet ou terminé.'};
   state.players.push(player(req.user.id,req.user.username,state.seed));state.startsAt=Date.now()+COUNTDOWN;state.endsAt=state.startsAt+modes.get(state.mode).duelMs;await save(tx,state);return{duel:view(state,req.user.id)};
  });if(!result)return invalid(res);if(result.error)return res.status(409).json(result);res.json(result);
 }));
 app.get('/api/duels/:code',auth,route(async(req,res)=>{
  const row=await db.one('SELECT * FROM duels WHERE code=?',[req.params.code.toUpperCase()]);if(!row||Number(row.expires)<Date.now())return invalid(res);const state=JSON.parse(row.state);
  if(!state.players.some(p=>p.id===req.user.id))return res.status(403).json({error:'Rejoins ce duel avec son code.'});res.json({duel:view(state,req.user.id)});
 }));
 app.post('/api/duels/:code/move',auth,route(async(req,res)=>{
  const times=modes.actionTimes(req.body,req.body.directions?.length||1,Date.now());if(!times)return res.status(400).json({error:'Horodatage invalide.'});
  const directions=spawnStream.directions(req.body);if(!directions)return res.status(400).json({error:'Directions invalides.'});
  const payload=await db.transaction(async tx=>{
   const row=await locked(tx,req.params.code.toUpperCase());if(!row||Number(row.expires)<Date.now())return null;const state=JSON.parse(row.state),me=state.players.find(p=>p.id===req.user.id);
   if(!me)return{error:'Tu ne participes pas à ce duel.',status:403};
   const status=phase(state,Date.now());if(status!=='playing')return{error:status==='countdown'?'Le duel commence bientôt.':'Le duel est terminé ou attend un adversaire.',status:409,duel:view(state,req.user.id)};
   if(spawnStream.stale(req.body,me))return{error:'Partie resynchronisée.',status:409,duel:view(state,req.user.id)};
   let result,spawned=-1;
   for(const [index,direction]of directions.entries()){
    const at=times[index];
    if(state.mode==='sudden'&&me.comboDeadline&&at>=me.comboDeadline){me.lostAt=me.comboDeadline;break;}
    if(state.targetWinner)break;
    result=rules.move(me.board,direction);spawned=-1;
    if(result.changed){spawned=addTile(result.board,state.seed,me.moves+2);me.board=result.board;me.score+=result.gain;me.moves++;me.blocked=!rules.canMove(me.board);
     if(state.mode==='sudden'&&result.gain){if(!state.suddenArmedAt){state.suddenArmedAt=at;for(const p of state.players)p.comboDeadline=at+2000;}me.comboDeadline=at+2000;}
     if(modes.get(state.mode).race&&me.board.some(v=>v>=modes.get(state.mode).target))state.targetWinner=me.id;
    }
   }
   await save(tx,state);
   return{duel:view(state,req.user.id),game:{board:me.board,score:me.score,moves:me.moves,won:false},result,spawned};
  });if(!payload)return invalid(res);if(payload.error)return res.status(payload.status).json(payload);res.json(payload);
 }));
 app.post('/api/duels/:code/rematch',auth,route(async(req,res)=>{
  const payload=await db.transaction(async tx=>{
   const row=await locked(tx,req.params.code.toUpperCase());if(!row||Number(row.expires)<Date.now())return null;
   const state=JSON.parse(row.state);if(!state.players.some(p=>p.id===req.user.id))return{error:'Accès refusé.',status:403};
   if(state.players.length!==2||phase(state,Date.now())!=='finished')return{error:'Terminez le duel avant la revanche.',status:409};
   state.rematchVotes=state.rematchVotes||[];if(!state.rematchVotes.includes(req.user.id))state.rematchVotes.push(req.user.id);
   if(state.rematchVotes.length===2&&!state.nextCode){
    const series=view(state,req.user.id).series;series.round++;
    const seed=crypto.randomBytes(24).toString('hex'),code=crypto.randomBytes(5).toString('hex').toUpperCase(),startsAt=Date.now()+COUNTDOWN;
    const next={code,seed,mode:state.mode,players:state.players.map(p=>player(p.id,p.name,seed)),startsAt,endsAt:startsAt+modes.get(state.mode).duelMs,forfeit:null,series};
    await tx.run('INSERT INTO duels(code,host_id,guest_id,state,expires) VALUES(?,?,?,?,?)',[code,next.players[0].id,next.players[1].id,JSON.stringify(next),Date.now()+86400000]);state.nextCode=code;
   }
   await save(tx,state);return{duel:view(state,req.user.id)};
  });if(!payload)return invalid(res);res.status(payload.status||200).json(payload);
 }));
 app.post('/api/duels/:code/leave',auth,route(async(req,res)=>{
  const payload=await db.transaction(async tx=>{const row=await locked(tx,req.params.code.toUpperCase());if(!row)return null;const state=JSON.parse(row.state);if(!state.players.some(p=>p.id===req.user.id))return{error:'Accès refusé.'};if(phase(state,Date.now())!=='finished'){state.forfeit=req.user.id;await save(tx,state);}return{duel:view(state,req.user.id)};});
  if(!payload)return invalid(res);if(payload.error)return res.status(403).json(payload);res.json(payload);
 }));
}
module.exports={registerDuels,DURATION,COUNTDOWN,phase,view,addTile};
