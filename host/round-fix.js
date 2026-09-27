(() => {
'use strict';

/* Keep the host round indicator synchronized with every game state message. */
const proto=window.WebSocket&&window.WebSocket.prototype;
if(!proto || proto.__pyhRoundFix)return;
const originalAdd=proto.addEventListener;
proto.addEventListener=function(type,listener,options){
  if(type==='message'&&typeof listener==='function'&&!listener.__pyhRoundFixWrapped){
    const wrapped=function(event){
      try{
        const message=JSON.parse(event?.data);
        const game=message?.game;
        const round=Number(game?.round);
        if((message?.type==='STATE'||message?.type==='HOST_GAME_STARTED')&&round>0){
          const el=document.getElementById('round-display');
          if(el)el.textContent='ROUND '+round;
        }
      }catch{}
      return listener.call(this,event);
    };
    Object.defineProperty(wrapped,'__pyhRoundFixWrapped',{value:true});
    return originalAdd.call(this,type,wrapped,options);
  }
  return originalAdd.call(this,type,listener,options);
};
Object.defineProperty(proto,'__pyhRoundFix',{value:true});
})();
