import {workKeys,adsKey,request,validateBundle} from '../play/collection-store.mjs';
import {unpackTowns} from '../play/town-save-format.mjs';
import {recoverStorage,JOURNAL_KEY,withStorageLock} from '../play/train-storage.mjs';
function existingDatabase(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open('machi-rail-works');let absent=false;
  r.onupgradeneeded=()=>{absent=true;r.transaction.abort();};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>absent?resolve(null):reject(r.error);
 });
}
export async function snapshot(){
 return withStorageLock(async()=>{
  let values=new Map();
  const db=await existingDatabase();
  let migrated=false;
  if(db)try{
   const store=db.transaction('works','readonly').objectStore('works');
   const keys=await request(store.getAllKeys());
   // In a migrated database a missing row is intentional. Never revive it from a legacy copy.
   migrated=keys.includes('revision');
   if(migrated){
    for(const key of keys)if(key!=='revision'&&!workKeys.includes(key))throw Error('新しい保存形式です。作品を守るため引っ越しを中断しました。');
    const rows=await Promise.all(workKeys.map(key=>request(store.get(key))));
    values=new Map(workKeys.flatMap((key,i)=>rows[i]===undefined?[]:[[key,rows[i]]]));
    unpackTowns(values);
   }
  }finally{db.close();}
  if(!migrated){
   for(const key of [...workKeys,JOURNAL_KEY])if(localStorage.getItem(key)!==null)values.set(key,localStorage.getItem(key));
   recoverStorage({getItem:key=>values.get(key)??null,setItem:(key,v)=>values.set(key,v),removeItem:key=>values.delete(key)});
  }
  const ads=localStorage.getItem(adsKey);if(ads!==null)values.set(adsKey,ads);
  return validateBundle({format:'rail-collection',version:1,values:Object.fromEntries(values)});
 });
}
