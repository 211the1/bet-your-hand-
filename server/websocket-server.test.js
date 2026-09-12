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

async function waitForState(queue) { return queue.waitFor('STATE'); }

test('WebSocket host creation, player join, start, private state, and reconnect work', async t => {
  const app = createServer();
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const port = app.httpServer.address().port;
  const url = `ws://127.0.0.1:${port}`;

  const host = await connect(url);
  host.ws.send(JSON.stringify({ type: 'CREATE_ROOM', name: 'Host' }));
  const created = await host.messages.waitFor('ROOM_CREATED');
  assert.match(created.code, /^[A-Z2-9]{4}$/);
  assert.ok(created.hostId);
  assert.ok(created.hostToken);
  const hostLobby = await waitForState(host.messages);
  assert.equal(hostLobby.players.length, 0);

  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  const tooSoon = await host.messages.waitFor('ERROR');
  assert.match(tooSoon.error, /at least 2 players/);

  const player1 = await connect(url);
  player1.ws.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 1' }));
  const joined1 = await player1.messages.waitFor('ROOM_JOINED');
  await waitForState(player1.messages);
  await waitForState(host.messages);

  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  const stillTooSoon = await host.messages.waitFor('ERROR');
  assert.match(stillTooSoon.error, /at least 2 players/);

  const player2 = await connect(url);
  player2.ws.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 2' }));
  const joined2 = await player2.messages.waitFor('ROOM_JOINED');
  await waitForState(player2.messages);
  await waitForState(host.messages);
  await waitForState(player1.messages);

  host.ws.send(JSON.stringify({ type: 'START_GAME' }));
  const hostState = await waitForState(host.messages);
  const player1State = await waitForState(player1.messages);
  const player2State = await waitForState(player2.messages);
  assert.equal(hostState.game.players.length, 2);
  assert.equal(player1State.game.players.length, 2);
  assert.equal(player2State.game.players.length, 2);
  assert.equal(hostState.game.viewerHand, undefined);
  assert.equal(player1State.game.viewerHand.length, 8);
  assert.equal(player2State.game.viewerHand.length, 8);
  assert.equal(JSON.stringify(hostState.game.players), JSON.stringify(player1State.game.players));
  assert.equal(JSON.stringify(player1State.game.players), JSON.stringify(player2State.game.players));
  assert.notEqual(JSON.stringify(player1State.game.viewerHand), JSON.stringify(player2State.game.viewerHand));
  assert.equal(hostState.players.length, 2);
  assert.equal(hostState.players.some(p => p.id === created.hostId), false);

  const closed = new Promise(resolve => player1.ws.once('close', resolve));
  player1.ws.close();
  await closed;

  const reconnected = await connect(url);
  reconnected.ws.send(JSON.stringify({
    type: 'RECONNECT',
    code: created.code,
    playerId: joined1.playerId,
    reconnectToken: joined1.reconnectToken
  }));
  const ack = await reconnected.messages.waitFor('RECONNECTED');
  assert.equal(ack.playerId, joined1.playerId);
  assert.equal(ack.host, false);
  const restored = await waitForState(reconnected.messages);
  assert.equal(restored.game.viewerHand.length, 8);

  host.ws.close();
  player2.ws.close();
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
