(()=>{
  'use strict';
  const audio=new Audio('/assets/skip.mp3');
  audio.preload='auto';
  audio.volume=0.75;

  function play(){
    try{
      audio.pause();
      audio.currentTime=0;
      const p=audio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }catch{}
  }

  // PLAYER SCREEN ONLY. The player page loads this file; the host page does not.
  // pointerdown is used so playback happens directly inside the user's gesture.
  document.addEventListener('pointerdown',e=>{
    const card=e.target?.closest?.('.arcade-card.special-skip');
    if(card) play();
  },true);
})();
