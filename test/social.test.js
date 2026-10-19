const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createApp}=require('../server');
test('friends gate private chat and challenges; concurrent rematches retain the series across restart',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-social-'));process.env.DATA_DIR=dir;let instance=await createApp(),server,base;
 async function start(){server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;}
 async function stop(){await new Promise(r=>server.close(r));await instance.close();}await start();
 function client(){let cookie='';return async(url,body)=>{const r=await fetch(base+'/api/'+url,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return{status:r.status,...await r.json()};};}
 const a=client(),b=client(),c=client();try{
  for(const [i,request]of[a,b,c].entries())assert.equal((await request('register',{username:'Social'+i,password:'test-password-123'})).status,201);
  const users=await instance.db.all('SELECT id,username FROM users ORDER BY id'),[aid,bid,cid]=users.map(u=>u.id);
  assert.equal((await a(`friends/${bid}/messages`,{body:'No access'})).status,403);
  assert.equal((await a('friends',{username:'Social1'})).status,200);
  assert.equal((await a('friends',{username:'Social1'})).status,200);
  assert.equal((await b('friends')).friends[0].status,'received');
  await a(`friends/${bid}/respond`,{accept:true});assert.equal((await a('friends')).friends[0].status,'sent','sender cannot accept own request');
  await b(`friends/${aid}/respond`,{accept:true});assert.equal((await a('friends')).friends[0].status,'accepted');
  assert.equal((await a(`friends/${bid}/messages`,{body:'<script>alert(1)</script>'})).status,201);
  assert.equal((await b(`friends/${aid}/messages`)).messages[0].mine,false);
  assert.equal((await c(`friends/${aid}/messages`)).status,403);
  assert.equal((await a('duels',{friendId:cid})).status,403);
  let duel=(await a('duels',{friendId:bid,mode:'rush512'})).duel;let code=duel.code;
  assert.equal((await c(`duels/${code}/join`,{})).status,409);
  await instance.db.run('UPDATE messages SET created_at=0');
  assert.equal((await a(`friends/${bid}/messages`,{body:'Duel !',code})).status,201);
  assert.equal((await b(`friends/${aid}/messages`)).messages.at(-1).code,code);
  await b(`duels/${code}/join`,{});
  assert.equal((await a(`duels/${code}/rematch`,{})).status,409);
  await b(`duels/${code}/leave`,{});
  const first=await a(`duels/${code}/rematch`,{});assert.equal(first.duel.nextCode,null);assert.equal(first.duel.series.wins[aid],1);
  assert.equal((await c(`duels/${code}/rematch`,{})).status,403);
  const results=await Promise.all([b(`duels/${code}/rematch`,{}),a(`duels/${code}/rematch`,{}),b(`duels/${code}/rematch`,{})]);
  assert.equal(new Set(results.map(r=>r.duel.nextCode)).size,1);code=results[0].duel.nextCode;assert.ok(code);
  duel=(await b('duels/'+code)).duel;assert.equal(duel.series.round,2);assert.equal(duel.series.wins[aid],1);assert.equal(duel.me.score,0);assert.deepEqual(duel.me.board,duel.opponent.board);
  await a(`duels/${code}/leave`,{});await a(`duels/${code}/rematch`,{});const third=(await b(`duels/${code}/rematch`,{})).duel.nextCode;
  duel=(await a('duels/'+third)).duel;assert.equal(duel.series.round,3);assert.equal(duel.series.wins[aid],1);assert.equal(duel.series.wins[bid],1);
  // A timed draw is counted once, even with repeated reads and rematch requests.
  const row=await instance.db.one('SELECT state FROM duels WHERE code=?',[third]),state=JSON.parse(row.state);state.startsAt=Date.now()-10000;state.endsAt=Date.now()-1;await instance.db.run('UPDATE duels SET state=? WHERE code=?',[JSON.stringify(state),third]);
  for(let i=0;i<3;i++)assert.equal((await a('duels/'+third)).duel.series.draws,1);
  await stop();instance=await createApp();await start();assert.equal((await b('duels/'+third)).duel.series.draws,1);assert.equal((await b(`friends/${aid}/messages`)).messages.length,2);
  await b(`friends/${aid}/respond`,{accept:false});assert.equal((await a(`friends/${bid}/messages`)).status,403);
 }finally{await stop();delete process.env.DATA_DIR;fs.rmSync(dir,{recursive:true,force:true});}
});
