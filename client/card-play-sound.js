(()=>{
  'use strict';
  const audio=new Audio('/client/card-play.mp3');
  audio.preload='auto';
  audio.volume=0.75;

  const originalSend=WebSocket.prototype.send;
  if(WebSocket.prototype.__playYourHandCardSound)return;
  WebSocket.prototype.__playYourHandCardSound=true;

  WebSocket.prototype.send=function(data){
    try{
      const msg=typeof data==='string'?JSON.parse(data):null;
      if(msg?.type==='PLAY_CARD'&&msg.cardId){
        const card=document.querySelector('.arcade-card[data-card-id="'+CSS.escape(String(msg.cardId))+'"]');
        if(card&&!card.classList.contains('special-skip')&&!card.classList.contains('special-reverse')&&!card.classList.contains('special-wild')&&!card.classList.contains('special-play_your_hand')){
          audio.currentTime=0;
          const p=audio.play();
          if(p&&typeof p.catch==='function')p.catch(()=>{});
        }
      }
    }catch{}
    return originalSend.call(this,data);
  };
})();
