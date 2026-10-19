// Installation help only changes when connectivity or installation changes.
// It does not add timers, animation frames, prompts or reloads to gameplay.
(()=>{
 const help=document.getElementById('phone-install');
 if(!help)return;
 const status=document.getElementById('install-status'),steps=document.getElementById('install-steps'),button=document.getElementById('install-app');
 const standalone=matchMedia('(display-mode: standalone)');
 let cached=false,prompt=null;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 function update(){
  const installed=standalone.matches||navigator.standalone===true;
  help.dataset.installed=String(installed);
  steps.hidden=installed;
  button.hidden=installed||!prompt;
  status.textContent=!navigator.onLine
   ?'Hors ligne : le mode libre reste disponible si les fichiers ont déjà été enregistrés. Les duels et le classement demandent Internet.'
   :installed
    ?cached?'App prête sur cet appareil. Le mode libre fonctionne aussi hors ligne.':'App ouverte. Garde Internet pour enregistrer les fichiers de jeu sur cet appareil.'
    :cached?'Fichiers du jeu enregistrés. Tu peux maintenant ajouter Fusion à ton écran d’accueil.':'Ouvre une première fois avec Internet pour enregistrer les fichiers du jeu.';
  if(!ios&&!installed)document.getElementById('install-safari-note').textContent='Sur Android, utilise « Installer l’application » dans le menu de ton navigateur. Sur iPhone, suis les étapes Safari ci-dessus.';
 }
 window.addEventListener('online',update,{passive:true});
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
 if('serviceWorker'in navigator)navigator.serviceWorker.ready.then(()=>{cached=true;update();}).catch(()=>{});
 update();
})();
