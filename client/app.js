(() => {
  'use strict';

  const codeInput = document.getElementById('code');
  const nameInput = document.getElementById('name');
  const characterSelect = document.getElementById('char');
  const joinButton = document.getElementById('join');
  const statusEl = document.getElementById('status');
  const gameEl = document.getElementById('game');

  const characters = ['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];
  characterSelect.replaceChildren(new Option('SELECT CHARACTER', ''));
  characters.forEach(character => characterSelect.add(new Option(character, character)));

  let ws = null;
  let me = null;
  let joined = false;

  function setStatus(message, isError = false) {
    statusEl.textContent = message || '';
    statusEl.style.color = isError ? '#ff6b6b' : '#21f17d';
  }

  function send(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setStatus('Connecting…', true);
      return false;
    }
    ws.send(JSON.stringify(message));
    return true;
  }

  function render(message) {
    if (message.type === 'ERROR') {
      setStatus(message.error || 'Something went wrong.', true);
      joinButton.disabled = false;
      return;
    }

    if (message.type === 'JOINED') {
      me = message.playerId;
      joined = true;
      joinButton.disabled = true;
      setStatus(`JOINED ROOM ${message.code}`);
      return;
    }

    if (message.type !== 'STATE') return;

    const game = message.game;
    if (!game) {
      gameEl.innerHTML = '<h2>WAITING FOR HOST…</h2>' +
        message.players.map(player => `<div>${escapeHtml(player.name)} — ${escapeHtml(player.character)} ${player.connected ? '🟢' : '⚪'}</div>`).join('');
      return;
    }

    const hand = Array.isArray(game.viewerHand) ? game.viewerHand : [];
    const isMyTurn = game.turnPlayerId === me;
    const cards = hand.map(card =>
      `<button class="card" data-card-id="${escapeHtml(card.id)}">${escapeHtml(card.character || card.type)}<br>${escapeHtml(card.color || '')}</button>`
    ).join('');

    gameEl.innerHTML =
      `<h2>ROUND ${game.round}</h2>` +
      `<div>Current color: ${escapeHtml(game.currentColor || '—')}</div>` +
      `<div>Top: ${escapeHtml(game.topCard.character || game.topCard.type)}</div>` +
      `<div>${game.players.map(player => `<b>${escapeHtml(player.name)}</b> ${player.handCount} cards · ${player.points} pts`).join('<br>')}</div>` +
      (isMyTurn ? `<h2 class="turn">YOUR TURN</h2>${cards}` : '<h2>WAITING</h2>') +
      (game.pending?.playerId === me && game.pending.type === 'SPIN_WHEEL' ? '<button id="spin">SPIN POWER WHEEL</button>' : '');

    gameEl.querySelectorAll('[data-card-id]').forEach(button => {
      button.addEventListener('click', () => send({ type: 'PLAY_CARD', cardId: button.dataset.cardId }));
    });

    const spinButton = document.getElementById('spin');
    if (spinButton) spinButton.addEventListener('click', () => send({ type: 'SPIN_WHEEL' }));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  joinButton.addEventListener('click', () => {
    const code = codeInput.value.trim().toUpperCase();
    const playerName = nameInput.value.trim();
    const character = characterSelect.value;

    if (code.length !== 4) return setStatus('Enter the 4-character room code.', true);
    if (!playerName) return setStatus('Enter your name.', true);
    if (!character) return setStatus('Choose a character.', true);

    joinButton.disabled = true;
    setStatus('Connecting…');
    gameEl.replaceChildren();

    if (ws) {
      try { ws.close(); } catch {}
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);

    ws.addEventListener('open', () => {
      setStatus('Joining room…');
      send({ type: 'JOIN_ROOM', code, name: playerName, character });
    });

    ws.addEventListener('message', event => {
      try { render(JSON.parse(event.data)); }
      catch { setStatus('Received an invalid game message.', true); }
    });

    ws.addEventListener('error', () => {
      setStatus('Connection error. Please try JOIN GAME again.', true);
      joinButton.disabled = false;
    });

    ws.addEventListener('close', () => {
      if (!joined) joinButton.disabled = false;
      setStatus(joined ? 'Disconnected from game.' : 'Could not connect to the game.', true);
    });
  });
})();
