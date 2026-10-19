(()=>{
 const el=id=>document.getElementById(id);let account=null,busy=false,polling=false,current=null,serverOffset=0;
 const online=window.FusionOnline={ranked:false,duel:null};
 const readRoom=()=>{try{return localStorage.getItem('fusion-duel')}catch{return null}};
 function remember(code){try{if(code)localStorage.setItem('fusion-duel',code);else localStorage.removeItem('fusion-duel');}catch{}}
 async function api(url,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch('/api/'+url,{signal:controller.signal,method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(!response.ok){const error=Error(data.error||'Serveur indisponible.');error.status=response.status;error.duel=data.duel;throw error;}return data;}finally{clearTimeout(timeout);}
 }
 function message(text){el('online-message').textContent=text;}
 function render(){el('account-form').hidden=!!account;el('signed-in').hidden=!account;el('account-greeting').textContent=account?`Salut ${account.username} ! Record classé : ${account.best}.`:'';el('online-status').textContent=online.duel?'Duel · '+account.username:online.ranked?`Classé · ${account.username}`:account?`${account.username} · mode libre`:'Mode libre';el('restart').disabled=!!online.duel;}
 function open(panel){for(const name of ['account','leaderboard','duel'])el(name+'-panel').hidden=panel!==name;message('');if(!el('online-dialog').open)el('online-dialog').showModal();}
 function gameOf(duel){return{board:duel.me.board,score:duel.me.score,moves:duel.me.moves,won:false};}
 function statusNow(){if(!current)return null;if(current.status==='finished')return'finished';if(!current.startsAt)return'waiting';const now=Date.now()+serverOffset;return now<current.startsAt?'countdown':now>=current.endsAt?'finished':'playing';}
 function clock(){
  if(!current)return;const status=statusNow(),now=Date.now()+serverOffset;
  const remaining=status==='waiting'?300000:status==='countdown'?current.startsAt-now:Math.max(0,current.endsAt-now);
  const seconds=Math.ceil(remaining/1000);el('duel-clock').textContent=status==='countdown'?String(seconds):`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  if(status==='waiting')el('duel-result').textContent='Salon '+current.code+' · En attente de ton ami…';
  else if(status==='countdown')el('duel-result').textContent='Prépare-toi ! Départ dans '+seconds+'…';
  else if(status==='finished'){
   if(current.status!=='finished'){el('duel-result').textContent='Temps écoulé · Vérification du résultat…';return;}
   el('duel-result').textContent=current.winner===null?'Égalité !':current.winner===current.me.id?'Victoire ! Tu remportes le duel.':'Ton adversaire remporte le duel.';
   if(current.forfeit)el('duel-result').textContent+=' (Abandon)';
  }else el('duel-result').textContent=current.me.blocked?'Grille bloquée : ton score reste en jeu jusqu’à la fin.':'Le plus grand score au bout de 5 minutes gagne.';
 }
 function updateDuel(duel,{load=false}={}){
  current=duel;online.duel=duel.code;online.ranked=false;serverOffset=duel.serverNow-Date.now();remember(duel.code);
  el('duel-hud').hidden=false;el('duel-you').textContent=duel.me.name;el('duel-opponent').textContent=duel.opponent?.name||'En attente…';el('duel-my-score').textContent=duel.me.score;el('duel-their-score').textContent=duel.opponent?.score||0;
  el('duel-invite').hidden=duel.status!=='waiting';el('duel-room-code').textContent=duel.code;
  if(load)window.FusionUI.load(gameOf(duel));render();clock();
 }
 async function leave(){
  if(!online.duel)return true;
  if(statusNow()!=='finished'&&!confirm('Quitter le duel ? Tu abandonneras cette partie.'))return false;
  await api('duels/'+online.duel+'/leave',{});online.duel=null;current=null;remember(null);el('duel-hud').hidden=true;el('duel-invite').hidden=true;window.FusionUI.newGame(false);render();return true;
 }
 el('account-open').onclick=()=>{render();open('account');};el('dialog-close').onclick=()=>el('online-dialog').close();
 async function authenticate(register){if(busy)return;busy=true;message('Connexion…');try{const data=await api(register?'register':'login',{username:el('account-name').value,password:el('account-password').value});account=data.user;el('account-password').value='';render();message('Connecté. Lance une partie classée ou ouvre Duel 1v1.');}catch(e){message(e.message);}finally{busy=false;}}
 el('account-form').onsubmit=e=>{e.preventDefault();authenticate(false);};el('register').onclick=()=>{if(el('account-form').reportValidity())authenticate(true);};
 el('logout').onclick=async()=>{if(busy)return;try{if(!await leave())return;await api('logout',{});online.ranked=false;account=null;window.FusionUI.newGame(false);render();message('Déconnecté.');}catch(e){message(e.message);}};
 async function start(){if(busy)return;busy=true;try{if(!await leave())return;window.FusionUI.audio();const {game}=await api('game',{});online.ranked=true;window.FusionUI.load(game);render();el('online-dialog').close();}catch(e){message(e.message);}finally{busy=false;}}
 el('ranked-start').onclick=start;online.restart=()=>{if(online.duel)return;if(confirm('Recommencer ta partie classée ?'))start();};
 online.move=async direction=>{
  if(busy||!el('overlay').hidden)return;if(online.duel&&statusNow()!=='playing')return;
  busy=true;window.FusionUI.audio();const inDuel=!!online.duel;
  const prediction=window.FusionRules.move(window.FusionUI.state.board,direction);
  try{
   // Start sliding immediately while the server validates the move.
   const [data]=await Promise.all([api(inDuel?'duels/'+online.duel+'/move':'move',{direction}),window.FusionUI.slide(prediction)]);
   await window.FusionUI.animate(data,{slid:true,duel:inDuel});
   if(inDuel)updateDuel(data.duel);else{account.best=data.best;render();}
  }catch(e){
   if(e.duel)updateDuel(e.duel,{load:true});
   else if(inDuel){el('duel-result').textContent='Connexion interrompue. Reconnexion…';try{const {duel}=await api('duels/'+online.duel);updateDuel(duel,{load:true});}catch{}}
   else{try{const {game}=await api('game');if(game)window.FusionUI.load(game);}catch{}open('account');message(e.message);}
  }finally{busy=false;}
 };
 el('leaderboard-open').onclick=async()=>{open('leaderboard');const list=el('leaderboard-list');list.replaceChildren();message('Chargement…');try{const {entries}=await api('leaderboard');for(const [index,entry]of entries.entries()){const row=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=`${index+1}. ${entry.username}`;score.textContent=entry.best.toLocaleString('fr-FR');row.append(name,score);list.append(row);}message(entries.length?'':'Le classement attend son premier champion.');}catch(e){message(e.message);}};
 el('duel-open').onclick=()=>{open('duel');if(!account)message('Connecte-toi via Mon compte pour créer ou rejoindre un duel.');};
 async function enter(create){if(busy)return;if(!account){open('account');message('Connecte-toi pour jouer en duel.');return;}busy=true;try{if(!await leave())return;const data=await api(create?'duels':'duels/'+el('duel-code').value.trim().toUpperCase()+'/join',{});updateDuel(data.duel,{load:true});if(!create)el('online-dialog').close();message(create?'Ton salon est prêt ! Partage le code ou le lien.':'');}catch(e){message(e.message);}finally{busy=false;}}
 el('duel-create').onclick=()=>enter(true);el('duel-join-form').onsubmit=e=>{e.preventDefault();enter(false);};el('duel-back').onclick=()=>el('online-dialog').close();
 el('duel-copy').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('duel',online.duel);try{await navigator.clipboard.writeText(url.toString());message('Lien copié !');}catch{message('Partage ce code : '+online.duel);}};
 el('duel-leave').onclick=async()=>{if(busy)return;busy=true;try{await leave();}catch(e){el('duel-result').textContent=e.message;}finally{busy=false;}};
 setInterval(clock,100);
 setInterval(async()=>{if(!online.duel||busy||polling||current?.status==='finished')return;polling=true;try{const {duel}=await api('duels/'+online.duel);updateDuel(duel);}catch(e){el('duel-result').textContent='Connexion interrompue. Nouvelle tentative…';}finally{polling=false;}},1000);
 api('me').then(async data=>{
  account=data.user;render();const invite=new URL(location.href).searchParams.get('duel');
  if(invite&&/^[a-f0-9]{10}$/i.test(invite)){el('duel-code').value=invite.toUpperCase();open('duel');if(!account)message('Connecte-toi via Mon compte, puis rejoins le duel.');}
  else if(account&&readRoom()){try{const {duel}=await api('duels/'+readRoom());updateDuel(duel,{load:true});}catch{remember(null);}}
 }).catch(()=>{el('online-status').textContent='Mode libre · serveur hors ligne';});
})();
