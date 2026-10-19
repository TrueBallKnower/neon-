// Optional developer check. Provide Playwright and a Chromium browser; no production services are used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path'), os = require('node:os');
const outputDir = process.env.FUSION_TEST_OUTPUT || os.tmpdir();
fs.mkdirSync(outputDir, { recursive: true });
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusion-iphone-check-'));
const { createApp } = require('../server');
const seedBoard = [2,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0];
(async () => {
  const app = await createApp(), server = app.app.listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FUSION_BROWSER_PATH || undefined, args: ['--no-sandbox'] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/?renderer=canvas');
    await page.waitForFunction(() => document.body.dataset.renderer === 'canvas' && document.querySelector('#board-canvas'));
    await page.waitForTimeout(300);
    const trace = await page.evaluate(async initialBoard => {
      soundOn = false; Math.random = () => .99;
      const inspect = () => FusionUI.renderState?.() || FusionCanvas.inspect?.();
      const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
      FusionUI.load({ board: initialBoard, moves: 0, score: 0 });
      await wait(20);
      const beforeState = inspect();
      if (!beforeState) throw new Error('Expose FusionUI.renderState() or FusionCanvas.inspect() for acceptance checks');
      const originalRect = Element.prototype.getBoundingClientRect;
      let geometryReads = 0;
      Element.prototype.getBoundingClientRect = function (...args) { geometryReads++; return originalRect.apply(this, args); };
      play('right');
      Element.prototype.getBoundingClientRect = originalRect;
      const synchronousMoves = FusionUI.state.moves;
      const afterMove = inspect();
      await wait(48);
      const inFlight = inspect(), tileBefore = inFlight.tiles.find(t => t.value === 2 && t.index === 3);
      play('left');
      const interrupted = inspect(), tileAfter = interrupted.tiles.find(t => t.value === 2 && t.index === 0);
      await wait(400);
      const finished = inspect();
      const canvas = document.querySelector('#board-canvas'), ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0; for (let i = 3; i < data.length; i += 4) if (data[i]) opaque++;
      const idleBefore = inspect().frameCount;
      await wait(160);
      const idleAfter = inspect().frameCount;
      return { beforeState, synchronousMoves, geometryReads, afterMove, inFlight, interrupted, finished,
        continuity: tileBefore && tileAfter ? Math.hypot(tileBefore.x - tileAfter.x, tileBefore.y - tileAfter.y) : null,
        opaque, idleBefore, idleAfter, domTiles: document.querySelectorAll('#tiles .tile').length,
        accessible: [...document.querySelectorAll('#tiles [role=gridcell]')].map(el => ({label:el.getAttribute('aria-label')||el.textContent,row:el.getAttribute('aria-rowindex'),column:el.getAttribute('aria-colindex')})) };
    }, seedBoard);
    assert.equal(trace.synchronousMoves, 1, 'logical move must commit synchronously');
    assert.equal(trace.geometryReads, 0, 'input path must not force layout geometry');
    assert.equal(trace.domTiles, 0, 'mobile path must bypass moving DOM tile tree');
    assert.ok(trace.afterMove.running, 'normal movement interpolates');
    assert.ok(trace.continuity !== null && trace.continuity < 5, 'interruption starts at visible position: ' + JSON.stringify(trace));
    assert.equal(trace.finished.running, false, 'animation settles');
    assert.equal(trace.idleBefore, trace.idleAfter, 'RAF stops completely while board idle');
    assert.ok(trace.opaque > 100, 'canvas contains visible graphics');
    assert.ok(trace.finished.dpr <= 2, '3x iPhone device backing store must be capped');
    assert.equal(trace.accessible.length, 16, '16 accessible grid cells survive');
    assert.ok(trace.accessible.every(cell=>cell.label.includes('ligne')&&cell.row&&cell.column), 'grid cells retain readable positions');
    console.log('Canvas: synchronous input, no geometry reads, continuous interrupted slide (' + trace.continuity.toFixed(2) + 'px), native DPR 3 capped at ' + trace.finished.dpr + ', RAF idle stop.');

    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluate(initialBoard => FusionUI.load({ board: initialBoard, moves: 0, score: 0 }), seedBoard);
    const bounds = await page.locator('#board').boundingBox(), x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 20, y }] });
    assert.equal(await page.evaluate(() => FusionUI.state.moves), 1, 'real swipe commits before release, CPU 4x');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    console.log('Touch: real gesture commits at threshold, before finger release under 4x CPU slowdown.');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await page.evaluate(async initialBoard => {
      FusionUI.load({ board: initialBoard, moves: 0, score: 0 });play('right');
      await new Promise(resolve => setTimeout(resolve, 90));
      return { state: FusionUI.state, render: FusionUI.renderState?.() || FusionCanvas.inspect?.() };
    }, seedBoard);
    assert.equal(reduced.state.moves, 1);
    assert.equal(reduced.render.running, false);
    console.log('Reduced motion: logical move is immediate and final board settles without animation.');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Mobile widths / landscape: no overflow, settled geometry and non-zero canvas backing size.
    for (const [width, height] of [[320,568],[375,667],[390,844],[430,932],[844,390]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(100);
      const shape = await page.evaluate(() => {
        const c = document.querySelector('#board-canvas'), b = document.querySelector('#board').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth + 1, canvas: [c.width,c.height], board: [b.width,b.height], render: FusionUI.renderState?.() || FusionCanvas.inspect?.() };
      });
      assert.equal(shape.overflow, false, 'overflow at ' + width + 'x' + height);
      assert.ok(shape.canvas[0] > 100 && shape.canvas[1] > 100, JSON.stringify(shape));
      assert.ok(Math.abs(shape.board[0] - shape.board[1]) < 2, 'board remains square');
    }
    console.log('Geometry: 320–430px portrait and 844x390 landscape all fit without horizontal overflow.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.request.post(base + '/api/register', { data: { username: 'TrueBallKnower', password: 'test-password-123' } });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#online-status').textContent.includes('TrueBallKnower'));
    await page.waitForFunction(() => window.FusionSkins);
    const pixelSignatures = [];
    for (const id of ['original','king','gold','ores','capsules','dragon']) {
      const response = await page.request.post(base + '/api/cosmetics/equip', { data: { skin: id } });
      assert.ok(response.ok(), await response.text());
      await page.evaluate(() => FusionSkins.refresh());
      await page.waitForFunction(id => document.body.dataset.skin === id, id);
      await page.evaluate(() => FusionUI.load({ board: [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536], moves: 0, score: 0 }));
      await page.waitForTimeout(450);
      const signature = await page.evaluate(() => {
        const c = document.querySelector('#board-canvas');
        const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
        let hash = 2166136261;for (let i = 0; i < d.length; i += 11) hash = Math.imul(hash ^ d[i],16777619);
        return { hash: hash >>> 0, render: FusionUI.renderState?.() || FusionCanvas.inspect?.() };
      });
      pixelSignatures.push(signature.hash);
      assert.ok(signature.render.textureCount <= 32, 'bounded raster tile cache: ' + JSON.stringify(signature));
      await page.screenshot({ path: path.join(outputDir, 'iphone-canvas-' + id + '.png') });
    }
    assert.equal(new Set(pixelSignatures).size, pixelSignatures.length, 'skin equip must repaint the board, including while idle');
    console.log('Skins: original, SOVEREIGN, GOLD, Minecraft ores, Pokémon capsules and archived Dragon produce distinct cached board renders; high values retained.');

    await page.evaluate(() => localStorage.setItem('fusion-story-stars',JSON.stringify(Object.fromEntries(Array.from({length:18},(_,i)=>[i+1,3])))));
    await page.reload();await page.waitForFunction(()=>window.FusionStory);
    for(const id of [7,8]){
      await page.evaluate(()=>FusionStory.map());
      await page.locator('.story-level[aria-label^="Niveau '+id+' :"]').click();
      await page.click('#story-start');await page.waitForFunction(id=>FusionStory.state?.level===id,id);
      const decorations=await page.evaluate(()=>{
        const canvas=document.querySelector('#board-canvas'),state=FusionStory.state;
        return{level:state.level,renderer:document.body.dataset.renderer,cells:[...document.querySelectorAll('#cells .story-wall,#cells .story-ice,#cells .story-beacon')].map(el=>({classes:el.className,text:el.textContent,visible:getComputedStyle(el).visibility==='visible'&&getComputedStyle(el).display!=='none'})),canvas:!!canvas};
      });
      assert.equal(decorations.renderer,'canvas');assert.ok(decorations.canvas);
      assert.ok(decorations.cells.length>=2&&decorations.cells.every(cell=>cell.visible&&cell.text));
      if(id===7)assert.equal(decorations.cells.filter(cell=>cell.classes.includes('story-ice')).length,2);
      else{assert.equal(decorations.cells.filter(cell=>cell.classes.includes('story-wall')).length,2);assert.equal(decorations.cells.filter(cell=>cell.classes.includes('story-beacon')).length,1);}
      const moved=await page.evaluate(()=>{
        const initial=FusionStory.state;
        const direction=['left','up','right','down'].find(direction=>FusionStoryRules.step(initial,direction,Date.now()).result?.changed);
        if(!direction)return false;play(direction);return FusionStory.state.moves===initial.moves+1;
      });assert.ok(moved,'story input commits through Canvas');
      await page.screenshot({path:path.join(outputDir,'iphone-canvas-story-'+id+'.png')});
    }
    console.log('Story: ice, walls and beacon remain visible under the canvas; story moves still commit immediately.');

    const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const fallback = await desktop.newPage();fallback.on('pageerror', e => errors.push(e.message));
    await fallback.goto(base + '/?renderer=dom');
    await fallback.waitForFunction(() => window.FusionUI);
    await fallback.evaluate(initialBoard => { FusionUI.load({ board: initialBoard, moves: 0, score: 0 });play('right'); }, seedBoard);
    assert.ok(await fallback.locator('#tiles .tile').count());
    assert.equal(await fallback.evaluate(() => FusionUI.state.moves), 1);
    console.log('Fallback: forced DOM renderer remains functional.');
    await desktop.close();

    const unavailableContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),unavailable=await unavailableContext.newPage();
    unavailable.on('pageerror',e=>errors.push(e.message));
    await unavailable.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='2d'?null:get.call(this,type,...args);};
    });
    await unavailable.goto(base);await unavailable.waitForFunction(()=>window.FusionUI);
    await unavailable.evaluate(initialBoard=>{FusionUI.load({board:initialBoard,moves:0,score:0});play('right');},seedBoard);
    assert.equal(await unavailable.locator('#board-canvas').count(),0,'failed Canvas creation leaves no drawing surface');
    assert.ok(await unavailable.locator('#tiles .tile').count(),'Canvas unavailability auto selects DOM tiles');
    assert.equal(await unavailable.evaluate(()=>FusionUI.state.moves),1);
    console.log('Failure fallback: null 2D context automatically selects functional DOM renderer on mobile.');
    await unavailableContext.close();
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();await new Promise(r => server.close(r));await app.close();
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
})().catch(error => { console.error(error);process.exitCode = 1; });
