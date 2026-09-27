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

// Keep one host audio context unlocked by a real host interaction.
// The CALL/WAKE UP event arrives through WebSocket, which is not itself
// a browser user gesture, so the existing per-event AudioContext can be
// blocked by autoplay policy. This shared context lets the existing host
// Easter egg sound play without changing player behavior or game logic.
let hostEasterAudioContext=null;
function unlockHostEasterAudio(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    if(!hostEasterAudioContext)hostEasterAudioContext=new C();
    if(hostEasterAudioContext.state==='suspended')hostEasterAudioContext.resume().catch(()=>{});
  }catch{}
}
['pointerdown','touchstart','keydown','click'].forEach(type=>window.addEventListener(type,unlockHostEasterAudio,{passive:true}));

function playHostEasterCallSound(){
  if(!hostEasterAudioContext)return;
  try{
    const ctx=hostEasterAudioContext;
    if(ctx.state==='suspended')return;
    const now=ctx.currentTime;
    [0,0.28,0.56].forEach((t,i)=>{
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
