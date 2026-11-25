// Imported collections have independent train IDs, town slots and station posters.
export const oldOrigin='https://junior-g-rail.j-kato.chatgpt.site';
export const newOrigin='https://rail.jr-genius.jp';
export const adsKey='rail.stationAds.v1';
export const workKeys=['rail-town-v2','rail-town-slots-v1','rail-train-library-v1','rail-train-library-v2','rail-train-pending-v1','rail-train-usage-v1','rail-town-replay'];
export function request(r){return new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});}
export function completed(tx){return new Promise((ok,no)=>{tx.oncomplete=ok;tx.onabort=()=>no(tx.error||Error('保存を中断しました。'));});}
async function catalog(){
 const r=indexedDB.open('rail-imported-collections',1);
 r.onupgradeneeded=()=>r.result.createObjectStore('collections');
 return request(r);
}
export async function listCollections(){
 const db=await catalog();
 try{return await request(db.transaction('collections').objectStore('collections').getAllKeys());}
 finally{db.close();}
}
export function validateBundle(bundle){
 if(bundle?.format!=='rail-collection'||bundle.version!==1||!bundle.values||typeof bundle.values!=='object'||Array.isArray(bundle.values))throw Error('全作品の引っ越しファイルを選んでください。');
 const values={};
 for(const key of Object.keys(bundle.values)){
  if(![...workKeys,adsKey].includes(key)||typeof bundle.values[key]!=='string')throw Error('未対応の作品データが含まれています。');
  JSON.parse(bundle.values[key]);values[key]=bundle.values[key];
 }
 if(!Object.keys(values).length)throw Error('保存された作品が見つかりません。以前遊んだブラウザで開いてください。');
 return {format:'rail-collection',version:1,values:Object.fromEntries(Object.entries(values).sort(([a],[b])=>a.localeCompare(b)))};
}
export async function acceptCollection(bundle){
 const normalized=validateBundle(bundle);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(normalized)));
 const id=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const db=await catalog();
 try{
  const tx=db.transaction('collections','readwrite'),done=completed(tx),store=tx.objectStore('collections');
  const exists=store.getKey(id);
  exists.onsuccess=()=>{if(exists.result===undefined)store.add(normalized,id);};
  await done;return id;
 }finally{db.close();}
}
export async function getCollection(id){
 if(id===null)return null;
 if(!/^[a-f0-9]{64}$/.test(id))throw Error('この保存庫の住所を確認してください。');
 const db=await catalog();
 try{
  const bundle=await request(db.transaction('collections').objectStore('collections').get(id));
  if(!bundle)throw Error('このブラウザに保存庫が見つかりません。引っ越し画面から作品を受け取ってください。');
  return {id,values:bundle.values};
 }finally{db.close();}
}
export function collectionStorage(collection,storage){
 if(!collection)return storage;
 const prefix='rail-collection:'+collection.id+':';
 return {getItem:key=>storage.getItem(prefix+key)??collection.values[key]??null,setItem:(key,value)=>storage.setItem(prefix+key,value)};
}
