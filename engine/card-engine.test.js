'use strict';
const assert=require('node:assert/strict');
const e=require('./card-engine');

// Exact deck composition.
{ const d=e.buildDeck(()=>0.999999); assert.equal(d.length,108); assert.equal(d.filter(c=>c.type==='CHARACTER').length,72); assert.equal(d.filter(c=>c.action==='SKIP').length,8); assert.equal(d.filter(c=>c.action==='REVERSE').length,8); assert.equal(d.filter(c=>c.type==='WILD').length,8); assert.equal(d.filter(c=>c.type===e.SPECIAL).length,12); }

// 2–6 players, and starting hands/points.
for(let n=2;n<=6;n++){const g=e.createGame({playerIds:Array.from({length:n},(_,i)=>i+1)});assert.equal(g.players.length,n);assert.ok(g.players.every(p=>p.hand.length===8));assert.ok(g.players.every(p=>p.points===500));assert.equal(g.discard.length,1)}
assert.throws(()=>e.createGame({playerIds:[1]})); assert.throws(()=>e.createGame({playerIds:[1,2,3,4,5,6,7]}));

// Color/character matching plus universal special cards.
{ const g=e.createGame({playerIds:[1,2]}); g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; assert.equal(e.isPlayable(g,{type:'CHARACTER',color:'red',character:'Face'}),true); assert.equal(e.isPlayable(g,{type:'CHARACTER',color:'blue',character:'Bug'}),true); assert.equal(e.isPlayable(g,{type:'CHARACTER',color:'blue',character:'Face'}),false); assert.equal(e.isPlayable(g,{type:'WILD',color:'wild',action:'WILD'}),true); assert.equal(e.isPlayable(g,{type:e.SPECIAL,color:null,action:e.SPECIAL}),true); }

// +150 only when a playable card exists at turn start.
{ const g=e.createGame({playerIds:[1,2]}); const p=e.currentPlayer(g); p.hand=[{type:'CHARACTER',color:e.currentColor(g),character:'Face'}]; p.points=500; e.beginTurn(g); assert.equal(p.points,650); const q=g.players[1]; q.hand=[{type:'CHARACTER',color:'blue',character:'Face'}]; g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; g.turnIndex=1; q.points=500; e.beginTurn(g); assert.equal(q.points,500); }

// Draw stops at the first playable card and uses the same rule as play.
{ const g=e.createGame({playerIds:[1,2]}); const p=e.currentPlayer(g); g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; p.hand=[{type:'CHARACTER',color:'blue',character:'Face'}]; g.deck=[{type:'WILD',color:'wild',action:'WILD'},{type:'CHARACTER',color:'yellow',character:'Bug'}]; assert.equal(e.drawUntilPlayable(g,p),1); assert.ok(e.hasPlayableCard(g,p)); }

// Skip and shield.
{ const g=e.createGame({playerIds:[1,2,3]}); g.turnIndex=0; g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; g.players[0].hand=[{type:'ACTION',color:'red',action:'SKIP'}]; e.playCard(g,1,0); assert.equal(g.turnIndex,2); const h=e.createGame({playerIds:[1,2,3]}); h.turnIndex=0; h.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; h.players[0].hand=[{type:'ACTION',color:'red',action:'SKIP'}]; h.players[1].shield=true; e.playCard(h,1,0); assert.equal(h.turnIndex,1); assert.equal(h.players[1].shield,false); }

// Reverse and two-player behavior.
{ const g=e.createGame({playerIds:[1,2,3]}); g.turnIndex=0; g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; g.players[0].hand=[{type:'ACTION',color:'red',action:'REVERSE'}]; e.playCard(g,1,0); assert.equal(g.direction,-1); assert.equal(g.turnIndex,2); const h=e.createGame({playerIds:[1,2]}); h.turnIndex=0; h.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; h.players[0].hand=[{type:'ACTION',color:'red',action:'REVERSE'}]; e.playCard(h,1,0); assert.equal(h.direction,-1); assert.equal(h.turnIndex,1); }

// Wild color choice.
{ const g=e.createGame({playerIds:[1,2]}); g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; g.players[0].hand=[{type:'WILD',color:'wild',action:'WILD'}]; e.playCard(g,1,0); assert.equal(g.pendingAction,'WILD_COLOR'); assert.equal(g.turnIndex,0); e.chooseColor(g,1,'green'); assert.equal(g.pendingColor,'green'); assert.equal(g.turnIndex,1); }

// Special card opens the wheel.
{ const g=e.createGame({playerIds:[1,2]}); g.players[0].hand=[{type:e.SPECIAL,color:null,action:e.SPECIAL}]; e.playCard(g,1,0); assert.equal(g.pendingAction,'POWER_WHEEL'); }

// Nine wheel slots and locked power order.
assert.equal(e.POWER_WHEEL.length,9); assert.deepEqual(e.POWER_WHEEL.map(x=>x.power),['EXTRA PLAY','SHIELD','COLOR CHOICE','EXTRA PLAY','TURN SWITCH','SHIELD','COLOR CHOICE','EXTRA PLAY','TURN SWITCH']);

// Test each power by forcing the wheel index.
{ const g=e.createGame({playerIds:[1,2,3]}); for(const i of [0,3,7]){g.turnIndex=0;g.pendingAction='POWER_WHEEL';g.players[0].extraPlay=false;e.spinPowerWheel(g,1,i);assert.equal(g.players[0].extraPlay,true);g.players[0].extraPlay=false} g.turnIndex=0;g.pendingAction='POWER_WHEEL';e.spinPowerWheel(g,1,1);assert.equal(g.players[0].shield,true);g.turnIndex=0;g.pendingAction='POWER_WHEEL';e.spinPowerWheel(g,1,2);assert.equal(g.pendingAction,'COLOR_CHOICE');g.turnIndex=0;g.pendingAction='POWER_WHEEL';e.spinPowerWheel(g,1,4);assert.equal(g.direction,-1); }

// Extra Play is consumed after the extra action.
{ const g=e.createGame({playerIds:[1,2,3]}); const p=g.players[0]; g.turnIndex=0; p.extraPlay=true; g.discard=[{type:'CHARACTER',color:'red',character:'Bug'}]; p.hand=[{type:'CHARACTER',color:'red',character:'Face'}]; e.playCard(g,1,0); assert.equal(p.extraPlay,false); assert.equal(g.turnIndex,0); }

// Round 2 carries points; final winner is highest total.
{ const g=e.createGame({playerIds:[1,2]}); g.players[0].points=900; g.players[1].points=700; const r1=e.finishRound(g); assert.equal(r1.nextRound,2); assert.equal(g.round,2); assert.deepEqual(g.players.map(p=>p.points),[900,700]); g.players[1].points=1200; const r2=e.finishRound(g); assert.equal(r2.nextRound,null); assert.equal(g.phase,'finished'); assert.equal(g.winner.id,2); }

console.log('STAGE 1 CARD ENGINE TESTS: PASS');
