const {test}=require('node:test'),assert=require('node:assert/strict');
const R=require('../public/story-rules'),solutions=require('./fixtures/story-solutions.json');
test('all 18 authored story levels have a legal winning route within their move and time limits',()=>{
 assert.equal(R.levels.length,18);assert.equal(solutions.length,18);
 for(const l of R.levels){let state=R.create(l.id,0);assert.equal(new Set(R.blocks(state)).size,R.blocks(state).length);assert.ok(state.board.every((v,i)=>!R.blocks(state).includes(i)||v===0));
  for(const [n,d]of solutions[l.id-1].entries()){const before=structuredClone(state),out=R.step(state,d,(n+1)*1000);assert.deepEqual(state,before,'step must not mutate its input');assert.ok(out.result?.changed);state=out.state;assert.ok(state.board.every((v,i)=>!R.blocks(state).includes(i)||v===0));}
  assert.equal(state.status,'won','level '+l.id);assert.ok(state.moves<=l.moves);assert.ok(state.stars>=1&&state.stars<=3);
 }
});
test('rocks split lanes, cannot be crossed, and transitions never target blocked cells',()=>{
 const board=[2,2,0,2,...Array(12).fill(0)],result=R.move(board,'left',[2]);assert.deepEqual(result.board.slice(0,4),[4,0,0,2]);assert.equal(result.gain,4);assert.ok(result.transitions.every(t=>t.to!==2));assert.equal(R.move([2,0,2,0,...Array(12).fill(0)],'left',[1]).gain,0);
});
test('adjacent fusions break ice; diagonal and distant fusions do not',()=>{
 const s=R.create(7,0);s.board=[2,2,0,0,...Array(12).fill(0)];const out=R.step(s,'right',1);assert.equal(out.state.broken,0);
 const left=R.step(s,'left',1);assert.equal(left.state.broken,0,'merge at zero is diagonal to ice at five');
 s.board=[0,2,2,0,...Array(12).fill(0)];const down=R.step(s,'left',1);assert.equal(down.state.broken,0);
 const solved=solutions[6].reduce((state,d)=>R.step(state,d,1).state,R.create(7,0));assert.equal(solved.broken,2);
});
test('exact deadlines lose, invalid swipes do not consume moves, and restarting replays a fixed spawn stream',()=>{
 const a=R.create(11,0),late=R.step(a,'left',60000);assert.equal(late.state.status,'lost');assert.equal(late.state.reason,'time');assert.equal(late.state.moves,0);
 const still=R.create(1,0);still.board=[2,0,0,0,...Array(12).fill(0)];assert.equal(R.step(still,'left',1).state.moves,0);
 let x=R.create(6,0),y=R.create(6,100);for(const d of solutions[5]){x=R.step(x,d,200).state;y=R.step(y,d,200).state;assert.deepEqual(x.board,y.board);}
});
test('beacon requires a large enough tile on the correct cell; move budgets and stars are enforced',()=>{
 const s=R.create(8,0);s.board=Array(16).fill(0);s.board[0]=32;assert.equal(R.progress(s),0);s.board[15]=16;assert.equal(R.progress(s),0);s.board[15]=32;assert.equal(R.progress(s),1);
 const l=R.levels[0];for(const [moves,stars]of[[l.par,3],[Math.ceil((l.par+l.moves)/2),2],[l.moves,1]]){const a=R.create(1,0);a.board[0]=8;a.moves=moves;R.settle(a,1);assert.equal(a.stars,stars);}
 const exhausted=R.create(1,0);exhausted.moves=l.moves;R.settle(exhausted,1);assert.equal(exhausted.reason,'moves');
});
