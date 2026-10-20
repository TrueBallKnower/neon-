const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const{createNativeFetch}=require('../native/transport'),{buildNative}=require('../scripts/build-native.cjs');
const options={apiOrigin:'https://neon-teyk.onrender.com/',localOrigin:'capacitor://localhost/index.html'};
test('native HTTP routes only game APIs, keeps JSON/abort semantics, hides cookies and leaves local game files local',async()=>{
 const calls=[],fallbacks=[],bridge=createNativeFetch({...options,request:async value=>{calls.push(value);return{status:200,data:'{"ok":true}',headers:{'content-type':'application/json','Set-Cookie':'fusion_session=private; HttpOnly; Secure'}};},fallback:(...args)=>{fallbacks.push(args);return Promise.resolve(new Response('local'));}});
 const response=await bridge.fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:'capacitor://localhost',Cookie:'fake'},body:JSON.stringify({username:'SomePlayer',password:'test-password-123'})});
 assert.equal((await response.json()).ok,true);assert.equal(response.headers.get('set-cookie'),null);assert.equal(calls[0].url,'https://neon-teyk.onrender.com/api/login');assert.deepEqual(calls[0].data,{username:'SomePlayer',password:'test-password-123'});assert.equal(calls[0].headers.origin,undefined);assert.equal(calls[0].headers.cookie,undefined);assert.equal(calls[0].disableRedirects,true);
 for(const url of['/assets/play.js','/audio/king-victory.mp3','blob:capacitor://localhost/skin','https://other.example/api/me'])assert.equal(await(await bridge.fetch(url)).text(),'local');assert.equal(fallbacks.length,4);
 const controller=new AbortController();controller.abort();await assert.rejects(bridge.fetch('/api/move',{signal:controller.signal}),{name:'AbortError'});assert.equal(calls.length,1,'already cancelled request is never sent');
 let complete;const slow=createNativeFetch({...options,request:()=>new Promise(r=>complete=r),fallback:()=>{}}),pending=new AbortController(),operation=slow.fetch('/api/me',{signal:pending.signal});pending.abort();await assert.rejects(operation,{name:'AbortError'});complete({status:200,data:'{}',headers:{}});
 assert.throws(()=>createNativeFetch({...options,apiOrigin:'http://unsafe.example',request:()=>{}}),/HTTPS/);
});
test('private native artwork stays authenticated/in memory and is revoked on logout or rejected session',async()=>{
 const calls=[],revoked=[];let session=true;
 const bridge=createNativeFetch({...options,makeUrl:()=> 'blob:capacitor://localhost/private-1',revokeUrl:url=>revoked.push(url),fallback:()=>{},request:async value=>{calls.push(value.url);if(value.url.endsWith('/logout'))return{status:200,data:'{}',headers:{}};if(!session)return{status:401,data:'{}',headers:{}};if(value.url.endsWith('.svg'))return{status:200,data:'<svg/>',headers:{'content-type':'image/svg+xml'}};return{status:200,data:JSON.stringify({privateSkins:[{id:'israel',artUrl:'/api/cosmetics/private-art/israel.svg'}]}),headers:{'content-type':'application/json'}};}});
 assert.equal((await(await bridge.fetch('/api/cosmetics')).json()).privateSkins[0].artUrl,'blob:capacitor://localhost/private-1');await bridge.fetch('/api/cosmetics');assert.equal(calls.filter(url=>url.endsWith('.svg')).length,1);
 await bridge.fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(revoked.length,1);await bridge.fetch('/api/cosmetics');session=false;assert.equal((await bridge.fetch('/api/me')).status,401);assert.equal(revoked.length,2);
});
test('native package includes all playable files, excludes private assets/service worker, and leaves browser shell native-free',async()=>{
 const{out,app}=await buildNative(),html=fs.readFileSync(path.join(out,'index.html'),'utf8'),browser=app.assets.get('/').body.toString();
 assert.ok(!browser.includes('native-runtime.js'));assert.ok(html.includes('native-runtime.js'));assert.ok(html.indexOf('native-runtime.js')<html.indexOf(app.playPath));assert.ok(!fs.existsSync(path.join(out,'sw.js')));assert.ok(!fs.existsSync(path.join(out,'private-art')));assert.ok(!fs.existsSync(path.join(out,'private-cosmetics.js')));
 for(const name of[app.playPath,app.skinPath,app.cssPath,'/audio/king-victory.mp3','/atelier-art/king.svg','/skin-art/dragon.svg'])assert.ok(fs.statSync(path.join(out,name.slice(1))).size>0,name);
 assert.match(fs.readFileSync(path.join(out,'atelier-art/king.svg'),'utf8'),/preserveAspectRatio="none"/);
 const config=require('../capacitor.config.json');assert.equal(config.server.url,undefined);assert.equal(config.server.allowNavigation,undefined);assert.equal(config.server.cleartext,undefined);assert.equal(config.plugins.CapacitorHttp.enabled,false);assert.equal(config.webDir,'native/www');
});
test('native request contract supports existing server accounts, private skin access and session logout without changing browser CSRF',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-native-api-'));process.env.DATA_DIR=dir;const{createApp}=require('../server'),app=await createApp(),server=app.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let cookie='';const base='http://127.0.0.1:'+server.address().port;
 // Emulate only the native cookie jar; actual NSURLSession behavior still needs Xcode/iPhone validation.
 const bridge=createNativeFetch({...options,request:async value=>{const url=new URL(value.url),response=await fetch(base+url.pathname+url.search,{method:value.method,headers:{...value.headers,...(cookie?{cookie}:{})},body:value.data===undefined?undefined:JSON.stringify(value.data)});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return{status:response.status,data:await response.text(),headers:Object.fromEntries(response.headers)};},fallback:()=>{}});
 try{const post=(url,data)=>bridge.fetch('/api/'+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post('register',{username:'TrueBallKnower',password:'test-password-123'})).status,201);const inventory=await(await bridge.fetch('/api/cosmetics')).json();assert.ok(inventory.owned.includes('israel'));assert.ok(inventory.privateSkins[0].artUrl.startsWith('blob:'));
 assert.equal((await post('cosmetics/equip',{skin:'israel'})).status,200);assert.equal((await post('game',{mode:'classic'})).status,200);assert.equal((await post('logout',{})).status,200);assert.equal((await bridge.fetch('/api/cosmetics')).status,401);
 const cross=await fetch(base+'/api/login',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'});assert.equal(cross.status,403);
 }finally{bridge.clearArt();await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});}
});
