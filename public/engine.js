/* Pure 2048 rules, shared by the browser and the Node validation suite. */
(function(root){
 function move(board,direction){
  const next=Array(16).fill(0), transitions=[],merges=[];let gain=0;
  for(let line=0;line<4;line++){
   const indices=Array.from({length:4},(_,n)=>direction==='left'?line*4+n:direction==='right'?line*4+3-n:direction==='up'?n*4+line:(3-n)*4+line);
   const occupied=indices.filter(i=>board[i]);let position=0;
   for(let n=0;n<occupied.length;n++){
    const from=occupied[n],to=indices[position++],value=board[from];
    if(n+1<occupied.length&&board[occupied[n+1]]===value){
     next[to]=value*2;gain+=value*2;merges.push(to);transitions.push({from,to},{from:occupied[++n],to});
    }else{next[to]=value;transitions.push({from,to});}
   }
  }
  return {board:next,gain,merges,transitions,changed:next.some((v,i)=>v!==board[i])};
 }
 function canMove(board){return board.includes(0)||['left','right','up','down'].some(d=>move(board,d).changed);}
 function spawnTicket(board,ticket){
  const empty=board.map((v,i)=>v?-1:i).filter(i=>i>=0);
  if(!empty.length)return -1;
  const index=empty[ticket.position%empty.length];board[index]=ticket.value;return index;
 }
 const api={move,canMove,spawnTicket};if(typeof module!=='undefined')module.exports=api;else root.FusionRules=api;
})(typeof window!=='undefined'?window:globalThis);
