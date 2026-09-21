const test=require('node:test');
const assert=require('node:assert/strict');
const {RoomServer}=require('../server/room-server');

test('room lifecycle: host separate, 2-6 players, reconnect',async()=>{
  const r=new RoomServer();
  await r.ready;
  const h=await r.createRoom('Host');
  assert.equal(h.code.length,4);
  const a=await r.joinRoom(h.code,'A','Bug');
  const b=await r.joinRoom(h.code,'B','Face');
  const room=await r.getRoom(h.code);
  assert.equal(room.players.size,2);
  const reconnected=await r.reconnect(h.code,a.playerId,a.reconnectToken);
  assert.equal(reconnected.playerId,a.playerId);
  const snap=await r.startGame(h.code);
  assert.equal(snap.game.round,1);
  assert.equal(snap.game.players.length,2);
  assert(snap.game.players.every(p=>p.handCount===8));
  await r.store.close();
});

test('host restart creates a fresh waiting room and clears old players',async()=>{
  const r=new RoomServer();
  await r.ready;
  const h=await r.createRoom('Host');
  await r.joinRoom(h.code,'A','Bug');
  await r.joinRoom(h.code,'B','Face');
  await r.startGame(h.code);

  const oldCode=h.code;
  const fresh=await r.restartGame(oldCode);

  assert.equal(fresh.code.length,4);
  assert.notEqual(fresh.code,oldCode);
  assert.equal(fresh.started,undefined);
  assert.equal(fresh.host,true);
  assert.equal(fresh.name,'Host');

  const room=await r.getRoom(fresh.code);
  assert.equal(room.players.size,0);
  assert.equal(room.game,null);

  await assert.rejects(()=>r.getRoom(oldCode),/Room restarted by host|Room not found/);
  await r.store.close();
});
