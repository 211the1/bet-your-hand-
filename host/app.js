(() => {
'use strict';

// HOST CALL / WAKE UP EASTER EGG
// Keep this fallback independent from the main host message handler. If the
// normal handler throws while processing another part of the message, the
// host must still show the wake-up effect.
const wakeStyle=document.createElement('style');
wakeStyle.id='host-wake-up-style';
wakeStyle.textContent=`
.host-action-effect{
  position:fixed!important;inset:0!important;z-index:2147483000!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  pointer-events:none!important;overflow:hidden!important;
}
.host-action-effect .host-action-flash{
  position:absolute!important;inset:0!important;background:rgba(255,0,128,.22)!important;
  animation:hostWakeBackdrop .18s infinite alternate!important;
}
.host-action-effect .host-action-text{
  position:relative!important;width:92vw!important;max-width:1100px!important;
  text-align:center!important;font-family:Impact,'Arial Black',system-ui,sans-serif!important;
  font-size:clamp(48px,10vw,120px)!important;line-height:.95!important;font-weight:1000!important;
  letter-spacing:2px!important;text-transform:uppercase!important;color:#ffd21c!important;
  -webkit-text-stroke:3px #fff!important;
  text-shadow:5px 5px 0 #d71920,0 0 14px #1687ff,0 0 32px #1687ff!important;
  animation:hostWakeText .45s infinite alternate!important;
}
@keyframes hostWakeBackdrop{from{background:rgba(255,0,128,.18)}to{background:rgba(0,220,255,.30)}}
@keyframes hostWakeText{from{transform:scale(.96) rotate(-1deg);filter:brightness(1)}to{transform:scale(1.04) rotate(1deg);filter:brightness(1.5)}}
`;
document.head.appendChild(wakeStyle);

let hostEasterAudioContext=null;
function unlockHostEasterAudio(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    if(hostEasterAudioContext.state==='suspended')hostEasterAudioContext.resume().catch(()=>{});
    const o=hostEasterAudioContext.createOscillator(),g=hostEasterAudioContext.createGain();
    g.gain.value=.00001;o.connect(g).connect(hostEasterAudioContext.destination);
    o.start();o.stop(hostEasterAudioContext.currentTime+.02);
  }catch{}
}
['pointerdown','touchstart','keydown','click'].forEach(type=>window.addEventListener(type,unlockHostEasterAudio,{passive:true}));

function playHostEasterCallSound(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    const ctx=hostEasterAudioContext;
    const resume=ctx.state==='suspended'?ctx.resume():Promise.resolve();
    resume.then(()=>{
      const now=ctx.currentTime;
      [0,.28,.56].forEach((t,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.value=i===1?880:660;
        g.gain.setValueAtTime(.0001,now+t);
        g.gain.exponentialRampToValueAtTime(.45,now+t+.03);
        g.gain.exponentialRampToValueAtTime(.0001,now+t+.2);
        o.connect(g).connect(ctx.destination);o.start(now+t);o.stop(now+t+.22);
      });
    }).catch(()=>{});
  }catch{}
}

function playHostEasterEggSound(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    const ctx=hostEasterAudioContext;
    const resume=ctx.state==='suspended'?ctx.resume():Promise.resolve();
    resume.then(()=>{
      const now=ctx.currentTime;
      const master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);
      for(let i=0;i<8;i++){
        const t=now+i*.19,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
        o.type='sawtooth';o.frequency.setValueAtTime(125+(i%3)*18,t);o.frequency.exponentialRampToValueAtTime(92,t+.14);
        f.type='lowpass';f.frequency.value=900;
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.8,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.15);
        o.connect(f).connect(g).connect(master);o.start(t);o.stop(t+.16);
      }
    }).catch(()=>{});
  }catch{}
}

function showHostWakeFallback(){
  if(document.querySelector('.host-action-effect.wake'))return;
  const el=document.createElement('div');
  el.className='host-action-effect wake';
  el.innerHTML='<div class="host-action-flash"></div><div class="host-action-text">WAKE UP!</div>';
  document.body.appendChild(el);
  playHostEasterCallSound();
  setTimeout(()=>{if(el.isConnected)el.remove()},3200);
}

function showHostEasterEggFallback(){
  if(document.querySelector('.host-easter-egg-effect'))return;
  const el=document.createElement('div');
  el.className='host-action-effect host-easter-egg-effect';
  el.innerHTML='<div class="host-action-flash"></div><div class="host-action-text">YOU\'RE STUPID!</div>';
  document.body.appendChild(el);
  playHostEasterEggSound();
  setTimeout(()=>{if(el.isConnected)el.remove()},3200);
}

function showHostPlayYourHandFallback(){
  if(document.querySelector('.host-action-effect.play-hand'))return;
  const el=document.createElement('div');
  el.className='host-action-effect play-hand';
  el.innerHTML='<div class="host-action-flash"></div><div class="host-action-text">PLAY YOUR HAND!</div>';
  document.body.appendChild(el);
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(C){
      if(!hostEasterAudioContext)hostEasterAudioContext=new C();
      const ctx=hostEasterAudioContext;
      const resume=ctx.state==='suspended'?ctx.resume():Promise.resolve();
      resume.then(()=>{
        const now=ctx.currentTime;
        [660,880,1046].forEach((freq,i)=>{
          const o=ctx.createOscillator(),g=ctx.createGain(),t=now+i*.12;
          o.type='sine';o.frequency.value=freq;
          g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
          o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.18);
        });
      }).catch(()=>{});
    }
  }catch{}
  setTimeout(()=>{if(el.isConnected)el.remove()},3200);
}

// Intercept message listeners themselves. The browser's internal WebSocket
// dispatch does not reliably call an overridden dispatchEvent(), so wrapping
// addEventListener is the reliable path used before host/app-core.js loads.
const originalWsAddEventListener=WebSocket.prototype.addEventListener;
WebSocket.prototype.addEventListener=function(type,listener,options){
  if(type==='message'&&typeof listener==='function'){
    const wrapped=function(event){
      let message=null;
      try{message=JSON.parse(event?.data||'')}catch{}
      if(message?.type==='CALL_PLAYER')showHostWakeFallback();
      if(message?.type==='EASTER_EGG')showHostEasterEggFallback();
      if(message?.type==='PLAY_YOUR_HAND_EVENT')showHostPlayYourHandFallback();
      return listener.call(this,event);
    };
    return originalWsAddEventListener.call(this,type,wrapped,options);
  }
  return originalWsAddEventListener.call(this,type,listener,options);
};

// MENU FALLBACK: keep the host MENU button working even if another host script fails.
// Capture the click so the main app handler cannot toggle it a second time.
function installHostMenuFallback(){
  const button=document.getElementById('host-menu-button');
  const panel=document.getElementById('host-menu-panel');
  const close=document.getElementById('host-menu-close');
  if(!button||!panel)return;
  if(button.__pyhMenuFallback)return;
  button.__pyhMenuFallback=true;
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    panel.classList.toggle('show');
  },true);
  close?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    panel.classList.remove('show');
  },true);
}
installHostMenuFallback();

// The host is normally opened on localhost while cloudflared exposes that
// same server at a temporary public URL. The QR must use that public URL,
// not the old hard-coded/local URL.
function installDynamicPublicQr(){
  const qr=document.getElementById('join-qr');
  const roomCode=document.getElementById('room-code');
  if(!qr)return;

  const params=new URLSearchParams(location.search);
  let publicUrl=params.get('publicUrl')||params.get('public')||'';

  const normalize=(value)=>{
    try{return new URL(String(value).trim()).origin}catch{return ''}
  };

  const setQr=(url)=>{
    publicUrl=normalize(url)||publicUrl;
    if(!publicUrl)return;
    const code=(roomCode?.textContent||'').trim();
    if(!code||code==='----')return;
    const playerUrl=publicUrl+'/';
    qr.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data='+encodeURIComponent(playerUrl);
    qr.style.display='block';
  };

  // Read the current Cloudflare URL saved by the single server launcher.
  fetch('/cloudflare-url.txt?ts='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.text():'')
    .then(text=>setQr(text))
    .catch(()=>{});

  if(!publicUrl && /(^|\\.)trycloudflare\\.com$/i.test(location.hostname)){
    publicUrl=location.origin;
  }

  const observer=new MutationObserver(()=>setQr(publicUrl));
  if(roomCode)observer.observe(roomCode,{childList:true,characterData:true,subtree:true});
  setQr(publicUrl);
}

// Keep the existing host script-loading chain unchanged.
const finish=document.createElement('script');
finish.src='/host/finish-test.js?v=3';
finish.onload=()=>{
  const roundFix=document.createElement('script');
  roundFix.src='/host/round-fix.js?v=1';
  roundFix.onload=()=>{
    const startSound=document.createElement('script');
    startSound.src='/host/game-start-sound.js?v=1';
    startSound.onload=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onload=()=>installDynamicPublicQr();
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onload=()=>installDynamicPublicQr();
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    document.body.appendChild(startSound);
  };
  roundFix.onerror=()=>{
    const startSound=document.createElement('script');
    startSound.src='/host/game-start-sound.js?v=1';
    startSound.onload=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onload=()=>installDynamicPublicQr();
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onload=()=>installDynamicPublicQr();
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    document.body.appendChild(startSound);
  };
  document.body.appendChild(roundFix);
};
document.body.appendChild(finish);
})();