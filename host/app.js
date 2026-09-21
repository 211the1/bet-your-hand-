(() => {
'use strict';

const generateBtn=document.getElementById('generate');
const startBtn=document.getElementById('start');
const codeEl=document.getElementById('room-code');
const countEl=document.getElementById('player-count');
const statusEl=document.getElementById('status');
const seatsEl=document.getElementById('seats');

let ws=null;
let session=null;
let creating=false;
let started=false;
let players=[];
let reconnectTimer=null;
let reconnecting=false;
const seatAssignments=new Map();
const seatTimers=new Map();
const testMode=new URLSearchParams(location.search).get('test')==='seats';

try{session=JSON.parse(localStorage.getItem('pyhHostSession')||'null')}catch{session=null}

const seatImages={
  'Bug':'/bug-seat.png',
  'Face':'/face-seat.png',
  'Ling Ling':'/ling-ling-seat.png',
  'Beanz':'/beanz-seat.png',
  'The One':'/the-one-seat.png',
  'Boone':'/boone-seat.png',
  'Chicken Joe':'/chicken-joe-seat.png',
  'Juby':'/juby-seat.png',
  'Meemaw':'/meemaw-seat.png'
};

const testPlayers=[
  {id:'test-1',name:'TEST 1',character:'Bug'},
  {id:'test-2',name:'TEST 2',character:'Face'},
  {id:'test-3',name:'TEST 3',character:'Ling Ling'},
  {id:'test-4',name:'TEST 4',character:'Beanz'},
  {id:'test-5',name:'TEST 5',character:'Boone'},
  {id:'test-6',name:'TEST 6',character:'Chicken Joe'}
];

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
  generateBtn.disabled=creating||started||testMode;
  startBtn.disabled=started || players.length<2 || !session || testMode;
  if(started||testMode){
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
      session={
        code:message.code,
        hostId:message.hostId,
        hostToken:message.hostToken
      };
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
      renderPlayers();
      updateButtons();
      status('GAME STARTED');
      return;
    }

    if(message.type==='STATE'){
      players=message.players||[];
      codeEl.textContent=message.roomCode||session?.code||'----';
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
    if(!session && !started){
      creating=false;
      updateButtons();
      status('NOT CONNECTED — TAP GENERATE CODE',true);
    }else if(session && !started){
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
    send({
      type:'RECONNECT',
      code:session.code,
      playerId:session.hostId,
      reconnectToken:session.hostToken
    });
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

if(testMode){
  players=testPlayers.slice();
  seatAssignments.clear();
  renderPlayers();
  updateButtons();
  status('TEST MODE — RANDOM SEAT MOVEMENTS');
}else{
  renderPlayers();
  updateButtons();

  if(session){
    codeEl.textContent=session.code||'----';
    reconnectSavedHost();
  }else{
    status('READY — GENERATE A CODE');
  }
}
})();