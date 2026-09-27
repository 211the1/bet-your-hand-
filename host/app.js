(() => {
'use strict';

const finish=document.createElement('script');
finish.src='/host/finish-test.js?v=3';
finish.onload=()=>{
  const roundFix=document.createElement('script');
  roundFix.src='/host/round-fix.js?v=1';
  roundFix.onload=()=>{
    const core=document.createElement('script');
    core.src='/host/app-core.js?v=1';
    core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
    document.head.appendChild(core);
  };
  roundFix.onerror=()=>{
    const core=document.createElement('script');
    core.src='/host/app-core.js?v=1';
    core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
    document.head.appendChild(core);
  };
  document.body.appendChild(roundFix);
};
document.body.appendChild(finish);
})();
