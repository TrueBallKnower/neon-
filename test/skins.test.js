const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),R=require('../public/skin-rules'),{drawSkin}=require('../cosmetics');
const editions=R.catalog.filter(s=>s.atelier&&s.id!=='king'),core=editions.filter(s=>!s.inspiration);
function contrast(a,b){const lum=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('60 original editions belong to twelve authored worlds, five each, beside starter and champion',()=>{
 assert.equal(core.length,60);assert.equal(Object.values(R.collections).filter(c=>c.type==='core').length,12);assert.equal(R.catalog.length,64);assert.equal(new Set(R.allSkins.map(s=>s.id)).size,R.allSkins.length);assert.equal(new Set(core.map(s=>s.name)).size,60);assert.equal(new Set(core.map(s=>s.composition)).size,60);
 for(const [id,c]of Object.entries(R.collections).filter(([,c])=>c.type==='core')){assert.equal(core.filter(s=>s.collection===id).length,5);assert.equal(c.palette.length,5);assert.ok(c.hint.length>70);for(const sample of c.samples)assert.equal(R.get(sample).collection,id);}
 assert.ok(core.every(s=>!s.inspiration&&s.unlock.type==='chest'));assert.equal(R.get('king').name,'SOVEREIGN');assert.equal(R.get('gold').rarity,'legendary');
 assert.deepEqual(require('../public/atelier-catalog'),require('../public/atelier-catalog.json'));
});
test('all 682 value studies have real distinct SVG panels, ordered palettes and readable numeric ink',()=>{
 const sheets=[];for(const s of editions){assert.equal(s.tiles.length,11);const svg=fs.readFileSync(path.join(__dirname,'../public/atelier-art',s.id+'.svg'),'utf8');assert.match(svg,/viewBox="0 0 100 1100"/);const panels=svg.split(/<g transform="translate\(0 \d+\)">/).slice(1);assert.equal(panels.length,11);assert.equal(new Set(panels).size,11,s.id);sheets.push(crypto.createHash('sha256').update(svg).digest('hex'));assert.equal(new Set(s.tiles.map(t=>t.base)).size,11,s.id);
  for(const [i,t]of s.tiles.entries()){assert.equal(t.value,2**(i+1));assert.ok(contrast(t.ink,t.center||t.dark)>=4.5,s.id+' '+t.value);assert.ok(t.depth>0);assert.equal(R.tileStyle(s.id,t.value).level,i);}
 }assert.equal(new Set(sheets).size,62);
});
test('larger values ascend from 2048 without cycling back to the first tile; effects never change rules',()=>{
 for(const s of editions){const last=R.tileStyle(s.id,2048),higher=R.tileStyle(s.id,4096),huge=R.tileStyle(s.id,1048576);assert.equal(higher.level,10);assert.equal(higher.ascension,1);assert.ok(huge.ascension>higher.ascension);assert.notDeepEqual(last,higher);assert.equal(huge.label,'1048576');}
 for(const id of ['original','jade','circuit','aurora','solar','pulse','prism','dragon','abyss','gold','ores','capsules','dojo','sabers','sakura','pharaoh','atlantis','candy','disco','origami','king'])assert.equal(R.get(id).id,id);
 assert.equal(R.tileStyle('ores',2).label,'Charbon');assert.equal(R.tileStyle('ores',2048).label,'Netherite');
});
test('rarity odds cover each of 10000 draws exactly, with real mythics and no champion or archive drops',()=>{
 assert.equal(R.catalog.filter(s=>s.chest).length,62);for(const c of R.chests){assert.equal(Object.values(c.odds).reduce((s,x)=>s+x),100);const counts=Object.fromEntries(Object.keys(c.odds).map(k=>[k,0]));for(let roll=0;roll<10000;roll++)counts[R.pickRarity(c,roll)]++;for(const [rarity,chance]of Object.entries(c.odds))assert.equal(counts[rarity],Math.round(chance*100));
  for(const roll of [0,7000,9400,9900,9999]){let n=0;const result=drawSkin(c,editions.map(s=>s.id),max=>n++===0?roll:0);assert.equal(result.duplicate,true);assert.ok(editions.some(s=>s.id===result.skin));}
 }const legends=core.filter(s=>s.rarity==='legendary'),gold=legends.findIndex(s=>s.id==='gold');let n=0;assert.equal(drawSkin(R.chests[0],[],()=>n++===0?9900:gold).skin,'gold');assert.equal(R.get('king').chest,false);for(const s of R.archive){assert.equal(s.chest,false);assert.equal(R.get(s.id).id,s.id);}
});
test('musical identities and merge profiles are distinct and combo phases are bounded',()=>{
 assert.equal(new Set(core.map(s=>JSON.stringify(s.audio))).size,60);assert.ok(new Set(core.map(s=>JSON.stringify(R.frames(s.id)))).size>=20);
 for(const s of core){assert.ok(R.effectNames[s.fx]);assert.ok(s.audio.tail<=.4);for(const [chain,phase]of [[1,0],[3,1],[5,2],[8,3],[12,4],[100,4]]){const p=R.feedback(s.id,128,chain);assert.equal(p.phase,phase);assert.ok(p.intensity<=3);assert.equal(p.audio,s.audio);}}
 assert.notEqual(R.feedback('abyss-leviathan').sound,R.feedback('chronos-eternal').sound);
});
test('collaboration concepts are separated from core worlds and cannot masquerade as active events',()=>{
 assert.ok(R.events.some(e=>e.type==='collaboration'&&e.credits&&e.status==='concept'));assert.deepEqual(R.activeEvents(),[]);const event={id:'test-event',status:'active',startsAt:'2026-01-01T00:00:00Z',endsAt:'2026-01-02T00:00:00Z',skins:['test-event-skin']};const eventSkin={id:'test-event-skin',unlock:{type:'event'}};assert.equal(R.available(eventSkin),false);R.events.push(event);try{assert.equal(R.available(eventSkin,Date.parse('2026-01-01T12:00:00Z')),true);assert.equal(R.available(eventSkin,Date.parse(event.endsAt)),false);assert.deepEqual(R.activeEvents(Date.parse('2026-01-01T12:00:00Z')),[event]);assert.deepEqual(R.activeEvents(Date.parse(event.endsAt)),[]);}finally{R.events.pop();}
});

test('Minecraft ores and Pokémon capsules are collectible homages with eleven recognizable stages, preserving legacy ownership IDs',()=>{
 assert.equal(R.collections.homages.type,'homage');assert.equal(editions.filter(s=>s.collection==='homages').length,2);
 for(const [id,inspiration,rarity]of [['ores','Minecraft','epic'],['capsules','Pokémon','legendary']]){const skin=R.get(id);assert.equal(skin.inspiration,inspiration);assert.equal(skin.rarity,rarity);assert.equal(skin.chest,true);assert.equal(skin.retired,false);assert.equal(skin.variants.length,11);assert.equal(new Set(skin.variants).size,11);assert.equal(R.archive.some(s=>s.id===id),false);assert.equal(skin.unlock.type,'chest');}
 assert.equal(R.tileStyle('ores',512).label,'Diamant');assert.equal(R.tileStyle('capsules',2).label,'Poké Ball');assert.equal(R.tileStyle('capsules',2048).label,'Master Ball');assert.equal(R.tileStyle('capsules',4096).label,'4096');
});
