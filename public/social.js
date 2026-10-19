(()=>{
 const el=id=>document.getElementById(id),{api,open,isSignedIn,enter}=FusionOnline.social;let selected=null,loading=false,posting=false,lastMessages='',lastFriends='';
 const tell=text=>el('online-message').textContent=text;
 for(const [id,mode]of Object.entries(FusionModes.definitions)){const option=document.createElement('option');option.value=id;option.textContent=mode.name;el('friend-duel-mode').append(option);}
 function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>Promise.resolve().then(action).catch(e=>tell(e.message));return b;}
 async function refresh(){
  if(loading||!isSignedIn())return;loading=true;
  try{const {friends}=await api('friends');const list=el('friends-list'),signature=JSON.stringify([friends,selected?.id]);if(signature!==lastFriends){lastFriends=signature;list.replaceChildren();if(!friends.length)list.textContent='Ajoute un ami pour discuter et le défier.';
   if(selected&&!friends.some(f=>f.id===selected.id&&f.status==='accepted')){selected=null;el('private-chat').hidden=true;}
   for(const f of friends){const row=document.createElement('div');row.className='friend-row';const name=document.createElement('strong');name.textContent=f.username;row.append(name);
    if(f.status==='accepted')row.append(button(selected?.id===f.id?'Discussion ouverte':'Discuter',async()=>{selected=f;lastMessages='';el('private-chat').hidden=false;el('chat-name').textContent=f.username;await messages();}));
    else if(f.status==='received')row.append(button('Accepter',async()=>{await api('friends/'+f.id+'/respond',{accept:true});await refresh();}),button('Refuser',async()=>{await api('friends/'+f.id+'/respond',{accept:false});await refresh();}));
    else row.append(button('Annuler la demande',async()=>{await api('friends/'+f.id+'/respond',{accept:false});await refresh();}));list.append(row);
   }}
   await messages();
  }finally{loading=false;}
 }
 async function messages(){if(!selected)return;const id=selected.id,{messages}=await api('friends/'+id+'/messages');if(selected?.id!==id)return;const signature=JSON.stringify(messages);if(signature===lastMessages)return;lastMessages=signature;const box=el('chat-messages'),atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<30;box.replaceChildren();
  for(const m of messages){const row=document.createElement('div');row.className='chat-bubble'+(m.mine?' mine':'');const text=document.createElement('p');text.textContent=m.body;const time=document.createElement('small');time.textContent=(m.mine?'Toi':'Ton ami')+' · '+new Date(m.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});row.append(time,text);if(m.code)row.append(button('Ouvrir le duel',()=>enter(m.code)));box.append(row);}if(atBottom)box.scrollTop=box.scrollHeight;
 }
 el('friends-open').onclick=async()=>{if(!isSignedIn()){open('account');tell('Connecte-toi pour ajouter tes amis.');return;}open('friends');try{await refresh();}catch(e){tell(e.message);}};
 el('friend-add').onsubmit=async e=>{e.preventDefault();if(posting)return;posting=true;try{await api('friends',{username:el('friend-name').value.trim()});el('friend-name').value='';tell('Demande envoyée.');await refresh();}catch(e){tell(e.message);}finally{posting=false;}};
 el('chat-form').onsubmit=async e=>{e.preventDefault();if(posting||!selected)return;posting=true;try{await api('friends/'+selected.id+'/messages',{body:el('chat-text').value});el('chat-text').value='';await messages();tell('');}catch(e){tell(e.message);}finally{posting=false;}};
 el('friend-remove').onclick=async()=>{if(!selected||!confirm('Retirer cet ami et fermer le chat ?'))return;try{await api('friends/'+selected.id+'/respond',{accept:false});await refresh();}catch(e){tell(e.message);}};
 el('friend-challenge').onclick=async()=>{if(posting||!selected)return;posting=true;try{const {duel}=await api('duels',{mode:el('friend-duel-mode').value,friendId:selected.id});await api('friends/'+selected.id+'/messages',{body:'Je te défie en '+FusionModes.get(duel.mode).name+' !',code:duel.code});await messages();tell('Défi envoyé ! Ouvre le duel pour attendre ton ami.');}catch(e){tell(e.message);}finally{posting=false;}};
 setInterval(()=>{if(!document.hidden&&el('online-dialog').open&&!el('friends-panel').hidden)refresh().catch(e=>tell(e.message));},2500);
})();
