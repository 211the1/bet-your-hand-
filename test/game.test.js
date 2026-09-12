const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../engine/card-engine');
const {RoomServer}=require('../server/room-server');
const {executeGameAction}=require('../server/game-actions');

const fixed=()=>0.123456;
function fresh(ids=['a','b']){return engine.createGame({rng:fixed,playerIds:ids});}
function setTurn(g,p,hand,top={type:'CHARACTER',color:'red',character:'Bug'}){g.turnIndex=g.players.indexOf(p);p.hand=hand;g.discard=[top];g.pendingColor=null;g.pendingAction=null;g.wheelResult=null;g.turnBonusAwarded=true;}

test('deck is exactly 108 cards with locked composition',()=>{
 const d=engine.buildDeck(fixed);assert.equal(d.length,108);
 assert.equal(d.filter(c=>c.type==='CHARACTER').length,72);
 assert.equal(d.filter(c=>c.action==='SKIP').length,8);
 assert.equal(d.filter(c=>c.action==='REVERSE').length,8);
 assert.equal(d.filter(c=>c.type==='WILD').length,8);
 assert.equal(d.filter(c=>c.type===engine.SPECIAL).length,12);
});

test('2 through 6 players are valid and host is not a player',()=>{
 for(let n=2;n<=6;n++){const g=fresh(Array.from({length:n},(_,i)=>`p${i}`));assert.equal(g.players.length,n);assert.ok(g.players.every(p=>p.hand.length===8));assert.ok(g.players.every(p=>p.points===500||p.points===650));}
 assert.throws(()=>fresh(['a']),/2-6/);assert.throws(()=>fresh(['a','b','c','d','e','f','g']),/2-6/);
});

test('+150 is awarded only when a turn starts with a playable card',()=>{
 const g=fresh();const p=g.players[0];assert.equal(p.points,650);const q=g.players[1];q.hand=[{type:'CHARACTER',color:'purple',character:'Nope'}];g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}];g.turnIndex=1;g.turnBonusAwarded=false;engine.beginTurn(g);assert.equal(q.points,500);
});

test('color or character matching controls playability',()=>{
 const g=fresh();const p=g.players[0];g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}];assert.equal(engine.isPlayable(g,{type:'CHARACTER',color:'red',character:'Face'}),true);assert.equal(engine.isPlayable(g,{type:'CHARACTER',color:'blue',character:'Bug'}),true);assert.equal(engine.isPlayable(g,{type:'CHARACTER',color:'blue',character:'Face'}),false);assert.equal(engine.isPlayable(g,{type:'WILD',color:'wild',action:'WILD'}),true);assert.equal(engine.isPlayable(g,{type:engine.SPECIAL,color:null,action:engine.SPECIAL}),true);assert.ok(p);
});

test('draw keeps drawing until a playable card exists and gives no turn bonus after forced draw',()=>{
 const g=fresh();const p=g.players[0];p.points=500;p.hand=[{type:'CHARACTER',color:'purple',character:'Face'}];g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}];g.deck=[{type:'CHARACTER',color:'red',character:'The One'}];g.turnIndex=0;g.turnBonusAwarded=false;assert.equal(engine.beginTurn(g).points,500);assert.equal(engine.drawUntilPlayable(g,p),1);assert.equal(p.hand.length,2);assert.equal(p.points,500);
});

test('skip is blocked once by shield',()=>{
 const g=fresh(['a','b','c']),a=g.players[0],b=g.players[1],c=g.players[2];b.shield=true;setTurn(g,a,[{type:'ACTION',color:'red',action:'SKIP'}]);engine.playCard(g,a.id,0);assert.equal(g.turnIndex,1);assert.equal(b.shield,false);assert.equal(g.players[g.turnIndex],b);void c;
});

test('reverse changes direction and acts as skip for two players',()=>{
 const g=fresh(['a','b']),a=g.players[0];setTurn(g,a,[{type:'ACTION',color:'red',action:'REVERSE'}]);engine.playCard(g,a.id,0);assert.equal(g.direction,-1);assert.equal(g.players[g.turnIndex].id,'b');
});

test('wild requires the current player to choose a color',()=>{
 const g=fresh(),a=g.players[0];setTurn(g,a,[{type:'WILD',color:'wild',action:'WILD'}]);const r=engine.playCard(g,a.id,0);assert.equal(r.type,'WILD');assert.equal(g.pendingAction,'WILD_COLOR');engine.chooseColor(g,a.id,'green');assert.equal(g.pendingColor,'green');assert.equal(g.pendingAction,null);
});

test('power wheel has fixed nine assignments and random independent results',()=>{
 assert.equal(engine.POWER_WHEEL.length,9);assert.deepEqual(engine.POWER_WHEEL.map(x=>x.power),['EXTRA PLAY','SHIELD','COLOR CHOICE','EXTRA PLAY','TURN SWITCH','SHIELD','COLOR CHOICE','EXTRA PLAY','TURN SWITCH']);
 const seen=new Set();for(let i=0;i<900;i++){const g=fresh();const p=g.players[0];setTurn(g,p,[{type:engine.SPECIAL,color:null,action:engine.SPECIAL}]);engine.playCard(g,p.id,0);g.rng=()=>i/900;engine.spinPowerWheel(g,p.id);seen.add(g.wheelResult.index)}assert.equal(seen.size,9);
});

test('extra play is consumed after exactly one additional turn',()=>{
 const g=fresh(),a=g.players[0],b=g.players[1];a.extraPlay=true;setTurn(g,a,[{type:'CHARACTER',color:'red',character:'Bug'}]);engine.playCard(g,a.id,0);assert.equal(g.players[g.turnIndex],a);assert.equal(a.extraPlay,false);assert.ok(b);
});

test('final ordinary card ends round without advancing first',()=>{
 const g=fresh(),a=g.players[0];setTurn(g,a,[{type:'CHARACTER',color:'red',character:'Bug'}]);const r=engine.playCard(g,a.id,0);assert.equal(r.type,'ROUND_END_READY');assert.equal(g.turnIndex,0);assert.equal(a.hand.length,0);
});

test('round 1 carries points into round 2 and round 2 produces final winner',()=>{
 const g=fresh();g.players[0].points=1400;g.players[1].points=700;const r1=engine.finishRound(g);assert.equal(r1.nextRound,2);assert.equal(g.round,2);assert.equal(g.players[0].points>=1400,true);g.players[0].points=2000;g.players[1].points=900;const r2=engine.finishRound(g);assert.equal(r2.nextRound,null);assert.equal(g.phase,'finished');assert.equal(g.winner.id,g.players[0].id);
});

test('room allows 2-6 players, keeps host separate, and reconnects',()=>{
 const rooms=new RoomServer({rng:fixed});const host=rooms.createRoom('Host');const players=[];for(let i=0;i<6;i++)players.push(rooms.joinRoom(host.code,`P${i+1}`,'Bug'));
 assert.equal(rooms.getRoom(host.code).players.size,6);assert.equal(rooms.getRoom(host.code).hostId,host.hostId);assert.throws(()=>rooms.joinRoom(host.code,'P7','Bug'),/full/);
 const re=rooms.reconnect(host.code,host.hostId,host.hostToken);assert.equal(re.host,true);const pr=rooms.reconnect(host.code,players[0].playerId,players[0].reconnectToken);assert.equal(pr.playerId,players[0].playerId);
 rooms.startGame(host.code);const snap=rooms.snapshot(host.code,players[0].playerId);assert.equal(snap.game.players.length,6);assert.equal(snap.game.viewerHand.length,8);assert.equal(snap.hostId,host.hostId);
});

test('server actions reject host and invalid player actions and accept real gameplay actions',()=>{
 const rooms=new RoomServer({rng:fixed});const host=rooms.createRoom();const a=rooms.joinRoom(host.code,'A','Bug');const b=rooms.joinRoom(host.code,'B','Face');rooms.startGame(host.code);const room=rooms.getRoom(host.code);assert.throws(()=>executeGameAction(room,host.hostId,{type:'DRAW'}),/active game/);const p=room.game.players.find(x=>x.id===a.playerId);room.game.turnIndex=room.game.players.indexOf(p);p.hand=[{type:'CHARACTER',color:'red',character:'Bug'}];room.game.discard=[{type:'CHARACTER',color:'red',character:'Face'}];room.game.turnBonusAwarded=true;const result=executeGameAction(room,a.playerId,{type:'PLAY_CARD',handIndex:0});assert.ok(result);assert.equal(room.game.turnIndex,1);assert.equal(room.game.players[1].id,b.playerId);
});
