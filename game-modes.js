const modes=require('./public/modes');
const GRACE=1000;
function validMode(id){return id===undefined||Object.hasOwn(modes.definitions,id);}
function actionTimes(body,count,now){
 if(body.times===undefined)return Array(count).fill(now);
 if(!Array.isArray(body.times)||body.times.length!==count||body.times.some((t,i)=>!Number.isSafeInteger(t)||t>now+250||(i&&t<body.times[i-1])))return null;
 return body.times.map(t=>Math.min(t,now));
}
async function readMeta(db,id){const row=await db.one('SELECT meta FROM game_modes WHERE user_id=?',[id]);return row?JSON.parse(row.meta):null;}
async function saveMeta(db,id,meta){await db.run('INSERT INTO game_modes(user_id,meta) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET meta=excluded.meta',[id,JSON.stringify(meta)]);}
async function record(db,id,mode,score){if(mode==='classic')await db.run('UPDATE users SET best=CASE WHEN best < ? THEN ? ELSE best END WHERE id=?',[score,score,id]);else await db.run('INSERT INTO mode_scores(user_id,mode,best) VALUES(?,?,?) ON CONFLICT(user_id,mode) DO UPDATE SET best=CASE WHEN mode_scores.best < excluded.best THEN excluded.best ELSE mode_scores.best END',[id,mode,score]);}
async function best(db,id,mode){const row=mode==='classic'?await db.one('SELECT best FROM users WHERE id=?',[id]):await db.one('SELECT best FROM mode_scores WHERE user_id=? AND mode=?',[id,mode]);return row?.best||0;}
module.exports={...modes,GRACE,validMode,actionTimes,readMeta,saveMeta,record,best};
