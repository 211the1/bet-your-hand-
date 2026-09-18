'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../game/engine');

function baseGame(){
  const g=engine.createGame({playerIds:['p1','p2'],rng:()=>0.5});
  g.turnIndex=0;
  g.pending=null;
  return g;
}

test('special cards award their fixed point values',()=>{
  for(const [type,expected] of Object.entries(engine.SPECIAL_POINTS)){
    const g=baseGame();
    const p=g.players[0];
    p.hand=[{id:'test-'+type,type,color:type==='SKIP'||type==='REVERSE'?'Red':null}];
    g.discard=[{id:'top',type:'CHARACTER',color:'Blue',character:'Bug'}];
    g.currentColor='Blue';
    engine.playCard(g,'p1','test-'+type);
    assert.equal(p.points,500+expected,type+' points');
  }
});

test('going out awards the 500 point last-card bonus',()=>{
  const g=baseGame();
  const p=g.players[0];
  p.hand=[{id:'last',type:'CHARACTER',color:'Blue',character:'Bug'}];
  g.discard=[{id:'top',type:'CHARACTER',color:'Blue',character:'Face'}];
  g.currentColor='Blue';
  engine.playCard(g,'p1','last');
  assert.equal(p.points,1000);
  assert.equal(g.phase,'round_complete');
  assert.equal(g.roundWinnerId,'p1');
});

test('a Wild used as the last card gets both its special value and the 500 point bonus',()=>{
  const g=baseGame();
  const p=g.players[0];
  p.hand=[{id:'wild-last',type:'WILD',color:null}];
  g.discard=[{id:'top',type:'CHARACTER',color:'Blue',character:'Bug'}];
  g.currentColor='Blue';
  engine.playCard(g,'p1','wild-last');
  assert.equal(p.points,1200);
  engine.chooseWildColor(g,'p1','Red');
  assert.equal(p.points,1200);
  assert.equal(g.phase,'round_complete');
  assert.equal(g.roundWinnerId,'p1');
});
