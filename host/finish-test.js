(() => {
'use strict';
const SEAT_IMAGES={Bug:'/bug-seat.png?v=1',Face:'/face-seat.png?v=1','Ling Ling':'/ling-ling-seat.png?v=1',Beanz:'/beanz-seat.png?v=1','The One':'/the-one-seat.png?v=1',Boone:'/boone-seat.png?v=1','Chicken Joe':'/chicken-joe-seat.png?v=1',Juby:'/juby-seat.png?v=1',Meemaw:'/meemaw-seat.png?v=1'};
let shown=false,finishAudio=null;
function styles(){if(document.getElementById('host-finish-live-styles'))return;const s=document.createElement('style');s.id='host-finish-live-styles';s.textContent=`#host-finish-live{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}.hfl-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=5') center/100% 100% no-repeat}.hfl-winner{position:absolute;left:47.5%;top:51.5%;transform:translate(-50%,-50%);width:clamp(130px,20vw,250px);height:clamp(190px,32vw,360px);display:flex;align-items:center;justify-content:flex-start;flex-direction:column}.hfl-score{position:absolute;left:50%;top:-6vh;transform:translateX(-50%);font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;line-height:1;white-space:nowrap;z-index:3}.hfl-winner img{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000)}.hfl-host{position:absolute;left:-18%;bottom:11vh;width:clamp(200px,30vw,380px);z-index:2;pointer-events:none;animation:hflwalk 18s linear infinite}.hfl-host img{display:block;width:100%;height:auto;filter:drop-shadow(0 8px 8px #000);animation:hflbob 1.05s ease-in-out infinite}@keyframes hflwalk{0%{left:-18%;transform:scaleX(1)}49%{left:103%;transform:scaleX(1)}50%{left:103%;transform:scaleX(-1)}99%{left:-18%;transform:scaleX(-1)}100%{left:-18%;transform:scaleX(1)}}@keyframes hflbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}#host-finish-live button{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000}`;document.head.appendChild(s)}
function playFinishMusic(){try{if(finishAudio){finishAudio.pause();finishAudio.currentTime=0}finishAudio=new Audio('/assets/finish-screen.mp3?v=1');finishAudio.preload='auto';finishAudio.volume=1;const p=finishAudio.play();if(p?.catch)p.catch(()=>{const resume=()=>{finishAudio?.play().catch(()=>{});document.removeEventListener('pointerdown',resume,{capture:true});document.removeEventListener('keydown',resume,{capture:true})};document.addEventListener('pointerdown',resume,{capture:true,once:true});document.addEventListener('keydown',resume,{capture:true,once:true})})}catch{}}
function show(game){if(shown||game?.phase!=='finished')return;shown=true;styles();document.querySelector('#host-finish-test-overlay')?.remove();const players=[...(game.players||[])];const win=players.find(p=>String(p.id)===String(game.winner))||players.sort((a,b)=>Number(b.points)-Number(a.points))[0]||{};const character=SEAT_IMAGES[win.character]?win.character:'Bug';const score=Number.isFinite(Number(win.points))?Number(win.points):500;const o=document.createElement('div');o.id='host-finish-live';o.innerHTML=`<div class="hfl-bg"></div><div class="hfl-host"><img src="/host-winner.png?v=1" alt=""></div><div class="hfl-winner"><div class="hfl-score">${score}</div><img src="${SEAT_IMAGES[character]}" alt="${character}"></div><button type="button">PLAY AGAIN</button>`;document.body.appendChild(o);playFinishMusic();document.getElementById('host-menu-button')?.style.setProperty('display','none','important');o.querySelector('button').onclick=()=>{finishAudio?.pause();finishAudio=null;o.remove();shown=false;document.getElementById('host-menu-button')?.style.removeProperty('display')}}
function inspect(event){try{const m=JSON.parse(event?.data);if(m.type==='STATE'&&m.game?.phase==='finished')show(m.game)}catch{}}
function installStateTap(){
  const Native=window.WebSocket;
  if(!Native||Native.__pyhHostFinishSocketTap)return;
  function WrappedWebSocket(...args){
    const socket=new Native(...args);
    window.__pyhHostSocket=socket;
    socket.addEventListener('message',inspect);
    return socket;
  }
  WrappedWebSocket.prototype=Native.prototype;
  // Preserve the native WebSocket constants used by the existing host game code.
  WrappedWebSocket.CONNECTING=Native.CONNECTING;
  WrappedWebSocket.OPEN=Native.OPEN;
  WrappedWebSocket.CLOSING=Native.CLOSING;
  WrappedWebSocket.CLOSED=Native.CLOSED;
  try{Object.setPrototypeOf(WrappedWebSocket,Native)}catch{}
  try{Object.defineProperty(WrappedWebSocket,'__pyhHostFinishSocketTap',{value:true})}catch{}
  window.WebSocket=WrappedWebSocket;
}
function installFinishButton(){
  const panel=document.getElementById('host-menu-panel');
  const box=panel?.querySelector('.host-menu-box');
  if(!panel||!box||document.getElementById('host-test-finish'))return;
  const b=document.createElement('button');
  b.id='host-test-finish';
  b.type='button';
  b.className='host-menu-button test-finish';
  b.textContent='FINISH TEST';
  b.title='Test the existing connected finish-screen flow without playing the whole game';
  b.onclick=()=>{
    const socket=window.__pyhHostSocket;
    if(!socket||socket.readyState!==window.WebSocket.OPEN){alert('Host is not connected yet.');return}
    socket.send(JSON.stringify({type:'TEST_FINISH_SCREEN'}));
    panel.classList.remove('show');
  };
  const close=document.getElementById('host-menu-close');
  box.insertBefore(b,close||null);
}
installStateTap();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFinishButton);else installFinishButton();
setTimeout(installFinishButton,500);
setInterval(installFinishButton,1000);
})();
