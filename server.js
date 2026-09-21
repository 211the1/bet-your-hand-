'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const {RoomServer}=require('./server/room-server');
const e=require('./game/engine');
const root=__dirname,rooms=new RoomServer();
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.mp4':'video/mp4','.webmanifest':'application/manifest+json'};
function serve(req,res){let u;try{u=decodeURIComponent(new URL(req.url,'http://x').pathname)}catch{return res.end('Bad request')}if(u==='/health'){res.writeHead(200,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});return res.end('ok')}if(u==='/')u='/client/index.html';if(u==='/host')u='/host/index.html';const file=path.normalize(path.join(root,u));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store, no-cache, must-revalidate, max-age=0','pragma':'no-cache','expires':'0'});fs.createReadStream(file).pipe(res)}
function send(ws,m){if(ws.readyState===1)ws.send(JSON.stringify(m))}
function makeTestLastCard(g,playerId,type){if(g.phase!=='playing')throw new Error('Start a game before using the last-card test');const p=g.players.find(x=>x.id===playerId);if(!p)throw new Error('Test player not found');const top=e.topCard(g),color=e.currentColor(g)||'Red';let card;if(type==='WILD')card={id:`TEST-WILD-${Date.now()}`,type:'WILD',color:null};else if(type==='PLAY_YOUR_HAND')card={id:`TEST-PLAY-${Date.now()}`,type:'PLAY_YOUR_HAND',color:null};else if(type==='SKIP')card={id:`TEST-SKIP-${Date.now()}`,type:'SKIP',color};else if(type==='REVERSE')card={id:`TEST-REVERSE-${Date.now()}`,type:'REVERSE',color};else if(type==='CHARACTER'){const character=top?.character||'Bug';card={id:`TEST-CHARACTER-${Date.now()}`,type:'CHARACTER',color,character}}else throw new Error('Unknown last-card test');g.round=2;g.phase='playing';g.turnIndex=g.players.indexOf(p);g.direction=1;g.currentColor=top?.color||color;g.pending=null;p.hand=[card];g.lastCardEvent={id:Date.now().toString(36)+'-test-'+Math.random().toString(36).slice(2,8),playerId:p.id};return card}
function makeTestRefill(g){if(g.phase!=='playing')throw new Error('Start a game before using the deck refill test');if(g.deck.length<2)throw new Error('Not enough cards in deck for refill test');const moved=g.deck.splice(0,Math.min(10,g.deck.length));g.discard.push(...moved);g.deck=[];g.pending=null;g.lastCardEvent=null;return moved.length}
function createServer(){const httpServer=http.createServer(serve);const wss=new WebSocketServer({server:httpServer});const sessions=new Map();
 wss.on('connection',ws=>{ws.isAlive=true;ws.on('pong',()=>{ws.isAlive=true});ws.on('message',async raw=>{try{await rooms.ready;const m=JSON.parse(raw),t=String(m.type||'').toUpperCase();if(t==='PING')return send(ws,{type:'PONG'});let s=sessions.get(ws),r;
  if(t==='PREVIEW_ROOM'){const room=await rooms.getRoom(m.code);return send(ws,{type:'ROOM_PREVIEW',code:room.code,players:[...room.players.values()].map(p=>({name:p.name,character:p.character}))})}
  if(t==='CREATE_ROOM'){s=await rooms.createRoom(m.name);sessions.set(ws,s);await rooms.attach(s.code,s.hostId,ws);send(ws,{type:'ROOM_CREATED',...s});return}
  if(t==='JOIN_ROOM'){const room=await rooms.getRoom(m.code);if(room.game)throw Error('Game already started');if([...room.players.values()].some(p=>p.character===m.character))throw Error('Character already taken — choose another');s=await rooms.joinRoom(m.code,m.name,m.character);sessions.set(ws,s);await rooms.attach(s.code,s.playerId,ws);send(ws,{type:'JOINED',...s});return rooms.sendState(s.code)}
  if(t==='RECONNECT'){s=await rooms.reconnect(m.code,m.playerId||m.hostId,m.reconnectToken||m.hostToken);sessions.set(ws,s);await rooms.attach(s.code,s.playerId,ws);send(ws,{type:'RECONNECTED',...s});return send(ws,await rooms.snapshot(s.code,s.playerId))}
  if(!s)throw Error('Not connected');r=await rooms.getRoom(s.code);const host=s.host===true&&s.hostToken===r.hostToken;
  if(t==='START_GAME'){if(!host)throw Error('Host only');await rooms.startGame(r.code);const hostState=await rooms.snapshot(r.code,s.playerId);send(ws,{type:'HOST_GAME_STARTED',...hostState});return rooms.sendState(r.code)}
  if(t==='LEAVE_ROOM'){
    if(s.host===true)throw Error('Host cannot leave from the player screen');
    const code=s.code;
    await rooms.leavePlayer(code,s.playerId,ws);
    sessions.delete(ws);
    // Tell every remaining player immediately. With exactly 2 players,
    // leavePlayer ends the active game and leaves the room open for a new join.
    await rooms.sendState(code);
    send(ws,{type:'LEFT_ROOM'});
    try{ws.close(1000,'Player left room')}catch{}
    return;
  }
  if(t==='RESTART_GAME'){if(!host)throw Error('Host only');const fresh=await rooms.restartGame(r.code);s={...fresh};sessions.set(ws,s);await rooms.attach(fresh.code,fresh.hostId,ws);send(ws,{type:'ROOM_CREATED',...fresh});return rooms.sendState(fresh.code)}
  if(t==='TEST_LAST_CARD'){if(!host)throw Error('Host only');if(!r.game)throw Error('Game has not started');makeTestLastCard(r.game,String(m.playerId),String(m.cardType||'').toUpperCase());await rooms.saveRoom(r.code);return rooms.sendState(r.code)}
  if(t==='TEST_REFILL'){if(!host)throw Error('Host only');if(!r.game)throw Error('Game has not started');makeTestRefill(r.game);await rooms.saveRoom(r.code);return rooms.sendState(r.code)}
  if(t==='SEND_EMOJI'){if(!r.game)throw Error('Game has not started');const allowed=['😂','😈','🤣','😎','🤔','😱','😭','🤦','👀','🔥','💥','👑','🫡','❤️','👍','CUSTOM'];const emoji=String(m.emoji||'');const targetPlayerId=String(m.targetPlayerId||'');if(!allowed.includes(emoji))throw Error('Invalid emoji');if(!targetPlayerId||![...r.players.values()].some(p=>String(p.id)===targetPlayerId))throw Error('Player not found');for(const q of r.sockets.values())send(q,{type:'PLAYER_EMOJI',targetPlayerId,fromPlayerId:s.playerId,emoji});return}
if(t==='CALL_PLAYER'){if(!r.game)throw Error('Game has not started');for(const q of r.sockets.values())send(q,{type:'CALL_PLAYER',playerId:s.playerId});return}
  if(t==='EASTER_EGG'){if(!r.game)throw Error('Game has not started');for(const q of r.sockets.values())send(q,{type:'EASTER_EGG'});return}
  if(t==='CALL_LAST_CARD'){throw Error('LAST CARD is automatic when a player reaches one card')}
  if(t==='LAST_CARD_DONE'){const g=r.game;if(!g)throw Error('Game has not started');if(!g.lastCardEvent||g.lastCardEvent.id!==m.eventId||g.lastCardEvent.playerId!==s.playerId)throw Error('Invalid LAST CARD event');g.lastCardEvent=null;await rooms.saveRoom(r.code);return rooms.sendState(r.code)}
  if(['PLAY_CARD','SPIN_WHEEL','USE_POWER','DRAW_CARD','CHOOSE_COLOR'].includes(t)){const g=r.game;if(!g)throw Error('Game has not started');if(g.lastCardEvent)throw Error('LAST CARD animation is playing');if(t==='PLAY_CARD'){const playedCard=(g.players.find(x=>x.id===s.playerId)?.hand||[]).find(c=>String(c.id)===String(m.cardId));e.playCard(g,s.playerId,m.cardId,{color:m.color});if(playedCard?.type==='PLAY_YOUR_HAND'){for(const q of r.sockets.values())send(q,{type:'PLAY_YOUR_HAND_EVENT',playerId:s.playerId})};const p=g.players.find(x=>x.id===s.playerId);if(g.phase==='playing'&&p?.hand?.length===1&&!g.lastCardEvent){g.lastCardEvent={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),playerId:s.playerId}}}if(t==='SPIN_WHEEL')e.spinWheel(g,s.playerId);if(t==='USE_POWER')e.usePower(g,s.playerId,m.power,{color:m.color});if(t==='DRAW_CARD')e.drawCard(g,s.playerId);if(t==='CHOOSE_COLOR')e.chooseWildColor(g,s.playerId,m.color);if(g.phase==='round_complete')e.completeRound(g);await rooms.saveRoom(r.code);return rooms.sendState(r.code)}
  if(t==='ROUND_NEXT'){if(!host)throw Error('Host only');if(!r.game)throw Error('Game has not started');if(r.game.lastCardEvent)throw Error('LAST CARD animation is playing');e.completeRound(r.game);await rooms.saveRoom(r.code);return rooms.sendState(r.code)}
  throw Error('Unknown action');
 }catch(err){send(ws,{type:'ERROR',error:err.message||'Server error'})}});
 ws.on('close',()=>{const s=sessions.get(ws);if(s)rooms.detach(s.code,s.playerId,ws).then(changed=>{if(changed)return rooms.sendState(s.code)}).catch(()=>{});sessions.delete(ws)})});
 const heartbeat=setInterval(()=>{wss.clients.forEach(ws=>{if(ws.isAlive===false)return ws.terminate();ws.isAlive=false;try{ws.ping()}catch{}})},20000);wss.on('close',()=>{clearInterval(heartbeat);rooms.store.close().catch(()=>{})});return{httpServer,wss}}
if(require.main===module){const port=Number(process.env.PORT)||10000;createServer().httpServer.listen(port,'0.0.0.0',()=>console.log('PLAY YOUR HAND server ready on 0.0.0.0:'+port));}module.exports={createServer};