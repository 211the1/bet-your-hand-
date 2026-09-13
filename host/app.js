(() => {
  'use strict';

  const createButton = document.getElementById('create');
  const roomEl = document.getElementById('room');
  const playersEl = document.getElementById('players');
  const startButton = document.getElementById('start');
  const gameEl = document.getElementById('game');

  let ws = null;
  let created = false;

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);

    ws.addEventListener('open', () => {
      createButton.disabled = false;
    });

    ws.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); }
      catch { return; }

      if (message.type === 'ERROR') {
        roomEl.innerHTML = `<h2>${escapeHtml(message.error || 'Something went wrong.')}</h2>`;
        createButton.disabled = false;
        return;
      }

      if (message.type === 'ROOM_CREATED') {
        created = true;
        createButton.disabled = true;
        roomEl.innerHTML = `<h2>ROOM ${escapeHtml(message.code)}</h2>`;
        startButton.hidden = false;
        return;
      }

      if (message.type !== 'STATE') return;

      playersEl.innerHTML = message.players.map(player =>
        `<div>${escapeHtml(player.name)} — ${escapeHtml(player.character)} ${player.connected ? '🟢' : '⚪'}</div>`
      ).join('');

      if (message.game) {
        gameEl.innerHTML = `<h2>ROUND ${message.game.round}</h2><h3>${escapeHtml(message.game.currentColor || '')}</h3>`;
      }
    });

    ws.addEventListener('close', () => {
      if (!created) createButton.disabled = false;
    });
  }

  function send(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      roomEl.innerHTML = '<h2>Connecting to game server…</h2>';
      return;
    }
    ws.send(JSON.stringify(message));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  createButton.disabled = true;
  startButton.hidden = true;
  connect();

  createButton.addEventListener('click', () => {
    if (created) return;
    createButton.disabled = true;
    send({ type: 'CREATE_ROOM', name: 'Host' });
  });

  startButton.addEventListener('click', () => send({ type: 'START_GAME' }));
})();
