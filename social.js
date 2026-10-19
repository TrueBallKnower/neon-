const pair=(a,b)=>[Math.min(a,b),Math.max(a,b)];
async function friends(db,a,b){if(!Number.isSafeInteger(b)||a===b)return false;const row=await db.one('SELECT accepted FROM friendships WHERE low_id=? AND high_id=?',pair(a,b));return !!row?.accepted;}
function registerSocial({app,db,auth,route}){
 app.get('/api/friends',auth,route(async(req,res)=>{
  const rows=await db.all('SELECT low_id,high_id,sender_id,accepted,users.id,users.username FROM friendships JOIN users ON users.id=CASE WHEN low_id=? THEN high_id ELSE low_id END WHERE low_id=? OR high_id=?',[req.user.id,req.user.id,req.user.id]);
  res.json({friends:rows.map(r=>({id:r.id,username:r.username,status:r.accepted?'accepted':r.sender_id===req.user.id?'sent':'received'}))});
 }));
 app.post('/api/friends',auth,route(async(req,res)=>{
  const name=req.body?.username;if(typeof name!=='string'||name.length>40)return res.status(400).json({error:'Pseudo invalide.'});
  const other=await db.one('SELECT id FROM users WHERE username_key=?',[name.normalize('NFKC').toLocaleLowerCase('fr')]);
  if(!other||other.id===req.user.id)return res.status(400).json({error:'Ce joueur est introuvable ou correspond à ton compte.'});
  await db.run('INSERT INTO friendships(low_id,high_id,sender_id,accepted) VALUES(?,?,?,0) ON CONFLICT(low_id,high_id) DO NOTHING',[...pair(req.user.id,other.id),req.user.id]);res.json({ok:true});
 }));
 app.post('/api/friends/:id/respond',auth,route(async(req,res)=>{
  const id=Number(req.params.id),ids=pair(req.user.id,id);if(!Number.isSafeInteger(id))return res.sendStatus(400);
  if(req.body.accept===true)await db.run('UPDATE friendships SET accepted=1 WHERE low_id=? AND high_id=? AND sender_id=?',[...ids,id]);
  else await db.run('DELETE FROM friendships WHERE low_id=? AND high_id=?',ids);
  res.json({ok:true});
 }));
 app.get('/api/friends/:id/messages',auth,route(async(req,res)=>{
  const id=Number(req.params.id);if(!await friends(db,req.user.id,id))return res.status(403).json({error:'Ajoutez-vous comme amis pour discuter.'});
  const rows=await db.all('SELECT id,sender_id,body,duel_code,created_at FROM messages WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?) ORDER BY id DESC LIMIT 100',[req.user.id,id,id,req.user.id]);
  res.json({messages:rows.reverse().map(r=>({id:r.id,mine:r.sender_id===req.user.id,body:r.body,code:r.duel_code,at:Number(r.created_at)}))});
 }));
 app.post('/api/friends/:id/messages',auth,route(async(req,res)=>{
  const id=Number(req.params.id),body=req.body?.body,code=req.body?.code||null;
  if(!await friends(db,req.user.id,id))return res.status(403).json({error:'Ajoutez-vous comme amis pour discuter.'});
  if(typeof body!=='string'||!body.trim()||body.length>500)return res.status(400).json({error:'Message : 1 à 500 caractères.'});
  if(code){const row=await db.one('SELECT state FROM duels WHERE code=?',[code]);const state=row&&JSON.parse(row.state);if(!state||state.players[0].id!==req.user.id||state.invitedId!==id||state.startsAt||state.forfeit)return res.status(400).json({error:'Invitation invalide.'});}
  const last=await db.one('SELECT created_at FROM messages WHERE sender_id=? ORDER BY id DESC LIMIT 1',[req.user.id]);if(last&&Date.now()-Number(last.created_at)<750)return res.status(429).json({error:'Attends un instant avant le prochain message.'});
  await db.run('INSERT INTO messages(sender_id,recipient_id,body,duel_code,created_at) VALUES(?,?,?,?,?)',[req.user.id,id,body.trim(),code,Date.now()]);res.status(201).json({ok:true});
 }));
}
module.exports={registerSocial,friends};
