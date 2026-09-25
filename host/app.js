(() => {
'use strict';

const core=document.createElement('script');
core.src='/host/app-core.js?v=1';
core.onload=()=>{
  const finish=document.createElement('script');
  finish.src='/host/finish-test.js?v=2';
  document.body.appendChild(finish);
};
core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
document.head.appendChild(core);
})();
