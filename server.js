'use strict';
const http=require('http');
const {WebSocketServer}=require('ws');
const {RoomServer}=require('./server/room-server');
const {executeGameAction}=require('./server/game-actions');

function createServer({roomServer=new RoomServer()}={}){
 const httpServer=http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true,service:'bet-your-hand',version:'clean'}));return}
  res.writeHead(404);res.end();
 });
 const wss=new WebSocketServer({server:httpServer}),sessions=new Map();
 const send=(ws,msg)=>{if(ws.readyState===1)ws.send(JSON.stringify(msg));};
 const fail=(ws,error)=>send(ws,{type:'ERROR',error:error?.message||String(error)});
 wss.on('connection',ws=>{
  ws.on('message',raw=>{
   try{
    const msg=JSON.parse(raw.toString()),type=String(msg.type||'').toUpperCase();let s,room;
    if(type==='PING'){send(ws,{type:'PONG'});return;}
    if(type==='CREATE_ROOM'){
     if(sessions.has(ws))throw new Error('Already connected');s=roomServer.createRoom(msg.name);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'ROOM_CREATED',...s});roomServer.sendState(s.code);return;
    }
    if(type==='JOIN_ROOM'){
     if(sessions.has(ws))throw new Error('Already connected');s=roomServer.joinRoom(msg.code,msg.name,msg.character);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'ROOM_JOINED',...s});roomServer.sendState(s.code);return;
    }
    if(type==='RECONNECT'){
     if(sessions.has(ws))throw new Error('Already connected');s=roomServer.reconnect(msg.code,msg.playerId||msg.hostId,msg.reconnectToken||msg.hostToken);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'RECONNECTED',...s});roomServer.sendState(s.code);return;
    }
    s=sessions.get(ws);if(!s)throw new Error('Not connected to a room');room=roomServer.getRoom(s.code);const isHost=s.playerId===room.hostId;
    if(type==='RESET_ROOM'){if(!isHost)throw new Error('Only the host can start over');roomServer.resetRoom(room.code);return;}
    if(type==='START_GAME'){if(!isHost)throw new Error('Only the host can start the game');roomServer.startGame(room.code);roomServer.sendState(room.code);return;}
    if(['PLAY_CARD','DRAW','CHOOSE_COLOR','SPIN_WHEEL'].includes(type)){executeGameAction(room,s.playerId,msg);roomServer.sendState(room.code);return;}
    throw new Error('Unknown message type: '+type);
   }catch(error){fail(ws,error)}
  });
  ws.on('close',()=>{const s=sessions.get(ws);if(!s)return;try{roomServer.detachSocket(s.code,s.playerId,ws);if(roomServer.rooms.has(s.code))roomServer.sendState(s.code)}catch(_){}sessions.delete(ws)});
 });
 return{httpServer,wss,roomServer,sessions};
}
if(require.main===module){const app=createServer();app.httpServer.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('BET YOUR HAND server ready'));}
module.exports={createServer};
