'use strict';
const http=require('http');const fs=require('fs');const path=require('path');const {WebSocketServer}=require('ws');const {RoomServer}=require('./server/room-server');const {executeGameAction}=require('./server/game-actions');
const ROOT=__dirname;
const TYPES={'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
function serveFile(req,res){let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);return res.end('Bad request')}
 if(pathname==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,service:'bet-your-hand',version:'3.1'}))}
 if(pathname==='/')pathname='/index.html';const file=path.normalize(path.join(ROOT,pathname));if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});return res.end('File not found')}
 res.writeHead(200,{'content-type':TYPES[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(file).pipe(res)}
function createServer({roomServer=new RoomServer()}={}){
 const httpServer=http.createServer(serveFile);
 const wss=new WebSocketServer({server:httpServer}),sessions=new Map();
 const send=(ws,m)=>{if(ws.readyState===1)ws.send(JSON.stringify(m))};const fail=(ws,e)=>send(ws,{type:'ERROR',error:e?.message||String(e)});
 wss.on('connection',ws=>{ws.on('message',raw=>{try{const msg=JSON.parse(raw.toString()),type=String(msg.type||'').toUpperCase();let s,room;
  if(type==='PING'){send(ws,{type:'PONG'});return}
  if(type==='CREATE_ROOM'){if(sessions.has(ws))throw new Error('Already connected');s=roomServer.createRoom(msg.name);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'ROOM_CREATED',...s});roomServer.sendState(s.code);return}
  if(type==='JOIN_ROOM'){if(sessions.has(ws))throw new Error('Already connected');s=roomServer.joinRoom(msg.code,msg.name,msg.character);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'ROOM_JOINED',...s});roomServer.sendState(s.code);return}
  if(type==='RECONNECT'){if(sessions.has(ws))throw new Error('Already connected');s=roomServer.reconnect(msg.code,msg.playerId||msg.hostId,msg.reconnectToken||msg.hostToken);sessions.set(ws,s);roomServer.attachSocket(s.code,s.playerId,ws);send(ws,{type:'RECONNECTED',...s});roomServer.sendState(s.code);return}
  s=sessions.get(ws);if(!s)throw new Error('Not connected to a room');room=roomServer.getRoom(s.code);const isHost=s.playerId===room.hostId;
  if(type==='RESET_ROOM'){if(!isHost)throw new Error('Only the host can start over');roomServer.resetRoom(room.code);return}
  if(type==='START_GAME'){if(!isHost)throw new Error('Only the host can start the game');roomServer.startGame(room.code);roomServer.sendState(room.code);return}
  if(type==='CALL_PLAYER'){if(!isHost)throw new Error('Only the host can call players');const target=msg.playerId?room.sockets.get(msg.playerId):null;if(target)send(target,{type:'CALL_PLAYER',playerId:msg.playerId});return}
  if(['PLAY_CARD','DRAW','CHOOSE_COLOR','SPIN_WHEEL'].includes(type)){executeGameAction(room,s.playerId,msg);roomServer.sendState(room.code);return}
  throw new Error('Unknown message type: '+type);
 }catch(e){fail(ws,e)}});ws.on('close',()=>{const s=sessions.get(ws);if(!s)return;try{roomServer.detachSocket(s.code,s.playerId,ws);if(roomServer.rooms.has(s.code))roomServer.sendState(s.code)}catch(_){}sessions.delete(ws)})});
 return{httpServer,wss,roomServer,sessions};
}
if(require.main===module){const app=createServer();app.httpServer.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('Game server ready'))}module.exports={createServer};
