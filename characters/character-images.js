(function(){
  const chars=['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];
  const files={'Bug':'Bug.jpg','Face':'Face.jpg','Ling Ling':'Ling_Ling.jpg','Beanz':'Beanz.jpg','The One':'The_One.jpg','Boone':'Boone.jpg','Chicken Joe':'Chicken_Joe.jpg','Juby':'Juby.jpg','Meemaw':'Meemaw.jpg'};
  function base(){ return location.pathname.indexOf('/bet-your-hand-')===0 ? '/bet-your-hand-/' : '/'; }
  function src(name){ return base() + (files[name] || 'Bug.jpg'); }
  function fixArcadeImages(){
    document.querySelectorAll('.plA').forEach(function(el){
      const name=el.querySelector('.pcA')?.textContent?.trim();
      const image=el.querySelector('img');
      if(name && image) image.src=src(name);
    });
    document.querySelectorAll('.meA').forEach(function(el){
      const name=el.querySelector('small')?.textContent?.trim();
      const image=el.querySelector('img');
      if(name && image) image.src=src(name);
    });
    document.querySelectorAll('.charsA img').forEach(function(image){
      const name=image.getAttribute('title');
      if(name) image.src=src(name);
    });
  }
  function refresh(){
    fixArcadeImages();
    document.querySelectorAll('.charPick').forEach(function(el){
      const name=el.dataset.char||el.dataset.character||el.getAttribute('data-name');
      if(name){ let img=el.querySelector('.charImg'); if(img) img.style.backgroundImage='url("'+src(name)+'")'; }
    });
  }
  const style=document.createElement('style');
  style.textContent='.plA.active:after{content:""!important;box-shadow:inset 0 0 22px #ff7a1f66!important}.plA.active{box-shadow:0 0 24px #ff9a1faa,inset 0 0 18px #ff6a1f44!important}.plA img,.meA img,.charsA img{object-position:center center!important}';
  document.head.appendChild(style);
  window.BYHCharacterImages={chars,src,refresh};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',refresh); else refresh();
  new MutationObserver(refresh).observe(document.documentElement,{subtree:true,childList:true});

  const hostPage=new URLSearchParams(location.search).has('host')||location.hash==='#host';
  if(hostPage){
    const s=document.createElement('script');
    s.src=base()+'host-tv-lobby.js?v=6';
    document.head.appendChild(s);
  }
  const arcade=document.createElement('script');
  arcade.src=base()+'arcade-ui-v2.js?v=5';
  document.head.appendChild(arcade);
  const call=document.createElement('script');
  call.src=base()+'call-button.js?v=3';
  document.head.appendChild(call);
})();
