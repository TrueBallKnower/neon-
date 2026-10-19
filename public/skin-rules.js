(function(root){
 const catalog=[
  {id:'original',name:'Étincelle',hint:'Disponible dès le départ.',color:'#bdff64'},
  {id:'aurora',name:'Aurore',hint:'Atteindre 1 200 points dans une partie.',score:1200,color:'#7be9ff'},
  {id:'pulse',name:'Pulsar',hint:'Enchaîner un combo ×8.',combo:8,color:'#d6a0ff'},
  {id:'solar',name:'Solaire',hint:'Finir la course à 512 en 90 s maximum.',mode:'rush512',time:90000,color:'#ffb17e'},
  {id:'prism',name:'Prisme',hint:'Finir la course à 1024 en 3 minutes maximum.',mode:'rush1024',time:180000,color:'#ff91bd'}
 ];
 function earned(skin,event){return skin.id==='original'||!!(skin.score&&event.score>=skin.score)||!!(skin.combo&&event.combo>=skin.combo)||!!(skin.mode&&event.finished&&event.mode===skin.mode&&Number.isFinite(event.elapsed)&&event.elapsed>=0&&event.elapsed<=skin.time);}
 const api={catalog,earned};if(typeof module!=='undefined')module.exports=api;else root.FusionSkinRules=api;
})(typeof window!=='undefined'?window:globalThis);
