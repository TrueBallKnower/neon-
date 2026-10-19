/* Only public game files are cached. Account, chat and score APIs always use the network. */
const VERSION='fusion-shell-__SHELL_VERSION__',FILES=__SHELL_ASSETS__,MAX_ART=48;
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('fusion-shell-')&&k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/healthz'||url.pathname==='/sw.js')return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(VERSION),shell=await cache.match('/');return shell||fetch(request);})());return;
 }
 if(!/^\/(assets\/|atelier-art\/|skin-art\/|audio\/)/.test(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(VERSION),hit=await cache.match(request);if(hit)return hit;
  const response=await fetch(request);if(response.ok)event.waitUntil((async()=>{
   await cache.put(request,response.clone());
   if(/\/(atelier-art|skin-art)\//.test(url.pathname)){const art=(await cache.keys()).filter(r=>/\/(atelier-art|skin-art)\//.test(new URL(r.url).pathname));await Promise.all(art.slice(0,Math.max(0,art.length-MAX_ART)).map(key=>cache.delete(key)));}
  })().catch(()=>{}));return response;
 })());
});
