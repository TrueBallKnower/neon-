(function(root){
 const definitions={
  classic:{id:'classic',name:'Classique',description:'Atteins 2048 à ton rythme. Combo : 1,5 s.',comboMs:1500,soloMs:0,duelMs:300000,target:2048},
  sudden:{id:'sudden',name:'Mort subite',description:'Après la première fusion : fusionne toutes les 2 s ou perds !',comboMs:2000,soloMs:0,duelMs:300000,target:0},
  sprint:{id:'sprint',name:'Sprint 60 s',description:'Une minute pour obtenir le plus grand score.',comboMs:1500,soloMs:60000,duelMs:60000,target:0},
  rush:{id:'rush',name:'Course à 128',description:'Sois le premier à créer une tuile 128.',comboMs:1500,soloMs:0,duelMs:300000,target:128}
 };
 const get=id=>definitions[id]||definitions.classic;
 function create(id,now){const mode=get(id);return{mode:mode.id,startedAt:now,endsAt:mode.soloMs?now+mode.soloMs:null,comboDeadline:null,lastActionAt:now,endedAt:null,reason:null};}
 function expire(meta,now,grace=0){if(meta.endedAt)return meta;if(meta.endsAt&&now>=meta.endsAt){meta.endedAt=meta.endsAt;meta.reason='time';}else if(meta.mode==='sudden'&&meta.comboDeadline&&now>=meta.comboDeadline+grace){meta.endedAt=meta.comboDeadline;meta.reason='combo';}return meta;}
 function fusion(meta,result,at){meta.lastActionAt=at;if(meta.mode==='sudden'&&result.gain)meta.comboDeadline=at+2000;}
 const api={definitions,get,create,expire,fusion};if(typeof module!=='undefined')module.exports=api;else root.FusionModes=api;
})(typeof window!=='undefined'?window:globalThis);
