/* BET YOUR HAND — player call button */
(function(){
  let last=false;
  function add(){
    if(typeof mode==='undefined'||mode!=='player'||typeof state==='undefined'||!state||state.phase!=='playing')return;
    if(document.getElementById('byhCallButton'))return;
    const host=document.querySelector('.phoneActions');
    if(!host)return;
    const b=document.createElement('button');
    b.id='byhCallButton';b.className='btnA';b.style.gridColumn='1/-1';b.textContent='🔔 CALL PLAYER';
    b.onclick=function(){
      try{if(typeof ws!=='undefined'&&ws&&ws.readyState===1){ws.send(JSON.stringify({type:'call'}));b.textContent='🔔 CALL SENT';setTimeout(()=>{if(b)b.textContent='🔔 CALL PLAYER'},1600)}}catch(e){}
    };
    host.appendChild(b);
  }
  setInterval(add,250);
})();
