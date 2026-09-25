(()=>{
'use strict';
const isHost=!document.body?.classList.contains('player-page')&&!!document.getElementById('host-wanderer');
if(!isHost)return;
const old=document.getElementById('host-wanderer');
if(old)old.classList.add('pyh-old-walk-hidden');
if(document.getElementById('pyh-host-only-wanderer'))return;
const style=document.createElement('style');
style.id='pyh-host-only-wander-style';
style.textContent=`
#host-wanderer.pyh-old-walk-hidden{display:none!important}
.pyh-host-only-wanderer{position:fixed!important;z-index:99990!important;width:clamp(130px,20vw,270px)!important;height:auto!important;pointer-events:auto!important;filter:drop-shadow(0 8px 10px rgba(0,0,0,.55));will-change:transform;animation:pyhHostWander 22s ease-in-out infinite alternate!important}
.pyh-host-only-wanderer img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;animation:pyhHostBob .62s ease-in-out infinite!important}
@keyframes pyhHostWander{0%{left:3%;bottom:8%;transform:rotate(0deg)}18%{left:22%;bottom:16%;transform:rotate(2deg)}38%{left:52%;bottom:10%;transform:rotate(-2deg)}58%{left:80%;bottom:19%;transform:rotate(1deg)}78%{left:61%;bottom:29%;transform:rotate(-1deg)}100%{left:10%;bottom:14%;transform:rotate(0deg)}}
@keyframes pyhHostBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.pyh-host-alert{position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;pointer-events:none;background:rgba(255,255,255,.82);animation:pyhHostFlash .45s steps(2,end) 6}
.pyh-host-alert-text{font-family:Impact,"Arial Black",system-ui,sans-serif;font-weight:1000;font-size:clamp(44px,10vw,120px);letter-spacing:2px;color:#fff;text-align:center;text-shadow:5px 5px 0 #000,0 0 18px #1687ff,0 0 35px #00eaff;animation:pyhHostAlertPulse .28s steps(2,end) infinite}
.pyh-host-alert.easter{animation-duration:.45s;animation-iteration-count:7}
.pyh-host-alert.easter .pyh-host-alert-text{color:#ffd400;text-shadow:5px 5px 0 #000,0 0 18px #ff3b3b,0 0 35px #ffd400}
@keyframes pyhHostFlash{0%,100%{opacity:0}50%{opacity:1}}
@keyframes pyhHostAlertPulse{0%,100%{transform:scale(.94)}50%{transform:scale(1.08)}}
@media(max-width:600px){.pyh-host-only-wanderer{width:clamp(110px,34vw,200px)!important;bottom:9%!important}.pyh-host-alert-text{font-size:clamp(34px,13vw,82px)}}
`;
document.head.appendChild(style);
const wrap=document.createElement('div');
wrap.id='pyh-host-only-wanderer';
wrap.className='pyh-host-only-wanderer';
const img=document.createElement('img');
img.src='/host-character.png?v=4';
img.alt='';
img.draggable=false;
wrap.appendChild(img);
wrap.addEventListener('click',()=>{try{const a=new Audio('/host-sound.mp3');a.currentTime=0;a.play().catch(()=>{})}catch{}});
document.body.appendChild(wrap);
function callSound(){if(typeof window.playCallSound==='function'){try{window.playCallSound();return}catch{}}}
function easterSound(){if(typeof window.playEasterLaugh==='function'){try{window.playEasterLaugh();return}catch{}}}
function showAlert(text,easter=false){document.querySelectorAll('.pyh-host-alert').forEach(x=>x.remove());const el=document.createElement('div');el.className='pyh-host-alert'+(easter?' easter':'');const t=document.createElement('div');t.className='pyh-host-alert-text';t.textContent=text;el.appendChild(t);document.body.appendChild(el);setTimeout(()=>el.remove(),easter?3200:2200)}
let socket=null;
let hostSession=null;
try{hostSession=JSON.parse(localStorage.getItem('pyhHostSession')||'null')}catch{}
function connect(){if(!hostSession?.code||!hostSession?.hostId||!hostSession?.hostToken)return;try{socket?.close()}catch{}const proto=location.protocol==='https:'?'wss:':'ws:';socket=new WebSocket(proto+'//'+location.host);socket.onopen=()=>{};socket.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='CALL_PLAYER'){callSound();showAlert('WAKE UP!');}else if(m.type==='EASTER_EGG'){easterSound();showAlert('YOU’RE STUPID!',true)}}catch{}};socket.onclose=()=>setTimeout(connect,2000);socket.onerror=()=>{try{socket?.close()}catch{}}}
connect();
setInterval(()=>{try{const s=JSON.parse(localStorage.getItem('pyhHostSession')||'null');if(JSON.stringify(s)!==JSON.stringify(hostSession)){hostSession=s;connect()}}catch{}},3000);
})();
