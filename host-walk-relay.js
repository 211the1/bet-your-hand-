(()=>{
'use strict';
const isPlayer=document.body?.classList.contains('player-page');
const isHost=!isPlayer&&!!document.getElementById('host-wanderer');
if(!isPlayer&&!isHost)return;
const sessionKey=isPlayer?'byhPlayerSession':'pyhHostSession';
const readSession=()=>{try{return JSON.parse(localStorage.getItem(sessionKey)||'null')}catch{return null}};
let players=[],preview=null,actor=null,activeMarker='';
const STEP=9000,GAP=500,TOTAL_PER_SCREEN=STEP+GAP;
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
function installMotionKeyframes(){if(document.getElementById('pyh-relay-motion-style'))return;const st=document.createElement('style');st.id='pyh-relay-motion-style';st.textContent=`@keyframes pyhRelayLTR{0%{transform:translateX(-45vw)}100%{transform:translateX(145vw)}}@keyframes pyhRelayRTL{0%{transform:translateX(145vw)}100%{transform:translateX(-45vw)}}`;document.head.appendChild(st)}
function animateScreen(reverse,marker){if(!actor)return;actor.style.display='block';actor.classList.toggle('pyh-left',reverse);actor.style.animation='none';void actor.offsetWidth;actor.style.animation=reverse?`pyhRelayRTL ${STEP}ms linear forwards`:`pyhRelayLTR ${STEP}ms linear forwards`;actor.dataset.marker=marker}
function tick(){const count=players.length;if(isPlayer&&count===0){hide();return}const idx=screenIndex();if(idx<0){hide();return}const screens=count+1,cycleLength=screens*TOTAL_PER_SCREEN,now=Date.now(),cycle=Math.floor(now/cycleLength),phase=now%cycleLength,slot=Math.floor(phase/TOTAL_PER_SCREEN),slotTime=phase%TOTAL_PER_SCREEN;if(slot!==idx||slotTime>=STEP){hide();activeMarker='';return}const reverse=((cycle*5+idx*7+Math.floor(cycle/3))%9)<4;const marker=cycle+':'+slot+':'+(reverse?'R':'L');if(marker!==activeMarker){activeMarker=marker;animateScreen(reverse,marker)}}
ensureStyle();installMotionKeyframes();if(isHost){const old=document.getElementById('host-wanderer');if(old)old.classList.add('pyh-old-walk-hidden')}actor=createActor();connectPreview();setInterval(connectPreview,5000);setInterval(tick,100);tick();
})();
