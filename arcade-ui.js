/* BET YOUR HAND — Modern Arcade Game-Night UI
   Uses the existing multiplayer protocol and the nine approved character photos.
*/
(function(){
  'use strict';
  const PHOTO={Bug:'Bug.jpg',Face:'Face.jpg','Ling Ling':'Ling_Ling.jpg',Beanz:'Beanz.jpg','The One':'The_One.jpg',Boone:'Boone.jpg','Chicken Joe':'Chicken_Joe.jpg',Juby:'Juby.jpg',Meemaw:'Meemaw.jpg'};
  const POWER={
    'EXTRA PLAY':'⚡',SHIELD:'🛡️','COLOR CHOICE':'🎨','TURN SWITCH':'🔄'
  };
  const POWER_DESC={
    'EXTRA PLAY':'Play one additional playable card immediately.',
    SHIELD:'Block one Skip effect against you.',
    'COLOR CHOICE':'Choose the next required color.',
    'TURN SWITCH':'Reverse the direction of play once.'
  };
  const POWER_BY_CHAR={Bug:'EXTRA PLAY',Face:'SHIELD','Ling Ling':'COLOR CHOICE',Beanz:'EXTRA PLAY','The One':'TURN SWITCH',Boone:'SHIELD','Chicken Joe':'COLOR CHOICE',Juby:'EXTRA PLAY',Meemaw:'TURN SWITCH'};
  const COLORS={red:'#ff3145',blue:'#2774ff',green:'#20d978',yellow:'#ffd21c'};
  const COLOR_NAME={red:'RED',blue:'BLUE',green:'GREEN',yellow:'YELLOW'};
  let root=null,lastPhase='',lastPending='',lastStateKey='';

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&bsol;','"':'&quot;'}[m]));}
  function send(type,extra){try{if(typeof ws!=='undefined'&&ws&&ws.readyState===1)ws.send(JSON.stringify(Object.assign({type},extra||{})));}catch(e){}}
  function mine(){return (state&&state.players||[]).find(p=>p.id===myId)||null}
  function active(){return (state&&state.players||[]).find(p=>p.id===state.turnPlayerId)||null}
  function isMyTurn(){return !!(state&&state.turnPlayerId===myId&&state.phase==='playing'&&!state.pending)}
  function img(ch){return '/'+(PHOTO[ch]||'Bug.jpg')}
  function cardClass(c){if(!c)return 'blue'; if(c.color==='wild')return 'wild'; return c.color||'blue'}
  function cardLabel(c){if(!c)return '—'; if(c.action==='WILD')return 'WILD'; if(c.action==='BET')return 'BET YOUR HAND'; if(c.action)return c.action; return c.ch||'CARD'}
  function hideOld(){
    ['setup','room','game','feedPanel','betPanel','challengePanel','colorPanel','wheelPanel'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none'});
    document.querySelectorAll('header,.tabs,#roleHeader').forEach(el=>el.style.display='none');
  }
  function install(){
    if(root)return;
    const style=document.createElement('style');
    style.textContent=`
      html,body{margin:0!important;width:100%;min-height:100%;background:#07020f!important;color:#fff!important;font-family:Arial,Helvetica,sans-serif!important}
      body.arcadeUI{overflow:hidden!important}
      .au{position:fixed;inset:0;z-index:9000;overflow:hidden;background:radial-gradient(circle at 50% 45%,#34205d 0,#120c2b 42%,#05020c 82%);color:#fff}
      .au:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 12% 18%,#246dff35,transparent 25%),radial-gradient(circle at 86% 20%,#ff2b4530,transparent 25%),linear-gradient(180deg,#05020a22,#05020a99);pointer-events:none}
      .au>*{position:relative;z-index:1}
      .auTop{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:2px solid #ff2b8f;background:#05020dcc;box-shadow:0 0 25px #7b2cff55}
      .auLogo{font-size:clamp(25px,4vw,58px);font-weight:1000;font-style:italic;color:#ffd21c;text-shadow:0 3px #e84b18,0 0 18px #8d39ff;line-height:.8;white-space:nowrap}.auLogo small{display:block;text-align:center;color:#fff;font-size:.32em;letter-spacing:2px;margin-top:8px}
      .auRound{padding:9px 16px;border:2px solid #2774ff;border-radius:12px;background:#0b0a2d;font-weight:1000;text-align:center;min-width:92px;box-shadow:0 0 15px #2774ff66}.auRound small{display:block;color:#9fc2ff;font-size:11px}
      .auMain{height:calc(100dvh - 112px);display:grid;grid-template-columns:18% 64% 18%;gap:8px;padding:8px;box-sizing:border-box}
      .auPanel{min-width:0;min-height:0;border:2px solid #246dff;border-radius:16px;background:linear-gradient(180deg,#100d3cf2,#050516f2);box-shadow:0 0 22px #246dff44;overflow:hidden}
      .auLeft,.auRight{padding:10px;display:flex;flex-direction:column;gap:8px}.auLeft h3,.auRight h3{margin:0;text-align:center;font-size:clamp(13px,1.2vw,22px);color:#fff}
      .auCenter{padding:8px;display:flex;flex-direction:column;min-height:0}
      .auPlayers{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;flex:1;min-height:0}
      .auPlayer{position:relative;display:grid;grid-template-columns:52px 1fr;grid-template-rows:auto auto auto;gap:1px 6px;padding:6px;border:2px solid #25377e;border-radius:12px;background:#07071df2;overflow:hidden;min-height:0}
      .auPlayer img{grid-row:1/4;width:52px;height:52px;object-fit:cover;object-position:center;border-radius:10px;border:2px solid var(--pc);box-shadow:0 0 10px var(--pc)}
      .auPlayer.active{border-color:#ffd21c;box-shadow:0 0 20px #ffd21caa,0 0 7px #fff inset;animation:auFlame 1.05s ease-in-out infinite alternate}.auPlayer.active:after{content:'🔥 YOUR TURN';position:absolute;inset:0;border-radius:10px;box-shadow:inset 0 0 22px #ff8a1f66,0 0 18px #ff7a1f55;pointer-events:none}.auPlayer.active img{box-shadow:0 0 18px #ff9a1f,0 0 30px #ff3b1f66}
      @keyframes auFlame{from{transform:translateY(0);filter:brightness(1)}to{transform:translateY(-1px);filter:brightness(1.16)}}
      .auPN{font-weight:1000;font-size:clamp(11px,1vw,18px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.auPC{font-size:clamp(8px,.7vw,13px);color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.auPP{font-weight:1000;color:#ffd21c;font-size:clamp(9px,.78vw,14px)}
      .auTitle{text-align:center;font-weight:1000;font-size:clamp(18px,2vw,34px);color:#fff;margin:0 0 5px;text-shadow:0 0 12px #2774ff}.auStatus{text-align:center;font-size:clamp(17px,1.8vw,32px);font-weight:1000;color:#ffd21c;margin:3px 0}.auSub{text-align:center;color:#c9c9df;font-size:clamp(9px,.8vw,14px);margin-bottom:5px}
      .auTable{height:120px;min-height:120px;border-radius:50%;border:4px solid #734523;background:radial-gradient(ellipse,#0b7654,#02382d);box-shadow:inset 0 0 30px #000,0 5px 20px #0009;display:flex;align-items:center;justify-content:center;gap:20px;margin:5px auto;width:70%;position:relative}.auCard{width:68px;height:88px;border:4px solid #fff;border-radius:11px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:1000;font-size:12px;box-shadow:0 5px 15px #0008}.auCard.wild{background:linear-gradient(135deg,#ef3434 0 25%,#2674ff 25% 50%,#20b85a 50% 75%,#f3c51d 75%)}.auCard.red{background:#e92136}.auCard.blue{background:#2670df}.auCard.green{background:#18a84d}.auCard.yellow{background:#f3bd18;color:#111}
      .auActions{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-top:5px}.auBtn{border:2px solid #2774ff;background:#100d3e;color:#fff;border-radius:13px;padding:10px 14px;font-weight:1000;cursor:pointer;box-shadow:0 0 10px #2774ff44}.auBtn.primary{background:linear-gradient(135deg,#8b2cff,#4a35ff);border-color:#fff}.auBtn.green{background:#0a7540;border-color:#20d978}.auBtn.red{background:#9b1d35;border-color:#ff5267}.auBtn.gold{background:#8b5c08;border-color:#ffd21c;color:#fff}.auBtn:disabled{opacity:.4;cursor:not-allowed}
      .auWheel{width:min(170px,13vw);height:min(170px,13vw);margin:0 auto;border-radius:50%;border:5px solid #fff;background:conic-gradient(#2774ff 0 40deg,#7132a8 40deg 80deg,#20d978 80deg 120deg,#ffd21c 120deg 160deg,#2774ff 160deg 200deg,#20d978 200deg 240deg,#7132a8 240deg 280deg,#ffd21c 280deg 320deg,#2774ff 320deg);box-shadow:0 0 22px #ff2b8f88;display:grid;place-items:center;transition:transform 2.2s cubic-bezier(.17,.67,.12,.99)}.auWheel span{width:38%;height:38%;border-radius:50%;background:#080722;border:2px solid #fff;display:grid;place-items:center;text-align:center;font-size:9px;font-weight:1000}.auRule{padding:7px;border-bottom:1px solid #24255b;font-size:clamp(8px,.72vw,13px);line-height:1.15}.auRule b{color:#ffd21c}.auPower{border:2px solid #20d978;border-radius:12px;padding:9px;text-align:center;background:#071f19;box-shadow:0 0 16px #20d97844}.auPowerIcon{font-size:28px}.auPowerName{font-size:clamp(12px,1vw,18px);font-weight:1000;color:#fff}.auPowerDesc{font-size:10px;color:#b9d9cf;margin-top:4px}
      .auBottom{position:absolute;left:0;right:0;bottom:0;height:32px;border-top:2px solid #16184d;background:#03030a;display:flex;align-items:center;justify-content:space-around;font-size:clamp(7px,.65vw,12px);font-weight:900;white-space:nowrap}.auBottom b{color:#ffd21c}
      .phone{height:100dvh;padding:0 10px 12px;box-sizing:border-box;overflow:hidden}.phone .auTop{height:64px;padding:0 8px}.phone .auLogo{font-size:25px}.phone .auMain{display:block;height:calc(100dvh - 64px);padding:7px 0 0}.phonePanel{height:100%;display:flex;flex-direction:column;gap:7px}.meCard{display:grid;grid-template-columns:62px 1fr 74px;gap:8px;align-items:center;padding:7px;border:2px solid #2774ff;border-radius:14px;background:#080722}.meCard img{width:58px;height:58px;border-radius:11px;object-fit:cover;border:2px solid #ffd21c;box-shadow:0 0 13px #ffd21c66}.meName{font-size:17px;font-weight:1000}.meChar{font-size:11px;color:#aaa}.mePoints{font-size:16px;font-weight:1000;color:#ffd21c;text-align:right}.phoneHand{display:flex;gap:6px;overflow-x:auto;padding:5px 2px 8px;justify-content:center}.phoneCard{flex:0 0 62px;height:88px;border-radius:10px;border:3px solid #fff;color:#fff;font-size:10px;font-weight:1000;text-align:center;display:flex;align-items:center;justify-content:center;padding:3px;cursor:pointer;box-shadow:0 5px 12px #0009}.phoneCard:active{transform:translateY(-4px)}.turnBox{border:2px solid #ffd21c;border-radius:13px;padding:8px;text-align:center;background:#221400;box-shadow:0 0 20px #ff9a1f55}.turnBox.no{border-color:#2b2d6c;background:#080722;box-shadow:none}.turnBig{font-size:22px;font-weight:1000;color:#ffd21c}.turnBox.no .turnBig{color:#aaa}.phoneBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px}.phoneBtns .auBtn{font-size:15px;padding:13px 8px}.powerSmall{display:flex;gap:7px;align-items:center;padding:7px;border:2px solid #20d978;border-radius:12px;background:#061a14}.powerSmall b{color:#20d978}.lastCardBox{padding:9px;border:2px solid #ff9d1f;border-radius:13px;background:#261506;text-align:center}.lastChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:7px}.lastChoices button{font-size:10px;padding:9px 4px}.lastChoices span{display:block;color:#ffd21c;font-size:15px;margin-top:2px}
      .overlay{position:absolute;inset:0;background:#03010be8;display:flex;align-items:center;justify-content:center;padding:12px;z-index:20}.modalA{width:min(650px,96%);max-height:94%;overflow:auto;border:3px solid #2774ff;border-radius:22px;background:linear-gradient(180deg,#17104d,#06051a);box-shadow:0 0 45px #2774ffaa;padding:16px;text-align:center}.modalA h2{margin:2px 0 5px;font-size:clamp(24px,4vw,48px);color:#ffd21c;text-shadow:0 0 15px #ff2b8f}.modalA p{color:#ddd}.bigWheel{width:min(300px,70vw);height:min(300px,70vw);margin:8px auto;border-radius:50%;border:8px solid #fff;background:conic-gradient(#2774ff 0 40deg,#7132a8 40deg 80deg,#20d978 80deg 120deg,#ffd21c 120deg 160deg,#2774ff 160deg 200deg,#20d978 200deg 240deg,#7132a8 240deg 280deg,#ffd21c 280deg 320deg,#2774ff 320deg);display:grid;place-items:center;transition:transform 2.4s cubic-bezier(.17,.67,.12,.99);box-shadow:0 0 35px #ff2b8f99}.bigWheel:after{content:'SPIN';width:34%;height:34%;border-radius:50%;background:#080722;border:3px solid #fff;display:grid;place-items:center;font-weight:1000;font-size:20px}.resultPower{font-size:clamp(22px,4vw,44px);font-weight:1000;color:#20d978;text-shadow:0 0 18px #20d978}.resultChar{font-size:18px;color:#ffd21c;font-weight:1000}.colorGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.colorBtn{padding:18px 8px;border-radius:14px;border:3px solid #fff;font-weight:1000;color:#fff;cursor:pointer}.colorBtn.red{background:#b51e32}.colorBtn.blue{background:#2456d9}.colorBtn.green{background:#168d49}.colorBtn.yellow{background:#c39512;color:#111}
      .screenCenter{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;box-sizing:border-box}.winnerTitle{font-size:clamp(40px,8vw,100px);font-weight:1000;color:#ffd21c;text-shadow:0 4px #e84b18,0 0 30px #8d39ff}.winnerName{font-size:clamp(30px,5vw,70px);font-weight:1000;color:#fff}.winnerPhoto{width:150px;height:150px;object-fit:cover;border-radius:25px;border:5px solid #ffd21c;box-shadow:0 0 30px #ffd21c}.rankList{width:min(700px,94%);margin:12px auto}.rank{display:grid;grid-template-columns:42px 58px 1fr auto;align-items:center;gap:8px;padding:7px;border-bottom:1px solid #2a2b67;font-weight:1000}.rank img{width:52px;height:52px;border-radius:10px;object-fit:cover;border:2px solid #2774ff}.rank .score{color:#ffd21c}.endMsg{color:#9fdcff;font-weight:900;margin:10px}.rulesFull{width:min(800px,96%);display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left}.ruleBig{padding:12px;border:2px solid #2774ff;border-radius:13px;background:#080722}.ruleBig b{color:#ffd21c}
      @media(max-width:900px){.auMain{grid-template-columns:1fr}.auLeft,.auRight{display:none}.auCenter{width:100%}.auPlayers{grid-template-columns:repeat(2,1fr)}.auTable{width:88%}.auTop{height:62px}.auBottom{display:none}}
    `;
    document.head.appendChild(style);document.body.classList.add('arcadeUI');
    root=document.createElement('div');root.className='au';document.body.appendChild(root);
  }
  function topBar(){return '<div class="auTop"><div class="auLogo">BET YOUR HAND<small>GAME NIGHT</small></div><div class="auRound">ROUND '+esc(state?.round||1)+'<small>OF 2</small></div></div>'}
  function playerCards(){
    return (state?.players||[]).map(p=>'<div class="auPlayer '+(p.id===state.turnPlayerId?'active':'')+'" style="--pc:'+((p.id===state.turnPlayerId)?'#ffd21c':'#2774ff')+'"><img src="'+img(p.character)+'" alt="'+esc(p.character)+'"><div class="auPN">'+esc(p.name)+'</div><div class="auPC">'+esc(p.character||'Character')+'</div><div class="auPP">★ '+Number(p.points||0).toLocaleString()+'</div></div>').join('')}
  function wheelPreview(){return '<h3>BET YOUR HAND</h3><div class="auWheel"><span>POWER<br>WHEEL</span></div><div class="auPower"><div class="auPowerIcon">⚡</div><div class="auPowerName">4 WHEEL POWERS</div><div class="auPowerDesc">EXTRA PLAY • SHIELD<br>COLOR CHOICE • TURN SWITCH</div></div>'}
  function rules(){return '<h3>QUICK RULES</h3><div class="auRule">🃏 Match <b>color or character.</b></div><div class="auRule">🔄 <b>Skip, Reverse, Wild</b> change play.</div><div class="auRule">⭐ Start with a playable card: <b>+150 points.</b></div><div class="auRule">🎡 BET YOUR HAND triggers the <b>power wheel.</b></div><div class="auRule">🔥 At 1 card, use <b>LAST CARD</b>.</div><div class="auRule">🏆 Two rounds. Highest total wins.</div>'}
  function hostPlaying(){
    const ps=state.players||[],a=active();
    return topBar()+'<div class="auMain"><div class="auPanel auLeft"><h3>PLAYERS</h3><div class="auRule"><b>'+ps.length+'/6</b> players connected</div>'+ps.map(p=>'<div class="auRule"><b>'+esc(p.name)+'</b><br>'+esc(p.character)+' • '+Number(p.points||0).toLocaleString()+'</div>').join('')+'</div><div class="auPanel auCenter"><div class="auTitle">HOST / TV VIEW</div><div class="auStatus">'+(a?'🔥 '+esc(a.name)+"'S TURN":'GAME NIGHT')+'</div><div class="auSub">'+(state.pending?pendingText():'PLAYERS USE THEIR PHONES TO PLAY')+'</div><div class="auPlayers">'+playerCards()+'</div><div class="auTable"><div><div class="auCard '+cardClass(state.discard?.[state.discard.length-1])+'">'+esc(cardLabel(state.discard?.[state.discard.length-1]))+'</div><small>DISCARD</small></div><div><div class="auCard blue">BET<br>YOUR<br>HAND</div><small>DRAW PILE</small></div></div></div><div class="auPanel auRight">'+wheelPreview()+rules()+'</div></div><div class="auBottom"><div><b>👥</b> '+ps.length+'/6 PLAYERS</div><div><b>🃏</b> UNO STYLE GAMEPLAY</div><div><b>🔥</b> YOUR TURN GLOWS</div><div><b>🎡</b> CHARACTER POWERS</div><div><b>🏆</b> TWO ROUNDS</div></div>';
  }
  function pendingText(){if(!state.pending)return '';if(state.pending.type==='wheel')return '🎡 BET YOUR HAND POWER WHEEL';if(state.pending.type==='color')return '🎨 '+esc(state.pending.playerName)+' CHOOSE A COLOR';return 'ACTION IN PROGRESS'}
  function playerPlaying(){
    const me=mine();if(!me)return phoneJoin();
    const hand=typeof window.__byhHand!=='undefined'?window.__byhHand:[];
    const turn=isMyTurn();
    const last=me.handCount===1;
    let cards=hand.map((c,i)=>'<button class="phoneCard '+cardClass(c)+'" onclick="BYHArcade.play('+i+')">'+esc(cardLabel(c))+'</button>').join('');
    const power=me.power?'<div class="powerSmall"><span style="font-size:25px">'+POWER[me.power]+'</span><div><b>'+esc(me.power)+'</b><br><small>'+esc(POWER_DESC[me.power])+'</small></div></div>':'';
    return topBar()+'<div class="auMain"><div class="auPanel phonePanel"><div class="meCard"><img src="'+img(me.character)+'"><div><div class="meName">'+esc(me.name)+'</div><div class="meChar">'+esc(me.character)+'</div></div><div class="mePoints">'+Number(me.points||0).toLocaleString()+'<br><small>POINTS</small></div></div><div class="turnBox '+(turn?'':'no')+'"><div class="turnBig">'+(turn?'🔥 YOUR TURN':'WAITING')+'</div><div>'+(turn?'Play a card or draw.':'Waiting for '+esc((active()||{}).name||'the next player')+'.')+'</div></div><div class="auTable" style="width:96%;height:90px;min-height:90px"><div><div class="auCard '+cardClass(state.discard?.[state.discard.length-1])+'">'+esc(cardLabel(state.discard?.[state.discard.length-1]))+'</div></div><div><div class="auCard blue">DRAW</div></div></div><div class="auTitle">YOUR HAND • '+hand.length+' CARDS</div><div class="phoneHand">'+(cards||'<div class="auSub">No cards</div>')+'</div>'+power+(last?lastCardUI(): '')+'<div class="phoneBtns"><button class="auBtn" '+(turn?'':'disabled')+' onclick="BYHArcade.draw()">DRAW</button><button class="auBtn primary" onclick="BYHArcade.rules()">HOW TO PLAY</button></div></div></div>';
  }
  function lastCardUI(){return '<div class="lastCardBox"><b>🔥 LAST CARD</b><br><small>Choose your bonus before playing your final card.</small><div class="lastChoices"><button class="auBtn gold" onclick="BYHArcade.last(100)">SAFE<span>+100</span></button><button class="auBtn gold" onclick="BYHArcade.last(250)">BOLD<span>+250</span></button><button class="auBtn gold" onclick="BYHArcade.last(500)">BIG<span>+500</span></button></div></div>'}
  function phoneJoin(){return '<div class="screenCenter">'+topBar()+'<div class="modalA"><h2>JOIN GAME NIGHT</h2><p>Enter the room code and choose your character.</p><button class="auBtn primary" onclick="location.reload()">JOIN GAME</button></div></div>'}
  function lobby(){
    if(typeof mode!=='undefined'&&mode==='host')return null;
    return topBar()+'<div class="screenCenter"><div class="modalA"><h2>GAME NIGHT</h2><p>Join the host, choose one of the nine characters, and get ready to play.</p></div></div>';
  }
  function wheelOverlay(){
    const p=state.pending||{}, spinning=!p.wheel, power=p.power||'', ch=p.wheel||'';
    return '<div class="overlay"><div class="modalA"><h2>🎡 BET YOUR HAND</h2><p>'+esc(p.playerName||'Player')+' activated the power wheel.</p><div class="bigWheel" id="auSpinWheel"></div>'+(spinning?'<div class="auStatus">SPINNING…</div>':'<div class="resultChar">'+esc(ch)+'</div><div class="resultPower">'+esc(POWER[power]||'')+' '+esc(power)+'</div><p>'+esc(POWER_DESC[power]||'Power awarded!')+'</p>')+'</div></div>';
  }
  function colorOverlay(){const p=state.pending||{};return '<div class="overlay"><div class="modalA"><h2>🎨 CHOOSE A COLOR</h2><p>'+esc(p.playerName||'Player')+', choose the next color.</p><div class="colorGrid"><button class="colorBtn red" onclick="BYHArcade.color(\'red\')">RED</button><button class="colorBtn blue" onclick="BYHArcade.color(\'blue\')">BLUE</button><button class="colorBtn green" onclick="BYHArcade.color(\'green\')">GREEN</button><button class="colorBtn yellow" onclick="BYHArcade.color(\'yellow\')">YELLOW</button></div></div></div>'}
  function roundOver(){const winner=(state.players||[]).find(p=>p.name===state.winner)||[...state.players].sort((a,b)=>b.points-a.points)[0];return topBar()+'<div class="screenCenter"><div class="modalA"><div class="winnerTitle">ROUND '+esc(state.round)+' COMPLETE!</div><div class="winnerName">'+esc(winner?.name||'Winner')+'</div><div class="rankList">'+[...(state.players||[])].sort((a,b)=>b.points-a.points).map((p,i)=>'<div class="rank"><b>#'+(i+1)+'</b><img src="'+img(p.character)+'"><div>'+esc(p.name)+'<br><small>'+esc(p.character)+'</small></div><div class="score">'+Number(p.points||0).toLocaleString()+'</div></div>').join('')+'</div><div class="endMsg">'+(state.round===1?'ROUND 2 STARTING… POINTS CARRY FORWARD.':'MATCH COMPLETE')+'</div></div></div>'}
  function finished(){const winner=[...(state.players||[])].sort((a,b)=>b.points-a.points)[0]||{};return topBar()+'<div class="screenCenter"><div class="modalA"><div class="winnerTitle">🏆 WINNER!</div><img class="winnerPhoto" src="'+img(winner.character)+'"><div class="winnerName">'+esc(winner.name||'Winner')+'</div><div class="resultPower">'+Number(winner.points||0).toLocaleString()+' POINTS</div><p class="endMsg">Thank you everybody for coming out the game night.<br>Thank you for playing the game!</p><div class="auActions"><button class="auBtn primary" onclick="location.reload()">PLAY AGAIN</button><button class="auBtn" onclick="BYHArcade.rules()">HOW TO PLAY</button></div></div></div>'}
  function rulesFull(){return '<div class="overlay"><div class="modalA"><h2>HOW TO PLAY</h2><div class="rulesFull"><div class="ruleBig"><b>1. MATCH</b><br>Match the current card by color or character.</div><div class="ruleBig"><b>2. SPECIALS</b><br>Skip, Reverse and Wild change the flow.</div><div class="ruleBig"><b>3. +150 START BONUS</b><br>If your turn starts with a playable card, you receive +150 points.</div><div class="ruleBig"><b>4. BET YOUR HAND</b><br>The special card activates the character power wheel.</div><div class="ruleBig"><b>5. LAST CARD</b><br>At one card, choose SAFE +100, BOLD +250, or BIG +500.</div><div class="ruleBig"><b>6. TWO ROUNDS</b><br>Round 1 points carry into Round 2. Highest total wins.</div></div><button class="auBtn primary" style="margin-top:12px" onclick="BYHArcade.closeOverlay()">BACK TO GAME</button></div></div>'}
  function render(){
    if(!state)return;
    install();
    const host=typeof mode!=='undefined'&&mode==='host';
    if(host){
      // The dedicated lobby renderer owns the host lobby; this UI takes over once the game starts or ends.
      if(state.phase==='lobby'){root.style.display='none';return}
      root.style.display='block';
      if(state.phase==='playing'){root.innerHTML=hostPlaying()}
      else if(state.phase==='roundover'){root.innerHTML=roundOver()}
      else if(state.phase==='finished'){root.innerHTML=finished()}
      if(state.pending?.type==='wheel'&&state.phase==='playing')root.insertAdjacentHTML('beforeend',wheelOverlay());
      if(state.pending?.type==='color'&&state.phase==='playing')root.insertAdjacentHTML('beforeend',colorOverlay());
      return;
    }
    root.style.display='block';
    if(state.phase==='lobby'){root.innerHTML=lobby();return}
    if(state.phase==='playing')root.innerHTML=playerPlaying();
    else if(state.phase==='roundover')root.innerHTML=roundOver();
    else if(state.phase==='finished')root.innerHTML=finished();
    if(state.pending?.type==='wheel'&&state.phase==='playing')root.insertAdjacentHTML('beforeend',wheelOverlay());
    if(state.pending?.type==='color'&&state.phase==='playing')root.insertAdjacentHTML('beforeend',colorOverlay());
    if(lastPending!==JSON.stringify(state.pending)){lastPending=JSON.stringify(state.pending);if(state.pending?.type==='wheel'&&state.pending.wheel==null)setTimeout(()=>{const w=document.getElementById('auSpinWheel');if(w)w.style.transform='rotate(1120deg)'},40)}
  }
  function hand(){try{return typeof myHand!=='undefined'&&Array.isArray(myHand)?myHand:[]}catch(e){return []}}
  window.__byhHand=hand();
  window.BYHArcade={
    play:i=>send('play',{index:Number(i)}),
    draw:()=>send('draw'),
    color:c=>send('color',{color:c}),
    last:a=>send('lastCard',{amount:Number(a)}),
    rules:()=>{install();root.insertAdjacentHTML('beforeend',rulesFull())},
    closeOverlay:()=>{const o=root.querySelector('.overlay');if(o)o.remove()}
  };
  const timer=setInterval(()=>{
    try{window.__byhHand=hand();if(typeof state!=='undefined'){const k=JSON.stringify([state.phase,state.round,state.turnPlayerId,state.pending,state.players?.map(p=>[p.id,p.points,p.handCount,p.power])]);if(k!==lastStateKey){lastStateKey=k;render()}}}catch(e){}
  },120);
  window.addEventListener('beforeunload',()=>clearInterval(timer));
  // Re-render after the original client renderer receives a server state.
  const hook=setInterval(()=>{try{if(typeof render==='function'&&!render.__arcadeWrapped){const old=render;window.render=function(){old.apply(this,arguments);setTimeout(()=>{window.__byhHand=hand();renderArcade()},0)};window.render.__arcadeWrapped=true;clearInterval(hook)}}catch(e){}},50);
  function renderArcade(){try{if(typeof state!=='undefined'&&state)render()}catch(e){}}
})();