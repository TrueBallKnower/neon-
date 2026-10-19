// Keep Safari's keyboard and browser chrome changes out of the game layout.
(()=>{
 const dialog=document.getElementById('online-dialog');let locked=false,scrollTop=0,frame,lastHeight=-1,lastTop=-1;
 function updateViewport(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const height=Math.round(window.visualViewport?.height||innerHeight);const top=Math.round(window.visualViewport?.offsetTop||0);if(height!==lastHeight){lastHeight=height;document.documentElement.style.setProperty('--visible-height',height+'px');}if(top!==lastTop){lastTop=top;document.documentElement.style.setProperty('--visual-top',top+'px');}});}
 window.visualViewport?.addEventListener('resize',updateViewport,{passive:true});window.visualViewport?.addEventListener('scroll',updateViewport,{passive:true});window.addEventListener('resize',updateViewport,{passive:true});updateViewport();
 function modalState(){
  if(dialog.open&&!locked){scrollTop=window.scrollY;document.body.style.setProperty('--scroll-lock-top',-scrollTop+'px');document.body.classList.add('dialog-open');locked=true;}
  else if(!dialog.open&&locked){document.body.classList.remove('dialog-open');document.body.style.removeProperty('--scroll-lock-top');window.scrollTo(0,scrollTop);locked=false;}
 }
 new MutationObserver(modalState).observe(dialog,{attributes:true,attributeFilter:['open']});
 dialog.addEventListener('close',modalState);window.addEventListener('pageshow',()=>{updateViewport();modalState();});
})();
