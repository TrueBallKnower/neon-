(function(root){
 const same=(a,b)=>a&&b&&a.moves===b.moves&&a.score===b.score&&a.board.every((value,index)=>value===b.board[index]);
 class MoveSync{
  constructor({request,read,onAck=()=>{},onReset=()=>{},onStatus=()=>{},retryMs=500}){
   Object.assign(this,{request,read,onAck,onReset,onStatus,retryMs});this.epoch=0;this.pending=[];this.timer=null;this.task=null;this.confirmed=null;this.seed=null;this.plan=null;this.retryDelay=retryMs;
  }
  configure(game){
   this.epoch++;clearTimeout(this.timer);this.timer=null;this.task=null;this.pending=[];this.confirmed=game?{...game,board:[...game.board]}:null;this.seed=game?.spawnSeed??null;this.plan=game?.spawnPlan||null;this.retryDelay=this.retryMs;
  }
  token(move){if(this.seed!==null)return root.FusionRules.spawnToken(this.seed,move+2);const index=move-(this.plan?.from||0);return this.plan?.tiles[index];}
  enqueue(item){if(this.pending.length>=4096)return false;this.pending.push(item);this.kick();return true;}
  kick(delay=0){if(this.timer!==null||this.task||!this.pending.length)return;this.timer=setTimeout(()=>{this.timer=null;this.flush();},delay);}
  resume(){clearTimeout(this.timer);this.timer=null;this.kick();}
  reconcile(snapshot){
   const game=snapshot.game,n=game.moves-this.confirmed.moves;
   const candidate=n===0?this.confirmed:n>0&&n<=this.pending.length?this.pending[n-1].after:null;
   const matched=same(candidate,game);
   if(matched)this.pending.splice(0,n);else this.pending=[];
   this.confirmed={...game,board:[...game.board]};this.seed=game.spawnSeed??this.seed;this.plan=game.spawnPlan||this.plan;
   this.onAck(snapshot);
   if(!matched||snapshot.terminal){this.pending=[];this.onReset(snapshot);}
   return n;
  }
  flush(){
   if(this.task||!this.pending.length)return this.task;
   const epoch=this.epoch,batch=this.pending.slice(0,32);
   let delay=32;
   const task=(async()=>{
    try{
     const snapshot=await this.request({directions:batch.map(item=>item.direction),times:batch.map(item=>item.at??Date.now()),baseMoves:batch[0].before.moves,baseBoard:batch[0].before.board});
     if(epoch!==this.epoch)return;
     this.reconcile(snapshot);this.retryDelay=this.retryMs;this.onStatus('ready');
    }catch(error){
     if(epoch!==this.epoch)return;
     try{
      const snapshot=error.snapshot||await this.read();if(epoch!==this.epoch)return;
      const acknowledged=this.reconcile(snapshot);
      delay=acknowledged>0?32:this.retryDelay;
      this.onStatus(this.pending.length?'retrying':'ready');
     }catch{
      if(epoch!==this.epoch)return;
      // Keep the local command journal. A failed recovery must never lock input.
      delay=this.retryDelay;this.onStatus('offline');
     }
     this.retryDelay=Math.min(this.retryDelay*2,8000);
    }
   })().finally(()=>{if(epoch!==this.epoch)return;this.task=null;this.kick(delay);});
   this.task=task;return task;
  }
 }
 if(typeof module!=='undefined'){
  root.FusionRules=require('./engine');module.exports={MoveSync,same};
 }else root.FusionMoveSync=MoveSync;
})(typeof window!=='undefined'?window:globalThis);
