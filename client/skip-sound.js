(()=>{
  'use strict';
  const audio=new Audio('/assets/skip.mp3');
  audio.preload='auto';
  audio.volume=0.75;

  function play(){
    try{
      audio.currentTime=0;
      const p=audio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }catch{}
  }
  window.playSkipSound=play;

  // This file is loaded only by the player page. The Skip card is already
  // marked .special-skip by the existing player-card renderer.
  document.addEventListener('pointerup',e=>{
    if(e.pointerType==='mouse')return;
    if(e.target?.closest?.('.arcade-card.special-skip'))play();
  },true);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('.arcade-card.special-skip'))play();
  },true);
})();
