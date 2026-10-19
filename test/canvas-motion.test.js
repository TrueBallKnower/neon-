const {test}=require('node:test'),assert=require('node:assert/strict'),motion=require('../public/canvas-motion'),rules=require('../public/engine');
const empty=()=>Array(16).fill(0);
test('Canvas follows the authoritative move snapshot immediately and interrupts a glide continuously',()=>{
 const scene=motion.create(),board=empty();board[0]=2;scene.update(board,null,-1,0);const right=rules.move(board,'right');scene.update(right.board,right,-1,10);const before=scene.sample(73).tiles.get(3);assert.ok(before.x>0&&before.x<3);const x=before.x;const left=rules.move(right.board,'left');scene.update(left.board,left,-1,73);assert.equal(scene.sample(73).tiles.get(0).x,x);assert.equal(scene.sample(73).tiles.get(0).value,2);assert.equal(scene.sample(253).tiles.get(0).x,0);assert.equal(scene.sample(500).active,false);
});
test('merge ghosts are bounded and a fresh game never inherits previous merge effects',()=>{
 const scene=motion.create(),board=empty();board[0]=2;board[1]=2;scene.update(board,null,-1,0);const merge=rules.move(board,'left');scene.update(merge.board,merge,-1,0);assert.equal(scene.sample(50).ghosts.length,1);assert.equal(scene.sample(50).tiles.get(0).value,4);assert.ok(scene.sample(50).tiles.get(0).scale>1);scene.update(board,null,-1,60);assert.equal(scene.sample(60).ghosts.length,0);assert.equal(scene.sample(60).active,false);
 for(let i=0;i<40;i++){scene.update(board,null,-1,i);scene.update(merge.board,merge,-1,i);assert.ok(scene.sample(i).ghosts.length<=16);}
});
test('reduced motion, hidden-page settlement and large values keep exact logical positions',()=>{
 const scene=motion.create(),board=empty();board[0]=1048576;scene.update(board,null,-1,0);const result=rules.move(board,'right');scene.update(result.board,result,-1,20,true);assert.equal(scene.sample(20).tiles.get(3).x,3);assert.equal(scene.sample(20).active,false);scene.update(board,rules.move(result.board,'left'),-1,40);assert.equal(scene.settle(60).tiles.get(0).x,0);assert.equal(scene.sample(60).active,false);assert.equal(scene.sample(60).tiles.get(0).value,1048576);
});
test('the easing curve is monotone and geometry-independent; visual updates never mutate input snapshots',()=>{
 let last=-1;for(let t=0;t<=1;t+=.01){const eased=motion.ease(t);assert.ok(eased>=last&&eased>=0&&eased<=1);last=eased;}
 const board=Object.freeze([2,2,...Array(14).fill(0)]),result=rules.move(board,'right'),expected=JSON.stringify(result),scene=motion.create();scene.update(board,null,-1,0);scene.update(result.board,result,-1,10);scene.sample(90);assert.equal(JSON.stringify(result),expected);
});
