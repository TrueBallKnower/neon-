(()=>{
 const el=id=>document.getElementById(id);let account=null,busy=false;
 const online=window.FusionOnline={ranked:false};
 async function api(url,body){const response=await fetch('/api/'+url,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error||'Serveur indisponible.');return data;}
 function message(text){el('online-message').textContent=text;}
 function render(){el('account-form').hidden=!!account;el('signed-in').hidden=!account;el('account-greeting').textContent=account?`Salut ${account.username} ! Record classé : ${account.best}.`:'';el('online-status').textContent=online.ranked?`Classé · ${account.username}`:account?`${account.username} · mode libre`:'Mode libre';}
 function open(panel){el('account-panel').hidden=panel!=='account';el('leaderboard-panel').hidden=panel!=='leaderboard';message('');el('online-dialog').showModal();}
 el('account-open').onclick=()=>{render();open('account');};el('dialog-close').onclick=()=>el('online-dialog').close();
 async function authenticate(register){if(busy)return;busy=true;message('Connexion…');try{const data=await api(register?'register':'login',{username:el('account-name').value,password:el('account-password').value});account=data.user;el('account-password').value='';render();message('Connecté. Lance une partie classée pour enregistrer ton score.');}catch(e){message(e.message);}finally{busy=false;}}
 el('account-form').onsubmit=e=>{e.preventDefault();authenticate(false);};el('register').onclick=()=>{if(el('account-form').reportValidity())authenticate(true);};
 el('logout').onclick=async()=>{try{await api('logout',{});online.ranked=false;account=null;window.FusionUI.newGame(false);render();message('Déconnecté.');}catch(e){message(e.message);}};
 async function start(){if(busy)return;busy=true;try{window.FusionUI.audio();const {game}=await api('game',{});online.ranked=true;window.FusionUI.load(game);render();el('online-dialog').close();}catch(e){message(e.message);}finally{busy=false;}}
 el('ranked-start').onclick=start;online.restart=()=>{if(confirm('Recommencer ta partie classée ?'))start();};
 online.move=async direction=>{if(busy||!el('overlay').hidden)return;busy=true;window.FusionUI.audio();try{const data=await api('move',{direction});account.best=data.best;await window.FusionUI.animate(data);render();}catch(e){open('account');message(e.message);}finally{busy=false;}};
 el('leaderboard-open').onclick=async()=>{open('leaderboard');const list=el('leaderboard-list');list.replaceChildren();message('Chargement…');try{const {entries}=await api('leaderboard');for(const [index,entry]of entries.entries()){const row=document.createElement('li');const name=document.createElement('span'),score=document.createElement('strong');name.textContent=`${index+1}. ${entry.username}`;score.textContent=entry.best.toLocaleString('fr-FR');row.append(name,score);list.append(row);}message(entries.length?'':'Le classement attend son premier champion.');}catch(e){message(e.message);}};
 api('me').then(data=>{account=data.user;render();}).catch(()=>{el('online-status').textContent='Mode libre · serveur hors ligne';});
})();
