(() => {
'use strict';
const compact=document.createElement('style');
compact.textContent='@media(max-width:600px){body.player-page main{max-width:430px!important;padding:3px 6px 7px!important}body.player-page h1{font-size:25px!important;margin:2px 0!important}body.player-page main>p{font-size:10px!important;margin:1px 0 3px!important}body.player-page h2{font-size:17px!important;margin:3px 0!important}body.player-page h3{font-size:14px!important;margin:3px 0!important}body.player-page .game-top{font-size:11px!important;line-height:1.1!important;margin:1px 0!important}body.player-page .player-current{width:82px!important;min-height:108px!important;margin:2px auto 3px!important;padding:4px!important;border-width:3px!important;border-radius:10px!important;gap:1px!important}body.player-page .card-face{width:56px!important;height:56px!important;border-radius:7px!important}body.player-page .card-name{font-size:11px!important}body.player-page .card-color,body.player-page .card-type{font-size:9px!important}body.player-page .play-hint{font-size:10px!important;margin:2px 0!important}body.player-page .score-line{font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;margin:2px 0!important}body.player-page .waiting{font-size:14px!important}body.player-page .hand-title{font-size:14px!important;margin:3px 0 2px!important}body.player-page .hand-grid{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;grid-template-columns:none!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;margin:2px 0!important;padding:3px 2px 9px!important;scrollbar-width:auto!important;touch-action:pan-x!important;cursor:grab!important}body.player-page .hand-card{flex:0 0 96px!important;width:96px!important;min-width:96px!important;min-height:42px!important;font-size:10px!important;padding:5px 2px!important;border-width:1px!important;border-radius:7px!important;margin:0!important;pointer-events:auto!important;position:relative!important;z-index:2!important}body.player-page .draw-button{font-size:13px!important;padding:7px!important;margin:4px auto 0!important}body.player-page .wheel-box{width:170px!important;margin:2px auto!important}body.player-page .wheel{width:160px!important;height:160px!important;border-width:4px!important}body.player-page .wheel span{font-size:5px!important;width:40px!important;margin-left:-20px!important;transform:rotate(calc(var(--i)*40deg + 20deg)) translateY(-55px)!important;transform-origin:20px 55px!important}body.player-page .wheel-pointer{font-size:19px!important;top:-3px!important}body.player-page .wheel-message{font-size:12px!important;margin:1px!important}body.player-page .wheel-result{font-size:13px!important;margin-top:2px!important}body.player-page .power-panel{padding:5px!important;margin:3px auto!important}body.player-page .power-panel b{font-size:12px!important;margin-bottom:2px!important}body.player-page .power-panel select,body.player-page .power-panel button{padding:5px!important;margin:2px auto!important;font-size:11px!important}body.player-page input,body.player-page select,body.player-page button{margin:3px 0!important;padding:7px!important;font-size:12px!important}}to{transform:scale(1.08)}}@keyframes lastCardPulse{from{transform:scale(1)}to{transform:scale(1.04)}}.shield-status{margin:6px auto;padding:7px 12px;border:2px solid #fff;border-radius:10px;background:#173b66;color:#fff;font-weight:900;text-align:center;font-size:14px;box-shadow:0 0 14px #1687ff}';
compact.textContent+='.call-flash{position:fixed;inset:0;z-index:99990;pointer-events:none;background:rgba(255,255,255,.82);animation:callFlash .45s steps(2,end) 6}@keyframes callFlash{0%,100%{opacity:0}50%{opacity:1}}';document.head.appendChild(compact);
const codeInput=document.getElementById('code'),nameInput=document.getElementById('name'),characterSelect=document.getElementById('char'),joinButton=document.getElementById('join'),statusEl=document.getElementById('status'),gameEl=document.getElementById('game');const joinPanel=document.getElementById('join-panel');
const characters=['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];const colors=['Red','Blue','Green','Yellow'];
function buildCharacterChoices(taken=[]){
  const current=characterSelect.value;
  characterSelect.replaceChildren(new Option('TAP TO CHOOSE CHARACTER',''));
  characters.forEach(c=>{
    const o=new Option(taken.includes(c)?c+' — TAKEN':c,c);
    o.disabled=taken.includes(c);
    characterSelect.add(o);
  });
  if(current && !taken.includes(current)) characterSelect.value=current;
  const grid=document.getElementById('character-grid');
  if(grid){
    grid.innerHTML=characters.map(c=>{
      const takenNow=taken.includes(c);
      const selected=characterSelect.value===c;
      const img=characterImage(c);
      return '<button type="button" class="character-choice'+(selected?' selected':'')+(takenNow?' taken':'')+'" data-character="'+escapeHtml(c)+'"'+(takenNow?' disabled':'')+'>'+
        '<img src="'+img+'" alt="'+escapeHtml(c)+'"><span>'+escapeHtml(c)+'</span><i>'+ (takenNow?'TAKEN':(selected?'✓':'')) +'</i></button>';
    }).join('');
    grid.querySelectorAll('.character-choice:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>{
      characterSelect.value=btn.dataset.character;
      grid.querySelectorAll('.character-choice').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      setStatus('CHARACTER: '+btn.dataset.character);
    }));
  }
}
buildCharacterChoices([]);
let ws=null,me=null,joined=false,connecting=false,retryTimer=null,pingTimer=null,session=null,autoSpinSent=false,lastSeenEvent=null,selectedCardId=null,sortMode=false,soundEnabled=true;
const topMenuSound=document.getElementById('menu-sound');if(topMenuSound)topMenuSound.addEventListener('click',()=>{soundEnabled=!soundEnabled;topMenuSound.textContent=soundEnabled?'SOUND: ON':'SOUND: OFF';if(soundEnabled)playUiTone(880,.16)});
try{session=JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{}
if(session){codeInput.value=session.code||'';nameInput.value=session.name||'';characterSelect.value=session.character||'';joined=Boolean(session.playerId)}
joinButton.disabled=false;
const setStatus=(m,bad=false)=>{statusEl.textContent=m||'';statusEl.style.color=bad?'#ff6b6b':'#21f17d'};
const showJoinScreen=()=>{if(joinPanel){joinPanel.classList.add('show','prejoin');joinPanel.setAttribute('aria-hidden','false')}joinButton.disabled=false};
const hideJoinScreen=()=>{if(joinPanel){joinPanel.classList.remove('show','prejoin');joinPanel.setAttribute('aria-hidden','true')}};
const send=m=>{if(!ws||ws.readyState!==WebSocket.OPEN)return false;ws.send(JSON.stringify(m));return true};
const save=s=>localStorage.setItem('byhPlayerSession',JSON.stringify(s));
function scheduleReconnect(){if(retryTimer||!session?.playerId)return;retryTimer=setTimeout(()=>{retryTimer=null;connect()},1000)}
function characterImage(name){return name?({'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'}[name]||''):''}
function cardColor(card){if(!card)return '';if(card.type==='CHARACTER'){const c=String(card.id||'').split('-')[0];return colors.includes(c)?c:(colors.includes(card.color)?card.color:'')}if(card.type==='SKIP'||card.type==='REVERSE'){const n=Number(String(card.id||'').split('-')[1]);return Number.isFinite(n)?colors[n%4]:(colors.includes(card.color)?card.color:'')}return colors.includes(card.color)?card.color:''}
function specialImage(card){if(!card)return '';const base='https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3';if(card.type==='WILD')return base+'/WILD.png';if(card.type==='PLAY_YOUR_HAND')return base+'/PLAY_YOUR_HAND.png';if(card.type==='SKIP'||card.type==='REVERSE')return '';return ''}
function specialModern(card,where='hand'){const c=card||{},type=c.type;if(type!=='SKIP'&&type!=='REVERSE')return '';const col=cardColor(c);const iconClass=type==='SKIP'?'skip-icon':'reverse-icon';return `<div class="modern-special ${type.toLowerCase()} modern-${String(col).toLowerCase()} ${where}"><div class="modern-special-icon ${iconClass}" aria-hidden="true"></div><div class="modern-special-name">${type}</div></div>`}
function cardHtml(card){const c=card||{},name=c.character||({SKIP:'SKIP',REVERSE:'REVERSE',WILD:'WILD',PLAY_YOUR_HAND:'PLAY YOUR HAND'}[c.type]||'CARD'),img=characterImage(c.character),authoritativeColor=cardColor(c),color=authoritativeColor.toLowerCase();return `<div class="card table-card player-current color-${escapeHtml(color)}">${img?`<img class="card-face" src="${img}" alt="${escapeHtml(name)}">`:''}<div class="card-name">${escapeHtml(name)}</div>${authoritativeColor?`<div class="card-color">${escapeHtml(authoritativeColor)}</div>`:`<div class="card-type">${escapeHtml((c.type||'CARD').replaceAll('_',' '))}</div>`}</div>`}
function wheelHtml(result,spinning){return `<div class="wheel-box"><div class="wheel ${spinning?'wheel-spin':''}"><div class="wheel-center">POWER</div></div><div class="wheel-pointer">▼</div>${result?`<div class="wheel-result">POWER: ${escapeHtml(result.power.replaceAll('_',' '))}</div>`:''}</div>`}
function colorButtons(id){return `<div class="color-buttons">${colors.map(c=>`<button type="button" class="color-choice color-choice-${c.toLowerCase()}" data-color="${c}" data-color-group="${id}">${c}</button>`).join('')}</div>`}
function powerControls(game){const p=game.pending?.power;if(!p)return '';if(p==='COLOR_CHOICE')return `<div class="power-panel"><b>CHOOSE A COLOR</b>${colorButtons('power-color')}</div>`;return `<div class="power-panel"><b>YOU WON: ${escapeHtml(p.replaceAll('_',' '))}</b><button id="use-power" type="button">USE POWER</button></div>`}
function wildColorControls(){return `<div class="power-panel wild-color-panel"><b>WILD CARD — CHOOSE A COLOR</b>${colorButtons('wild-color')}</div>`}
function playUiTone(freq=660,duration=.12){if(!soundEnabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);setTimeout(()=>ctx.close(),300)}catch{}}
function playCallSound(){if(!soundEnabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),now=ctx.currentTime;[0,0.28,0.56].forEach((t,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i===1?880:660;g.gain.setValueAtTime(.0001,now+t);g.gain.exponentialRampToValueAtTime( .45,now+t+.03);g.gain.exponentialRampToValueAtTime(.0001,now+t+ .45);o.connect(g).connect(ctx.destination);o.start(now+t);o.stop(now+t+.2)});setTimeout(()=>ctx.close(),1000)}catch{}}
function showLastCard(event){if(!event||event.id===lastSeenEvent)return;lastSeenEvent=event.id;const overlay=document.createElement('div');overlay.className='last-card-video-overlay';const video=document.createElement('video');video.className='last-card-video';video.src='/last-card.mp4';video.autoplay=true;video.muted=false;video.playsInline=true;video.preload='auto';overlay.appendChild(video);const sound=document.createElement('button');sound.textContent='SOUND TAP FOR SOUND';sound.style.cssText='position:absolute;z-index:5;bottom:24px;left:50%;transform:translateX(-50%);padding:14px 22px;border:0;border-radius:999px;font-weight:900;font-size:18px;background:#fff;color:#111;box-shadow:0 4px 18px rgba(0,0,0,.4)';sound.onclick=()=>{video.muted=false;video.play().catch(()=>{});sound.remove()};overlay.appendChild(sound);document.body.appendChild(overlay);const finish=()=>{if(overlay.isConnected)overlay.remove();if(String(event.playerId)===String(me))send({type:'LAST_CARD_DONE',eventId:event.id})};video.addEventListener('ended',finish,{once:true});video.addEventListener('error',finish,{once:true});video.play().then(()=>{sound.remove()}).catch(()=>{video.muted=true;video.play().catch(finish)})}
function connect(){if(connecting||ws?.readyState===WebSocket.OPEN||!session)return;connecting=true;setStatus(session.playerId?'RECONNECTING TO GAME SERVER…':'CONNECTING TO GAME SERVER…');const protocol=location.protocol==='https:'?'wss:':'ws:';ws=new WebSocket(`${protocol}//${location.host}`);ws.addEventListener('open',()=>{connecting=false;setStatus(session.playerId?'RECONNECTED':'CONNECTED');const message=session.playerId?{type:'RECONNECT',code:session.code,playerId:session.playerId,reconnectToken:session.reconnectToken}:{type:'JOIN_ROOM',code:session.code,name:session.name,character:session.character};send(message);clearInterval(pingTimer);pingTimer=setInterval(()=>send({type:'PING'}),10000)});ws.addEventListener('message',event=>{let m;try{m=JSON.parse(event.data)}catch{return};if(m.type==='ERROR'){
  joinButton.disabled=false;
  const msg=m.error||'Something went wrong.';
  setStatus(msg,true);
  // During a live game, a rejected move is a game-action error — keep the player in the game.
  if(joined && session?.playerId){
    setTimeout(()=>setStatus(isMyTurn?'YOUR TURN — PLAY OR DRAW':`WAITING FOR ${current?.name||'THE OTHER PLAYER'}`),2200);
    return;
  }
  if(session?.playerId){
    localStorage.removeItem('byhPlayerSession');
    session=null;me=null;joined=false;
  }
  showJoinScreen();
  return
}
if(m.type==='JOINED'||m.type==='RECONNECTED'){
  me=m.playerId;joined=true;
  session={code:m.code,playerId:m.playerId,reconnectToken:m.reconnectToken,name:m.name,character:m.character};
  save(session);joinButton.disabled=true;hideJoinScreen();setStatus(`JOINED ROOM ${m.code}`);return
}if(m.type==='ROOM_RESTARTED'){joined=false;me=null;session=null;localStorage.removeItem('byhPlayerSession');showJoinScreen();setStatus('ROOM RESTARTED — ENTER THE NEW ROOM CODE',true);return}if(m.type==='CALL_PLAYER'){playCallSound();const flash=document.createElement('div');flash.className='call-flash';flash.innerHTML='<div class="wake-up-arcade">WAKE UP!</div>';document.body.appendChild(flash);setTimeout(()=>flash.remove(),2200);setStatus('📞 CALL — PAY ATTENTION');setTimeout(()=>setStatus(joined?`JOINED ROOM ${session?.code||''}`:''),1800);return}if(m.type!=='STATE')return;const game=m.game;if(!game){autoSpinSent=false;gameEl.innerHTML='<h2>WAITING FOR HOST…</h2>'+m.players.map(p=>`<div>${escapeHtml(p.name)} — ${escapeHtml(p.character)} ${p.connected?'🟢':'⚪'}</div>`).join('');return}if(game.lastCardEvent)showLastCard(game.lastCardEvent);
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
  const selected=false;
  const special=['SKIP','REVERSE','WILD','PLAY_YOUR_HAND'].includes(card.type);
  const nm=card.character||({'SKIP':'SKIP','REVERSE':'REVERSE','WILD':'WILD','PLAY_YOUR_HAND':'PLAY YOUR HAND'}[card.type]||'CARD');
  const img=characterImage(card.character);
  const specialImg=specialImage(card);
  const col=cardColor(card).toLowerCase();
  const specialClass=special?` special-${String(card.type).toLowerCase()}`:'';
  return `<button type="button" class="arcade-card color-${escapeHtml(col)}${specialClass} ${selected?'selected':''}" data-card-id="${escapeHtml(card.id)}">
    ${specialImg?`<img class="special-art" src="${specialImg}" alt="${escapeHtml(nm)}">`:special?specialModern(card,'hand'):img?`<img src="${img}" alt="${escapeHtml(nm)}">`:''}
    ${specialImg||special?'':`<strong>${escapeHtml(nm)}</strong><small>${cardColor(card)?escapeHtml(cardColor(card)):escapeHtml((card.type||'CARD').replaceAll('_',' '))}</small>`}
  </button>`}).join('');
const playableHint=top.character?`MATCH ${escapeHtml(cardColor(top)||game.currentColor||'')} OR ${escapeHtml(top.character.toUpperCase())}`:`MATCH ${escapeHtml(game.currentColor||'')} • WILD / PLAY YOUR HAND ALWAYS PLAY`;
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
const info=`<div class="game-info"><b>GAME INFO</b><div>Direction <strong>${game.direction===-1?'LEFT':'RIGHT'}</strong></div><div>Color: <strong>${escapeHtml(game.currentColor||'—')}</strong></div><div>Cards Left: <strong>${Number(game.deckCount||game.cardsLeft||0)}</strong></div></div>`;
const callButton='<button id="call-players" class="arcade-call" type="button">CALL<span>WAKE PLAYER</span></button>';
const drawButton=isMyTurn&&!game.pending&&!game.lastCardEvent?'<button id="draw-card" class="arcade-draw" type="button">DRAW</button>':'<button class="arcade-draw disabled" type="button" disabled>DRAW</button>';

const topImage=characterImage(top.character);
const topSpecialImage=specialImage(top);
const topCardVisual=topSpecialImage?`<img class="tv-special-art" src="${topSpecialImage}" alt="${escapeHtml(top.character||top.type||'Card')}">`:(top.type==='SKIP'||top.type==='REVERSE')?specialModern(top,'tv'):topImage?`<img src="${topImage}" alt="${escapeHtml(top.character||'Card')}">`:'<div class="special-card-symbol">'+escapeHtml((top.type||'CARD').replaceAll('_',' '))+'</div>';

gameEl.innerHTML=`
<div class="arcade-shell">
  <header class="arcade-header">
    <div class="arcade-room">ROOM ${escapeHtml(game.code||session?.code||'—')}<small>ROUND ${Number(game.round||1)}</small></div>
    <div class="arcade-logo">PLAY YOUR HAND</div>
    <div class="arcade-tools"><button id="menu-toggle" type="button">MENU<small>MENU</small></button></div>
  </header>
  <section class="arcade-players">${playerTiles}</section>
  <div class="turn-banner ${isMyTurn?'my-turn':'waiting-turn'}">${isMyTurn?'YOUR TURN — PLAY OR DRAW':'WAITING FOR '+escapeHtml(current?.name||'THE OTHER PLAYER')}</div>
  <div class="arcade-main">
    <aside class="arcade-side left-side">${callButton}${nextPlayer}<button class="arcade-side-btn" type="button">VIEW DECK</button></aside>
    <section class="arcade-center">
      <div class="arcade-tv">
        <div class="tv-screen">
          <div class="tv-watermark">PLAY YOUR HAND</div>
          <div class="tv-card color-${escapeHtml(cardColor(top).toLowerCase())} ${top.type==='WILD'?'wild':''} ${top.type==='PLAY_YOUR_HAND'?'play-special':''}">
            ${topSpecialImage?topCardVisual:(topImage?`<span class="tv-number">${escapeHtml(top.character||top.type||'')}</span><img src="${topImage}" alt=""><strong>${escapeHtml(top.character||'CARD')}</strong><small>${escapeHtml(cardColor(top)||'')}</small>`:`<div class="special-card-symbol">${escapeHtml((top.type||'CARD').replaceAll('_',' '))}</div>`)}
          </div>
        </div>
      </div>
      <div class="arcade-hint">${playableHint}</div>
      ${special}
      <div class="arcade-hand-title">YOUR HAND <span>${hand.length} CARDS</span></div>
      <div class="arcade-hand-wrap"><button class="hand-arrow" id="hand-left"><</button><div class="hand-grid arcade-hand">${cards}</div><button class="hand-arrow" id="hand-right">></button></div>
      <div class="arcade-slide-label">SLIDE CARDS LEFT OR RIGHT</div>
      <div class="arcade-actions">${drawButton}<button id="sort-cards" class="arcade-sort" type="button">SORT</button></div>
    </section>
    <aside class="arcade-side right-side">${info}<button class="arcade-emoji" type="button">EMOJI<br>SMILE</button></aside></div>
</div>`;
gameEl.dataset.handLength=hand.length;
const menu=gameEl.querySelector('#menu-toggle');if(menu){menu.addEventListener('click',()=>{let panel=document.getElementById('game-menu-panel');if(!panel){panel=document.createElement('div');panel.id='game-menu-panel';panel.className='game-menu-panel';panel.innerHTML='<div class="game-menu-box"><button id="close-game-menu" class="game-menu-close" type="button">×</button><h2>GAME MENU</h2><section class="game-rules"><h3>GAME RULES</h3><p>Match the color or character on the display card.</p><p>On your turn, slide a playable card upward to play it, or press DRAW.</p><p>WILD lets you choose the new color.</p><p>PLAY YOUR HAND always plays and starts the Power Wheel.</p><p>First player to use all cards wins the round.</p></section><button id="menu-sound" class="menu-sound-button" type="button"></button></div>';document.body.appendChild(panel);const close=panel.querySelector('#close-game-menu');if(close)close.addEventListener('click',()=>panel.classList.remove('show'));const sound=panel.querySelector('#menu-sound');if(sound){const updateSound=()=>{sound.textContent=soundEnabled?'SOUND: ON':'SOUND: OFF'};updateSound();sound.addEventListener('click',()=>{soundEnabled=!soundEnabled;updateSound();if(soundEnabled)playUiTone(880,.16)})}}panel.classList.add('show')})}

const handGrid=gameEl.querySelector('.hand-grid');if(handGrid){if(hand.length>previousHandLength)setTimeout(()=>handGrid.scrollTo({left:handGrid.scrollWidth,behavior:'smooth'}),40)}
gameEl.querySelectorAll('[data-card-id]').forEach(b=>{let startX=0,startY=0,dragging=false,swiped=false;const play=()=>{if(!isMyTurn||game.pending||game.lastCardEvent){setStatus(isMyTurn?'FINISH THE CURRENT ACTION FIRST':`WAITING FOR ${current?.name||'THE OTHER PLAYER'}`,true);return}const cardId=b.dataset.cardId;selectedCardId=null;setStatus('PLAYING CARD…');send({type:'PLAY_CARD',cardId})};b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;startX=e.clientX;startY=e.clientY;dragging=true;swiped=false;b.setPointerCapture?.(e.pointerId);b.classList.add('swiping')});b.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(dy<-10&&Math.abs(dy)>Math.abs(dx)){const lift=Math.min(55,Math.max(0,-dy));b.style.transform=`translateY(${-lift}px)`}});b.addEventListener('pointerup',e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;dragging=false;b.releasePointerCapture?.(e.pointerId);b.classList.remove('swiping');b.style.transform='';if(dy<=-70&&Math.abs(dy)>=Math.abs(dx)*1.15){swiped=true;play()}else{setStatus(isMyTurn?'SLIDE THE CARD UP TO PLAY':'WAITING FOR '+(current?.name||'THE OTHER PLAYER'),false)}setTimeout(()=>{swiped=false},100)});b.addEventListener('pointercancel',()=>{dragging=false;b.classList.remove('swiping');b.style.transform=''});b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()})});const call=gameEl.querySelector('#call-players');if(call)call.addEventListener('click',()=>send({type:'CALL_PLAYER',playerId:'all'}));const sound=gameEl.querySelector('#sound-toggle');if(sound)sound.addEventListener('click',()=>{soundEnabled=!soundEnabled;sound.innerHTML=soundEnabled?'SOUND<small>SOUND</small>':'OFF<small>SOUND</small>';if(soundEnabled)playUiTone(880,.16);setStatus(soundEnabled?'SOUND ON':'SOUND OFF')});const draw=gameEl.querySelector('#draw-card');if(draw)draw.addEventListener('click',()=>send({type:'DRAW_CARD'}));const sort=gameEl.querySelector('#sort-cards');if(sort)sort.addEventListener('click',()=>{sortMode=!sortMode;setStatus(sortMode?'HAND SORTED':'HAND ORDER RESTORED')});const left=gameEl.querySelector('#hand-left'),right=gameEl.querySelector('#hand-right'),grid=gameEl.querySelector('.arcade-hand');if(left&&grid)left.addEventListener('click',()=>grid.scrollBy({left:-240,behavior:'smooth'}));if(right&&grid)right.addEventListener('click',()=>grid.scrollBy({left:240,behavior:'smooth'}));const use=gameEl.querySelector('#use-power');if(use)use.addEventListener('click',()=>send({type:'USE_POWER',power:game.pending.power}));gameEl.querySelectorAll('.color-choice').forEach(b=>b.addEventListener('click',()=>{const color=b.dataset.color;const group=b.dataset.colorGroup;if(group==='power-color')send({type:'USE_POWER',power:game.pending.power,color});else send({type:'CHOOSE_COLOR',color})}));});ws.addEventListener('error',()=>{setStatus('CONNECTION LOST — RETRYING…',true);if(!joined)showJoinScreen()});
ws.addEventListener('close',()=>{connecting=false;clearInterval(pingTimer);ws=null;if(!joined){showJoinScreen();setStatus('CONNECTION LOST — ENTER ROOM CODE, NAME, AND CHARACTER',true)}else{setStatus('CONNECTION LOST — RETRYING…',true)}scheduleReconnect()})}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
joinButton.addEventListener('click',()=>{
 const code=codeInput.value.trim().toUpperCase(),name=nameInput.value.trim(),character=characterSelect.value;
 showJoinScreen();
 if(!code||!name||!character){setStatus('ENTER CODE, NAME, AND CHARACTER',true);return}
 session={code,name,character};save(session);
 joined=false;me=null;
 setStatus('JOINING ROOM…');
 if(ws?.readyState===WebSocket.OPEN){
   send({type:'JOIN_ROOM',code,name,character});
 }else{
   connect();
 }
});
if(session?.playerId)connect();
})();
