(()=>{
 const el=id=>document.getElementById(id);let account=null,busy=false,polling=false,current=null,serverOffset=0,lastPollAt=0;
 const online=window.FusionOnline={ranked:false,duel:null};
 let lastClock=0;online.now=()=>lastClock=Math.max(lastClock,Date.now()+serverOffset);
 let selectedMode='classic';
 let optimistic=null;
 function snapshot(data){return{game:data.duel?gameOf(data.duel):data.game,data,terminal:data.duel?.status==='finished'||!!data.game?.meta?.endedAt};}
 const sync=new window.FusionMoveSync({
  request:async body=>{
   try{return snapshot(await api(online.duel?'duels/'+online.duel+'/move':'move',body));}
   catch(error){if(error.duel||error.game)error.snapshot=snapshot({duel:error.duel,game:error.game});throw error;}
  },
  read:async()=>snapshot(await api(online.duel?'duels/'+online.duel:'game')),
  onAck:({data})=>{window.FusionSkins?.wallet(data.wallet);if(data.duel)updateDuel(data.duel);else if(data.best!==undefined){account.best=data.best;window.FusionUI.confirmScore(data.best);}},
  onReset:({game,data})=>{optimistic=null;window.FusionUI.load(game);if(data.duel)updateDuel(data.duel);el('status').textContent='Partie synchronisée.';},
  onStatus:state=>{if(state==='offline')el('status').textContent='Hors ligne : tu peux continuer, reconnexion automatique…';else if(state==='retrying')el('status').textContent='Reconnexion automatique…';else if(/^(Hors ligne|Reconnexion)/.test(el('status').textContent))el('status').textContent='Connexion rétablie.';}
 });
 function resetPrediction(game){sync.configure(game);optimistic=null;}
 Object.defineProperty(online,'syncState',{get:()=>({pending:sync.pending.length,sending:!!sync.task})});
 window.addEventListener('online',()=>sync.resume());
 window.addEventListener('pageshow',event=>{if(event.persisted)sync.resume();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync.resume();});
 const readRoom=()=>{try{return localStorage.getItem('fusion-duel')}catch{return null}};
 function remember(code){try{if(localStorage.getItem('fusion-duel')===code)return;if(code)localStorage.setItem('fusion-duel',code);else localStorage.removeItem('fusion-duel');}catch{}}
 async function api(url,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch('/api/'+url,{signal:controller.signal,method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(data.serverNow)serverOffset=data.serverNow-Date.now();if(!response.ok){const error=Error(data.error||'Serveur indisponible.');error.status=response.status;error.duel=data.duel;error.game=data.game;throw error;}return data;}finally{clearTimeout(timeout);}
 }
 function text(id,value){const node=el(id),next=String(value);if(node.textContent!==next)node.textContent=next;}
 function message(text){el('online-message').textContent=text;}
 function render(){window.FusionSkins?.session(account);document.body.classList.toggle('dueling',!!online.duel);el('account-form').hidden=!!account;el('signed-in').hidden=!account;el('account-greeting').textContent=account?`Salut ${account.username} ! Record classé : ${account.best}.`:'';el('online-status').textContent=online.duel?'Duel · '+account.username:online.ranked?`Classé · ${account.username}`:account?`${account.username} · mode libre`:'Mode libre';el('restart').disabled=!!online.duel;}
 function open(panel){for(const name of ['account','leaderboard','duel','mode','friends','skins','story'])el(name+'-panel').hidden=panel!==name;message('');if(!el('online-dialog').open)el('online-dialog').showModal();}
 function gameOf(duel){return{board:duel.me.board,score:duel.me.score,moves:duel.me.moves,won:false,spawnSeed:duel.me.spawnSeed,spawnPlan:duel.me.spawnPlan,meta:{mode:duel.mode||'classic',startedAt:duel.startsAt||duel.serverNow,endsAt:duel.endsAt,comboDeadline:duel.me.comboDeadline||null,endedAt:duel.status==='finished'?duel.serverNow:null,reason:duel.status==='finished'&&duel.winner===duel.me.id?'victory':duel.status==='finished'&&duel.winner===null?'draw':duel.reason}};}
 function statusNow(){if(!current)return null;if(current.status==='finished')return'finished';if(!current.startsAt)return'waiting';const now=Date.now()+serverOffset;return now<current.startsAt?'countdown':now>=current.endsAt?'finished':'playing';}
 function clock(){
  if(!current)return;const status=statusNow(),now=Date.now()+serverOffset;
  const remaining=status==='waiting'?300000:status==='countdown'?current.startsAt-now:Math.max(0,current.endsAt-now);
  const seconds=Math.ceil(remaining/1000),label=status==='countdown'?String(seconds):`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;if(el('duel-clock').textContent!==label)el('duel-clock').textContent=label;
  let message;
  if(status==='waiting')message='Salon '+current.code+' · En attente de ton ami…';
  else if(status==='countdown')message='Prépare-toi ! Départ dans '+seconds+'…';
  else if(status==='finished'){
   if(current.status!=='finished')message='Temps écoulé · Vérification du résultat…';
   else{message=current.winner===null?'Égalité !':current.winner===current.me.id?'Victoire ! Tu remportes le duel.':'Ton adversaire remporte le duel.';if(current.forfeit)message+=' (Abandon)';else if(current.reason==='combo')message+=current.winner===null?' Les deux combos ont expiré.':current.winner===current.me.id?' Ton adversaire a perdu son combo.':' Ton combo a expiré.';else if(current.reason==='target')message+=' Tuile '+window.FusionModes.get(current.mode).target+' atteinte.';}
  }else message=current.me.blocked?'Grille bloquée : ton score reste en jeu jusqu’à la fin.':current.mode==='sudden'?'La première fusion arme les 2 chronos : fusionne toutes les 2 s !':window.FusionModes.get(current.mode).race?'Le premier à créer une tuile '+window.FusionModes.get(current.mode).target+' gagne.':current.mode==='sprint'?'60 secondes : le plus grand score gagne.':'Le plus grand score au bout de 5 minutes gagne.';
  if(el('duel-result').textContent!==message)el('duel-result').textContent=message;
 }
 function updateDuel(duel,{load=false}={}){
  const entering=online.duel!==duel.code;
  window.FusionRoyal?.observe(duel);
  if(current&&current.code!==duel.code)load=true;
  if(duel.nextCode){followRematch(duel.nextCode);return;}
  if(duel.status==='finished')optimistic=null;window.FusionUI.remoteRule(gameOf(duel).meta);current=duel;online.duel=duel.code;online.ranked=false;serverOffset=duel.serverNow-Date.now();remember(duel.code);
  el('duel-hud').hidden=false;text('duel-you',duel.me.name);text('duel-opponent',duel.opponent?.name||'En attente…');text('duel-my-score',optimistic?.score??duel.me.score);text('duel-their-score',duel.opponent?.score||0);
  text('duel-mode-help',window.FusionModes.get(duel.mode).name+' · '+window.FusionModes.get(duel.mode).description);el('duel-invite').hidden=duel.status!=='waiting';text('duel-room-code',duel.code);
  const series=duel.series;text('series-score',duel.opponent?`Série · ${duel.me.name} ${series?.wins[duel.me.id]||0} — ${series?.wins[duel.opponent.id]||0} ${duel.opponent.name} · ${series?.draws||0} égalité(s) · Manche ${series?.round||1}`:'');
  el('duel-rematch').hidden=duel.status!=='finished'||!duel.opponent;el('duel-rematch').disabled=!!duel.rematchVotes?.includes(duel.me.id);text('duel-rematch',duel.rematchVotes?.includes(duel.me.id)?'En attente de ton adversaire…':duel.rematchVotes?.length?'Accepter la revanche':'Proposer une revanche');
  if(load){resetPrediction(gameOf(duel));window.FusionUI.load(gameOf(duel));text('duel-my-score',duel.me.score);}if(entering||load)render();clock();
 }
 async function leave(){
  if(!online.duel)return true;
  if(statusNow()!=='finished'&&!confirm('Quitter le duel ? Tu abandonneras cette partie.'))return false;
  await api('duels/'+online.duel+'/leave',{});resetPrediction();online.duel=null;current=null;remember(null);el('duel-hud').hidden=true;el('duel-invite').hidden=true;window.FusionUI.newGame(false);render();return true;
 }
 let lastRace='rush512';
 const raceCard=document.createElement('button');raceCard.type='button';raceCard.className='mode-card';raceCard.dataset.category='race';raceCard.setAttribute('aria-expanded','false');raceCard.setAttribute('aria-controls','race-section');raceCard.setAttribute('aria-pressed','false');
 const raceTitle=document.createElement('strong'),raceDescription=document.createElement('span');raceTitle.textContent='Course';raceDescription.textContent='Choisis ton objectif, de 128 à 2048.';raceCard.append(raceTitle,raceDescription);
 function selectMode(id){
  selectedMode=id;const mode=window.FusionModes.get(id);
  for(const node of el('mode-cards').children)node.setAttribute('aria-pressed',String(node===raceCard?!!mode.race:node.dataset.mode===id));
  for(const node of el('race-targets').children)node.setAttribute('aria-pressed',String(node.dataset.mode===id));
  for(const target of ['ranked-mode','duel-mode','leaderboard-mode'])el(target).value=id;
  if(mode.race){lastRace=id;raceDescription.textContent='Objectif sélectionné : '+mode.target;}else{el('race-section').hidden=true;raceCard.setAttribute('aria-expanded','false');}
 }
 for(const target of ['ranked-mode','duel-mode','leaderboard-mode']){
  const races=document.createElement('optgroup');races.label='Courses · objectif';
  for(const [id,mode]of Object.entries(window.FusionModes.definitions)){const option=document.createElement('option');option.value=id;option.textContent=mode.race?String(mode.target):mode.name;if(mode.race)races.append(option);else el(target).append(option);}
  el(target).append(races);
 }
 for(const [id,mode]of Object.entries(window.FusionModes.definitions)){
  if(mode.race){const button=document.createElement('button');button.type='button';button.className='race-target';button.dataset.mode=id;button.textContent=mode.target;button.setAttribute('aria-pressed','false');button.onclick=()=>selectMode(id);el('race-targets').append(button);continue;}
  const card=document.createElement('button');card.type='button';card.className='mode-card';card.dataset.mode=id;card.setAttribute('aria-pressed',String(id===selectedMode));const title=document.createElement('strong'),description=document.createElement('span');title.textContent=mode.name;description.textContent=mode.description;card.append(title,description);card.onclick=()=>selectMode(id);el('mode-cards').append(card);
 }
 raceCard.onclick=()=>{const expand=el('race-section').hidden;selectMode(lastRace);el('race-section').hidden=!expand;raceCard.setAttribute('aria-expanded',String(expand));};el('mode-cards').append(raceCard);
 el('modes-open').onclick=()=>open('mode');
 el('free-start').onclick=async()=>{if(busy)return;busy=true;try{if(!await leave())return;resetPrediction();online.ranked=false;window.FusionUI.newGame(true,selectedMode);render();el('online-dialog').close();}catch(error){message(error.message);}finally{busy=false;}};
 el('mode-ranked').onclick=()=>{open('account');if(!account)message('Connecte-toi pour jouer en mode classé.');};
 el('mode-duel').onclick=()=>open('duel');
 el('duel-mode').onchange=()=>{el('duel-mode-help').textContent=window.FusionModes.get(el('duel-mode').value).description;};
 el('leaderboard-mode').onchange=()=>el('leaderboard-open').onclick();
 el('account-open').onclick=()=>{render();open('account');};el('dialog-close').onclick=()=>el('online-dialog').close();
 async function authenticate(register){if(busy)return;busy=true;message('Connexion…');try{const data=await api(register?'register':'login',{username:el('account-name').value,password:el('account-password').value});account=data.user;el('account-password').value='';render();message('Connecté. Lance une partie classée ou ouvre Duel 1v1.');}catch(e){message(e.message);}finally{busy=false;}}
 el('account-form').onsubmit=e=>{e.preventDefault();authenticate(false);};el('register').onclick=()=>{if(el('account-form').reportValidity())authenticate(true);};
 el('logout').onclick=async()=>{if(busy)return;try{if(!await leave())return;resetPrediction();await api('logout',{});online.ranked=false;account=null;window.FusionUI.newGame(false);render();message('Déconnecté.');}catch(e){message(e.message);}};
 async function start(){if(busy)return;busy=true;try{if(!await leave())return;resetPrediction();window.FusionUI.audio();const {game,best}=await api('game',{mode:el('ranked-mode').value});online.ranked=true;resetPrediction(game);window.FusionUI.load(game);window.FusionUI.confirmScore(best);render();el('online-dialog').close();}catch(e){message(e.message);}finally{busy=false;}}
 el('ranked-start').onclick=start;online.restart=()=>{if(online.duel)return;if(confirm('Recommencer ta partie classée ?'))start();};
 online.move=direction=>{
  if(busy||!window.FusionUI.canMove||!el('overlay').hidden)return;
  if(online.duel&&statusNow()!=='playing')return;
  const inDuel=!!online.duel,before=window.FusionUI.state,at=Math.floor(online.now());
  const result=window.FusionRules.move(before.board,direction);if(!result.changed)return;
  const ticket=sync.token(before.moves);
  if(!ticket){el('status').textContent='Mise à jour nécessaire : recharge la page.';sync.resume();return;}
  const spawned=window.FusionRules.spawnTicket(result.board,ticket);
  const game={board:result.board,score:before.score+result.gain,moves:before.moves+1,won:result.board.some(v=>v>=2048),meta:window.FusionUI.nextMeta(result,at)};
  if(!sync.enqueue({direction,before,after:game,at})){el('status').textContent='Longue coupure réseau : reconnexion en cours…';return;}
  optimistic=game;window.FusionUI.audio();window.FusionUI.animate({game,result,spawned},{duel:inDuel});
  if(inDuel)el('duel-my-score').textContent=game.score;
 };
 el('leaderboard-open').onclick=async()=>{open('leaderboard');const list=el('leaderboard-list');list.replaceChildren();message('Chargement…');try{const {entries}=await api('leaderboard?mode='+el('leaderboard-mode').value);for(const [index,entry]of entries.entries()){const row=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=`${index+1}. ${entry.username}${index===0&&el('leaderboard-mode').value==='classic'?' ♛':''}`;score.textContent=entry.best.toLocaleString('fr-FR');row.append(name,score);list.append(row);}message(entries.length?'':'Le classement attend son premier champion.');}catch(e){message(e.message);}};
 el('duel-open').onclick=()=>{open('duel');if(!account)message('Connecte-toi via Mon compte pour créer ou rejoindre un duel.');};
 async function enter(create){if(busy)return;if(!account){open('account');message('Connecte-toi pour jouer en duel.');return;}busy=true;try{if(!await leave())return;resetPrediction();const data=await api(create?'duels':'duels/'+el('duel-code').value.trim().toUpperCase()+'/join',create?{mode:el('duel-mode').value}:{});updateDuel(data.duel,{load:true});if(!create)el('online-dialog').close();message(create?'Ton salon est prêt ! Partage le code ou le lien.':'');}catch(e){message(e.message);}finally{busy=false;}}
 el('duel-create').onclick=()=>enter(true);el('duel-join-form').onsubmit=e=>{e.preventDefault();enter(false);};el('duel-back').onclick=()=>el('online-dialog').close();
 el('duel-copy').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('duel',online.duel);try{await navigator.clipboard.writeText(url.toString());message('Lien copié !');}catch{message('Partage ce code : '+online.duel);}};
 el('duel-leave').onclick=async()=>{if(busy)return;busy=true;try{await leave();}catch(e){el('duel-result').textContent=e.message;}finally{busy=false;}};
 let following=false;
 async function followRematch(code){if(following)return;following=true;try{const {duel}=await api('duels/'+code);updateDuel(duel,{load:true});}catch(e){el('duel-result').textContent=e.message;}finally{following=false;}}
 el('duel-rematch').onclick=async()=>{if(busy)return;busy=true;try{const {duel}=await api('duels/'+online.duel+'/rematch',{});updateDuel(duel);}catch(e){el('duel-result').textContent=e.message;}finally{busy=false;}};
 online.social={api,open,async prepareStory(){if(!await leave())return false;resetPrediction();online.ranked=false;render();return true;},isSignedIn:()=>!!account,async enter(code){if(busy)return false;busy=true;try{if(online.duel===code){el('online-dialog').close();return true;}if(!await leave())return false;const {duel}=await api('duels/'+code+'/join',{});updateDuel(duel,{load:true});el('online-dialog').close();return true;}finally{busy=false;}}};
 setInterval(clock,100);
 setInterval(async()=>{if(document.hidden||!online.duel||busy||polling||sync.task||sync.pending.length)return;const delay=current?.mode==='sudden'?250:1000;if(Date.now()-lastPollAt<delay)return;lastPollAt=Date.now();polling=true;const room=online.duel;try{const {duel}=await api('duels/'+room);if(room===online.duel&&!sync.task&&!sync.pending.length&&!busy)updateDuel(duel);}catch(e){el('duel-result').textContent='Connexion interrompue. Nouvelle tentative…';}finally{polling=false;}},250);
 api('me').then(async data=>{
  account=data.user;render();const invite=new URL(location.href).searchParams.get('duel');
  if(invite&&/^[a-f0-9]{10}$/i.test(invite)){el('duel-code').value=invite.toUpperCase();open('duel');if(!account)message('Connecte-toi via Mon compte, puis rejoins le duel.');}
  else if(account&&readRoom()){try{const {duel}=await api('duels/'+readRoom());updateDuel(duel,{load:true});}catch{remember(null);}}
 }).catch(()=>{el('online-status').textContent='Mode libre · serveur hors ligne';});
})();
