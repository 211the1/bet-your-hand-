(() => {
'use strict';

const finish=document.createElement('script');
finish.src='/host/finish-test.js?v=3';
finish.onload=()=>{
  const roundFix=document.createElement('script');
  roundFix.src='/host/round-fix.js?v=1';
  roundFix.onload=()=>{
    const startSound=document.createElement('script');
    startSound.src='/host/game-start-sound.js?v=1';
    startSound.onload=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    document.body.appendChild(startSound);
  };
  roundFix.onerror=()=>{
    const startSound=document.createElement('script');
    startSound.src='/host/game-start-sound.js?v=1';
    startSound.onload=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    startSound.onerror=()=>{
      const core=document.createElement('script');
      core.src='/host/app-core.js?v=1';
      core.onerror=()=>{window.console.error('PLAY YOUR HAND Host core failed to load');};
      document.head.appendChild(core);
    };
    document.body.appendChild(startSound);
  };
  document.body.appendChild(roundFix);
};
document.body.appendChild(finish);
})();
