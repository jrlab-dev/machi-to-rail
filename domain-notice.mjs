const old=location.origin==='https://junior-g-rail.j-kato.chatgpt.site';
const link=document.getElementById('rail-collections');
if(link){link.textContent=old?'新しい住所へ作品を引っ越す':'引っ越し・保存庫を選ぶ';link.hidden=false;}
const banner=document.getElementById('rail-address-note');
if(old&&banner)banner.hidden=false;
