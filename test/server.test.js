const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createApp}=require('../server');
const {move,canMove}=require('../public/engine');

test('2048 merge rules, directional moves and game over',()=>{
 const b=row=>[...row,...Array(12).fill(0)];
 assert.deepEqual(move(b([2,2,2,2]),'left').board.slice(0,4),[4,4,0,0]);
 assert.equal(move(b([2,2,2,2]),'left').gain,8);
 assert.deepEqual(move(b([2,2,4,0]),'left').board.slice(0,4),[4,4,0,0]);
 assert.deepEqual(move(b([2,0,2,4]),'right').board.slice(0,4),[0,0,4,4]);
 const v=[2,0,0,0,2,0,0,0,4,0,0,0,4,0,0,0];
 assert.equal(move(v,'up').board[4],8);assert.equal(move(v,'down').board[12],8);
 assert.equal(canMove([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false);
});

test('accounts, authoritative scores, concurrent moves, persistence and security',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-test-'));
 const previous=process.env.DATA_DIR;process.env.DATA_DIR=dir;
 let instance,server;
 async function boot(){instance=await createApp();server=instance.app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));return 'http://127.0.0.1:'+server.address().port;}
 async function stop(){await new Promise(resolve=>server.close(resolve));await instance.close();}
 let base=await boot(),cookie='';
 async function req(endpoint,body,authenticated=true){const r=await fetch(base+'/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(authenticated&&cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});const header=r.headers.get('set-cookie');if(header)cookie=header.split(';')[0];return{status:r.status,data:await r.json(),cookie:header};}
 const username='Test_'+Date.now();
 try{
  assert.equal((await req('game',{},false)).status,401);
  const registered=await req('register',{username,password:'test-password-123'});assert.equal(registered.status,201);assert.match(registered.cookie,/HttpOnly/i);assert.match(registered.cookie,/SameSite=Lax/i);
  assert.equal((await req('register',{username:username.toLowerCase(),password:'test-password-123'})).status,409);
  assert.equal((await req('me')).data.user.username,username);
  const stored=await instance.db.one('SELECT * FROM users WHERE username_key=?',[username.toLowerCase()]);assert.notEqual(stored.hash,'test-password-123');assert.equal(stored.hash.length,128);
  assert.equal((await req('game',{})).data.game.board.filter(Boolean).length,2);
  await instance.db.run('UPDATE games SET board=? WHERE user_id=?',[JSON.stringify([2,2,0,0,...Array(12).fill(0)]),stored.id]);
  const r=await req('move',{direction:'left',score:999999});assert.equal(r.data.game.score,4);assert.equal(r.data.best,4);assert.equal(r.data.game.board[0],4);
  const results=await Promise.all(['down','right','up','left'].map(direction=>req('move',{direction})));assert.ok(results.every(r=>r.status===200));
  const game=(await req('game')).data.game;assert.equal(game.moves,1+results.filter(r=>r.data.result.changed).length);
  assert.ok((await req('leaderboard')).data.entries.some(e=>e.username===username&&e.best===game.score));
  await stop();base=await boot();assert.deepEqual((await req('game')).data.game,game);
  await req('logout',{});assert.equal((await req('me')).data.user,null);
  assert.equal((await req('login',{username,password:'wrong'})).status,401);
  assert.equal((await req('login',{username,password:'test-password-123'})).status,200);
  assert.deepEqual((await req('game')).data.game,game);
  const cross=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://evil.example',cookie},body:'{}'});assert.equal(cross.status,403);
  const health=await fetch(base+'/healthz');assert.equal(health.status,200);
 }finally{await stop();if(previous===undefined)delete process.env.DATA_DIR;else process.env.DATA_DIR=previous;fs.rmSync(dir,{recursive:true,force:true});}
});
