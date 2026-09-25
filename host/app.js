(() => {
'use strict';

// Keep the known-working Host app unchanged by loading the exact app.js
// from the commit that is currently running on fresh-rebuild.
const core=document.createElement('script');
core.src='https://raw.githubusercontent.com/211the1/bet-your-hand-/179ed2ae47317d04eac788fe54513cb89d92b4d7/host/app.js';
core.onload=()=>{
  const finish=document.createElement('script');
  finish.src='/host/finish-test.js?v=1';
  document.body.appendChild(finish);
};
core.onerror=()=>{
  const finish=document.createElement('script');
  finish.src='/host/finish-test.js?v=1';
  document.body.appendChild(finish);
};
document.head.appendChild(core);
})();
