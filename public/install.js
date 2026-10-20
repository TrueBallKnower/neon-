// Installation help only changes on installation/connectivity events. Cache readiness
// comes from the active worker, not a network indicator or a registration promise.
(()=>{
 const help=document.getElementById('phone-install');
 if(!help)return;
 const status=document.getElementById('install-status'),steps=document.getElementById('install-steps'),button=document.getElementById('install-app'),intro=document.getElementById('install-intro'),note=document.getElementById('install-safari-note');
 const standalone=matchMedia('(display-mode: standalone)');
 let cached=false,prompt=null,checking=null;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 function update(){
  const installed=standalone.matches||navigator.standalone===true;
  help.dataset.installed=String(installed);
  help.dataset.cached=String(cached);
  steps.hidden=installed;note.hidden=installed;
  intro.textContent=installed?'Fusion est ouvert dans sa propre fenêtre, depuis ton écran d’accueil.':ios?'Sur iPhone, ajoute Fusion à ton écran d’accueil pour jouer dans sa propre fenêtre.':'Installe Fusion pour le lancer directement depuis ton écran d’accueil, dans sa propre fenêtre.';
  button.hidden=installed||!prompt;
  status.textContent=!navigator.onLine
   ?cached?'Hors ligne : le mode libre est prêt sur cet appareil. Les duels et le classement demandent Internet.':'Hors ligne : les fichiers du jeu ne sont pas encore confirmés sur cet appareil. Reconnecte-toi pour les enregistrer.'
   :installed
    ?cached?'App prête sur cet appareil. Le mode libre fonctionne aussi hors ligne.':'App ouverte. Garde Internet pendant l’enregistrement des fichiers du jeu.'
    :cached?'Jeu enregistré sur cet appareil. Tu peux maintenant l’ajouter à ton écran d’accueil.':'Garde cette page ouverte avec Internet pendant l’enregistrement du jeu.';
  if(!ios&&!installed){
   note.textContent='Sur Android, utilise « Installer l’application » dans le menu de ton navigateur. Sur iPhone, suis les étapes Safari ci-dessus. Aucun paiement.';
  }
  if(!('serviceWorker'in navigator))status.textContent='Ce navigateur peut jouer en ligne. Safari permet aussi de l’ajouter à l’écran d’accueil sur iPhone.';
 }
 function checkCache(worker){
  if(!worker||checking||typeof MessageChannel==='undefined')return;
  const channel=new MessageChannel();
  const finish=()=>{clearTimeout(timeout);channel.port1.close();checking=null;};
  const timeout=setTimeout(finish,5000);
  checking=channel;
  channel.port1.onmessage=event=>{
   if(event.data?.type!=='FUSION_CACHE_STATUS')return;
   cached=event.data.shellCached===true;finish();update();
  };
  try{worker.postMessage({type:'FUSION_CACHE_STATUS'},[channel.port2]);}catch{finish();}
 }
 window.addEventListener('online',()=>{update();checkCache(navigator.serviceWorker?.controller);},{passive:true});
 window.addEventListener('offline',update,{passive:true});
 if(standalone.addEventListener)standalone.addEventListener('change',update);else standalone.addListener?.(update);
 window.addEventListener('beforeinstallprompt',event=>{
  // iOS uses Share > Add to Home Screen; this button is for browsers with a native prompt.
  event.preventDefault();prompt=event;update();
 });
 window.addEventListener('appinstalled',()=>{prompt=null;update();});
 button.onclick=async()=>{
  if(!prompt)return;const pending=prompt;prompt=null;update();
  try{await pending.prompt();await pending.userChoice;}catch{/* The browser may dismiss an outdated prompt. */}
 };
 if('serviceWorker'in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>checkCache(navigator.serviceWorker.controller));
  navigator.serviceWorker.addEventListener('message',event=>{
   if(event.data?.type==='FUSION_SHELL_READY'){cached=event.data.shellCached===true;update();}
  });
  navigator.serviceWorker.ready.then(registration=>checkCache(registration.active||navigator.serviceWorker.controller)).catch(()=>{});
 }
 update();
})();
