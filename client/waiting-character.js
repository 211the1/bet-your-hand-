(()=>{
'use strict';
const characterImages={'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'};
function getSession(){try{return JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{return null}}
function isWaitingScreen(){
 const game=document.getElementById('game');
 if(!game)return false;
 const bg=getComputedStyle(game).backgroundImage||'';
 return !!game.querySelector('.waiting,.waiting-screen')||/waiting/i.test(game.textContent||'')||bg.includes('waiting-screen')||game.innerHTML.includes('waiting-screen');
}
function drawCharacter(){
 const game=document.getElementById('game'); if(!game)return;
 let overlay=game.querySelector('.waiting-character-overlay');
 if(!isWaitingScreen()){overlay?.remove();return}
 const character=getSession()?.character||''; const src=characterImages[character];
 if(!src){overlay?.remove();return}
 if(!overlay){overlay=document.createElement('div');overlay.className='waiting-character-overlay';const img=document.createElement('img');img.className='waiting-selected-character';overlay.appendChild(img);game.appendChild(overlay)}
 const img=overlay.querySelector('img');img.src=src;img.alt=character;
}
const style=document.createElement('style');style.textContent=`
body.player-page #game{position:relative!important}
body.player-page #game .waiting-character-overlay{position:absolute!important;left:50%!important;top:28.7%!important;transform:translateX(-50%)!important;width:42%!important;height:34%!important;z-index:50!important;pointer-events:none!important;display:flex!important;align-items:center!important;justify-content:center!important}
body.player-page #game .waiting-character-overlay .waiting-selected-character{width:70%!important;height:72%!important;object-fit:cover!important;object-position:center center!important;border:0!important;border-radius:12px!important;display:block!important;box-shadow:none!important}
@media(max-width:600px){body.player-page #game .waiting-character-overlay{top:28.7%!important;width:42%!important;height:34%!important}body.player-page #game .waiting-character-overlay .waiting-selected-character{width:70%!important;height:72%!important}}
`;
document.head.appendChild(style);
new MutationObserver(drawCharacter).observe(document.getElementById('game')||document.body,{childList:true,subtree:true});
window.addEventListener('storage',drawCharacter);window.addEventListener('pageshow',drawCharacter);setInterval(drawCharacter,500);drawCharacter();
})();
