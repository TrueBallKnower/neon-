const $=id=>document.getElementById(id);
const rules=window.FusionRules;
const modeRules=window.FusionModes;
let ruleState=modeRules.create('classic',Date.now());
const gameNow=()=>window.FusionOnline?.now?.()||Date.now();
const comboWindow=()=>modeRules.get(ruleState.mode).comboMs;
const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
let board=Array(16).fill(0),score=0,best=Number(storage.get('fusion-best',0))||0,moves=0,locked=false,won=false,continuing=false,generation=0;
let comboCount=0,comboUntil=0,comboFrame=0;

function resetCombo(){comboCount=0;comboUntil=0;cancelAnimationFrame(comboFrame);$('combo').hidden=true;}
function animateCombo(){const left=Math.max(0,comboUntil-performance.now());$('combo-bar').style.transform='scaleX('+left/comboWindow()+')';if(left>0)comboFrame=requestAnimationFrame(animateCombo);else resetCombo();}
function advanceCombo(){const now=performance.now();comboCount=now<comboUntil?comboCount+1:1;comboUntil=now+comboWindow();cancelAnimationFrame(comboFrame);$('combo').hidden=false;$('combo-label').textContent=comboCount>1?`COMBO ×${comboCount}`:'PREMIÈRE ÉTINCELLE';$('combo-hint').textContent=comboCount>=5?'EN FEU !':'ENCHAÎNE LES FUSIONS';$('combo').classList.toggle('hot',comboCount>=5);animateCombo();return comboCount;}
let soundOn=storage.get('fusion-sound',true),audio;
const lightEffects=matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||8)<=4;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function unlockAudio(){try{if(!audio||audio.state==='closed')audio=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(audio.state!=='running')audio.resume().catch(()=>{});}catch{}}
let voices=0;
function tone(freq,time,duration,type='sine',volume=.08,slide){if(!audio||!soundOn||voices>=32)return;voices++;const osc=audio.createOscillator(),amp=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,time);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,time+duration);amp.gain.setValueAtTime(.001,time);amp.gain.exponentialRampToValueAtTime(volume,time+.012);amp.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(amp);amp.connect(audio.destination);osc.start(time);osc.stop(time+duration+.02);osc.onended=()=>{voices=Math.max(0,voices-1);osc.disconnect();amp.disconnect();};}
function sfx(kind,value=2,chain=1){if(!soundOn||!audio)return;const t=audio.currentTime;
 if(kind==='move'){tone(150,t,.09,'sine',.035,65);tone(750,t,.04,'triangle',.012,350);}
 if(kind==='merge'){const level=Math.log2(value),boost=Math.min(chain-1,12),f=196*2**((level%7+boost*2)/12);tone(f,t,.22,'triangle',.075);tone(f*1.5,t+.035,.22,'sine',.06);tone(f*2,t+.07,.3,'sine',.045);tone(85,t,.14,'sine',.1,40);if(value>=64||chain>1)tone(f*3,t+.11,.35,'sine',.035);if(chain>1){tone(f/2,t,.22,'sawtooth',Math.min(.012+boost*.004,.055));for(let n=0;n<Math.min(chain,6);n++)tone(f*2**(n/12),t+n*.045,.13,'triangle',.025+boost*.002);}if(chain>=5)tone(55,t,.3,'sine',.12,28);}
 if(kind==='start') [261.63,329.63,392].forEach((f,i)=>tone(f,t+i*.065,.22,'triangle',.045));
 if(kind==='win') [261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>tone(f,t+i*.1,.45,'triangle',.055));
 if(kind==='over') [261.63,233.08,196,130.81].forEach((f,i)=>tone(f,t+i*.15,.35,'triangle',.05));
}
function soundLabel(){$('sound').innerHTML=`${soundOn?'♫':'♪'} <span>SON ${soundOn?'ACTIVÉ':'COUPÉ'}</span>`;$('sound').setAttribute('aria-pressed',String(soundOn));}
$('sound').onclick=()=>{unlockAudio();soundOn=!soundOn;storage.set('fusion-sound',soundOn);soundLabel();if(soundOn)sfx('start');};soundLabel();
for(let i=0;i<16;i++){const c=document.createElement('div');c.className='cell';$('cells').append(c);}
function spawn(){const empty=board.map((v,i)=>v?null:i).filter(i=>i!==null);if(!empty.length)return -1;const i=empty[Math.floor(Math.random()*empty.length)];board[i]=Math.random()<.9?2:4;return i;}
function cancelVisuals(el,known){for(const animation of known||el.getAnimations?.()||[])animation.cancel();}
function animateVisual(el,frames,timing){if(reduced||typeof el.animate!=='function')return;try{return el.animate(frames,timing);}catch{}}
let boardGeometry=null;const motion=new WeakMap();
function draw(merges=[],spawned=-1,result=null){
 const container=$('tiles'),old=new Map();
 container.querySelectorAll('.tile-ghost').forEach(el=>el.remove());
 for(const el of container.children)old.set(Number(el.dataset.index),el);
 const positions=new Map(),sources=new Map(),running=new Map();
 let step=0,origin;
 if(result&&!reduced&&old.size){
  const rect=$('board').getBoundingClientRect();
  if(!boardGeometry||boardGeometry.width!==rect.width){
   const css=getComputedStyle($('board')),gap=parseFloat(getComputedStyle($('cells')).gap)||12;
   const left=parseFloat(css.borderLeftWidth),right=parseFloat(css.borderRightWidth),padding=parseFloat(css.paddingLeft);
   boardGeometry={gap,width:rect.width,insetX:left+padding,insetY:parseFloat(css.borderTopWidth)+parseFloat(css.paddingTop),step:(rect.width-left-right-2*padding-3*gap)/4+gap};
  }
  origin={x:rect.left+boardGeometry.insetX,y:rect.top+boardGeometry.insetY};step=boardGeometry.step;
  for(const [index,el]of old){
   const active=el.getAnimations?.()||[];running.set(el,active);
   const glide=motion.get(el),progress=glide?.animation.effect.getComputedTiming().progress;
   if(glide&&progress!==null&&progress!==undefined)positions.set(index,{x:glide.from.x+(glide.to.x-glide.from.x)*progress,y:glide.from.y+(glide.to.y-glide.from.y)*progress});
   else positions.set(index,{x:index%4*step,y:Math.floor(index/4)*step});
  }
 }
 if(result)for(const {from,to}of result.transitions)if(!sources.has(to))sources.set(to,from);
 const used=new Set();
 for(let i=0;i<16;i++){
  const value=board[i];if(!value)continue;
  const source=result?sources.get(i):i;
  let el=source===undefined?null:old.get(source);
  if(!el){el=document.createElement('div');const inner=document.createElement('div');inner.className='tile-inner';el.append(inner);}
  used.add(el);cancelVisuals(el,running.get(el));
  const moved=el.dataset.index!==String(i),changed=el.dataset.value!==String(value),className='tile'+(merges.includes(i)?' merge':i===spawned?' spawn':'');
  if(el.className!==className)el.className=className;
  if(changed){el.dataset.value=value;el.firstElementChild.textContent=value;}
  if(moved){el.dataset.index=i;el.style.setProperty('--x',i%4);el.style.setProperty('--y',Math.floor(i/4));}
  if(moved||changed){el.setAttribute('role','gridcell');el.setAttribute('aria-label',`${value}, ligne ${Math.floor(i/4)+1}, colonne ${i%4+1}`);}if(!result)cancelVisuals(el.firstElementChild);
  if(el.parentNode!==container)container.append(el);
  if(!reduced&&(i===spawned||merges.includes(i))){
   const inner=el.firstElementChild;cancelVisuals(inner);
   animateVisual(inner,i===spawned?[{transform:'scale(.85)',opacity:0},{transform:'scale(1)',opacity:1}]:(window.FusionSkins?.frames()||[{transform:'scale(1)'},{transform:'scale(1.08)',offset:.45},{transform:'scale(1)'}]),{duration:i===spawned?120:160,easing:'ease-out'});
  }
  const from=positions.get(source),to={x:i%4*step,y:Math.floor(i/4)*step};
  if(from&&(Math.abs(from.x-to.x)>.2||Math.abs(from.y-to.y)>.2)){const animation=animateVisual(el,[{transform:`translate3d(${from.x}px,${from.y}px,0)`},{transform:`translate3d(${to.x}px,${to.y}px,0)`}],{duration:180,easing:'cubic-bezier(.2,.7,.3,1)'});if(animation)motion.set(el,{animation,from,to});}else motion.delete(el);
 }
 for(const [index,el]of old){
  if(used.has(el))continue;
  const transition=result?.transitions.find(t=>t.from===index),from=positions.get(index);
  if(transition&&from){
   cancelVisuals(el,running.get(el));el.className='tile tile-ghost';delete el.dataset.index;
   el.style.setProperty('--x',transition.to%4);el.style.setProperty('--y',Math.floor(transition.to/4));
   animateVisual(el,[{transform:`translate3d(${from.x}px,${from.y}px,0)`,opacity:1},{transform:`translate3d(${transition.to%4*step}px,${Math.floor(transition.to/4)*step}px,0)`,opacity:0}],{duration:180,easing:'ease-out'});
   if(el.parentNode!==container)container.append(el);setTimeout(()=>el.remove(),200);
  }else el.remove();
 }
 $('score').textContent=score;$('best').textContent=best;$('moves').textContent=`${moves} MOUVEMENT${moves>1?'S':''}`;
}
const sparkColors={2:'#c2eea3',4:'#8fdfd3',8:'#aacbff',16:'#f4d183',32:'#ffb17e',64:'#ff91bd',128:'#d6a0ff',256:'#b3a1ff',512:'#7be9ff',1024:'#ddff80',2048:'#bdff64'};
function particles(index){
 if(reduced||!boardGeometry||window.FusionSkins?.lite)return;
 const {step,insetX,insetY,gap}=boardGeometry;
 const size=step-gap,color=sparkColors[board[index]]||'#bdff64',batch=document.createDocumentFragment();
 for(let n=0;n<(lightEffects?3:6)&&$('particles').childElementCount+n<18;n++){
  const p=document.createElement('i');p.className='particle';p.style.left=insetX+index%4*step+size/2+'px';p.style.top=insetY+Math.floor(index/4)*step+size/2+'px';p.style.setProperty('--color',color);const angle=n*Math.PI*2/(lightEffects?3:6);p.style.setProperty('--dx',Math.cos(angle)*45+'px');p.style.setProperty('--dy',Math.sin(angle)*45+'px');batch.append(p);setTimeout(()=>p.remove(),650);
 }$('particles').append(batch);
}
let saveTimer;function save(){clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,200);}
function flushSave(){if(window.FusionOnline?.ranked||window.FusionOnline?.duel)return;storage.set('fusion-game',{board,score,moves,won,continuing,meta:ruleState});storage.set('fusion-best-'+ruleState.mode,best);if(ruleState.mode==='classic')storage.set('fusion-best',best);}
window.addEventListener('pagehide',flushSave);
document.addEventListener('visibilitychange',()=>{touch=null;if(document.hidden){cancelAnimationFrame(comboFrame);if(audio?.state==='running')audio.suspend().catch(()=>{});}else{draw();if(comboUntil>performance.now())animateCombo();else resetCombo();}});
window.addEventListener('pageshow',event=>{if(event.persisted){touch=null;draw();tickRules();}});
function showEnd(win){resetCombo();$('end-title').textContent=win?'La consécration.':'Fin de la partie.';$('end-text').textContent=win?'2048 ! Le sommet est à toi. Et si tu allais plus loin ?':`${score.toLocaleString('fr-FR')} points. Une nouvelle étincelle t’attend.`;$('end-action').textContent=win?'Continuer ↗':'Rejouer ↗';$('overlay').hidden=false;$('announcement').textContent=$('end-title').textContent;sfx(win?'win':'over');}
function newGame(withSound=true,mode=ruleState.mode){ruleState=modeRules.create(mode,Date.now());best=Number(storage.get('fusion-best-'+mode,mode==='classic'?storage.get('fusion-best',0):0))||0;generation++;resetCombo();locked=false;board=Array(16).fill(0);score=0;moves=0;won=false;continuing=false;$('overlay').hidden=true;$('particles').replaceChildren();$('score-add').textContent='';$('status').textContent='À toi de jouer';spawn();const added=spawn();draw([],added);tickRules();save();if(withSound){unlockAudio();sfx('start');}}
// Logical moves commit synchronously. Animation completion never gates input.
function play(direction){
 if($('online-dialog').open)return;
 if(window.FusionOnline?.ranked||window.FusionOnline?.duel){window.FusionOnline.move(direction);return;}
 tickRules();if(ruleState.endedAt||!$('overlay').hidden)return;
 unlockAudio();const result=rules.move(board,direction);
 if(!result.changed){if(!rules.canMove(board))showEnd(false);return;}
 updateRule(result,gameNow());board=result.board;score+=result.gain;best=Math.max(score,best);moves++;const added=spawn();
 draw(result.merges,added,result);sfx('move');fusionFeedback(result);
 if(modeRules.get(ruleState.mode).race&&board.some(v=>v>=modeRules.get(ruleState.mode).target)){ruleState.endedAt=gameNow();ruleState.reason='target';showModeEnd();}
 else if(ruleState.mode==='classic'&&!won&&board.some(v=>v>=2048)){won=true;showEnd(true);}else if(!rules.canMove(board))showEnd(false);
 save();$('announcement').textContent=`Score ${score}. ${result.merges.length} fusion(s).`;
}
function fusionFeedback(result){
 if(result.gain){const high=Math.max(...result.merges.map(i=>board[i]));const chain=advanceCombo();sfx('merge',high,chain);window.FusionSkins?.progress({score,combo:chain});result.merges.forEach(particles);$('status').textContent=high>=128?'Fusion survoltée !':'Belle fusion !';const el=$('score-add');el.textContent='+'+result.gain;cancelVisuals(el);if(!reduced)animateVisual(el,[{transform:'translateY(0)',opacity:1},{transform:'translateY(-30px)',opacity:0}],{duration:500,fill:'forwards'});}
 else $('status').textContent='Trouve la prochaine fusion';
}
$('restart').onclick=()=>{if(window.FusionOnline?.ranked||window.FusionOnline?.duel){window.FusionOnline.restart();return;}if(moves>0&&!confirm('Recommencer cette partie ? Ton record sera conservé.'))return;newGame();};$('end-action').onclick=()=>{unlockAudio();if(!ruleState.endedAt&&won&&!continuing){continuing=true;$('overlay').hidden=true;save();}else if(window.FusionOnline?.ranked)window.FusionOnline.restart();else newGame();};
window.addEventListener('keydown',e=>{const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',q:'left',z:'up'};if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select')||$('online-dialog').open)return;if(directions[e.key]){e.preventDefault();play(directions[e.key]);}});
let touch=null;
function swipePoint(id,x,y){if(!touch||touch.id!==id||touch.used)return;const dx=x-touch.x,dy=y-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))<14)return;touch.used=true;play(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');}
if(window.PointerEvent){
 $('board').addEventListener('pointerdown',e=>{if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)||touch)return;unlockAudio();touch={x:e.clientX,y:e.clientY,id:e.pointerId,used:false};try{$('board').setPointerCapture(e.pointerId);}catch{}});
 $('board').addEventListener('pointermove',e=>swipePoint(e.pointerId,e.clientX,e.clientY),{passive:true});
 $('board').addEventListener('pointerup',e=>{if(touch?.id!==e.pointerId)return;swipePoint(e.pointerId,e.clientX,e.clientY);touch=null;});
 for(const event of ['pointercancel','lostpointercapture'])$('board').addEventListener(event,e=>{if(touch?.id===e.pointerId)touch=null;});
}else{
 $('board').addEventListener('touchstart',e=>{if(touch||e.touches.length!==1)return;const p=e.changedTouches[0];unlockAudio();touch={x:p.clientX,y:p.clientY,id:p.identifier,used:false};},{passive:true});
 $('board').addEventListener('touchmove',e=>{if(!touch)return;const p=Array.from(e.changedTouches).find(p=>p.identifier===touch.id);if(!p)return;if(e.cancelable)e.preventDefault();swipePoint(p.identifier,p.clientX,p.clientY);},{passive:false});
 for(const event of ['touchend','touchcancel'])$('board').addEventListener(event,e=>{if(!touch)return;const p=Array.from(e.changedTouches).find(p=>p.identifier===touch.id);if(!p)return;if(event==='touchend')swipePoint(p.identifier,p.clientX,p.clientY);touch=null;},{passive:true});
}
window.addEventListener('blur',()=>{touch=null;});
let boardResizeFrame;
function resizeBoard(){cancelAnimationFrame(boardResizeFrame);boardResizeFrame=requestAnimationFrame(()=>{const width=$('board').getBoundingClientRect().width;if(boardGeometry&&Math.abs(boardGeometry.width-width)>.5){touch=null;boardGeometry=null;draw();}});}
if(window.ResizeObserver)new ResizeObserver(resizeBoard).observe($('board'));else window.addEventListener('resize',resizeBoard);
const saved=storage.get('fusion-game',null);if(saved&&Array.isArray(saved.board)&&saved.board.length===16&&saved.board.every(v=>Number.isSafeInteger(v)&&v>=0&&(v===0||(v>=2&&Number.isInteger(Math.log2(v)))))&&saved.board.some(v=>v)&&Number.isSafeInteger(saved.score)&&saved.score>=0&&Number.isSafeInteger(saved.moves)&&saved.moves>=0){board=saved.board;score=saved.score;moves=saved.moves;ruleState=saved.meta||modeRules.create('classic',Date.now());won=!!saved.won;continuing=!!saved.continuing;best=Math.max(best,score);draw();if(won&&!continuing)showEnd(true);else if(!rules.canMove(board))showEnd(false);}else newGame(false);

function updateRule(result,at){modeRules.expire(ruleState,at);if(!ruleState.endedAt)modeRules.fusion(ruleState,result,at);}
function showModeEnd(){
 if(window.FusionOnline?.duel)return;
 resetCombo();$('overlay').hidden=false;
 const reason=ruleState.reason;
 if(reason==='target')window.FusionSkins?.progress({score,mode:ruleState.mode,elapsed:ruleState.endedAt-ruleState.startedAt,finished:true});
 $('end-title').textContent=reason==='target'?'Objectif atteint !':reason==='combo'?'Combo perdu.':'Temps écoulé !';
 $('end-text').textContent=reason==='combo'?`Tu avais 2 secondes pour fusionner. Score : ${score}.`:`${score} points · ${modeRules.get(ruleState.mode).name}`;
 $('end-action').textContent='Rejouer ↗';$('announcement').textContent=$('end-title').textContent;
}
function tickRules(){
 const previous=ruleState.endedAt;modeRules.expire(ruleState,gameNow());
 const mode=modeRules.get(ruleState.mode);let label=mode.name+' · ';
 if(ruleState.endedAt)label+=ruleState.reason==='victory'?'Victoire !':ruleState.reason==='draw'?'Égalité':ruleState.reason==='combo'?'Combo perdu !':ruleState.reason==='target'?'Objectif atteint !':'Temps écoulé';
 else if(mode.id==='sudden')label+=ruleState.comboDeadline?Math.max(0,(ruleState.comboDeadline-gameNow())/1000).toFixed(1)+' s pour fusionner':'Première fusion → chrono de 2 s';
 else if(ruleState.endsAt)label+=Math.ceil(Math.max(0,ruleState.endsAt-gameNow())/1000)+' s restantes';
 else label+=mode.race?'Crée une tuile '+mode.target:'À ton rythme';
 const goal=mode.id==='sudden'?'Survivre':mode.id==='sprint'?'60 s':mode.race?String(mode.target):'2048';if($('goal-value')&&$('goal-value').textContent!==goal)$('goal-value').textContent=goal;
 if($('mode-state').textContent!==label)$('mode-state').textContent=label;
 if(!previous&&ruleState.endedAt){showModeEnd();save();}
}
setInterval(tickRules,100);tickRules();
window.FusionUI={
 get state(){return {board:[...board],score,moves};},
 get mode(){return ruleState.mode;},
 get canMove(){tickRules();return !ruleState.endedAt;},
 nextMeta(result,at){const meta={...ruleState};modeRules.expire(meta,at);if(!meta.endedAt){modeRules.fusion(meta,result,at);if(modeRules.get(meta.mode).race&&result.board.some(v=>v>=modeRules.get(meta.mode).target)){meta.endedAt=at;meta.reason='target';}}return meta;},
 remoteRule(meta){if(!meta)return;const previous=ruleState.mode;if(previous!==meta.mode){ruleState={...meta};resetCombo();}else{ruleState.endsAt=meta.endsAt;ruleState.comboDeadline=Math.max(ruleState.comboDeadline||0,meta.comboDeadline||0)||null;if(meta.endedAt){ruleState.endedAt=meta.endedAt;ruleState.reason=meta.reason;}}tickRules();},
 load(game){generation++;resetCombo();locked=false;board=[...game.board];score=game.score;moves=game.moves;won=!!game.won;continuing=true;ruleState=game.meta?{...game.meta}:modeRules.create('classic',gameNow());best=Number(storage.get('fusion-best-'+ruleState.mode,0))||0;$('overlay').hidden=true;draw();tickRules();if(ruleState.endedAt)showModeEnd();},
 confirmScore(value){best=Math.max(best,value||0);$('best').textContent=best;},
 animate(payload,{duel=false}={}){
  const {game,result,spawned}=payload;
  board=game.board;score=game.score;moves=game.moves;if(game.meta)ruleState={...game.meta};
  if(!duel)best=Math.max(best,payload.best||0);
  draw(result.merges,spawned,result);sfx('move');fusionFeedback(result);
  if(ruleState.endedAt)showModeEnd();
  else if(!duel){if(ruleState.mode==='classic'&&game.won&&!won){won=true;continuing=false;showEnd(true);}else if(!rules.canMove(board))showEnd(false);}
  else if(!rules.canMove(board))$('status').textContent='Grille bloquée. Ton score reste en jeu !';
  tickRules();
 },audio:unlockAudio,newGame
};
