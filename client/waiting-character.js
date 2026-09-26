(()=>{
  'use strict';
  const characterImage={
    'Bug':'/Bug.jpg','Face':'/Face.jpg','Ling Ling':'/Ling_Ling.jpg','Beanz':'/Beanz.jpg',
    'The One':'/The_One.jpg','Boone':'/Boone.jpg','Chicken Joe':'/Chicken_Joe.jpg','Juby':'/Juby.jpg','Meemaw':'/Meemaw.jpg'
  };
  function getCharacter(){
    try{return JSON.parse(localStorage.getItem('byhPlayerSession')||'null')?.character||''}catch{return ''}
  }
  function addCharacter(){
    const waiting=document.querySelector('.waiting-room-recovery');
    if(!waiting)return;
    let frame=waiting.querySelector('.waiting-character-frame');
    let img=waiting.querySelector('.waiting-selected-character');
    const character=getCharacter();
    const src=characterImage[character];
    if(!src){if(frame)frame.remove();else if(img)img.remove();return}
    if(!frame){
      frame=document.createElement('div');
      frame.className='waiting-character-frame';
      waiting.appendChild(frame);
    }
    if(!img){
      img=document.createElement('img');
      img.className='waiting-selected-character';
      frame.appendChild(img);
    }else if(img.parentElement!==frame){
      frame.appendChild(img);
    }
    img.src=src;
    img.alt=character;
    img.title=character;
  }
  const style=document.createElement('style');
  style.textContent=`
    body.player-page .waiting-room-recovery{position:relative!important}
    body.player-page .waiting-character-frame{
      position:absolute!important;
      left:50%!important;
      top:28.8%!important;
      transform:translateX(-50%)!important;
      width:47%!important;
      height:40.3%!important;
      box-sizing:border-box!important;
      border:5px solid #ffd21a!important;
      border-radius:30px!important;
      background:linear-gradient(180deg,rgba(4,12,38,.92),rgba(3,8,27,.96))!important;
      box-shadow:0 0 7px #fff,0 0 16px #ffd21a,0 0 34px #ffb300,0 0 60px rgba(255,180,0,.72),inset 0 0 18px rgba(255,210,26,.38)!important;
      z-index:9991!important;
      pointer-events:none!important;
    }
    body.player-page .waiting-character-frame::before{
      content:'';
      position:absolute!important;
      inset:8px!important;
      border:4px solid #ffdf4d!important;
      border-radius:22px!important;
      box-shadow:0 0 9px #ffd21a,inset 0 0 12px rgba(255,210,26,.45)!important;
      pointer-events:none!important;
    }
    body.player-page .waiting-selected-character{
      position:absolute!important;
      left:50%!important;
      top:13.4%!important;
      transform:translateX(-50%)!important;
      width:70.2%!important;
      height:73.2%!important;
      object-fit:cover!important;
      object-position:center center!important;
      border:0!important;
      border-radius:14px!important;
      display:block!important;
      z-index:9992!important;
      pointer-events:none!important;
      box-sizing:border-box!important;
    }
  `;
  document.head.appendChild(style);
  new MutationObserver(addCharacter).observe(document.getElementById('game')||document.body,{childList:true,subtree:true});
  window.addEventListener('storage',addCharacter);
  addCharacter();
})();
