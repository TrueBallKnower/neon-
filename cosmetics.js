const crypto=require('node:crypto');
const {catalog,allSkins,chests,pickRarity,available:skinAvailable}=require('./public/skin-rules');
// Match only the authenticated account's unique, normalized database identity.
const privateCosmetics=require('./private-cosmetics');
const FULL_COLLECTION_ACCOUNT=privateCosmetics.owner;
const knownSkins=[...allSkins,...privateCosmetics.skins];
async function wallet(tx,id){
 await tx.run('INSERT INTO cosmetics(user_id,coins,state) VALUES(?,0,?) ON CONFLICT(user_id) DO NOTHING',[id,JSON.stringify({owned:['original'],selected:'original'})]);
 const row=await tx.one('SELECT c.coins,c.state,u.username_key FROM cosmetics c JOIN users u ON u.id=c.user_id WHERE c.user_id=?',[id]),state=JSON.parse(row.state),allSkinsAccess=row.username_key===FULL_COLLECTION_ACCOUNT;
 return{coins:Number(row.coins),...state,storedOwned:state.owned,favorites:(state.favorites||[]).filter(s=>allSkinsAccess||!privateCosmetics.skins.some(p=>p.id===s)),owned:allSkinsAccess?knownSkins.map(s=>s.id):state.owned.filter(s=>!privateCosmetics.skins.some(p=>p.id===s)),allSkinsAccess};
}
async function save(tx,id,w){await tx.run('UPDATE cosmetics SET coins=?,state=? WHERE user_id=?',[w.coins,JSON.stringify({owned:w.allSkinsAccess?w.storedOwned:w.owned,selected:w.selected,storyRewards:w.storyRewards||[],favorites:w.favorites||[],previousSkin:w.previousSkin||'original'}),id]);}
async function leader(tx){return tx.one('SELECT id,username,best FROM users WHERE best>0 ORDER BY best DESC,username ASC LIMIT 1');}
async function inventory(tx,id){const w=await wallet(tx,id),first=await leader(tx),isKing=first?.id===id;let changed=false;if(privateCosmetics.skins.some(s=>s.id===w.selected)&&!w.allSkinsAccess){w.selected='original';changed=true;}if(w.selected==='king'&&!isKing&&!w.allSkinsAccess){w.selected=w.owned.includes(w.previousSkin)&&w.previousSkin!=='king'?w.previousSkin:'original';changed=true;}if(changed)await save(tx,id,w);const{storedOwned,...visible}=w;return{...visible,...(w.allSkinsAccess?{privateSkins:privateCosmetics.skins}:{}),owned:[...new Set(isKing?[...w.owned,'king']:w.owned)],isKing,leader:first?{username:first.username,best:first.best}:null};}
async function reward(tx,id,before,after){
 const earned=Math.max(0,after.moves-before.moves)+Math.max(0,Math.floor(after.score/128)-Math.floor(before.score/128));
 if(!earned)return null;
 await tx.lockUser(id);const w=await wallet(tx,id);w.coins+=earned;await save(tx,id,w);return{coins:w.coins,owned:w.owned};
}
function drawSkin(chest,owned,random=crypto.randomInt){
 const rarity=pickRarity(chest,random(10000)),pool=catalog.filter(s=>s.chest&&s.rarity===rarity&&skinAvailable(s)),fresh=pool.filter(s=>!owned.includes(s.id)),available=fresh.length?fresh:pool;
 return{skin:available[random(available.length)].id,rarity,duplicate:!fresh.length};
}
function registerCosmetics({app,db,auth,route}){
 app.get('/api/cosmetics/private-art/:name',auth,route(async(req,res)=>{
  if(req.params.name!=='israel.svg'||!(await wallet(db,req.user.id)).allSkinsAccess)return res.sendStatus(404);
  res.type('image/svg+xml').sendFile(require('node:path').join(__dirname,'private-art','israel.svg'),{cacheControl:false});
 }));
 app.get('/api/cosmetics',auth,route(async(req,res)=>res.json(await db.transaction(async tx=>{await tx.lockUser(req.user.id);return inventory(tx,req.user.id);})))) ;
 app.post('/api/cosmetics/equip',auth,route(async(req,res)=>{
  const result=await db.transaction(async tx=>{await tx.lockUser(req.user.id);const w=await inventory(tx,req.user.id);if(!knownSkins.some(s=>s.id===req.body?.skin)||!w.owned.includes(req.body.skin))return{error:'Ce skin ne t’appartient pas.',status:403};w.selected=req.body.skin;const stored=await wallet(tx,req.user.id);if(stored.selected!=='king')stored.previousSkin=stored.selected;stored.selected=w.selected;await save(tx,req.user.id,stored);return w;});res.status(result.status||200).json(result);
 }));
 app.post('/api/cosmetics/favorite',auth,route(async(req,res)=>{
  const skin=req.body?.skin,on=req.body?.favorite;if(!knownSkins.some(s=>s.id===skin)||typeof on!=='boolean')return res.status(400).json({error:'Favori invalide.'});
  const result=await db.transaction(async tx=>{await tx.lockUser(req.user.id);const w=await wallet(tx,req.user.id),favorites=new Set(w.favorites||[]);if(privateCosmetics.skins.some(s=>s.id===skin)&&!w.allSkinsAccess)return{error:'Favori invalide.',status:403};if(on)favorites.add(skin);else favorites.delete(skin);w.favorites=[...favorites];await save(tx,req.user.id,w);return inventory(tx,req.user.id);});res.status(result.status||200).json(result);
 }));
 app.post('/api/cosmetics/story',auth,route(async(req,res)=>{
  const R=require('./public/story-rules'),level=req.body?.level,directions=req.body?.directions,l=R.levels[level-1];
  if(!Number.isInteger(level)||!l||!Array.isArray(directions)||!directions.length||directions.length>l.moves||directions.some(d=>!['left','right','up','down'].includes(d)))return res.status(400).json({error:'Parcours invalide.'});
  let state=R.create(level,0);for(const [i,d]of directions.entries()){if(state.status!=='playing')return res.status(400).json({error:'Parcours invalide.'});const next=R.step(state,d,(i+1)*1000);if(!next.result?.changed)return res.status(400).json({error:'Parcours invalide.'});state=next.state;}
  if(state.status!=='won')return res.status(400).json({error:'Termine le niveau pour recevoir les pièces.'});
  const result=await db.transaction(async tx=>{await tx.lockUser(req.user.id);const w=await wallet(tx,req.user.id);w.storyRewards=w.storyRewards||[];const earned=w.storyRewards.includes(level)?0:20+level*2;if(earned){w.coins+=earned;w.storyRewards.push(level);await save(tx,req.user.id,w);}return{earned,wallet:{coins:w.coins,owned:w.owned}};});res.json(result);
 }));
 app.post('/api/cosmetics/open',auth,route(async(req,res)=>{
  const chest=chests.find(c=>c.id===req.body?.chest),requestId=req.body?.requestId;
  if(!chest||typeof requestId!=='string'||! /^[a-zA-Z0-9-]{16,64}$/.test(requestId))return res.status(400).json({error:'Coffre ou identifiant invalide.'});
  const result=await db.transaction(async tx=>{await tx.lockUser(req.user.id);
   const receipt=await tx.one('SELECT kind,result FROM chest_receipts WHERE user_id=? AND request_id=?',[req.user.id,requestId]);
   if(receipt){if(receipt.kind!==chest.id)return{error:'Cette ouverture concerne un autre coffre.',status:409};return{reward:JSON.parse(receipt.result),inventory:await inventory(tx,req.user.id)};}
   const w=await wallet(tx,req.user.id);if(w.coins<chest.price)return{error:'Pas assez de pièces. Continue à jouer en classé ou en duel.',status:409};
   const {rarity,skin,duplicate}=drawSkin(chest,w.owned),refund=duplicate?Math.floor(chest.price*.35):0;
   w.coins=w.coins-chest.price+refund;if(!duplicate)w.owned.push(skin);await save(tx,req.user.id,w);
   const reward={skin,rarity,duplicate,refund,chest:chest.id,requestId};await tx.run('INSERT INTO chest_receipts(user_id,request_id,kind,result,created_at) VALUES(?,?,?,?,?)',[req.user.id,requestId,chest.id,JSON.stringify(reward),Date.now()]);return{reward,inventory:await inventory(tx,req.user.id)};
  });res.status(result.status||200).json(result);
 }));
}
module.exports={registerCosmetics,reward,inventory,drawSkin};
