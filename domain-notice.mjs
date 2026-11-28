const oldOrigin='https://junior-g-rail.j-kato.chatgpt.site';
const old=location.origin===oldOrigin;
const oldPlay=oldOrigin+'/play/';
const trip=location.hash==='#san-kai';
const collections=document.getElementById('rail-collections');
if(collections){
  collections.textContent=old?'新しい住所へ作品をコピーする':'引っ越し・保存庫を選ぶ';
  collections.hidden=false;
  if(!old){
    const previous=document.createElement('a');
    previous.href=oldPlay+(trip?'#san-kai':'');
    previous.textContent='前の住所のセーブで遊ぶ';
    collections.after(document.createTextNode('　'),previous);
  }
}
const banner=document.getElementById('rail-address-note');
if(banner&&(old||trip)){
  if(old){
    banner.replaceChildren(document.createTextNode('前の住所です。ここに保存した街や電車で、そのまま遊べます。'));
  }else{
    const previous=document.createElement('a');
    previous.href=oldPlay+'#san-kai';
    previous.textContent='前の住所のセーブで特急の旅を遊ぶ';
    banner.replaceChildren(previous);
  }
  const label=document.querySelector('#stage .scene-label');
  if(label){
    label.append(banner);
    banner.style.cssText='position:static;display:block;pointer-events:auto;margin-top:5px;padding:2px 0;text-align:left;background:transparent';
  }
  banner.hidden=false;
}
import('/rail-analytics.mjs?v=20261126').catch(()=>{});
