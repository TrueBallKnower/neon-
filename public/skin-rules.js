(function(root){
 const rarities={common:{name:'Commun',color:'#b8cbd5'},rare:{name:'Rare',color:'#54cfff'},epic:{name:'Épique',color:'#ca8cff'},legendary:{name:'Légendaire',color:'#ffb85c'},sovereign:{name:'Souverain',color:'#ffd76c'},starter:{name:'Original',color:'#bdff64'}};
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
 {id:'gold',name:'Or impérial',rarity:'legendary',hint:'Or martelé, lauriers et sceaux impériaux. Disponible dans les coffres.',art:'gold',hues:[48,42,36,52,30,45,55,38,50,32,47],marks:['✧','❖','♜']},
 {id:'ores',name:'Mines cubiques',rarity:'epic',hint:'Du charbon à la netherite : onze minerais en pixel art.',inspiration:'Hommage Minecraft · non officiel',art:'ores',sprite:true,hues:[215,28,18,48,0,225,185,140,275,260,25],marks:['▪','◆','✦'],motion:'scale(1.09)',variants:['Charbon','Fer','Cuivre','Or','Redstone','Lapis-lazuli','Diamant','Émeraude','Améthyste','Obsidienne','Netherite']},
 {id:'capsules',name:'Capsules de poche',rarity:'epic',hint:'Capsules bicolores, anneaux mécaniques et étoiles de capture.',inspiration:'Hommage Pokémon · non officiel',art:'capsules',sprite:true,hues:[0,215,45,285,145,25,195,330,260,170,48],marks:['●','◉','✧'],motion:'scale(1.08) rotate(5deg)'},
 {id:'dojo',name:'Dōjō des éléments',rarity:'epic',hint:'Parchemins, cordes tressées, sceaux et cinq éléments.',inspiration:'Hommage Naruto · non officiel',art:'dojo',sprite:true,hues:[25,195,0,140,45,265,185,330,30,220,50],marks:['風','火','雷'],motion:'scale(.97,1.1)'},
 {id:'sabers',name:'Voie des sabres',rarity:'legendary',hint:'Cristaux, poignées mécaniques et lames d’énergie.',inspiration:'Hommage Star Wars · non officiel',art:'sabers',sprite:true,hues:[200,140,0,285,45,185,335,25,215,165,50],marks:['◇','✧','✵'],motion:'scale(1.1,.96)'},
 {id:'sakura',name:'Samouraï du sakura',rarity:'rare',hint:'Pétales, vagues d’encre et armures laquées.',art:'sakura',sprite:true,hues:[335,350,20,195,275,145,45,220,320,175,35],marks:['✿','❀','✾'],motion:'scale(1.07) rotate(-3deg)'},
 {id:'pharaoh',name:'Trésors du pharaon',rarity:'legendary',hint:'Lapis, scarabées, hiéroglyphes et ailes d’or.',art:'pharaoh',sprite:true,hues:[45,195,225,15,160,280,335,30,190,250,50],marks:['☥','𓂀','✺'],motion:'scale(1.11)'},
 {id:'atlantis',name:'Cité d’Atlantide',rarity:'epic',hint:'Colonnes submergées, coquillages et mosaïques nacrées.',art:'atlantis',sprite:true,hues:[185,200,220,270,335,25,165,45,195,285,155],marks:['♆','◈','✥'],motion:'scale(1.04,.96)'},
 {id:'candy',name:'Confiserie céleste',rarity:'common',hint:'Sucre filé, rubans acidulés et pépites de chocolat.',art:'candy',sprite:true,hues:[335,30,55,145,195,275,0,175,310,45,220],marks:['♥','✿','★'],motion:'scale(1.12,.95)'},
 {id:'disco',name:'Disco vinyle',rarity:'common',hint:'Sillons de vinyle, miroirs et pistes lumineuses.',art:'disco',sprite:true,hues:[285,335,195,145,45,15,230,175,320,50,265],marks:['♪','♫','✦'],motion:'scale(1.06) rotate(4deg)'},
 {id:'origami',name:'Origami impérial',rarity:'rare',hint:'Papier plié, grues et éventails géométriques.',art:'origami',sprite:true,hues:[195,335,45,145,265,20,175,225,315,70,35],marks:['◇','✧','✥'],motion:'scale(1.07,.97) rotate(-3deg)'},
 {id:'king',name:'King',rarity:'sovereign',hint:'Exclusif au n°1 du classement classique. Retiré quand tu perds la première place.',art:'king',hues:[225,265,335,15,160,195,280,320,45,235,42],marks:['♛','♚','♛']}
 ];
 for(const skin of catalog){skin.color=rarities[skin.rarity].color;skin.chest=['common','rare','epic','legendary'].includes(skin.rarity);}
 const chests=[{id:'wood',name:'Coffre d’explorateur',price:80,odds:{common:70,rare:24,epic:5,legendary:1}},{id:'royal',name:'Coffre royal',price:240,odds:{common:35,rare:45,epic:18,legendary:2}},{id:'astral',name:'Coffre astral',price:800,odds:{common:0,rare:35,epic:50,legendary:15}}];
 function pickRarity(chest,roll){let upto=0;for(const [key,chance]of Object.entries(chest.odds)){upto+=chance*100;if(roll<upto)return key;}throw Error('Tirage invalide.');}
 function tileStyle(id,value){const skin=catalog.find(s=>s.id===id)||catalog[0],level=Math.max(0,Math.floor(Math.log2(Math.max(2,value)))-1),hue=skin.hues[level%skin.hues.length];return{hue,mark:skin.marks[Math.min(2,Math.floor(level/4))],tier:Math.min(3,Math.floor(level/3)),art:skin.art,level:level%11,sprite:!!skin.sprite,label:skin.variants?.[level%11]||String(value)};}
 const api={catalog,rarities,chests,pickRarity,tileStyle};if(typeof module!=='undefined')module.exports=api;else root.FusionSkinRules=api;
})(typeof window!=='undefined'?window:globalThis);
