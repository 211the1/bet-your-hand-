(() => {
'use strict';

/* PLAYER FINISH SCREEN
   This is intentionally isolated from player gameplay. It mirrors the existing
   Host finish-screen design exactly. The existing player game-over screen stays
   underneath and is not rewritten. */
let shown=false;
const safeText=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const SEAT_IMAGES={
  'Bug':'/bug-seat.png?v=1','Face':'/face-seat.png?v=1','Ling Ling':'/ling-ling-seat.png?v=1','Beanz':'/beanz-seat.png?v=1','The One':'/the-one-seat.png?v=1','Boone':'/boone-seat.png?v=1','Chicken Joe':'/chicken-joe-seat.png?v=1','Juby':'/juby-seat.png?v=1','Meemaw':'/meemaw-seat.png?v=1'
};
function installStyles(){
  if(document.getElementById('player-test-finish-styles'))return;
  const style=document.createElement('style');style.id='player-test-finish-styles';
  style.textContent=`
#player-test-finish-overlay{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.player-test-finish-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=1') center/100% 100% no-repeat}
#player-test-winner-slot{position:absolute;left:47.5%;top:51.5%;transform:translate(-50%,-50%);width:clamp(130px,20vw,250px);height:clamp(190px,32vw,360px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:none}
#player-test-winner-score{position:absolute;left:50%;top:-6vh;transform:translateX(-50%);font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;margin:0;line-height:1;white-space:nowrap;z-index:3}
#player-test-winner-character{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000)}
#player-test-host-walker{position:absolute;left:-18%;bottom:11vh;width:clamp(200px,30vw,380px);height:auto;z-index:2;pointer-events:none;animation:playerTestWalk 18s linear infinite;will-change:left,transform}
#player-test-host-walker img{display:block;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 8px 8px #000);animation:playerTestBob 1.05s ease-in-out infinite}
@keyframes playerTestWalk{0%{left:-18%;transform:scaleX(1)}49%{left:103%;transform:scaleX(1)}50%{left:103%;transform:scaleX(-1)}99%{left:-18%;transform:scaleX(-1)}100%{left:-18%;transform:scaleX(1)}}
@keyframes playerTestBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
#player-test-finish-button{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000;cursor:pointer;display:block}
#player-test-finish-button:active{transform:translateX(-50%) scale(.98)}
`;document.head.appendChild(style);
}
function getWinner(){
  const first=document.querySelector('#player-finish-screen .finish-player-0');
  const score=first?.querySelector('.finish-player-score')?.textContent?.trim()||'0';
  const photo=first?.querySelector('.finish-player-photo');
  let character='Bug';
  if(photo?.getAttribute('src')){const file=photo.getAttribute('src').split('/').pop().split('?')[0].replace(/\.jpg$/i,'');character=file.replace(/_/g,' ');}
  return {character:SEAT_IMAGES[character]?character:'Bug',score};
}
function showTestFinish(){
  if(shown)return;shown=true;installStyles();
  const winner=getWinner(),overlay=document.createElement('div');overlay.id='player-test-finish-overlay';
  overlay.innerHTML=`<div class="player-test-finish-bg"></div><audio id="player-test-finish-music" src="/assets/finish-screen.mp3" preload="auto"></audio><div id="player-test-host-walker" aria-hidden="true"><img src="/host-winner.png?v=1" alt="Host walking with trophy"></div><div id="player-test-winner-slot" aria-label="Winner seat"><div id="player-test-winner-score">${safeText(winner.score)}</div><img id="player-test-winner-character" src="${SEAT_IMAGES[winner.character]}" alt="${safeText(winner.character)} seated winner"></div><button id="player-test-finish-button" type="button">PLAY AGAIN</button>`;
  document.body.appendChild(overlay);
  const music=document.getElementById('player-test-finish-music');if(music){music.currentTime=0;music.play().catch(()=>{});}
  document.getElementById('player-test-finish-button')?.addEventListener('click',()=>{if(music){music.pause();music.currentTime=0;}try{localStorage.removeItem('byhPlayerSession');localStorage.setItem('byhPlayerFinished','1')}catch{}overlay.remove();window.location.reload();});
}
function check(){if(document.getElementById('player-test-finish-overlay'))return;if(document.getElementById('player-finish-screen'))showTestFinish();}
new MutationObserver(check).observe(document.documentElement,{childList:true,subtree:true});setInterval(check,250);check();
})();
