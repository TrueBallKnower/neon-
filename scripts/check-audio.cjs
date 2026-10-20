// Optional browser audio regression check; no production services or audio hardware needed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
process.env.NODE_ENV='test';delete process.env.DATABASE_URL;process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-audio-'));
const {createApp}=require('../server');
(async()=>{
 const app=await createApp(),server=app.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const browser=await chromium.launch({executablePath:process.env.FUSION_BROWSER_PATH||undefined,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.FusionUI);await page.evaluate(()=>FusionLoadSkins());await page.waitForFunction(()=>window.FusionSkins);
  const result=await page.evaluate(async()=>{
   const wait=ms=>new Promise(r=>setTimeout(r,ms)),rows=[];
   soundOn=true;sfxVolume=.8;stopSfx();sfxCache.clear();sfxBytes=0;
   for(const skin of FusionSkinRules.catalog.filter(s=>s.atelier)){
    const sample=async()=>{
     audio=new OfflineAudioContext(1,44100,44100);voices=0;let oscillators=0,buffers=0;
     const osc=audio.createOscillator.bind(audio),buffer=audio.createBufferSource.bind(audio);
     audio.createOscillator=()=>{oscillators++;return osc();};audio.createBufferSource=()=>{buffers++;return buffer();};
     themedMerge(FusionSkinRules.feedback(skin.id,128,8),8);
     const samples=(await audio.startRendering()).getChannelData(0);return{samples,oscillators,buffers};
    };
    const direct=await sample(),key='theme:'+skin.id+':7:8:0.8';
    const until=performance.now()+4000;while(!sfxCache.has(key)&&performance.now()<until)await wait(25);
    if(!sfxCache.has(key))throw Error('Missing prepared phrase: '+skin.id);
    const cached=await sample();let difference=0,energy=0,peak=0;
    for(let i=0;i<direct.samples.length;i++){const x=cached.samples[i];difference=Math.max(difference,Math.abs(x-direct.samples[i]));energy+=x*x;peak=Math.max(peak,Math.abs(x));}
    rows.push({id:skin.id,directOscillators:direct.oscillators,cachedOscillators:cached.oscillators,cachedBuffers:cached.buffers,difference,peak,rms:Math.sqrt(energy/cached.samples.length)});
   }
   // Different combo levels and high tile values must not alias the phrase key.
   const profile=FusionSkinRules.feedback('king',2048,1),keys=[];
   for(const chain of [1,3,5,8,12,13,100]){audio=new OfflineAudioContext(1,44100,44100);voices=0;themedMerge({...profile,level:11},chain);keys.push([...sfxPending.keys()].at(-1));await audio.startRendering();}
   const silent=[];
   for(const [on,volume]of[[false,.8],[true,0]]){audio=new OfflineAudioContext(1,44100,44100);voices=0;soundOn=on;sfxVolume=volume;themedMerge(FusionSkinRules.feedback('king',128,8),8);silent.push((await audio.startRendering()).getChannelData(0).every(x=>x===0));}
   soundOn=true;sfxVolume=.8;audio=new AudioContext();await audio.resume();
   let resumes=0;const resume=audio.resume.bind(audio);audio.resume=()=>{resumes++;return resume();};
   let hidden=false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
   themedMerge(FusionSkinRules.feedback('king',128,8),8);const liveBefore=liveSfx.size;
   FusionUI.setSfxVolume(0);await wait(35);const afterZero=liveSfx.size;FusionUI.setSfxVolume(.6);
   themedMerge(FusionSkinRules.feedback('king',128,8),8);hidden=true;document.dispatchEvent(new Event('visibilitychange'));await wait(35);const afterHidden=liveSfx.size;
   hidden=false;document.dispatchEvent(new Event('visibilitychange'));await wait(35);const stateAfterReturn=audio.state;
   delete document.hidden;stopSfx();await audio.close();
   return{rows,keys,silent,cacheSize:sfxCache.size,cacheBytes:sfxBytes,pending:sfxPending.size,liveBefore,afterZero,afterHidden,resumes,stateAfterReturn};
  });
  assert.ok(result.rows.length>=63);
  for(const row of result.rows){assert.ok(row.directOscillators>=4&&row.directOscillators<=8,row.id);assert.equal(row.cachedOscillators,0,row.id);assert.equal(row.cachedBuffers,1,row.id);assert.ok(row.difference<.000002,JSON.stringify(row));assert.ok(row.rms>0&&row.peak<1,JSON.stringify(row));}
  assert.equal(new Set(result.rows.map(r=>r.rms.toFixed(7))).size,result.rows.length,'each skin keeps its sound signature');
  assert.equal(new Set(result.keys.slice(0,6)).size,6);assert.equal(result.keys[5],result.keys[6],'combo pitch saturates at original boost cap13');assert.ok(result.silent.every(Boolean));
  assert.ok(result.cacheSize<=48&&result.cacheBytes<=3*1024*1024);assert.ok(result.pending<=8);assert.ok(result.liveBefore>0);assert.equal(result.afterZero,0);assert.equal(result.afterHidden,0);assert.equal(result.resumes,0);assert.equal(result.stateAfterReturn,'suspended');
  console.log(JSON.stringify({skins:result.rows.length,maxSampleDifference:Math.max(...result.rows.map(r=>r.difference)),oscillatorsPerRepeat:0,bufferSourcesPerRepeat:1,cacheEntries:result.cacheSize,cacheBytes:result.cacheBytes,muteAndHiddenStop:true,noAutomaticResume:true}));
 }finally{await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
