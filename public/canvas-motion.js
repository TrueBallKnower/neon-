/* Pure visual state. Logical rules and input never wait for this timeline. */
(function(root){
 const clamp=n=>Math.max(0,Math.min(1,n));
 function ease(t){
  t=clamp(t);let x=t;
  for(let i=0;i<6;i++){const v=3*(1-x)*(1-x)*x*.2+3*(1-x)*x*x*.3+x*x*x-t,derivative=3*(1-x)*(1-x)*.2+6*(1-x)*x*.1+3*x*x*.7;if(Math.abs(derivative)<.0001)break;x=clamp(x-v/derivative);}
  return 3*(1-x)*(1-x)*x*.7+3*(1-x)*x*x+x*x*x;
 }
 function pose(tile,now){
  const p=tile.duration?clamp((now-tile.start)/tile.duration):1,e=ease(p);
  tile.x=tile.fromX+(tile.toX-tile.fromX)*e;tile.y=tile.fromY+(tile.toY-tile.fromY)*e;
  let active=p<1;tile.scale=1;tile.opacity=tile.ghost?1-p:1;
  if(tile.effect){const q=clamp((now-tile.effect.start)/tile.effect.duration);active=active||q<1;
   if(tile.effect.kind==='spawn'){tile.scale=.85+.15*ease(q);tile.opacity=clamp(q*3);}
   else tile.scale=q<.45?1+(tile.effect.peak-1)*Math.sin(q/.45*Math.PI/2):1+(tile.effect.peak-1)*Math.cos((q-.45)/.55*Math.PI/2);
  }
  return active;
 }
 function create(){
  let tiles=new Map(),ghosts=[];
  return{
   update(board,result,spawned,now=0,reduced=false,duration=220){
    for(const tile of tiles.values())pose(tile,now);
    ghosts=!result||reduced?[]:ghosts.filter(g=>now<g.start+g.duration);
    const next=new Map(),sources=new Map(),used=new Set();
    if(result)for(const tr of result.transitions)if(!sources.has(tr.to))sources.set(tr.to,tr.from);
    for(let index=0;index<16;index++){
     if(!board[index])continue;const source=result?sources.get(index):index,old=tiles.get(source),toX=index%4,toY=Math.floor(index/4);
     let tile;
     if(old&&result&&!reduced&&old.toX===toX&&old.toY===toY)tile={...old,index,value:board[index]};
     else tile={index,value:board[index],fromX:old&&result&&!reduced?old.x:toX,fromY:old&&result&&!reduced?old.y:toY,toX,toY,start:now,duration:old&&result&&!reduced?180:0,effect:result&&!reduced?old?.effect:null};
     if(old)used.add(source);
     if(!reduced&&result&&(result.merges.includes(index)||index===spawned))tile.effect={kind:index===spawned?'spawn':'merge',start:now,duration:index===spawned?120:duration,peak:1.075};
     if(reduced)tile.effect=null;pose(tile,now);next.set(index,tile);
    }
    if(result&&!reduced)for(const [index,old]of tiles){if(used.has(index))continue;const tr=result.transitions.find(t=>t.from===index);if(tr)ghosts.push({value:old.value,index:tr.to,fromX:old.x,fromY:old.y,toX:tr.to%4,toY:Math.floor(tr.to/4),start:now,duration:180,ghost:true});}
    tiles=next;ghosts=ghosts.slice(-16);this.sample(now);
   },
   sample(now){let active=false;for(const tile of tiles.values())active=pose(tile,now)||active;
    if(ghosts.some(g=>now>=g.start+g.duration))ghosts=ghosts.filter(g=>now<g.start+g.duration);
    for(const ghost of ghosts)active=pose(ghost,now)||active;return{tiles,ghosts,active};
   },
   settle(now){for(const tile of tiles.values()){tile.fromX=tile.toX;tile.fromY=tile.toY;tile.duration=0;tile.effect=null;}ghosts=[];return this.sample(now);}
  };
 }
 const api={create,ease};if(typeof module!=='undefined')module.exports=api;else root.FusionCanvasMotion=api;
})(typeof window!=='undefined'?window:globalThis);
