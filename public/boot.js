// The board is playable before cosmetic code, inventory requests or server replies.
(()=>{
 let pending=null,skinTimer=0,skinIdle=0;const button=document.getElementById('skins-open'),board=document.getElementById('board');
 function stopSkinWarmup(){clearTimeout(skinTimer);if(skinIdle&&window.cancelIdleCallback)cancelIdleCallback(skinIdle);board?.removeEventListener('pointerdown',waitForQuiet);board?.removeEventListener('pointermove',waitForQuiet);window.removeEventListener('keydown',keyboardActivity);}
 function loadSkins(){
  if(window.FusionSkins)return Promise.resolve();if(pending)return pending;
  stopSkinWarmup();
  pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='__SKINS_ASSET__';script.async=true;script.fetchPriority='low';script.onload=()=>{window.FusionSkins.session(window.FusionOnline.social.account);resolve();};script.onerror=()=>{script.remove();pending=null;reject(Error('Skins indisponibles. Réessaie quand la connexion revient.'));};document.head.append(script);});return pending;
 }
 button.onclick=async()=>{const label=button.firstChild,old=label.textContent;button.disabled=true;label.textContent='Chargement des skins…';try{await loadSkins();button.disabled=false;label.textContent=old;button.click();}catch(error){button.disabled=false;label.textContent=old;document.getElementById('status').textContent=error.message;}};
 window.FusionLoadSkins=loadSkins;
 // Compiling the optional catalog must not begin in the middle of the first swipes.
 function waitForQuiet(){clearTimeout(skinTimer);if(skinIdle&&window.cancelIdleCallback)cancelIdleCallback(skinIdle);skinTimer=setTimeout(()=>{if(window.requestIdleCallback)skinIdle=requestIdleCallback(()=>loadSkins().catch(()=>{}),{timeout:3000});else loadSkins().catch(()=>{});},1200);}
 function keyboardActivity(event){if(/^(Arrow(Up|Down|Left|Right)|[wasdWASD])$/.test(event.key))waitForQuiet();}
 board?.addEventListener('pointerdown',waitForQuiet,{passive:true});board?.addEventListener('pointermove',waitForQuiet,{passive:true});window.addEventListener('keydown',keyboardActivity,{passive:true});waitForQuiet();
 if('serviceWorker'in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
  let registration=null,notice=null,worker=null,applying=false,reloaded=false,hadController=!!navigator.serviceWorker.controller,lastCheck=Date.now();
  function showUpdate(nextWorker){
   worker=nextWorker||null;
   if(!notice){
    notice=document.createElement('aside');notice.id='app-update';notice.className='app-update';notice.setAttribute('role','status');
    const text=document.createElement('p'),actions=document.createElement('div'),apply=document.createElement('button'),later=document.createElement('button');
    text.id='app-update-message';apply.id='app-update-apply';apply.type='button';apply.textContent='Mettre à jour';later.id='app-update-dismiss';later.type='button';later.textContent='Plus tard';later.setAttribute('aria-label','Me le rappeler plus tard');
    apply.onclick=applyUpdate;later.onclick=()=>{notice.hidden=true;};actions.append(apply,later);notice.append(text,actions);
    const install=document.getElementById('phone-install');if(install)install.after(notice);else(document.querySelector('main')||document.body).append(notice);
   }
   document.getElementById('app-update-message').textContent='Une nouvelle version est prête. Mets à jour quand tu as terminé ta partie.';notice.hidden=false;
  }
  function reload(){if(reloaded)return;reloaded=true;window.FusionUI?.saveNow?.();location.reload();}
  function applyUpdate(){
   const message=document.getElementById('app-update-message'),online=window.FusionOnline,ui=window.FusionUI;
   if(online?.syncState?.pending||online?.syncState?.sending){message.textContent='Tes derniers coups attendent la connexion. Reviens mettre à jour une fois la synchronisation terminée.';return;}
   if(online?.duel&&!online.duelFinished){message.textContent='Termine ou quitte ton duel avant de mettre à jour. Ta partie continue normalement.';return;}
   if(online?.ranked&&!ui?.gameEnded){message.textContent='Termine ta partie classée ou retourne au mode libre avant de mettre à jour.';return;}
   if(window.FusionStory?.state?.status==='playing'){message.textContent='Termine ce niveau ou retourne au mode libre avant de mettre à jour.';return;}
   if(ui?.state.moves>0&&document.getElementById('overlay')?.hidden&&!confirm('Mettre le jeu à jour maintenant ? Ta partie libre sera sauvegardée et reprise au rechargement.'))return;
   ui?.saveNow?.();applying=true;
   const next=registration?.waiting||worker;if(!next){reload();return;}
   message.textContent='Installation de la nouvelle version…';document.getElementById('app-update-apply').disabled=true;
   try{next.postMessage({type:'FUSION_APPLY_UPDATE'});}catch{applying=false;message.textContent='La mise à jour attend la connexion. Réessaie dans un instant.';document.getElementById('app-update-apply').disabled=false;}
   setTimeout(()=>{if(reloaded||!applying)return;applying=false;message.textContent='La mise à jour prend du temps. Tu peux continuer à jouer et réessayer plus tard.';document.getElementById('app-update-apply').disabled=false;},10000);
  }
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applying)reload();else if(hadController)showUpdate(null);hadController=true;});
  window.addEventListener('load',async()=>{
   try{registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});if(registration.waiting)showUpdate(registration.waiting);
    registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed'&&navigator.serviceWorker.controller)showUpdate(installing);});});
   }catch{/* Private browsing and storage restrictions must not prevent play. */}
  },{once:true});
  function checkUpdate(){if(!registration||document.hidden||Date.now()-lastCheck<60000)return;lastCheck=Date.now();registration.update().catch(()=>{});if(registration.waiting)showUpdate(registration.waiting);}
  window.addEventListener('online',checkUpdate,{passive:true});document.addEventListener('visibilitychange',checkUpdate);
 }
})();
