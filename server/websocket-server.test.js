const test = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { createServer } = require('../server');

function waitFor(ws, type) {
  return new Promise((resolve, reject) => {
    const onMessage = data => {
      const msg = JSON.parse(data.toString());
      if (msg.type === type) { cleanup(); resolve(msg); }
    };
    const onError = err => { cleanup(); reject(err); };
    const cleanup = () => { ws.off('message', onMessage); ws.off('error', onError); };
    ws.on('message', onMessage); ws.on('error', onError);
  });
}
function connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); ws.once('open', () => resolve(ws)); ws.once('error', reject); }); }

 test('WebSocket create, join, start, private state, and reconnect work', async t => {
  const app = createServer();
  await new Promise(resolve => app.httpServer.listen(0, '127.0.0.1', resolve));
  t.after(() => app.httpServer.close());
  const port = app.httpServer.address().port;
  const url = `ws://127.0.0.1:${port}`;

  const host = await connect(url);
  host.send(JSON.stringify({ type: 'CREATE_ROOM', name: 'Host' }));
  const created = await waitFor(host, 'ROOM_CREATED');
  assert.match(created.code, /^[A-Z2-9]{4}$/);

  const player = await connect(url);
  player.send(JSON.stringify({ type: 'JOIN_ROOM', code: created.code, name: 'Player 2' }));
  const joined = await waitFor(player, 'ROOM_JOINED');
  assert.equal(joined.code, created.code);

  await waitFor(host, 'STATE');
  await waitFor(player, 'STATE');
  host.send(JSON.stringify({ type: 'START_GAME' }));
  const hostState = await waitFor(host, 'STATE');
  const playerState = await waitFor(player, 'STATE');
  assert.equal(hostState.game.players.length, 2);
  assert.equal(playerState.game.players.length, 2);
  assert.equal(hostState.game.viewerHand.length, 8);
  assert.equal(playerState.game.viewerHand.length, 8);
  assert.equal(JSON.stringify(hostState.game.players), JSON.stringify(playerState.game.players));
  assert.notEqual(JSON.stringify(hostState.game.viewerHand), JSON.stringify(playerState.game.viewerHand));

  player.close();
  await new Promise(resolve => player.once('close', resolve));
  const reconnected = await connect(url);
  reconnected.send(JSON.stringify({ type: 'RECONNECT', code: created.code, playerId: joined.playerId, reconnectToken: joined.reconnectToken }));
  const ack = await waitFor(reconnected, 'RECONNECTED');
  assert.equal(ack.playerId, joined.playerId);
  const restored = await waitFor(reconnected, 'STATE');
  assert.equal(restored.game.viewerHand.length, 8);

  host.close(); reconnected.close();
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
