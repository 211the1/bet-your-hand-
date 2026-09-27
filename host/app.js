(() => {
'use strict';

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
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
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
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    document.body.appendChild(startSound);
  };
  document.body.appendChild(roundFix);
};
document.body.appendChild(finish);

// HOST CALL / WAKE UP EASTER EGG
// The host already receives the CALL_PLAYER WebSocket event and creates
// .host-action-effect.wake. This file supplies the missing host-side visual
// CSS and keeps one AudioContext unlocked by a real host interaction so the
// WebSocket-triggered sound is allowed to play by the browser.
const wakeStyle=document.createElement('style');
wakeStyle.id='host-wake-up-style';
wakeStyle.textContent=`
.host-action-effect{
  position:fixed!important;
  inset:0!important;
  z-index:2147483000!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  pointer-events:none!important;
  overflow:hidden!important;
}
.host-action-effect .host-action-flash{
  position:absolute!important;
  inset:0!important;
  background:rgba(255,0,128,.22)!important;
  animation:hostWakeBackdrop .18s infinite alternate!important;
}
.host-action-effect .host-action-text{
  position:relative!important;
  width:92vw!important;
  max-width:1100px!important;
  text-align:center!important;
  font-family:Impact,'Arial Black',system-ui,sans-serif!important;
  font-size:clamp(48px,10vw,120px)!important;
  line-height:.95!important;
  font-weight:1000!important;
  letter-spacing:2px!important;
  text-transform:uppercase!important;
  color:#ffd21c!important;
  -webkit-text-stroke:3px #fff!important;
  text-shadow:5px 5px 0 #d71920,0 0 14px #1687ff,0 0 32px #1687ff!important;
  animation:hostWakeText .45s infinite alternate!important;
}
.host-action-effect.play-hand .host-action-text{color:#fff!important;-webkit-text-stroke:3px #1687ff!important;text-shadow:5px 5px 0 #071b55,0 0 18px #00eaff,0 0 36px #1687ff!important}
@keyframes hostWakeBackdrop{from{background:rgba(255,0,128,.18)}to{background:rgba(0,220,255,.30)}}
@keyframes hostWakeText{from{transform:scale(.96) rotate(-1deg);filter:brightness(1)}to{transform:scale(1.04) rotate(1deg);filter:brightness(1.5)}}
`;
document.head.appendChild(wakeStyle);

let hostEasterAudioContext=null;
function unlockHostEasterAudio(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    if(hostEasterAudioContext.state==='suspended')hostEasterAudioContext.resume().catch(()=>{});
    // A silent oscillator started from the real gesture makes the context
    // unquestionably user-activated in Chromium-based browsers.
    const o=hostEasterAudioContext.createOscillator();
    const g=hostEasterAudioContext.createGain();
    g.gain.value=.00001;
    o.connect(g).connect(hostEasterAudioContext.destination);
    o.start();
    o.stop(hostEasterAudioContext.currentTime+.02);
  }catch{}
}
['pointerdown','touchstart','keydown','click'].forEach(type=>window.addEventListener(type,unlockHostEasterAudio,{passive:true}));

function playHostEasterCallSound(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    const ctx=hostEasterAudioContext;
    const resume=ctx.state==='suspended'?ctx.resume():Promise.resolve();
    resume.then(()=>{
      const now=ctx.currentTime;
      [0,.28,.56].forEach((t,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';
        o.frequency.value=i===1?880:660;
        g.gain.setValueAtTime(.0001,now+t);
        g.gain.exponentialRampToValueAtTime(.45,now+t+.03);
        g.gain.exponentialRampToValueAtTime(.0001,now+t+.2);
        o.connect(g).connect(ctx.destination);
        o.start(now+t);
        o.stop(now+t+.22);
      });
    }).catch(()=>{});
  }catch{}
}

const hostEasterObserver=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(!(node instanceof Element))continue;
      if(node.matches('.host-action-effect.wake')||node.querySelector('.host-action-effect.wake')){
        playHostEasterCallSound();
        return;
      }
    }
  }
});
hostEasterObserver.observe(document.documentElement,{childList:true,subtree:true});
})();
