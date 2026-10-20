const fs=require('node:fs'),path=require('node:path'),{build}=require('esbuild'),{clientAssets}=require('../client-assets');
const root=path.join(__dirname,'..'),out=path.join(root,'native','www'),config=require('../capacitor.config.json'),settings=require('../native/settings.json');
async function buildNative(){
 const publicUrl=new URL(settings.publicUrl);if(publicUrl.protocol!=='https:'||publicUrl.username||publicUrl.password||publicUrl.pathname!=='/'||publicUrl.search||publicUrl.hash)throw Error('Set one HTTPS server origin in native/settings.json.');
 if(config.webDir!=='native/www'||config.server?.url||config.server?.cleartext||config.server?.allowNavigation)throw Error('Native files must stay local; no remote webview or navigation allowlist.');
 fs.mkdirSync(out,{recursive:true});
 const app=clientAssets();
 // Do not copy a worker: native releases use local, signed files, never the PWA cache.
 const nativeHtml=app.assets.get('/').body.toString().replace('</head>','<script defer src="/native-runtime.js"></script></head>').replace('<script defer src="'+app.playPath+'"></script>','');
 const html=nativeHtml.replace('</head>','<script defer src="'+app.playPath+'"></script></head>');
 fs.writeFileSync(path.join(out,'index.html'),html);
 for(const [name,item]of app.assets){if(name==='/'||name==='/sw.js')continue;const file=path.join(out,name.slice(1));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,item.body);}
 for(const folder of['atelier-art','skin-art','audio','icons'])fs.cpSync(path.join(root,'public',folder),path.join(out,folder),{recursive:true});
 for(const folder of['atelier-art','skin-art'])for(const name of fs.readdirSync(path.join(out,folder))){if(!name.endsWith('.svg'))continue;const file=path.join(out,folder,name);fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/<svg\b([^>]*)>/,(_,attrs)=>'<svg'+attrs.replace(/\spreserveAspectRatio="[^"]*"/g,'')+' preserveAspectRatio="none">'));}
 fs.copyFileSync(path.join(root,'public','manifest.webmanifest'),path.join(out,'manifest.webmanifest'));
 await build({entryPoints:[path.join(root,'native','runtime.js')],bundle:true,format:'iife',platform:'browser',target:'safari15',outfile:path.join(out,'native-runtime.js'),minify:true,define:{FUSION_PUBLIC_URL:JSON.stringify(publicUrl.href),FUSION_APP_VERSION:JSON.stringify(require('../package.json').version)}});
 // Discard only stale generated bundles, after the new complete shell is written.
 const keep=new Set([...app.assets.keys()].filter(n=>n.startsWith('/assets/')).map(n=>path.basename(n)));
 for(const name of fs.readdirSync(path.join(out,'assets')))if(!keep.has(name))fs.unlinkSync(path.join(out,'assets',name));
 console.log('Native local game prepared in native/www; API: '+publicUrl.origin);
 return{out,app};
}
if(require.main===module)buildNative().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={buildNative};
