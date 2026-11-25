export const STORAGE_LOCK='rail-workshop-storage-v2',JOURNAL_KEY='rail-save-journal-v2';
export const REPLAY_KEY='rail-town-replay';
const protectedKeys=new Set(['rail-town-v2','rail-town-slots-v1','rail-train-library-v2']);
const cleanupListeners=new Set();
const cleanupGuards=new WeakMap();
export function setReplayCleanupGuard(storage,expected){cleanupGuards.set(storage,expected);}
export function onReplayCleanup(listener){cleanupListeners.add(listener);return()=>cleanupListeners.delete(listener);}
export function isQuotaError(error){const seen=new Set();for(let e=error;e&&!seen.has(e);e=e.cause){seen.add(e);if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED')return true;}return false;}
function discardReplay(storage){const guard=cleanupGuards.get(storage);if(!guard)return false;const current=storage.getItem(REPLAY_KEY);if(current!==guard())throw Error('走行記録が別の画面で変わったため、自動整理を止めました。作品は保持しています。画面を開き直してください。');if(current===null)return false;storage.removeItem(REPLAY_KEY);for(const f of cleanupListeners){try{f(storage);}catch{}}return true;}
const put=(storage,key,value)=>value===null?storage.removeItem(key):storage.setItem(key,value);
// Keep the shared text once, while retaining exact before/after values for recovery.
function packWrite([key,before,after]){
 if(typeof before!=='string'||typeof after!=='string')return [key,before,after];
 let start=0,end=0;while(start<Math.min(before.length,after.length)&&before[start]===after[start])start++;
 while(end<Math.min(before.length,after.length)-start&&before[before.length-1-end]===after[after.length-1-end])end++;
 const delta=[start,before.length-end,after.slice(start,after.length-end)];
 return [key,before,JSON.stringify(delta).length<JSON.stringify(after).length?delta:after];
}
function unpackWrite(row){
 if(!Array.isArray(row)||row.length!==3)throw Error();
 const [key,before,after]=row;if(!Array.isArray(after))return row;
 const [start,end,text]=after;
 if(typeof before!=='string'||after.length!==3||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||end>before.length||typeof text!=='string')throw Error();
 return [key,before,before.slice(0,start)+text+before.slice(end)];
}
export function recoverStorage(storage){
 const text=storage.getItem(JOURNAL_KEY);if(text===null)return;
 let j;try{j=JSON.parse(text);if(![1,2].includes(j.version)||!Array.isArray(j.writes))throw Error();if(j.version===2)j.writes=j.writes.map(unpackWrite);if(j.writes.some(w=>!Array.isArray(w)||w.length!==3||typeof w[0]!=='string'||w[0]===JOURNAL_KEY||w.slice(1).some(v=>v!==null&&typeof v!=='string'))||new Set(j.writes.map(w=>w[0])).size!==j.writes.length)throw Error();}catch{throw Error('保存の復旧情報を読めません。元データを保護しています。');}
 for(const [key,before,after]of j.writes){const current=storage.getItem(key);if(current!==before&&current!==after)throw Error('別の画面の変更があるため復旧を止めました。元データと復旧情報は残っています。');}
 const restore=()=>{for(const [key,before,after]of j.writes){const current=storage.getItem(key);if(current!==before&&current!==after)throw Error('別の画面の変更があるため復旧を止めました。元データと復旧情報は残っています。');}for(const [key,before]of j.writes)put(storage,key,before);storage.removeItem(JOURNAL_KEY);};
 try{restore();}catch(error){
  if(!isQuotaError(error)||!j.writes.length||j.writes.some(([key])=>!protectedKeys.has(key)))throw error;
  for(const [key,before,after]of j.writes){const current=storage.getItem(key);if(current!==before&&current!==after)throw error;}
  if(!discardReplay(storage))throw error;restore();
 }
}
export function commitStorage(storage,writes,{expected=[]}={}){
 if(storage.commitBatch)return storage.commitBatch(writes,expected);
 try{return commitOnce(storage,writes,{expected});}catch(error){
  if(!isQuotaError(error)||!writes.length||writes.some(([key])=>!protectedKeys.has(key))||storage.getItem(JOURNAL_KEY)!==null)throw error;
  for(const [key,value]of expected)if(storage.getItem(key)!==value)throw error;
  if(!discardReplay(storage))throw error;
  return commitOnce(storage,writes,{expected});
 }
}
function commitOnce(storage,writes,{expected=[]}={}){
 recoverStorage(storage);for(const [key,value]of expected)if(storage.getItem(key)!==value)throw Error('別の画面で変更されています。下書きは残しています。最新を読むか、別名で保存してください。');
 if(writes.some(([key,value])=>typeof key!=='string'||key===JOURNAL_KEY||(value!==null&&typeof value!=='string'))||new Set(writes.map(w=>w[0])).size!==writes.length)throw Error('保存内容が不正です。元データは変更していません。');
 const journal={version:2,writes:writes.map(([key,value])=>[key,storage.getItem(key),value]).filter(([,before,after])=>before!==after)};
 if(!journal.writes.length)return;
 // A single localStorage operation is atomic and needs no duplicate backup.
 if(journal.writes.length===1){const [key,,value]=journal.writes[0];try{put(storage,key,value);}catch(error){throw Error('端末に保存できないため、変更前のデータを保持しています。編集内容をファイルに保存してください。',{cause:error});}return;}
 try{storage.setItem(JOURNAL_KEY,JSON.stringify({...journal,writes:journal.writes.map(packWrite)}));}catch(error){throw Error('復旧用の空き容量が足りません。作品をファイルに保存してください。下書きは残しています。',{cause:error});}
 try{for(const [key,,value]of journal.writes)put(storage,key,value);storage.removeItem(JOURNAL_KEY);}catch(error){let recovered=false;try{recoverStorage(storage);recovered=true;}catch{}throw Error(recovered?'端末に保存できないため、変更前へ戻しました。編集内容は残しています。下書きをファイルに書き出してください。':'保存は未確定です。復旧情報と下書きを保持しています。ファイルに書き出し、この画面で保存を続けないでください。',{cause:error});}
}
export async function withStorageLock(action){if(!globalThis.navigator?.locks?.request)throw Error('この環境は安全な端末保存に対応していません。「街をファイル保存」で作品を残してください。');return navigator.locks.request(STORAGE_LOCK,{mode:'exclusive'},action);}
