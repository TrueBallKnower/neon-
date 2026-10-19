(()=>{
 const el=id=>document.getElementById(id);let account=null,busy=false,polling=false,current=null,serverOffset=0;
 const online=window.FusionOnline={ranked:false,duel:null};
 let pending=[],sending=null,recovering=false,optimistic=null;
 const tickets=new Map();
 function acceptPlan(plan){if(!plan)return;plan.tiles.forEach((tile,i)=>tickets.set(plan.from+i,tile));for(const key of tickets.keys())if(key<plan.from-32)tickets.delete(key);}
 function resetPrediction(game){recovering=false;tickets.clear();pending=[];optimistic=null;acceptPlan(game?.spawnPlan);}
 async function drain(){if(sending)await sending;}
 function pump(){
  if(sending||!pending.length||recovering)return;
  const inDuel=!!online.duel,room=online.duel;
  sending=(async()=>{
   try{
    while(pending.length){
     const batch=pending.slice(0,32),last=batch.at(-1);
     const data=await api(inDuel?'duels/'+room+'/move':'move',{directions:batch.map(item=>item.direction),baseMoves:batch[0].before.moves,baseBoard:batch[0].before.board});
     const confirmed=inDuel?gameOf(data.duel):data.game;
     if(confirmed.moves!==last.after.moves||confirmed.score!==last.after.score||confirmed.board.some((v,i)=>v!==last.after.board[i]))throw Object.assign(Error('Partie resynchronisée.'),{game:data.game,duel:data.duel});
     pending.splice(0,batch.length);acceptPlan(confirmed.spawnPlan);
     if(inDuel)updateDuel(data.duel);else{account.best=data.best;window.FusionUI.confirmScore(data.best);render();}
    }
   }catch(error){
    recovering=true;pending=[];
    try{
     const data=error.duel?{duel:error.duel}:error.game?{game:error.game}:await api(inDuel?'duels/'+room:'game');
     const game=inDuel?gameOf(data.duel):data.game;resetPrediction(game);
     if(inDuel)updateDuel(data.duel,{load:true});else if(game)window.FusionUI.load(game);
     el('status').textContent='Partie resynchronisée.';
    }catch{el('status').textContent='Connexion perdue. Recharge la page pour reprendre.';return;}
    recovering=false;
   }
  })().finally(()=>{sending=null;if(pending.length)pump();});
 }

 const readRoom=()=>{try{return localStorage.getItem('fusion-duel')}catch{return null}};
 function remember(code){try{if(localStorage.getItem('fusion-duel')===code)return;if(code)localStorage.setItem('fusion-duel',code);else localStorage.removeItem('fusion-duel');}catch{}}
 async function api(url,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch('/api/'+url,{signal:controller.signal,method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(!response.ok){const error=Error(data.error||'Serveur indisponible.');error.status=response.status;error.duel=data.duel;error.game=data.game;throw error;}return data;}finally{clearTimeout(timeout);}
 }
 function message(text){el('online-message').textContent=text;}
 function render(){el('account-form').hidden=!!account;el('signed-in').hidden=!account;el('account-greeting').textContent=account?`Salut ${account.username} ! Record classé : ${account.best}.`:'';el('online-status').textContent=online.duel?'Duel · '+account.username:online.ranked?`Classé · ${account.username}`:account?`${account.username} · mode libre`:'Mode libre';el('restart').disabled=!!online.duel;}
 function open(panel){for(const name of ['account','leaderboard','duel'])el(name+'-panel').hidden=panel!==name;message('');if(!el('online-dialog').open)el('online-dialog').showModal();}
 function gameOf(duel){return{board:duel.me.board,score:duel.me.score,moves:duel.me.moves,won:false,spawnPlan:duel.me.spawnPlan};}
 function statusNow(){if(!current)return null;if(current.status==='finished')return'finished';if(!current.startsAt)return'waiting';const now=Date.now()+serverOffset;return now<current.startsAt?'countdown':now>=current.endsAt?'finished':'playing';}
 function clock(){
  if(!current)return;const status=statusNow(),now=Date.now()+serverOffset;
  const remaining=status==='waiting'?300000:status==='countdown'?current.startsAt-now:Math.max(0,current.endsAt-now);
  const seconds=Math.ceil(remaining/1000),label=status==='countdown'?String(seconds):`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;if(el('duel-clock').textContent!==label)el('duel-clock').textContent=label;
  if(status==='waiting')el('duel-result').textContent='Salon '+current.code+' · En attente de ton ami…';
  else if(status==='countdown')el('duel-result').textContent='Prépare-toi ! Départ dans '+seconds+'…';
  else if(status==='finished'){
   if(current.status!=='finished'){el('duel-result').textContent='Temps écoulé · Vérification du résultat…';return;}
   el('duel-result').textContent=current.winner===null?'Égalité !':current.winner===current.me.id?'Victoire ! Tu remportes le duel.':'Ton adversaire remporte le duel.';
   if(current.forfeit)el('duel-result').textContent+=' (Abandon)';
  }else el('duel-result').textContent=current.me.blocked?'Grille bloquée : ton score reste en jeu jusqu’à la fin.':'Le plus grand score au bout de 5 minutes gagne.';
 }
 function updateDuel(duel,{load=false}={}){
  if(duel.status==='finished')optimistic=null;current=duel;online.duel=duel.code;online.ranked=false;serverOffset=duel.serverNow-Date.now();remember(duel.code);
  el('duel-hud').hidden=false;el('duel-you').textContent=duel.me.name;el('duel-opponent').textContent=duel.opponent?.name||'En attente…';el('duel-my-score').textContent=optimistic?.score??duel.me.score;el('duel-their-score').textContent=duel.opponent?.score||0;
  el('duel-invite').hidden=duel.status!=='waiting';el('duel-room-code').textContent=duel.code;
  if(load){resetPrediction(gameOf(duel));window.FusionUI.load(gameOf(duel));el('duel-my-score').textContent=duel.me.score;}render();clock();
 }
 async function leave(){
  if(!online.duel)return true;
  if(statusNow()!=='finished'&&!confirm('Quitter le duel ? Tu abandonneras cette partie.'))return false;
  await drain();await api('duels/'+online.duel+'/leave',{});resetPrediction();online.duel=null;current=null;remember(null);el('duel-hud').hidden=true;el('duel-invite').hidden=true;window.FusionUI.newGame(false);render();return true;
 }
 el('account-open').onclick=()=>{render();open('account');};el('dialog-close').onclick=()=>el('online-dialog').close();
 async function authenticate(register){if(busy)return;busy=true;message('Connexion…');try{const data=await api(register?'register':'login',{username:el('account-name').value,password:el('account-password').value});account=data.user;el('account-password').value='';render();message('Connecté. Lance une partie classée ou ouvre Duel 1v1.');}catch(e){message(e.message);}finally{busy=false;}}
 el('account-form').onsubmit=e=>{e.preventDefault();authenticate(false);};el('register').onclick=()=>{if(el('account-form').reportValidity())authenticate(true);};
 el('logout').onclick=async()=>{if(busy)return;try{await drain();if(!await leave())return;await api('logout',{});online.ranked=false;account=null;window.FusionUI.newGame(false);render();message('Déconnecté.');}catch(e){message(e.message);}};
 async function start(){if(busy)return;busy=true;try{if(!await leave())return;await drain();window.FusionUI.audio();const {game}=await api('game',{});online.ranked=true;resetPrediction(game);window.FusionUI.load(game);render();el('online-dialog').close();}catch(e){message(e.message);}finally{busy=false;}}
 el('ranked-start').onclick=start;online.restart=()=>{if(online.duel)return;if(confirm('Recommencer ta partie classée ?'))start();};
 online.move=async direction=>{
  if(busy||recovering||!el('overlay').hidden)return;
  if(online.duel&&statusNow()!=='playing')return;
  const inDuel=!!online.duel,before=window.FusionUI.state;
  const result=window.FusionRules.move(before.board,direction);
  if(!result.changed)return;
  const ticket=tickets.get(before.moves);
  if(!ticket||pending.length>=32){el('status').textContent='Synchronisation en cours…';return;}
  const spawned=window.FusionRules.spawnTicket(result.board,ticket);
  const game={board:result.board,score:before.score+result.gain,moves:before.moves+1,won:result.board.some(v=>v>=2048)};
  optimistic=game;pending.push({direction,before,after:game});pump();
  window.FusionUI.audio();
  const rendered=await window.FusionUI.animate({game,result,spawned},{duel:inDuel});
  if(inDuel&&rendered!==false)el('duel-my-score').textContent=game.score;
 };
 el('leaderboard-open').onclick=async()=>{open('leaderboard');const list=el('leaderboard-list');list.replaceChildren();message('Chargement…');try{const {entries}=await api('leaderboard');for(const [index,entry]of entries.entries()){const row=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=`${index+1}. ${entry.username}`;score.textContent=entry.best.toLocaleString('fr-FR');row.append(name,score);list.append(row);}message(entries.length?'':'Le classement attend son premier champion.');}catch(e){message(e.message);}};
 el('duel-open').onclick=()=>{open('duel');if(!account)message('Connecte-toi via Mon compte pour créer ou rejoindre un duel.');};
 async function enter(create){if(busy)return;if(!account){open('account');message('Connecte-toi pour jouer en duel.');return;}busy=true;try{await drain();if(!await leave())return;const data=await api(create?'duels':'duels/'+el('duel-code').value.trim().toUpperCase()+'/join',{});updateDuel(data.duel,{load:true});if(!create)el('online-dialog').close();message(create?'Ton salon est prêt ! Partage le code ou le lien.':'');}catch(e){message(e.message);}finally{busy=false;}}
 el('duel-create').onclick=()=>enter(true);el('duel-join-form').onsubmit=e=>{e.preventDefault();enter(false);};el('duel-back').onclick=()=>el('online-dialog').close();
 el('duel-copy').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('duel',online.duel);try{await navigator.clipboard.writeText(url.toString());message('Lien copié !');}catch{message('Partage ce code : '+online.duel);}};
 el('duel-leave').onclick=async()=>{if(busy)return;busy=true;try{await leave();}catch(e){el('duel-result').textContent=e.message;}finally{busy=false;}};
 setInterval(clock,100);
 setInterval(async()=>{if(!online.duel||busy||polling||sending||pending.length||recovering||current?.status==='finished')return;polling=true;try{const {duel}=await api('duels/'+online.duel);if(!sending&&!pending.length&&!busy)updateDuel(duel);}catch(e){el('duel-result').textContent='Connexion interrompue. Nouvelle tentative…';}finally{polling=false;}},1000);
 api('me').then(async data=>{
  account=data.user;render();const invite=new URL(location.href).searchParams.get('duel');
  if(invite&&/^[a-f0-9]{10}$/i.test(invite)){el('duel-code').value=invite.toUpperCase();open('duel');if(!account)message('Connecte-toi via Mon compte, puis rejoins le duel.');}
  else if(account&&readRoom()){try{const {duel}=await api('duels/'+readRoom());updateDuel(duel,{load:true});}catch{remember(null);}}
 }).catch(()=>{el('online-status').textContent='Mode libre · serveur hors ligne';});
})();
