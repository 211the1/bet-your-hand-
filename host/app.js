(() => {
'use strict';

const generateBtn=document.getElementById('generate');
const startBtn=document.getElementById('start');
const codeEl=document.getElementById('room-code');
const countEl=document.getElementById('player-count');
const statusEl=document.getElementById('status');
const seatsEl=document.getElementById('seats');
const cardDisplay=document.getElementById('card-display');

let ws=null;
let session=null;
let creating=false;
let started=false;
let players=[];
let reconnectTimer=null;
let reconnecting=false;
const seatAssignments=new Map();
const seatTimers=new Map();

try{session=JSON.parse(localStorage.getItem('pyhHostSession')||'null')}catch{session=null}

const cardImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
const seatImages={'Bug':'/bug-seat.png','Face':'/face-seat.png','Ling Ling':'/ling-ling-seat.png','Beanz':'/beanz-seat.png','The One':'/the-one-seat.png','Boone':'/boone-seat.png','Chicken Joe':'/chicken-joe-seat.png','Juby':'/juby-seat.png','Meemaw':'/meemaw-seat.png'};
function topCardColor(card){
  if(!card)return '';
  if(card.type==='CHARACTER'){
    const c=String(card.id||'').split('-')[0].toLowerCase();
    return ['red','blue','green','yellow'].includes(c)?c:(String(card.color||'').toLowerCase());
  }
  if(card.type==='SKIP'||card.type==='REVERSE'){
    const n=Number(String(card.id||'').split('-')[1]);
    return Number.isFinite(n)?['red','blue','green','yellow'][n%4]:String(card.color||'').toLowerCase();
  }
  return String(card.color||'').toLowerCase();
}
function renderTopCard(card,game){
  const discardEl=document.getElementById('host-discard-card');
  const deckCountEl=document.getElementById('host-deck-count');
  const discardCountEl=document.getElementById('host-discard-count');
  if(deckCountEl)deckCountEl.textContent='CARDS LEFT: '+Number(game?.deckCount??game?.cardsLeft??0);
  if(discardCountEl)discardCountEl.textContent='CARDS PLAYED: '+Number(game?.discardCount??0);
  if(!discardEl)return;
  if(!card){discardEl.innerHTML='';return;}
  const type=String(card.type||'').toUpperCase();
  const name=card.character||({'SKIP':'SKIP','REVERSE':'REVERSE','WILD':'WILD','PLAY_YOUR_HAND':'PLAY YOUR HAND'}[type]||'CARD');
  const color=topCardColor(card);
  const img=cardImages[card.character];
  const specialUrl=type==='WILD'?'https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3/WILD.png':type==='PLAY_YOUR_HAND'?'https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3/PLAY_YOUR_HAND.png':'';
  if(specialUrl){
    discardEl.innerHTML='<div class="card-display-card '+(type==='WILD'?'wild':'play-special')+'"><img src="'+specialUrl+'" alt="'+escapeHtml(name)+'"></div>';
  }else if(type==='SKIP'||type==='REVERSE'){
    discardEl.innerHTML='<div class="card-display-card color-'+escapeHtml(color)+' special">'+escapeHtml(name)+'</div>';
  }else if(img){
    discardEl.innerHTML='<div class="card-display-card color-'+escapeHtml(color)+'"><img src="'+img+'" alt="'+escapeHtml(name)+'"><strong>'+escapeHtml(name)+'</strong><small>'+escapeHtml(color||'')+'</small></div>';
  }else{
    discardEl.innerHTML='<div class="card-display-card color-'+escapeHtml(color)+' special">'+escapeHtml(name)+'</div>';
  }
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
    return '<div class="seat s'+seat+'" data-seat="'+seat+'">'+
      (img?'<img src="'+img+'" alt="">':'')+
      '<div class="seat-label"><b>'+escapeHtml(p.character||'')+'</b>'+escapeHtml(p.name||'')+'</div>'+
      '</div>';
  }).join('');

  seatsEl.querySelectorAll('.seat').forEach(el=>{
    scheduleSeatMovement(el,Number(el.dataset.seat));
  });
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>'"]/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function updateButtons(){
  generateBtn.disabled=creating||started;
  startBtn.disabled=started || players.length<2 || !session;
  if(started){
    generateBtn.style.display='none';
    startBtn.style.display='none';
  }else{
    generateBtn.style.display='';
    startBtn.style.display='';
  }
}

function resetToReady(message){
  session=null;
  players=[];
  started=false;
  seatAssignments.clear();
  for(let i=1;i<=6;i++)clearSeatTimer(i);
  localStorage.removeItem('pyhHostSession');
  codeEl.textContent='----';
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
      renderTopCard(message.game?.topCard||null,message.game);
      renderPlayers();
      updateButtons();
      status('GAME STARTED');
      return;
    }

    if(message.type==='STATE'){
      players=message.players||[];
      codeEl.textContent=message.roomCode||session?.code||'----';
      renderTopCard(message.game?.topCard||null,message.game);
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

    if(message.type==='ERROR'){
      resetToReady('READY — GENERATE A NEW CODE');
      status('READY — GENERATE A NEW CODE');
      return;
    }

    if(message.type==='RECONNECTED'){
      codeEl.textContent=session.code;
      status('ROOM RECONNECTED — PLAYERS CAN JOIN');
      return;
    }

    if(message.type==='STATE'){
      players=message.players||[];
      started=Boolean(message.game);
      codeEl.textContent=message.roomCode||session.code;
      renderTopCard(message.game?.topCard||null,message.game);
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

generateBtn.addEventListener('click',connectAndCreate);
startBtn.addEventListener('click',()=>{
  if(startBtn.disabled)return;
  if(!send({type:'START_GAME'})){
    status('NOT CONNECTED — TRY AGAIN',true);
    return;
  }
  status('STARTING GAME…');
});

renderPlayers();
updateButtons();

if(session){
  codeEl.textContent=session.code||'----';
  reconnectSavedHost();
}else{
  status('READY — GENERATE A CODE');
}
})();