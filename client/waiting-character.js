(()=>{
'use strict';
const characterImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
function getSession(){try{return JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{return null}}
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
  img.src=src;
  img.alt=character;
  nameEl.textContent=playerName;
}
const style=document.createElement('style');
style.textContent=`
#waiting-character-fixed{position:fixed!important;left:50%!important;top:37%!important;transform:translateX(-50%)!important;width:30vw!important;height:30vh!important;max-width:250px!important;max-height:340px!important;z-index:999999!important;pointer-events:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;overflow:hidden!important;background:#050b22!important;border:4px solid #ffd400!important;border-radius:18px!important;box-shadow:0 0 18px #ffd400,0 0 38px #ffd40099!important;box-sizing:border-box!important}
#waiting-character-fixed img{display:block!important;width:100%!important;height:calc(100% - 48px)!important;object-fit:cover!important;object-position:center center!important;border:0!important;border-radius:12px 12px 0 0!important;box-shadow:none!important;flex:1 1 auto!important;min-height:0!important}
#waiting-character-fixed .waiting-selected-player-name{width:100%!important;height:48px!important;flex:0 0 48px!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;background:linear-gradient(180deg,#07122f,#000)!important;color:#fff!important;font-weight:1000!important;font-size:clamp(16px,3.8vw,25px)!important;letter-spacing:.5px!important;text-align:center!important;text-shadow:0 0 8px #1687ff,0 2px 3px #000!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding:0 8px!important}
@media(max-width:600px){#waiting-character-fixed{top:36%!important;width:42vw!important;height:30vh!important;max-width:220px!important;max-height:310px!important}}
`;
document.head.appendChild(style);
window.addEventListener('storage',drawCharacter);
window.addEventListener('pageshow',drawCharacter);
setInterval(drawCharacter,500);
drawCharacter();
})();
