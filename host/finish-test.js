(() => {
'use strict';

function getHostPlayers(){
  return Array.from(document.querySelectorAll('#seats .seat')).map((seat,index)=>{
    const label=seat.querySelector('.seat-label');
    const character=label?.querySelector('b')?.textContent?.trim()||'Player';
    const name=(label?.textContent||'').replace(character,'').trim()||character;
    const scoreText=seat.querySelector('.seat-score')?.textContent||'';
    const match=scoreText.match(/-?\d+/);
    return {
      character,
      name,
      score:Number(match?.[0]||500),
      image:seat.querySelector('img')?.getAttribute('src')||''
    };
  });
}

function showFinish(){
  const old=document.getElementById('host-finish-test-overlay');
  if(old)old.remove();

  const players=getHostPlayers();
  const list=players.length?players:[
    {character:'Bug',name:'TEST PLAYER 1',score:500,image:'/bug-seat.png'},
    {character:'Face',name:'TEST PLAYER 2',score:650,image:'/face-seat.png'}
  ];
  const winner=list.reduce((best,p)=>p.score>best.score?p:best,list[0]);

  const overlay=document.createElement('div');
  overlay.id='host-finish-test-overlay';
  overlay.className='host-finish-test-overlay';
  overlay.innerHTML=`
    <div class="host-finish-test-bg"></div>
    <div class="host-finish-test-content">
      <div class="host-finish-test-kicker">PLAY YOUR HAND</div>
      <div class="host-finish-test-title">GAME NIGHT WINNER</div>
      <div class="host-finish-test-winner">${escapeText(winner.name)}</div>
      <div class="host-finish-test-character">${escapeText(winner.character)} · ${winner.score} POINTS</div>
      <div class="host-finish-test-scoreboard">
        ${list.map((p,i)=>`<div class="host-finish-test-row ${p===winner?'winner':''}">
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

function escapeText(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function escapeAttr(value){return escapeText(value).replace(/`/g,'&#96;');}

function attach(){
  const button=document.getElementById('host-test-finish');
  if(!button){setTimeout(attach,250);return;}
  if(button.dataset.finishBound==='1')return;
  button.dataset.finishBound='1';
  button.addEventListener('click',()=>{
    const panel=document.getElementById('host-menu-panel');
    if(panel)panel.classList.remove('show');
    showFinish();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
else attach();
})();
