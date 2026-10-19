/* One mobile drawing surface. Each skin/number is rasterized once, then only blitted. */
(()=>{
 const colors={2:['#343c34','#c2eea3'],4:['#2c3c3c','#8fdfd3'],8:['#2d3547','#aacbff'],16:['#443c2d','#f4d183'],32:['#47352d','#ffb17e'],64:['#492d3a','#ff91bd'],128:['#402d50','#d6a0ff'],256:['#353057','#b3a1ff'],512:['#24434b','#7be9ff'],1024:['#3e481f','#ddff80'],2048:['#b9f45d','#263b10']};
 function round(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
 function create(host){
  const option=new URL(location.href).searchParams.get('renderer');
  if(option==='dom'||(!matchMedia('(pointer:coarse)').matches&&option!=='canvas'))return null;
  const canvas=document.createElement('canvas');let ctx;try{ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});}catch{}if(!ctx)return null;
  host.setAttribute('aria-rowcount','4');host.setAttribute('aria-colcount','4');canvas.id='board-canvas';canvas.setAttribute('aria-hidden','true');host.append(canvas);document.body.dataset.renderer='canvas';
  const scene=FusionCanvasMotion.create(),images=new Map(),textures=new Map(),a11y=[],effects=[];
  const accessible=document.getElementById('tiles');accessible.replaceChildren();
  for(let i=0;i<16;i++){const cell=document.createElement('span');cell.className='canvas-a11y-cell';cell.setAttribute('role','gridcell');cell.setAttribute('aria-rowindex',Math.floor(i/4)+1);cell.setAttribute('aria-colindex',i%4+1);accessible.append(cell);a11y.push(cell);}
  let frame=0,width=0,pad=0,gap=0,step=0,size=0,dpr=1,skinId='original',board=Array(16).fill(0),reduced=false,frameCount=0,paintCount=0,lastTime=0;
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
  function resize(){
   const style=getComputedStyle(host),next=host.clientWidth,nextDpr=Math.min(2,window.devicePixelRatio||1);
   if(!next)return;pad=parseFloat(style.paddingLeft)||14;gap=parseFloat(getComputedStyle(document.getElementById('cells')).gap)||12;
   if(next!==width||dpr!==nextDpr){width=next;dpr=nextDpr;canvas.width=Math.round(width*dpr);canvas.height=Math.round(host.clientHeight*dpr);textures.clear();}
   size=(width-2*pad-3*gap)/4;step=size+gap;schedule();
  }
  function imageFor(skin){
   if(!skin?.sprite)return null;const path=skin.atelier?'/atelier-art/'+skin.id+'.svg':'/skin-art/'+skin.id+'.svg',pixels=Math.max(1,Math.ceil(size*dpr)),key=path+':'+pixels;
   if(images.has(key))return images.get(key);
   const entry={ready:false,image:new Image()};images.set(key,entry);if(images.size>4)images.delete(images.keys().next().value);
   entry.image.onload=()=>{if(entry.url)URL.revokeObjectURL(entry.url);entry.ready=true;if(skinId===skin.id){textures.clear();schedule();}};
   entry.image.onerror=()=>{if(entry.url)URL.revokeObjectURL(entry.url);entry.failed=true;};
   fetch(path).then(response=>{if(!response.ok)throw Error('Artwork unavailable');return response.text();}).then(svg=>{
    const sized=svg.replace(/<svg\b([^>]*)>/,(_,attrs)=>'<svg'+attrs.replace(/\s(?:width|height)=(?:"[^"]*"|'[^']*')/g,'')+' width="'+pixels+'" height="'+pixels*11+'">');
    entry.url=URL.createObjectURL(new Blob([sized],{type:'image/svg+xml'}));entry.image.src=entry.url;
   }).catch(()=>{entry.failed=true;});return entry;
  }
  function texture(value){
   const key=skinId+':'+value;if(textures.has(key))return textures.get(key);
   const R=window.FusionSkinRules,skin=R?.get(skinId),style=R?.tileStyle(skinId,value),tile=style?.tile,base=colors[value]||colors[128];
   const surface=document.createElement('canvas'),pixels=Math.max(1,Math.round(size*dpr));surface.width=surface.height=pixels;
   const c=surface.getContext('2d');c.scale(dpr,dpr);const radius=skin?.material==='pixel'?2:Math.min(9,size*.12);
   c.save();round(c,0,0,size,size,radius);c.clip();
   let ink=tile?.ink||skin?.ink||base[1],ground=tile?.center||tile?.dark||skin?.ground||base[0];
   if(skin&&!skin.signature&&skin.id!=='original')ground='hsl('+(style.hue||200)+' 25% 23%)';
   c.fillStyle=ground;c.fillRect(0,0,size,size);
   const art=imageFor(skin);
   if(art?.ready){const image=art.image,panel=image.naturalHeight/11;c.imageSmoothingEnabled=skin.material!=='pixel';c.drawImage(image,0,(style.level||0)*panel,image.naturalWidth,panel,0,0,size,size);}
   else if(skin&&skin.id!=='original'){
    c.fillStyle=tile?.base||'hsl('+(style.hue||200)+' 45% 40%)';c.globalAlpha=.28;c.fillRect(0,0,size,size*.25);c.globalAlpha=1;
    if(skin.icon){c.font=Math.round(size*.2)+'px sans-serif';c.textAlign='center';c.fillText(skin.icon,size*.5,size*.23);}
   }
   c.restore();round(c,.5,.5,size-1,size-1,radius);c.strokeStyle=tile?.accent||ink;c.globalAlpha=.65;c.lineWidth=1;c.stroke();c.globalAlpha=1;
   const digits=String(value).length,font=Math.min(size*.44,size*.89/(digits*.58));c.font='700 '+font+'px system-ui, -apple-system, sans-serif';c.textAlign='center';c.textBaseline='middle';
   // A small opaque number outline is baked into the texture, never a live CSS shadow.
   c.lineJoin='round';c.lineWidth=Math.max(2,size*.038);c.strokeStyle=ground;c.strokeText(String(value),size/2,size*.53);c.fillStyle=ink;c.fillText(String(value),size/2,size*.53);
   if(style?.ascension){round(c,4,4,size-8,size-8,Math.max(1,radius-3));c.strokeStyle=tile?.accent||ink;c.lineWidth=1;c.stroke();c.font='700 '+Math.max(8,size*.1)+'px system-ui';c.textAlign='right';c.fillText('+'+style.ascension,size-7,size-9);}
   if(textures.size>=64)textures.delete(textures.keys().next().value);textures.set(key,surface);return surface;
  }
  function drawTile(tile){
   const image=texture(tile.value),scaled=size*tile.scale,x=pad+tile.x*step+(size-scaled)/2,y=pad+tile.y*step+(size-scaled)/2;
   ctx.globalAlpha=tile.opacity;ctx.drawImage(image,x,y,scaled,scaled);
  }
  function paint(now){
   frame=0;if(document.hidden||!width)return;lastTime=now;frameCount++;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,canvas.height/dpr);
   const visual=scene.sample(now);for(const ghost of visual.ghosts)drawTile(ghost);for(const tile of visual.tiles.values())drawTile(tile);ctx.globalAlpha=1;
   for(let i=effects.length-1;i>=0;i--){const e=effects[i],t=(now-e.start)/420;if(t>=1){effects.splice(i,1);continue;}ctx.globalAlpha=(1-t)*.8;ctx.fillStyle=e.color;ctx.fillRect(pad+e.x*step+size/2+e.dx*t,pad+e.y*step+size/2+e.dy*t,3,3);}
   ctx.globalAlpha=1;paintCount++;if(visual.active||effects.length)schedule();
  }
  function skinChanged(){const next=window.FusionSkins?.selected||'original';if(next!==skinId){skinId=next;textures.clear();effects.length=0;}schedule();}
  const api={
   update(data){if(!data.result)effects.length=0;board=[...data.board];reduced=data.reduced;skinChanged();scene.update(board,data.result,data.spawned,performance.now(),reduced,window.FusionSkins?.mergeDuration()||220);
    for(let i=0;i<16;i++){const text=(board[i]||'Vide')+', ligne '+(Math.floor(i/4)+1)+', colonne '+(i%4+1);if(a11y[i].textContent!==text)a11y[i].textContent=text;}
    if(!width)resize();schedule();
   },
   resize,skinChanged,setReduced(value){reduced=value;if(value){scene.settle(performance.now());effects.length=0;}schedule();},
   visibility(hidden){if(hidden){cancelAnimationFrame(frame);frame=0;effects.length=0;}else{scene.settle(performance.now());schedule();}},
   burst(index,color){if(reduced||window.FusionSkins?.lite)return;for(let i=0;i<3&&effects.length<12;i++){const angle=i*Math.PI*2/3;effects.push({x:index%4,y:Math.floor(index/4),dx:Math.cos(angle)*30,dy:Math.sin(angle)*30,start:performance.now(),color});}schedule();},
   inspect(){const now=performance.now(),visual=scene.sample(now),copy=t=>({index:t.index,value:t.value,x:t.x*step,y:t.y*step,scale:t.scale,opacity:t.opacity});return{tiles:[...visual.tiles.values()].map(copy),ghosts:visual.ghosts.map(copy),running:!!frame,width,dpr,textureCount:textures.size,frameCount,paintCount,lastTime};}
  };
  canvas.addEventListener('contextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;});
  canvas.addEventListener('contextrestored',()=>{textures.clear();scene.settle(performance.now());schedule();});
  resize();return api;
 }
 window.FusionCanvas={create};
})();
