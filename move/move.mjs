import {oldOrigin,newOrigin,validateBundle,acceptCollection,listCollections} from '../play/collection-store.mjs';
import {checkCollection} from './check-collection.mjs';
import {snapshot} from './transfer.mjs';
const el=id=>document.getElementById(id),say=message=>{el('status').textContent=message;};
const receive=location.origin===newOrigin,send=location.origin===oldOrigin;
const channel='rail-collection-transfer-v1';
let child=null,nonce='',pending=null,sending=false;
const describe=bundle=>{
 const values=bundle.values,parse=key=>JSON.parse(values[key]||'null');
 const library=parse('rail-train-library-v2')||parse('rail-train-library-v1');
 return '街 '+Object.keys(parse('rail-town-slots-v1')?.slots||{}).length+'枠・保存した電車 '+(library?.items?.length??library?.length??0)+'台';
};
function offer(data){
 pending=null;el('review').hidden=true;
 const bundle=validateBundle(data);
 el('summary').textContent=describe(bundle);pending=bundle;el('review').hidden=false;
 say('内容を確認して「この作品を受け取る」を押してください。');
}
async function refresh(){
 const ids=await listCollections();
 el('collections').replaceChildren(...ids.map(id=>{
  const item=document.createElement('li'),link=document.createElement('a');
  link.href='/play/?collection='+id;link.textContent='引っ越した保存庫 '+id.slice(0,8);item.append(link);return item;
 }));
}
if(send){
 el('send').hidden=false;
 el('start').onclick=()=>{
  nonce=crypto.randomUUID();sending=false;
  child=window.open(newOrigin+'/move/#'+nonce,'_blank');
  say(child?'新住所の受け取り画面を開いています。つながらない場合はファイルで運べます。':'新しいタブが開けませんでした。下のボタンで全作品をファイルに保存してください。');
 };
 el('download').onclick=async()=>{
  try{
   const bundle=await snapshot(),url=URL.createObjectURL(new Blob([JSON.stringify(bundle)],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='まちとレール_全作品.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);say('全作品ファイルを作りました。新しい住所で読み込めます。');
  }catch(e){say(e.message);}
 };
 window.addEventListener('message',async event=>{
  if(!child||event.source!==child||event.origin!==newOrigin||event.data?.channel!==channel||event.data.nonce!==nonce)return;
  if(event.data.type==='accepted'){say('新しい住所で受け取りました。旧住所の作品も残っています。');return;}
  if(event.data.type!=='ready'||sending)return;
  const target=child,token=nonce;sending=true;
  try{const bundle=await snapshot();if(target!==child||token!==nonce)return;target.postMessage({channel,nonce:token,type:'bundle',bundle},newOrigin);say('新しい住所の画面で受け取りを確認してください。');}
  catch(e){if(target===child){say(e.message);target.postMessage({channel,nonce:token,type:'failed'},newOrigin);}}
 });
}else if(receive){
 el('receive').hidden=false;refresh().catch(e=>say(e.message));
 const token=location.hash.slice(1),originWindow=window.opener;
 let cameFromTab=false;
 if(originWindow&&/^[a-f0-9-]{36}$/.test(token)){
  window.addEventListener('message',event=>{
   if(event.origin!==oldOrigin||event.source!==originWindow||event.data?.channel!==channel||event.data.nonce!==token)return;
   if(event.data.type==='failed'){say('旧住所で作品を読み取れませんでした。旧住所の案内を確認してください。');return;}
   if(event.data.type==='bundle')try{offer(event.data.bundle);cameFromTab=true;}catch(e){say(e.message);}
  });
  originWindow.postMessage({channel,nonce:token,type:'ready'},oldOrigin);
 }
 el('file').onchange=async()=>{
  pending=null;cameFromTab=false;el('review').hidden=true;
  try{const file=el('file').files[0];if(file)offer(JSON.parse(await file.text()));}catch{say('全作品の引っ越しファイルを読み込めませんでした。');}
 };
 el('accept').onclick=async()=>{
  if(!pending)return;el('accept').disabled=true;
  try{
   const bundle=pending;await checkCollection(bundle);const id=await acceptCollection(bundle);pending=null;el('review').hidden=true;
   const link=el('play');link.href='/play/?collection='+id;link.hidden=false;await refresh();
   say('保存庫 '+id.slice(0,8)+' で遊べます。同じファイルを読み込んでも作品は重複しません。');
   if(cameFromTab)originWindow.postMessage({channel,nonce:token,type:'accepted'},oldOrigin);
  }catch(e){say('保存できませんでした。元の作品は残っています。'+e.message);}finally{el('accept').disabled=false;}
 };
}else say('作品の引っ越しは、まちとレールの旧住所または新住所で開いてください。');
