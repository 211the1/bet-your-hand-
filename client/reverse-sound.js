'use strict';

(() => {
  const SOUND_URL = '/assets/reverse.mp3';
  let audio = null;

  function playReverseSound() {
    try {
      if (!audio) audio = new Audio(SOUND_URL);
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
  }

  // Player screen only. The actual player card is marked .special-reverse.
  function isReverseCard(el) {
    return !!(el && el.closest && el.closest('.special-reverse'));
  }

  document.addEventListener('pointerup', e => {
    if (isReverseCard(e.target)) playReverseSound();
  }, true);

  document.addEventListener('click', e => {
    if (isReverseCard(e.target)) playReverseSound();
  }, true);
})();
