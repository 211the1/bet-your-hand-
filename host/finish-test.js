(() => {
'use strict';

function installFinishStyles(){
  if(document.getElementById('host-finish-test-styles'))return;
  const style=document.createElement('style');
  style.id='host-finish-test-styles';
  style.textContent=`
#host-finish-test-overlay{position:fixed;inset:0;z-index:100000;background:#05020d;color:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}
.host-finish-test-bg{position:absolute;inset:0;background:url('/finish-screen.png?v=1') center/100% 100% no-repeat}
#host-test-winner-slot{position:absolute;left:47.5%;top:42%;transform:translate(-50%,-50%);width:clamp(150px,24vw,300px);height:clamp(220px,38vw,420px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:none}
#host-test-winner-score{position:relative;left:15%;font-size:clamp(28px,5vw,58px);font-weight:1000;color:#fff;text-shadow:0 0 8px #000,0 0 18px #1687ff;margin-bottom:6px;line-height:1}
#host-test-winner-character{width:100%;height:calc(100% - 55px);object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 8px #000);}
#host-finish-back{position:absolute;z-index:3;left:50%;bottom:5vh;transform:translateX(-50%);width:min(360px,86vw);padding:13px 20px;border:3px solid #fff;border-radius:14px;background:#0869ff;color:#fff;font:1000 clamp(17px,2.8vw,25px)/1 system-ui,sans-serif;box-shadow:0 0 18px #1687ff,0 7px 16px #0009;text-shadow:2px 2px 0 #000;cursor:pointer;display:block}
#host-finish-back:active{transform:translateX(-50%) scale(.98)}
`;
  document.head.appendChild(style);
}

function showFinish(){
  const old=document.getElementById('host-finish-test-overlay');
  if(old)old.remove();
  installFinishStyles();

  const overlay=document.createElement('div');
  overlay.id='host-finish-test-overlay';
  overlay.innerHTML=`
    <div class="host-finish-test-bg"></div>
    <div id="host-test-winner-slot" aria-label="Test winner seat">
      <div id="host-test-winner-score">TEST WINNER · 500</div>
      <img id="host-test-winner-character" src="/bug-seat.png?v=1" alt="Test winner Bug seated">
    </div>
    <button id="host-finish-back" type="button">BACK TO HOST</button>`;

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
