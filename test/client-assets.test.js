const {test}=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib'),vm=require('node:vm');
const built=require('../client-assets').clientAssets();
test('first-load shell requests one deferred game bundle, excluding the cosmetic catalog',()=>{
 const html=built.assets.get('/').body.toString(),core=built.assets.get(built.playPath),skins=built.assets.get(built.skinPath);
 assert.equal((html.match(/<script /g)||[]).length,1);assert.match(html,/<script defer src="\/assets\/play\.[a-f0-9]+\.js">/);assert.equal((html.match(/rel="stylesheet"/g)||[]).length,1);
 assert.ok(core.br.length<36000,'compressed gameplay stays below36KB despite update UI/audio cache; cosmetics remain deferred');assert.ok(!core.body.includes(Buffer.from('nebula-supernova')));assert.ok(skins.body.includes(Buffer.from('nebula-supernova')));
 for(const [name,item]of built.assets){assert.deepEqual(zlib.brotliDecompressSync(item.br),item.body);assert.deepEqual(zlib.gunzipSync(item.gzip),item.body);if(name.endsWith('.js'))new vm.Script(item.body.toString());}
});
test('only hashed assets receive immutable caching; service worker excludes private APIs',()=>{
 assert.equal(built.assets.get('/').immutable,false);assert.equal(built.assets.get('/sw.js').immutable,false);
 for(const path of [built.playPath,built.skinPath,built.cssPath]){assert.match(path,/\.[a-f0-9]{16}\./);assert.equal(built.assets.get(path).immutable,true);}
 const worker=built.assets.get('/sw.js').body.toString();assert.ok(worker.includes("url.pathname.startsWith('/api/')"));assert.ok(worker.includes("request.method!=='GET'"));assert.ok(!worker.includes('__SHELL_VERSION__'));assert.ok(!worker.includes('__SHELL_ASSETS__'));
});
test('HTTP responses negotiate compression, support revalidation and compress unversioned artwork safely',async()=>{
 const express=require('express'),http=require('node:http'),app=express();app.use(built.middleware);const server=app.listen(0);await new Promise(resolve=>server.once('listening',resolve));
 const get=(path,headers={},method='GET')=>new Promise((resolve,reject)=>{const request=http.request({host:'127.0.0.1',port:server.address().port,path,headers,method},response=>{const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks)}));});request.on('error',reject);request.end();});
 try{
  const html=await get('/',{'Accept-Encoding':'gzip'});assert.equal(html.headers['content-encoding'],'gzip');assert.match(zlib.gunzipSync(html.body).toString(),/<script defer/);assert.equal(html.headers['cache-control'],'no-cache');
  const play=await get(built.playPath,{'Accept-Encoding':'br'});assert.equal(play.headers['content-encoding'],'br');assert.deepEqual(zlib.brotliDecompressSync(play.body),built.assets.get(built.playPath).body);assert.match(play.headers['cache-control'],/immutable/);
  const cached=await get(built.playPath,{'If-None-Match':play.headers.etag});assert.equal(cached.status,304);assert.equal(cached.body.length,0);
  const art=await get('/atelier-art/king.svg',{'Accept-Encoding':'br'});assert.equal(art.status,200);assert.match(zlib.brotliDecompressSync(art.body).toString(),/<svg/);assert.ok(art.body.length<15000);assert.equal(art.headers['cache-control'],'no-cache');
  const head=await get(built.playPath,{'Accept-Encoding':'br'},'HEAD');assert.equal(head.body.length,0);assert.equal(Number(head.headers['content-length']),play.body.length);
  const stale=await get('/assets/skins.0000000000000000.js');assert.equal(stale.status,302);assert.equal(stale.headers.location,built.skinPath);
  const worker=await get('/sw.js');assert.equal(worker.headers['service-worker-allowed'],'/');assert.equal(worker.headers['cache-control'],'no-cache');
 }finally{await new Promise(resolve=>server.close(resolve));}
});
