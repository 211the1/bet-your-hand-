(()=>{
'use strict';
const characterImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
function getSession(){try{return JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{return null}}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function drawCharacter(){
 const session=getSession()||{};
 const character=session.character||'';
 const playerName=session.name||'';
 const src=characterImages[character];
 let overlay=document.getElementById('waiting-character-fixed');
 if(!src){overlay?.remove();return}
 if(!overlay){
  overlay=document.createElement('div');
  overlay.id='waiting-character-fixed';
  overlay.innerHTML='<img class="waiting-selected-character-fixed" alt=""><div class="waiting-selected-player-name"></div>';
  document.body.appendChild(overlay);
 }
 const img=overlay.querySelector('img');
 const nameEl=overlay.querySelector('.waiting-selected-player-name');
 img.src=src; img.alt=character; nameEl.textContent=playerName;
}
function drawWaitingPlayers(){
 const recovery=document.querySelector('.waiting-room-recovery');
 if(!recovery)return;
 const leave=recovery.querySelector('#leave-old-room');
 const source=[...recovery.querySelectorAll(':scope > div')].filter(el=>!el.classList.contains('waiting-players-box'));
 const names=source.map(el=>String(el.textContent||'').split(' — ')[0].trim()).filter(Boolean);
 if(!names.length)return;
 let box=recovery.querySelector('.waiting-players-box');
 if(!box){box=document.createElement('div');box.className='waiting-players-box';recovery.insertBefore(box,leave||null)}
 box.innerHTML='<div class="waiting-players-title">PLAYERS IN ROOM</div><div class="waiting-players-list">'+names.map(name=>'<div class="waiting-player-name">'+escapeHtml(name)+'</div>').join('')+'</div>';
 source.forEach(el=>el.remove());
 const heading=recovery.querySelector('h2');
 if(heading)heading.remove();
}
const style=document.createElement('style');
style.textContent=`
#waiting-character-fixed{position:fixed!important;left:50%!important;top:37%!important;transform:translateX(-50%)!important;width:30vw!important;height:30vh!important;max-width:250px!important;max-height:340px!important;z-index:999999!important;pointer-events:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;overflow:hidden!important;background:#050b22!important;border:4px solid #ffd400!important;border-radius:18px!important;box-shadow:0 0 18px #ffd400,0 0 38px #ffd40099!important;box-sizing:border-box!important}
#waiting-character-fixed img{display:block!important;width:100%!important;height:calc(100% - 48px)!important;object-fit:cover!important;object-position:center center!important;border:0!important;border-radius:12px 12px 0 0!important;box-shadow:none!important;flex:1 1 auto!important;min-height:0!important}
#waiting-character-fixed .waiting-selected-player-name{width:100%!important;height:48px!important;flex:0 0 48px!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;background:linear-gradient(180deg,#07122f,#000)!important;color:#fff!important;font-weight:1000!important;font-size:clamp(16px,3.8vw,25px)!important;letter-spacing:.5px!important;text-align:center!important;text-shadow:0 0 8px #1687ff,0 2px 3px #000!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding:0 8px!important}
.waiting-room-recovery{width:min(92vw,430px)!important;margin:0 auto!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;color:#fff!important;text-align:center!important;box-sizing:border-box!important}
.waiting-players-box{width:100%!important;box-sizing:border-box!important;padding:9px 12px!important;border:2px solid #1687ff!important;border-radius:14px!important;background:linear-gradient(180deg,#07183f,#02091f)!important;box-shadow:0 0 14px #1687ff88!important;color:#fff!important;margin:10px auto!important}
.waiting-players-title{font-size:18px!important;font-weight:1000!important;letter-spacing:1px!important;color:#fff!important;text-shadow:0 0 8px #1687ff!important;margin:0 0 7px!important}
.waiting-players-list{display:flex!important;flex-direction:column!important;gap:5px!important}
.waiting-player-name{padding:6px 8px!important;border:1px solid #1687ff!important;border-radius:8px!important;background:#0a1435!important;font-size:15px!important;font-weight:900!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#leave-old-room{margin-top:12px!important}
@media(max-width:600px){#waiting-character-fixed{top:36%!important;width:42vw!important;height:30vh!important;max-width:220px!important;max-height:310px!important}.waiting-room-recovery{width:min(92vw,390px)!important}.waiting-players-box{padding:8px 10px!important;margin:8px auto!important}.waiting-players-title{font-size:16px!important}.waiting-player-name{font-size:14px!important;padding:5px 7px!important}}
`;
document.head.appendChild(style);
const observer=new MutationObserver(()=>{drawCharacter();drawWaitingPlayers()});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('storage',drawCharacter);
window.addEventListener('pageshow',()=>{drawCharacter();drawWaitingPlayers()});
setInterval(()=>{drawCharacter();drawWaitingPlayers()},300);
drawCharacter();drawWaitingPlayers();
})();
