/* Cache public files only. Account, chat, duel and score APIs always use the network. */
const VERSION='fusion-shell-__SHELL_VERSION__',FILES=__SHELL_ASSETS__,MAX_ART=48;
const CORE=FILES.filter(path=>path==='/'||path.startsWith('/assets/'));
async function openShell(){try{return await caches.open(VERSION);}catch{return null;}}
async function cachedShell(){
 const cache=await openShell();if(!cache)return null;
 try{return(await Promise.all(CORE.map(path=>cache.match(path)))).every(Boolean)?await cache.match('/'):null;}catch{return null;}
}
async function cacheStatus(){return{type:'FUSION_CACHE_STATUS',version:VERSION,shellCached:!!await cachedShell(),explicitUpdates:true};}
function supportsUpdatePrompt(worker){
 return new Promise(resolve=>{
  const channel=new MessageChannel(),finish=value=>{clearTimeout(timeout);channel.port1.close();resolve(value);};
  const timeout=setTimeout(()=>finish(false),1200);
  channel.port1.onmessage=event=>finish(event.data?.explicitUpdates===true);
  try{worker.postMessage({type:'FUSION_UPDATE_CAPABILITIES'},[channel.port2]);}catch{finish(false);}
 });
}
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await openShell();let complete=!!cache;
 // Only the coherent HTML/CSS/game bundle is required. Optional icons and artwork
 // cache on demand: a missing icon must never prevent an otherwise usable update.
 await Promise.all(CORE.map(async path=>{
  const response=await fetch(path,{cache:'reload'});
  if(!response.ok)throw Error('Game shell unavailable');
  if(cache)try{await cache.put(path,response);}catch{complete=false;}
 }));
 if(!complete&&cache)try{await cache.delete('/');}catch{}
 // Upgrade older deployments which have no update UI once, without reloading
 // their live pages. Prompt-aware versions always wait for the player's action.
 if(self.registration.active&&!await supportsUpdatePrompt(self.registration.active))await self.skipWaiting();
})());});
self.addEventListener('message',event=>{
 if(event.data?.type==='FUSION_UPDATE_CAPABILITIES')event.ports[0]?.postMessage({explicitUpdates:true});
 if(event.data?.type==='FUSION_APPLY_UPDATE')event.waitUntil(self.skipWaiting());
 if(event.data?.type==='FUSION_CACHE_STATUS')event.waitUntil(cacheStatus().then(status=>event.ports[0]?.postMessage(status)));
});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 try{
  const keys=(await caches.keys()).filter(key=>key.startsWith('fusion-shell-')&&key!==VERSION);
  // Keep one previous shell for tabs still using its immutable bundle URLs.
  await Promise.all(keys.slice(0,-1).map(key=>caches.delete(key)));
 }catch{/* Safari can evict or deny Cache Storage; the network remains usable. */}
 await self.clients.claim();
 const status=await cacheStatus();
 for(const client of await self.clients.matchAll({type:'window'}))client.postMessage({...status,type:'FUSION_SHELL_READY'});
})());});
async function read(cache,request){try{return cache?await cache.match(request):null;}catch{return null;}}
async function publicFile(event,url){
 const request=event.request,cache=await openShell(),hit=await read(cache,request);if(hit)return hit;
 if(url.pathname.startsWith('/assets/')){
  // Immutable hashes identify exact content even while another tab runs an older version.
  try{for(const name of(await caches.keys()).filter(key=>key.startsWith('fusion-shell-')&&key!==VERSION)){const previous=await read(await caches.open(name),request);if(previous)return previous;}}catch{}
 }
 const response=await fetch(request);
 if(response.ok&&cache)event.waitUntil((async()=>{
  await cache.put(request,response.clone());
  if(/\/(atelier-art|skin-art)\//.test(url.pathname)){
   const art=(await cache.keys()).filter(key=>/\/(atelier-art|skin-art)\//.test(new URL(key.url).pathname));
   await Promise.all(art.slice(0,Math.max(0,art.length-MAX_ART)).map(key=>cache.delete(key)));
  }
 })().catch(()=>{}));
 return response;
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/healthz'||url.pathname==='/sw.js')return;
 if(request.mode==='navigate'){
  // Preserve the actual navigation URL (including duel invites) in the browser.
  event.respondWith((async()=>await cachedShell()||fetch(request))());return;
 }
 if(!/^\/(assets\/|atelier-art\/|skin-art\/|audio\/|icons\/|manifest\.webmanifest$)/.test(url.pathname))return;
 event.respondWith(publicFile(event,url));
});
