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
    let img=waiting.querySelector('.waiting-selected-character');
    const character=getCharacter();
    const src=characterImage[character];
    if(!src){if(img)img.remove();return}
    if(!img){
      img=document.createElement('img');
      img.className='waiting-selected-character';
      img.alt=character;
      waiting.appendChild(img);
    }
    img.src=src;
    img.alt=character;
    img.title=character;
  }
  const style=document.createElement('style');
  style.textContent=`
    body.player-page .waiting-room-recovery{position:relative!important}
    body.player-page .waiting-selected-character{
      position:absolute!important;
      left:50%!important;
      top:36.1%!important;
      transform:translateX(-50%)!important;
      width:28.5%!important;
      height:25.5%!important;
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
