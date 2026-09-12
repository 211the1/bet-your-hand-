'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const WebSocket = require('ws');
const { createServer } = require('../server');
const engine = require('../engine/card-engine');

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const queue = [];
    const waiters = new Map();
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      const waiter = waiters.get(msg.type);
      if (waiter) { waiters.delete(msg.type); waiter(msg); }
      else queue.push(msg);
    });
    ws.once('open', () => resolve({ ws, waitFor(type) {
      const i = queue.findIndex(x => x.type === type);
      if (i >= 0) return Promise.resolve(queue.splice(i, 1)[0]);
      return new Promise(r => waiters.set(type, r));
    }}));
    ws.once('error', reject);
  });
}

test('WebSocket transports a real PLAY_CARD action and broadcasts state', async t => {
  const app = createServer({ roomServer: new (require('./room-server').RoomServer)({ rng: () => 0.1 }) });
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const url = `ws://127.0.0.1:${app.httpServer.address().port}`;

  const host = await connect(url);
  host.ws.send(JSON.stringify({ type: 'CREATE_ROOM', name: 'Host' }));
  const created = await host.waitFor('ROOM_CREATED');
  await host.waitFor('STATE');

  const player = await connect(url);
  player.ws.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 2' }));
  await player.waitFor('ROOM_JOINED');
  await player.waitFor('STATE');
  await host.waitFor('STATE');

  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  await host.waitFor('STATE');
  await player.waitFor('STATE');

  const room = app.roomServer.getRoom(created.code);
  room.game.turnIndex = 0;
  room.game.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  room.game.players[0].hand = [
    { type: 'CHARACTER', color: 'red', character: 'Face' },
    { type: 'CHARACTER', color: 'blue', character: 'The One' }
  ];

  host.ws.send(JSON.stringify({ type: 'PLAY_CARD', handIndex: 0 }));
  const state = await host.waitFor('STATE');
  assert.equal(state.game.topCard.character, 'Face');
  assert.equal(state.game.turnPlayerId, room.game.players[1].id);
  assert.equal(state.game.viewerHand.length, 1);

  host.ws.close();
  player.ws.close();
});

test('WebSocket rejects a client-supplied wheel result', async t => {
  const app = createServer({ roomServer: new (require('./room-server').RoomServer)({ rng: () => 0.1 }) });
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const url = `ws://127.0.0.1:${app.httpServer.address().port}`;
  const host = await connect(url);
  host.ws.send(JSON.stringify({ type: 'CREATE_ROOM', name: 'Host' }));
  const created = await host.waitFor('ROOM_CREATED');
  await host.waitFor('STATE');
  const player = await connect(url);
  player.ws.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 2' }));
  await player.waitFor('ROOM_JOINED');
  await player.waitFor('STATE');
  await host.waitFor('STATE');
  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  await host.waitFor('STATE');
  await player.waitFor('STATE');

  const room = app.roomServer.getRoom(created.code);
  room.game.turnIndex = 0;
  room.game.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  room.game.players[0].hand = [
    { type: engine.SPECIAL, color: null, action: engine.SPECIAL },
    { type: 'CHARACTER', color: 'blue', character: 'Face' }
  ];
  host.ws.send(JSON.stringify({ type: 'PLAY_CARD', handIndex: 0 }));
  await host.waitFor('STATE');
  host.ws.send(JSON.stringify({ type: 'SPIN_WHEEL', forcedIndex: 8 }));
  const state = await host.waitFor('STATE');
  assert.equal(state.game.wheelResult.index, 0);
  assert.equal(state.game.wheelResult.character, 'Bug');

  host.ws.close();
  player.ws.close();
});

console.log('STAGE 2 GAME ACTION WEBSOCKET TESTS: READY');
