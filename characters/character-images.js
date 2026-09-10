/* BET YOUR HAND — approved character photos */
(function(){
  const chars=['Bug','Face','Ling Ling','Beanz','The One','Boone','Chicken Joe','Juby','Meemaw'];
  const files={
    'Bug':'Bug.jpg','Face':'Face.jpg','Ling Ling':'Ling_Ling.jpg','Beanz':'Beanz.jpg',
    'The One':'The_One.jpg','Boone':'Boone.jpg','Chicken Joe':'Chicken_Joe.jpg',
    'Juby':'Juby.jpg','Meemaw':'Meemaw.jpg'
  };
  function base(){ return location.pathname.indexOf('/bet-your-hand-')===0 ? '/bet-your-hand-/' : '/'; }
  function src(name){ return base() + (files[name] || 'Bug.jpg'); }
  function addPhoto(parent,name,cls){
    if(!parent || !name) return;
    let img=parent.querySelector('.'+cls);
    if(!img){ img=document.createElement('div'); img.className=cls; parent.prepend(img); }
    img.style.backgroundImage='url("'+src(name)+'")';
    img.style.backgroundSize='cover';
    img.style.backgroundPosition='center center';
    img.style.backgroundRepeat='no-repeat';
    img.setAttribute('aria-label',name);
  }
  function refresh(){
    document.querySelectorAll('.charPick').forEach(function(el){
      const name=el.dataset.char||el.dataset.character||el.getAttribute('data-name');
      if(name) addPhoto(el,name,'charImg');
    });
    document.querySelectorAll('[data-character]').forEach(function(el){
      if(el.classList.contains('charPick')) return;
      const name=el.dataset.character;
      if(name) addPhoto(el,name,'playerCharImg');
    });
  }
  const style=document.createElement('style');
  style.textContent='.charImg,.playerCharImg{display:block;width:100%;aspect-ratio:1/1;min-height:0;border-radius:12px;overflow:hidden;background-color:#111;background-position:center center;background-repeat:no-repeat;background-size:cover}.charImg{margin-bottom:6px}.playerCharImg{width:72px;height:72px;flex:0 0 72px}';
  document.head.appendChild(style);
  window.BYHCharacterImages={chars,src,refresh};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',refresh); else refresh();
  new MutationObserver(refresh).observe(document.documentElement,{subtree:true,childList:true});

  const hostPage=new URLSearchParams(location.search).has('host')||location.hash==='#host';
  if(hostPage){
    const s=document.createElement('script');
    s.src=base()+'host-tv-lobby.js?v=5';
    document.head.appendChild(s);
  }

  const arcade=document.createElement('script');
  arcade.src=base()+'arcade-ui-v2.js?v=4';
  document.head.appendChild(arcade);
  const call=document.createElement('script');
  call.src=base()+'call-button.js?v=2';
  document.head.appendChild(call);
})();
