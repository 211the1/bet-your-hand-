(() => {
'use strict';
const compact=document.createElement('style');
compact.textContent='@media(max-width:600px){body.player-page main{max-width:430px!important;padding:3px 6px 7px!important}body.player-page h1{font-size:25px!important;margin:2px 0!important}body.player-page main>p{font-size:10px!important;margin:1px 0 3px!important}body.player-page h2{font-size:17px!important;margin:3px 0!important}body.player-page h3{font-size:14px!important;margin:3px 0!important}body.player-page .game-top{font-size:11px!important;line-height:1.1!important;margin:1px 0!important}body.player-page .player-current{width:82px!important;min-height:108px!important;margin:2px auto 3px!important;padding:4px!important;border-width:3px!important;border-radius:10px!important;gap:1px!important}body.player-page .card-face{width:56px!important;height:56px!important;border-radius:7px!important}body.player-page .card-name{font-size:11px!important}body.player-page .card-color,body.player-page .card-type{font-size:9px!important}body.player-page .play-hint{font-size:10px!important;margin:2px 0!important}body.player-page .score-line{font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;margin:2px 0!important}body.player-page .waiting{font-size:14px!important}body.player-page .hand-title{font-size:14px!important;margin:3px 0 2px!important}body.player-page .hand-grid{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;grid-template-columns:none!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;margin:2px 0!important;padding:3px 2px 9px!important;scrollbar-width:auto!important;touch-action:pan-x!important;cursor:grab!important}body.player-page .hand-card{flex:0 0 96px!important;width:96px!important;min-width:96px!important;min-height:42px!important;font-size:10px!important;padding:5px 2px!important;border-width:1px!important;border-radius:7px!important;margin:0!important;pointer-events:auto!important;position:relative!important;z-index:2!important}body.player-page .draw-button{font-size:13px!important;padding:7px!important;margin:4px auto 0!important}body.player-page .wheel-box{width:170px!important;margin:2px auto!important}body.player-page .wheel{width:160px!important;height:160px!important;border-width:4px!important}body.player-page .wheel span{font-size:5px!important;width:40px!important;margin-left:-20px!important;transform:rotate(calc(var(--i)*40deg + 20deg)) translateY(-55px)!important;transform-origin:20px 55px!important}body.player-page .wheel-pointer{font-size:19px!important;top:-3px!important}body.player-page .wheel-message{font-size:12px!important;margin:1px!important}body.player-page .wheel-result{font-size:13px!important;margin-top:2px!important}body.player-page .power-panel{padding:5px!important;margin:3px auto!important}body.player-page .power-panel b{font-size:12px!important;margin-bottom:2px!important}body.player-page .power-panel select,body.player-page .power-panel button{padding:5px!important;margin:2px auto!important;font-size:11px!important}body.player-page input,body.player-page select,body.player-page button{margin:3px 0!important;padding:7px!important;font-size:12px!important}}to{transform:scale(1.08)}}@keyframes lastCardPulse{from{transform:scale(1)}to{transform:scale(1.04)}}.shield-status{margin:6px auto;padding:7px 12px;border:2px solid #fff;border-radius:10px;background:#173b66;color:#fff;font-weight:900;text-align:center;font-size:14px;box-shadow:0 0 14px #1687ff}';
compact.textContent+='.call-flash{position:fixed;inset:0;z-index:99990;pointer-events:none;background:rgba(255,255,255,.82);animation:callFlash .45s steps(2,end) 6}@keyframes callFlash{0%,100%{opacity:0}50%{opacity:1}}';document.head.appendChild(compact);
const codeInput=document.getElementById('code'),nameInput=document.getElementById('name'),characterSelect=document.getElementById('char'),joinButton=document.getElementById('join'),statusEl=document.getElementById('status'),gameEl=document.getElementById('game');
const characters=['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];const colors=['Red','Blue','Green','Yellow'];
characterSelect.replaceChildren(new Option('SELECT CHARACTER',''));characters.forEach(c=>characterSelect.add(new Option(c,c)));
let ws=null,me=null,joined=false,connecting=false,retryTimer=null,pingTimer=null,session=null,autoSpinSent=false,lastSeenEvent=null,selectedCardId=null,sortMode=false;
try{session=JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{}
if(session){codeInput.value=session.code||'';nameInput.value=session.name||'';characterSelect.value=session.character||'';joined=Boolean(session.playerId)}
const setStatus=(m,bad=false)=>{statusEl.textContent=m||'';statusEl.style.color=bad?'#ff6b6b':'#21f17d'};const send=m=>{if(!ws||ws.readyState!==WebSocket.OPEN)return false;ws.send(JSON.stringify(m));return true};const save=s=>localStorage.setItem('byhPlayerSession',JSON.stringify(s));
function scheduleReconnect(){if(retryTimer||!session)return;retryTimer=setTimeout(()=>{retryTimer=null;connect()},1000)}
function characterImage(name){return name?({'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'}[name]||''):''}
function specialImage(card){if(!card)return '';const base='https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3';if(card.type==='WILD')return base+'/WILD.png';if(card.type==='PLAY_YOUR_HAND')return base+'/PLAY_YOUR_HAND.png';if(card.type==='SKIP'||card.type==='REVERSE'){const names={Red:'DEEP_PURPLE',Blue:'ROYAL_BLUE',Green:'EMERALD',Yellow:'GOLD'};const suffix=names[card.color]||'ROYAL_BLUE';return base+`/${card.type}_${suffix}.png`}return ''}
function cardHtml(card){const c=card||{},name=c.character||({SKIP:'SKIP',REVERSE:'REVERSE',WILD:'WILD',PLAY_YOUR_HAND:'PLAY YOUR HAND'}[c.type]||'CARD'),img=characterImage(c.character),color=(c.color||'').toLowerCase();return `<div class="card table-card player-current color-${escapeHtml(color)}">${img?`<img class="card-face" src="${img}" alt="${escapeHtml(name)}">`:''}<div class="card-name">${escapeHtml(name)}</div>${c.color?`<div class="card-color">${escapeHtml(c.color)}</div>`:`<div class="card-type">${escapeHtml((c.type||'CARD').replaceAll('_',' '))}</div>`}</div>`}
function wheelHtml(result,spinning){const labels=['EXTRA PLAY','SHIELD','COLOR','EXTRA PLAY','TURN SWITCH','SHIELD','COLOR','EXTRA PLAY','TURN SWITCH'];return `<div class="wheel-box"><div class="wheel ${spinning?'wheel-spin':''}">${labels.map((x,i)=>`<span style="--i:${i}">${x}</span>`).join('')}</div><div class="wheel-pointer">▼</div>${result?`<div class="wheel-result">POWER: ${escapeHtml(result.power.replaceAll('_',' '))}</div>`:''}</div>`}
function powerControls(game){const p=game.pending?.power;if(!p)return '';if(p==='COLOR_CHOICE')return `<div class="power-panel"><b>CHOOSE A COLOR</b><select id="power-color">${colors.map(c=>`<option>${c}</option>`).join('')}</select><button id="use-power">USE COLOR</button></div>`;return `<div class="power-panel"><b>YOU WON: ${escapeHtml(p.replaceAll('_',' '))}</b><button id="use-power">USE POWER</button></div>`}
function wildColorControls(){return `<div class="power-panel wild-color-panel"><b>CHOOSE A COLOR</b><select id="wild-color">${colors.map(c=>`<option>${c}</option>`).join('')}</select><button id="choose-wild-color">USE COLOR</button></div>`}
function playCallSound(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),now=ctx.currentTime;[0,0.28,0.56].forEach((t,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i===1?880:660;g.gain.setValueAtTime(.0001,now+t);g.gain.exponentialRampToValueAtTime( .45,now+t+.03);g.gain.exponentialRampToValueAtTime(.0001,now+t+ .45);o.connect(g).connect(ctx.destination);o.start(now+t);o.stop(now+t+.2)});setTimeout(()=>ctx.close(),1000)}catch{}}
function showLastCard(event){if(!event||event.id===lastSeenEvent)return;lastSeenEvent=event.id;const overlay=document.createElement('div');overlay.className='last-card-video-overlay';const video=document.createElement('video');video.className='last-card-video';video.src='/last-card.mp4';video.autoplay=true;video.muted=false;video.playsInline=true;video.preload='auto';overlay.appendChild(video);const sound=document.createElement('button');sound.textContent='SOUND TAP FOR SOUND';sound.style.cssText='position:absolute;z-index:5;bottom:24px;left:50%;transform:translateX(-50%);padding:14px 22px;border:0;border-radius:999px;font-weight:900;font-size:18px;background:#fff;color:#111;box-shadow:0 4px 18px rgba(0,0,0,.4)';sound.onclick=()=>{video.muted=false;video.play().catch(()=>{});sound.remove()};overlay.appendChild(sound);document.body.appendChild(overlay);const finish=()=>{if(overlay.isConnected)overlay.remove();if(String(event.playerId)===String(me))send({type:'LAST_CARD_DONE',eventId:event.id})};video.addEventListener('ended',finish,{once:true});video.addEventListener('error',finish,{once:true});video.play().then(()=>{sound.remove()}).catch(()=>{video.muted=true;video.play().catch(finish)})}
function connect(){if(connecting||ws?.readyState===WebSocket.OPEN||!session)return;connecting=true;setStatus(session.playerId?'RECONNECTING TO GAME SERVER…':'CONNECTING TO GAME SERVER…');const protocol=location.protocol==='https:'?'wss:':'ws:';ws=new WebSocket(`${protocol}//${location.host}`);ws.addEventListener('open',()=>{connecting=false;setStatus(session.playerId?'RECONNECTED':'CONNECTED');const message=session.playerId?{type:'RECONNECT',code:session.code,playerId:session.playerId,reconnectToken:session.reconnectToken}:{type:'JOIN_ROOM',code:session.code,name:session.name,character:session.character};send(message);clearInterval(pingTimer);pingTimer=setInterval(()=>send({type:'PING'}),10000)});ws.addEventListener('message',event=>{let m;try{m=JSON.parse(event.data)}catch{return};if(m.type==='ERROR'){setStatus(m.error||'Something went wrong.',true);return}if(m.type==='JOINED'||m.type==='RECONNECTED'){me=m.playerId;joined=true;session={code:m.code,playerId:m.playerId,reconnectToken:m.reconnectToken,name:m.name,character:m.character};save(session);joinButton.disabled=true;setStatus(`JOINED ROOM ${m.code}`);return}if(m.type==='CALL_PLAYER'){playCallSound();const flash=document.createElement('div');flash.className='call-flash';document.body.appendChild(flash);setTimeout(()=>flash.remove(),2800);setStatus('📞 CALL — PAY ATTENTION');setTimeout(()=>setStatus(joined?`JOINED ROOM ${session?.code||''}`:''),1800);return}if(m.type!=='STATE')return;const game=m.game;if(!game){autoSpinSent=false;gameEl.innerHTML='<h2>WAITING FOR HOST…</h2>'+m.players.map(p=>`<div>${escapeHtml(p.name)} — ${escapeHtml(p.character)} ${p.connected?'🟢':'⚪'}</div>`).join('');return}if(game.lastCardEvent)showLastCard(game.lastCardEvent);
if(game.phase==='finished'){
 const winner=game.players.find(p=>String(p.id)===String(game.winner));
 const scores=[...game.players].sort((a,b)=>Number(b.points)-Number(a.points));
 gameEl.innerHTML=`<div style="text-align:center;padding:24px 10px"><h2 style="font-size:42px;color:#21f17d;text-shadow:0 0 18px #21f17d;margin:8px 0">GAME NIGHT COMPLETE</h2><h3 style="font-size:28px;margin:10px 0">WINNER</h3><div style="font-size:34px;font-weight:1000;color:#fff;margin:10px 0">${escapeHtml(winner?.name||'—')}</div><div style="font-size:18px;margin:4px 0">${escapeHtml(winner?.character||'')}</div><div style="margin:18px auto;max-width:420px">${scores.map((p,i)=>`<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid #1687ff"><span>${i+1}. <b>${escapeHtml(p.name)}</b></span><span><b>${Number(p.points)}</b> points</span></div>`).join('')}</div><p style="font-size:14px">Round 2 is finished.</p></div>`;
 return;
}const hand=Array.isArray(game.viewerHand)?game.viewerHand:[],isMyTurn=Boolean(game.isYourTurn),current=game.players.find(p=>p.id===game.turnPlayerId),top=game.topCard||{},viewer=game.players.find(p=>String(p.id)===String(game.viewerId));
const previousHandLength=Number(gameEl.dataset.handLength||0);
if(!hand.some(c=>String(c.id)===String(selectedCardId)))selectedCardId=null;
const orderedHand=[...hand].sort((a,b)=>{
  if(!sortMode)return 0;
  return String(a.character||a.type).localeCompare(String(b.character||b.type))||String(a.color||'').localeCompare(String(b.color||''));
});
const cards=orderedHand.map(card=>{
  const selected=String(card.id)===String(selectedCardId);
  const special=['SKIP','REVERSE','WILD','PLAY_YOUR_HAND'].includes(card.type);
  const nm=card.character||({'SKIP':'SKIP','REVERSE':'REVERSE','WILD':'WILD','PLAY_YOUR_HAND':'PLAY YOUR HAND'}[card.type]||'CARD');
  const img=characterImage(card.character);
  const specialImg=specialImage(card);
  const col=(card.color||'').toLowerCase();
  const specialClass=special?` special-${String(card.type).toLowerCase()}`:'';
  return `<button type="button" class="arcade-card color-${escapeHtml(col)}${specialClass} ${selected?'selected':''}" data-card-id="${escapeHtml(card.id)}">
    ${specialImg?`<img class="special-art" src="${specialImg}" alt="${escapeHtml(nm)}">`:img?`<img src="${img}" alt="${escapeHtml(nm)}">`:''}
    ${specialImg?'':`<strong>${escapeHtml(nm)}</strong><small>${card.color?escapeHtml(card.color):escapeHtml((card.type||'CARD').replaceAll('_',' '))}</small>`}
  </button>`}).join('');
const playableHint=top.character?`MATCH ${escapeHtml(top.color||game.currentColor||'')} OR ${escapeHtml(top.character.toUpperCase())}`:`MATCH ${escapeHtml(game.currentColor||'')} • WILD / PLAY YOUR HAND ALWAYS PLAY`;
let special='';
if(game.pending?.type==='SPIN_WHEEL'&&game.pending.playerId===game.viewerId){
  special=wheelHtml(null,true)+'<div class="wheel-message">POWER WHEEL SPINNING…</div>';
  if(!autoSpinSent){autoSpinSent=true;setTimeout(()=>send({type:'SPIN_WHEEL'}),2200)}
}else if(game.pending?.type==='WILD_COLOR_CHOICE'&&game.pending.playerId===game.viewerId){
  autoSpinSent=false;special=wildColorControls()+'<div class="wheel-message">WILD CARD — CHOOSE THE NEW COLOR</div>';
}else if(game.pending?.type==='POWER_USED'&&game.pending.playerId===game.viewerId){
  autoSpinSent=false;special=wheelHtml(game.wheelResult,false)+powerControls(game)
}else autoSpinSent=false;

const playerTiles=(game.players||[]).map(p=>{
  const mine=String(p.id)===String(game.viewerId);
  const active=String(p.id)===String(game.turnPlayerId);
  const img=characterImage(p.character);
  return `<div class="arcade-player ${active?'active':''} ${mine?'mine':''}">
    <div class="arcade-avatar">${img?`<img src="${img}" alt="${escapeHtml(p.character)}">`:''}</div>
    <b>${escapeHtml(p.character||'PLAYER')}</b>
    <span>${escapeHtml(p.name||'')}</span>
    <em>${Number(p.handCount||0)}</em>
    ${active?'<label>YOUR TURN</label>':''}
  </div>`
}).join('');

const nextPlayer=current?'<div class="side-player"><b>NEXT PLAYER</b><div>'+escapeHtml(current.name||'—')+'</div></div>':'';
const info=`<div class="game-info"><b>GAME INFO</b><div>Direction <strong>${game.direction===-1?'←':'→'}</strong></div><div>Color: <strong>${escapeHtml(game.currentColor||'—')}</strong></div><div>Cards Left: <strong>${Number(game.deckCount||game.cardsLeft||0)}</strong></div></div>`;
const callButton='<button id="call-players" class="arcade-call" type="button">CALL<strong>CALL</strong><span>WAKE PLAYER</span></button>';
const drawButton=isMyTurn&&!game.pending&&!game.lastCardEvent?'<button id="draw-card" class="arcade-draw" type="button">DRAW</button>':'<button class="arcade-draw disabled" type="button" disabled>DRAW</button>';
const playButton=isMyTurn&&!game.pending&&!game.lastCardEvent&&selectedCardId?'<button id="play-selected" class="arcade-play" type="button">PLAY YOUR HAND</button>':'<button class="arcade-play disabled" type="button" disabled>PLAY YOUR HAND</button>';
const topImage=characterImage(top.character);
const topSpecialImage=specialImage(top);
const topCardVisual=topSpecialImage?`<img class="tv-special-art" src="${topSpecialImage}" alt="${escapeHtml(top.character||top.type||'Card')}">`:topImage?`<img src="${topImage}" alt="${escapeHtml(top.character||'Card')}">`:'<div class="special-card-symbol">'+escapeHtml((top.type||'CARD').replaceAll('_',' '))+'</div>';

gameEl.innerHTML=`
<div class="arcade-shell">
  <header class="arcade-header">
    <div class="arcade-room">ROOM ${escapeHtml(game.code||session?.code||'—')}<small>ROUND ${Number(game.round||1)}</small></div>
    <div class="arcade-logo">PLAY YOUR HAND</div>
    <div class="arcade-tools"><button type="button">🔊<small>SOUND</small></button><button type="button">MENU<small>MENU</small></button></div>
  </header>
  <section class="arcade-players">${playerTiles}</section>
  <div class="arcade-main">
    <aside class="arcade-side left-side">${callButton}${nextPlayer}<button class="arcade-side-btn" type="button">▤ VIEW DECK</button></aside>
    <section class="arcade-center">
      <div class="arcade-tv">
        <div class="tv-screen">
          <div class="tv-watermark">PLAY YOUR HAND</div>
          <div class="tv-card ${top.type==='WILD'?'wild':''} ${top.type==='PLAY_YOUR_HAND'?'play-special':''}">
            ${topSpecialImage?topCardVisual:(topImage?`<span class="tv-number">${escapeHtml(top.character||top.type||'')}</span><img src="${topImage}" alt=""><strong>${escapeHtml(top.character||'CARD')}</strong><small>${escapeHtml(top.color||'')}</small>`:`<div class="special-card-symbol">${escapeHtml((top.type||'CARD').replaceAll('_',' '))}</div>`)}
          </div>
        </div>
      </div>
      <div class="arcade-hint">${playableHint}</div>
      ${special}
    </section>
    <aside class="arcade-side right-side">${info}<button class="arcade-emoji" type="button">EMOJI SMILE</button><div class="arcade-special-label">PLAY<br>YOUR<br>HAND</div></aside>
  </div>
  <div class="arcade-hand-title">YOUR HAND <span>${hand.length} CARDS</span></div>
  <div class="arcade-hand-wrap"><button class="hand-arrow" id="hand-left"><</button><div class="hand-grid arcade-hand">${cards}</div><button class="hand-arrow" id="hand-right">></button></div>
  <div class="arcade-slide-label">‹ &nbsp; SLIDE CARDS LEFT OR RIGHT &nbsp; ›</div>
  <div class="arcade-actions">${drawButton}${playButton}<button id="sort-cards" class="arcade-sort" type="button">SORT SORT</button></div>
</div>`;
gameEl.dataset.handLength=hand.length;
const handGrid=gameEl.querySelector('.hand-grid');if(handGrid){if(hand.length>previousHandLength)setTimeout(()=>handGrid.scrollTo({left:handGrid.scrollWidth,behavior:'smooth'}),40)}
gameEl.querySelectorAll('[data-card-id]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(!isMyTurn||game.pending||game.lastCardEvent){setStatus(isMyTurn?'FINISH THE CURRENT ACTION FIRST':`WAITING FOR ${current?.name||'THE OTHER PLAYER'}`,true);return}selectedCardId=b.dataset.cardId;document.querySelectorAll('.arcade-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setStatus('CARD SELECTED — TAP PLAY YOUR HAND')}));const call=gameEl.querySelector('#call-players');if(call)call.addEventListener('click',()=>send({type:'CALL_PLAYER',playerId:'all'}));const draw=gameEl.querySelector('#draw-card');if(draw)draw.addEventListener('click',()=>send({type:'DRAW_CARD'}));const play=gameEl.querySelector('#play-selected');if(play)play.addEventListener('click',()=>{if(selectedCardId){send({type:'PLAY_CARD',cardId:selectedCardId});selectedCardId=null}});const sort=gameEl.querySelector('#sort-cards');if(sort)sort.addEventListener('click',()=>{sortMode=!sortMode;setStatus(sortMode?'HAND SORTED':'HAND ORDER RESTORED')});const left=gameEl.querySelector('#hand-left'),right=gameEl.querySelector('#hand-right'),grid=gameEl.querySelector('.arcade-hand');if(left&&grid)left.addEventListener('click',()=>grid.scrollBy({left:-240,behavior:'smooth'}));if(right&&grid)right.addEventListener('click',()=>grid.scrollBy({left:240,behavior:'smooth'}));const use=gameEl.querySelector('#use-power');if(use)use.addEventListener('click',()=>{const color=gameEl.querySelector('#power-color')?.value;send({type:'USE_POWER',power:game.pending.power,color})});const wild=gameEl.querySelector('#choose-wild-color');if(wild)wild.addEventListener('click',()=>{const color=gameEl.querySelector('#wild-color')?.value;send({type:'CHOOSE_COLOR',color})})});ws.addEventListener('error',()=>setStatus('CONNECTION LOST — RETRYING…',true));ws.addEventListener('close',()=>{connecting=false;clearInterval(pingTimer);ws=null;setStatus('CONNECTION LOST — RETRYING…',true);scheduleReconnect()})}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
joinButton.addEventListener('click',()=>{const code=codeInput.value.trim().toUpperCase(),name=nameInput.value.trim(),character=characterSelect.value;if(!code||!name||!character){setStatus('ENTER CODE, NAME, AND CHARACTER',true);return}session={code,name,character};save(session);connect()});
if(session?.playerId)connect();
})();
