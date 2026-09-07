/* BET YOUR HAND — individual high-quality character portraits. No sprite sheet. */
(function(){
const IMG={
  'Bug': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Face': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Ling Ling': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Beanz': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'The One': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Boone': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Chicken Joe': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Juby': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA==',
  'Meemaw': 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA=='
};
const style=document.createElement('style');
style.textContent='.charPick{min-height:auto!important;overflow:hidden!important}.charImg{display:block!important;width:100%!important;height:auto!important;aspect-ratio:1.4/1!important;object-fit:cover!important;object-position:center center!important;border-radius:10px!important;background:none!important;box-shadow:0 0 10px #0008!important;margin-bottom:6px!important}.playerCharImg{display:block!important;width:58px!important;height:58px!important;aspect-ratio:1!important;object-fit:cover!important;object-position:center center!important;background:none!important}';
document.head.appendChild(style);
function apply(){
  document.querySelectorAll('.charPick').forEach(function(b){
    const n=b.querySelector('.charName'); if(!n)return; const ch=n.textContent.trim(); if(!IMG[ch])return;
    let im=b.querySelector('.charImg');
    if(!im){im=document.createElement('img');im.className='charImg';b.insertBefore(im,b.firstChild);}
    if(im.src!==IMG[ch]) im.src=IMG[ch]; im.alt=ch; im.loading='eager'; im.decoding='async';
  });
  document.querySelectorAll('#players .player,#gamePlayers .player').forEach(function(d){
    const smalls=d.querySelectorAll('.small'); if(smalls.length<1)return; const ch=smalls[0].textContent.trim(); if(!IMG[ch])return;
    let im=d.querySelector('.playerCharImg');
    if(!im){im=document.createElement('img');im.className='playerCharImg';d.insertBefore(im,d.firstChild);}
    if(im.src!==IMG[ch]) im.src=IMG[ch]; im.alt=ch; im.loading='eager'; im.decoding='async';
  });
}
window.addEventListener('load',apply); setInterval(apply,700);
})();
