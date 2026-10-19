/* Royal celebrations run outside the move/render path; no gameplay timers or rewards. */
(()=>{
 const seen=new Set();let previous=null,themeBuffer=null,building=null,source=null,utterance=null,hideTimer,generation=0,voiceBuffer=null,voiceLoading=null,voiceSource=null;
 function stop(){generation++;try{source?.stop();}catch{}source=null;try{voiceSource?.stop();}catch{}voiceSource=null;if(utterance){window.speechSynthesis?.cancel();utterance=null;}}
 async function soundtrack(context,volume){
  if(!context||context.state!=='running'||volume<=0||document.hidden)return;
  const ticket=generation;
  const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)return;
  if(!themeBuffer){
   if(!building)building=(async()=>{
    const off=new Offline(1,Math.ceil(4.8*22050),22050);
    const note=(frequency,at,length,gain,type='triangle')=>{const osc=off.createOscillator(),amp=off.createGain();osc.type=type;osc.frequency.value=frequency;amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(gain,at+.025);amp.gain.exponentialRampToValueAtTime(.0001,at+length);osc.connect(amp);amp.connect(off.destination);osc.start(at);osc.stop(at+length);};
    // Original coronation motif: velvet low fifths, brass-like triads, crystalline response.
    [[196,0,.28],[261.63,.32,.28],[329.63,.64,.28],[392,.96,.5],[349.23,1.52,.25],[392,1.84,.3],[523.25,2.24,1.5]].forEach(([f,t,d])=>{note(f,t,d,.085);note(f*2,t+.02,d,.022,'sine');});
    for(const [at,root]of [[0,130.81],[.96,98],[2.24,130.81]]){note(root,at,1.6,.055,'sine');note(root*1.5,at,1.6,.026,'sine');}
    themeBuffer=await off.startRendering();return themeBuffer;
   })().catch(()=>null).finally(()=>{building=null;});
   await building;
  }
  if(ticket!==generation||!themeBuffer||!window.FusionUI?.soundEnabled||document.hidden||window.FusionUI.sfxVolume<=0)return;
  try{source?.stop();}catch{}
  const voice=context.createBufferSource(),gain=context.createGain();voice.buffer=themeBuffer;gain.gain.value=window.FusionUI.sfxVolume*.6;voice.connect(gain);gain.connect(context.destination);source=voice;voice.onended=()=>{voice.disconnect();gain.disconnect();if(source===voice)source=null;};voice.start();
 }
 function prepareVoice(context){
  if(voiceBuffer)return voiceBuffer;
  if(!voiceLoading)voiceLoading=fetch('/audio/king-victory.mp3').then(response=>{if(!response.ok)throw Error('Voice unavailable');return response.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).then(buffer=>voiceBuffer=buffer).catch(()=>null);
  return voiceLoading;
 }
 async function announce(context,volume){
  const ticket=generation;if(!context||volume<=0||document.hidden)return;
  const buffer=await prepareVoice(context);
  if(ticket!==generation||!window.FusionUI?.soundEnabled||window.FusionUI.sfxVolume<=0||document.hidden)return;
  if(!buffer){proclaim();return;}
  try{voiceSource?.stop();}catch{}
  const clip=context.createBufferSource(),gain=context.createGain();clip.buffer=buffer;gain.gain.value=window.FusionUI.sfxVolume;clip.connect(gain);gain.connect(context.destination);voiceSource=clip;clip.onended=()=>{clip.disconnect();gain.disconnect();if(voiceSource===clip)voiceSource=null;};clip.start();
 }
 function proclaim(){
  if(!window.FusionUI?.soundEnabled||window.FusionUI.sfxVolume<=0||document.hidden||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
  const speech=new SpeechSynthesisUtterance('The king has won');speech.lang='en-GB';speech.pitch=.65;speech.rate=.83;speech.volume=window.FusionUI.sfxVolume;
  const voices=window.speechSynthesis.getVoices();speech.voice=voices.find(v=>/^en-GB/i.test(v.lang)&&/daniel|george|arthur|male/i.test(v.name))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
  speech.onend=speech.onerror=()=>{if(utterance===speech)utterance=null;};utterance=speech;window.speechSynthesis.speak(speech);
 }
 function celebrate(){
  const host=document.getElementById('royal-victory');if(host){clearTimeout(hideTimer);host.hidden=false;host.textContent='♛ THE KING HAS WON';hideTimer=setTimeout(()=>{host.hidden=true;},4200);}
  window.FusionUI?.royalMusic();if(window.FusionUI?.royalVoice)window.FusionUI.royalVoice();else proclaim();
 }
 window.FusionRoyal={soundtrack,prepareVoice,announce,stop,observe(duel){
  const key=duel.code+':'+(duel.series?.round||1),wasPlaying=previous?.key===key&&previous.status!=='finished';previous={key,status:duel.status};
  if(duel.status!=='finished'||!wasPlaying||seen.has(key))return;
  seen.add(key);if(seen.size>64)seen.delete(seen.values().next().value);
  if(duel.winner!==duel.me.id||window.FusionSkins?.selected!=='king'||document.hidden)return;
  celebrate();
 }};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
