const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {createApp}=require('../server');
const rules=require('../public/engine');

test('predicted moves match server batches and retries cannot double-apply scores',async()=>{
 process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-prediction-'));
 const instance=await createApp(),server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 function client(){let cookie='';return async(endpoint,body)=>{const res=await fetch(base+'/api/'+endpoint,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];return{status:res.status,data:await res.json()};};}
 const a=client(),b=client(),suffix=crypto.randomBytes(4).toString('hex');
 function predict(game,count){const before=structuredClone(game),directions=[];for(let i=0;i<count;i++){const direction=['left','up','right','down'].find(d=>rules.move(game.board,d).changed);if(!direction)break;const result=rules.move(game.board,direction),tile=before.spawnPlan.tiles[game.moves-before.spawnPlan.from];rules.spawnTicket(result.board,tile);game.board=result.board;game.moves++;game.score+=result.gain;directions.push(direction);}return{directions,baseMoves:before.moves,baseBoard:before.board};}
 try{
  for(const [i,request]of[a,b].entries())await request('register',{username:`Predict${i}_${suffix}`,password:'test-password-123'});
  const game=(await a('game',{})).data.game,request=predict(game,12);assert.equal(request.directions.length,12);
  const response=await a('move',request);assert.equal(response.status,200);assert.deepEqual(response.data.game.board,game.board);assert.equal(response.data.game.score,game.score);assert.equal(response.data.game.moves,game.moves);
  const duplicate=await a('move',request);assert.equal(duplicate.status,409);assert.equal(duplicate.data.game.moves,game.moves);assert.equal(duplicate.data.game.score,game.score);
  assert.equal((await a('move',{directions:Array(33).fill('left')})).status,400);
  const mismatch=await a('move',{directions:['left'],baseMoves:game.moves,baseBoard:Array(16).fill(0)});assert.equal(mismatch.status,409);
  const created=(await a('duels',{})).data.duel;await b(`duels/${created.code}/join`,{});
  const row=await instance.db.one('SELECT state FROM duels WHERE code=?',[created.code]),state=JSON.parse(row.state);state.startsAt=Date.now()-1000;state.endsAt=Date.now()+300000;await instance.db.run('UPDATE duels SET state=? WHERE code=?',[JSON.stringify(state),created.code]);
  const me=(await a(`duels/${created.code}`)).data.duel.me;const batch=predict(me,10);const result=await a(`duels/${created.code}/move`,batch);assert.equal(result.status,200);assert.deepEqual(result.data.game.board,me.board);assert.equal(result.data.game.score,me.score);assert.equal(result.data.game.moves,10);
  assert.equal((await a(`duels/${created.code}/move`,batch)).status,409);
 }finally{await new Promise(r=>server.close(r));await instance.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});delete process.env.DATA_DIR;}
});
