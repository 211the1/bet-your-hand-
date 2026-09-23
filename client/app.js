(() => {
'use strict';
const compact=document.createElement('style');
compact.textContent='@media(max-width:600px){body.player-page main{max-width:430px!important;padding:3px 6px 7px!important}body.player-page h1{font-size:25px!important;margin:2px 0!important}body.player-page main>p{font-size:10px!important;margin:1px 0 3px!important}body.player-page h2{font-size:17px!important;margin:3px 0!important}body.player-page h3{font-size:14px!important;margin:3px 0!important}body.player-page .game-top{font-size:11px!important;line-height:1.1!important;margin:1px 0!important}body.player-page .player-current{width:82px!important;min-height:108px!important;margin:2px auto 3px!important;padding:4px!important;border-width:3px!important;border-radius:10px!important;gap:1px!important}body.player-page .card-face{width:56px!important;height:56px!important;border-radius:7px!important}body.player-page .card-name{font-size:11px!important}body.player-page .card-color,body.player-page .card-type{font-size:9px!important}body.player-page .play-hint{font-size:10px!important;margin:2px 0!important}body.player-page .score-line{font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;margin:2px 0!important}body.player-page .waiting{font-size:14px!important}body.player-page .hand-title{font-size:14px!important;margin:3px 0 2px!important}body.player-page .hand-grid{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;grid-template-columns:none!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;margin:2px 0!important;padding:3px 2px 9px!important;scrollbar-width:auto!important;touch-action:pan-x!important;cursor:grab!important}body.player-page .hand-card{flex:0 0 96px!important;width:96px!important;min-width:96px!important;min-height:42px!important;font-size:10px!important;padding:5px 2px!important;border-width:1px!important;border-radius:7px!important;margin:0!important;pointer-events:auto!important;position:relative!important;z-index:2!important}body.player-page .draw-button{font-size:13px!important;padding:7px!important;margin:4px auto 0!important}body.player-page .wheel-box{width:170px!important;margin:2px auto!important}body.player-page .wheel{width:160px!important;height:160px!important;border-width:4px!important}body.player-page .wheel span{font-size:5px!important;width:40px!important;margin-left:-20px!important;transform:rotate(calc(var(--i)*40deg + 20deg)) translateY(-55px)!important;transform-origin:20px 55px!important}body.player-page .wheel-pointer{font-size:19px!important;top:-3px!important}body.player-page .wheel-message{font-size:12px!important;margin:1px!important}body.player-page .wheel-result{font-size:13px!important;margin-top:2px!important}body.player-page .power-panel{padding:5px!important;margin:3px auto!important}body.player-page .power-panel b{font-size:12px!important;margin-bottom:2px!important}body.player-page .power-panel select,body.player-page .power-panel button{padding:5px!important;margin:2px auto!important;font-size:11px!important}body.player-page input,body.player-page select,body.player-page button{margin:3px 0!important;padding:7px!important;font-size:12px!important}}to{transform:scale(1.08)}}@keyframes lastCardPulse{from{transform:scale(1)}to{transform:scale(1.04)}}.shield-status{margin:6px auto;padding:7px 12px;border:2px solid #fff;border-radius:10px;background:#173b66;color:#fff;font-weight:900;text-align:center;font-size:14px;box-shadow:0 0 14px #1687ff}';
compact.textContent+='.menu-quit-button{display:block;width:100%;margin:14px 0 2px;padding:12px 16px;border:2px solid #ff3b3b;border-radius:12px;background:#7d1010;color:#fff;font-weight:1000;font-size:15px;letter-spacing:.5px;box-shadow:0 0 12px rgba(255,59,59,.45)}.menu-quit-button:active{transform:scale(.98)}';compact.textContent+='.call-flash{position:fixed;inset:0;z-index:99990;pointer-events:none;background:rgba(255,255,255,.82);animation:callFlash .45s steps(2,end) 6}@keyframes callFlash{0%,100%{opacity:0}50%{opacity:1}}';compact.textContent+='\n.emoji-menu-overlay{position:fixed;inset:0;z-index:99995;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,20,.78);box-sizing:border-box}\n.emoji-menu-box{width:min(94vw,520px);max-height:90vh;overflow:auto;background:linear-gradient(180deg,#111b52,#070b25);border:3px solid #1687ff;border-radius:20px;box-shadow:0 0 28px #1687ff99;padding:16px;color:#fff;text-align:center}\n.emoji-menu-title{font-size:24px;font-weight:1000;color:#ffd400;text-shadow:0 0 12px #ffd400;margin-bottom:10px}\n.emoji-menu-sub{font-size:14px;font-weight:800;margin:5px 0 10px}\n.emoji-targets,.emoji-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n.emoji-target,.emoji-choice{min-height:52px;border:2px solid #1687ff;border-radius:12px;background:#10183f;color:#fff;font-weight:900;cursor:pointer}\n.emoji-target.selected{border-color:#ffd400;box-shadow:0 0 12px #ffd40099;background:#26336f}\n.emoji-choice{font-size:28px;display:flex;align-items:center;justify-content:center}\n.emoji-choice img{width:42px;height:42px;object-fit:contain;border-radius:8px}\n.emoji-choice.custom{border-color:#ffd400;background:#382b00}\n.emoji-menu-close{margin-top:12px;width:100%;min-height:48px;border:2px solid #ff4b55;border-radius:12px;background:#6f1018;color:#fff;font-weight:1000;font-size:16px}\n.incoming-emoji{position:fixed;left:50%;top:48%;z-index:99998;transform:translate(-50%,-50%) scale(.45);font-size:45vw;line-height:1;text-align:center;pointer-events:none;animation:incomingEmojiFloat 1.7s ease-out forwards;text-shadow:0 8px 24px #000,0 0 24px #fff}\n.incoming-emoji img{width:45vw;height:45vw;object-fit:contain;border-radius:18px;display:block}\n@keyframes incomingEmojiFloat{0%{opacity:0;transform:translate(-50%,-20%) scale(.45)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}65%{opacity:1;transform:translate(-50%,-95%) scale(1)}100%{opacity:0;transform:translate(-50%,-150%) scale(.82)}}';document.head.appendChild(compact);
const codeInput=document.getElementById('code'),nameInput=document.getElementById('name'),characterSelect=document.getElementById('char'),joinButton=document.getElementById('join'),statusEl=document.getElementById('status'),gameEl=document.getElementById('game');const joinPanel=document.getElementById('join-panel');
const characters=['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];const colors=['Red','Blue','Green','Yellow'];
const wheelSections=[
 {section:1,character:'Bug',color:'Yellow',power:'EXTRA_PLAY'},
 {section:2,character:'Face',color:'Red',power:'TURN_SWITCH'},
 {section:3,character:'Ling Ling',color:'Blue',power:'SHIELD'},
 {section:4,character:'Beanz',color:'Green',power:'COLOR_CHOICE'},
 {section:5,character:'The One',color:'Red',power:'EXTRA_PLAY'},
 {section:6,character:'Boone',color:'Yellow',power:'TURN_SWITCH'},
 {section:7,character:'Chicken Joe',color:'Blue',power:'SHIELD'},
 {section:8,character:'Juby',color:'Green',power:'COLOR_CHOICE'},
 {section:9,character:'Meemaw',color:'Red',power:'EXTRA_PLAY'}
];
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
let ws=null,me=null,joined=false,connecting=false,retryTimer=null,pingTimer=null,session=null,autoSpinSent=false,lastSeenEvent=null,lastCardWasActive=false,selectedCardId=null,sortMode=false,soundEnabled=true,intentionalDisconnect=false;
const topMenuSound=document.getElementById('menu-sound');if(topMenuSound)topMenuSound.addEventListener('click',()=>{soundEnabled=!soundEnabled;topMenuSound.textContent=soundEnabled?'SOUND: ON':'SOUND: OFF';if(soundEnabled)playUiTone(880,.16)});
try{session=JSON.parse(localStorage.getItem('byhPlayerSession')||'null')}catch{}
if(session){codeInput.value=session.code||'';nameInput.value=session.name||'';characterSelect.value=session.character||'';joined=Boolean(session.playerId)}
joinButton.disabled=false;
const setStatus=(m,bad=false)=>{statusEl.textContent=m||'';statusEl.style.color=bad?'#ff6b6b':'#21f17d'};
const showJoinScreen=(prejoin=true)=>{if(joinPanel){joinPanel.classList.add('show');joinPanel.classList.toggle('prejoin',prejoin);joinPanel.setAttribute('aria-hidden','false')}joinButton.disabled=false};
const hideJoinScreen=()=>{if(joinPanel){joinPanel.classList.remove('show','prejoin');joinPanel.setAttribute('aria-hidden','true')}};
const resetToFreshJoinScreen=(message='')=>{
  intentionalDisconnect=true;
  joined=false;me=null;session=null;localStorage.removeItem('byhPlayerSession');
  codeInput.value='';nameInput.value='';characterSelect.value='';
  buildCharacterChoices([]);
  gameEl.innerHTML='';
  document.getElementById('game-menu-panel')?.remove();
  showJoinScreen(true);
  setStatus(message);
};
const send=m=>{if(!ws||ws.readyState!==WebSocket.OPEN)return false;ws.send(JSON.stringify(m));return true};
const save=s=>localStorage.setItem('byhPlayerSession',JSON.stringify(s));
function scheduleReconnect(){if(retryTimer||!session?.playerId)return;retryTimer=setTimeout(()=>{retryTimer=null;connect()},1000)}
function characterImage(name){return name?({'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'}[name]||''):''}
function cardColor(card){if(!card)return '';if(card.type==='CHARACTER'){const c=String(card.id||'').split('-')[0];return colors.includes(c)?c:(colors.includes(card.color)?card.color:'')}if(card.type==='SKIP'||card.type==='REVERSE'){const n=Number(String(card.id||'').split('-')[1]);return Number.isFinite(n)?colors[n%4]:(colors.includes(card.color)?card.color:'')}return colors.includes(card.color)?card.color:''}
function specialImage(card){if(!card)return '';const base='https://raw.githubusercontent.com/211the1/bet-your-hand-/522dda3f4d19b5024001a74e78d9229b5e0c98b3';if(card.type==='WILD')return base+'/WILD.png';if(card.type==='PLAY_YOUR_HAND')return base+'/PLAY_YOUR_HAND.png';if(card.type==='SKIP'||card.type==='REVERSE')return '';return ''}
function specialModern(card,where='hand'){const c=card||{},type=c.type;if(type!=='SKIP'&&type!=='REVERSE')return '';const col=cardColor(c);const iconClass=type==='SKIP'?'skip-icon':'reverse-icon';return `<div class="modern-special ${type.toLowerCase()} modern-${String(col).toLowerCase()} ${where}"><div class="modern-special-icon ${iconClass}" aria-hidden="true"></div><div class="modern-special-name">${type}</div></div>`}
function cardHtml(card){const c=card||{},name=c.character||({SKIP:'SKIP',REVERSE:'REVERSE',WILD:'WILD',PLAY_YOUR_HAND:'PLAY YOUR HAND'}[c.type]||'CARD'),img=characterImage(c.character),authoritativeColor=cardColor(c),color=authoritativeColor.toLowerCase();return `<div class="card table-card player-current color-${escapeHtml(color)}">${img?`<img class="card-face" src="${img}" alt="${escapeHtml(name)}">`:''}<div class="card-name">${escapeHtml(name)}</div>${authoritativeColor?`<div class="card-color">${escapeHtml(authoritativeColor)}</div>`:`<div class="card-type">${escapeHtml((c.type||'CARD').replaceAll('_',' '))}</div>`}</div>`}
function wheelHtml(result,spinning){const landed=Number(result?.section||0);const landRotation=landed>0?(1440-(landed-1)*40):0;const wheelClass=spinning?'wheel-spin':(result?'wheel-land':'');const wheelStyle=`--wheel-land-rotation:${landRotation}deg`;const wheelSrc='/power-wheel.png?v=1';return `<div class="wheel-box wheel-image-box"><div class="wheel ${wheelClass}" style="${wheelStyle}"><img class="power-wheel-art" src="${wheelSrc}" alt="PLAY YOUR HAND Power Wheel"></div><div class="wheel-pointer">▼</div></div>`}
function colorButtons(id){return `<div class="color-buttons">${colors.map(c=>`<button type="button" class="color-choice color-choice-${c.toLowerCase()}" data-color="${c}" data-color-group="${id}">${c}</button>`).join('')}</div>`}
function powerControls(game){const p=game.pending?.power;if(!p)return '';if(p==='COLOR_CHOICE')return `<div class="power-panel"><b>POWER PLAY READY</b><small class="power-note">COLOR CHOICE • CURRENT: ${escapeHtml(game.wheelResult?.color||game.currentColor||'—')}</small>${colorButtons('power-color')}</div>`;return `<div class="power-panel"><b>POWER PLAY READY</b><small class="power-note">POWER: ${escapeHtml(p.replaceAll('_',' '))}</small><button id="use-power" type="button">USE POWER PLAY</button></div>`}
function wildColorControls(){return `<div class="power-panel wild-color-panel"><b>WILD CARD — CHOOSE A COLOR</b>${colorButtons('wild-color')}</div>`}
function playUiTone(freq=660,duration=.12){if(!soundEnabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);setTimeout(()=>ctx.close(),300)}catch{}}
function playCallSound(){if(!soundEnabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),now=ctx.currentTime;[0,0.28,0.56].forEach((t,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i===1?880:660;g.gain.setValueAtTime(.0001,now+t);g.gain.exponentialRampToValueAtTime( .45,now+t+.03);g.gain.exponentialRampToValueAtTime(.0001,now+t+ .45);o.connect(g).connect(ctx.destination);o.start(now+t);o.stop(now+t+.2)});setTimeout(()=>ctx.close(),1000)}catch{}}
function playEasterLaugh(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();const now=ctx.currentTime;const master=ctx.createGain();master.gain.value=.62;master.connect(ctx.destination);for(let i=0;i<8;i++){const t=now+i*.19;const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(125+(i%3)*18,t);o.frequency.exponentialRampToValueAtTime(92,t+.14);f.type='lowpass';f.frequency.value=900;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.8,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(f).connect(g).connect(master);o.start(t);o.stop(t+.16)}setTimeout(()=>ctx.close(),1900)}catch{}}
function showLastCard(event){if(!event||event.id===lastSeenEvent)return;lastSeenEvent=event.id;const overlay=document.createElement('div');overlay.className='last-card-video-overlay';const video=document.createElement('video');video.className='last-card-video';video.src='/last-card.mp4';video.autoplay=true;video.muted=false;video.playsInline=true;video.preload='auto';overlay.appendChild(video);const sound=document.createElement('button');sound.textContent='SOUND TAP FOR SOUND';sound.style.cssText='position:absolute;z-index:5;bottom:24px;left:50%;transform:translateX(-50%);padding:14px 22px;border:0;border-radius:999px;font-weight:900;font-size:18px;background:#fff;color:#111;box-shadow:0 4px 18px rgba(0,0,0,.4)';sound.onclick=()=>{video.muted=false;video.play().catch(()=>{});sound.remove()};overlay.appendChild(sound);document.body.appendChild(overlay);const finish=()=>{if(overlay.isConnected)overlay.remove();if(String(event.playerId)===String(me))send({type:'LAST_CARD_DONE',eventId:event.id})};video.addEventListener('ended',finish,{once:true});video.addEventListener('error',finish,{once:true});video.play().then(()=>{sound.remove()}).catch(()=>{video.muted=true;video.play().catch(finish)})}
function closeEmojiMenu(){document.getElementById('emoji-menu-overlay')?.remove()}
function showIncomingEmoji(m){if(String(m.targetPlayerId)!==String(me))return;document.querySelectorAll('.incoming-emoji').forEach(x=>x.remove());const el=document.createElement('div');el.className='incoming-emoji';if(m.emoji==='CUSTOM'){const img=document.createElement('img');img.src='/assets/custom_emoji.png?v=3';img.alt='Custom reaction';el.appendChild(img)}else{el.textContent=String(m.emoji||'🙂')}document.body.appendChild(el);setTimeout(()=>el.remove(),1750)}
function openEmojiMenu(game){closeEmojiMenu();const players=(game.players||[]).filter(p=>String(p.id)!==String(game.viewerId));const overlay=document.createElement('div');overlay.id='emoji-menu-overlay';overlay.className='emoji-menu-overlay';const box=document.createElement('div');box.className='emoji-menu-box';box.innerHTML='<div class="emoji-menu-title">EMOJI SMILE</div><div class="emoji-menu-sub">CHOOSE A PLAYER</div><div class="emoji-targets"></div><div class="emoji-menu-sub" style="margin-top:14px">CHOOSE A REACTION</div><div class="emoji-grid"></div><button class="emoji-menu-close" type="button">CLOSE</button>';overlay.appendChild(box);document.body.appendChild(overlay);const targets=box.querySelector('.emoji-targets'),grid=box.querySelector('.emoji-grid');let targetId=players[0]?.id||null;const reactions=[['😂','LAUGH'],['😈','DEVIL'],['🤣','ROLL'],['😎','COOL'],['🤔','THINK'],['😱','SHOCK'],['😭','CRY'],['🤦','FACEPALM'],['👀','EYES'],['🔥','FIRE'],['💥','BOOM'],['👑','CROWN'],['🫡','SALUTE'],['❤️','HEART'],['👍','THUMBS'],['CUSTOM','CUSTOM']];const renderTargets=()=>{targets.innerHTML=players.length?players.map(p=>'<button type="button" class="emoji-target '+(String(p.id)===String(targetId)?'selected':'')+'" data-player="'+escapeHtml(p.id)+'">'+escapeHtml(p.name||p.character||'PLAYER')+'</button>').join(''):'<div style="grid-column:1/-1;padding:10px">NO OTHER PLAYERS</div>';targets.querySelectorAll('.emoji-target').forEach(b=>b.addEventListener('click',()=>{targetId=b.dataset.player;renderTargets()}))};renderTargets();grid.innerHTML=reactions.map(([emoji,label])=>emoji==='CUSTOM'?'<button type="button" class="emoji-choice custom" data-emoji="CUSTOM" title="Custom reaction"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAXoklEQVR42t2baYxk13Xff+fc+17tvc7G4SaRFEWJ1IaRnMiOIwsyIsMGogVOhMQxkNiBgiAwiCRfnA+JI+RDEBgQonywYwNGACNC7Mg2Ai0AHVuOHNimRGlCiRJJgdtwGw6H00t1dXVVvffuPScfXnVzhpLAGbmZBHlAoaqr76u6Z/+f/7kl3Nil8Mlw7tw5zp8/D5yHc5/kHOdes+z89/3rHLT3nTsH58+//redg3Oca+9/3fXnD29Yrj3f8P/zJdI+/tKfcwPrvCzvfVso3v2J1Xd8zPe+9VlJizEn7vqb9G97L5AwwEiUpWG2YDGdwmJKPRsT45DSYPzyY/RveSeTp76KxgiWUMAUwCC1ry3VdNduob9yhrqeMnv5MbRdjirsH0yBxGDUx8zAaorBzV6MNuXg4jerxW0//Wmeur863PsPEixetwIEj5E7hfgrvbjBBGW4eR/S6bP92H9DJGBWo8B0msCMYV+wbADU5shN9zA4cSd5fJlggnoBEhAEqY2sQoyCueOhRJIRihGFB2LogyganZQTP/q+uykK+Ma3niSq4BRIhrI4yYEb69uP/touVK8n2PUqwPhZQvxDLqd6Nk/VfkTMtezKfOsxFleeIBR9NMCiynzsA6cxhS98ZYdOpwQCuamoD14h9tfJ9T5QYy4EcaZT4zd+WfjDB53f+5+B1SFkDKvGNM0+QgYV3BIi0NQL3v/Tb2F1pcvX/9djIAWIkOuJY7WgYbK7+7xfj2DX7QH+OWywqtktB7IUWgw81XMpemuEYoQWXVQESxM+/vffyWhzxBf/5AuIdsFBgyM4YGhZAhGVAhFHQ+KJCz2oDNW0dFjBsyEpI51Om3+bOVmgLJRf+3dfIOeGQhVr6tZKVjkhSCj6BdUjHKcCEPAO9Q5WNZ6bUuMAUoNKAdlBFSPT6fT5pX/xbYqeEkLE6wpHsKaCuiEMAxoHeDZc2rzRL5VP/5eaWAZG3RJDCEGRUBI6HRbzPQan3kk1eZEYS1wVkYgHQURwAXBUCizPyc0UuAt46tgU4PArGju/PW+m6cCb+SCUA+rxJYaDdxGKFSSUqBZIpyBPlTwT+psngAKNigHdzbMcvPQwcfUsq295P5IaTCMixkpwzKDJQhDDLGEiTLcuUI8v0z31Fuj3SanBvQKbYimDZzBbPjvVwUvgBpw8Xg+Ax6QcyqLetv3seir0Vr2+9G1Z7F9kdPt7sFwTgNoygqNWky2TcibZAkUYX/ga+WAX2dti0V9DQwSDpQlBBBdDiaACRGxRY+7Uu5fobpxFQyBLB5VAiIIgYAFXcDF6p97F/sWvQv3g6+T/G60CfC7vnmNaPnvnxLxCii5KwfTiI1T9i4TOEFzREFCJSIhkIkWISOyDRMrNNQ7Sk4goKzfdh7mhIiiQEVQE94xZxnG8ysQzd3PwyhP0Nm+jnmyTqwXZ5mRLTBeJbA3dYnlPmhEHZxicfQ/TyZeO1QMcXHi7OH9g09RMCb0eTsPare+nu3IzzWKCI4hb65KSkJTAwJJhaY+iO2R00z0EnGY6Zr59CSSAJwRh7yDRKaEbvMUUKVGMTjA4+ybSbMr8lWdRjYg6KWfuvjky6ArfeS6hOB465NkOhDu560c+w1MP/fzSBeQ4QgD4FCYxTTxXaDl0iMTVE+w+8yBepyNo5gRyLUgQiiIsYYTQjPdYufVOPAjNdArWJjvXDpKdf/nXV/jjp+d8c+x0g5JDRgysafCiJHZWcGuIASbzhl/8u7dz300lP3P/45S9iGPgNSBs/Nzfg4d+/jhzwL8+jKg9TxVebAAZb2aE0MWLjEsAEXQh/N4vPM9/fnid3/nOCmvdjKF4agWSKMSyT17MWyAkAm7c2hdOlCVmCQ1tdrecwUCLiBBwa8gGw47yb3/9OVQyQRyraxzHmorcNLDBcSfBryhgIr5nqcJj1wXBMDyWkBatIASQzJPxJE1ZEnFEFExxc3JjlGUHIWLJEAzccIR//MCUbiH0gtBUbekXAYkRt4ru2i0sxpcIZYdCI5UIpoHeWWnxsSiiAQrY+ex/OG4FHCaDfMWbGg2dpcsbKpGqXhBCiXrGVbn/N/t0NTDoCpYCqhENQjHcZDa9SHfjZnoW0BjREJCorMQCE0FVMBFcHY2Rxd4LHFx+htU3vYuifwrPNZIbJNd4rlnUc8gVnhsco9m/xOVHv3Fd7c6NK0Di2FNCKdGiQzV+kf4t7yaOTqGxi4RAVGEtRjJ6lIMsQxFgMd/m4OVnSKmiXN0gNRViCUs1eWGQM241ljOOITmRphMIwviJr1OuboBGJCguBSEEynIFkxINChrwzXvJ9jPsPHX/cXrAqRagSrlrKaEeRLsjqp0XyakmdAbY3CAb7hkxwb31GTFt67UEbDFHNFBfeRltGrTsIVoQ44CyjKAFqoqIkCUgGlBg98J5Rrfdi0okVRXuiZRTq6CqgjQj5QbLNS5GEU6+QSGgsk9ukCQioY/7DGojDtaQMrRdXOhQFgENAbMCFW2xdIZYdNl77lv0124iDjap9/fADGkSzaJhejCnDEYkYTmT6hm9U7ew8qZ34rWx9+xjiGr7YQiWnVKNRkE0t2HpDSyeOm4FvL31AM173mSKpBK0Czpk9a6fYH7lJSw1kBdInjGpjMUiMeyCGmQ3PCXK4RqrZ+7EDfafeQJPNYqSHdY6gfff3ufJyxUX9zMxCEE72GRKGHQxIJYroIaKMZ4a/+DjFX/nIxUf/cU+ohFxJ4u3VWDnuiiuG7tC9B3PKUkW0VB66K5g+1OqF58mb+/gkwnV3py3nZnwcx9yekUEUaKUFMUAmha/O0bZGRGKXlsSQ5fbRh1+5+NneN+JPvMcCVKgUuKuLZZQRbVATcAj3SJw4QXhtz8fEQXLhmXHc75ueeKNoCCA6LuTmjpbyjF0BqT9LWLooOWIEEpCgINFwV23j/lPf/Asf/sjd/CFL6+xOnJyFnDFUSRkJETEFUPpBeGxceaDn3mB55MzLAIpOeDYvIYsaCcQQo9qtkBCoFTlzx8aUj8EawNAFSkiEjgiYo4TCXrbcx+MDT8gWyd2+sxzQkTaTlAC5sKoD3/84Ck+/OPCE8/36HcgN8simhrcFC2EWPaod/fQGJblr+TxrHSiUmibQ1SF0OsjhbP/ygVWbnsn3flJJCgizkgzaMZSQ7YavMGaAyzuXlcI3HAS3Nx8Ynr5hR8Ze242is7Ic2qkKEo0Rzy3oEdU8RB58JG76PWE/qjt7SUqodcjjAq2n36UjTvfQ9xYAV02QmKsAskasjmeE+4Lmmaf2fPPk2b77M6/Suh0yM0cSxXZKrAayxV4AksYDUPffWNwwHMnyJ0X89SahtgbYFYxm77I+tvejtdziBEUkgh9N5I7TWM02ckpYbMD8vMvUuYJ249/nTDo401qy1c2PGfcGtwMd8fdwB2JES265PkB6WCvxWCSQBwRCFq0KDQUCAXUcuxl0EHgvCeC7Hqu0bIgSMHexUe5Ei4RtYN6oghOJxidUNOPmUE3MejVDEeZ1WHDi6N1HnlylSInmp09VBRRBxHEFbQD6m1L7A7iuGXcDdeAqCBknIiQjmhLl0wLPt6QJAjwrxQ+ZSK2nVONFquOQiDy0fc+xW23jumWRpQDgu4zGgTKXkR1gXvCLZGahpMnR/zH//o3+Pojq/Q7hlkrgMiSG3FvrU6bBH35WmSpkFY1Sw7F215CrF0v7f93rlOiGyyDj7V+pTbOVtHpFb7IkZ98/xY/9WNfJ8weZX7lYdZHm3zkZ38VeBNPf/slnnl8ztOPV1z4bs2Fx4XLz25z31u2SVlBDG+ZhHbvh4K2fxwJ2iKpJQN02GCLLZUg18S6cP0TkxtUwNtb+lHy2JoaihInsrG64IVnE5PdLvs7zp0/9lHKD9/F6Ja3kmdjJE8JNqXfU4ZDBVf63YqA4N5ufmljcMFdkeX7KrK0vrQyii/j3hB5VdRD1ehSFRtvTAgsk4HbtjUZkwIRZTyNvPWMEreMjkaeeeIveOF3n6EvJR/6xL9BYsTygof/x2+AQE7O2nBGjFeNna6ytHjrExy5eftalq6vV90lenivH71r2HUjwRtUwFeWG9IdswrVQChKDuZCERXFCWWgvvgyt6zcS9OdM/dEyMb+1gWKsiA1NTkJg+6MXtfIS/guVzmvKrSfllqxRYAE7rgL5i3rljGyO9lhmQEQWsq8OUqOx6qAZUcYfeI5kVENZcHsQAghoCERi8hiuoUXiU5cpShH9FdP0e9tcvHRP8ObOYKxPjqgWziL7G3v77SEyaEtHZIrbm1yFFWCRAoVujHTDZleoYwKY1gkVovEWuGsRWegoF341ENvUAio28StQTISuwWTfWU4DIQ8J0ZHmz3S/tPooGDn8gu88syE1OyxfmofYslwNOAr37mDy2Nl1C0pROgXQj/CqDBWSme1zKwWzmqZWNOKYVEzDDU9qemzoMsCzQ2FVXiu8NSQUyI3DbOmYT4rrgMI37AC2o7QNI1zqs0SMlgpefKFgm9fup2b3/Wc16kneOC7TzyE5Q5Bh4iN0OYMRV4hJGUx73D7SwWf/tEt1mJiFGqGUtGjppSG6BWSF9DUeL2cL9SJlDJNyjSNkQxqEw4ckkOifVbaiei0+wYmwVimHRZNsuRl6HS9aUx+53Nv5h++73ZOiNPJMDDoeqZnFZ1cU9oBhe8QvSLS0CkbcmXYzEnm5OxkE2aLiuSGaQHdPlKWpGoGHgDFPOKhxWQt/efIUvBg1lrbM+UbUwXajlDTpDJq0+wUnT6G8sv3Oh+cPirj2ZyoS3BiLb8vy0qfULIoDcqsUpDYljkBD+14ff0Tn0DXNgiraxT33sPi0Ue49OlfRbsdLKWWLzwas7bjisOC4dK6vBnLFcfvAQ4w6b8y6c9slpvclU6PLsrNxZwrr4yptEfMTtBIEEWltY4uEcfhJEhEripc7Vgsq5DHW+RSmV74LvnP/4hmdxfvdEi2LHbL3gB3AkIU6Igg0jZgMUQSSlrmgDdEAfj+TPAJTd4ou31vMBlbwZlOSUoQUKIIoe38EdV2XrjcqAqICVkOhWrNJqoc/NEDbUMUhKhCtywY9DqoBiR0MYlkKWg0MqNk5gX7RPY8MrbAXg5s1ZlqIwAPvS4m/CFywN8K6Odcg0+sqSnWuhiJmZUIuqzby3bEwd1RyxQChUAMRiGKBCUWisQAMeIaaEJBFc6y0JIDKdi1gj0rGDeBnRTYqYXtWtitnHGdmVSJec7U2Ug5kb3Gacfu2dIbkwRPnx53i0BnTJpaqtvenMxujmx0O+TJjH6noCwCRSyIsYCyxGKHOnSYh5IrdJlQspsLdlPBdopsV8puBbsV7NXGfpWY14lFlUnZMKtpx0pOUCGUStkpKIcjVgYDpNtFyz6hHGLaoZQODz3wwDHPBoFOZ16697qqzdiaGUH79MvI777gnL3nPtYHC8Z0GVvJbo7spsDOLDJuYK8Wpg1UCers1I2Tc0tiqDoaBBUIRSB0Csr1Af1ej9Dto70h2h0gZRdiH9MOhALNoT0eYBmrE5YTeT5nZ3rwxnhAjF2rKlTibK+Zb0HnHi+jcGlh/POHhU7s0TS09JTVKIJKIMZAUZaUvZLesM/qsEcY9An9AaE3oOj30G4PjT1US5CC/dwhzTNeZWgcqxt8VmN1haQp5AU5z7B8gKU5Oc9ItiCnKXtp79gZIQVkNnvx3SFsbFIe1PX+c+TmPtbf90EOHn2Q2OsQywHlYEAcrBCHIzr9FYrRkDgYUnZ6xE5JCAWFK8FAa0OqBlk02P6CvDggzbfYq6ZUVUNulJxqLC9wm2G2wHxBDA1FafR7MFwpGI06rIx6nDpxEydOrNDvldx//2eP7ZzgobLSmTN3/zPR/E+aZnMT7l7t9N7M2nv/GrFfEFWJRYcQlY0QickJqSJUCeoa6hpvKqyqaKqKJs1pmgVNXtDYgibXJCqyJCQkyk5g0C8YjrqsrfTY3Bhy4uQqZ06tc+rUGusbIzZPrnFiY43V9RGdIjqqAkyAW0Vk4u4iIsdwTpBzcmpj92Oi/EIRyztcMupjVC8w++YexcpNxNilJbmN7EJpmZwbUmpIVmOSEQyJRlEIvb4yWi85s9JnY22dEyeHnDq9xqnT66xvjNjYWGXzxArr6yt0e9129ve6rbrTZGM/hmM7KaqAnTnzptuh+KbGuNbrFrmqo9Z1V0S7xGKAakkZ+/TKDr1+Sb/bYzjssLbSZ32lz4nNFU6dWeP06XXW1oZsbI5a4TZW6Q16hOvYcEuS+nLmeHgeQ46OzC4tLRkm4Rg9wOEDUfXiv3fRNRHJIZZhtTvgjlvfyukzpzh702nO3HSSUyc3W6tttlZb3xjdgHCvCvgDhDt6/MDTnNayRDlnxjEeSxUQwDc2LvZBf0pEvCiipmz8+F95B7/5W5+5Trd8jXBLCY+EWwr6Wm7v+3nANc/L1YeK0SXeLmNk89ibIZEqhNiVEL3b7XEwn7dNjjtmfm1M/RDCXS3YoSVf/eprrf/9vCDnzPTggN29CVeubLF1+dLxKkCDSojtqKrf6/HS5Vd4/tkXuPXNtyHCkfavN46v1e21AobwvSFjbiwWC/bGe2xt77K7u8vW9g6XL29x+coWu+Mx470pe9M5k/19DnL4gcr6IXFA62IhBNDAoq75/Bf/O790/yfJOV9jtdcK2N4r1wj7/RRT1zWTyYTxeMx4vMfu7h5Xtra4cmWL7Z0xu3sTJpMp+wdzFtWCpmm9r6XQWu7QRcgpQxgfNxJsiecgkboxNjZW+dIDX+bt99zNhz78E99j0ddeVbXg4OCAxaJif7rPdH+fvfEer1zZYXt7m/F4wv70gOl0xmy+YLaoqOuGnG1JgDputEfpr8oB3nZcuBkpGzkbTUqE5jhzwAZI82qQqziLKlGOenzm13+LR77zGH/1/e/l9OkTiCr7+/uM9yZsbW0z2Z8y3Z/y3PMX2d3dZbGoqZqGpm6WgrSKVdH2eOzSQxwnG2CKWW5psZRIqT05YmYYy/yzVEi2jLuQUs2eTN8AD5Cle7thuWE+j9Av+dKf/AVf/rOH6Hc7IEqdaqpFTUoZc4ecj7J0iNqeaFv+5kWXJEf2Vki7KtObZXJessVmJMut8J7bXGKtd7i3M0FbYoQmJZgdOyXWUlzu1sZ8amhUsQOj7HSY14nZvG7L0pIAaWPTELFWgORIvTzGsxyHXc2zHLn3MoTMDHPDs2MO2Zycm6PzQTlba3XL7d6OKkK67qHX9SlgB3zQZuKcMyk3aKNL/s3ITc1yeHNV/C+F8cM5XzvrkSXIMfNr1oIsBfajAelhxci5HZWbe/v7ID8sv7b8/3JyvFSeWSZyzO2wkS2bupqSU0ONtDP8w9HOYaCoHNKVS3O8OuiUV417DXY4VJZ7S6K2ie3wfXBrPegw4R16h1+rCHO3jCMZT5NwjCGw5iYLY2gmklK7K/d2PpWXR2T8EAC9mpvb95dhc4TaDjnAI6FfnQEeCnSYa3wJIw27RmF++AHgbubZkoDood97zhsuJsehAAd4ZlcXZ3t80c0+nD2XIK7uwc3k8Azg4WJ9dcjfTrQPkaL4qyHSqhB3W041/cjg4HLo7rQu3R6R8MMfErk4WFAJcgQ8jGT2MO4PuGO47d1xan12/uoEcwx8AGfP3vX7MRYfX06uUdUsor4Eu/oaxcnSWu5tMpCjvYi0evKrQ+C1kNiPyuThrPiosRDBPGcV+ZojV9zSVjUb/9Pt7e39G2a4rp8PAHf9R01Tf0NE7xWVD0ngjOv3QtyjSECOTG7ttOIwgRnORMQvOzwDMmuPnPrcXZ9x8iVQ3P2tAicRTiz38PtiPgVOebCHX3rxwnnaH90srw9cJc+fpusW7AaUcGSnW2654x3u+pPmfquonnS3D+MMEdRFHhe4q+XE9Ru4P+8unwcXEc/ZuOxNugCz6ZUrV6b85S75nrnFD3nz9a7X5RfZ1f+4af2O26xkJQRZeemlp792+vSd94iovfzyk49fx2fKtfv5wPL5T/2oCLUzCYXPvXoO4jV7+D99aXsu7QPxOlDHcu3RQ18j+P+1S45ZIVdb52qU4/w/ev1vg/aBSufRaZEAAAAASUVORK5CYII=" alt="Custom reaction"></button>':'<button type="button" class="emoji-choice" data-emoji="'+emoji+'" title="'+label+'">'+emoji+'</button>').join('');grid.querySelectorAll('.emoji-choice').forEach(b=>b.addEventListener('click',()=>{if(!targetId){setStatus('CHOOSE A PLAYER FIRST',true);return}send({type:'SEND_EMOJI',targetPlayerId:targetId,emoji:b.dataset.emoji});closeEmojiMenu()}));box.querySelector('.emoji-menu-close').addEventListener('click',closeEmojiMenu);overlay.addEventListener('click',e=>{if(e.target===overlay)closeEmojiMenu()})}
function connect(){if(connecting||ws?.readyState===WebSocket.OPEN||!session)return;connecting=true;setStatus(session.playerId?'RECONNECTING TO GAME SERVER…':'CONNECTING TO GAME SERVER…');const protocol=location.protocol==='https:'?'wss:':'ws:';ws=new WebSocket(`${protocol}//${location.host}`);ws.addEventListener('open',()=>{connecting=false;setStatus(session.playerId?'RECONNECTED':'CONNECTED');const message=session.playerId?{type:'RECONNECT',code:session.code,playerId:session.playerId,reconnectToken:session.reconnectToken}:{type:'JOIN_ROOM',code:session.code,name:session.name,character:session.character};send(message);clearInterval(pingTimer);pingTimer=setInterval(()=>send({type:'PING'}),10000)});ws.addEventListener('message',event=>{let m;try{m=JSON.parse(event.data)}catch{return};if(m.type==='ERROR'){
  joinButton.disabled=false;
  const msg=m.error||'Something went wrong.';
  setStatus(msg,true);
  // A missing/invalid reconnect session means the old room is gone or the host restarted it.
  // Clear the stale player session so refresh cannot trap the phone in the old lobby.
  const staleSessionError=/room not found|invalid reconnect|room restarted by host/i.test(msg);
  if(staleSessionError){
    localStorage.removeItem('byhPlayerSession');
    session=null;me=null;joined=false;
    try{ws?.close()}catch{}
    showJoinScreen(false);
    setStatus('ROOM NO LONGER EXISTS — ENTER A NEW ROOM CODE',true);
    return;
  }
  // During a live game, other rejected moves are game-action errors — keep the player in the game.
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
if(m.type==='LEFT_ROOM'){try{ws?.close()}catch{}resetToFreshJoinScreen('');return}
if(m.type==='JOINED'||m.type==='RECONNECTED'){
  me=m.playerId;joined=true;
  session={code:m.code,playerId:m.playerId,reconnectToken:m.reconnectToken,name:m.name,character:m.character};
  save(session);joinButton.disabled=true;hideJoinScreen();setStatus(`JOINED ROOM ${m.code}`);return
}if(m.type==='ROOM_RESTARTED'){try{ws?.close()}catch{}resetToFreshJoinScreen('');return}if(m.type==='CALL_PLAYER'){playCallSound();const flash=document.createElement('div');flash.className='call-flash';flash.innerHTML='<div class="wake-up-arcade">WAKE UP!</div>';document.body.appendChild(flash);setTimeout(()=>flash.remove(),2200);setStatus('📞 CALL — PAY ATTENTION');setTimeout(()=>setStatus(joined?'JOINED ROOM '+(session?.code||''):''),1800);return}if(m.type==='PLAYER_EMOJI'){showIncomingEmoji(m);return}if(m.type==='EASTER_EGG'){playEasterLaugh();const flash=document.createElement('div');flash.className='easter-egg-flash';flash.innerHTML='<div class="easter-egg-text">YOU’RE STUPID!</div>';document.body.appendChild(flash);setTimeout(()=>flash.remove(),3200);return}if(m.type!=='STATE')return;const game=m.game;if(!game){autoSpinSent=false;const playerCount=(m.players||[]).length;const heading=playerCount<2?'WAITING FOR MORE PLAYERS…':'WAITING FOR HOST…';gameEl.innerHTML='<div class="waiting-room-recovery"><h2>'+heading+'</h2>'+m.players.map(p=>`<div>${escapeHtml(p.name)} — ${escapeHtml(p.character)} ${p.connected?'🟢':'⚪'}</div>`).join('')+'<button id="leave-old-room" type="button" style="margin-top:18px;padding:12px 18px;border:2px solid #fff;border-radius:12px;background:#7d1010;color:#fff;font-weight:1000;font-size:14px;box-shadow:0 0 14px #ff3b3b">LEAVE ROOM / JOIN NEW GAME</button></div>';const leaveOld=gameEl.querySelector('#leave-old-room');if(leaveOld)leaveOld.addEventListener('click',()=>{leaveOld.disabled=true;setStatus('LEAVING ROOM…');if(!send({type:'LEAVE_ROOM'}))resetToFreshJoinScreen('');});return}if(game.lastCardEvent){lastCardWasActive=true;showLastCard(game.lastCardEvent)}else if(lastCardWasActive){lastCardWasActive=false;autoSpinSent=false}
if(game.phase==='finished'){
 const scores=[...game.players].sort((a,b)=>Number(b.points)-Number(a.points));
 const finish=document.getElementById('player-finish-screen')||document.createElement('div');
 finish.id='player-finish-screen';
 finish.className='finish-screen';
 finish.style.backgroundImage="url('/finish-screen.png?v=4')";
 finish.innerHTML='<div class="finish-player-overlay">'+scores.slice(0,5).map((p,i)=>{const img=({'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg','The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'}[p.character]||'');return '<div class="finish-player finish-player-'+i+'">'+(img?'<img class="finish-player-photo" src="'+img+'" alt="">':'')+'<div class="finish-player-name">'+escapeHtml(p.name||'')+'</div><div class="finish-player-score">'+Number(p.points||0)+'</div></div>';}).join('')+'</div>';
 document.body.appendChild(finish);
 gameEl.innerHTML='';
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
    ${specialImg||special?'':`<strong>${escapeHtml(nm)}</strong>`}
  </button>`}).join('');
const playableColor=game.currentColor||cardColor(top)||'';const playableHint=top.character?`MATCH ${escapeHtml(playableColor)} OR ${escapeHtml(top.character.toUpperCase())}`:`MATCH ${escapeHtml(playableColor)} • WILD / PLAY YOUR HAND ALWAYS PLAY`;
let special='';
const powerPlayer=String(game.pending?.playerId||'')===String(game.viewerId||'');
if(game.pending?.type==='SPIN_WHEEL'){
  special=wheelHtml(null,false);
  if(powerPlayer&&!autoSpinSent){autoSpinSent=true;setTimeout(()=>send({type:'SPIN_WHEEL'}),120)}
}else if(game.pending?.type==='WILD_COLOR_CHOICE'&&powerPlayer){
  autoSpinSent=false;special=wildColorControls()+'<div class="wheel-message">WILD CARD — CHOOSE THE NEW COLOR</div>';
}else if(game.pending?.type==='POWER_USED'){
  autoSpinSent=false;special=wheelHtml(game.wheelResult,false)+(powerPlayer?powerControls(game):'');
}else autoSpinSent=false;

const powerBadge=(p)=>{const powers=[['shield','SHIELD'],['extraPlay','EXTRA PLAY'],['colorChoice','COLOR CHOICE'],['turnSwitch','TURN SWITCH']];const found=powers.find(([k])=>Boolean(p[k]));if(!found)return '';if(found[0]==='shield'){const shieldSrc='/power-play/shields/shield_blue.png?v=1';return '<div class="player-power-badge shield-badge"><img src="'+shieldSrc+'" alt="Shield power"><span>POWER: SHIELD</span></div>';}return '<div class="player-power-badge text-power-badge">⚡ POWER: '+found[1]+'</div>';};
const playerPowerPanel=(game.players||[]).map(p=>{const badge=powerBadge(p);if(!badge)return '';const mine=String(p.id)===String(game.viewerId);return '<div class="tv-power-owner '+(mine?'mine':'')+'"><b>'+escapeHtml(p.character||'PLAYER')+'</b><span>'+escapeHtml(p.name||'')+'</span>'+badge+'</div>';}).join('');
const playerTiles=(game.players||[]).map(p=>{
  const mine=String(p.id)===String(game.viewerId);
  const active=String(p.id)===String(game.turnPlayerId);
  const img=characterImage(p.character);
  return '<div class="arcade-player '+(active?'active':'')+' '+(mine?'mine':'')+'">'+
    '<div class="arcade-avatar">'+(img?'<img src="'+img+'" alt="'+escapeHtml(p.character)+'">':'')+'</div>'+
    '<b>'+escapeHtml(p.character||'PLAYER')+'</b>'+
    '<span>'+escapeHtml(p.name||'')+'</span>'+
    '<strong class="player-score">SCORE: '+Number(p.points||0)+'</strong>'+
    '<em>'+Number(p.handCount||0)+' CARDS</em>'+
    (active?'<label>YOUR TURN</label>':'')+
  '</div>';
}).join('');
const nextPlayer=current?'<div class="side-player"><b>NEXT PLAYER</b><div>'+escapeHtml(current.name||'—')+'</div></div>':'';
const shownColor=game.currentColor||'—';const info=`<div class="game-info"><b>GAME INFO</b><div>Direction <strong>${game.direction===-1?'LEFT':'RIGHT'}</strong></div><div>Color: <strong class="info-color">${escapeHtml(shownColor)}</strong></div><div>Cards Left: <strong>${Number(game.deckCount||game.cardsLeft||0)}</strong></div></div>`;
const callButton='<button id="call-players" class="arcade-call" type="button">CALL<span>WAKE PLAYER</span></button>';
const drawButton=isMyTurn&&!game.pending&&!game.lastCardEvent?'<button id="draw-card" class="arcade-draw" type="button">DRAW</button>':'<button class="arcade-draw disabled" type="button" disabled>DRAW</button>';

const topImage=characterImage(top.character);
const topSpecialImage=specialImage(top);
const topCardVisual=topSpecialImage?`<img class="tv-special-art" src="${topSpecialImage}" alt="${escapeHtml(top.character||top.type||'Card')}">`:(top.type==='SKIP'||top.type==='REVERSE')?specialModern(top,'tv'):topImage?`<img src="${topImage}" alt="${escapeHtml(top.character||'Card')}"><strong>${escapeHtml(top.character||'CARD')}</strong><small>${escapeHtml(cardColor(top)||'')}</small>`:'<div class="special-card-symbol">'+escapeHtml((top.type||'CARD').replaceAll('_',' '))+'</div>';

gameEl.innerHTML=`
<div class="arcade-shell">
  <header class="arcade-header">
    <div class="arcade-room">ROOM ${escapeHtml(game.code||session?.code||'—')}<small>ROUND ${Number(game.round||1)}</small></div>
    <button id="easter-egg-logo" class="arcade-logo easter-egg-logo" type="button" aria-label="PLAY YOUR HAND">PLAY YOUR HAND</button>
    <div class="arcade-tools"><button id="menu-toggle" type="button">MENU<small>MENU</small></button></div>
  </header>
  <section class="arcade-players">${playerTiles}</section>
  <div class="turn-banner ${isMyTurn?'my-turn':'waiting-turn'}">${isMyTurn?'YOUR TURN — PLAY OR DRAW':'WAITING FOR '+escapeHtml(current?.name||'THE OTHER PLAYER')}</div>
  <div class="arcade-main">
    <aside class="arcade-side left-side">${callButton}${nextPlayer}<button id="view-deck" class="arcade-side-btn" type="button">CARD PILES</button></aside>
    <section class="arcade-center">
      <div class="arcade-tv">
        <div class="tv-screen">
          <div class="tv-watermark">PLAY YOUR HAND</div>
          <div class="tv-card ${top.type==='SKIP'||top.type==='REVERSE'?'special-modern-host':''} color-${escapeHtml(cardColor(top).toLowerCase())} ${top.type==='WILD'?'wild':''} ${top.type==='PLAY_YOUR_HAND'?'play-special':''}">
            ${topCardVisual}
          </div>
        </div>
      </div>
      ${playerPowerPanel}
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
const menu=gameEl.querySelector('#menu-toggle');if(menu){menu.addEventListener('click',()=>{let panel=document.getElementById('game-menu-panel');if(!panel){panel=document.createElement('div');panel.id='game-menu-panel';panel.className='game-menu-panel';panel.innerHTML='<div class="game-menu-box"><button id="close-game-menu" class="game-menu-close" type="button" aria-label="Close menu">×</button><div class="game-menu-title">PLAY YOUR HAND<small>GAME MENU</small></div><section class="game-rules"><h3>GAME RULES</h3><p>Match the color or character on the display card.</p><p>On your turn, slide a playable card upward to play it, or press DRAW.</p><p>WILD lets you choose the new color.</p><p>PLAY YOUR HAND always plays and starts the Power Wheel.</p><p>First player to use all cards wins the round.</p></section><button id="menu-sound" class="menu-sound-button" type="button"></button><button id="menu-quit" class="menu-quit-button" type="button">QUIT GAME</button></div>';document.body.appendChild(panel);const close=panel.querySelector('#close-game-menu');if(close)close.addEventListener('click',()=>panel.classList.remove('show'));const sound=panel.querySelector('#menu-sound');if(sound){const updateSound=()=>{sound.textContent=soundEnabled?'SOUND: ON':'SOUND: OFF'};updateSound();sound.addEventListener('click',()=>{soundEnabled=!soundEnabled;updateSound();if(soundEnabled)playUiTone(880,.16)})}const quit=panel.querySelector('#menu-quit');if(quit)quit.addEventListener('click',()=>{if(!confirm('QUIT GAME? You will leave this room.'))return;setStatus('LEAVING GAME…');send({type:'LEAVE_ROOM'});});}panel.classList.add('show')})}

const handGrid=gameEl.querySelector('.hand-grid');if(handGrid){if(hand.length>previousHandLength)setTimeout(()=>handGrid.scrollTo({left:handGrid.scrollWidth,behavior:'smooth'}),40)}
gameEl.querySelectorAll('[data-card-id]').forEach(b=>{
  let startX=0,startY=0,dragging=false,suppressClick=false;
  const play=()=>{
    if(!isMyTurn||game.pending||game.lastCardEvent){
      setStatus(isMyTurn?'FINISH THE CURRENT ACTION FIRST':`WAITING FOR ${current?.name||'THE OTHER PLAYER'}`,true);
      return;
    }
    const cardId=b.dataset.cardId;
    selectedCardId=cardId;
    setStatus('PLAYING CARD…');
    send({type:'PLAY_CARD',cardId});
  };
  b.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    startX=e.clientX;startY=e.clientY;dragging=true;
    b.classList.add('swiping');
  });
  b.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    if(dy<-10&&Math.abs(dy)>Math.abs(dx)){
      const lift=Math.min(55,Math.max(0,-dy));
      b.style.transform=`translateY(${-lift}px)`;
    }
  });
  b.addEventListener('pointerup',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    dragging=false;b.classList.remove('swiping');b.style.transform='';
    const tap=Math.abs(dx)<12&&Math.abs(dy)<12;
    const upward=dy<=-50&&Math.abs(dy)>=Math.abs(dx)*1.05;
    if(upward){
      suppressClick=true;
      play();
      setTimeout(()=>{suppressClick=false},250);
    }else if(tap&&e.pointerType!=='mouse'){
      suppressClick=true;
      play();
      setTimeout(()=>{suppressClick=false},250);
    }
  });
  b.addEventListener('pointercancel',()=>{
    dragging=false;b.classList.remove('swiping');b.style.transform='';
  });
  b.addEventListener('click',e=>{
    if(suppressClick){e.preventDefault();return;}
    play();
  });
  b.addEventListener('dblclick',e=>{
    e.preventDefault();
    play();
  });
});;const viewDeck=gameEl.querySelector('#view-deck');if(viewDeck)viewDeck.addEventListener('click',()=>{let panel=document.getElementById('deck-view-panel');const count=Number(game.deckCount||game.cardsLeft||0);const discardCount=Number(game.discardCount||0);const d=game.topCard||{};const dName=d.character||({'SKIP':'SKIP','REVERSE':'REVERSE','WILD':'WILD','PLAY_YOUR_HAND':'PLAY YOUR HAND'}[d.type]||'CARD');const dImg=characterImage(d.character);const dSpecial=specialImage(d);let discardHtml='';if(dSpecial){discardHtml='<img src="'+dSpecial+'" alt="'+escapeHtml(dName)+'" style="width:110px;height:150px;object-fit:contain;filter:drop-shadow(0 0 12px rgba(255,196,0,.8))">'}else if(d.type==='SKIP'||d.type==='REVERSE'){discardHtml=specialModern(d,'tv')}else if(dImg){discardHtml='<div class="card table-card player-current color-'+escapeHtml(cardColor(d).toLowerCase())+'" style="width:110px!important;min-height:150px!important"><img class="card-face" src="'+dImg+'" alt="'+escapeHtml(dName)+'"><div class="card-name">'+escapeHtml(dName)+'</div><div class="card-color">'+escapeHtml(cardColor(d)||'')+'</div></div>'}else{discardHtml='<div style="font-size:20px;font-weight:900;text-align:center;padding:35px 12px">'+escapeHtml(dName.replaceAll('_',' '))+'</div>'}if(!panel){panel=document.createElement('div');panel.id='deck-view-panel';panel.className='deck-view-panel';panel.innerHTML='<div class="deck-view-box" style="max-width:430px;width:calc(100% - 28px);max-height:88vh;overflow:auto;padding:18px;border:3px solid #1687ff;border-radius:18px;background:linear-gradient(180deg,#07134a,#020824);box-shadow:0 0 30px rgba(22,135,255,.65);color:#fff;text-align:center;position:relative"><button id="close-deck-view" type="button" class="deck-view-close" aria-label="Close card piles" style="position:absolute;right:10px;top:8px;width:38px;height:38px;border-radius:50%;border:2px solid #1687ff;background:#07134a;color:#fff;font-size:28px;font-weight:900">×</button><div class="deck-view-title" style="font-size:25px;font-weight:1000;color:#fff;margin:4px 0 16px">CARD PILES</div><div class="deck-piles" style="display:flex;justify-content:center;align-items:flex-start;gap:22px;flex-wrap:wrap"><section style="flex:1 1 140px;min-width:130px"><div style="font-size:17px;font-weight:1000;color:#ffd400;margin-bottom:8px">DRAW DECK</div><div class="deck-stack" style="position:relative;width:112px;height:152px;margin:0 auto 10px"><div class="deck-card-back" style="position:absolute;inset:8px 0 0 8px">PLAY<br>YOUR<br>HAND</div><div class="deck-card-back deck-card-back-2" style="position:absolute;inset:4px 0 4px 4px"></div><div class="deck-card-back deck-card-back-3" style="position:absolute;inset:0"></div></div><div style="font-size:18px;font-weight:1000">CARDS LEFT: <span id="pile-deck-count">'+count+'</span></div><div style="font-size:12px;opacity:.8;margin-top:4px">Cards still waiting to be drawn.</div></section><section style="flex:1 1 140px;min-width:130px"><div style="font-size:17px;font-weight:1000;color:#ffd400;margin-bottom:8px">DISCARD / PLAY PILE</div><div id="pile-discard-card" style="height:152px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">'+discardHtml+'</div><div style="font-size:18px;font-weight:1000">CARDS PLAYED: <span id="pile-discard-count">'+discardCount+'</span></div><div style="font-size:12px;opacity:.8;margin-top:4px">The card shown is the most recently played card.</div></section></div><div style="font-size:13px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(22,135,255,.6);opacity:.9">The draw deck stays face down. The discard / play pile shows what has already been played.</div></div>';document.body.appendChild(panel);const close=panel.querySelector('#close-deck-view');if(close)close.addEventListener('click',()=>panel.remove())}const dc=panel.querySelector('#pile-deck-count');if(dc)dc.textContent=String(count);const pc=panel.querySelector('#pile-discard-count');if(pc)pc.textContent=String(discardCount);const pv=panel.querySelector('#pile-discard-card');if(pv)pv.innerHTML=discardHtml;panel.classList.add('show')});
const emojiButton=gameEl.querySelector('.arcade-emoji');if(emojiButton)emojiButton.addEventListener('click',()=>openEmojiMenu(game));const call=gameEl.querySelector('#call-players');if(call)call.addEventListener('click',()=>send({type:'CALL_PLAYER',playerId:'all'}));const sound=gameEl.querySelector('#sound-toggle');if(sound)sound.addEventListener('click',()=>{soundEnabled=!soundEnabled;sound.innerHTML=soundEnabled?'SOUND<small>SOUND</small>':'OFF<small>SOUND</small>';if(soundEnabled)playUiTone(880,.16);setStatus(soundEnabled?'SOUND ON':'SOUND OFF')});const draw=gameEl.querySelector('#draw-card');if(draw)draw.addEventListener('click',()=>send({type:'DRAW_CARD'}));const sort=gameEl.querySelector('#sort-cards');if(sort)sort.addEventListener('click',()=>{sortMode=!sortMode;const grid=gameEl.querySelector('.arcade-hand');if(grid){const nodes=[...grid.querySelectorAll('.arcade-card')];const handNow=Array.isArray(game.viewerHand)?game.viewerHand:[];if(sortMode){const rank=new Map(handNow.map((c,i)=>[String(c.id),i]));nodes.sort((a,b)=>{const ca=handNow.find(c=>String(c.id)===String(a.dataset.cardId))||{};const cb=handNow.find(c=>String(c.id)===String(b.dataset.cardId))||{};return String(ca.character||ca.type).localeCompare(String(cb.character||cb.type))||String(ca.color||'').localeCompare(String(cb.color||''))});}else{const original=nodes.slice().sort((a,b)=>(Number(a.dataset.originalIndex??0)-Number(b.dataset.originalIndex??0)));nodes.splice(0,nodes.length,...original);}nodes.forEach((n,i)=>{if(n.dataset.originalIndex==null)n.dataset.originalIndex=String(handNow.findIndex(c=>String(c.id)===String(n.dataset.cardId)));grid.appendChild(n)});}setStatus(sortMode?'HAND SORTED':'HAND ORDER RESTORED')});const left=gameEl.querySelector('#hand-left'),right=gameEl.querySelector('#hand-right'),grid=gameEl.querySelector('.arcade-hand');if(left&&grid)left.addEventListener('click',()=>grid.scrollBy({left:-240,behavior:'smooth'}));if(right&&grid)right.addEventListener('click',()=>grid.scrollBy({left:240,behavior:'smooth'}));const egg=gameEl.querySelector('#easter-egg-logo');if(egg){let taps=0,lastTap=0;egg.addEventListener('click',()=>{const now=Date.now();if(now-lastTap>900)taps=0;lastTap=now;taps++;if(taps>=3){taps=0;send({type:'EASTER_EGG'})}})}const use=gameEl.querySelector('#use-power');if(use)use.addEventListener('click',()=>send({type:'USE_POWER',power:game.pending.power}));gameEl.querySelectorAll('.color-choice').forEach(b=>b.addEventListener('click',()=>{const color=b.dataset.color;const group=b.dataset.colorGroup;if(group==='power-color')send({type:'USE_POWER',power:game.pending.power,color});else send({type:'CHOOSE_COLOR',color})}));});ws.addEventListener('error',()=>{setStatus('CONNECTION LOST — RETRYING…',true);if(!joined)showJoinScreen()});
ws.addEventListener('close',event=>{connecting=false;clearInterval(pingTimer);ws=null;if(intentionalDisconnect){intentionalDisconnect=false;return}if(event?.reason==='Room restarted by host'){resetToFreshJoinScreen('');return}if(!joined){showJoinScreen();setStatus('CONNECTION LOST — ENTER ROOM CODE, NAME, AND CHARACTER',true)}else{setStatus('CONNECTION LOST — RETRYING…',true)}scheduleReconnect()})}
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
