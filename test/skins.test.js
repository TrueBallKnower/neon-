const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../public/skin-rules');
test('chest rarity ranges match displayed probabilities and exclude exclusive skins',()=>{

 for(const chest of R.chests){assert.equal(Object.values(chest.odds).reduce((a,b)=>a+b),100);const counts={common:0,rare:0,epic:0,legendary:0};for(let roll=0;roll<10000;roll++)counts[R.pickRarity(chest,roll)]++;for(const key of Object.keys(counts))assert.equal(counts[key],chest.odds[key]*100);}
 assert.equal(R.catalog.find(s=>s.id==='gold').rarity,'legendary');assert.equal(R.catalog.find(s=>s.id==='gold').chest,true);
 assert.ok(R.catalog.filter(s=>['king','original'].includes(s.id)).every(s=>!s.chest));assert.equal(R.catalog.filter(s=>s.chest).length,98);
});
test('skin art varies by tile value and has distinct motifs and progression tiers',()=>{
 for(const skin of R.catalog){const a=R.tileStyle(skin.id,2),b=R.tileStyle(skin.id,2048);assert.notDeepEqual(a,b);assert.equal(a.tier,0);assert.equal(b.tier,3);assert.ok(skin.hues.length>=11);}
 assert.equal(R.tileStyle('ores',2).label,'Charbon');assert.equal(R.tileStyle('ores',2048).label,'Netherite');assert.notEqual(R.tileStyle('ores',2).level,R.tileStyle('ores',2048).level);
 assert.equal(new Set(R.catalog.map(s=>s.art)).size,R.catalog.length);
});

const {drawSkin}=require('../cosmetics');
test('gold can actually be drawn as a legendary; King is never in a chest',()=>{const chest=R.chests[0],legend=R.catalog.filter(s=>s.chest&&s.rarity==='legendary'),index=legend.findIndex(s=>s.id==='gold');let calls=0;assert.equal(drawSkin(chest,[],()=>calls++===0?9999:index).skin,'gold');for(let roll=0;roll<10000;roll+=99){let call=0;const r=drawSkin(chest,[],max=>call++===0?roll:0);assert.notEqual(r.skin,'king');}});
test('every illustrated collection ships eleven addressable SVG panels',()=>{const fs=require('node:fs'),path=require('node:path');for(const skin of R.catalog.filter(s=>s.sprite)){const svg=fs.readFileSync(path.join(__dirname,'../public/skin-art',skin.art+'.svg'),'utf8');assert.ok(svg.includes('viewBox="0 0 100 1100"'));assert.equal((svg.match(/transform="translate\(0 /g)||[]).length,11);}});

test('100 distinct illustrated skins retain all old ids, themes and rarity profiles',()=>{
 for(const id of ['original','jade','circuit','aurora','solar','pulse','prism','dragon','abyss','gold','ores','capsules','dojo','sabers','sakura','pharaoh','atlantis','candy','disco','origami','king'])assert.equal(R.get(id).id,id);
 assert.equal(R.catalog.length,100);assert.equal(new Set(R.catalog.map(s=>s.id)).size,100);assert.equal(new Set(R.catalog.map(s=>s.name)).size,100);
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),digests=[];
 for(const s of R.catalog.filter(s=>s.id!=='original')){const art=fs.readFileSync(path.join(__dirname,'../public/skin-art',s.art+'.svg'));digests.push(crypto.createHash('sha256').update(art).digest('hex'));const p=R.feedback(s.id,2048,100);assert.ok(R.effectNames[p.theme]);assert.ok(p.intensity<=3);assert.equal(p.enabled,!['starter','common'].includes(s.rarity));}
 assert.equal(new Set(digests).size,99);assert.ok(R.catalog.filter(s=>s.inspiration).length>=20);
 assert.deepEqual(require('../public/skin-expansion'),require('../public/skin-expansion.json'));
});
test('combo intensity increases while its effects remain bounded, independent of game rules',()=>{
 const fire=R.feedback('phoenix',128,1),hot=R.feedback('phoenix',128,9),water=R.feedback('kraken',128,4);assert.equal(fire.theme,'fire');assert.equal(water.theme,'water');assert.notEqual(fire.sound,water.sound);assert.ok(hot.intensity>fire.intensity);assert.equal(R.feedback('original',2048,5).enabled,false);
});

test('curated collections cover every active skin; archived purchases remain resolvable but never drop',()=>{
 assert.equal(R.catalog.filter(s=>s.inspiration).length,64);assert.equal(R.archive.length,40);
 for(const skin of R.catalog){assert.ok(R.collections[skin.collection]);assert.ok(!skin.retired);if(skin.inspiration)assert.ok(['games','series','films'].includes(skin.medium));}
 for(const key of Object.keys(R.collections))assert.ok(R.catalog.some(s=>s.collection===key),key);
 assert.ok(R.catalog.filter(s=>s.collection==='celestial').length>=5);
 for(const skin of R.archive){assert.equal(R.get(skin.id).id,skin.id);assert.equal(skin.chest,false);assert.ok(!R.catalog.some(s=>s.id===skin.id));}
 // Owning every active skin must still produce a duplicate, never an archive.
 const owned=R.catalog.map(s=>s.id);for(const chest of R.chests)for(const roll of [0,7000,9400,9900,9999]){let n=0;const result=drawSkin(chest,owned,max=>n++===0?roll%10000:0);assert.ok(R.catalog.some(s=>s.id===result.skin));assert.equal(result.duplicate,true);}
});
