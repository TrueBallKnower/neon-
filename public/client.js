const $=id=>document.getElementById(id);
const rules=window.FusionRules;
const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
let board=Array(16).fill(0),score=0,best=Number(storage.get('fusion-best',0))||0,moves=0,locked=false,won=false,continuing=false,generation=0;
let comboCount=0,comboUntil=0,comboFrame=0;
const COMBO_WINDOW=1500;
function resetCombo(){comboCount=0;comboUntil=0;cancelAnimationFrame(comboFrame);$('combo').hidden=true;}
function animateCombo(){const left=Math.max(0,comboUntil-performance.now());$('combo-bar').style.width=(left/COMBO_WINDOW*100)+'%';if(left>0)comboFrame=requestAnimationFrame(animateCombo);else resetCombo();}
function advanceCombo(){const now=performance.now();comboCount=now<comboUntil?comboCount+1:1;comboUntil=now+COMBO_WINDOW;cancelAnimationFrame(comboFrame);$('combo').hidden=false;$('combo-label').textContent=comboCount>1?`COMBO ×${comboCount}`:'PREMIÈRE ÉTINCELLE';$('combo-hint').textContent=comboCount>=5?'EN FEU !':'ENCHAÎNE LES FUSIONS';$('combo').classList.toggle('hot',comboCount>=5);animateCombo();return comboCount;}
let soundOn=storage.get('fusion-sound',true),audio;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function unlockAudio(){try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function tone(freq,time,duration,type='sine',volume=.08,slide){if(!audio||!soundOn)return;const osc=audio.createOscillator(),amp=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,time);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,time+duration);amp.gain.setValueAtTime(.001,time);amp.gain.exponentialRampToValueAtTime(volume,time+.012);amp.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(amp);amp.connect(audio.destination);osc.start(time);osc.stop(time+duration+.02);}
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
function draw(merges=[],spawned=-1){$('tiles').replaceChildren();board.forEach((value,i)=>{if(!value)return;const el=document.createElement('div');el.className='tile'+(merges.includes(i)?' merge':i===spawned?' spawn':'');el.dataset.value=value;el.dataset.index=i;el.style.setProperty('--x',i%4);el.style.setProperty('--y',Math.floor(i/4));el.setAttribute('role','gridcell');el.setAttribute('aria-label',`${value}, ligne ${Math.floor(i/4)+1}, colonne ${i%4+1}`);const inside=document.createElement('div');inside.className='tile-inner';inside.textContent=value;el.append(inside);$('tiles').append(el);});$('score').textContent=score;$('best').textContent=best;$('moves').textContent=`${moves} MOUVEMENT${moves>1?'S':''}`;}
function particles(index){if(reduced)return;const tile=$('tiles').querySelector(`[data-index="${index}"]`);if(!tile)return;const rect=tile.getBoundingClientRect(),base=$('board').getBoundingClientRect(),color=getComputedStyle(tile).getPropertyValue('--tile-color')||'#c2eea3';for(let n=0;n<12;n++){const p=document.createElement('i');p.className='particle';p.style.left=rect.left-base.left+rect.width/2+'px';p.style.top=rect.top-base.top+rect.height/2+'px';p.style.setProperty('--color',color);const angle=n*Math.PI/6;p.style.setProperty('--dx',Math.cos(angle)*(35+Math.random()*45)+'px');p.style.setProperty('--dy',Math.sin(angle)*(35+Math.random()*45)+'px');$('particles').append(p);setTimeout(()=>p.remove(),650);}}
function save(){storage.set('fusion-game',{board,score,moves,won,continuing});storage.set('fusion-best',best);}
function showEnd(win){resetCombo();$('end-title').textContent=win?'La consécration.':'Fin de la partie.';$('end-text').textContent=win?'2048 ! Le sommet est à toi. Et si tu allais plus loin ?':`${score.toLocaleString('fr-FR')} points. Une nouvelle étincelle t’attend.`;$('end-action').textContent=win?'Continuer ↗':'Rejouer ↗';$('overlay').hidden=false;$('announcement').textContent=$('end-title').textContent;sfx(win?'win':'over');}
function newGame(withSound=true){generation++;resetCombo();locked=false;board=Array(16).fill(0);score=0;moves=0;won=false;continuing=false;$('overlay').hidden=true;$('particles').replaceChildren();$('score-add').textContent='';$('status').textContent='À toi de jouer';spawn();const added=spawn();draw([],added);save();if(withSound){unlockAudio();sfx('start');}}
// Animate existing tiles before replacing the merged/spawned tiles. The Web
// Animations API avoids snapping when a move follows a fresh render.
async function slide(result){
 if(reduced||!result.changed)return;
 const animations=[];
 for(const {from,to} of result.transitions){
  const el=$('tiles').querySelector(`[data-index="${from}"]`);if(!el||from===to)continue;
  const gap=parseFloat(getComputedStyle($('cells')).gap)||12;
  const x=(to%4)*(el.offsetWidth+gap),y=Math.floor(to/4)*(el.offsetHeight+gap);
  const animation=el.animate([{transform:getComputedStyle(el).transform},{transform:`translate(${x}px,${y}px)`}],{duration:190,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'});
  animations.push(animation.finished.catch(()=>{}));
 }
 await Promise.all(animations);
}
let inputBusy=false,pendingDirection=null;
async function play(direction){
 if(inputBusy){pendingDirection=direction;return;}
 inputBusy=true;
 try{await performMove(direction);}finally{inputBusy=false;const next=pendingDirection;pendingDirection=null;if(next)play(next);}
}
async function performMove(direction){
 if(window.FusionOnline?.ranked||window.FusionOnline?.duel)return window.FusionOnline.move(direction);
 if(locked||!$('overlay').hidden)return;
 unlockAudio();const result=rules.move(board,direction);
 if(!result.changed){if(!rules.canMove(board))showEnd(false);return;}
 locked=true;const run=generation;sfx('move');await slide(result);if(run!==generation)return;
 board=result.board;score+=result.gain;best=Math.max(score,best);moves++;const added=spawn();draw(result.merges,added);
 fusionFeedback(result);
 if(!won&&board.some(v=>v>=2048)){won=true;showEnd(true);}else if(!rules.canMove(board))showEnd(false);
 save();$('announcement').textContent=`Score ${score}. ${result.merges.length} fusion(s).`;locked=false;
}
function fusionFeedback(result){
 if(result.gain){const high=Math.max(...result.merges.map(i=>board[i]));sfx('merge',high,advanceCombo());result.merges.forEach(particles);$('status').textContent=high>=128?'Fusion survoltée !':'Belle fusion !';const el=$('score-add');el.textContent='+'+result.gain;el.classList.remove('score-float');void el.offsetWidth;el.classList.add('score-float');}
 else $('status').textContent='Trouve la prochaine fusion';
}
$('restart').onclick=()=>{if(window.FusionOnline?.ranked||window.FusionOnline?.duel){window.FusionOnline.restart();return;}if(moves>0&&!confirm('Recommencer cette partie ? Ton record sera conservé.'))return;newGame();};$('end-action').onclick=()=>{unlockAudio();if(won&&!continuing){continuing=true;$('overlay').hidden=true;save();}else if(window.FusionOnline?.ranked)window.FusionOnline.restart();else newGame();};
window.addEventListener('keydown',e=>{const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',q:'left',z:'up'};if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select')||$('online-dialog').open)return;if(directions[e.key]){e.preventDefault();play(directions[e.key]);}});
let touch=null;$('board').addEventListener('pointerdown',e=>{if(!e.isPrimary)return;unlockAudio();touch={x:e.clientX,y:e.clientY,id:e.pointerId};$('board').setPointerCapture(e.pointerId);});$('board').addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;play(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});$('board').addEventListener('pointercancel',()=>touch=null);
const saved=storage.get('fusion-game',null);if(saved&&Array.isArray(saved.board)&&saved.board.length===16&&saved.board.every(v=>Number.isSafeInteger(v)&&v>=0&&(v===0||(v>=2&&Number.isInteger(Math.log2(v)))))&&saved.board.some(v=>v)&&Number.isSafeInteger(saved.score)&&saved.score>=0&&Number.isSafeInteger(saved.moves)&&saved.moves>=0){board=saved.board;score=saved.score;moves=saved.moves;won=!!saved.won;continuing=!!saved.continuing;best=Math.max(best,score);draw();if(won&&!continuing)showEnd(true);else if(!rules.canMove(board))showEnd(false);}else newGame(false);

window.FusionUI={
 get state(){return {board:[...board],score,moves};},
 load(game){generation++;pendingDirection=null;resetCombo();locked=false;board=game.board;score=game.score;moves=game.moves;won=!!game.won;continuing=true;$('overlay').hidden=true;draw();},
 slide,
 async animate(payload,{slid=false,duel=false}={}){
  const {game,result,spawned}=payload;
  if(!slid)await slide(result);
  board=game.board;score=game.score;moves=game.moves;
  if(!duel)best=Math.max(best,payload.best||0);
  draw(result.merges,spawned);fusionFeedback(result);
  if(!duel){if(game.won&&!won){won=true;continuing=false;showEnd(true);}else if(!rules.canMove(board))showEnd(false);}
  else if(!rules.canMove(board))$('status').textContent='Grille bloquée. Ton score reste en jeu !';
 },audio:unlockAudio,newGame
};
