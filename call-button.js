/* BET YOUR HAND — player call button */
(function(){
  function sync(){
    if(typeof mode==='undefined'||mode!=='player'||typeof state==='undefined'||!state||state.phase!=='playing')return;
    const host=document.querySelector('.phoneActions');
    let b=document.getElementById('byhCallButton');
    const me=state.players&&state.players.find(p=>p.id===myId);
    const waiting=!!me&&state.turnPlayerId!==myId&&!state.pending;
    if(!waiting){if(b)b.remove();return;}
    if(!host)return;
    if(!b){
      b=document.createElement('button');
      b.id='byhCallButton';b.className='btnA';b.style.gridColumn='1/-1';b.textContent='🔔 CALL PLAYER';
      b.onclick=function(){
        try{if(typeof ws!=='undefined'&&ws&&ws.readyState===1){ws.send(JSON.stringify({type:'call'}));b.textContent='🔔 CALL SENT';setTimeout(()=>{if(b)b.textContent='🔔 CALL PLAYER'},1600)}}catch(e){}
      };
      host.appendChild(b);
    }
  }
  setInterval(sync,250);
})();
