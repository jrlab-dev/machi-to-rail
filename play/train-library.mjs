import {normalizeDesign,designField,designFor,TRAM_DESIGN} from './train-design.mjs?v=marks-88';
import {TRAIN_TYPES,EXPRESS_DESIGNS,designKey} from './train-types.mjs?v=retro-87';
import {normalizeSoundProfile,soundFor} from './train-sound-recipe.mjs?v=departure-35';
import {commitStorage} from './train-storage.mjs?v=rail-storage-68';
export const LEGACY_LIBRARY_KEY='rail-train-library-v1',LIBRARY_KEY='rail-train-library-v2',TOWN_KEY='rail-town-v2';
export const validTrainId=id=>typeof id==='string'&&/^saved-[a-zA-Z0-9_-]{1,80}$/.test(id);
const copy=value=>JSON.parse(JSON.stringify(value));
export function normalizeLibrary(raw=[]){
 if(!Array.isArray(raw))throw Error('保存した電車のデータを読み込めません。');
 const ids=new Set();return raw.map(row=>{
  if(!row||!validTrainId(row.id)||ids.has(row.id)||!Object.hasOwn(TRAIN_TYPES,row.type)||!row.design||typeof row.design!=='object')throw Error('保存した電車のデータを読み込めません。');
  ids.add(row.id);return{id:row.id,type:row.type,design:normalizeDesign(row.design),soundProfile:normalizeSoundProfile(row.soundProfile)};
 });
}
export function readLibrary(storage){const text=storage.getItem(LIBRARY_KEY)??storage.getItem(LEGACY_LIBRARY_KEY);if(!text)return[];const data=JSON.parse(text);if(![1,2].includes(data?.version))throw Error('保存した電車の形式を読み込めません。');return normalizeLibrary(data.items);}
export function applySavedTrain(scene,entry,other=false){
 const next=copy(scene);next[other?'oppositeTrain':'train']=entry.type;
 next[designField(next,other)]=normalizeDesign(entry.design);next[other?'oppositeSoundProfile':'soundProfile']=normalizeSoundProfile(entry.soundProfile);next[other?'oppositeTrainId':'trainId']=entry.id;return next;
}
export function applyBaseTrain(scene,type,other=false){
 const next=copy(scene);next[other?'oppositeTrain':'train']=type;delete next[other?'oppositeTrainId':'trainId'];delete next[other?'oppositeSoundProfile':'soundProfile'];
 if(Object.hasOwn(TRAIN_TYPES,type))next[designField(next,other)]=normalizeDesign(type==='tram'?TRAM_DESIGN:EXPRESS_DESIGNS[type],other?1:0);return next;
}
export const sameTrain=(a,b)=>a.type===b.type&&JSON.stringify(a.design)===JSON.stringify(b.design)&&JSON.stringify(normalizeSoundProfile(a.soundProfile))===JSON.stringify(normalizeSoundProfile(b.soundProfile));
function hash(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return(n>>>0).toString(36);}
function unused(id,items){let next=id,n=2;while(items.some(e=>e.id===next))next=id+'-'+n++;return next;}
export function mergeSceneLibrary(existing,raw,{migrateLegacy=true}={}){
 const items=normalizeLibrary(existing),scene=copy(raw),imported=normalizeLibrary(scene.trainLibrary||[]),map=new Map();delete scene.trainLibrary;
 const add=entry=>{const match=items.find(e=>sameTrain(e,entry));if(match)return match;const row={...entry,id:unused(entry.id,items)};items.push(row);return row;};
 for(const entry of imported)map.set(entry.id,add(entry).id);
 for(const key of ['trainId','oppositeTrainId'])if(map.has(scene[key]))scene[key]=map.get(scene[key]);
 if(!migrateLegacy)return{items:normalizeLibrary(items),scene};
 // Preserve all four legacy paint slots, even when a different train is currently selected.
 for(const [field,type,other] of Object.keys(TRAIN_TYPES).flatMap(type=>[false,true].map(other=>[designKey(type,other),type,other]))){
  const selected=(other?(scene.oppositeTrain||scene.train):scene.train)===type;
  if(!scene[field]&&!selected)continue;
  const design=normalizeDesign(scene[field]||(type==='tram'?TRAM_DESIGN:EXPRESS_DESIGNS[type]),other?1:0),selectedId=scene[other?'oppositeTrainId':'trainId'],soundProfile=selected?soundFor(scene,other):normalizeSoundProfile();
  const entry=(selected&&items.find(e=>e.id===selectedId&&sameTrain(e,{type,design,soundProfile})))||items.find(e=>sameTrain(e,{type,design,soundProfile}))||add({id:'saved-legacy-'+hash(type+JSON.stringify(design)+JSON.stringify(soundProfile)),type,design,soundProfile});
  if(selected&&entry)scene[other?'oppositeTrainId':'trainId']=entry.id;
 }
 return{items:normalizeLibrary(items),scene};
}
export function saveTrain(items,scene,{id,type,design,soundProfile}){
 const next=normalizeLibrary(items),entry=normalizeLibrary([{id,type,design,soundProfile}])[0],index=next.findIndex(e=>e.id===id);
 const duplicate=next.find(e=>e.id!==id&&sameTrain(e,entry));
 if(index>=0&&duplicate)throw Error('同じ内容の電車が既に保存されています。元の電車は変更していません。');
 if(index<0&&duplicate)return {items:next,scene:applySavedTrain(scene,duplicate),duplicate:true};
 if(index<0)next.push(entry);else next[index]=entry;
 let town=applySavedTrain(scene,entry);if(scene.oppositeTrainId===id)town=applySavedTrain(town,entry,true);
 return{items:next,scene:town};
}
export function removeTrain(items,scene,id){
 const next=normalizeLibrary(items);if(!next.some(e=>e.id===id))throw Error('この電車は既に削除されています。');
 const town=copy(scene);for(const key of ['trainId','oppositeTrainId'])if(town[key]===id)delete town[key];
 return{items:next.filter(e=>e.id!==id),scene:town};
}
export function commitLibrary(storage,items,scene,options={}){
 const writes=[[LIBRARY_KEY,JSON.stringify({version:2,items:normalizeLibrary(items)})],[TOWN_KEY,JSON.stringify(scene)]];
 const raw=storage.getItem('rail-town-slots-v1');if(raw!==null){const store=JSON.parse(raw);store.slots[store.active]=copy(scene);writes.push(['rail-town-slots-v1',JSON.stringify(store)]);}
 return commitStorage(storage,[...writes,...(options.extraWrites||[])],options);
}
export function selectedTrainId(scene,items,other=false){const id=scene[other?'oppositeTrainId':'trainId'],type=other?(scene.oppositeTrain||scene.train):scene.train,design=designFor(scene,other),soundProfile=soundFor(scene,other);return items.some(e=>e.id===id&&sameTrain(e,{type,design,soundProfile}))?id:type;}
