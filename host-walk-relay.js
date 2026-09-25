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
@media(max-width:600px){.pyh-host-only-wanderer{width:clamp(110px,34vw,200px)!important;bottom:9%!important}}
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
})();
