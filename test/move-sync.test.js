const {test}=require('node:test');
const assert=require('node:assert/strict');
const {MoveSync}=require('../public/move-sync');
const rules=require('../public/engine');
const {stale}=require('../spawn-plan');
const clone=game=>structuredClone(game);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let n=0;n<200;n++){if(check())return;await sleep(5);}throw Error('Sync timeout');}
function initial(){return{board:[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],score:0,moves:0,spawnSeed:'offline-regression'};}
function apply(game,direction){const result=rules.move(game.board,direction);if(!result.changed)return false;rules.spawnTicket(result.board,rules.spawnToken(game.spawnSeed,game.moves+2));game.board=result.board;game.score+=result.gain;game.moves++;return true;}
function command(game){
 const options=['left','up','right','down'].map(direction=>{const after=clone(game);if(!apply(after,direction))return null;const empty=after.board.filter(v=>!v).length;return{direction,after,utility:empty*100+Math.log2(Math.max(...after.board))*10+Math.log2(after.board[0]||1)};}).filter(Boolean);
 options.sort((a,b)=>b.utility-a.utility);const choice=options[0];if(!choice)throw Error('Unexpected blocked test board');const before=clone(game);Object.assign(game,choice.after);return{direction:choice.direction,before,after:clone(game)};
}

test('more than 32 offline moves keep their journal and automatically reconcile',async()=>{
 let online=false,server=initial(),resets=0;const statuses=[];let calls=0;
 const sync=new MoveSync({retryMs:5,request:async body=>{calls++;if(!online)throw Error('offline');assert.equal(stale(body,server),false);body.directions.forEach(direction=>apply(server,direction));return{game:clone(server)};},read:async()=>{if(!online)throw Error('offline');return{game:clone(server)};},onReset:()=>resets++,onStatus:value=>statuses.push(value)});
 sync.configure(server);const local=clone(server);
 try{
  for(let i=0;i<64;i++){const entry=command(local);assert.ok(sync.token(entry.before.moves));assert.equal(sync.enqueue(entry),true);}
  await until(()=>statuses.includes('offline'));assert.equal(sync.pending.length,64);
  online=true;sync.resume();await until(()=>!sync.task&&!sync.pending.length);
  assert.deepEqual(server,local);assert.equal(resets,0);assert.ok(calls>=3);
 }finally{sync.configure();}
});

test('lost reply acknowledges applied moves without replaying or dropping later commands',async()=>{
 let server=initial(),dropped=false,requests=0,resets=0;
 const sync=new MoveSync({retryMs:5,request:async body=>{requests++;assert.equal(stale(body,server),false);body.directions.forEach(direction=>apply(server,direction));await sleep(10);if(!dropped){dropped=true;throw Error('lost reply');}return{game:clone(server)};},read:async()=>({game:clone(server)}),onReset:()=>resets++});
 sync.configure(server);const local=clone(server);
 try{
  sync.enqueue(command(local));await sleep(5);for(let i=0;i<8;i++)sync.enqueue(command(local));
  await until(()=>!sync.task&&!sync.pending.length);assert.deepEqual(server,local);assert.equal(server.moves,9);assert.equal(requests,2);assert.equal(resets,0);
 }finally{sync.configure();}
});

test('a response from a previous game cannot overwrite a new game',async()=>{
 let resolveOld;const acknowledgements=[];
 const sync=new MoveSync({request:()=>new Promise(resolve=>{resolveOld=resolve;}),read:async()=>({game:initial()}),onAck:value=>acknowledgements.push(value)});
 const game=initial();sync.configure(game);sync.enqueue(command(game));await until(()=>!!resolveOld);
 const replacement={...initial(),board:[4,...Array(15).fill(0)]};sync.configure(replacement);resolveOld({game});await sleep(10);
 assert.equal(acknowledgements.length,0);assert.deepEqual(sync.confirmed,replacement);sync.configure();
});
