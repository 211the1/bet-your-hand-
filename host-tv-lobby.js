/* BET YOUR HAND — full-screen Host / TV waiting room */
(function(){
  const PHOTO={Bug:'Bug.jpg',Face:'Face.jpg','Ling Ling':'Ling_Ling.jpg',Beanz:'Beanz.jpg','The One':'The_One.jpg',Boone:'Boone.jpg','Chicken Joe':'Chicken_Joe.jpg',Juby:'Juby.jpg',Meemaw:'Meemaw.jpg'};
  const COLORS={Bug:'#ff2b35',Face:'#ffd21c','Ling Ling':'#20df72',Beanz:'#249cff','The One':'#a83cff',Boone:'#ffd21c','Chicken Joe':'#743cff',Juby:'#ffbd19',Meemaw:'#19d6ff'};
  const QR='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQgAAAEIAQAAAACLjVdSAAABmUlEQVR4nO2ZzW7DMAyDySHv/8rfDpLlbDv0VEWYm/4gMXhgCYuiVaMX19crwAfxjxGX5LhDsoSRJfbqFKZteghJsoywkbD26himfXrEhhCS4xOCxOoYps8gvGR5mMdTiGvfeteItRWZwrRRj/jxyBaWCDno5DEFcakaTBoHu8s08piCMH8evTZIJ49BCOdLsVOsu4+MYtqDwJiKY4KUhXCTQUwbEJk/tm+sAko15jBtrBfIpmIsp3kgIUYxbUCI1WzZT+sWCaYw7fOPepcYaPvqIKYNiEsyMopyUTjrCiDn9ZeVxzKARf6QwBABfgrTvjzmKI9sLDX9wPi4+ceXchJEiOJ0VuqcO4np+xHLPH7Mx/LwEqYyhWljPpW4fUsycKZ/XMtCosUY1yEmK2cK0zY9Vv7wfZ2V4scw7dsfcUdukHW6jfQ+h2ljf4GMpla13sqqk5i+H3Gbr7vG6rpNQcYwbdQjLsJYWfKkNFOYtiOitzjiR4T3Q+uljvzZdKvf+sT8UfN1rVMM9SedT+u3v+brj/H4IGYivgGwBbsGJ1r/JAAAAABJRU5ErkJggg==';
  const style=document.createElement('style');
  style.textContent=`
    html,body{width:100%;height:100%;margin:0!important;overflow:hidden!important;background:#05030d!important}
    body.hostTV{background:#05030d!important}
    body.hostTV header,body.hostTV .tabs,body.hostTV #roleHeader,body.hostTV #setup,body.hostTV #hostSetup,body.hostTV #playerSetup,body.hostTV #game,body.hostTV #feedPanel,body.hostTV #log{display:none!important}
    body.hostTV .wrap{width:100vw!important;height:100dvh!important;min-height:100dvh!important;max-width:none!important;margin:0!important;padding:0!important;overflow:hidden!important}
    body.hostTV #room{display:block!important;width:100vw!important;height:100dvh!important;min-height:100dvh!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#05030d!important;box-shadow:none!important;overflow:hidden!important}
    .htv{position:relative;width:100vw;height:100dvh;min-height:0;display:grid;grid-template-columns:17.5% 65% 17.5%;grid-template-rows:minmax(0,1fr) 38px;gap:0;color:#fff;font-family:Arial,Helvetica,sans-serif;overflow:hidden;background:radial-gradient(ellipse at 50% 54%,#164f3d 0%,#10123b 42%,#05030d 76%,#020108 100%)}
    .htv:before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 10% 15%,#7d2cff22 0 12%,transparent 28%),radial-gradient(circle at 88% 22%,#ff2b3520 0 10%,transparent 26%),linear-gradient(180deg,#02010822,#02010888)}
    .htvSide,.htvMain,.htvRules{position:relative;z-index:1;margin:7px;border:2px solid #246dff;border-radius:15px;background:linear-gradient(180deg,#0d1048f5,#03041af5);box-shadow:0 0 22px #246dff55;min-height:0;overflow:hidden}
    .htvSide{padding:9px;display:flex;flex-direction:column;justify-content:space-between;text-align:center}
    .htvLogo{font-size:clamp(18px,2.2vw,43px);font-weight:1000;line-height:.82;color:#ffd21c;text-shadow:0 3px #e84b18,0 0 16px #873cff;margin:5px 0 12px}
    .htvLogo em{display:block;font-style:normal;font-size:.39em;color:#fff;letter-spacing:1px;margin-top:8px}
    .join{font-size:clamp(15px,1.35vw,27px);font-weight:1000;margin-bottom:6px}
    .qr{display:block;width:min(88%,14vw);max-height:28vh;aspect-ratio:1;object-fit:contain;background:#fff;border:5px solid #fff;border-radius:7px;margin:0 auto}
    .cl{font-size:clamp(8px,.8vw,15px);font-weight:900;color:#ddd;margin-top:7px}
    .code{font-size:clamp(23px,2.55vw,50px);font-weight:1000;letter-spacing:.16em;color:#ffd21c;line-height:1}
    .url{font-size:clamp(7px,.7vw,12px);color:#aaa;word-break:break-all;margin-top:3px}
    .mini{border-top:1px solid #246dff;padding-top:7px;font-size:clamp(7px,.7vw,12px);line-height:1.3;color:#bbb}
    .htvMain{padding:4px 8px;display:flex;flex-direction:column}
    .title{text-align:center;font-size:clamp(28px,4vw,68px);font-weight:1000;font-style:italic;line-height:.88;color:#ffd85b;text-shadow:0 4px #e84b18,0 0 18px #9b3cff;margin:5px 0 1px;white-space:nowrap}
    .sub{text-align:center;font-size:clamp(8px,.82vw,15px);font-weight:900;color:#ddd;margin-bottom:3px}
    .count{text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:1000;margin-bottom:5px;color:#fff}
    .players{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:6px;flex:1;min-height:0}
    .p{border:2px solid #2670ff;border-radius:12px;background:linear-gradient(145deg,#08082bf5,#030318f5);display:grid;grid-template-columns:clamp(48px,5.1vw,82px) 1fr;grid-template-rows:auto auto auto;gap:1px 7px;align-content:center;padding:6px;overflow:hidden;min-height:0}
    .p.active{border-color:#ffd21c;box-shadow:0 0 24px #ffd21caa,0 0 5px #fff inset}
    .p img{grid-row:1/4;width:clamp(48px,5.1vw,82px);height:clamp(48px,5.1vw,82px);object-fit:cover;object-position:center;border-radius:10px;border:3px solid var(--c);box-shadow:0 0 12px var(--c)}
    .pn{font-weight:1000;font-size:clamp(12px,1.15vw,21px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:end}
    .pc{font-size:clamp(8px,.78vw,14px);color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pp{font-size:clamp(10px,.9vw,16px);font-weight:1000;color:#ffd21c}
    .wait{display:flex;align-items:center;justify-content:center;color:#555;font-size:clamp(10px,1vw,18px);font-weight:1000}
    .table{position:absolute;left:24%;right:24%;bottom:48px;height:58px;border-radius:50%;background:radial-gradient(ellipse,#087457,#023a30);border:4px solid #754323;box-shadow:inset 0 0 22px #000,0 5px 20px #0008;pointer-events:none}
    .deck{position:absolute;left:50%;top:5px;transform:translateX(-50%);width:58px;height:38px;border-radius:5px;background:#153b91;border:2px solid #fff;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7px;font-weight:1000;line-height:1}
    .start{display:block;margin:5px auto 1px;width:min(38%,390px);font-size:clamp(16px,1.45vw,28px)!important;padding:7px 14px!important;border:3px solid #fff!important;box-shadow:0 0 25px #a33cff!important}
    .htvRules{padding:8px}
    .htvRules h3{text-align:center;color:#fff;font-size:clamp(12px,1.3vw,24px);margin:2px 0 5px}
    .wheel{width:min(120px,8vw);height:min(120px,8vw);margin:0 auto 6px;border-radius:50%;border:4px solid #fff;background:conic-gradient(#ffd21c 0 12.5%,#236cff 12.5% 25%,#24d77a 25% 37.5%,#ff3145 37.5% 50%,#713bff 50% 62.5%,#24d77a 62.5% 75%,#236cff 75% 87.5%,#ffbd19 87.5%);position:relative;box-shadow:0 0 18px #246dff88}
    .wheel:after{content:'BET\\A YOUR\\A HAND';white-space:pre;text-align:center;position:absolute;inset:28%;border-radius:50%;background:#08082b;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:clamp(6px,.55vw,10px);font-weight:1000}
    .rule{font-size:clamp(7px,.72vw,13px);line-height:1.13;margin:6px 0;color:#eee}
    .rule b{color:#ffd21c}
    .bottom{grid-column:1/-1;border-top:2px solid #15164d;background:#010109;display:flex;justify-content:space-around;align-items:center;font-size:clamp(7px,.68vw,13px);font-weight:900;white-space:nowrap;overflow:hidden}
    .bottom b{color:#ffd21c;font-size:15px;margin-right:3px}
    @media(max-aspect-ratio:4/3){.htv{grid-template-columns:19% 62% 19%}.htvSide,.htvMain,.htvRules{margin:4px}.htvSide{padding:5px}.htvRules{padding:5px}.rule{font-size:8px}.wheel{width:80px;height:80px}.table{left:22%;right:22%}}
  `;
  document.head.appendChild(style);
  document.body.classList.add('hostTV');

  function draw(){
    if(typeof mode==='undefined'||mode!=='host'||typeof state==='undefined'||!state||state.phase!=='lobby')return false;
    const room=$('room');if(!room)return false;
    const ps=state.players||[];
    room.innerHTML='';
    const root=document.createElement('div');root.className='htv';
    const side=document.createElement('div');side.className='htvSide';
    side.innerHTML='<div><div class="htvLogo">BET YOUR<br>HAND<em>GAME NIGHT</em></div><div class="join">SCAN TO JOIN</div><img class="qr" src="'+QR+'"><div class="cl">OR ENTER CODE</div><div class="code">'+escapeHtml(roomCode||'----')+'</div><div class="url">'+escapeHtml(location.origin)+'</div></div><div class="mini">2–6 PLAYERS<br>FICTIONAL GAME POINTS</div>';
    const main=document.createElement('div');main.className='htvMain';main.style.position='relative';
    main.innerHTML='<div class="title">HOST / TV VIEW</div><div class="sub">GAME NIGHT • 2–6 PLAYERS • FICTIONAL GAME POINTS</div><div class="count">PLAYERS ('+ps.length+'/6)</div>';
    const grid=document.createElement('div');grid.className='players';
    for(let i=0;i<6;i++){
      const p=ps[i],el=document.createElement('div');
      if(!p){el.className='p wait';el.textContent='WAITING…';grid.appendChild(el);continue}
      el.className='p'+(p.id===state.turnPlayerId?' active':'');
      const im=document.createElement('img');im.src='/'+(PHOTO[p.character]||'Bug.jpg');im.alt=p.character||'';im.style.setProperty('--c',COLORS[p.character]||'#743cff');el.appendChild(im);
      const name=document.createElement('div');name.className='pn';name.textContent=p.name||'Player';el.appendChild(name);
      const ch=document.createElement('div');ch.className='pc';ch.textContent=p.character||'Character';el.appendChild(ch);
      const pts=document.createElement('div');pts.className='pp';pts.textContent='★ '+Number(p.points||0).toLocaleString();el.appendChild(pts);
      grid.appendChild(el);
    }
    main.appendChild(grid);
    const table=document.createElement('div');table.className='table';const deck=document.createElement('div');deck.className='deck';deck.textContent='BET YOUR HAND';table.appendChild(deck);main.appendChild(table);
    const start=document.createElement('button');start.className='btn primary big start';start.textContent='START GAME';start.disabled=ps.length<2;start.onclick=startGame;main.appendChild(start);
    const rules=document.createElement('div');rules.className='htvRules';
    rules.innerHTML='<h3>BET WHEEL PREVIEW</h3><div class="wheel"></div><h3>QUICK RULES</h3><div class="rule">🃏 Match <b>color or character.</b></div><div class="rule">🔄 Action cards can change the game.</div><div class="rule">⭐ <b>+150</b> when a turn starts with a playable card.</div><div class="rule">🔥 <b>LAST CARD</b> appears at 1 card.</div><div class="rule">🎡 <b>BET YOUR HAND</b> can trigger the challenge wheel.</div><div class="rule">🏆 First player to 0 cards wins the round.</div><div class="rule">🏁 <b>Two rounds.</b> Highest total wins.</div>';
    const bottom=document.createElement('div');bottom.className='bottom';bottom.innerHTML='<div><b>👥</b>2–6 PLAYERS</div><div><b>🃏</b>UNO STYLE GAMEPLAY</div><div><b>♛</b>IT’S A GAME NIGHT!</div><div><b>🏆</b>TWO ROUNDS</div><div><b>⚙</b>SETTINGS</div>';
    root.append(side,main,rules,bottom);room.appendChild(root);return true;
  }
  const wait=setInterval(function(){
    if(typeof render==='function'){
      const old=render;
      window.render=function(){if(draw())return;old.apply(this,arguments)};
      clearInterval(wait);draw();
    }
  },50);
})();