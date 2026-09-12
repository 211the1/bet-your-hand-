'use strict';
const engine=require('../engine/card-engine');
const ROOM_CODE_LENGTH=4,RECONNECT_TOKEN_LENGTH=32;
function assert(ok,msg){if(!ok)throw new Error(msg)}
function makeCode(rng=Math.random){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';for(let i=0;i<ROOM_CODE_LENGTH;i++)out+=chars[Math.floor(rng()*chars.length)];return out}
function makeToken(rng=Math.random){const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let out='';for(let i=0;i<RECONNECT_TOKEN_LENGTH;i++)out+=chars[Math.floor(rng()*chars.length)];return out}
function publicPlayer(p){return{id:p.id,name:p.name,character:p.character,connected:p.connected}};
function publicGamePlayer(p){return{id:p.id,name:p.name,character:p.character,handCount:p.hand.length,points:p.points,shield:p.shield,extraPlay:p.extraPlay}};
class RoomServer{
 constructor({rng=Math.random}={}){this.rng=rng;this.rooms=new Map();this.nextId=1}
 createRoom(hostName='Host'){
  let code=makeCode(this.rng);while(this.rooms.has(code))code=makeCode(this.rng);
  const hostId=`h_${this.nextId++}`,hostToken=makeToken(this.rng);
  const room={code,hostId,hostName:String(hostName||'Host').trim()||'Host',hostToken,players:new Map(),sockets:new Map(),game:null,started:false,lastRoundWinnerId:null};
  this.rooms.set(code,room);return{code,hostId,hostToken,host:true,name:room.hostName};
 }
 getRoom(code){const room=this.rooms.get(String(code||'').trim().toUpperCase());assert(room,'Room not found');return room}
 joinRoom(code,name,character='Bug'){
  const room=this.getRoom(code);assert(!room.started,'Game already started');assert(room.players.size<engine.MAX_PLAYERS,`Room is full (${engine.MAX_PLAYERS} players maximum)`);assert(typeof name==='string'&&name.trim(),'Player name is required');assert(engine.CHARACTERS.includes(character),'Invalid character');
  const id=`p_${this.nextId++}`,token=makeToken(this.rng),player={id,name:name.trim(),character,token,host:false,connected:false};room.players.set(id,player);
  return{code:room.code,playerId:id,reconnectToken:token,host:false,name:player.name,character:player.character};
 }
 reconnect(code,id,token){
  const room=this.getRoom(code);if(id===room.hostId){assert(token===room.hostToken,'Invalid reconnect credentials');return{code:room.code,playerId:room.hostId,host:true,hostId:room.hostId,name:room.hostName,hostToken:room.hostToken}};
  const p=room.players.get(id);assert(p&&p.token===token,'Invalid reconnect credentials');return{code:room.code,playerId:p.id,reconnectToken:p.token,host:false,name:p.name,character:p.character};
 }
 attachSocket(code,id,socket){
  const room=this.getRoom(code),isHost=id===room.hostId,p=room.players.get(id);assert(isHost||p,'Player not found');
  const old=room.sockets.get(id);if(old&&old!==socket&&typeof old.close==='function'){try{old.close()}catch(_){} }
  room.sockets.set(id,socket);if(p)p.connected=true;
 }
 detachSocket(code,id,socket){const room=this.getRoom(code);if(room.sockets.get(id)===socket){room.sockets.delete(id);const p=room.players.get(id);if(p)p.connected=false}}
 startGame(code){
  const room=this.getRoom(code);assert(!room.started,'Game already started');assert(room.players.size>=engine.MIN_PLAYERS,`Need at least ${engine.MIN_PLAYERS} players to start`);
  room.game=engine.createGame({rng:this.rng,playerIds:[...room.players.keys()]});for(const p of room.game.players){const info=room.players.get(p.id);p.name=info.name;p.character=info.character}room.started=true;return this.snapshot(code);
 }
 snapshot(code,viewerId=null){
  const room=this.getRoom(code),g=room.game;
  return{type:'STATE',roomCode:room.code,started:room.started,hostId:room.hostId,players:[...room.players.values()].map(publicPlayer),game:g?{
   phase:g.phase,round:g.round,turnPlayerId:g.phase==='finished'?null:engine.currentPlayer(g).id,direction:g.direction,currentColor:engine.currentColor(g),topCard:engine.topCard(g),
   players:g.players.map(publicGamePlayer),viewerHand:viewerId?(g.players.find(p=>p.id===viewerId)?.hand||[]):undefined,
   pendingAction:g.pendingAction,wheelResult:g.wheelResult,winnerId:g.winner?.id||null,roundWinnerId:room.lastRoundWinnerId
  }:null};
 }
 sendState(code){const room=this.getRoom(code);for(const[id,socket]of room.sockets.entries())if(socket?.readyState===1||typeof socket?.send==='function'){const viewerId=id===room.hostId?null:id;try{socket.send(JSON.stringify(this.snapshot(code,viewerId)))}catch(_){} }}
 resetRoom(code){const room=this.getRoom(code);for(const socket of room.sockets.values())try{socket.send(JSON.stringify({type:'RESET_ROOM'}))}catch(_){};for(const socket of room.sockets.values())try{socket.close()}catch(_){};this.rooms.delete(room.code);return true}
}
module.exports={RoomServer,ROOM_CODE_LENGTH,RECONNECT_TOKEN_LENGTH};
