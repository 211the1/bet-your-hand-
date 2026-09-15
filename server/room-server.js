'use strict';
const crypto=require('crypto');
const engine=require('../game/engine');
const {createStore}=require('./persistence');
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(){let s='';for(let i=0;i<4;i++)s+=ALPHABET[crypto.randomInt(ALPHABET.length)] ;return s}
function token(){return crypto.randomBytes(24).toString('hex')}
function toJSON(r){return{code:r.code,hostId:r.hostId,hostName:r.hostName,hostToken:r.hostToken,players:[...r.players.values()],game:r.game}}
function fromJSON(x){return{...x,players:new Map((x.players||[]).map(p=>[p.id,p])),sockets:new Map()}}
class RoomServer{
 constructor(store=createStore()){this.store=store;this.rooms=new Map();this.next=1;this.ready=this.store.init()}
 async saveRoom(c){const r=this.rooms.get(String(c).toUpperCase());if(r)await this.store.set(r.code,toJSON(r));return r}
 async createRoom(name='Host'){
  await this.ready;let c;do{c=code()}while(this.rooms.has(c)||(await this.store.get(c)));
  const r={code:c,hostId:`h${this.next++}`,hostName:String(name||'Host').trim()||'Host',hostToken:token(),players:new Map(),sockets:new Map(),game:null};
  this.rooms.set(c,r);await this.store.set(c,toJSON(r));
  return{code:c,hostId:r.hostId,hostToken:r.hostToken,host:true,name:r.hostName}
 }
 async joinRoom(c,name,character){const r=await this.getRoom(c);if(r.game)throw Error('Game already started');if(r.players.size>=6)throw Error('Room full');if(!String(name||'').trim())throw Error('Player name required');if(!engine.CHARACTERS.includes(character))throw Error('Invalid character');const id=`p${this.next++}`,p={id,name:String(name).trim(),character,token:token(),connected:false};r.players.set(id,p);await this.saveRoom(r.code);return{code:r.code,playerId:id,reconnectToken:p.token,host:false,name:p.name,character:p.character}}
 async getRoom(c){await this.ready;const key=String(c||'').toUpperCase();let r=this.rooms.get(key);if(r)return r;const saved=await this.store.get(key);if(!saved)throw Error('Room not found');r=fromJSON(saved);this.rooms.set(key,r);return r}
 async reconnect(c,id,t){const r=await this.getRoom(c);if(id===r.hostId){if(t!==r.hostToken)throw Error('Invalid reconnect');return{code:r.code,playerId:id,host:true,name:r.hostName,hostToken:t}}const p=r.players.get(id);if(!p||p.token!==t)throw Error('Invalid reconnect');return{code:r.code,playerId:id,reconnectToken:t,host:false,name:p.name,character:p.character}}
 async startGame(c){const r=await this.getRoom(c);if(r.players.size<2)throw Error('Need at least 2 players');r.game=engine.createGame({playerIds:[...r.players.keys()]});for(const p of r.game.players){const info=r.players.get(p.id);p.name=info.name;p.character=info.character}await this.saveRoom(r.code);return this.snapshot(c)}
 async restartGame(c){const r=await this.getRoom(c);for(const [id,s] of r.sockets){if(id!==r.hostId)try{s.close(1000,'Lobby reset')}catch{}}r.players.clear();r.game=null;await this.saveRoom(r.code);return this.snapshot(c)}
 async snapshot(c,viewerId){const r=await this.getRoom(c),g=r.game;return{type:'STATE',roomCode:r.code,started:!!g,hostName:r.hostName,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,character:p.character,connected:p.connected})),game:g?{phase:g.phase,round:g.round,viewerId:viewerId||null,isYourTurn:Boolean(viewerId&&g.phase!=='finished'&&engine.currentPlayer(g)?.id===viewerId),turnPlayerId:g.phase==='finished'?null:engine.currentPlayer(g).id,turnPlayerName:g.phase==='finished'?null:engine.currentPlayer(g).name,direction:g.direction,currentColor:engine.currentColor(g),topCard:engine.topCard(g),discardCount:g.discard.length,players:g.players.map(p=>({id:p.id,name:p.name,character:p.character,handCount:p.hand.length,points:p.points,shield:p.shield,extraPlay:p.extraPlay,colorChoice:p.colorChoice,turnSwitch:p.turnSwitch})),viewerHand:viewerId&&viewerId!==r.hostId?(g.players.find(p=>p.id===viewerId)||{}).hand:undefined,pending:g.pending,wheelResult:g.wheelResult,lastCardEvent:g.lastCardEvent||null,winner:g.winner||null}:null}}
 async sendState(c){const r=await this.getRoom(c);for(const [id,s]of r.sockets)try{if(s.readyState===1)s.send(JSON.stringify(await this.snapshot(c,id)))}catch{}}
 async attach(c,id,s){const r=await this.getRoom(c);r.sockets.set(id,s);if(r.players.has(id))r.players.get(id).connected=true}
 async detach(c,id,s){const r=await this.getRoom(c);if(r.sockets.get(id)===s)r.sockets.delete(id);if(r.players.has(id))r.players.get(id).connected=false}
}
module.exports={RoomServer};
