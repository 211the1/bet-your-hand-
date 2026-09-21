(() => {
'use strict';

const generateBtn=document.getElementById('generate');
const startBtn=document.getElementById('start');
const codeEl=document.getElementById('room-code');
const roundEl=document.getElementById('round-display');
const qrEl=document.getElementById('join-qr');
const countEl=document.getElementById('player-count');
const statusEl=document.getElementById('status');
const seatsEl=document.getElementById('seats');
const cardDisplay=document.getElementById('card-display');
const hostMenuButton=document.getElementById('host-menu-button');
const hostMenuPanel=document.getElementById('host-menu-panel');
const hostMenuClose=document.getElementById('host-menu-close');
const hostSoundButton=document.getElementById('host-sound');
const hostRestartButton=document.getElementById('host-restart');
const hostGenerateButton=document.getElementById('host-generate');
const hostStartButton=document.getElementById('host-start');
let hostSoundEnabled=true;
let hostWakeLock=null;

async function keepHostScreenAwake(){
  if(!('wakeLock' in navigator))return;
  if(document.visibilityState!=='visible')return;
  if(hostWakeLock&&!hostWakeLock.released)return;
  try{
    hostWakeLock=await navigator.wakeLock.request('screen');
    hostWakeLock.addEventListener('release',()=>{hostWakeLock=null});
  }catch{}
}


let ws=null;
let lastHostLastCardEvent=null;
let session=null;
let creating=false;
let started=false;
let players=[];
const gameScores=new Map();
let reconnectTimer=null;
let reconnecting=false;
const seatAssignments=new Map();
const seatTimers=new Map();

try{session=JSON.parse(localStorage.getItem('pyhHostSession')||'null')}catch{session=null}

const cardImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
const seatImages={'Bug':'/bug-seat.png','Face':'/face-seat.png','Ling Ling':'/ling-ling-seat.png','Beanz':'/beanz-seat.png','The One':'/the-one-seat.png','Boone':'/boone-seat.png','Chicken Joe':'/chicken-joe-seat.png','Juby':'/juby-seat.png','Meemaw':'/meemaw-seat.png'};
const colors=['Red','Blue','Green','Yellow'];

function characterImage(name){
  return name?({
    'Bug':'/Bug.jpg',
    'Face':'/Face.jpg',
    'Ling Ling':'/Ling_Ling.jpg',
    'Beanz':'/Beanz.jpg',
    'The One':'/The_One.jpg',
    'Boone':'/Boone.jpg',
    'Chicken Joe':'/Chicken_Joe.jpg',
    'Juby':'/Juby.jpg',
    'Meemaw':'/Meemaw.jpg'
  }[name]||''):'';
}

function cardColor(card){
  if(!card)return '';
  if(card.type==='CHARACTER'){
    const c=String(card.id||'').split('-')[0];
    return colors.includes(c)?c:(colors.includes(card.color)?card.color:'');
  }
  if(card.type==='SKIP'||card.type==='REVERSE'){
    const n=Number(String(card.id||'').split('-')[1]);
    return Number.isFinite(n)?colors[n%4]:(colors.includes(card.color)?card.color:'');
  }
  return colors.includes(card.color)?card.color:'';
}

function cardHtml(card){
  const c=card||{},
    name=c.character||({
      SKIP:'SKIP',
      REVERSE:'REVERSE',
      WILD:'WILD',
      PLAY_YOUR_HAND:'PLAY YOUR HAND'
    }[c.type]||'CARD'),
    img=characterImage(c.character),
    authoritativeColor=cardColor(c),
    color=authoritativeColor.toLowerCase();

  return '<div class="card table-card player-current color-'+escapeHtml(color)+'">'+
    (img?'<img class="card-face" src="'+img+'" alt="'+escapeHtml(name)+'">':'')+
    '<div class="card-name">'+escapeHtml(name)+'</div>'+
    (authoritativeColor?'<div class="card-color">'+escapeHtml(authoritativeColor)+'</div>':'<div class="card-type">'+escapeHtml((c.type||'CARD').replaceAll('_',' '))+'</div>')+
    '</div>';
}

function specialImage(card){
  if(!card)return '';
  const base='https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3';
  if(card.type==='WILD')return base+'/WILD.png';
  if(card.type==='PLAY_YOUR_HAND')return base+'/PLAY_YOUR_HAND.png';
  return '';
}

function specialModern(card,where='tv'){
  const c=card||{},type=c.type;
  if(type!=='SKIP'&&type!=='REVERSE')return '';
  const col=cardColor(c);
  const iconClass=type==='SKIP'?'skip-icon':'reverse-icon';
  return '<div class="modern-special '+type.toLowerCase()+' modern-'+String(col).toLowerCase()+' '+where+'"><div class="modern-special-icon '+iconClass+'" aria-hidden="true"></div><div class="modern-special-name">'+type+'</div></div>';
}


function renderPowerWheel(game){
  const existing=document.getElementById('host-power-wheel-overlay');
  const pending=game?.pending;
  const active=pending?.type==='SPIN_WHEEL'||pending?.type==='POWER_USED';
  if(!active){if(existing)existing.remove();return;}
  const result=game?.wheelResult||null;
  const landed=Number(result?.section||0);
  const rotation=landed>0?(1440-(landed-1)*40):0;
  const cls=pending.type==='SPIN_WHEEL'?'host-power-wheel-spin':(result?'host-power-wheel-land':'');
  if(existing){
    const wheel=existing.querySelector('.host-power-wheel');
    if(wheel){wheel.className='host-power-wheel '+cls;wheel.style.setProperty('--host-wheel-land',rotation+'deg');}
    return;
  }
  const overlay=document.createElement('div');
  overlay.id='host-power-wheel-overlay';overlay.className='host-power-wheel-overlay';
  overlay.innerHTML='<div class="host-power-wheel '+cls+'" style="--host-wheel-land:'+rotation+'deg"><img src="/assets/power_wheel_style2.png?v=1" alt="PLAY YOUR HAND Power Wheel"><div class="host-power-wheel-pointer">▼</div></div>';
  document.body.appendChild(overlay);
}

function renderTopCard(card,game){
  const discardEl=document.getElementById('host-discard-card');
  const deckCountEl=document.getElementById('host-deck-count');
  const discardCountEl=document.getElementById('host-discard-count');
  if(deckCountEl)deckCountEl.textContent='CARDS LEFT: '+Number(game?.deckCount??game?.cardsLeft??0);
  if(discardCountEl)discardCountEl.textContent='CARDS PLAYED: '+Number(game?.discardCount??0);
  if(!discardEl)return;
  if(!card){discardEl.innerHTML='';return;}

  const c=card||{},
    name=c.character||({SKIP:'SKIP',REVERSE:'REVERSE',WILD:'WILD',PLAY_YOUR_HAND:'PLAY YOUR HAND'}[c.type]||'CARD'),
    img=characterImage(c.character),
    color=cardColor(c).toLowerCase(),
    specialUrl=specialImage(c);

  const visual=specialUrl
    ?'<img class="tv-special-art" src="'+specialUrl+'" alt="'+escapeHtml(name)+'">'
    :(c.type==='SKIP'||c.type==='REVERSE')
      ?specialModern(c,'tv')
      :img
        ?'<img src="'+img+'" alt="'+escapeHtml(name)+'"><strong>'+escapeHtml(name)+'</strong><small>'+escapeHtml(cardColor(c)||'')+'</small>'
        :'<div class="special-card-symbol">'+escapeHtml((c.type||'CARD').replaceAll('_',' '))+'</div>';

  discardEl.innerHTML='<div class="tv-card '+(c.type==='SKIP'||c.type==='REVERSE'?'special-modern-host ':'')+'color-'+escapeHtml(color)+' '+(c.type==='WILD'?'wild ':'')+(c.type==='PLAY_YOUR_HAND'?'play-special':'')+'">'+visual+'</div>';
}
function updateJoinQr(code){
  if(!qrEl)return;
  const value=String(code||'').trim();
  if(!value||value==='----'){
    qrEl.style.display='none';
    qrEl.removeAttribute('src');
    return;
  }
  const playerUrl=location.origin+'/';
  qrEl.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data='+encodeURIComponent(playerUrl);
  qrEl.style.display='block';
}

function playHostCallSound(){
  if(!hostSoundEnabled)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const ctx=new C(),now=ctx.currentTime;
    [0,0.28,0.56].forEach((t,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=i===1?880:660;
      g.gain.setValueAtTime(.0001,now+t);
      g.gain.exponentialRampToValueAtTime(.45,now+t+.03);
      g.gain.exponentialRampToValueAtTime(.0001,now+t+.2);
      o.connect(g).connect(ctx.destination);o.start(now+t);o.stop(now+t+.22);
    });
    setTimeout(()=>ctx.close(),1000);
  }catch{}
}
function showHostActionEffect(type){
  document.querySelectorAll('.host-action-effect').forEach(x=>x.remove());
  const el=document.createElement('div');
  el.className='host-action-effect '+(type==='CALL_PLAYER'?'wake':'play-hand');
  el.innerHTML='<div class="host-action-flash"></div><div class="host-action-text">'+(type==='CALL_PLAYER'?'WAKE UP!':'PLAY YOUR HAND!')+'</div>';
  document.body.appendChild(el);
  if(type==='CALL_PLAYER')playHostCallSound();else playHostTone(880,.22);
  setTimeout(()=>{if(el.isConnected)el.remove()},3200);
}
function playHostTone(freq=660,duration=.12){
  if(!hostSoundEnabled)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.02);
    g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);
    setTimeout(()=>ctx.close(),300);
  }catch{}
}
function updateHostSoundButton(){
  if(hostSoundButton)hostSoundButton.textContent=hostSoundEnabled?'SOUND: ON':'SOUND: OFF';
}
function closeHostMenu(){if(hostMenuPanel)hostMenuPanel.classList.remove('show')}

function updateRound(round){
  if(roundEl)roundEl.textContent=Number(round)>0?'ROUND '+Number(round):'ROUND --';
}

function status(text,bad=false){
  statusEl.textContent=text;
  statusEl.style.color=bad?'#ff7070':'#21f17d';
}

function send(message){
  if(!ws || ws.readyState!==WebSocket.OPEN)return false;
  ws.send(JSON.stringify(message));
  return true;
}

function playerKey(p){
  return String(p.id||p.playerId||((p.name||'')+'|'+(p.character||'')));
}

function randomOpenSeat(used){
  const open=[];
  for(let i=1;i<=6;i++)if(!used.has(i))open.push(i);
  return open[Math.floor(Math.random()*open.length)];
}

function assignSeats(seatedPlayers){
  const activeKeys=new Set(seatedPlayers.map(playerKey));

  for(const key of seatAssignments.keys()){
    if(!activeKeys.has(key))seatAssignments.delete(key);
  }

  const used=new Set();
  for(const key of activeKeys){
    const seat=seatAssignments.get(key);
    if(seat)used.add(seat);
  }

  for(const p of seatedPlayers){
    const key=playerKey(p);
    if(!seatAssignments.has(key)){
      const seat=randomOpenSeat(used);
      if(seat){
        seatAssignments.set(key,seat);
        used.add(seat);
      }
    }
  }
}

function updateGameScores(gamePlayers){
  gameScores.clear();
  for(const p of gamePlayers||[])gameScores.set(playerKey(p),Number(p.points??500));
}

function clearSeatTimer(seat){
  const timer=seatTimers.get(seat);
  if(timer){
    clearTimeout(timer);
    seatTimers.delete(seat);
  }
}

function scheduleSeatMovement(seatEl,seat){
  clearSeatTimer(seat);
  const delay=1500+Math.random()*4000;
  const timer=setTimeout(()=>{
    if(!seatEl.isConnected)return;
    const moves=['seat-rock','seat-bounce','seat-wiggle'];
    const movement=moves[Math.floor(Math.random()*moves.length)];
    seatEl.classList.remove(...moves);
    void seatEl.offsetWidth;
    seatEl.classList.add(movement);
    const done=()=>{
      seatEl.classList.remove(movement);
      seatEl.removeEventListener('animationend',done);
      scheduleSeatMovement(seatEl,seat);
    };
    seatEl.addEventListener('animationend',done);
  },delay);
  seatTimers.set(seat,timer);
}

function renderPlayers(){
  players=players||[];
  const seatedPlayers=players.slice(0,6);
  assignSeats(seatedPlayers);

  for(let i=1;i<=6;i++)clearSeatTimer(i);

  countEl.textContent=seatedPlayers.length+' / 6 PLAYERS';
  seatsEl.innerHTML=seatedPlayers.map(p=>{
    const img=seatImages[p.character]||'';
    const seat=seatAssignments.get(playerKey(p));
    return '<div class="seat s'+seat+'" data-seat="'+seat+'" data-player-id="'+escapeHtml(p.id||'')+'">'+
      '<div class="seat-score">SCORE: '+escapeHtml(gameScores.get(playerKey(p))??500)+'</div>'+
      (img?'<img src="'+img+'" alt="">':'')+
      '<div class="seat-label"><b>'+escapeHtml(p.character||'')+'</b>'+escapeHtml(p.name||'')+'</div>'+
      '</div>';
  }).join('');

  seatsEl.querySelectorAll('.seat').forEach(el=>{
    scheduleSeatMovement(el,Number(el.dataset.seat));
  });
}

function showHostLastCard(event){
  if(!event||event.id===lastHostLastCardEvent)return;
  lastHostLastCardEvent=event.id;
  const overlay=document.createElement('div');
  overlay.className='last-card-video-overlay';
  const video=document.createElement('video');
  video.className='last-card-video';
  video.src='/last-card.mp4';
  video.autoplay=true;
  video.muted=false;
  video.playsInline=true;
  video.preload='auto';
  overlay.appendChild(video);
  const sound=document.createElement('button');
  sound.className='last-card-video-sound';
  sound.textContent='SOUND — TAP FOR SOUND';
  sound.onclick=()=>{video.muted=false;video.play().catch(()=>{});sound.remove()};
  overlay.appendChild(sound);
  document.body.appendChild(overlay);
  const finish=()=>{if(overlay.isConnected)overlay.remove()};
  video.addEventListener('ended',finish,{once:true});
  video.addEventListener('error',finish,{once:true});
  video.play().then(()=>sound.remove()).catch(()=>{video.muted=true;video.play().catch(finish)});
}

function showPlayerEmoji(message){
  const targetId=String(message?.targetPlayerId||'');
  const seatEl=seatsEl.querySelector('.seat[data-player-id="'+CSS.escape(targetId)+'"]');
  if(!seatEl)return;
  seatEl.querySelectorAll('.host-player-emoji').forEach(x=>x.remove());
  const el=document.createElement('div');
  el.className='host-player-emoji';
  if(message.emoji==='CUSTOM'){
    const img=document.createElement('img');
    img.src='/assets/custom_emoji.png?v=3';
    img.alt='Custom reaction';
    el.appendChild(img);
  }else{
    el.textContent=String(message.emoji||'🙂');
  }
  seatEl.appendChild(el);
  setTimeout(()=>{if(el.isConnected)el.remove()},1750);
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>'"]/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function updateButtons(){
  generateBtn.disabled=creating||started;
  startBtn.disabled=started || players.length<2 || !session;
  if(hostStartButton)hostStartButton.disabled=started || players.length<2 || !session;
  generateBtn.style.display='none';
  startBtn.style.display='none';
}

function resetToReady(message){
  session=null;
  players=[];
  started=false;
  seatAssignments.clear();
  for(let i=1;i<=6;i++)clearSeatTimer(i);
  localStorage.removeItem('pyhHostSession');
  codeEl.textContent='----';
  updateRound(null);
  renderPlayers();
  updateButtons();
  status(message||'READY — GENERATE A CODE');
}

function scheduleReconnect(){
  if(reconnectTimer||creating||!session)return;
  reconnectTimer=setTimeout(()=>{
    reconnectTimer=null;
    reconnectSavedHost();
  },1500);
}

function connectAndCreate(){
  if(creating)return;
  creating=true;
  session=null;
  seatAssignments.clear();
  localStorage.removeItem('pyhHostSession');
  codeEl.textContent='----';
  players=[];
  renderPlayers();
  updateButtons();
  status('CONNECTING — CREATING ROOM…');

  if(ws){
    try{ws.close()}catch{}
    ws=null;
  }

  const protocol=location.protocol==='https:'?'wss:':'ws:';
  ws=new WebSocket(protocol+'//'+location.host);

  ws.addEventListener('open',()=>{
    status('CONNECTED — CREATING ROOM…');
    send({type:'CREATE_ROOM',name:'Host'});
  });

  ws.addEventListener('message',event=>{
    let message;
    try{message=JSON.parse(event.data)}catch{return}

    if(message.type==='CALL_PLAYER'){showHostActionEffect('CALL_PLAYER');return}
    if(message.type==='PLAY_YOUR_HAND_EVENT'){showHostActionEffect('PLAY_YOUR_HAND');return};
    if(message.type==='LAST_CARD_EVENT'){showHostLastCard(message.event);return}
    if(message.type==='PLAYER_EMOJI'){showPlayerEmoji(message);return}

    if(message.type==='ERROR'){
      creating=false;
      resetToReady(message.error||'SERVER ERROR — TRY AGAIN');
      status(message.error||'SERVER ERROR — TRY AGAIN',true);
      return;
    }

    if(message.type==='ROOM_CREATED'){
      creating=false;
      session={code:message.code,hostId:message.hostId,hostToken:message.hostToken};
      localStorage.setItem('pyhHostSession',JSON.stringify(session));
      codeEl.textContent=message.code;
      updateRound(null);
      updateJoinQr(message.code);
      players=[];
      renderPlayers();
      updateButtons();
      status('ROOM READY — PLAYERS CAN JOIN');
      return;
    }

    if(message.type==='RECONNECTED'){
      creating=false;
      codeEl.textContent=session?.code||'----';
      updateButtons();
      status('ROOM RECONNECTED — PLAYERS CAN JOIN');
      return;
    }

    if(message.type==='HOST_GAME_STARTED'){
      started=true;
      players=message.players||players;
      updateGameScores(message.game?.players);
      renderTopCard(message.game?.topCard||null,message.game);
      updateRound(message.game?.round);
      renderPowerWheel(message.game);
      if(message.game?.lastCardEvent)showHostLastCard(message.game.lastCardEvent);else if(!message.game?.lastCardEvent)lastHostLastCardEvent=null;
      renderPlayers();
      updateButtons();
      status('GAME STARTED');
      return;
    }

    if(message.type==='STATE'){
      players=message.players||[];
      updateGameScores(message.game?.players);
      codeEl.textContent=message.roomCode||session?.code||'----';
      updateJoinQr(message.roomCode||session?.code||'');
      renderTopCard(message.game?.topCard||null,message.game);
      renderPowerWheel(message.game);
      if(message.game?.lastCardEvent)showHostLastCard(message.game.lastCardEvent);else if(!message.game?.lastCardEvent)lastHostLastCardEvent=null;
      if(message.game){
        started=true;
        status('GAME STARTED');
      }else{
        started=false;
        status('ROOM READY — WAITING FOR PLAYERS');
      }
      renderPlayers();
      updateButtons();
    }
  });

  ws.addEventListener('error',()=>{
    creating=false;
    updateButtons();
    status('CONNECTION ERROR — TAP GENERATE CODE AGAIN',true);
  });

  ws.addEventListener('close',()=>{
    if(!session&&!started){
      creating=false;
      updateButtons();
      status('NOT CONNECTED — TAP GENERATE CODE',true);
    }else if(session&&!started){
      status('HOST DISCONNECTED — RECONNECTING…',true);
      scheduleReconnect();
    }
  });
}

function reconnectSavedHost(){
  if(!session||reconnecting)return;
  reconnecting=true;
  const protocol=location.protocol==='https:'?'wss:':'ws:';
  ws=new WebSocket(protocol+'//'+location.host);

  ws.addEventListener('open',()=>{
    reconnecting=false;
    status('RECONNECTING HOST…');
    send({type:'RECONNECT',code:session.code,playerId:session.hostId,reconnectToken:session.hostToken});
  });

  ws.addEventListener('message',event=>{
    let message;
    try{message=JSON.parse(event.data)}catch{return}

    if(message.type==='LAST_CARD_EVENT'){showHostLastCard(message.event);return}

    if(message.type==='PLAYER_EMOJI'){showPlayerEmoji(message);return}

    if(message.type==='ERROR'){
      resetToReady('READY — GENERATE A NEW CODE');
      status('READY — GENERATE A NEW CODE');
      return;
    }

    if(message.type==='RECONNECTED'){
      codeEl.textContent=session.code;
      updateJoinQr(session.code);
      status('ROOM RECONNECTED — PLAYERS CAN JOIN');
      return;
    }

    if(message.type==='STATE'){
      players=message.players||[];
      updateGameScores(message.game?.players);
      started=Boolean(message.game);
      codeEl.textContent=message.roomCode||session.code;
      renderTopCard(message.game?.topCard||null,message.game);
      updateRound(message.game?.round);
      renderPowerWheel(message.game);
      renderPlayers();
      updateButtons();
      status(started?'GAME STARTED':'ROOM READY — WAITING FOR PLAYERS');
    }
  });

  ws.addEventListener('error',()=>{
    reconnecting=false;
    status('HOST CONNECTION ERROR — RECONNECTING…',true);
    scheduleReconnect();
  });
  ws.addEventListener('close',()=>{
    reconnecting=false;
    if(session&&!started)scheduleReconnect();
  });
}

hostMenuButton?.addEventListener('click',()=>hostMenuPanel?.classList.toggle('show'));
hostMenuClose?.addEventListener('click',closeHostMenu);
hostSoundButton?.addEventListener('click',()=>{
  hostSoundEnabled=!hostSoundEnabled;
  updateHostSoundButton();
  if(hostSoundEnabled)playHostTone(880,.16);
});
hostGenerateButton?.addEventListener('click',()=>{
  keepHostScreenAwake();
  closeHostMenu();
  connectAndCreate();
});
hostStartButton?.addEventListener('click',()=>{
  if(hostStartButton.disabled)return;
  keepHostScreenAwake();
  if(!send({type:'START_GAME'})){
    status('NOT CONNECTED — TRY AGAIN',true);
    return;
  }
  closeHostMenu();
  status('STARTING GAME…');
});
hostRestartButton?.addEventListener('click',()=>{
  keepHostScreenAwake();
  if(!session||!send({type:'RESTART_GAME'})){
    status('NOT CONNECTED — GENERATE A NEW CODE',true);
    return;
  }
  closeHostMenu();
  status('RESTARTING — CREATING NEW ROOM…');
});
generateBtn.addEventListener('click',()=>{keepHostScreenAwake();connectAndCreate()});
startBtn.addEventListener('click',()=>{
  if(startBtn.disabled)return;
  keepHostScreenAwake();
  if(!send({type:'START_GAME'})){
    status('NOT CONNECTED — TRY AGAIN',true);
    return;
  }
  status('STARTING GAME…');
});

const hostWanderer=document.getElementById('host-wanderer');
const hostWalkPoints=[[8,18],[92,18],[92,68],[8,68]];
let hostWalkIndex=0;
function moveHostCharacter(){
  if(!hostWanderer)return;
  const next=hostWalkPoints[hostWalkIndex%hostWalkPoints.length];
  const currentX=parseFloat(hostWanderer.style.left)||8;
  hostWanderer.classList.toggle('host-walk-right',next[0]>=currentX);
  hostWanderer.classList.toggle('host-walk-left',next[0]<currentX);
  hostWanderer.style.left=next[0]+'%';
  hostWanderer.style.top=next[1]+'%';
  hostWalkIndex++;
}
setTimeout(()=>{
  moveHostCharacter();
  setInterval(moveHostCharacter,6000);
},1200);

renderPlayers();
updateButtons();
updateHostSoundButton();

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&(session||started))keepHostScreenAwake();
});

if(session){
  keepHostScreenAwake();
  codeEl.textContent=session.code||'----';
  updateJoinQr(session.code||'');
  reconnectSavedHost();
}else{
  status('READY — GENERATE A CODE');
}
})();