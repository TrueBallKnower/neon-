(function(root){
 const GOLD_SCORE=100000;
 const rarities={common:{name:'Commun',color:'#b8cbd5'},rare:{name:'Rare',color:'#54cfff'},epic:{name:'Épique',color:'#ca8cff'},legendary:{name:'Légendaire',color:'#ffb85c'},prestige:{name:'Prestige',color:'#ffe17b'},sovereign:{name:'Souverain',color:'#ffd76c'},starter:{name:'Original',color:'#bdff64'}};
 const catalog=[
 {id:'original',name:'Étincelle',rarity:'starter',hint:'La collection originale.',art:'original',hues:[90,170,215,42,24,335,280,255,190,75,85],marks:['·','◇','✧']},
 {id:'jade',name:'Jardin de jade',rarity:'common',hint:'Feuilles gravées et pierres précieuses.',art:'jade',hues:[145,168,95,55,180,200,290,320,135,45,160],marks:['❧','✿','❀']},
 {id:'circuit',name:'Circuit rétro',rarity:'common',hint:'Pistes de cuivre et cœurs de processeur.',art:'circuit',hues:[170,195,220,45,25,330,280,240,185,80,50],marks:['⌁','⌘','⊞']},
 {id:'aurora',name:'Aurore boréale',rarity:'rare',hint:'Rubans polaires et cristaux de lumière.',art:'aurora',hues:[175,195,225,265,305,335,35,80,150,200,280],marks:['✧','❖','✦']},
 {id:'solar',name:'Forge solaire',rarity:'rare',hint:'Métal martelé, braises et sceaux du soleil.',art:'solar',hues:[45,35,22,8,345,320,280,245,190,60,40],marks:['☼','✹','✺']},
 {id:'pulse',name:'Atlas cosmique',rarity:'epic',hint:'Constellations gravées dans des nébuleuses.',art:'cosmos',hues:[230,260,285,320,345,25,170,195,225,275,40],marks:['⋆','✧','✵']},
 {id:'prism',name:'Vitrail royal',rarity:'epic',hint:'Facettes de verre et rosaces multicolores.',art:'prism',hues:[200,275,330,35,140,185,250,305,55,165,290],marks:['❖','✥','✧']},
 {id:'dragon',name:'Dragon ancestral',rarity:'legendary',hint:'Écailles, ailes et runes d’un ancien dragon.',art:'dragon',hues:[15,35,75,145,180,205,255,290,325,10,45],marks:['♜','ᚷ','♨']},
 {id:'abyss',name:'Abysses vivants',rarity:'legendary',hint:'Tentacules nacrés et perles des profondeurs.',art:'abyss',hues:[185,205,235,260,285,315,340,165,195,255,55],marks:['◉','✺','◎']},
 {id:'gold',name:'Or impérial',rarity:'prestige',hint:'100 000 points dans une partie classique classée.',art:'gold',hues:[48,42,36,52,30,45,55,38,50,32,47],marks:['✧','❖','♜']},
 {id:'king',name:'King',rarity:'sovereign',hint:'Exclusif au n°1 du classement classique. Retiré quand tu perds la première place.',art:'king',hues:[225,265,335,15,160,195,280,320,45,235,42],marks:['♛','♚','♛']}
 ];
 for(const skin of catalog){skin.color=rarities[skin.rarity].color;skin.chest=['common','rare','epic','legendary'].includes(skin.rarity);}
 const chests=[{id:'wood',name:'Coffre d’explorateur',price:80,odds:{common:70,rare:24,epic:5,legendary:1}},{id:'royal',name:'Coffre royal',price:240,odds:{common:35,rare:45,epic:18,legendary:2}},{id:'astral',name:'Coffre astral',price:800,odds:{common:0,rare:35,epic:50,legendary:15}}];
 function pickRarity(chest,roll){let upto=0;for(const [key,chance]of Object.entries(chest.odds)){upto+=chance*100;if(roll<upto)return key;}throw Error('Tirage invalide.');}
 function tileStyle(id,value){const skin=catalog.find(s=>s.id===id)||catalog[0],level=Math.max(0,Math.floor(Math.log2(Math.max(2,value)))-1),hue=skin.hues[level%skin.hues.length];return{hue,mark:skin.marks[Math.min(2,Math.floor(level/4))],tier:Math.min(3,Math.floor(level/3)),art:skin.art};}
 const api={catalog,rarities,chests,GOLD_SCORE,pickRarity,tileStyle};if(typeof module!=='undefined')module.exports=api;else root.FusionSkinRules=api;
})(typeof window!=='undefined'?window:globalThis);
