const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../public/skin-rules');
test('chest rarity ranges match displayed probabilities and exclude exclusive skins',()=>{
 assert.equal(R.GOLD_SCORE,100000);
 for(const chest of R.chests){assert.equal(Object.values(chest.odds).reduce((a,b)=>a+b),100);const counts={common:0,rare:0,epic:0,legendary:0};for(let roll=0;roll<10000;roll++)counts[R.pickRarity(chest,roll)]++;for(const key of Object.keys(counts))assert.equal(counts[key],chest.odds[key]*100);}
 assert.ok(R.catalog.filter(s=>['king','gold','original'].includes(s.id)).every(s=>!s.chest));assert.equal(R.catalog.filter(s=>s.chest).length,8);
});
test('skin art varies by tile value and has distinct motifs and progression tiers',()=>{
 for(const skin of R.catalog){const a=R.tileStyle(skin.id,2),b=R.tileStyle(skin.id,2048);assert.notDeepEqual(a,b);assert.equal(a.tier,0);assert.equal(b.tier,3);assert.ok(skin.hues.length>=11);}
 assert.equal(new Set(R.catalog.map(s=>s.art)).size,R.catalog.length);
});
