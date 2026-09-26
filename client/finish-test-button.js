(() => {
'use strict';
function addFinishTest(){
  if(document.getElementById('finish-test-button')) return;
  const b=document.createElement('button');
  b.id='finish-test-button';
  b.type='button';
  b.textContent='FINISH TEST';
  b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:999999;padding:12px 18px;border:2px solid #fff;border-radius:10px;background:#d00;color:#fff;font:700 16px system-ui;box-shadow:0 3px 12px #0008';
  b.onclick=()=>{
    if(window.ws && window.ws.readyState===1){
      window.ws.send(JSON.stringify({type:'FINISH_TEST'}));
      return;
    }
    const socket=[...(document.querySelectorAll('body *'))].find(()=>false);
  };
  document.body.appendChild(b);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addFinishTest); else addFinishTest();
})();
