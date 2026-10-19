// Build immutable, compressed client responses once, using Node's built-in tools.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.join(__dirname,'public');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex').slice(0,16);
function clientAssets(){
 const assets=new Map(),artKeys=[];
 function asset(name,content,type,immutable=true){const body=Buffer.from(content),etag='"'+hash(body)+'"';assets.set(name,{body,type,etag,immutable,gzip:zlib.gzipSync(body),br:zlib.brotliCompressSync(body,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:4}})});return name;}
 const skins=['skin-expansion.js','atelier-catalog.js','skin-rules.js','skins.js'].map(read).join('\n;\n');
 const skinPath=asset('/assets/skins.'+hash(skins)+'.js',skins,'application/javascript; charset=utf-8');
 const bootstrap=read('boot.js').replaceAll('__SKINS_ASSET__',skinPath);
 const play=['mobile.js','engine.js','modes.js','canvas-motion.js','canvas-renderer.js','client.js','move-sync.js','royal.js','online.js','social.js','story-rules.js','story.js','install.js'].map(read).join('\n;\n')+'\n;\n'+bootstrap;
 const playPath=asset('/assets/play.'+hash(play)+'.js',play,'application/javascript; charset=utf-8');
 const css=read('style.css')+'\n'+read('atelier.css')+'\n'+read('install.css');
 const cssPath=asset('/assets/app.'+hash(css)+'.css',css,'text/css; charset=utf-8');
 const html=read('index.html').replace(/<link rel="stylesheet"[^>]*>/g,'').replace(/<script src="[^\"]+"><\/script>/g,'').replace('</head>',`<link rel="stylesheet" href="${cssPath}"><script defer src="${playPath}"></script></head>`);
 asset('/',html,'text/html; charset=utf-8',false);
 const installFiles=['/manifest.webmanifest','/icons/fusion-180.png','/icons/fusion-192.png','/icons/fusion-512.png','/icons/fusion-maskable-512.png'];
 const version=hash(play+skins+css+html+read('manifest.webmanifest')+read('sw.js')+(process.env.RENDER_GIT_COMMIT||'')),worker=read('sw.js').replaceAll('__SHELL_VERSION__',version).replace('__SHELL_ASSETS__',JSON.stringify(['/',playPath,cssPath,...installFiles]));
 asset('/sw.js',worker,'application/javascript; charset=utf-8',false);
 function middleware(req,res,next){
  if(!['GET','HEAD'].includes(req.method))return next();
  const key=req.path==='/index.html'?'/':req.path;
  if(!assets.has(key)&&/^\/(atelier-art|skin-art)\/[a-z0-9-]+\.svg$/.test(key)){
   try{asset(key,fs.readFileSync(path.join(root,key.slice(1))),'image/svg+xml',false);artKeys.push(key);if(artKeys.length>48)assets.delete(artKeys.shift());}catch(error){if(error.code!=='ENOENT')return next(error);}
  }
  const item=assets.get(key);if(!item){
   const stale=/^\/assets\/(play|skins|app)\.[a-f0-9]{16}\.(js|css)$/.exec(key);
   if(stale){res.set('Cache-Control','no-cache');return res.redirect(302,{play:playPath,skins:skinPath,app:cssPath}[stale[1]]);}
   return next();
  }
  res.set({'Content-Type':item.type,'ETag':item.etag,'Vary':'Accept-Encoding','Cache-Control':item.immutable?'public, max-age=31536000, immutable':'no-cache'});
  if(req.path==='/sw.js')res.set('Service-Worker-Allowed','/');
  if(req.headers['if-none-match']===item.etag)return res.status(304).end();
  const encoding=req.acceptsEncodings('br','gzip','identity');if(!encoding)return res.sendStatus(406);
  const body=encoding==='br'?item.br:encoding==='gzip'?item.gzip:item.body;if(encoding!=='identity')res.set('Content-Encoding',encoding);
  res.set('Content-Length',String(body.length));res.end(req.method==='HEAD'?undefined:body);
 }
 return{middleware,assets,playPath,skinPath,cssPath};
}
module.exports={clientAssets};
