(()=>{
'use strict';
const characterImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
function getSession(){try{return JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{return null}}
function drawCharacter(){
  const character=getSession()?.character||'';
  const src=characterImages[character];
  let overlay=document.getElementById('waiting-character-fixed');
  if(!src){overlay?.remove();return}
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='waiting-character-fixed';
    overlay.innerHTML='<img class="waiting-selected-character-fixed" alt="">';
    document.body.appendChild(overlay);
  }
  const img=overlay.querySelector('img');
  img.src=src;
  img.alt=character;
}
const style=document.createElement('style');
style.textContent=`
#waiting-character-fixed{position:fixed!important;left:50%!important;top:37%!important;transform:translateX(-50%)!important;width:30vw!important;height:30vh!important;max-width:250px!important;max-height:340px!important;z-index:999999!important;pointer-events:none!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
#waiting-character-fixed img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center center!important;border:0!important;border-radius:12px!important;box-shadow:none!important}
@media(max-width:600px){#waiting-character-fixed{top:36%!important;width:42vw!important;height:30vh!important;max-width:220px!important;max-height:310px!important}}
`;
document.head.appendChild(style);
window.addEventListener('storage',drawCharacter);
window.addEventListener('pageshow',drawCharacter);
setInterval(drawCharacter,500);
drawCharacter();
})();
