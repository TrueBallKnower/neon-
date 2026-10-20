// Optional Playwright regression check for square cells, sprite panels and zoomed motion.
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
process.env.NODE_ENV='test';delete process.env.DATABASE_URL;process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-grid-'));
const{createApp}=require('../server');
(async()=>{const app=await createApp(),server=app.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const browser=await chromium.launch({executablePath:process.env.FUSION_BROWSER_PATH||undefined,args:['--no-sandbox']});try{
 const errors=[];let checks=0;
 for(const renderer of ['dom','canvas']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:renderer==='canvas',deviceScaleFactor:2,serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?renderer='+renderer);await page.waitForFunction(()=>window.FusionUI);
  for(const [width,height]of[[1440,1000],[1100,900],[390,844],[320,568],[844,390]])for(const zoom of[1,.85]){
   await page.setViewportSize({width,height});await page.evaluate(zoom=>{document.body.style.zoom=zoom;FusionUI.load({board:Array.from({length:16},(_,i)=>2**(i%11+1)),score:0,moves:0});},zoom);await page.waitForTimeout(100);
   const geometry=await page.evaluate(()=>{
    const box=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}},host=document.querySelector('#board'),cells=[...document.querySelectorAll('#cells .cell')].map(box),b=box(host),render=FusionUI.renderState(),canvas=document.querySelector('#board-canvas');
    const tiles=canvas?render.tiles.map(t=>{const c=box(canvas),scale=c.w/render.width,pad=parseFloat(getComputedStyle(host).paddingLeft);return{index:t.index,x:c.x+(pad+t.x)*scale,y:c.y+(pad+t.y)*scale};}):[...document.querySelectorAll('#tiles .tile')].map(n=>({index:Number(n.dataset.index),...box(n),face:box(n.firstElementChild)}));
    return{b,cells,tiles};
   });
   assert.ok(Math.abs(geometry.b.w-geometry.b.h)<.6,JSON.stringify({renderer,width,zoom,board:geometry.b}));
   for(const cell of geometry.cells)assert.ok(Math.abs(cell.w-cell.h)<.6,'background cell must be square');
   for(const tile of geometry.tiles){const cell=geometry.cells[tile.index];assert.ok(Math.abs(tile.x-cell.x)<.65&&Math.abs(tile.y-cell.y)<.65,JSON.stringify({renderer,width,zoom,tile,cell}));if(tile.face){assert.ok(Math.abs(tile.w-cell.w)<.65&&Math.abs(tile.h-cell.h)<.65,'tile matches background size');assert.ok(Math.abs(tile.face.w-tile.face.h)<.65,'sprite viewport square');}}
   // Movement endpoints are in layout coordinates, not getBoundingClientRect zoom coordinates.
   const endpointErrors=await page.evaluate(()=>{
    FusionUI.load({board:[2,0,0,0,4,0,0,0,8,0,0,0,16,0,0,0],score:0,moves:0});play('right');
    if(document.body.dataset.renderer==='canvas')return[];
    const cells=[...document.querySelectorAll('#cells .cell')],base=cells[0].getBoundingClientRect(),scale=base.width/parseFloat(getComputedStyle(cells[0]).width),errors=[];
    for(const tile of document.querySelectorAll('#tiles .tile:not(.tile-ghost)'))for(const animation of tile.getAnimations()){const keys=animation.effect.getKeyframes(),last=keys.at(-1);if(!last.transform)continue;const matrix=new DOMMatrix(last.transform),cell=cells[Number(tile.dataset.index)].getBoundingClientRect();errors.push(Math.abs(matrix.m41-(cell.x-base.x)/scale),Math.abs(matrix.m42-(cell.y-base.y)/scale));}return errors;
   });assert.ok(endpointErrors.every(e=>e<.65),JSON.stringify({renderer,width,zoom,endpointErrors}));checks++;
  }
  // Repeat width-stable geometry changes (border thickness) and ensure observer invalidates the cache.
  await page.evaluate(()=>{document.querySelector('#board').style.borderWidth='3px';});await page.waitForTimeout(100);
  const borderErrors=await page.evaluate(()=>{if(document.body.dataset.renderer!=='dom')return[];const cells=[...document.querySelectorAll('#cells .cell')];return[...document.querySelectorAll('#tiles .tile:not(.tile-ghost)')].flatMap(tile=>{const t=tile.getBoundingClientRect(),c=cells[Number(tile.dataset.index)].getBoundingClientRect();return[Math.abs(t.x-c.x),Math.abs(t.y-c.y),Math.abs(t.width-c.width),Math.abs(t.height-c.height)];});});assert.ok(borderErrors.every(e=>e<.65),'border-only resize realigns cached tile geometry');
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(checks+' geometry/motion checks passed across desktop/mobile, Canvas/DOM and fractional zoom.');
}finally{await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
