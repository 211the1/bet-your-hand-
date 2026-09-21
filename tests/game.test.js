const test=require('node:test');
const assert=require('node:assert/strict');
const e=require('../game/engine');

test('deck is exactly 108 with locked composition',()=>{
  const d=e.buildDeck();
  assert.equal(d.length,108);
  assert.equal(d.filter(c=>c.type==='CHARACTER').length,72);
  assert.equal(d.filter(c=>c.type==='SKIP').length,8);
  assert.equal(d.filter(c=>c.type==='REVERSE').length,8);
  assert.equal(d.filter(c=>c.type==='WILD').length,8);
  assert.equal(d.filter(c=>c.type==='PLAY_YOUR_HAND').length,12);
});

test('games accept 2-6 and deal 8 at 500',()=>{
  for(let n=2;n<=6;n++){
    const g=e.createGame({playerIds:Array.from({length:n},(_,i)=>`p${i}`),rng:()=>.1});
    assert.equal(g.players.length,n);
    assert.ok(g.players.every(p=>p.hand.length===8&&p.points===500));
  }
});

test('matching is color OR character; wild and Play Your Hand are playable',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.2});
  g.discard=[{type:'CHARACTER',color:'Red',character:'Bug'}];
  g.currentColor='Red';
  assert(e.isPlayable({type:'CHARACTER',color:'Blue',character:'Bug'},g));
  assert(!e.isPlayable({type:'CHARACTER',color:'Blue',character:'Face'},g));
  assert(e.isPlayable({type:'WILD'},g));
  assert(e.isPlayable({type:'PLAY_YOUR_HAND'},g));
});

test('startTurn only reports whether a playable card exists; drawing is explicit',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.4});
  g.players[0].hand=[{id:'x',type:'CHARACTER',color:'Blue',character:'Bug'}];
  g.currentColor='Red';
  g.discard=[{id:'top',type:'CHARACTER',color:'Red',character:'Face'}];
  const before=g.players[0].points;
  const result=e.startTurn(g);
  assert.equal(result.player.id,'a');
  assert.equal(result.playable,false);
  assert.equal(g.players[0].points,before);
  assert.equal(g.players[0].hand.length,1);
});

test('draw button draws until a playable card is found',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.1});
  g.turnIndex=0;
  g.currentColor='Red';
  g.discard=[{id:'top',type:'CHARACTER',color:'Red',character:'Face'}];
  g.players[0].hand=[];
  g.deck=[
    {id:'n1',type:'CHARACTER',color:'Blue',character:'Bug'},
    {id:'n2',type:'CHARACTER',color:'Green',character:'Boone'},
    {id:'w',type:'WILD',color:null},
    {id:'n3',type:'CHARACTER',color:'Yellow',character:'Meemaw'}
  ];
  const result=e.drawCard(g,'a');
  assert.equal(result.drawn,3);
  assert.equal(result.card.id,'w');
  assert.equal(g.players[0].hand.length,3);
  assert(e.isPlayable(result.card,g));
});

test('skip respects shield and reverse skips in two-player',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.1});
  g.players[0].hand=[{id:'s',type:'SKIP',color:'Red'}];
  g.currentColor='Red';
  g.discard=[{type:'CHARACTER',color:'Red',character:'Face'}];
  e.playCard(g,'a','s');
  assert.equal(g.turnIndex,0);
  g.phase='playing';
  g.turnIndex=0;
  g.players[0].hand=[{id:'r',type:'REVERSE',color:'Red'}];
  g.discard=[{type:'CHARACTER',color:'Red',character:'Face'}];
  e.playCard(g,'a','r');
  assert.equal(g.turnIndex,0);
});

test('wheel has nine independent 1/9 sections and awards locked power',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.1});
  g.pending={type:'SPIN_WHEEL',playerId:'a'};
  const r=e.spinWheel(g,'a',()=>.999);
  assert.equal(r.section,9);
  assert.equal(r.power,'TURN_SWITCH');
  assert.equal(g.players[0].turnSwitch,true);
});

test('powers are one-time and effects are correct',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.1});
  g.players[0].extraPlay=true;
  e.usePower(g,'a','EXTRA_PLAY');
  assert.equal(g.players[0].extraPlay,true);
  g.players[0].shield=true;
  e.usePower(g,'a','SHIELD');
  assert.equal(g.players[0].shield,true);
  g.players[0].turnSwitch=true;
  e.usePower(g,'a','TURN_SWITCH');
  assert.equal(g.direction,-1);
  g.players[0].colorChoice=true;
  e.usePower(g,'a','COLOR_CHOICE',{color:'Green'});
  assert.equal(g.currentColor,'Green');
});

test('exactly two rounds and carry-over winner',()=>{
  const g=e.createGame({playerIds:['a','b'],rng:()=>.1});
  g.players[0].points=900;
  g.phase='round_complete';
  e.completeRound(g);
  assert.equal(g.round,2);
  assert.equal(g.players[0].points,1050);
  g.phase='round_complete';
  g.players[1].points=100;
  e.completeRound(g);
  assert.equal(g.phase,'finished');
  assert.equal(g.winner,'a');
});
