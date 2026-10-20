const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../public/sw.js'),'utf8');
function harness({version='one',stores=new Map(),denied=false,writeDenied=false,offline=false,active=null,unavailable=[]}={}){
 const listeners={},calls=[],origin='https://fusion.test',key=request=>new URL(typeof request==='string'?request:request.url,origin).href;
 const caches={async open(name){if(denied)throw Error('Storage denied');if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);return{async match(request){return entries.get(key(request))?.clone();},async put(request,response){if(writeDenied)throw Error('Quota exceeded');entries.set(key(request),response.clone());},async delete(request){return entries.delete(key(request));},async keys(){return[...entries.keys()].map(url=>({url}));}};},async keys(){if(denied)throw Error('Storage denied');return[...stores.keys()];},async delete(name){return stores.delete(name);}};
 let activations=0,claimed=0;const self={location:{origin},registration:{active},clients:{async claim(){claimed++;},async matchAll(){return[];}},addEventListener(type,handler){listeners[type]=handler;},async skipWaiting(){activations++;}};
 const fetch=async request=>{const path=new URL(typeof request==='string'?request:request.url,origin).pathname;calls.push(path);if(offline||unavailable.includes(path))throw Error('Network unavailable');if(path.startsWith('/icons/'))throw Error('Missing optional icon');return new Response(version+':'+path,{status:200});};
 const context={self,caches,fetch,URL,MessageChannel,setTimeout,clearTimeout};vm.runInNewContext(source.replace('__SHELL_VERSION__',version).replace('__SHELL_ASSETS__',JSON.stringify(['/','/assets/play.'+version+'.js','/assets/app.'+version+'.css','/icons/optional.png','/manifest.webmanifest'])),context);
 async function dispatch(type,fields={}){const tasks=[];let response;listeners[type]({...fields,waitUntil(promise){tasks.push(promise);},respondWith(promise){response=promise;}});const result=await response;await Promise.all(tasks);return result;}
 return{dispatch,stores,calls,get activations(){return activations;},get claimed(){return claimed;},async navigate(path='/'){return dispatch('fetch',{request:{method:'GET',url:origin+path,mode:'navigate'}});},async status(){const channel=new MessageChannel(),result=new Promise(resolve=>{channel.port1.onmessage=event=>{channel.port1.close();resolve(event.data);};});await dispatch('message',{data:{type:'FUSION_CACHE_STATUS'},ports:[channel.port2]});return result;}};
}
test('offline shell is coherent without optional icon requests, and keeps invite URLs intact',async()=>{
 const w=harness();await w.dispatch('install');assert.deepEqual(w.calls,['/','/assets/play.one.js','/assets/app.one.css']);assert.equal((await w.status()).shellCached,true);assert.equal(w.activations,0);
 const offline=harness({stores:w.stores,offline:true});const page=await offline.navigate('/?duel=A123456789');assert.equal(await page.text(),'one:/');assert.equal(offline.calls.length,0);
 const asset=await offline.dispatch('fetch',{request:{method:'GET',url:'https://fusion.test/assets/play.one.js'}});assert.equal(await asset.text(),'one:/assets/play.one.js');
 for(const [path,method]of[['/api/me','GET'],['/api/duels/ABC','GET'],['/api/move','POST'],['/healthz','GET']])assert.equal(await offline.dispatch('fetch',{request:{method,url:'https://fusion.test'+path}}),undefined);
 assert.ok(![...w.stores.values()].some(cache=>[...cache.keys()].some(url=>url.includes('/api/'))));
});
test('denied cache storage and quota failures preserve network play and truthful readiness',async()=>{
 for(const options of[{denied:true},{writeDenied:true}]){
  const w=harness(options);await w.dispatch('install');assert.equal((await w.status()).shellCached,false);assert.equal(await(await w.navigate()).text(),'one:/');
  const asset=await w.dispatch('fetch',{request:{method:'GET',url:'https://fusion.test/assets/play.one.js'}});assert.equal(await asset.text(),'one:/assets/play.one.js');
 }
});
test('updates wait for explicit activation and retain one previous immutable shell',async()=>{
 const old=harness();await old.dispatch('install');
 const active={postMessage(data,ports){assert.equal(data.type,'FUSION_UPDATE_CAPABILITIES');ports[0].postMessage({explicitUpdates:true});ports[0].close();}};
 const next=harness({version:'two',stores:old.stores,active});await next.dispatch('install');assert.equal(next.activations,0);
 await next.dispatch('message',{data:{type:'FUSION_APPLY_UPDATE'}});assert.equal(next.activations,1);await next.dispatch('activate');assert.equal(next.claimed,1);
 assert.equal(await(await next.navigate()).text(),'two:/');const calls=next.calls.length;
 const prior=await next.dispatch('fetch',{request:{method:'GET',url:'https://fusion.test/assets/play.one.js'}});assert.equal(await prior.text(),'one:/assets/play.one.js');assert.equal(next.calls.length,calls);
 const third=harness({version:'three',stores:next.stores,active});await third.dispatch('install');await third.dispatch('activate');assert.deepEqual([...third.stores.keys()],['fusion-shell-two','fusion-shell-three']);
});
test('legacy cached clients can migrate to the update-aware shell without a page reload',async()=>{
 const w=harness({active:{postMessage(){}}});await w.dispatch('install');assert.equal(w.activations,1);assert.equal((await w.status()).explicitUpdates,true);
});

test('an incomplete update cannot replace the playable shell with mismatched files',async()=>{
 const old=harness();await old.dispatch('install');
 const next=harness({version:'two',stores:old.stores,unavailable:['/assets/app.two.css']});
 await assert.rejects(next.dispatch('install'),/Network unavailable/);
 assert.equal(next.activations,0);assert.equal((await next.status()).shellCached,false);
 const offline=harness({stores:old.stores,offline:true});assert.equal(await(await offline.navigate()).text(),'one:/');
 assert.equal(await(await next.navigate()).text(),'two:/','incomplete shell falls back to a fresh network document');
});
