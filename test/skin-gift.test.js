const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{createApp}=require('../server');
test('AMZ permanently receives only Pokemon capsules, without spending coins or granting creator/King access',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-gift-'));process.env.DATA_DIR=dir;let app=await createApp(),server,base;
 async function start(){server=app.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;}await start();
 function client(){let cookie='';return async(url,data)=>{const response=await fetch(base+'/api/'+url,{method:data?'POST':'GET',headers:{cookie,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return{status:response.status,...await response.json()};};}
 const amz=client(),other=client();try{
  assert.equal((await amz('register',{username:'AMZ',password:'test-password-123'})).status,201);await other('register',{username:'AMZ2',password:'test-password-123'});
  const inventory=await amz('cosmetics');assert.deepEqual(inventory.owned,['original','capsules']);assert.equal(inventory.coins,0);assert.equal(inventory.selected,'original');assert.equal(inventory.allSkinsAccess,false);assert.equal(inventory.privateSkins,undefined);
  assert.equal((await amz('cosmetics/equip',{skin:'capsules'})).selected,'capsules');for(const skin of['king','israel','gold'])assert.equal((await amz('cosmetics/equip',{skin})).status,403);
  assert.equal((await other('cosmetics/equip',{skin:'capsules',username:'AMZ'})).status,403);assert.deepEqual((await other('cosmetics')).owned,['original']);
  const row=await app.db.one('SELECT state FROM cosmetics JOIN users ON users.id=cosmetics.user_id WHERE username_key=?',['amz']);assert.deepEqual(JSON.parse(row.state).owned,['original','capsules']);await amz('cosmetics');assert.deepEqual((await amz('cosmetics')).owned,['original','capsules']);
  await new Promise(r=>server.close(r));await app.close();app=await createApp();await start();await amz('login',{username:'amz',password:'test-password-123'});const restored=await amz('cosmetics');assert.equal(restored.selected,'capsules');assert.equal(restored.coins,0);assert.deepEqual(restored.owned,['original','capsules']);
 }finally{await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});}
});
