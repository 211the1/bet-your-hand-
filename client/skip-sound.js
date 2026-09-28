(()=>{
  'use strict';
  const audio=new Audio('/assets/skip.mp3');
  audio.preload='auto';
  audio.volume=0.75;

  const originalSend=WebSocket.prototype.send;
  if(WebSocket.prototype.__playYourHandSkipSound)return;
  WebSocket.prototype.__playYourHandSkipSound=true;

  WebSocket.prototype.send=function(data){
    try{
      const msg=typeof data==='string'?JSON.parse(data):null;
      if(msg?.type==='PLAY_CARD'&&msg.cardId){
        const card=document.querySelector('.arcade-card[data-card-id="'+CSS.escape(String(msg.cardId))+'"]');
        if(card?.classList.contains('special-skip')){
          audio.currentTime=0;
          const p=audio.play();
          if(p&&typeof p.catch==='function')p.catch(()=>{});
        }
      }
    }catch{}
    return originalSend.call(this,data);
  };
})();
