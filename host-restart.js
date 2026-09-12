(function(){
  'use strict';
  function install(){
    if(document.getElementById('byhHostRestart'))return;
    const b=document.createElement('button');
    b.id='byhHostRestart';
    b.type='button';
    b.textContent='RESTART GAME';
    b.style.cssText='position:fixed;right:14px;bottom:14px;z-index:10050;border:2px solid #ffd21c;background:linear-gradient(135deg,#ff3048,#9b1736);color:#fff;border-radius:14px;padding:11px 15px;font:1000 14px Arial,Helvetica,sans-serif;box-shadow:0 0 22px #ff304866;cursor:pointer;display:none';
    b.onclick=function(){
      try{
        if(typeof mode==='undefined'||mode!=='host'||typeof roomCode==='undefined'||!roomCode)return;
        if(typeof ws==='undefined'||!ws||ws.readyState!==WebSocket.OPEN){if(typeof reconnectNow==='function')reconnectNow();return}
        if(confirm('Restart the game for everyone? All players will return to the lobby and start fresh.')){
          b.disabled=true;
          b.textContent='RESTARTING…';
          ws.send(JSON.stringify({type:'restart'}));
          setTimeout(function(){b.disabled=false;b.textContent='RESTART GAME'},1200);
        }
      }catch(e){}
    };
    document.body.appendChild(b);
  }
  function update(){
    const b=document.getElementById('byhHostRestart');
    if(!b)return;
    let show=false;
    try{show=typeof mode!=='undefined'&&mode==='host'&&typeof roomCode!=='undefined'&&!!roomCode}catch(e){}
    b.style.display=show?'block':'none';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){install();setInterval(update,500)});
  else{install();setInterval(update,500)}
})();