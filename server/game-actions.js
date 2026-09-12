'use strict';
const engine=require('../engine/card-engine');
function assert(ok,msg){if(!ok)throw new Error(msg)}
function playerFor(room,id){const p=room.game?.players.find(x=>x.id===id);assert(p,'Player is not in the active game');return p}
function finishIfReady(room,p){if(p.hand.length!==0||room.game.pendingAction)return null;const result=engine.finishRound(room.game);room.lastRoundWinnerId=result.roundWinner?.id||null;return result}
function executeGameAction(room,playerId,message){
 assert(room.started&&room.game,'Game has not started');
 const type=String(message.type||'').toUpperCase(),p=playerFor(room,playerId);
 let result;
 if(type==='PLAY_CARD'){
  const index=Number(message.handIndex);assert(Number.isInteger(index),'handIndex must be an integer');result=engine.playCard(room.game,playerId,index);const roundEnd=finishIfReady(room,p);return roundEnd?{...result,roundEnd}:result;
 }
 if(type==='DRAW'){
  assert(engine.currentPlayer(room.game)===p,'It is not this player turn');assert(!engine.hasPlayableCard(room.game,p),'A playable card is already in your hand');const cardsDrawn=engine.drawUntilPlayable(room.game,p);return{type:'DRAW',player:p,cardsDrawn};
 }
 if(type==='CHOOSE_COLOR'){
  result=engine.chooseColor(room.game,playerId,String(message.color||'').toLowerCase());const roundEnd=finishIfReady(room,p);return roundEnd?{...result,roundEnd}:result;
 }
 if(type==='SPIN_WHEEL'){
  result=engine.spinPowerWheel(room.game,playerId);const roundEnd=finishIfReady(room,p);return roundEnd?{...result,roundEnd}:result;
 }
 throw new Error('Unknown game action: '+type);
}
module.exports={executeGameAction};
