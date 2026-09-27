(()=>{
'use strict';
const src='/client/game-start.mp3';
let audio=null;
function playGameStartSound(){
  try{
    if(!audio){
      audio=new Audio(src);
      audio.preload='auto';
      audio.volume=.8;
    }
    audio.currentTime=0;
    const p=audio.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{});
  }catch{}
}
function wire(){
  const start=document.getElementById('start');
  if(!start||start.dataset.gameStartSound==='1')return;
  start.dataset.gameStartSound='1';
  start.addEventListener('click',()=>playGameStartSound());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
setTimeout(wire,500);
})();
