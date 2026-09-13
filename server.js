'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const {RoomServer}=require('./server/room-server');
const e=require('./game/engine');

const root=__dirname,rooms=new RoomServer();
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg'};

function serve(req,res){
  let u;
  try{u=decodeURIComponent(new URL(req.url,'http://x').pathname)}catch{return res.end('Bad request')}
  if(u==='/')u='/client/index.html';
  if(u==='/host')u='/host/index.html';
  const file=path.normalize(path.join(root,u));
  if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}

function send(ws,m){if(ws.readyState===1)ws.send(JSON.stringify(m))}

function createServer(){
  const httpServer=http.createServer(serve);
  const wss=new WebSocketServer({server:httpServer});
  const sessions=new Map();

  wss.on('connection',ws=>{
    ws.on('message',raw=>{
      try{
        const m=JSON.parse(raw),t=String(m.type||'').toUpperCase();
        if(t==='PING')return send(ws,{type:'PONG'});

        let s=sessions.get(ws),r;

        if(t==='CREATE_ROOM'){
          s=rooms.createRoom(m.name);
          sessions.set(ws,s);
          rooms.attach(s.code,s.hostId,ws);
          return send(ws,{type:'ROOM_CREATED',...s});
        }

        if(t==='JOIN_ROOM'){
          s=rooms.joinRoom(m.code,m.name,m.character);
          sessions.set(ws,s);
          rooms.attach(s.code,s.playerId,ws);
          // Confirm identity first, then send STATE so the player's private hand
          // is included with the correct viewerId from the very first state update.
          send(ws,{type:'JOINED',...s});
          return rooms.sendState(s.code);
        }

        if(t==='RECONNECT'){
          s=rooms.reconnect(m.code,m.playerId||m.hostId,m.reconnectToken||m.hostToken);
          sessions.set(ws,s);
          rooms.attach(s.code,s.playerId,ws);
          return rooms.sendState(s.code);
        }

        if(!s)throw Error('Not connected');
        r=rooms.getRoom(s.code);
        const host=s.playerId===r.hostId;

        if(t==='START_GAME'){
          if(!host)throw Error('Host only');
          rooms.startGame(r.code);
          rooms.sendState(r.code);
          return;
        }
        if(t==='CALL_PLAYER'){
          if(!host)throw Error('Host only');
          const q=r.sockets.get(m.playerId);
          if(q)send(q,{type:'CALL_PLAYER',playerId:m.playerId});
          return;
        }
        if(['PLAY_CARD','SPIN_WHEEL','USE_POWER'].includes(t)){
          const g=r.game;
          if(!g)throw Error('Game has not started');
          if(t==='PLAY_CARD')e.playCard(g,s.playerId,m.cardId,{color:m.color});
          if(t==='SPIN_WHEEL')e.spinWheel(g,s.playerId);
          if(t==='USE_POWER')e.usePower(g,s.playerId,m.power,{color:m.color});
          rooms.sendState(r.code);
          return;
        }
        if(t==='ROUND_NEXT'){
          if(!host)throw Error('Host only');
          if(!r.game)throw Error('Game has not started');
          e.completeRound(r.game);
          rooms.sendState(r.code);
          return;
        }
        throw Error('Unknown action');
      }catch(err){
        send(ws,{type:'ERROR',error:err.message||'Server error'});
      }
    });

    ws.on('close',()=>{
      const s=sessions.get(ws);
      if(s)rooms.detach(s.code,s.playerId,ws);
      sessions.delete(ws);
      if(s){try{rooms.sendState(s.code)}catch{}}
    });
  });

  return{httpServer,wss};
}

if(require.main===module)createServer().httpServer.listen(process.env.PORT||10000,'0.0.0.0',()=>console.log('BET YOUR HAND fresh server ready'));
module.exports={createServer};
