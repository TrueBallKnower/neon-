const {test}=require('node:test'),assert=require('node:assert/strict'),{catalog,earned}=require('../public/skin-rules');
test('cosmetic achievements enforce score, combo, correct race and time boundaries',()=>{
 const skin=id=>catalog.find(s=>s.id===id);
 assert.equal(earned(skin('aurora'),{score:1199}),false);assert.equal(earned(skin('aurora'),{score:1200}),true);
 assert.equal(earned(skin('pulse'),{combo:7}),false);assert.equal(earned(skin('pulse'),{combo:8}),true);
 for(const [id,mode,time]of[['solar','rush512',90000],['prism','rush1024',180000]]){
  assert.equal(earned(skin(id),{mode,elapsed:time,finished:true}),true);
  for(const e of[{mode,elapsed:time+1,finished:true},{mode:'rush',elapsed:1,finished:true},{mode,elapsed:-1,finished:true},{mode,elapsed:NaN,finished:true},{mode,elapsed:1,finished:false}])assert.equal(earned(skin(id),e),false);
 }
});
