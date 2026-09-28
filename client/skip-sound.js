(()=>{
  'use strict';
  const sounds={
    skip:'/assets/skip.mp3',
    reverse:'/assets/reverse.mp3'
  };
  const players={};

  function play(kind){
    try{
      let audio=players[kind];
      if(!audio){
        audio=new Audio(sounds[kind]);
        players[kind]=audio;
      }
      audio.pause();
      audio.currentTime=0;
      const p=audio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }catch{}
  }

  function cardKind(el){
    if(!el?.closest)return null;
    if(el.closest('.arcade-card.special-skip, .special-skip'))return 'skip';
    if(el.closest('.arcade-card.special-reverse, .special-reverse'))return 'reverse';
    return null;
  }

  // PLAYER SCREEN ONLY. This file is loaded by the player page, not the host.
  function handle(e){
    const kind=cardKind(e.target);
    if(kind)play(kind);
  }
  document.addEventListener('pointerdown',handle,true);
  document.addEventListener('click',handle,true);
})();
