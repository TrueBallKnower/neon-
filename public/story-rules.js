/* Story rules are separate from competitive 2048: no obstacles enter ranked games. */
(function(root){
 const chapters=[{name:'Le Jardin des étincelles',text:'Luma a perdu la lumière du jardin. Rallume ses six lanternes.',color:'#bdff64'},{name:'Les Ruines de cristal',text:'Traverse les piliers et brise la glace pour réveiller le phare.',color:'#7be9ff'},{name:'Le Cœur de l’aurore',text:'Les dernières balises attendent. Rassemble les couleurs et rallume le ciel.',color:'#d6a0ff'}];
 const board=entries=>{const b=Array(16).fill(0);for(const [i,v]of entries)b[i]=v;return b;};
 const levels=[
  {name:'Une première lumière',intro:'Deux étincelles suffisent à réveiller Luma.',goal:{type:'tile',value:8},moves:8,par:3,start:[[0,2],[1,2],[4,4]]},
  {name:'Les lucioles',intro:'Chaque fusion libère une luciole.',goal:{type:'merges',value:5},moves:16,par:10,start:[[0,2],[1,2],[4,4],[5,4]]},
  {name:'La rosée dorée',intro:'Fais monter l’énergie du jardin.',goal:{type:'score',value:100},moves:22,par:14,start:[[0,8],[1,8],[4,4],[5,4]]},
  {name:'Le pont de mousse',intro:'Les rochers séparent le pont. Contourne-les.',goal:{type:'tile',value:32},moves:22,par:12,walls:[5,10],start:[[0,8],[1,8],[8,4],[9,4]]},
  {name:'Cueilleur d’étoiles',intro:'Crée deux tuiles 16 pour cueillir les étoiles.',goal:{type:'collect',tile:16,value:2},moves:26,par:16,start:[[0,8],[1,8],[8,4],[9,4],[12,8]]},
  {name:'La lanterne du jardin',intro:'Rallume la première grande lanterne.',goal:{type:'tile',value:64},moves:32,par:20,start:[[0,16],[1,16],[4,8],[5,8],[12,4],[13,4]]},
  {name:'Les portes de glace',intro:'Fusionne près de la glace : chaque fusion adjacente la brise.',goal:{type:'ice',value:2},moves:18,par:10,ice:[5,10],start:[[0,2],[1,2],[8,4],[9,4]]},
  {name:'Le phare oublié',intro:'Amène une tuile 32 ou plus sur la balise en bas à droite.',goal:{type:'beacon',tile:32,index:15},moves:24,par:14,walls:[5,6],start:[[0,16],[1,16],[8,8],[9,8]]},
  {name:'Le couloir des échos',intro:'Les piliers forment des couloirs. Prépare tes fusions.',goal:{type:'merges',value:12},moves:30,par:22,walls:[5,9],start:[[0,4],[1,4],[6,2],[7,2],[12,8],[13,8]]},
  {name:'La fonte des cristaux',intro:'Libère les quatre cristaux prisonniers.',goal:{type:'ice',value:4},moves:28,par:18,ice:[5,6,9,10],start:[[0,4],[1,4],[2,2],[3,2],[12,4],[13,4],[14,2],[15,2]]},
  {name:'Une minute de soleil',intro:'Le soleil éclaire les ruines pendant 60 secondes.',goal:{type:'score',value:256},moves:40,par:24,time:60000,start:[[0,16],[1,16],[4,8],[5,8],[12,4],[13,4]]},
  {name:'Le gardien des ruines',intro:'Traverse les deux piliers et réveille le gardien.',goal:{type:'tile',value:128},moves:42,par:28,walls:[5,10],start:[[0,32],[1,32],[4,16],[7,16],[12,8],[13,8]]},
  {name:'La constellation',intro:'Trois tuiles 32 dessineront le chemin dans le ciel.',goal:{type:'collect',tile:32,value:3},moves:38,par:26,start:[[0,16],[1,16],[4,8],[5,8],[8,16],[9,16]]},
  {name:'Le dégel de l’aurore',intro:'Brise la glace, puis continue à fusionner pour atteindre 128.',goal:{type:'tile',value:128},moves:40,par:28,ice:[5,10],start:[[0,32],[1,32],[4,16],[7,16],[12,8],[13,8]]},
  {name:'La balise polaire',intro:'Pose une tuile 128 ou plus sur la balise au sommet.',goal:{type:'beacon',tile:128,index:3},moves:32,par:20,walls:[5,9],start:[[0,32],[1,32],[6,16],[7,16],[12,8],[13,8]]},
  {name:'Pluie de météores',intro:'Six cristaux à libérer avant que le ciel ne se referme.',goal:{type:'ice',value:6},moves:40,par:26,time:90000,ice:[4,5,6,9,10,11],start:[[0,8],[1,8],[2,4],[3,4],[12,8],[13,8],[14,4],[15,4]]},
  {name:'Les trois soleils',intro:'Forge trois tuiles 64 pour alimenter le cœur.',goal:{type:'collect',tile:64,value:3},moves:44,par:32,start:[[0,32],[1,32],[4,16],[5,16],[8,32],[9,32],[12,16],[13,16]]},
  {name:'Le Cœur de l’aurore',intro:'La dernière fusion rendra ses couleurs au ciel.',goal:{type:'tile',value:256},moves:48,par:34,time:120000,walls:[5,10],start:[[0,64],[1,64],[4,32],[7,32],[8,16],[9,16],[12,16],[13,16]]}
 ].map((l,i)=>({...l,id:i+1,chapter:Math.floor(i/6),start:board(l.start)}));
 function create(id,now=Date.now()){const l=levels[id-1];if(!l)throw Error('Niveau inconnu.');return{level:id,board:[...l.start],score:0,moves:0,merges:0,collected:0,ice:[...(l.ice||[])],broken:0,startedAt:now,endedAt:null,status:'playing',stars:0};}
 function blocks(state){return [...(levels[state.level-1].walls||[]),...state.ice];}
 function move(board,direction,blocked=[]){
  if(!['left','right','up','down'].includes(direction))throw Error('Direction inconnue.');
  const wall=new Set(blocked),next=Array(16).fill(0),transitions=[],merges=[];let gain=0;
  function segment(indices){const occupied=indices.filter(i=>board[i]);let pos=0;for(let n=0;n<occupied.length;n++){const from=occupied[n],to=indices[pos++],value=board[from];if(n+1<occupied.length&&board[occupied[n+1]]===value){next[to]=value*2;gain+=value*2;merges.push(to);transitions.push({from,to},{from:occupied[++n],to});}else{next[to]=value;transitions.push({from,to});}}}
  for(let line=0;line<4;line++){const indices=Array.from({length:4},(_,n)=>direction==='left'?line*4+n:direction==='right'?line*4+3-n:direction==='up'?n*4+line:(3-n)*4+line);let part=[];for(const i of indices){if(wall.has(i)){segment(part);part=[];}else part.push(i);}segment(part);}
  return{board:next,gain,merges,transitions,changed:next.some((v,i)=>v!==board[i])};
 }
 const adjacent=(a,b)=>Math.abs(a%4-b%4)+Math.abs(Math.floor(a/4)-Math.floor(b/4))===1;
 function progress(state){const goal=levels[state.level-1].goal;switch(goal.type){case'tile':return Math.max(...state.board);case'score':return state.score;case'merges':return state.merges;case'collect':return state.collected;case'ice':return state.broken;case'beacon':return state.board[goal.index]>=goal.tile?1:0;}}
 function target(level){return level.goal.type==='beacon'?1:level.goal.value;}
 function objective(level){const g=level.goal;return g.type==='tile'?'Crée une tuile '+g.value:g.type==='score'?'Gagne '+g.value+' points':g.type==='merges'?'Réalise '+g.value+' fusions':g.type==='collect'?'Crée '+g.value+' tuiles '+g.tile:g.type==='ice'?'Brise '+g.value+' blocs de glace':'Amène '+g.tile+' ou plus sur la balise ✧';}
 function settle(state,now){if(state.status!=='playing')return state;const l=levels[state.level-1];if(l.time&&now-state.startedAt>=l.time){state.status='lost';state.reason='time';}else if(progress(state)>=target(l)){state.status='won';state.stars=state.moves<=l.par?3:state.moves<=Math.ceil((l.par+l.moves)/2)?2:1;}else if(state.moves>=l.moves){state.status='lost';state.reason='moves';}else if(!['left','right','up','down'].some(d=>move(state.board,d,blocks(state)).changed)){state.status='lost';state.reason='blocked';}if(state.status!=='playing')state.endedAt=now;return state;}
 function step(state,direction,now=Date.now()){
  const next={...state,board:[...state.board],ice:[...state.ice]};settle(next,now);if(next.status!=='playing')return{state:next,result:null,spawned:-1};
  const l=levels[next.level-1],result=move(next.board,direction,blocks(next));if(!result.changed)return{state:next,result,spawned:-1};
  next.board=[...result.board];next.moves++;next.score+=result.gain;next.merges+=result.merges.length;next.collected+=result.merges.filter(i=>result.board[i]===l.goal.tile).length;
  const freed=next.ice.filter(i=>result.merges.some(m=>adjacent(i,m)));next.ice=next.ice.filter(i=>!freed.includes(i));next.broken+=freed.length;
  // Fixed streams make retries fair: the same moves give the same spawns.
  const token=engine.spawnToken('story-v1:'+next.level,next.moves),occupied=blocks(next),empty=next.board.map((v,i)=>v||occupied.includes(i)?-1:i).filter(i=>i>=0);let spawned=-1;
  if(empty.length){spawned=empty[token.position%empty.length];next.board[spawned]=token.value;}
  settle(next,now);return{state:next,result,spawned,freed};
 }
 const engine=typeof module!=='undefined'?require('./engine'):root.FusionRules;
 const api={chapters,levels,create,blocks,move,step,settle,progress,target,objective};if(typeof module!=='undefined')module.exports=api;else root.FusionStoryRules=api;
})(typeof window!=='undefined'?window:globalThis);
