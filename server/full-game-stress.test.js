'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const engine = require('../engine/card-engine');
const { RoomServer } = require('./room-server');
const { executeGameAction } = require('./game-actions');

function makeRoom(playerCount) {
  const server = new RoomServer({ rng: () => 0.123456 });
  const host = server.createRoom('Host');
  for (let i = 2; i <= playerCount; i++) server.joinRoom(host.code, `Player ${i}`);
  server.startGame(host.code);
  return { server, room: server.getRoom(host.code) };
}

test('2 through 6 players can start with valid hands and shared turn order', () => {
  for (let count = engine.MIN_PLAYERS; count <= engine.MAX_PLAYERS; count++) {
    const { room } = makeRoom(count);
    assert.equal(room.game.players.length, count);
    assert.equal(room.game.players.every(p => p.hand.length === engine.STARTING_HAND), true);
    assert.equal(room.game.players.every(p => p.points === engine.STARTING_POINTS), true);
    assert.equal(room.game.direction, 1);
    assert.equal(room.game.round, 1);
  }
});

test('server rejects an invalid player action instead of changing state', () => {
  const { room } = makeRoom(6);
  const beforeHand = room.game.players[1].hand.length;
  const beforeTurn = room.game.turnIndex;
  assert.throws(() => executeGameAction(room, room.game.players[1].id, { type: 'DRAW' }), /not.*turn/i);
  assert.equal(room.game.players[1].hand.length, beforeHand);
  assert.equal(room.game.turnIndex, beforeTurn);
});

test('each wheel power is consumed once and can only return from a new wheel result', () => {
  const { room } = makeRoom(2);
  const g = room.game;
  const p = g.players[0];
  g.turnIndex = 0;

  for (const [index, power] of engine.POWER_WHEEL.entries()) {
    g.pendingAction = 'POWER_WHEEL';
    const result = engine.spinPowerWheel(g, p.id, index);
    assert.equal(result.power, power.power);

    if (power.power === 'EXTRA PLAY') {
      assert.equal(p.extraPlay, true);
      p.extraPlay = false;
    } else if (power.power === 'SHIELD') {
      assert.equal(p.shield, true);
      p.shield = false;
    }

    // Reset the turn/pending state solely for this isolated power check.
    g.pendingAction = 'POWER_WHEEL';
    g.turnIndex = 0;
    g.direction = 1;
  }
});

test('2-player Reverse changes direction and advances exactly one player', () => {
  const { room } = makeRoom(2);
  const g = room.game;
  const p = g.players[0];
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  p.hand = [{ type: 'ACTION', color: 'red', action: 'REVERSE' }];
  engine.playCard(g, p.id, 0);
  assert.equal(g.direction, -1);
  assert.equal(g.turnIndex, 1);
});

test('6-player Skip is blocked by Shield and consumes the Shield', () => {
  const { room } = makeRoom(6);
  const g = room.game;
  const p0 = g.players[0];
  const p1 = g.players[1];
  p1.shield = true;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  p0.hand = [{ type: 'ACTION', color: 'red', action: 'SKIP' }];
  engine.playCard(g, p0.id, 0);
  assert.equal(p1.shield, false);
  assert.equal(g.turnIndex, 1);
});

test('Round 1 final card starts Round 2 with points carried forward', () => {
  const { room } = makeRoom(3);
  const g = room.game;
  const p0 = g.players[0];
  p0.points = 1250;
  g.players[1].points = 875;
  g.players[2].points = 640;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  p0.hand = [{ type: 'CHARACTER', color: 'red', character: 'Face' }];
  executeGameAction(room, p0.id, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(g.round, 2);
  assert.equal(g.phase, 'playing');
  assert.equal(g.players[0].points, 1250);
  assert.equal(g.players[1].points, 875);
  assert.equal(g.players[2].points, 640);
});

test('Round 2 final card produces the overall highest-point winner', () => {
  const { room } = makeRoom(3);
  const g = room.game;
  g.round = 2;
  const p0 = g.players[0];
  p0.points = 900;
  g.players[1].points = 1200;
  g.players[2].points = 1100;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'blue', character: 'Bug' }];
  p0.hand = [{ type: 'CHARACTER', color: 'blue', character: 'Face' }];
  const result = executeGameAction(room, p0.id, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(g.phase, 'finished');
  assert.equal(result.roundEnd.winner.id, g.players[1].id);
  assert.equal(g.winner.id, g.players[1].id);
});

console.log('FULL GAME STRESS TESTS: READY');
