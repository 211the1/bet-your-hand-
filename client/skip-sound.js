(()=>{
  'use strict';
  const SOUND_URL='/assets/skip.mp3';
  let audio=null;

  function play(){
    try{
      if(!audio) audio=new Audio(SOUND_URL);
      audio.pause();
      audio.currentTime=0;
      const p=audio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }catch{}
  }

  function isSkipCard(el){
    return !!el?.closest?.('.arcade-card.special-skip, .special-skip');
  }

  // PLAYER SCREEN ONLY. The player page loads this file; the host page does not.
  // Listen to both pointerdown and click so it works with the game's existing
  // touch/click card interaction without changing card-play behavior.
  document.addEventListener('pointerdown',e=>{
    if(isSkipCard(e.target)) play();
  },true);
  document.addEventListener('click',e=>{
    if(isSkipCard(e.target)) play();
  },true);
})();
