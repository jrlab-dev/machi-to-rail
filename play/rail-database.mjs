// The old localStorage keys are the rollback copy. Never update them after migration.
import {recoverStorage,JOURNAL_KEY,withStorageLock} from './train-storage.mjs?v=rail-storage-68';
import {packTowns,unpackTowns,slotsKey,liveKey} from './town-save-format.mjs';
const keys=['rail-town-v2','rail-town-slots-v1','rail-train-library-v1','rail-train-library-v2','rail-train-pending-v1','rail-train-usage-v1','rail-town-replay',JOURNAL_KEY];
const unavailable=()=>new DOMException('端末に保存できません。街をファイル保存してください。','QuotaExceededError');
const conflict=()=>Error('別の画面で変更されています。作品をファイルに保存し、開き直してください。');
function request(r){return new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function finished(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('保存を中断しました。'));});}
function readable(values){return {
 getItem:key=>values.get(key)??null,
 key:index=>[...values.keys()][index]??null,
 get length(){return values.size;}
};}
function legacyValues(storage){return new Map(keys.filter(key=>storage.getItem(key)!==null).map(key=>[key,storage.getItem(key)]));}
// Roll back interrupted v1/v2 journals in a private copy, including in viewing mode.
function recoveredCopy(original){
 const values=new Map(original);
 function check(key){if(!keys.includes(key))throw Error('未対応の復旧キーです。');}
 recoverStorage(Object.assign(readable(values),{
  setItem(key,value){check(key);values.set(key,value);},
  removeItem(key){check(key);values.delete(key);}
 }));
 return values;
}
function openDatabase(name){
 return new Promise((resolve,reject)=>{
  const opening=indexedDB.open(name,2);
  let blocked=false;
  opening.onupgradeneeded=event=>{if(event.oldVersion!==0)return;opening.result.createObjectStore('works');opening.result.createObjectStore('migration');};
  opening.onblocked=()=>{blocked=true;reject(Error('別の画面が保存庫を使用しています。'));};
  opening.onerror=()=>reject(opening.error);
  opening.onsuccess=()=>{if(blocked)opening.result.close();else resolve(opening.result);};
 });
}
export async function openRailDatabase(legacy,name='machi-rail-works'){
 let values=new Map(),initial=new Map(),db;
 try{
  initial=legacyValues(legacy);
  db=await openDatabase(name);
  // Hold the legacy lock across the snapshot and its first durable commit.
  return await withStorageLock(async()=>{
   const tx=db.transaction(['works','migration'],'readwrite'),done=finished(tx);
   const works=tx.objectStore('works'),migration=tx.objectStore('migration');
   let revision,baseline,compactPending=false;
   try{
    revision=await request(works.get('revision'));
    if(revision===undefined){
     baseline=legacyValues(legacy);
     values=recoveredCopy(baseline);
     migration.add([...baseline],'original');
     const packed=packTowns(values);
     for(const [key,value] of values)works.add(packed.get(key)??value,key);
     revision=0;works.add(revision,'revision');
    }else{
     const rows=await Promise.all(keys.map(key=>request(works.get(key))));
     // A reopened tab reads current works. Keep edits by an older app in its original keys.
     baseline=legacyValues(legacy);
     values=new Map(keys.flatMap((key,i)=>rows[i]===undefined?[]:[[key,rows[i]]]));
     compactPending=typeof values.get(slotsKey)==='string'||typeof values.get(liveKey)==='string';
     unpackTowns(values);
    }
   }catch(e){try{tx.abort();}catch{}await done.catch(()=>{});throw e;}
   await done;
   db.onversionchange=()=>db.close();
   return Object.assign(readable(values),{async commitBatch(writes,expected){
    for(const key of keys)if(legacy.getItem(key)!==(baseline.get(key)??null))throw conflict();
    for(const [key,value] of expected)if((values.get(key)??null)!==value)throw conflict();
    if(new Set(writes.map(([key])=>key)).size!==writes.length||writes.some(([key,value])=>!keys.includes(key)||key===JOURNAL_KEY||(value!==null&&typeof value!=='string')))throw Error('未対応の保存キーです。');
    const changes=writes.filter(([key,value])=>(values.get(key)??null)!==value);
    let diskChanges=changes;
    const updateTowns=compactPending||changes.some(([key])=>key===slotsKey||key===liveKey);
    if(updateTowns){
     const next=new Map(values);
     for(const [key,value] of changes){if(value===null)next.delete(key);else next.set(key,value);}
     diskChanges=changes.filter(([key])=>key!==slotsKey&&key!==liveKey);
     for(const [key,value] of packTowns(next))diskChanges.push([key,value??null]);
    }
    const tx=db.transaction('works',diskChanges.length?'readwrite':'readonly'),done=finished(tx),store=tx.objectStore('works');
    const read=store.get('revision');let stale=false;
    read.onsuccess=()=>{
     if(read.result!==revision){stale=true;tx.abort();return;}
     for(const [key,value] of diskChanges){if(value===null)store.delete(key);else store.put(value,key);}
     if(diskChanges.length)store.put(revision+1,'revision');
    };
    try{await done;}catch(e){if(stale)throw conflict();throw e;}
    if(diskChanges.length){revision++;compactPending=false;for(const [key,value] of changes){if(value===null)values.delete(key);else values.set(key,value);}}
   }});
  });
 }catch(error){
  db?.close();
  // Opening an unavailable or full database must never turn the old copy into a writer.
  try{values=recoveredCopy(initial);}catch{values=initial;}
  return Object.assign(readable(values),{readOnly:true,openError:error,commitBatch(){throw unavailable();}});
 }
}
