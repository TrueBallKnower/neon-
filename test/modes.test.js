const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const modes=require('../game-modes');
const {createApp}=require('../server');

test('sudden death starts on first fusion and has a strict two-second gap',()=>{
 const state=modes.create('sudden',1000);modes.expire(state,9000);assert.equal(state.endedAt,null);
 modes.fusion(state,{gain:4},10000);assert.equal(state.comboDeadline,12000);
 modes.fusion(state,{gain:0},11000);assert.equal(state.comboDeadline,12000);
 modes.expire(state,11999);assert.equal(state.endedAt,null);
 modes.fusion(state,{gain:8},11999);assert.equal(state.comboDeadline,13999);
 modes.expire(state,13999);assert.equal(state.reason,'combo');
 const classic=modes.create('classic',0);modes.fusion(classic,{gain:4},10);modes.expire(classic,999999);assert.equal(classic.endedAt,null);assert.equal(modes.get('classic').comboMs,1500);assert.equal(modes.get('sudden').comboMs,2000);
});

test('solo and competitive variants enforce death, sprint/rush rules and separate records',async()=>{
 process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-modes-'));const instance=await createApp(),server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 function client(){let cookie='';return async(endpoint,body)=>{const res=await fetch(base+'/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];return{status:res.status,data:await res.json()};};}
 const a=client(),b=client(),suffix=crypto.randomBytes(3).toString('hex');
 async function updateDuel(code,fn){const state=JSON.parse((await instance.db.one('SELECT state FROM duels WHERE code=?',[code])).state);fn(state);await instance.db.run('UPDATE duels SET state=? WHERE code=?',[JSON.stringify(state),code]);}
 try{
  for(const [i,request]of[a,b].entries())await request('register',{username:`Modes${i}_${suffix}`,password:'test-password-123'});
  const id=(await instance.db.one('SELECT id FROM users WHERE username=?',[`Modes0_${suffix}`])).id;
  assert.equal((await a('game',{mode:'no-such-mode'})).status,400);
  const initial=await a('game',{mode:'sudden'});assert.equal(initial.data.game.meta.mode,'sudden');assert.equal(initial.data.game.meta.comboDeadline,null);
  await instance.db.run('UPDATE games SET board=? WHERE user_id=?',[JSON.stringify([2,2,...Array(14).fill(0)]),id]);
  const time=Date.now(),fusion=await a('move',{direction:'left',times:[time]});assert.equal(fusion.data.game.meta.comboDeadline,time+2000);assert.equal(fusion.data.game.score,4);assert.equal((await a('me')).data.user.best,0);
  assert.ok((await a('leaderboard?mode=sudden')).data.entries.some(e=>e.username===`Modes0_${suffix}`&&e.best===4));
  const meta=fusion.data.game.meta;meta.comboDeadline=Date.now()-modes.GRACE-10;await modes.saveMeta(instance.db,id,meta);
  const dead=await a('move',{direction:'right'});assert.equal(dead.data.terminal,true);assert.equal(dead.data.game.meta.reason,'combo');assert.equal(dead.data.game.moves,1);
  const sprint=(await a('game',{mode:'sprint'})).data.game;assert.equal(sprint.meta.endsAt-sprint.meta.startedAt,60000);sprint.meta.endsAt=Date.now()-1;await modes.saveMeta(instance.db,id,sprint.meta);assert.equal((await a('move',{direction:'down'})).data.game.meta.reason,'time');
  await a('game',{mode:'rush'});await instance.db.run('UPDATE games SET board=? WHERE user_id=?',[JSON.stringify([64,64,...Array(14).fill(0)]),id]);const rush=await a('move',{direction:'left'});assert.equal(rush.data.game.meta.reason,'target');assert.equal(rush.data.terminal,true);
  const room=(await a('duels',{mode:'sudden'})).data.duel;const joined=(await b(`duels/${room.code}/join`,{})).data.duel;assert.equal(joined.mode,'sudden');
  await updateDuel(room.code,state=>{state.startsAt=Date.now()-100;state.endsAt=Date.now()+300000;state.players[0].board=[2,2,...Array(14).fill(0)];});
  const armed=(await a(`duels/${room.code}/move`,{direction:'left'})).data.duel;assert.ok(armed.me.comboDeadline);assert.equal(armed.me.comboDeadline,armed.opponent.comboDeadline,'first fusion arms both players');
  await updateDuel(room.code,state=>{state.players[1].comboDeadline=Date.now()-modes.GRACE-10;});
  const result=(await a(`duels/${room.code}`)).data.duel;assert.equal(result.status,'finished');assert.equal(result.reason,'combo');assert.equal(result.winner,id);
  const fast=(await a('duels',{mode:'sprint'})).data.duel;const fastJoin=(await b(`duels/${fast.code}/join`,{})).data.duel;assert.equal(fastJoin.endsAt-fastJoin.startsAt,60000);
  const race=(await a('duels',{mode:'rush'})).data.duel;await b(`duels/${race.code}/join`,{});await updateDuel(race.code,state=>{state.startsAt=Date.now()-100;state.endsAt=Date.now()+300000;state.players[0].board=[64,64,...Array(14).fill(0)];});const won=(await a(`duels/${race.code}/move`,{direction:'left'})).data.duel;assert.equal(won.status,'finished');assert.equal(won.winner,id);assert.equal(won.reason,'target');
 }finally{await new Promise(r=>server.close(r));await instance.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});delete process.env.DATA_DIR;}
});
