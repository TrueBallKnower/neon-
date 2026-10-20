const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const{createApp}=require('../server'),R=require('../public/skin-rules'),{clientAssets}=require('../client-assets');
test('private Israel edition is absent from public assets/chests and only authenticated creator can discover/equip/favorite/read art',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-private-'));process.env.DATA_DIR=dir;const instance=await createApp(),server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 function client(){let cookie='';return async(url,data)=>{const res=await fetch(base+url,{method:data?'POST':'GET',headers:{cookie,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];return{status:res.status,headers:res.headers,body:await res.text()};};}
 const owner=client(),other=client(),guest=client();try{
  for(const[name,c]of[['TrueBallKnower',owner],['TrueBallKnower2',other]])assert.equal((await c('/api/register',{username:name,password:'test-password-123'})).status,201);
  assert.ok(!R.allSkins.some(s=>s.id==='israel'));assert.ok(!R.catalog.some(s=>s.hidden));
  for(const asset of clientAssets().assets.values())assert.ok(!asset.body.toString().includes('Étoile d’azur'),'metadata excluded from public bundle');
  const inventory=JSON.parse((await owner('/api/cosmetics')).body);assert.ok(inventory.owned.includes('israel'));assert.equal(inventory.privateSkins[0].id,'israel');assert.equal(inventory.privateSkins[0].hidden,true);
  const ordinary=JSON.parse((await other('/api/cosmetics')).body);assert.ok(!ordinary.owned.includes('israel'));assert.ok(!('privateSkins'in ordinary));
  assert.equal((await other('/api/cosmetics/equip',{skin:'israel',username:'TrueBallKnower',allSkinsAccess:true})).status,403);
  assert.equal((await other('/api/cosmetics/favorite',{skin:'israel',favorite:true})).status,403);
  assert.equal((await guest('/api/cosmetics/private-art/israel.svg')).status,401);
  assert.equal((await other('/api/cosmetics/private-art/israel.svg')).status,404);
  const art=await owner('/api/cosmetics/private-art/israel.svg');assert.equal(art.status,200);assert.match(art.headers.get('cache-control'),/no-store/);assert.match(art.body,/<svg/);assert.equal((art.body.match(/<g transform=/g)||[]).length,11);
  assert.equal((await guest('/atelier-art/israel.svg')).status,404);assert.equal((await guest('/private-art/israel.svg')).status,404);
  assert.equal(JSON.parse((await owner('/api/cosmetics/equip',{skin:'israel'})).body).selected,'israel');
  assert.equal((await owner('/api/cosmetics/favorite',{skin:'israel',favorite:true})).status,200);
  assert.equal(JSON.parse((await owner('/api/cosmetics')).body).selected,'israel');
  await instance.db.run('UPDATE users SET username_key=? WHERE username=?',['revoked-owner','TrueBallKnower']);const revoked=JSON.parse((await owner('/api/cosmetics')).body);assert.equal(revoked.selected,'original');assert.ok(!revoked.owned.includes('israel'));assert.equal((await owner('/api/cosmetics/private-art/israel.svg')).status,404);
 }finally{await new Promise(r=>server.close(r));await instance.close();fs.rmSync(dir,{recursive:true,force:true});}
});
