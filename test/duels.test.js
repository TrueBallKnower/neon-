const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {createApp}=require('../server');
const {DURATION,COUNTDOWN}=require('../duels');

test('two-player duel: fair start, access control, concurrency, deadline, result and forfeit',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-duel-test-'));process.env.DATA_DIR=dir;
 let instance=await createApp(),server,base;
 async function listen(){server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;}
 async function stop(){await new Promise(r=>server.close(r));await instance.close();}
 await listen();
 function client(){let cookie='';return async(endpoint,body)=>{const response=await fetch(base+'/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return{status:response.status,data:await response.json()};};}
 const a=client(),b=client(),c=client();
 try{
  const suffix=crypto.randomBytes(4).toString('hex');
  for(const [index,request]of[a,b,c].entries())assert.equal((await request('register',{username:`Duel${index}_${suffix}`,password:'test-password-123'})).status,201);
  const created=await a('duels',{});assert.equal(created.status,201);let duel=created.data.duel;const code=duel.code;
  assert.equal(duel.status,'waiting');assert.equal(duel.duration,300000);assert.equal(DURATION,300000);assert.equal(COUNTDOWN,3000);
  assert.equal((await a(`duels/${code}/move`,{direction:'left'})).status,409);
  assert.equal((await c(`duels/${code}`)).status,403);
  const joined=await b(`duels/${code}/join`,{});assert.equal(joined.status,200);assert.equal(joined.data.duel.status,'countdown');assert.equal(joined.data.duel.endsAt-joined.data.duel.startsAt,300000);assert.deepEqual(joined.data.duel.me.board,duel.me.board);
  assert.equal((await c(`duels/${code}/join`,{})).status,409);
  assert.equal((await a(`duels/${code}/move`,{direction:'left'})).status,409);
  async function modify(fn){const row=await instance.db.one('SELECT state FROM duels WHERE code=?',[code]);const state=JSON.parse(row.state);fn(state);await instance.db.run('UPDATE duels SET state=? WHERE code=?',[JSON.stringify(state),code]);}
  await modify(state=>{state.startsAt=Date.now()-1000;state.endsAt=state.startsAt+DURATION;for(const p of state.players)p.board=[2,2,0,0,...Array(12).fill(0)];});
  const moved=await a(`duels/${code}/move`,{direction:'left',score:999999});assert.equal(moved.data.duel.me.score,4);assert.equal(moved.data.duel.opponent.score,0);assert.equal(moved.data.game.board[0],4);
  const parallel=await Promise.all(['down','right','up','left'].map(direction=>a(`duels/${code}/move`,{direction})));assert.ok(parallel.every(r=>r.status===200));
  duel=(await a(`duels/${code}`)).data.duel;assert.equal(duel.me.moves,1+parallel.filter(r=>r.data.result.changed).length);
  assert.equal((await a('me')).data.user.best,0,'duels must not replace solo leaderboard scores');
  await stop();instance=await createApp();await listen();assert.deepEqual((await a(`duels/${code}`)).data.duel.me.board,duel.me.board,'duel resumes after server restart');
  await modify(state=>{state.endsAt=Date.now()-1;});
  const late=await a(`duels/${code}/move`,{direction:'left'});assert.equal(late.status,409);assert.equal(late.data.duel.status,'finished');assert.equal(late.data.duel.winner,duel.me.id);assert.equal(late.data.duel.me.score,duel.me.score);
  const again=(await a('duels',{})).data.duel;await b(`duels/${again.code}/join`,{});const quit=await b(`duels/${again.code}/leave`,{});assert.equal(quit.data.duel.status,'finished');assert.equal(quit.data.duel.winner,again.me.id);
  const race=(await a('duels',{})).data.duel;const raceResults=await Promise.all([b(`duels/${race.code}/join`,{}),c(`duels/${race.code}/join`,{})]);assert.deepEqual(raceResults.map(r=>r.status).sort(),[200,409]);
 }finally{await stop();delete process.env.DATA_DIR;fs.rmSync(dir,{recursive:true,force:true});}
});
