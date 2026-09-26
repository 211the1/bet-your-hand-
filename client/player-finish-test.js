(() => {
'use strict';

/* ISOLATED PLAYER FINISH TEST
   This does not replace the existing player finish-screen code permanently.
   It watches the existing byhGameOver marker and, for testing only, swaps that
   display to the new finish-screen design. Nothing in game state, cards, turns,
   or the host is changed here. */
const TEST_KEY_PREFIX='byhGameOver:';
let shown=false;

function installStyles(){
  if(document.getElementById('player-test-finish-styles'))return;
  const style=document.createElement('style');
  style.id='player-test-finish-styles';
  style.textContent=`
#player-test-finish-overlay{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.player-test-finish-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=4') center/100% 100% no-repeat}
#player-test-winner-slot{position:absolute;left:47.5%;top:51.5%;transform:translate(-50%,-50%);width:clamp(130px,20vw,250px);height:clamp(190px,32vw,360px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:none}
#player-test-winner-score{position:absolute;left:50%;top:-6vh;transform:translateX(-50%);font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;margin:0;line-height:1;white-space:nowrap;z-index:3}
#player-test-winner-character{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000)}
#player-test-host-walker{position:absolute;left:-18%;bottom:11vh;width:clamp(200px,30vw,380px);height:auto;z-index:2;pointer-events:none;animation:playerTestWalk 18s linear infinite;will-change:left,transform}
#player-test-host-walker img{display:block;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 8px 8px #000);animation:playerTestBob 1.05s ease-in-out infinite}
@keyframes playerTestWalk{0%{left:-18%;transform:scaleX(1)}49%{left:103%;transform:scaleX(1)}50%{left:103%;transform:scaleX(-1)}99%{left:-18%;transform:scaleX(-1)}100%{left:-18%;transform:scaleX(1)}}
@keyframes playerTestBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
#player-test-finish-button{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000;cursor:pointer;display:block}
#player-test-finish-button:active{transform:translateX(-50%) scale(.98)}
`;
  document.head.appendChild(style);
}

function finishKey(){
  const code=(document.getElementById('code')?.value||'').trim().toUpperCase();
  return code?TEST_KEY_PREFIX+code:TEST_KEY_PREFIX+'unknown';
}

function showTestFinish(){
  if(shown)return;
  shown=true;
  installStyles();
  document.getElementById('player-test-finish-overlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='player-test-finish-overlay';
  overlay.innerHTML=`
    <div class="player-test-finish-bg"></div>
    <audio id="player-test-finish-music" src="/assets/finish-screen.mp3" preload="auto"></audio>
    <div id="player-test-host-walker" aria-hidden="true"><img src="/host-winner.png?v=1" alt="Host walking with trophy"></div>
    <div id="player-test-winner-slot" aria-label="Test winner seat">
      <div id="player-test-winner-score">500</div>
      <img id="player-test-winner-character" src="/bug-seat.png?v=1" alt="Test winner Bug seated">
    </div>
    <button id="player-test-finish-button" type="button">PLAY AGAIN</button>`;
  document.body.appendChild(overlay);
  const music=document.getElementById('player-test-finish-music');
  if(music){music.currentTime=0;music.play().catch(()=>{});}
}

function hideTestFinish(){
  const music=document.getElementById('player-test-finish-music');
  if(music){music.pause();music.currentTime=0;}
  document.getElementById('player-test-finish-overlay')?.remove();
  shown=false;
}

function check(){
  if(document.getElementById('player-test-finish-overlay'))return;
  const key=finishKey();
  if(localStorage.getItem(key)==='1')showTestFinish();
}

window.addEventListener('storage',e=>{if(e.key===finishKey()&&e.newValue==='1')showTestFinish();});
setInterval(check,250);
check();
})();
