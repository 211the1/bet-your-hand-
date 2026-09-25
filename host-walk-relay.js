(()=>{
'use strict';
const isPlayer=document.body?.classList.contains('player-page');
const isHost=!isPlayer&&!!document.getElementById('host-wanderer');
if(!isPlayer&&!isHost)return;
const sessionKey=isPlayer?'byhPlayerSession':'pyhHostSession';
const readSession=()=>{try{return JSON.parse(localStorage.getItem(sessionKey)||'null')}catch{return null}};
let players=[],preview=null,actor=null,activeMarker='';
const STEP=11000,GAP=700,TOTAL_PER_SCREEN=STEP+GAP;
function ensureStyle(){if(document.getElementById('pyh-walk-relay-style'))return;const st=document.createElement('style');st.id='pyh-walk-relay-style';st.textContent=`
.host-walk-overlay{display:none!important}#host-wanderer.pyh-old-walk-hidden{display:none!important}
.pyh-relay-actor{position:fixed!important;left:0!important;top:auto!important;bottom:7%!important;width:clamp(130px,20vw,270px)!important;height:auto!important;z-index:99990!important;margin:0!important;padding:0!important;pointer-events:none!important;filter:drop-shadow(0 8px 10px rgba(0,0,0,.55));will-change:transform;display:block}
.pyh-relay-actor.clickable{pointer-events:auto!important;cursor:pointer!important;z-index:99999!important}.pyh-relay-actor img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;transform-origin:center bottom!important;animation:pyhRealWalk .58s ease-in-out infinite!important;will-change:transform}
.pyh-relay-actor.pyh-left img{transform:scaleX(-1)}
@keyframes pyhRealWalk{0%,100%{transform:translateY(0) rotate(0deg) scaleY(1)}25%{transform:translateY(-6px) rotate(-2deg) scaleY(.985)}50%{transform:translateY(0) rotate(0deg) scaleY(1)}75%{transform:translateY(-6px) rotate(2deg) scaleY(.985)}}
@media(max-width:600px){.pyh-relay-actor{width:clamp(110px,34vw,200px)!important;bottom:9%!important}}
`;document.head.appendChild(st)}
function connectPreview(){const s=readSession();if(!s?.code)return;try{preview?.close()}catch{}const proto=location.protocol==='https:'?'wss:':'ws:';preview=new WebSocket(proto+'//'+location.host);preview.onopen=()=>preview.send(JSON.stringify({type:'PREVIEW_ROOM',code:String(s.code).toUpperCase()}));preview.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='ROOM_PREVIEW'&&m.code===String(s.code).toUpperCase())players=m.players||[]}catch{}};preview.onerror=()=>{};preview.onclose=()=>{preview=null}}
function screenIndex(){if(isHost)return 0;const s=readSession();if(!s?.playerId)return -1;const idx=players.findIndex(p=>String(p.id)===String(s.playerId));return idx<0?-1:idx+1}
function createActor(){const wrap=document.createElement('div');wrap.className='pyh-relay-actor'+(isHost?' clickable':'');const img=document.createElement('img');img.src='/host-character.png?v=4';img.alt='';img.draggable=false;wrap.appendChild(img);if(isHost)wrap.addEventListener('click',()=>{try{const a=new Audio('/host-sound.mp3');a.currentTime=0;a.play().catch(()=>{})}catch{}});document.body.appendChild(wrap);return wrap}
function hide(){if(actor)actor.style.display='none'}
function installMotionKeyframes(){if(document.getElementById('pyh-relay-motion-style'))return;const st=document.createElement('style');st.id='pyh-relay-motion-style';st.textContent=`
@keyframes pyhWanderA{0%{transform:translate(-45vw,8vh) rotate(-2deg)}22%{transform:translate(8vw,2vh) rotate(1deg)}48%{transform:translate(48vw,-3vh) rotate(-1deg)}72%{transform:translate(86vw,4vh) rotate(2deg)}100%{transform:translate(145vw,0) rotate(0deg)}}
@keyframes pyhWanderB{0%{transform:translate(145vw,-1vh) rotate(1deg)}24%{transform:translate(92vw,5vh) rotate(-2deg)}50%{transform:translate(45vw,-4vh) rotate(2deg)}76%{transform:translate(-2vw,3vh) rotate(-1deg)}100%{transform:translate(-45vw,0) rotate(0deg)}}
@keyframes pyhWanderC{0%{transform:translate(-45vw,-2vh) rotate(2deg)}25%{transform:translate(10vw,5vh) rotate(-2deg)}52%{transform:translate(38vw,10vh) rotate(1deg)}78%{transform:translate(82vw,-1vh) rotate(-2deg)}100%{transform:translate(145vw,2vh) rotate(0deg)}}
@keyframes pyhWanderD{0%{transform:translate(145vw,5vh) rotate(-2deg)}25%{transform:translate(85vw,-2vh) rotate(2deg)}52%{transform:translate(52vw,8vh) rotate(-1deg)}80%{transform:translate(4vw,-3vh) rotate(2deg)}100%{transform:translate(-45vw,1vh) rotate(0deg)}}
`;document.head.appendChild(st)}
function animateScreen(direction,marker){if(!actor)return;actor.style.display='block';actor.classList.toggle('pyh-left',direction<0);actor.style.animation='none';void actor.offsetWidth;const names=['pyhWanderA','pyhWanderB','pyhWanderC','pyhWanderD'];let name=names[Math.abs(direction)%names.length];if(direction<0)name=direction%2===0?'pyhWanderB':'pyhWanderD';actor.style.animation=`${name} ${STEP}ms ease-in-out forwards`;actor.dataset.marker=marker}
function tick(){const count=players.length;if(isPlayer&&count===0){hide();return}const idx=screenIndex();if(idx<0){hide();return}const screens=count+1,cycleLength=screens*TOTAL_PER_SCREEN,now=Date.now(),cycle=Math.floor(now/cycleLength),phase=now%cycleLength,slot=Math.floor(phase/TOTAL_PER_SCREEN),slotTime=phase%TOTAL_PER_SCREEN;if(slot!==idx||slotTime>=STEP){hide();activeMarker='';return}const direction=((cycle*3+idx*5+Math.floor(cycle/2))%4)+1;const marker=cycle+':'+slot+':'+direction;if(marker!==activeMarker){activeMarker=marker;animateScreen(direction,marker)}}
ensureStyle();installMotionKeyframes();if(isHost){const old=document.getElementById('host-wanderer');if(old)old.classList.add('pyh-old-walk-hidden')}actor=createActor();connectPreview();setInterval(connectPreview,5000);setInterval(tick,100);tick();
})();
