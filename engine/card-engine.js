'use strict';

// BET YOUR HAND — single authoritative game engine.
// This file owns every game rule. UI/server code must not duplicate rules.

const COLORS = Object.freeze(['red','blue','green','yellow']);
const CHARACTERS = Object.freeze(['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw']);
const POWER_WHEEL = Object.freeze([
  { character:'Bug', power:'EXTRA PLAY' },
  { character:'Face', power:'SHIELD' },
  { character:'Ling Ling', power:'COLOR CHOICE' },
  { character:'Beanz', power:'EXTRA PLAY' },
  { character:'The One', power:'TURN SWITCH' },
  { character:'Boone', power:'SHIELD' },
  { character:'Chicken Joe', power:'COLOR CHOICE' },
  { character:'Juby', power:'EXTRA PLAY' },
  { character:'Meemaw', power:'TURN SWITCH' }
]);
const STARTING_HAND = 8;
const STARTING_POINTS = 500;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const DECK_SIZE = 108;
const SPECIAL = 'SPECIAL_POWER';

function assert(ok, msg){ if(!ok) throw new Error(msg); }
function shuffle(cards, rng=Math.random){
  const a = cards.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function buildDeck(rng=Math.random){
  const deck=[];
  for(const color of COLORS) for(const character of CHARACTERS) for(let copy=0;copy<2;copy++)
    deck.push({type:'CHARACTER',color,character});
  for(const color of COLORS) for(const action of ['SKIP','REVERSE']) for(let copy=0;copy<2;copy++)
    deck.push({type:'ACTION',color,action});
  for(let copy=0;copy<8;copy++) deck.push({type:'WILD',color:'wild',action:'WILD'});
  for(let copy=0;copy<12;copy++) deck.push({type:SPECIAL,color:null,action:SPECIAL});
  assert(deck.length===DECK_SIZE,`Deck must contain ${DECK_SIZE} cards; got ${deck.length}`);
  return shuffle(deck,rng);
}
function createPlayer(id,name=`Player ${id}`){
  return {id,name,hand:[],points:STARTING_POINTS,shield:false,extraPlay:false};
}
function topCard(g){ return g.discard[g.discard.length-1] || null; }
function currentColor(g){ return g.pendingColor || topCard(g)?.color || null; }
function currentPlayer(g){ return g.players[g.turnIndex]; }
function nextIndex(g,steps=1){
  let i=g.turnIndex;
  for(let n=0;n<steps;n++) i=(i+g.direction+g.players.length)%g.players.length;
  return i;
}
function isPlayable(g,card){
  const top=topCard(g);
  if(!top) return true;
  if(card.type==='WILD' || card.type===SPECIAL) return true;
  return card.color===currentColor(g) || (card.character && top.character && card.character===top.character);
}
function hasPlayableCard(g,p){ return p.hand.some(card=>isPlayable(g,card)); }
function reshuffleDiscard(g){
  if(g.discard.length<=1) return;
  const keep=g.discard.pop();
  g.deck=shuffle(g.discard,g.rng);
  g.discard=[keep];
  g.pendingColor=null;
}
function drawOne(g,p){
  if(!g.deck.length) reshuffleDiscard(g);
  if(!g.deck.length) return null;
  const card=g.deck.pop();
  p.hand.push(card);
  return card;
}
function awardTurnBonus(g,p){
  if(g.turnBonusAwarded) return false;
  if(!hasPlayableCard(g,p)) return false;
  p.points+=150;
  g.turnBonusAwarded=true;
  return true;
}
function beginTurn(g){
  g.turnBonusAwarded=false;
  awardTurnBonus(g,currentPlayer(g));
  return currentPlayer(g);
}
function resetRoundHands(g){
  for(const p of g.players){ p.hand=[]; p.shield=false; p.extraPlay=false; }
}
function startRound(g,first=false){
  g.deck=buildDeck(g.rng);
  g.discard=[];
  g.direction=1;
  g.pendingColor=null;
  g.pendingAction=null;
  g.wheelResult=null;
  g.winner=null;
  g.roundWinner=null;
  g.turnBonusAwarded=false;
  resetRoundHands(g);
  for(const p of g.players) for(let n=0;n<STARTING_HAND;n++) drawOne(g,p);
  const opening=g.deck.findIndex(c=>c.color && c.type!=='WILD' && c.type!==SPECIAL);
  assert(opening>=0,'Unable to choose opening card');
  g.discard.push(g.deck.splice(opening,1)[0]);
  g.turnIndex=0;
  if(!first) g.round=2;
  beginTurn(g);
}
function createGame({rng=Math.random,playerIds=[]}={}){
  assert(playerIds.length>=MIN_PLAYERS && playerIds.length<=MAX_PLAYERS,`Game requires ${MIN_PLAYERS}-${MAX_PLAYERS} players`);
  const g={
    rng,players:playerIds.map((id,i)=>createPlayer(id,`Player ${i+1}`)),
    deck:[],discard:[],turnIndex:0,direction:1,round:1,phase:'playing',
    pendingColor:null,pendingAction:null,wheelResult:null,winner:null,roundWinner:null,
    turnBonusAwarded:false
  };
  startRound(g,true);
  return g;
}
function drawUntilPlayable(g,p){
  assert(currentPlayer(g)===p,'It is not this player turn');
  assert(!hasPlayableCard(g,p),'Player already has a playable card');
  let drawn=0;
  while(!hasPlayableCard(g,p)){
    if(!drawOne(g,p)) break;
    drawn++;
    if(drawn>DECK_SIZE) throw new Error('Draw safety limit exceeded');
  }
  return drawn;
}
function advanceTurn(g,p,steps=1){
  if(p.extraPlay){
    p.extraPlay=false;
    beginTurn(g);
    return 'EXTRA_TURN';
  }
  g.turnIndex=nextIndex(g,steps);
  beginTurn(g);
  return 'NORMAL';
}
function applyCardAction(g,p,card){
  if(card.action==='SKIP'){
    const target=g.players[nextIndex(g)];
    if(target.shield){ target.shield=false; return advanceTurn(g,p,1); }
    return advanceTurn(g,p,2);
  }
  if(card.action==='REVERSE'){
    g.direction*=-1;
    if(g.players.length===2) return advanceTurn(g,p,2);
    return advanceTurn(g,p,1);
  }
  return advanceTurn(g,p,1);
}
function playCard(g,playerId,handIndex){
  const p=g.players.find(x=>x.id===playerId);
  assert(p,'Unknown player');
  assert(g.phase==='playing','Game is not playing');
  assert(currentPlayer(g)===p,'It is not this player turn');
  const c=p.hand[handIndex];
  assert(c,'Card not found');
  assert(isPlayable(g,c),'Card is not playable');
  p.hand.splice(handIndex,1);
  g.discard.push({...c});
  g.pendingColor=null;
  g.pendingAction=null;
  g.wheelResult=null;

  // Never advance away from a player who just emptied their hand.
  // The action layer will finish the round after any required resolution.
  if(p.hand.length===0 && c.type!=='WILD' && c.type!==SPECIAL)
    return {type:'ROUND_END_READY',player:p,card:c};

  if(c.type==='WILD'){
    g.pendingAction='WILD_COLOR';
    return {type:'WILD',player:p,card:c};
  }
  if(c.type===SPECIAL){
    g.pendingAction='POWER_WHEEL';
    return {type:'SPECIAL_POWER',player:p,card:c};
  }
  return {type:applyCardAction(g,p,c),player:p,card:c};
}
function chooseColor(g,playerId,color){
  const p=g.players.find(x=>x.id===playerId);
  assert(p,'Unknown player');
  assert(COLORS.includes(color),'Invalid color');
  assert(currentPlayer(g)===p,'It is not this player turn');
  assert(g.pendingAction==='WILD_COLOR'||g.pendingAction==='COLOR_CHOICE','No color choice pending');
  g.pendingColor=color;
  g.pendingAction=null;
  if(p.hand.length===0) return {type:'COLOR_CHOSEN',player:p,color,typeAfter:'ROUND_END_READY'};
  const type=advanceTurn(g,p,1);
  return {type:'COLOR_CHOSEN',player:p,color,typeAfter:type};
}
function spinPowerWheel(g,playerId){
  const p=g.players.find(x=>x.id===playerId);
  assert(p,'Unknown player');
  assert(currentPlayer(g)===p,'It is not this player turn');
  assert(g.pendingAction==='POWER_WHEEL','Power Wheel not pending');
  const i=Math.min(POWER_WHEEL.length-1,Math.floor(g.rng()*POWER_WHEEL.length));
  const result={...POWER_WHEEL[i],index:i};
  g.wheelResult=result;
  g.pendingAction=null;
  if(result.power==='EXTRA PLAY'){
    p.extraPlay=true;
    beginTurn(g);
    return result;
  }
  if(result.power==='SHIELD'){
    p.shield=true;
    if(p.hand.length===0) return result;
    advanceTurn(g,p,1);
    return result;
  }
  if(result.power==='COLOR CHOICE'){
    g.pendingAction='COLOR_CHOICE';
    return result;
  }
  // TURN SWITCH is an immediate, one-time power.
  g.direction*=-1;
  if(p.hand.length===0) return result;
  if(g.players.length===2) advanceTurn(g,p,2); else advanceTurn(g,p,1);
  return result;
}
function finishRound(g){
  g.roundWinner=g.players.reduce((best,p)=>!best||p.points>best.points?p:best,null);
  if(g.round===1){
    startRound(g,false);
    return {roundWinner:g.roundWinner,nextRound:2};
  }
  g.phase='finished';
  g.winner=g.players.reduce((best,p)=>!best||p.points>best.points?p:best,null);
  return {roundWinner:g.roundWinner,winner:g.winner,nextRound:null};
}
module.exports={COLORS,CHARACTERS,POWER_WHEEL,STARTING_HAND,STARTING_POINTS,MIN_PLAYERS,MAX_PLAYERS,DECK_SIZE,SPECIAL,buildDeck,createPlayer,createGame,startRound,topCard,currentColor,currentPlayer,isPlayable,hasPlayableCard,drawOne,drawUntilPlayable,playCard,chooseColor,spinPowerWheel,awardTurnBonus,beginTurn,finishRound};
