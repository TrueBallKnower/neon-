const crypto=require('node:crypto');
const rules=require('./public/engine');
function ticket(seed,turn){const bytes=crypto.createHash('sha256').update(seed+':'+turn).digest();return{position:bytes.readUInt32BE(0),value:bytes[4]<230?2:4};}
function plan(seed,moves){return{from:moves,tiles:Array.from({length:32},(_,i)=>ticket(seed,moves+i+2))};}
function addTile(board,seed,turn){return rules.spawnTicket(board,ticket(seed,turn));}
function directions(body){const list=body?.directions??[body?.direction];return Array.isArray(list)&&list.length>0&&list.length<=32&&list.every(d=>['left','right','up','down'].includes(d))?list:null;}
function stale(body,game){return(body.baseMoves!==undefined&&body.baseMoves!==game.moves)||(body.baseBoard!==undefined&&(!Array.isArray(body.baseBoard)||body.baseBoard.length!==16||body.baseBoard.some((v,i)=>v!==game.board[i])));}
module.exports={ticket,plan,addTile,directions,stale};
