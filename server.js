const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';
const rooms = new Map();

const COLORS = ['red','blue','green','yellow'];
const CHARS = ['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];

const WHEEL = [
  {name:'Bug',amount:50,color:'Royal Blue'},
  {name:'Face',amount:500,color:'Deep Purple'},
  {name:'Ling Ling',amount:150,color:'Emerald'},
  {name:'Beanz',amount:1000,color:'Gold'},
  {name:'The One',amount:250,color:'Royal Blue'},
  {name:'Boone',amount:550,color:'Emerald'},
  {name:'Chicken Joe',amount:100,color:'Deep Purple'},
  {name:'Juby',amount:1050,color:'Gold'},
  {name:'Meemaw',amount:null,color:'Royal Blue'}
];

const send = (ws,o) => {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(o));
};

function id(){ return Math.random().toString(36).slice(2,12); }
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function makeToken(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
function deck(){
  const d=[];
  for(const color of COLORS) for(const ch of CHARS) for(let i=0;i<2;i++) d.push({color,ch});
  for(const color of COLORS) for(let i=0;i<2;i++) d.push({color,action:'SKIP'});
  for(const color of COLORS) for(let i=0;i<2;i++) d.push({color,action:'REVERSE'});
  for(let i=0;i<8;i++) d.push({color:'wild',action:'WILD'});
  for(let i=0;i<12;i++) d.push({color:null,action:'BET'});
  return shuffle(d);
}
function top(r){ return r.discard[r.discard.length-1]; }
function effectiveColor(r){ return r.pendingColor || top(r)?.color || null; }
function playable(r,c){
  const t=top(r);
  if(!t) return true;
  if(c.action==='BET'||c.action==='WILD') return true;
  if(c.color && c.color===effectiveColor(r)) return true;
  if(c.ch && t.ch && c.ch===t.ch) return true;
  if(c.action && t.action && c.action===t.action && c.action!=='BET') return true;
  return false;
}
function hasPlayable(r,p){ return p.hand.some(c=>playable(r,c)); }
function pub(r){
  return {
    phase:r.phase, round:r.round, turn:r.turn, direction:r.direction, discard:r.discard,
    players:r.players.map(p=>({id:p.id,name:p.name,points:p.points,handCount:p.hand.length,connected:!!p.ws})),
    pending:r.pending ? {type:r.pending.type,playerId:r.pending.playerId,playerName:r.pending.playerName,amount:r.pending.amount,wheel:r.pending.wheel,wheelAmount:r.pending.wheelAmount,winnerId:r.pending.winnerId} : null,
    winner:r.winner||null
  };
}
function log(r,text){
  r.log.unshift(text); if(r.log.length>80) r.log.pop();
  for(const p of r.players) send(p.ws,{type:'log',text});
  send(r.host,{type:'log',text});
}
function broadcast(r){
  send(r.host,{type:'state',state:pub(r),log:r.log});
  for(const p of r.players) send(p.ws,{type:'state',state:pub(r),hand:p.hand,me:p.id,log:r.log});
}
function refill(r){
  if(r.discard.length<=1) return false;
  const keep=r.discard.pop(); r.deck=shuffle(r.discard.splice(0)); r.discard=[keep]; return true;
}
function drawOne(r,p){ if(!r.deck.length&&!refill(r)) return null; const c=r.deck.pop(); if(c)p.hand.push(c); return c; }
function awardStart(r){
  const p=r.players[r.turn];
  if(p&&r.phase==='playing'&&!r.pending&&hasPlayable(r,p)){p.points+=150;log(r,`${p.name} earned +150 for starting with a playable card.`);}
}
function advance(r,steps=1){
  const n=r.players.length; if(!n)return;
  r.turn=(r.turn+r.direction*steps+n*100)%n; r.pendingColor=null; awardStart(r);
}
function deal(r){
  r.deck=deck(); r.discard=[]; r.pending=null; r.pendingColor=null; r.direction=1; r.turn=0; r.winner=null;
  for(const p of r.players){p.hand=[];for(let i=0;i<8;i++)drawOne(r,p);}
  let first=r.deck.pop();
  while(first?.action==='BET'){r.deck.unshift(first);first=r.deck.pop();}
  r.discard.push(first);
}
function start(r){if(r.players.length<2)return false;r.phase='playing';r.round=1;deal(r);log(r,'Round 1 started.');awardStart(r);broadcast(r);return true;}
function start2(r){r.phase='playing';r.round=2;deal(r);log(r,'Round 2 started. Points carry forward.');awardStart(r);broadcast(r);}
function finish(r,w){
  r.phase='roundover';r.winner=w.name;r.pending=null;log(r,`${w.name} won Round ${r.round}.`);broadcast(r);
  if(r.round===1){setTimeout(()=>{if(rooms.has(r.code))start2(r);},2500);}
  else{r.phase='finished';const s=[...r.players].sort((a,b)=>b.points-a.points);r.winner=s[0].name;log(r,`MATCH OVER — ${s[0].name} wins with ${s[0].points} points.`);broadcast(r);}
}
function play(r,p,i){
  if(r.phase!=='playing'||r.pending)return send(p.ws,{type:'toast',text:'Finish the current action first.'});
  if(r.players[r.turn]?.id!==p.id)return send(p.ws,{type:'toast',text:'It is not your turn.'});
  const c=p.hand[i]; if(!c)return;
  if(!playable(r,c))return send(p.ws,{type:'toast',text:'That card cannot be played.'});
  p.hand.splice(i,1);r.discard.push(c);log(r,`${p.name} played ${c.action==='BET'?'BET YOUR HAND':c.action||c.ch}.`);
  if(p.hand.length===0)return finish(r,p);
  if(c.action==='WILD'){
    r.pending={type:'color',playerId:p.id,playerName:p.name};broadcast(r);return;
  }
  if(c.action==='BET'){
    r.pending={type:'bet',playerId:p.id,playerName:p.name,amount:0,challengerId:null};
    log(r,`${p.name} played BET YOUR HAND. Other players have 12 seconds to challenge.`);
    broadcast(r);
    for(const other of r.players){
      if(other.id!==p.id) send(other.ws,{type:'challenge',player:p.name,amount:0});
    }
    setTimeout(()=>betTimeout(r.code),12000);return;
  }
  let steps=1;
  if(c.action==='SKIP')steps=2;
  if(c.action==='REVERSE'){r.direction*=-1;if(r.players.length===2)steps=2;}
  advance(r,steps);broadcast(r);
}
function betTimeout(code){
  const r=rooms.get(code);
  if(!r||!r.pending||r.pending.type!=='bet'||r.pending.challengerId)return;
  const p=r.players.find(x=>x.id===r.pending.playerId);if(!p)return;
  r.pending={type:'color',playerId:p.id,playerName:p.name};
  log(r,`${p.name}'s BET YOUR HAND was not challenged.`);broadcast(r);
}
function challenge(r,p,amount){
  const q=r.pending;
  if(!q||q.type!=='bet')return send(p.ws,{type:'toast',text:'There is no BET YOUR HAND challenge right now.'});
  if(p.id===q.playerId)return send(p.ws,{type:'toast',text:'You cannot challenge your own BET YOUR HAND.'});
  if(q.challengerId)return send(p.ws,{type:'toast',text:'Someone already challenged this hand.'});
  amount=Math.floor(Number(amount)||0);if(amount<1)return send(p.ws,{type:'toast',text:'Choose a point amount.'});
  amount=Math.min(amount,p.points);if(amount<1)return send(p.ws,{type:'toast',text:'Not enough game points.'});
  p.points-=amount;q.challengerId=p.id;q.amount=amount;log(r,`${p.name} challenged ${q.playerName}'s BET YOUR HAND for ${amount} points.`);broadcast(r);setTimeout(()=>resolveChallenge(r.code),1800);
}
function resolveChallenge(code){
  const r=rooms.get(code);if(!r||!r.pending||r.pending.type!=='bet'||!r.pending.challengerId)return;
  const q=r.pending,a=r.players.find(x=>x.id===q.playerId),b=r.players.find(x=>x.id===q.challengerId);if(!a||!b)return;
  const wheel=WHEEL[Math.floor(Math.random()*WHEEL.length)],winner=Math.random()<0.5?a:b;winner.points+=q.amount;
  r.pending={type:'wheel',playerId:winner.id,playerName:winner.name,amount:q.amount,wheel:wheel.name,wheelAmount:wheel.amount,winnerId:winner.id};
  log(r,`BET YOUR HAND wheel landed on ${wheel.name}. ${winner.name} won the challenge.`);broadcast(r);
  setTimeout(()=>{const x=rooms.get(code);if(!x||!x.pending||x.pending.type!=='wheel')return;x.pending=null;advance(x,1);broadcast(x);},3500);
}
function color(r,p,c){
  if(!r.pending||r.pending.type!=='color'||r.pending.playerId!==p.id||!COLORS.includes(c))return send(p.ws,{type:'toast',text:'Choose a valid color.'});
  r.pending=null;r.pendingColor=c;log(r,`${p.name} chose ${c.toUpperCase()}.`);advance(r,1);broadcast(r);
}
function draw(r,p){
  if(r.phase!=='playing'||r.pending)return send(p.ws,{type:'toast',text:'Finish the current action first.'});
  if(r.players[r.turn]?.id!==p.id)return send(p.ws,{type:'toast',text:'It is not your turn.'});
  if(hasPlayable(r,p))return send(p.ws,{type:'toast',text:'You have a playable card. Play it.'});
  let count=0;while(!hasPlayable(r,p)&&count<150){if(!drawOne(r,p))break;count++;}
  log(r,`${p.name} drew ${count} card${count===1?'':'s'} until a playable card was found.`);broadcast(r);
}
function roomCode(){let c;do{c=String(Math.floor(1000+Math.random()*9000));}while(rooms.has(c));return c;}
function create(ws,name){
  const code=roomCode(),token=makeToken();
  const r={code,hostToken:token,host:ws,hostDisconnectedAt:null,hostTimer:null,phase:'lobby',round:1,turn:0,direction:1,players:[],deck:[],discard:[],pending:null,pendingColor:null,winner:null,log:[]};
  ws.role='host';ws.roomCode=code;ws.resumeToken=token;ws.isAlive=true;rooms.set(code,r);
  send(ws,{type:'hostRoom',code,token,state:pub(r)});log(r,`Room ${code} created.`);broadcast(r);
}
function join(ws,code,name){
  const r=rooms.get(code);if(!r)return send(ws,{type:'error',text:'ROOM NOT FOUND. Make sure the host is still connected.'});
  if(r.phase!=='lobby')return send(ws,{type:'error',text:'This game has already started.'});
  if(r.players.length>=6)return send(ws,{type:'error',text:'Room is full.'});
  name=name||'Player';if(r.players.some(p=>p.name.toLowerCase()===name.toLowerCase()))return send(ws,{type:'error',text:'That player name is already in use.'});
  const p={id:id(),token:makeToken(),name,points:500,hand:[],ws,disconnectedAt:null,timer:null};r.players.push(p);
  ws.role='player';ws.roomCode=code;ws.playerId=p.id;ws.resumeToken=p.token;ws.isAlive=true;
  send(ws,{type:'welcome',id:p.id,token:p.token,state:pub(r),hand:p.hand});log(r,`${p.name} joined the game.`);broadcast(r);
}
function resumeHost(ws,code,token){
  const r=rooms.get(code);if(!r||r.hostToken!==token)return send(ws,{type:'error',text:'HOST SESSION EXPIRED. Create a new room.'});
  if(r.hostTimer){clearTimeout(r.hostTimer);r.hostTimer=null;}r.host=ws;r.hostDisconnectedAt=null;ws.role='host';ws.roomCode=code;ws.resumeToken=token;ws.isAlive=true;
  send(ws,{type:'hostResumed',code,token,state:pub(r),log:r.log});log(r,'Host connection restored.');broadcast(r);
}
function resumePlayer(ws,code,token){
  const r=rooms.get(code);if(!r)return send(ws,{type:'error',text:'ROOM SESSION EXPIRED.'});
  const p=r.players.find(x=>x.token===token);if(!p)return send(ws,{type:'error',text:'PLAYER SESSION EXPIRED. Join the room again.'});
  if(p.timer){clearTimeout(p.timer);p.timer=null;}p.ws=ws;p.disconnectedAt=null;ws.role='player';ws.roomCode=code;ws.playerId=p.id;ws.resumeToken=p.token;ws.isAlive=true;
  send(ws,{type:'playerResumed',id:p.id,token,state:pub(r),hand:p.hand,log:r.log});log(r,`${p.name} reconnected.`);broadcast(r);
}
function handle(ws,m){
  if(!m||typeof m!=='object')return;
  if(m.type==='create'){if(!ws.role)create(ws,String(m.name||'Host').trim().slice(0,16));return;}
  if(m.type==='join'){if(!ws.role)join(ws,String(m.code||'').replace(/\D/g,'').slice(0,4),String(m.name||'Player').trim().slice(0,16));return;}
  if(m.type==='resumeHost'){if(!ws.role)resumeHost(ws,String(m.code||''),String(m.token||''));return;}
  if(m.type==='resumePlayer'){if(!ws.role)resumePlayer(ws,String(m.code||''),String(m.token||''));return;}
  const r=rooms.get(ws.roomCode);if(!r)return send(ws,{type:'error',text:'Not connected to a room.'});
  if(ws.role==='host'&&m.type==='start'){if(!start(r))send(ws,{type:'toast',text:'Need at least 2 players to start.'});return;}
  if(ws.role!=='player')return;
  const p=r.players.find(x=>x.id===ws.playerId);if(!p)return;
  if(m.type==='play')play(r,p,Number(m.index));else if(m.type==='draw')draw(r,p);else if(m.type==='bet')challenge(r,p,m.amount);else if(m.type==='color')color(r,p,m.color);
}
function disconnect(ws){
  const r=rooms.get(ws.roomCode);if(!r)return;
  if(ws.role==='host'){
    if(r.host!==ws)return;r.host=null;r.hostDisconnectedAt=Date.now();for(const p of r.players)send(p.ws,{type:'hostDisconnected',text:'HOST CONNECTION LOST — waiting for host to reconnect...'});
    if(r.hostTimer)clearTimeout(r.hostTimer);r.hostTimer=setTimeout(()=>{const x=rooms.get(r.code);if(x&&!x.host){for(const p of x.players)send(p.ws,{type:'error',text:'HOST SESSION EXPIRED. This room has closed.'});rooms.delete(x.code);}},90000);return;
  }
  const p=r.players.find(x=>x.id===ws.playerId);if(!p||p.ws!==ws)return;p.ws=null;p.disconnectedAt=Date.now();send(r.host,{type:'playerDisconnected',playerId:p.id,name:p.name});
  if(p.timer)clearTimeout(p.timer);p.timer=setTimeout(()=>{const x=rooms.get(r.code);if(!x)return;const i=x.players.findIndex(y=>y.id===p.id);if(i>=0&&!x.players[i].ws){const n=x.players[i].name;x.players.splice(i,1);if(x.turn>=x.players.length&&x.players.length)x.turn=0;log(x,`${n} left the game.`);broadcast(x);}},60000);
}

const CLIENT_PATCH=`
<script>
(function(){
  function syncPending(){
    if(!window.state)return;
    var p=window.state.pending;
    var bet=document.getElementById('betPanel');
    var challenge=document.getElementById('challengePanel');
    var color=document.getElementById('colorPanel');
    var wheel=document.getElementById('wheelPanel');
    if(!bet||!challenge||!color||!wheel)return;
    challenge.classList.add('hidden');
    color.classList.add('hidden');
    wheel.classList.add('hidden');
    if(!p)return;
    if(p.type==='bet'){
      if(window.myId===p.playerId){
        bet.classList.add('hidden');
        var label=document.getElementById('myTurnLabel');
        if(label)label.textContent='BET YOUR HAND ACTIVE — WAITING FOR CHALLENGE';
        if(window.toast)toast('BET YOUR HAND is active — waiting 12 seconds for a challenge.');
      }else if(window.mode==='player'){
        var txt=document.getElementById('challengeText');
        if(txt)txt.textContent=p.playerName+' played BET YOUR HAND. Enter fictional game points to challenge.';
        var amt=document.getElementById('challengeAmount');
        if(amt)amt.value='';
        challenge.classList.remove('hidden');
      }
    }else if(p.type==='color'){
      if(window.mode==='player'&&window.myId===p.playerId)color.classList.remove('hidden');
    }else if(p.type==='wheel'){
      var wt=document.getElementById('wheelText');
      if(wt)wt.textContent=p.playerName+' won '+Number(p.amount||0).toLocaleString()+' fictional game points. Wheel: '+(p.wheel||'—')+(p.wheelAmount!=null?' • '+Number(p.wheelAmount).toLocaleString():'');
      wheel.classList.remove('hidden');
    }
  }
  var tries=0;
  var timer=setInterval(function(){
    if(typeof window.render==='function'){
      var old=window.render;
      window.render=function(){old.apply(this,arguments);syncPending();};
      clearInterval(timer);syncPending();
    }
    if(++tries>100)clearInterval(timer);
  },50);
  window.addEventListener('load',function(){setTimeout(syncPending,100);});
})();
</script>`;

const server=http.createServer((req,res)=>{
  let f=req.url==='/'?'/index.html':req.url.split('?')[0];
  const fp=path.join(__dirname,path.normalize(f));
  if(!fp.startsWith(__dirname))return res.end('Bad path');
  fs.readFile(fp,(e,d)=>{
    if(e){res.writeHead(404);return res.end('Not found');}
    let body=d;
    if(path.extname(fp)==='.html'){
      body=Buffer.from(d.toString().replace('</body>',CLIENT_PATCH+'\n</body>'));
    }
    const ext=path.extname(fp);
    const ct=ext==='.html'?'text/html; charset=utf-8':ext==='.js'?'text/javascript':ext==='.css'?'text/css':'application/octet-stream';
    res.writeHead(200,{'Content-Type':ct});res.end(body);
  });
});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{
  ws.role=null;ws.isAlive=true;ws.on('pong',()=>{ws.isAlive=true;});
  ws.on('message',raw=>{try{handle(ws,JSON.parse(raw));}catch(e){send(ws,{type:'error',text:'Invalid message.'});}});
  ws.on('close',()=>{disconnect(ws);});ws.on('error',()=>{});
});
setInterval(()=>{for(const ws of wss.clients){if(ws.isAlive===false){try{ws.terminate();}catch(e){}continue;}ws.isAlive=false;try{ws.ping();}catch(e){}}},25000);
server.listen(PORT,HOST,()=>{console.log(`BET YOUR HAND server on ${HOST}:${PORT}`);});
