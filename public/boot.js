// The board is playable before cosmetic code, inventory requests or server replies.
(()=>{
 let pending=null;const button=document.getElementById('skins-open');
 function loadSkins(){
  if(window.FusionSkins)return Promise.resolve();if(pending)return pending;
  pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='__SKINS_ASSET__';script.async=true;script.fetchPriority='low';script.onload=()=>{window.FusionSkins.session(window.FusionOnline.social.account);resolve();};script.onerror=()=>{script.remove();pending=null;reject(Error('Skins indisponibles. Réessaie quand la connexion revient.'));};document.head.append(script);});return pending;
 }
 button.onclick=async()=>{const label=button.firstChild,old=label.textContent;button.disabled=true;label.textContent='Chargement des skins…';try{await loadSkins();button.disabled=false;label.textContent=old;button.click();}catch(error){button.disabled=false;label.textContent=old;document.getElementById('status').textContent=error.message;}};
 window.FusionLoadSkins=loadSkins;
 setTimeout(()=>{if(window.requestIdleCallback)requestIdleCallback(()=>loadSkins().catch(()=>{}),{timeout:3000});else loadSkins().catch(()=>{});},1200);
 if('serviceWorker'in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});},{once:true});
 }
})();
