import {commitStorage,recoverStorage,isQuotaError,REPLAY_KEY} from './train-storage.mjs?v=rail-storage-68';
export const REPLAY_BYTES=384*1024,REPLAY_SECONDS=60,OPTIONAL_TOTAL_BYTES=4*1024*1024;
export const storageBytes=text=>text===null?0:text.length*2;
export function storageUsage(storage){let total=0;for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key!==null)total+=storageBytes(key)+storageBytes(storage.getItem(key));}return {total,replay:storageBytes(storage.getItem(REPLAY_KEY))};}
// The live recording and exported file remain intact; only the automatic cache is bounded.
export function boundedReplay(journey){
 if(!journey||!Array.isArray(journey.frames)||journey.frames.length<2)return null;
 const end=journey.frames.at(-1).t;let first=journey.frames.findIndex(f=>f.t>=end-REPLAY_SECONDS);if(first<0)return null;
 const encode=start=>{const offset=journey.frames[start].t;return JSON.stringify({...journey,frames:journey.frames.slice(start).map(f=>({...f,t:f.t-offset}))});};
 if(first>journey.frames.length-2)return null;
 let text=encode(first);if(storageBytes(text)<=REPLAY_BYTES)return text;
 let low=first+1,high=journey.frames.length-2,best=null;
 while(low<=high){const mid=Math.floor((low+high)/2),candidate=encode(mid);if(storageBytes(candidate)<=REPLAY_BYTES){best=candidate;high=mid-1;}else low=mid+1;}
 return best;
}
// Call under the shared storage lock. Refuse stale requests before any cleanup.
export function saveAutomaticReplay(storage,text,expected){
 recoverStorage(storage);
 if(storage.getItem(REPLAY_KEY)!==expected)throw Error('走行記録が別の画面で変わりました。この画面の記録はファイルに保存できます。');
 if(text===null||storageBytes(text)>REPLAY_BYTES)return {saved:false,removed:false,value:expected,reason:'size'};
 const usage=storageUsage(storage),projected=usage.total-usage.replay+storageBytes(text)+(expected===null?storageBytes(REPLAY_KEY):0);
 if(projected>OPTIONAL_TOTAL_BYTES)return {saved:false,removed:false,value:expected,reason:'space'};
 try{commitStorage(storage,[[REPLAY_KEY,text]],{expected:[[REPLAY_KEY,expected]]});return {saved:true,removed:false,value:text};}
 catch(error){if(!isQuotaError(error))throw error;return {saved:false,removed:false,value:storage.getItem(REPLAY_KEY),reason:'space'};}
}
// Invalidates already queued work without touching a recording kept for export.
export function createReplayEpoch(){let value=0,suppressed=false;return {start(){suppressed=false;return ++value;},suppress(){suppressed=true;return ++value;},token:()=>value,allows:token=>!suppressed&&token===value};}
