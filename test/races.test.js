const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {createApp}=require('../server');
const {get}=require('../public/modes');

test('every race target works in solo and duels without winning at lower tiles',async()=>{
 process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-races-'));const instance=await createApp(),server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 function client(){let cookie='';return async(endpoint,body)=>{const res=await fetch(base+'/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];assert.equal(res.ok,true,endpoint+': '+res.status);return res.json();};}
 const a=client(),b=client(),suffix=crypto.randomBytes(4).toString('hex');
 const board=value=>[value,value,...Array(14).fill(0)];
 try{
  const username='RacerA_'+suffix;await a('register',{username,password:'test-password-123'});await b('register',{username:'RacerB_'+suffix,password:'test-password-123'});const id=(await instance.db.one('SELECT id FROM users WHERE username=?',[username])).id;
  for(const target of [128,256,512,1024,2048]){
   const mode=target===128?'rush':'rush'+target;assert.equal(get(mode).target,target);
   await a('game',{mode});await instance.db.run('UPDATE games SET board=? WHERE user_id=?',[JSON.stringify(board(target/4)),id]);const lower=await a('move',{direction:'left'});assert.equal(lower.terminal,false);assert.equal(lower.game.meta.endedAt,null);
   await instance.db.run('UPDATE games SET board=? WHERE user_id=?',[JSON.stringify(board(target/2)),id]);const win=await a('move',{direction:'left'});assert.equal(win.game.meta.reason,'target');assert.equal(win.terminal,true);assert.equal(win.game.board[0],target);
   assert.ok((await a('leaderboard?mode='+mode)).entries.some(entry=>entry.username===username));
   const room=(await a('duels',{mode})).duel;const guest=(await b(`duels/${room.code}/join`,{})).duel;assert.equal(guest.mode,mode);
   async function setBoard(value){const state=JSON.parse((await instance.db.one('SELECT state FROM duels WHERE code=?',[room.code])).state);state.startsAt=Date.now()-100;state.endsAt=Date.now()+300000;state.players[0].board=board(value);await instance.db.run('UPDATE duels SET state=? WHERE code=?',[JSON.stringify(state),room.code]);}
   await setBoard(target/4);assert.equal((await a(`duels/${room.code}/move`,{direction:'left'})).duel.status,'playing');
   await setBoard(target/2);const final=(await a(`duels/${room.code}/move`,{direction:'left'})).duel;assert.equal(final.status,'finished');assert.equal(final.winner,id);assert.equal(final.reason,'target');
  }
 }finally{await new Promise(r=>server.close(r));await instance.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});delete process.env.DATA_DIR;}
});
