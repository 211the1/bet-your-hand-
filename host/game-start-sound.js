(()=>{
'use strict';
let audio=null;
function makeAudio(){
  if(audio)return audio;
  audio=new Audio('/client/game-start.mp3');
  audio.preload='auto';
  audio.volume=.8;
  return audio;
}
function playGameStartSound(){
  try{
    const a=makeAudio();
    a.currentTime=0;
    const p=a.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{});
  }catch{}
}
function isStartButton(target){
  if(!target)return false;
  const el=target.closest&&target.closest('#start,#host-start,[data-action="start-game"]');
  return !!el;
}
document.addEventListener('click',event=>{
  if(isStartButton(event.target))playGameStartSound();
},true);
document.addEventListener('touchend',event=>{
  if(isStartButton(event.target))playGameStartSound();
},true);
})();
