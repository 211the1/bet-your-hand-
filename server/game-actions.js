'use strict';

/* Authoritative Stage 2 game-action dispatcher.
 * The client may request actions, but the server/engine decides whether they are legal.
 */
const engine = require('../engine/card-engine');

function assert(ok, msg) { if (!ok) throw new Error(msg); }

function playerFor(room, playerId) {
  const p = room.game?.players.find(x => x.id === playerId);
  assert(p, 'Player is not in the active game');
  return p;
}

function executeGameAction(room, playerId, message) {
  assert(room.started && room.game, 'Game has not started');
  const type = String(message.type || '').toUpperCase();
  const p = playerFor(room, playerId);
  let result;

  if (type === 'PLAY_CARD') {
    const handIndex = Number(message.handIndex);
    assert(Number.isInteger(handIndex), 'handIndex must be an integer');
    result = engine.playCard(room.game, playerId, handIndex);
    if (p.hand.length === 0) {
      result = { ...result, roundEnd: engine.finishRound(room.game) };
    }
  } else if (type === 'DRAW') {
    assert(engine.currentPlayer(room.game) === p, 'It is not this player turn');
    assert(!engine.hasPlayableCard(room.game, p), 'A playable card is already in your hand');
    const count = engine.drawUntilPlayable(room.game, p);
    result = { type: 'DRAW', player: p, cardsDrawn: count };
  } else if (type === 'CHOOSE_COLOR') {
    engine.chooseColor(room.game, playerId, String(message.color || '').toLowerCase());
    result = { type: 'COLOR_CHOSEN', player: p, color: room.game.pendingColor || engine.currentColor(room.game) };
  } else if (type === 'SPIN_WHEEL') {
    const forcedIndex = message.forcedIndex === undefined ? null : Number(message.forcedIndex);
    assert(forcedIndex === null || Number.isInteger(forcedIndex), 'forcedIndex must be an integer');
    result = engine.spinPowerWheel(room.game, playerId, forcedIndex);
  } else {
    throw new Error('Unknown game action: ' + type);
  }

  return result;
}

module.exports = { executeGameAction };
