(() => {
'use strict';
const style=document.createElement('style');
style.textContent='#controls{display:none!important}#card-display{z-index:30!important;pointer-events:none!important}.host-call-button,#host-call-button,#call-button,#wake-player-button,#wake-up-button,.call-button,.wake-player-button{display:none!important}';
document.head.appendChild(style);
function removeLegacy(){document.querySelectorAll('button,[id],[class]').forEach(el=>{const id=String(el.id||'').toLowerCase(),cl=String(el.className||'').toLowerCase(),t=(el.textContent||'').trim().toUpperCase();if((id.includes('call')||id.includes('wake-player')||id.includes('wake-up')||cl.includes('call-button')||cl.includes('wake-player')||t==='CALL'||t==='WAKE PLAYER'||t==='WAKE UP')&&!el.closest('#host-menu-panel'))el.remove()})}
removeLegacy();new MutationObserver(removeLegacy).observe(document.body,{childList:true,subtree:true});
})();
