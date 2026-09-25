(() => {
'use strict';

function installFinishStyles(){
  if(document.getElementById('host-finish-test-styles'))return;
  const style=document.createElement('style');
  style.id='host-finish-test-styles';
  style.textContent=`
#host-finish-test-overlay{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.host-finish-test-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.68)),url('/finish-screen.png?v=1') center/100% 100% no-repeat;filter:saturate(1.08)}
.host-finish-test-content{position:relative;z-index:2;width:min(900px,92vw);max-height:94vh;overflow:auto;box-sizing:border-box;padding:clamp(18px,4vw,40px);text-align:center}
.host-finish-test-kicker{font-size:clamp(16px,2.5vw,28px);font-weight:1000;letter-spacing:5px;color:#42ffe4;text-shadow:0 0 12px #00eaff;margin-bottom:4px}
.host-finish-test-title{font-size:clamp(34px,7vw,78px);font-weight:1000;line-height:.95;letter-spacing:2px;color:#fff;text-shadow:0 0 10px #fff,0 0 28px #1687ff;margin-bottom:14px}
.host-finish-test-winner{font-size:clamp(30px,6vw,64px);font-weight:1000;line-height:1;color:#21f17d;text-shadow:0 0 12px #21f17d,0 0 28px #1687ff}
.host-finish-test-character{font-size:clamp(16px,2.7vw,28px);font-weight:900;color:#ffd21c;margin:8px 0 20px}
.host-finish-test-scoreboard{width:min(720px,96vw);margin:0 auto;border:3px solid #1687ff;border-radius:18px;background:rgba(3,7,19,.86);box-shadow:0 0 20px #1687ff,0 0 40px #00eaff44;padding:8px 12px;box-sizing:border-box}
.host-finish-test-row{display:grid;grid-template-columns:42px 58px 1fr auto;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid #1687ff88;text-align:left}
.host-finish-test-row:last-child{border-bottom:0}
.host-finish-test-row.winner{background:linear-gradient(90deg,#21f17d22,transparent);border-radius:10px}
.host-finish-test-rank{font-size:22px;font-weight:1000;color:#ffd21c;text-align:center}
.host-finish-test-row img{width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 5px #000)}
.host-finish-test-player{min-width:0}.host-finish-test-player b{display:block;font-size:clamp(15px,2.4vw,24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.host-finish-test-player span{display:block;color:#42ffe4;font-size:clamp(11px,1.7vw,17px);font-weight:900}
.host-finish-test-row>strong{font-size:clamp(20px,3vw,32px);color:#fff;text-shadow:0 0 8px #1687ff;white-space:nowrap}
#host-finish-back{width:min(360px,86vw);margin:22px auto 0;padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000;cursor:pointer;display:block}
#host-finish-back:active{transform:scale(.98)}
@media(max-width:600px){.host-finish-test-content{padding:16px 10px}.host-finish-test-row{grid-template-columns:30px 45px 1fr auto;gap:7px;padding:7px 2px}.host-finish-test-row img{width:42px;height:42px}.host-finish-test-rank{font-size:17px}.host-finish-test-player b{font-size:14px}.host-finish-test-player span{font-size:10px}.host-finish-test-row>strong{font-size:20px}}
`;
  document.head.appendChild(style);
}

function getHostPlayers(){
  return Array.from(document.querySelectorAll('#seats .seat')).map(seat=>{
    const label=seat.querySelector('.seat-label');
    const character=label?.querySelector('b')?.textContent?.trim()||'Player';
    const name=(label?.textContent||'').replace(character,'').trim()||character;
    const scoreText=seat.querySelector('.seat-score')?.textContent||'';
    const match=scoreText.match(/-?\d+/);
    return {character,name,score:Number(match?.[0]||500),image:seat.querySelector('img')?.getAttribute('src')||''};
  });
}

function showFinish(){
  const old=document.getElementById('host-finish-test-overlay');
  if(old)old.remove();
  installFinishStyles();

  const players=getHostPlayers();
  const list=(players.length?players:[
    {character:'Bug',name:'TEST PLAYER 1',score:500,image:'/bug-seat.png'},
    {character:'Face',name:'TEST PLAYER 2',score:650,image:'/face-seat.png'}
  ]).sort((a,b)=>b.score-a.score);
  const winner=list[0];

  const overlay=document.createElement('div');
  overlay.id='host-finish-test-overlay';
  overlay.innerHTML=`
    <div class="host-finish-test-bg"></div>
    <div class="host-finish-test-content">
      <div class="host-finish-test-kicker">PLAY YOUR HAND</div>
      <div class="host-finish-test-title">GAME NIGHT WINNER</div>
      <div class="host-finish-test-winner">${escapeText(winner.name)}</div>
      <div class="host-finish-test-character">${escapeText(winner.character)} · ${winner.score} POINTS</div>
      <div class="host-finish-test-scoreboard">
        ${list.map((p,i)=>`<div class="host-finish-test-row ${i===0?'winner':''}">
          <div class="host-finish-test-rank">${i+1}</div>
          ${p.image?`<img src="${escapeAttr(p.image)}" alt="">`:''}
          <div class="host-finish-test-player"><b>${escapeText(p.name)}</b><span>${escapeText(p.character)}</span></div>
          <strong>${Number(p.score)||0}</strong>
        </div>`).join('')}
      </div>
      <button id="host-finish-back" type="button">BACK TO HOST</button>
    </div>`;

  document.body.appendChild(overlay);
  document.body.classList.add('host-finished');
  const menuButton=document.getElementById('host-menu-button');
  if(menuButton)menuButton.style.display='none';
  document.getElementById('host-finish-back')?.addEventListener('click',hideFinish);
}

function hideFinish(){
  document.getElementById('host-finish-test-overlay')?.remove();
  document.body.classList.remove('host-finished');
  const menuButton=document.getElementById('host-menu-button');
  if(menuButton)menuButton.style.display='flex';
}

function escapeText(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function escapeAttr(value){return escapeText(value).replace(/`/g,'&#96;');}

function attach(){
  const button=document.getElementById('host-test-finish');
  if(!button){setTimeout(attach,250);return;}
  if(button.dataset.finishBound==='1')return;
  button.dataset.finishBound='1';
  button.addEventListener('click',()=>{
    document.getElementById('host-menu-panel')?.classList.remove('show');
    showFinish();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
else attach();
})();
