const http = require('http');
const { WebSocketServer } = require('ws');
const { RoomServer } = require('./server/room-server');
const { executeGameAction } = require('./server/game-actions');

function createServer({ roomServer = new RoomServer() } = {}) {
  const httpServer = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'bet-your-hand', stage: 2 }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer });
  const sessions = new Map();
  const send = (ws, msg) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); };
  const error = (ws, err) => send(ws, { type: 'ERROR', error: err.message || String(err) });

  wss.on('connection', ws => {
    ws.on('message', raw => {
      try {
        const msg = JSON.parse(raw.toString());
        const type = String(msg.type || '').toUpperCase();
        let s;
        if (type === 'CREATE_ROOM') {
          if (sessions.has(ws)) throw new Error('Already connected');
          s = roomServer.createRoom(msg.name || 'Host');
          sessions.set(ws, s);
          roomServer.attachSocket(s.code, s.playerId, ws);
          send(ws, { type: 'ROOM_CREATED', ...s });
          roomServer.sendState(s.code);
          return;
        }
        if (type === 'JOIN_ROOM') {
          if (sessions.has(ws)) throw new Error('Already connected');
          s = roomServer.joinRoom(msg.code, msg.name);
          sessions.set(ws, s);
          roomServer.attachSocket(s.code, s.playerId, ws);
          send(ws, { type: 'ROOM_JOINED', ...s });
          roomServer.sendState(s.code);
          return;
        }
        if (type === 'RECONNECT') {
          if (sessions.has(ws)) throw new Error('Already connected');
          s = roomServer.reconnect(msg.code, msg.playerId, msg.reconnectToken);
          s.reconnectToken = msg.reconnectToken;
          sessions.set(ws, s);
          roomServer.attachSocket(s.code, s.playerId, ws);
          send(ws, { type: 'RECONNECTED', ...s });
          roomServer.sendState(s.code);
          return;
        }
        if (type === 'PING') { send(ws, { type: 'PONG' }); return; }
        s = sessions.get(ws);
        if (!s) throw new Error('Not connected to a room');
        const room = roomServer.getRoom(s.code);
        if (type === 'RESET_ROOM') {
          if (s.playerId !== room.hostId) throw new Error('Only the host can start over');
          for (const socket of room.sockets.values()) send(socket, { type: 'RESET_ROOM' });
          for (const [socket, session] of sessions.entries()) {
            if (session.code === room.code) sessions.delete(socket);
          }
          for (const socket of room.sockets.values()) {
            try { socket.close(); } catch (_) {}
          }
          roomServer.rooms.delete(room.code);
          return;
        }
        if (type === 'START_GAME') {
          if (s.playerId !== room.hostId) throw new Error('Only the host can start the game');
          roomServer.startGame(s.code);
          roomServer.sendState(s.code);
          return;
        }
        if (['PLAY_CARD', 'DRAW', 'CHOOSE_COLOR', 'SPIN_WHEEL'].includes(type)) {
          executeGameAction(room, s.playerId, msg);
          roomServer.sendState(s.code);
          return;
        }
        throw new Error('Unknown message type: ' + type);
      } catch (err) { error(ws, err); }
    });
    ws.on('close', () => {
      const s = sessions.get(ws);
      if (!s) return;
      try { roomServer.detachSocket(s.code, s.playerId, ws); roomServer.sendState(s.code); } catch (_) {}
      sessions.delete(ws);
    });
  });
  return { httpServer, wss, roomServer, sessions };
}

if (require.main === module) {
  const app = createServer();
  app.httpServer.listen(Number(process.env.PORT || 10000), '0.0.0.0', () => console.log('BET YOUR HAND server ready'));
}

module.exports = { createServer };
