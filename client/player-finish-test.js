(() => {
'use strict';

/*
 * PLAYER FINISH SCREEN
 * This is the single player-side finish presentation.
 * It intentionally mirrors the live host finish artwork/layout, but does NOT
 * play the host finish music on player devices.
 */
const SEAT_IMAGES={
  Bug:'/bug-seat.png?v=1',
  Face:'/face-seat.png?v=1',
  'Ling Ling':'/ling-ling-seat.png?v=1',
  Beanz:'/beanz-seat.png?v=1',
  'The One':'/the-one-seat.png?v=1',
  Boone:'/boone-seat.png?v=1',
  'Chicken Joe':'/chicken-joe-seat.png?v=1',
  Juby:'/juby-seat.png?v=1',
  Meemaw:'/meemaw-seat.png?v=1'
};

let shown=false;
let finishObserver=null;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function installStyles(){
  if(document.getElementById('player-finish-master-styles'))return;
  const s=document.createElement('style');
  s.id='player-finish-master-styles';
  s.textContent=`
    /* The old inline player renderer is obsolete. Keep it completely invisible. */
    #player-finish-screen{display:none!important;visibility:hidden!important;pointer-events:none!important}
    #host-finish-live,#host-finish-test-overlay{display:none!important}
    #player-finish-live{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
    .pfl-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=5') center/100% 100% no-repeat}
    .pfl-winner{position:absolute;left:47.5%;top:51.5%;transform:translate(-50%,-50%);width:clamp(130px,20vw,250px);height:clamp(190px,32vw,360px);display:flex;align-items:center;justify-content:flex-start;flex-direction:column}
    .pfl-score{position:absolute;left:50%;top:-6vh;transform:translateX(-50%);font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;line-height:1;white-space:nowrap;z-index:3}
    .pfl-winner img{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000)}
    .pfl-host{position:absolute;left:-18%;bottom:11vh;width:clamp(200px,30vw,380px);z-index:2;pointer-events:none;animation:pflwalk 18s linear infinite}
    .pfl-host img{display:block;width:100%;height:auto;filter:drop-shadow(0 8px 8px #000);animation:pflbob 1.05s ease-in-out infinite}
    @keyframes pflwalk{0%{left:-18%;transform:scaleX(1)}49%{left:103%;transform:scaleX(1)}50%{left:103%;transform:scaleX(-1)}99%{left:-18%;transform:scaleX(-1)}100%{left:-18%;transform:scaleX(1)}}
    @keyframes pflbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    #player-finish-live button{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000}
    @media(max-width:600px){
      #player-finish-live .pfl-winner{left:47.5%;top:51.5%;width:clamp(120px,42vw,210px);height:clamp(175px,64vw,320px)}
      #player-finish-live .pfl-host{width:clamp(150px,48vw,260px);bottom:11vh}
      #player-finish-live button{bottom:4vh;width:86vw;padding:14px 16px}
    }
  `;
  document.head.appendChild(s);
}

function removeLegacy(){
  document.getElementById('player-finish-screen')?.remove();
  document.getElementById('host-finish-live')?.remove();
  document.getElementById('host-finish-test-overlay')?.remove();
}

function winnerFromGame(game){
  const players=[...(game?.players||[])];
  return players.find(p=>String(p.id)===String(game.winner)) ||
    players.sort((a,b)=>Number(b.points)-Number(a.points))[0] || {};
}

function render(game){
  if(shown || game?.phase!=='finished')return;
  shown=true;
  installStyles();
  removeLegacy();

  const win=winnerFromGame(game);
  const character=SEAT_IMAGES[win.character]?win.character:'Bug';
  const score=Number.isFinite(Number(win.points))?Number(win.points):500;

  const o=document.createElement('div');
  o.id='player-finish-live';
  o.innerHTML=`<div class="pfl-bg"></div><div class="pfl-host"><img src="/host-winner.png?v=1" alt=""></div><div class="pfl-winner"><div class="pfl-score">${score}</div><img src="${SEAT_IMAGES[character]}" alt="${esc(character)}"></div><button type="button">PLAY AGAIN</button>`;
  document.body.appendChild(o);

  o.querySelector('button').onclick=()=>{
    try{
      localStorage.removeItem('byhPlayerSession');
      localStorage.removeItem('byhPlayerFinished');
    }catch{}
    location.reload();
  };
}

function inspect(event){
  try{
    const m=JSON.parse(event?.data);
    if(m.type==='STATE' && m.game?.phase==='finished')render(m.game);
  }catch{}
}

function installWebSocketTap(){
  const proto=window.WebSocket&&window.WebSocket.prototype;
  if(!proto || proto.__pyhPlayerFinishMaster)return;

  const originalAdd=proto.addEventListener;
  proto.addEventListener=function(type,listener,options){
    if(type==='message' && typeof listener==='function' && !listener.__pyhPlayerFinishWrapped){
      const wrapped=function(event){
        const result=listener.call(this,event);
        inspect(event);
        return result;
      };
      Object.defineProperty(wrapped,'__pyhPlayerFinishWrapped',{value:true});
      return originalAdd.call(this,type,wrapped,options);
    }
    return originalAdd.call(this,type,listener,options);
  };

  Object.defineProperty(proto,'__pyhPlayerFinishMaster',{value:true});
}

installStyles();
removeLegacy();
installWebSocketTap();

finishObserver=new MutationObserver(()=>{
  if(!shown)document.getElementById('player-finish-screen')?.remove();
});
finishObserver.observe(document.body,{childList:true,subtree:true});

})();
