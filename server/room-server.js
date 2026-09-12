/* BET YOUR HAND — Stage 2 room/connection layer.
 * Owns rooms, host/player roles, join/reconnect, and authoritative game state.
 * No UI, character images, or visual design.
 */
'use strict';

const engine = require('../engine/card-engine');

const ROOM_CODE_LENGTH = 4;
const RECONNECT_TOKEN_LENGTH = 24;

function assert(ok, msg) { if (!ok) throw new Error(msg); }

function makeCode(rng = Math.random) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += alphabet[Math.floor(rng() * alphabet.length)];
  return code;
}

function makeToken(rng = Math.random) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < RECONNECT_TOKEN_LENGTH; i++) token += alphabet[Math.floor(rng() * alphabet.length)];
  return token;
}

function safePlayer(p) {
  return {
    id: p.id,
    name: p.name,
    handCount: p.hand.length,
    points: p.points,
    shield: p.shield,
    extraPlay: p.extraPlay
  };
}

class RoomServer {
  constructor({ rng = Math.random } = {}) {
    this.rng = rng;
    this.rooms = new Map();
  }

  createRoom(hostName = 'Host') {
    let code;
    do code = makeCode(this.rng); while (this.rooms.has(code));
    const hostId = `p_${makeToken(this.rng).slice(0, 10)}`;
    const token = makeToken(this.rng);
    const room = {
      code,
      hostId,
      hostName,
      hostToken: token,
      players: new Map(),
      sockets: new Map(),
      game: null,
      started: false
    };
    room.players.set(hostId, { id: hostId, name: hostName, token, host: true, connected: false });
    this.rooms.set(code, room);
    return { code, playerId: hostId, reconnectToken: token };
  }

  getRoom(code) {
    const room = this.rooms.get(String(code || '').toUpperCase());
    assert(room, 'Room not found');
    return room;
  }

  joinRoom(code, name) {
    const room = this.getRoom(code);
    assert(!room.started, 'Game already started');
    assert(room.players.size < engine.MAX_PLAYERS, `Room is full (${engine.MAX_PLAYERS} players maximum)`);
    assert(typeof name === 'string' && name.trim().length > 0, 'Player name is required');
    const playerId = `p_${makeToken(this.rng).slice(0, 10)}`;
    const token = makeToken(this.rng);
    room.players.set(playerId, { id: playerId, name: name.trim(), token, host: false, connected: false });
    return { code: room.code, playerId, reconnectToken: token };
  }

  reconnect(code, playerId, token) {
    const room = this.getRoom(code);
    const player = room.players.get(playerId);
    assert(player && player.token === token, 'Invalid reconnect credentials');
    return { code: room.code, playerId: player.id, host: player.host, name: player.name };
  }

  attachSocket(code, playerId, socket) {
    const room = this.getRoom(code);
    const player = room.players.get(playerId);
    assert(player, 'Player not found');
    const previous = room.sockets.get(playerId);
    if (previous && previous !== socket && typeof previous.close === 'function') previous.close();
    room.sockets.set(playerId, socket);
    player.connected = true;
    return this.snapshot(code, playerId);
  }

  detachSocket(code, playerId, socket) {
    const room = this.getRoom(code);
    if (room.sockets.get(playerId) === socket) {
      room.sockets.delete(playerId);
      const player = room.players.get(playerId);
      if (player) player.connected = false;
    }
  }

  startGame(code) {
    const room = this.getRoom(code);
    assert(room.players.size >= engine.MIN_PLAYERS, `Need at least ${engine.MIN_PLAYERS} players to start`);
    assert(room.players.size <= engine.MAX_PLAYERS, `Cannot exceed ${engine.MAX_PLAYERS} players`);
    assert(!room.started, 'Game already started');
    const ids = [...room.players.keys()];
    room.game = engine.createGame({ rng: this.rng, playerIds: ids });
    room.started = true;
    return this.snapshot(code);
  }

  snapshot(code, viewerId = null) {
    const room = this.getRoom(code);
    const game = room.game;
    return {
      type: 'STATE',
      roomCode: room.code,
      started: room.started,
      hostId: room.hostId,
      players: [...room.players.values()].map(p => ({
        id: p.id, name: p.name, host: p.host, connected: p.connected
      })),
      game: game ? {
        phase: game.phase,
        round: game.round,
        turnPlayerId: engine.currentPlayer(game).id,
        direction: game.direction,
        currentColor: engine.currentColor(game),
        topCard: engine.topCard(game),
        players: game.players.map(safePlayer),
        viewerHand: viewerId ? (game.players.find(p => p.id === viewerId)?.hand || []) : undefined,
        pendingAction: game.pendingAction,
        wheelResult: game.wheelResult,
        winnerId: game.winner?.id || null
      } : null
    };
  }

  broadcast(code, message) {
    const room = this.getRoom(code);
    const raw = JSON.stringify(message);
    for (const socket of room.sockets.values()) {
      if (socket && typeof socket.send === 'function') socket.send(raw);
    }
  }

  sendState(code) {
    const room = this.getRoom(code);
    for (const [playerId, socket] of room.sockets.entries()) {
      if (socket && typeof socket.send === 'function') socket.send(JSON.stringify(this.snapshot(code, playerId)));
    }
  }
}

module.exports = { RoomServer, ROOM_CODE_LENGTH, RECONNECT_TOKEN_LENGTH };
