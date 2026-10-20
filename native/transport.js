// Native networking only. Browser requests keep their existing origin/cookie rules.
function createNativeFetch({request,fallback,apiOrigin,localOrigin,makeUrl=blob=>URL.createObjectURL(blob),revokeUrl=url=>URL.revokeObjectURL(url)}){
 const origin=new URL(apiOrigin),local=new URL(localOrigin);if(origin.protocol!=='https:'||origin.username||origin.password)throw Error('Native API requires HTTPS.');
 const art=new Map();let epoch=0;
 function clearArt(){epoch++;for(const url of art.values())revokeUrl(url);art.clear();}
 function guarded(promise,signal){
  if(!signal)return promise;if(signal.aborted)return Promise.reject(new DOMException('Aborted','AbortError'));
  return new Promise((resolve,reject)=>{const abort=()=>reject(new DOMException('Aborted','AbortError'));signal.addEventListener('abort',abort,{once:true});promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));});
 }
 async function call(url,method,headers,data,signal){
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');
  return guarded(request({url:origin.origin+url.pathname+url.search,method,headers,data,responseType:'text',connectTimeout:12000,readTimeout:12000,disableRedirects:true}),signal);
 }
 async function privateArt(data,signal){
  for(const container of[data,data?.inventory,data?.wallet])for(const skin of container?.privateSkins||[]){
   if(!/^\/api\/cosmetics\/private-art\/[a-z0-9-]+\.svg$/.test(skin.artUrl))continue;
   const path=skin.artUrl,session=epoch;
   if(!art.has(path)){
    const response=await call(new URL(path,origin), 'GET',{},undefined,signal);
    if(response.status!==200||session!==epoch)throw Error('Dessin privé indisponible.');
    art.set(path,makeUrl(new Blob([response.data],{type:'image/svg+xml'})));
   }
   skin.artUrl=art.get(path);
  }
  return data;
 }
 const nativeFetch=async(input,init={})=>{
  const source=input instanceof Request?input.url:String(input),url=new URL(source,localOrigin);
  if(!((url.protocol===local.protocol&&url.host===local.host)||url.origin===origin.origin)||!url.pathname.startsWith('/api/'))return fallback(input,init);
  const req=input instanceof Request?input:null,signal=init.signal||req?.signal;
  const method=(init.method||req?.method||'GET').toUpperCase(),headers=Object.fromEntries(new Headers(init.headers||req?.headers)),raw=init.body??(req&&!['GET','HEAD'].includes(method)?await req.text():undefined);
  // Cookies remain in iOS's native HTTP cookie jar, never in JS or localStorage.
  for(const key of Object.keys(headers))if(['cookie','authorization','origin','sec-fetch-site'].includes(key.toLowerCase()))delete headers[key];
  const type=headers['content-type']||'',data=raw===undefined?undefined:type.includes('application/json')&&typeof raw==='string'?JSON.parse(raw):raw;
  const result=await call(url,method,headers,data,signal);
  if(url.pathname==='/api/logout'||result.status===401)clearArt();
  const responseHeaders=new Headers();for(const[key,value]of Object.entries(result.headers||{}))if(!['set-cookie','set-cookie2','content-length','content-encoding','transfer-encoding'].includes(key.toLowerCase()))responseHeaders.set(key,String(value));
  let body=result.data;if(result.status>=200&&result.status<300&&responseHeaders.get('content-type')?.includes('application/json')){
   const parsed=typeof body==='string'?JSON.parse(body):body;body=JSON.stringify(await privateArt(parsed,signal));
  }else if(typeof body!=='string')body=JSON.stringify(body);
  return new Response([204,205,304].includes(result.status)?null:body,{status:result.status,headers:responseHeaders});
 };
 return{fetch:nativeFetch,clearArt};
}
module.exports={createNativeFetch};
