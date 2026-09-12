/* BET YOUR HAND — authoritative room/session layer. Host is never a player. */
'use strict';
const engine=require('../engine/card-engine');
const ROOM_CODE_LENGTH=4,RECONNECT_TOKEN_LENGTH=24;
function assert(ok,msg){if(!ok)throw new Error(msg)}
function makeCode(rng=Math.random){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<ROOM_CODE_LENGTH;i++)s+=a[Math.floor(rng()*a.length)];return s}
function makeToken(rng=Math.random){const a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let s='';for(let i=0;i<RECONNECT_TOKEN_LENGTH;i++)s+=a[Math.floor(rng()*a.length)];return s}
function safePlayer(p){return{id:p.id,name:p.name,character:p.character,handCount:p.hand.length,points:p.points,shield:p.shield,extraPlay:p.extraPlay}}
class RoomServer{
 constructor({rng=Math.random}={}){this.rng=rng;this.rooms=new Map();this.nextId=1;this.nextRoomNumber=1}
 createRoom(hostName='Host'){let code=makeCode(this.rng);while(this.rooms.has(code)){code=code.slice(0,3)+String(this.nextRoomNumber++%10)}const hostId=`h_${this.nextId++}`,hostToken=makeToken(this.rng);const room={code,hostId,hostName,hostToken,players:new Map(),sockets:new Map(),game:null,started:false};this.rooms.set(code,room);return{code,hostId,hostToken,host:true,name:hostName}}
 getRoom(code){const r=this.rooms.get(String(code||'').toUpperCase());assert(r,'Room not found');return r}
 joinRoom(code,name,character='Bug'){const r=this.getRoom(code);assert(!r.started,'Game already started');assert(r.players.size<engine.MAX_PLAYERS,`Room is full (${engine.MAX_PLAYERS} players maximum)`);assert(typeof name==='string'&&name.trim(),'Player name is required');assert(engine.CHARACTERS.includes(character),'Invalid character');const id=`p_${this.nextId++}`,token=makeToken(this.rng);r.players.set(id,{id,name:name.trim(),character,token,host:false,connected:false});return{code:r.code,playerId:id,reconnectToken:token,host:false,name:name.trim(),character}}
 reconnect(code,id,token){const r=this.getRoom(code);if(id===r.hostId){assert(r.hostToken===token,'Invalid reconnect credentials');return{code:r.code,playerId:r.hostId,host:true,name:r.hostName}}const p=r.players.get(id);assert(p&&p.token===token,'Invalid reconnect credentials');return{code:r.code,playerId:id,host:false,name:p.name,character:p.character}}
 attachSocket(code,id,socket){const r=this.getRoom(code),isHost=id===r.hostId,p=r.players.get(id);assert(isHost||p,'Player not found');const old=r.sockets.get(id);if(old&&old!==socket&&typeof old.close==='function')old.close();r.sockets.set(id,socket);if(p)p.connected=true;return this.snapshot(code,isHost?null:id)}
 detachSocket(code,id,socket){const r=this.getRoom(code);if(r.sockets.get(id)===socket){r.sockets.delete(id);const p=r.players.get(id);if(p)p.connected=false}}
 startGame(code){const r=this.getRoom(code);assert(r.players.size>=engine.MIN_PLAYERS,`Need at least ${engine.MIN_PLAYERS} players to start`);assert(!r.started,'Game already started');r.game=engine.createGame({rng:this.rng,playerIds:[...r.players.keys()]});for(const p of r.game.players){const info=r.players.get(p.id);p.name=info.name;p.character=info.character}r.started=true;return this.snapshot(code)}
 snapshot(code,viewerId=null){const r=this.getRoom(code),g=r.game;return{type:'STATE',roomCode:r.code,started:r.started,hostId:r.hostId,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,character:p.character,connected:p.connected})),game:g?{phase:g.phase,round:g.round,turnPlayerId:engine.currentPlayer(g).id,direction:g.direction,currentColor:engine.currentColor(g),topCard:engine.topCard(g),players:g.players.map(safePlayer),viewerHand:viewerId?(g.players.find(p=>p.id===viewerId)?.hand||[]):undefined,pendingAction:g.pendingAction,wheelResult:g.wheelResult,winnerId:g.winner?.id||null}:null}}
 sendState(code){const r=this.getRoom(code);for(const[id,socket]of r.sockets.entries())if(socket?.send){const viewerId=id===r.hostId?null:id;socket.send(JSON.stringify(this.snapshot(code,viewerId)))}}
}
module.exports={RoomServer,ROOM_CODE_LENGTH,RECONNECT_TOKEN_LENGTH};
