// Optional developer check. Provide Playwright and a Chromium browser; no production services are used.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const path=require('node:path'),os=require('node:os');
process.env.NODE_ENV='test';
delete process.env.DATABASE_URL;
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-iphone-profile-'));
const {createApp}=require('../server');
(async()=>{
 const app=await createApp(),server=app.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({executablePath:process.env.FUSION_BROWSER_PATH || undefined,args:['--no-sandbox']});
 try{
  const results=[];
  for(const renderer of ['dom','canvas']){
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3}),page=await context.newPage();
   await page.goto(base+'/?renderer='+renderer);await page.waitForFunction(()=>window.FusionUI);
   if(renderer==='dom')await page.request.post(base+'/api/register',{data:{username:'TrueBallKnower',password:'test-password-123'}});
   else await page.request.post(base+'/api/login',{data:{username:'TrueBallKnower',password:'test-password-123'}});
   await page.request.post(base+'/api/cosmetics/equip',{data:{skin:'king'}});
   await page.reload();await page.waitForFunction(()=>window.FusionSkins?.selected==='king');await page.waitForTimeout(500);
   const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const result=await page.evaluate(async()=>{
    soundOn=false;let seed=42;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
    const board=[2,2,4,4,8,8,16,16,32,32,64,64,128,128,0,0],setup=()=>FusionUI.load({board:[...board],score:0,moves:0});setup();
    await new Promise(r=>setTimeout(r,300));
    let layouts=0,timings=0,animations=0,allocations=0,styling=0,attributes=0;const durations=[],frames=[];
    const rect=Element.prototype.getBoundingClientRect,computed=window.getComputedStyle,timing=KeyframeEffect.prototype.getComputedTiming,animate=Element.prototype.animate,create=document.createElement.bind(document),setProperty=CSSStyleDeclaration.prototype.setProperty,setAttribute=Element.prototype.setAttribute;
    Element.prototype.getBoundingClientRect=function(...args){layouts++;return rect.apply(this,args);};window.getComputedStyle=function(...args){layouts++;return computed.apply(this,args);};
    KeyframeEffect.prototype.getComputedTiming=function(...args){timings++;return timing.apply(this,args);};Element.prototype.animate=function(...args){animations++;return animate.apply(this,args);};
    document.createElement=function(...args){allocations++;return create(...args);};CSSStyleDeclaration.prototype.setProperty=function(...args){styling++;return setProperty.apply(this,args);};Element.prototype.setAttribute=function(...args){attributes++;return setAttribute.apply(this,args);};
    let lastFrame,observing=true;const frame=at=>{if(lastFrame)frames.push(at-lastFrame);lastFrame=at;if(observing)requestAnimationFrame(frame);};requestAnimationFrame(frame);
    let executed=0;
    for(let i=0;i<80;i++){
     const state=FusionUI.state,choices=['left','up','right','down'].map(direction=>{const r=FusionRules.move(state.board,direction);return{direction,changed:r.changed,utility:r.board.filter(v=>!v).length*100+r.gain/10};}).filter(r=>r.changed).sort((a,b)=>b.utility-a.utility);
     if(!choices.length){setup();continue;}
     document.querySelector('#overlay').hidden=true;
     const start=performance.now();play(choices[0].direction);durations.push(performance.now()-start);executed++;
     await new Promise(r=>setTimeout(r,65));
    }
    observing=false;Element.prototype.getBoundingClientRect=rect;window.getComputedStyle=computed;KeyframeEffect.prototype.getComputedTiming=timing;Element.prototype.animate=animate;document.createElement=create;CSSStyleDeclaration.prototype.setProperty=setProperty;Element.prototype.setAttribute=setAttribute;
    const percentile=(xs,n)=>[...xs].sort((a,b)=>a-b)[Math.min(xs.length-1,Math.floor(xs.length*n))];
    return{renderer:document.body.dataset.renderer||'dom',executed,layouts,timings,animations,allocations,styling,attributes,inputMedianMs:percentile(durations,.5),inputP95Ms:percentile(durations,.95),frameMedianMs:percentile(frames,.5),frameP95Ms:percentile(frames,.95),framesOver34:frames.filter(f=>f>34).length,totalFrames:frames.length};
   });
   results.push(result);console.log(JSON.stringify(result));await context.close();
  }
  assert.equal(results[0].executed,results[1].executed,'identical move sequence count');
  assert.ok(results[1].timings<results[0].timings*.2,'canvas eliminates per-tile timeline polling');
  assert.ok(results[1].animations<results[0].animations*.5,'canvas eliminates moving tile WAAPI objects');
  assert.ok(results[1].styling<results[0].styling*.6,'canvas eliminates tile inline style churn');
 }finally{await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
