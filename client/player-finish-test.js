(() => {
  'use strict';

  // The player game logic still contains a legacy finish-screen renderer.
  // This file is intentionally loaded after app.js and replaces that legacy DOM
  // immediately with the current full-screen finish presentation.
  // No finish-test button and no audio are added here.

  const STYLE_ID = 'current-player-finish-style';
  const SCREEN_ID = 'current-player-finish-screen';

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #player-finish-screen { display:none !important; }
      #${SCREEN_ID} {
        position:fixed;
        inset:0;
        z-index:999999;
        width:100vw;
        height:100dvh;
        overflow:hidden;
        background:#000 url('/finish-screen.png?v=5') center center / cover no-repeat;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        box-sizing:border-box;
      }
      #${SCREEN_ID} .current-finish-overlay {
        position:absolute;
        left:0;
        right:0;
        bottom:4vh;
        display:flex;
        justify-content:center;
        align-items:flex-end;
        gap:clamp(12px,3vw,36px);
        padding:0 3vw;
        box-sizing:border-box;
      }
      #${SCREEN_ID} .current-finish-player {
        min-width:clamp(105px,18vw,190px);
        max-width:220px;
        padding:8px 10px;
        border:3px solid #1687ff;
        border-radius:16px;
        background:rgba(3,7,19,.82);
        color:#fff;
        text-align:center;
        box-shadow:0 0 18px #1687ff;
        box-sizing:border-box;
      }
      #${SCREEN_ID} .current-finish-photo {
        width:clamp(58px,9vw,92px);
        height:clamp(58px,9vw,92px);
        object-fit:cover;
        border-radius:12px;
        border:3px solid #fff;
        display:block;
        margin:0 auto 5px;
      }
      #${SCREEN_ID} .current-finish-name {
        font-weight:1000;
        font-size:clamp(12px,2vw,20px);
        line-height:1.05;
      }
      #${SCREEN_ID} .current-finish-score {
        margin-top:3px;
        color:#42ffe4;
        font-weight:1000;
        font-size:clamp(17px,3vw,30px);
        text-shadow:0 0 10px #00eaff;
      }
      #${SCREEN_ID} .current-finish-close {
        position:absolute;
        left:-99999px;
        width:1px;
        height:1px;
        overflow:hidden;
      }
      @media(max-width:600px){
        #${SCREEN_ID} .current-finish-overlay{bottom:2.5vh;gap:7px;padding:0 7px;}
        #${SCREEN_ID} .current-finish-player{min-width:88px;padding:5px 4px;border-width:2px;border-radius:10px;}
        #${SCREEN_ID} .current-finish-photo{width:52px;height:52px;border-width:2px;border-radius:8px;}
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\'"]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[c]));
  }

  function replaceLegacyFinish(legacy) {
    if (!legacy || !document.body) return;
    if (document.getElementById(SCREEN_ID)) return;

    const players = [...legacy.querySelectorAll('.finish-player')].map((el) => {
      const photo = el.querySelector('.finish-player-photo');
      const name = el.querySelector('.finish-player-name')?.textContent?.trim() || '';
      const score = el.querySelector('.finish-player-score')?.textContent?.trim() || '';
      return { photo: photo?.getAttribute('src') || '', name, score };
    }).filter(p => p.name || p.score || p.photo);

    const screen = document.createElement('div');
    screen.id = SCREEN_ID;
    screen.setAttribute('aria-label', 'PLAY YOUR HAND game finished');

    const overlay = document.createElement('div');
    overlay.className = 'current-finish-overlay';
    overlay.innerHTML = players.slice(0, 5).map(p => `
      <div class="current-finish-player">
        ${p.photo ? `<img class="current-finish-photo" src="${escapeHtml(p.photo)}" alt="">` : ''}
        <div class="current-finish-name">${escapeHtml(p.name)}</div>
        <div class="current-finish-score">${escapeHtml(p.score)}</div>
      </div>
    `).join('');

    screen.appendChild(overlay);
    document.body.appendChild(screen);
    legacy.remove();
  }

  function scan() {
    const legacy = document.getElementById('player-finish-screen');
    if (legacy) replaceLegacyFinish(legacy);
  }

  installStyle();

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList:true, subtree:true });
  scan();
})();
