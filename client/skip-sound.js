(()=>{
  'use strict';
  const audio=new Audio('/assets/skip.mp3');
  audio.preload='auto';
  audio.volume=0.75;

  window.playSkipSound=function(){
    try{
      audio.currentTime=0;
      const p=audio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }catch{}
  };
})();
