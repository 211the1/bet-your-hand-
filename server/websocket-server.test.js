const test = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { createServer } = require('../server');

function createMessageQueue(ws) {
  const queue = [];
  const waiters = new Map();
  ws.on('message', data => {
    const msg = JSON.parse(data.toString());
    const waiter = waiters.get(msg.type);
    if (waiter) {
      waiters.delete(msg.type);
      waiter(msg);
    } else {
      queue.push(msg);
    }
  });
  return {
    waitFor(type) {
      const index = queue.findIndex(msg => msg.type === type);
      if (index >= 0) return Promise.resolve(queue.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        waiters.set(type, resolve);
        ws.once('error', reject);
      });
    }
  };
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once('open', () => resolve({ ws, messages: createMessageQueue(ws) }));
    ws.once('error', reject);
  });
}

test('WebSocket create, join, start, private state, and reconnect work', async t => {
  const app = createServer();
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const port = app.httpServer.address().port;
  const url = `ws://127.0.0.1:${port}`;

  const host = await connect(url);
  host.ws.send(JSON.stringify({ type: 'CREATE_ROOM', name: 'Host' }));
  const created = await host.messages.waitFor('ROOM_CREATED');
  assert.match(created.code, /^[A-Z2-9]{4}$/);
  await host.messages.waitFor('STATE');

  const player = await connect(url);
  player.ws.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 2' }));
  const joined = await player.messages.waitFor('ROOM_JOINED');
  assert.equal(joined.code, created.code);
  await player.messages.waitFor('STATE');
  await host.messages.waitFor('STATE');

  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  const hostState = await host.messages.waitFor('STATE');
  const playerState = await player.messages.waitFor('STATE');
  assert.equal(hostState.game.players.length, 2);
  assert.equal(playerState.game.players.length, 2);
  assert.equal(hostState.game.viewerHand.length, 8);
  assert.equal(playerState.game.viewerHand.length, 8);
  assert.equal(JSON.stringify(hostState.game.players), JSON.stringify(playerState.game.players));
  assert.notEqual(JSON.stringify(hostState.game.viewerHand), JSON.stringify(playerState.game.viewerHand));

  const closed = new Promise(resolve => player.ws.once('close', resolve));
  player.ws.close();
  await closed;

  const reconnected = await connect(url);
  reconnected.ws.send(JSON.stringify({
    type: 'RECONNECT',
    code: created.code,
    playerId: joined.playerId,
    reconnectToken: joined.reconnectToken
  }));
  const ack = await reconnected.messages.waitFor('RECONNECTED');
  assert.equal(ack.playerId, joined.playerId);
  const restored = await reconnected.messages.waitFor('STATE');
  assert.equal(restored.game.viewerHand.length, 8);

  host.ws.close();
  reconnected.ws.close();
});

test('HTTP health endpoint is available', async t => {
  const app = createServer();
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const port = app.httpServer.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});

console.log('STAGE 2 WEBSOCKET TESTS: READY');
