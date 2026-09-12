'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { RoomServer } = require('./room-server');
const { executeGameAction } = require('./game-actions');
const engine = require('../engine/card-engine');

function roomWithTwoPlayers() {
  const server = new RoomServer({ rng: () => 0.1 });
  const host = server.createRoom('Host');
  const player = server.joinRoom(host.code, 'Player 2');
  server.startGame(host.code);
  return { room: server.getRoom(host.code), host, player };
}

test('PLAY_CARD changes the authoritative game state', () => {
  const { room, host } = roomWithTwoPlayers();
  const g = room.game;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  g.players[0].hand = [
    { type: 'CHARACTER', color: 'red', character: 'Face' },
    { type: 'CHARACTER', color: 'blue', character: 'The One' }
  ];
  const result = executeGameAction(room, host.playerId, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(result.type, 'NORMAL');
  assert.equal(g.discard.at(-1).character, 'Face');
  assert.equal(g.turnIndex, 1);
  assert.equal(g.players[0].hand.length, 1);
});

test('DRAW requires no playable card and stops at the first playable card', () => {
  const { room, host } = roomWithTwoPlayers();
  const g = room.game;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  g.players[0].hand = [{ type: 'CHARACTER', color: 'blue', character: 'Face' }];
  g.deck = [{ type: 'CHARACTER', color: 'yellow', character: 'Bug' }];
  const result = executeGameAction(room, host.playerId, { type: 'DRAW' });
  assert.equal(result.cardsDrawn, 1);
  assert.equal(g.players[0].hand.length, 2);
  assert.equal(engine.hasPlayableCard(g, g.players[0]), true);
  assert.throws(() => executeGameAction(room, host.playerId, { type: 'DRAW' }), /playable card/);
});

test('WILD action requires a server-approved color choice', () => {
  const { room, host } = roomWithTwoPlayers();
  const g = room.game;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  g.players[0].hand = [
    { type: 'WILD', color: 'wild', action: 'WILD' },
    { type: 'CHARACTER', color: 'blue', character: 'Face' }
  ];
  const played = executeGameAction(room, host.playerId, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(played.type, 'WILD');
  assert.equal(g.pendingAction, 'WILD_COLOR');
  executeGameAction(room, host.playerId, { type: 'CHOOSE_COLOR', color: 'green' });
  assert.equal(g.pendingAction, null);
  assert.equal(g.currentColor, undefined);
  assert.equal(engine.currentColor(g), 'green');
  assert.equal(g.turnIndex, 1);
});

test('SPECIAL_POWER opens the wheel and the server chooses its outcome', () => {
  const { room, host } = roomWithTwoPlayers();
  const g = room.game;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  g.players[0].hand = [
    { type: engine.SPECIAL, color: null, action: engine.SPECIAL },
    { type: 'CHARACTER', color: 'blue', character: 'Face' }
  ];
  const played = executeGameAction(room, host.playerId, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(played.type, 'SPECIAL_POWER');
  assert.equal(g.pendingAction, 'POWER_WHEEL');
  g.rng = () => 0;
  const result = executeGameAction(room, host.playerId, { type: 'SPIN_WHEEL', forcedIndex: 8 });
  assert.equal(result.character, 'Bug');
  assert.equal(result.power, 'EXTRA PLAY');
  assert.equal(g.players[0].extraPlay, true);
});

test('A final card ends the round and carries points into round 2', () => {
  const { room, host } = roomWithTwoPlayers();
  const g = room.game;
  g.turnIndex = 0;
  g.discard = [{ type: 'CHARACTER', color: 'red', character: 'Bug' }];
  g.players[0].points = 900;
  g.players[0].hand = [{ type: 'CHARACTER', color: 'red', character: 'Face' }];
  g.players[1].points = 700;
  const result = executeGameAction(room, host.playerId, { type: 'PLAY_CARD', handIndex: 0 });
  assert.equal(result.roundEnd.nextRound, 2);
  assert.equal(g.round, 2);
  assert.equal(g.players[0].points, 900);
  assert.equal(g.players[1].points, 700);
});

console.log('STAGE 2 GAME ACTION TESTS: READY');
