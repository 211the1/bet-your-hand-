(()=>{
'use strict';
const game=document.getElementById('game');
const style=document.createElement('style');
style.textContent='.shield-status{margin:6px auto;padding:7px 12px;border:2px solid #fff;border-radius:10px;background:#173b66;color:#fff;font-weight:900;text-align:center;font-size:14px;box-shadow:0 0 14px #1687ff}';
document.head.appendChild(style);
let shieldActive=false;
function render(){
 if(!game)return;
 const old=game.querySelector('.shield-status');
 if(old)old.remove();
 if(!shieldActive)return;
 const title=game.querySelector('.hand-title');
 if(!title)return;
 const box=document.createElement('div');
 box.className='shield-status';
 box.textContent='🛡️ SHIELD ACTIVE — SKIP PROTECTED';
 game.insertBefore(box,title);
}
const OriginalWebSocket=window.WebSocket;
function ShieldWebSocket(...args){
 const socket=new OriginalWebSocket(...args);
 socket.addEventListener('message',event=>{
  try{
   const m=JSON.parse(event.data);
   if(m.type!=='STATE'||!m.game)return;
   const me=m.game.viewerId;
   const player=(m.game.players||[]).find(p=>String(p.id)===String(me));
   shieldActive=Boolean(player&&player.shield);
   setTimeout(render,0);
  }catch{}
 });
 return socket;
}
ShieldWebSocket.prototype=OriginalWebSocket.prototype;
['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(k=>{ShieldWebSocket[k]=OriginalWebSocket[k]});
window.WebSocket=ShieldWebSocket;
new MutationObserver(render).observe(game,{childList:true,subtree:true});
})();
