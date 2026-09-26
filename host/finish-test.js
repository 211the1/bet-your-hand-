(() => {
'use strict';

function installFinishStyles(){
  if(document.getElementById('host-finish-test-styles'))return;
  const style=document.createElement('style');
  style.id='host-finish-test-styles';
  style.textContent=`
#host-finish-test-overlay{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.host-finish-test-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=1') center/100% 100% no-repeat}
#host-test-winner-slot{position:absolute;left:47.5%;top:51.5%;transform:translate(-50%,-50%);width:clamp(130px,20vw,250px);height:clamp(190px,32vw,360px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:none}
#host-test-winner-score{position:absolute;left:50%;top:-6vh;transform:translateX(-50%);font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;margin:0;line-height:1;white-space:nowrap;z-index:3}
#host-test-winner-character{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000)}
#host-finish-host-walker{position:absolute;left:-18%;bottom:11vh;width:clamp(200px,30vw,380px);height:auto;z-index:2;pointer-events:none;animation:hostFinishWalk 18s linear infinite;will-change:left,transform}
#host-finish-host-walker img{display:block;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 8px 8px #000);animation:hostFinishWalkBob 1.05s ease-in-out infinite}
@keyframes hostFinishWalk{0%{left:-18%;transform:scaleX(1)}49%{left:103%;transform:scaleX(1)}50%{left:103%;transform:scaleX(-1)}99%{left:-18%;transform:scaleX(-1)}100%{left:-18%;transform:scaleX(1)}}
@keyframes hostFinishWalkBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
#host-finish-back{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000;cursor:pointer;display:block}
#host-finish-back:active{transform:translateX(-50%) scale(.98)}
`;
  document.head.appendChild(style);
}

function hostCode(){
  try{return String(JSON.parse(localStorage.getItem('pyhHostSession')||'null')?.code||'').toUpperCase()}catch{return ''}
}

function signalPlayersForTestFinish(){
  return new Promise(resolve=>{
    let hostSession=null;
    try{hostSession=JSON.parse(localStorage.getItem('pyhHostSession')||'null')}catch{hostSession=null}
    if(!hostSession?.code||!hostSession?.hostId||!hostSession?.hostToken){resolve();return;}
    const proto=location.protocol==='https:'?'wss:':'ws:';
    const testWs=new WebSocket(proto+'//'+location.host);
    let reconnected=false,done=false;
    const finish=()=>{if(done)return;done=true;try{testWs.close()}catch{}resolve()};
    testWs.onopen=()=>testWs.send(JSON.stringify({type:'RECONNECT',code:hostSession.code,hostId:hostSession.hostId,reconnectToken:hostSession.hostToken}));
    testWs.onmessage=event=>{
      try{
        const m=JSON.parse(event.data);
        if(m.type==='RECONNECTED'&&!reconnected){
          reconnected=true;
          testWs.send(JSON.stringify({type:'TEST_FINISH_SCREEN'}));
          return;
        }
        if(m.type==='ERROR'||(m.type==='STATE'&&reconnected))finish();
      }catch{}
    };
    testWs.onerror=finish;
    setTimeout(finish,5000);
  });
}

async function getSharedStartAt(afterMs=0){
  const code=hostCode();
  if(!code)return Date.now()+10000;
  const deadline=Date.now()+5000;
  while(Date.now()<deadline){
    try{
      const r=await fetch('/__test_finish?code='+encodeURIComponent(code),{cache:'no-store'});
      if(r.ok){
        const data=await r.json();
        if(data?.active&&Number(data.updatedAt)>afterMs)return Number(data.updatedAt)+10000;
      }
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  return Date.now()+10000;
}

async function showFinish(afterMs=0){
  const old=document.getElementById('host-finish-test-overlay');
  if(old)old.remove();
  installFinishStyles();
  const overlay=document.createElement('div');
  overlay.id='host-finish-test-overlay';
  overlay.innerHTML=`
    <div class="host-finish-test-bg"></div>
    <audio id="host-finish-music" src="/assets/finish-screen.mp3" preload="auto"></audio>
    <div id="host-finish-host-walker" aria-hidden="true"><img src="/host-winner.png?v=1" alt="Host walking with trophy"></div>
    <div id="host-test-winner-slot" aria-label="Test winner seat">
      <div id="host-test-winner-score">500</div>
      <img id="host-test-winner-character" src="/bug-seat.png?v=1" alt="Test winner Bug seated">
    </div>
    <button id="host-finish-back" type="button">PLAY AGAIN</button>`;
  document.body.appendChild(overlay);
  document.body.classList.add('host-finished');
  const menuButton=document.getElementById('host-menu-button');
  if(menuButton)menuButton.style.display='none';
  const music=document.getElementById('host-finish-music');
  if(music){music.pause();music.currentTime=0;music.load();}
  const sharedStartAt=await getSharedStartAt(afterMs);
  if(music){
    const wait=Math.max(0,sharedStartAt-Date.now());
    setTimeout(()=>{
      if(!document.body.contains(music))return;
      music.currentTime=0;
      music.play().catch(()=>{});
    },wait);
  }
  document.getElementById('host-finish-back')?.addEventListener('click',hideFinish);
}

function hideFinish(){
  const music=document.getElementById('host-finish-music');
  if(music){music.pause();music.currentTime=0;}
  document.getElementById('host-finish-test-overlay')?.remove();
  document.body.classList.remove('host-finished');
  const menuButton=document.getElementById('host-menu-button');
  if(menuButton)menuButton.style.display='flex';
}

function attach(){
  const button=document.getElementById('host-test-finish');
  if(!button){setTimeout(attach,250);return;}
  if(button.dataset.finishBound==='1')return;
  button.dataset.finishBound='1';
  button.addEventListener('click',async()=>{
    document.getElementById('host-menu-panel')?.classList.remove('show');
    const requestStartedAt=Date.now();
    await signalPlayersForTestFinish();
    await showFinish(requestStartedAt);
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
else attach();
})();