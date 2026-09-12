(function(){
  'use strict';
  function install(){
    if(!window.state || window.mode!=='host' || window.state.phase==='lobby') return;
    if(document.getElementById('byhRestartHost')) return;
    const b=document.createElement('button');
    b.id='byhRestartHost';
    b.textContent='↻ RESTART GAME';
    b.style.cssText='position:fixed;right:14px;bottom:14px;z-index:10020;border:2px solid #ffd21c;border-radius:14px;padding:12px 16px;background:linear-gradient(135deg,#ff3048,#9b1736);color:#fff;font-weight:1000;font-size:16px;box-shadow:0 0 20px #ff304866;cursor:pointer';
    b.onclick=function(){
      if(!window.ws || window.ws.readyState!==WebSocket.OPEN){ alert('HOST IS NOT CONNECTED YET. Please wait for reconnection.'); return; }
      if(confirm('Restart the game for everyone? All players will return to the lobby and start fresh.')){
        window.ws.send(JSON.stringify({type:'restart'}));
        b.disabled=true;
        b.textContent='RESTARTING…';
      }
    };
    document.body.appendChild(b);
  }
  setInterval(install,500);
})();
