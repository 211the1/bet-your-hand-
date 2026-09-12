'use strict';
const engine=require('../engine/card-engine');
function assert(ok,msg){if(!ok)throw new Error(msg)}
function playerFor(room,id){const p=room.game?.players.find(x=>x.id===id);assert(p,'Player is not in the active game');return p}
function maybeFinishRound(room,p){if(p.hand.length!==0||room.game.pendingAction)return null;return engine.finishRound(room.game)}
function executeGameAction(room,playerId,message){assert(room.started&&room.game,'Game has not started');const type=String(message.type||'').toUpperCase();const p=playerFor(room,playerId);let result,roundEnd=null;
 if(type==='PLAY_CARD'){const handIndex=Number(message.handIndex);assert(Number.isInteger(handIndex),'handIndex must be an integer');result=engine.playCard(room.game,playerId,handIndex);roundEnd=maybeFinishRound(room,p)}
 else if(type==='DRAW'){assert(engine.currentPlayer(room.game)===p,'It is not this player turn');assert(!engine.hasPlayableCard(room.game,p),'A playable card is already in your hand');const count=engine.drawUntilPlayable(room.game,p);result={type:'DRAW',player:p,cardsDrawn:count}}
 else if(type==='CHOOSE_COLOR'){result=engine.chooseColor(room.game,playerId,String(message.color||'').toLowerCase());roundEnd=maybeFinishRound(room,p)}
 else if(type==='SPIN_WHEEL'){result=engine.spinPowerWheel(room.game,playerId);roundEnd=maybeFinishRound(room,p)}
 else throw new Error('Unknown game action: '+type);
 return roundEnd?{...result,roundEnd}:result}
module.exports={executeGameAction};
