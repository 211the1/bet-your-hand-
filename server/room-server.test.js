'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { RoomServer } = require('./room-server');

function fixedRng() { return 0.1; }

class FakeSocket {
  constructor() { this.messages = []; this.closed = false; }
  send(message) { this.messages.push(JSON.parse(message)); }
  close() { this.closed = true; }
}

test('room creation gives host credentials without creating a player', () => {
  const server = new RoomServer({ rng: Math.random });
  const room = server.createRoom('Host');
  const stored = server.getRoom(room.code);
  assert.equal(room.code.length, 4);
  assert.ok(room.hostId);
  assert.ok(room.hostToken.length === 24);
  assert.equal(stored.hostId, room.hostId);
  assert.equal(stored.players.size, 0);
});

test('room accepts 2 through 6 actual players and rejects the seventh', () => {
  const server = new RoomServer({ rng: Math.random });
  const room = server.createRoom('Host');
  for (let i = 1; i <= 6; i++) server.joinRoom(room.code, `Player ${i}`);
  assert.equal(server.getRoom(room.code).players.size, 6);
  assert.throws(() => server.joinRoom(room.code, 'Player 7'), /Room is full/);
});

test('game cannot start until 2 actual players have joined', () => {
  const server = new RoomServer({ rng: fixedRng });
  const room = server.createRoom('Host');
  assert.equal(server.getRoom(room.code).players.size, 0);
  assert.throws(() => server.startGame(room.code), /at least 2 players/);
  server.joinRoom(room.code, 'Player 1');
  assert.throws(() => server.startGame(room.code), /at least 2 players/);
  server.joinRoom(room.code, 'Player 2');
  assert.doesNotThrow(() => server.startGame(room.code));
});

test('start creates an authoritative game for actual room players only', () => {
  const server = new RoomServer({ rng: fixedRng });
  const room = server.createRoom('Host');
  const p1 = server.joinRoom(room.code, 'Player 1');
  const p2 = server.joinRoom(room.code, 'Player 2');
  const state = server.startGame(room.code);
  assert.equal(state.started, true);
  assert.equal(state.game.round, 1);
  assert.equal(state.game.players.length, 2);
  assert.equal(state.game.players[0].id, p1.playerId);
  assert.equal(state.game.players[1].id, p2.playerId);
  assert.equal(state.game.players[0].handCount, 8);
  assert.equal(state.game.players[1].handCount, 8);
  assert.equal(state.players.some(p => p.id === room.hostId), false);
});

test('host reconnects as host and never becomes a player', () => {
  const server = new RoomServer({ rng: Math.random });
  const room = server.createRoom('Host');
  const identity = server.reconnect(room.code, room.hostId, room.hostToken);
  assert.deepEqual(identity, { code: room.code, playerId: room.hostId, host: true, name: 'Host' });
  assert.equal(server.getRoom(room.code).players.size, 0);
});

test('attach, detach, and reconnect preserve the same player identity', () => {
  const server = new RoomServer({ rng: Math.random });
  const room = server.createRoom('Host');
  const player = server.joinRoom(room.code, 'Player 1');
  const socket1 = new FakeSocket();
  server.attachSocket(room.code, player.playerId, socket1);
  assert.equal(server.getRoom(room.code).players.get(player.playerId).connected, true);
  server.detachSocket(room.code, player.playerId, socket1);
  assert.equal(server.getRoom(room.code).players.get(player.playerId).connected, false);
  const identity = server.reconnect(room.code, player.playerId, player.reconnectToken);
  assert.deepEqual(identity, { code: room.code, playerId: player.playerId, host: false, name: 'Player 1' });
  const socket2 = new FakeSocket();
  const state = server.attachSocket(room.code, player.playerId, socket2);
  assert.equal(state.players.find(p => p.id === player.playerId).connected, true);
});

test('a replacement connection closes the old connection', () => {
  const server = new RoomServer({ rng: Math.random });
  const room = server.createRoom('Host');
  const player = server.joinRoom(room.code, 'Player 1');
  const first = new FakeSocket();
  const second = new FakeSocket();
  server.attachSocket(room.code, player.playerId, first);
  server.attachSocket(room.code, player.playerId, second);
  assert.equal(first.closed, true);
  assert.equal(server.getRoom(room.code).sockets.get(player.playerId), second);
});

test('state keeps host separate and player hand private', () => {
  const server = new RoomServer({ rng: fixedRng });
  const room = server.createRoom('Host');
  const p1 = server.joinRoom(room.code, 'Player 1');
  const p2 = server.joinRoom(room.code, 'Player 2');
  server.startGame(room.code);
  const hostState = server.snapshot(room.code, null);
  const playerState = server.snapshot(room.code, p1.playerId);
  assert.equal(hostState.players.length, 2);
  assert.equal(hostState.players.some(p => p.id === room.hostId), false);
  assert.equal(hostState.game.viewerHand, undefined);
  assert.equal(playerState.game.viewerHand.length, 8);
  assert.equal(playerState.game.players.find(p => p.id === p2.playerId).handCount, 8);
});

test('sendState sends viewer-specific state to players and no player hand to host', () => {
  const server = new RoomServer({ rng: fixedRng });
  const room = server.createRoom('Host');
  const p1 = server.joinRoom(room.code, 'Player 1');
  const p2 = server.joinRoom(room.code, 'Player 2');
  server.startGame(room.code);
  const hostSocket = new FakeSocket();
  const s1 = new FakeSocket();
  const s2 = new FakeSocket();
  server.attachSocket(room.code, room.hostId, hostSocket);
  server.attachSocket(room.code, p1.playerId, s1);
  server.attachSocket(room.code, p2.playerId, s2);
  server.sendState(room.code);
  assert.equal(hostSocket.messages.length, 1);
  assert.equal(s1.messages.length, 1);
  assert.equal(s2.messages.length, 1);
  assert.equal(hostSocket.messages[0].game.viewerHand, undefined);
  assert.equal(s1.messages[0].game.viewerHand.length, 8);
  assert.equal(s2.messages[0].game.viewerHand.length, 8);
  assert.notDeepEqual(s1.messages[0].game.viewerHand, s2.messages[0].game.viewerHand);
});

console.log('STAGE 2 ROOM CONNECTION TESTS: READY');
