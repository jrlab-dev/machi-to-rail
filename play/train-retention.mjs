import {normalizeLibrary,saveTrain,sameTrain,applySavedTrain,mergeSceneLibrary} from './train-library.mjs?v=marks-88';
import {DAY,USAGE_KEY,normalizeUsage,markCreated,rankTrains} from './train-ranking.mjs?v=rail-storage-68';
export const PENDING_KEY='rail-train-pending-v1';
export function normalizePending(raw={version:1,items:[]}){
 if(raw?.version!==1||!Array.isArray(raw.items))throw Error('保管中の電車を読めません。元の作品を保持しています。');
 const ids=new Set();return {version:1,items:raw.items.map(row=>{
  if(!row||!Number.isSafeInteger(row.removedAt)||row.removedAt<0||(row.deleteAt!==null&&row.deleteAt!==row.removedAt+DAY))throw Error('保管中の期限を読めません。');
  const entry=normalizeLibrary([row.entry])[0];if(ids.has(entry.id))throw Error('保管中の電車が重複しています。');ids.add(entry.id);return {entry,removedAt:row.removedAt,deleteAt:row.deleteAt};
 })};
}
export const readPending=storage=>{const text=storage.getItem(PENDING_KEY);return normalizePending(text===null?undefined:JSON.parse(text));};
export function saveUniqueTrain(items,scene,input,pending){
 const current=normalizeLibrary(items),candidate=normalizeLibrary([input])[0];
 if(!current.some(e=>e.id===input.id)&&!current.some(e=>sameTrain(e,candidate))){
  const old=normalizePending(pending).items.find(row=>sameTrain(row.entry,candidate));
  if(old){if(current.some(e=>e.id===old.entry.id))throw Error('電車の保存IDが重複しています。作品をファイルに保存してください。');return {items:[...current,old.entry],scene:applySavedTrain(scene,old.entry),duplicate:true,restored:true};}
 }
 return saveTrain(current,scene,input);
}
export function planRetention(previous,items,scene,usage,pending,{now=Date.now(),createdId=null}={}){
 if(!Number.isSafeInteger(now)||now<0)throw Error('削除時刻を確認できません。');
 const old=normalizeLibrary(previous),next=normalizeLibrary(items),town=JSON.parse(JSON.stringify(scene));
 let stats=normalizeUsage(usage);if(createdId&&next.some(e=>e.id===createdId)&&!old.some(e=>e.id===createdId))stats=markCreated(stats,createdId,now);
 const retained=rankTrains(next,stats,now),active=new Map(retained.map(entry=>[entry.id,entry]));
 const queue=[];
 for(const row of normalizePending(pending).items){
  const match=active.get(row.entry.id);
  if(!match)queue.push(row);
  else if(!sameTrain(match,row.entry))throw Error('保管中の電車と保存庫でIDが重複しています。');
 }
 const removed=old.filter(entry=>!active.has(entry.id));
 for(const entry of removed){const found=queue.find(row=>row.entry.id===entry.id);if(found){if(!sameTrain(found.entry,entry))throw Error('保管中の作品が変更されています。');}else queue.push({entry,removedAt:now,deleteAt:null});}
 for(const key of ['trainId','oppositeTrainId'])if(town[key]&&!active.has(town[key]))delete town[key];
 const pendingIds=new Set(queue.map(row=>row.entry.id));for(const id of Object.keys(stats.items))if(!active.has(id)&&!pendingIds.has(id))delete stats.items[id];
 return {items:retained,scene:town,usage:stats,pending:{version:1,items:queue},moved:removed.length,extraWrites:[[PENDING_KEY,JSON.stringify({version:1,items:queue})],[USAGE_KEY,JSON.stringify(stats)]]};
}
export function restorePending(items,scene,pending,id){
 const row=normalizePending(pending).items.find(r=>r.entry.id===id);if(!row)throw Error('この電車の保管状態が変わりました。一覧を開き直してください。');
 const normalized=normalizeLibrary(items),same=normalized.find(e=>e.id===id&&sameTrain(e,row.entry));
 if(same)return {items:normalized,scene:applySavedTrain(scene,same),pending:{version:1,items:pending.items.filter(r=>r.entry.id!==id)}};
 if(normalized.some(e=>e.id===id))throw Error('保存済みの電車とIDが重複しています。');
 return {items:[...normalized,row.entry],scene:applySavedTrain(scene,row.entry),pending};
}

export function mergeRetainedScene(items,raw,pending,{migrateLegacy=true}={}){
 const active=normalizeLibrary(items),ids=new Set(active.map(e=>e.id)),queue=normalizePending(pending).items;
 for(const row of queue){const current=active.find(e=>e.id===row.entry.id);if(current&&!sameTrain(current,row.entry))throw Error('保管中と保存庫で電車のIDが重複しています。');}
 const reserved=queue.filter(r=>!ids.has(r.entry.id)).map(r=>r.entry),incoming=mergeSceneLibrary([],raw,{migrateLegacy}).items;
 const merged=mergeSceneLibrary([...active,...reserved],raw,{migrateLegacy});
 merged.items=merged.items.filter(e=>ids.has(e.id)||!reserved.some(q=>q.id===e.id)||incoming.some(q=>sameTrain(q,e)));
 return merged;
}
