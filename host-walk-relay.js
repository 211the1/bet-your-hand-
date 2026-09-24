(()=>{
  const isPlayer=document.body?.classList.contains('player-page');
  const isHost=!isPlayer && !!document.getElementById('host-wanderer');
  if(!isPlayer&&!isHost)return;
  const sessionKey=isPlayer?'byhPlayerSession':'pyhHostSession';
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(sessionKey)||'null')}catch{return null}};
  let players=[];
  let preview=null;
  function connectPreview(){
    const s=readSession(); if(!s?.code)return;
    try{preview?.close()}catch{}
    const proto=location.protocol==='https:'?'wss:':'ws:';
    preview=new WebSocket(proto+'//'+location.host);
    preview.onopen=()=>preview.send(JSON.stringify({type:'PREVIEW_ROOM',code:String(s.code).toUpperCase()}));
    preview.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='ROOM_PREVIEW'&&m.code===String(s.code).toUpperCase())players=m.players||[]}catch{}};
  }
  function ensureStyle(){
    if(document.getElementById('pyh-wander-style'))return;
    const st=document.createElement('style');st.id='pyh-wander-style';st.textContent=`
      #host-wanderer.pyh-hidden-old{display:none!important}
      .pyh-wander-host{position:fixed;z-index:9998;pointer-events:auto;width:clamp(120px,18vw,230px);height:auto;bottom:6%;left:-28vw;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.55));}
      .pyh-wander-player{position:fixed;z-index:99990;pointer-events:none;width:clamp(110px,34vw,200px);height:auto;bottom:9%;left:-35vw;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.55));}
      @keyframes pyhWanderLTR{0%{left:-35vw;transform:translateY(0) rotate(-1deg)}25%{left:20vw;transform:translateY(-2vh) rotate(1deg)}50%{left:55vw;transform:translateY(1vh) rotate(-1deg)}75%{left:90vw;transform:translateY(-1vh) rotate(1deg)}100%{left:115vw;transform:translateY(0) rotate(0)}}
      @keyframes pyhWanderRTL{0%{left:115vw;transform:scaleX(-1) translateY(0) rotate(1deg)}25%{left:80vw;transform:scaleX(-1) translateY(-2vh) rotate(-1deg)}50%{left:45vw;transform:scaleX(-1) translateY(1vh) rotate(1deg)}75%{left:10vw;transform:scaleX(-1) translateY(-1vh) rotate(-1deg)}100%{left:-35vw;transform:scaleX(-1) translateY(0) rotate(0)}}
      .pyh-wander-run-ltr{animation:pyhWanderLTR 5.2s ease-in-out forwards}
      .pyh-wander-run-rtl{animation:pyhWanderRTL 5.2s ease-in-out forwards}
    `;document.head.appendChild(st);
  }
  function makeImg(host){
    const img=document.createElement('img');img.src='/host-character.png?v=2';img.alt='';img.draggable=false;img.className=host?'pyh-wander-host':'pyh-wander-player';
    if(host){img.id='pyh-wander-host';img.addEventListener('click',()=>{const a=new Audio('/host-sound.mp3');a.play().catch(()=>{})});document.body.appendChild(img)}else document.body.appendChild(img);
    return img;
  }
  ensureStyle();
  let actor=null;
  if(isHost){const old=document.getElementById('host-wanderer');if(old)old.classList.add('pyh-hidden-old');actor=makeImg(true)}
  else actor=makeImg(false);
  const WALK=5200,GAP=800;
  function index(){
    if(isHost)return 0;
    const s=readSession(); if(!s?.playerId)return -1;
    const i=players.findIndex(p=>String(p.id)===String(s.playerId));
    return i<0?-1:i+1;
  }
  function tick(){
    const n=Math.max(0,players.length)+1;
    const idx=index(); if(idx<0||(!isHost&&players.length===0)){actor.style.display='none';return}
    actor.style.display='block';
    const slot=Date.now()%(n*(WALK+GAP));
    const start=idx*(WALK+GAP);
    const inSlot=slot>=start&&slot<start+WALK;
    if(!inSlot){actor.style.animation='none';return}
    const cycle=Math.floor(Date.now()/(n*(WALK+GAP)));
    const reverse=((cycle+idx)%3===2);
    const cls=reverse?'pyh-wander-run-rtl':'pyh-wander-run-ltr';
    if(actor.dataset.cycle!==cycle+':'+idx+':'+(reverse?1:0)){actor.dataset.cycle=cycle+':'+idx+':'+(reverse?1:0);actor.className=(isHost?'pyh-wander-host':'pyh-wander-player')+' '+cls;}
  }
  connectPreview();setInterval(connectPreview,5000);setInterval(tick,150);tick();
})();
