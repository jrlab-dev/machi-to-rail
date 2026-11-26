export const USAGE_KEY='rail-train-usage-v1',DAY=86400000,COUNT_INTERVAL=30*60000;
const validId=id=>typeof id==='string'&&/^saved-[a-zA-Z0-9_-]{1,80}$/.test(id);
const time=x=>x===null||(Number.isFinite(x)&&x>=0);
const elapsed=(now,then)=>Math.max(0,now-then)/DAY;
export function normalizeUsage(value={version:1,items:{}}){
 if(value?.version!==1||!value.items||typeof value.items!=='object'||Array.isArray(value.items))throw Error('電車の使った記録を読めません。');
 const items=Object.create(null);
 for(const [id,row]of Object.entries(value.items)){
  if(!validId(id)||!row||!['createdAt','lastUsedAt','frequencyUpdatedAt','lastCountedAt'].every(k=>time(row[k]))||!Number.isFinite(row.frequencyValue)||row.frequencyValue<0)throw Error('電車の使った記録を読めません。');
  items[id]={createdAt:row.createdAt,lastUsedAt:row.lastUsedAt,frequencyUpdatedAt:row.frequencyUpdatedAt,lastCountedAt:row.lastCountedAt,frequencyValue:row.frequencyValue};
 }
 return {version:1,items};
}
export const readUsage=storage=>{const text=storage.getItem(USAGE_KEY);return normalizeUsage(text===null?undefined:JSON.parse(text));};
const empty=()=>({createdAt:null,lastUsedAt:null,frequencyValue:0,frequencyUpdatedAt:null,lastCountedAt:null});
export function markCreated(usage,id,now=Date.now()){
 if(!validId(id)||!Number.isFinite(now)||now<0)throw Error('電車の使った記録が不正です。');
 const next=normalizeUsage(usage),row=next.items[id]||empty();if(row.createdAt===null)row.createdAt=now;next.items[id]=row;return next;
}
export function markUsed(usage,ids,now=Date.now()){
 if(!Number.isFinite(now)||now<0)throw Error('電車の使った記録が不正です。');
 const next=normalizeUsage(usage);
 for(const id of new Set(ids)){
  if(!validId(id))continue;
  const row=next.items[id]||empty();
  if(row.lastCountedAt===null||now-row.lastCountedAt>=COUNT_INTERVAL){
   row.frequencyValue=(row.frequencyUpdatedAt===null?0:row.frequencyValue*2**(-elapsed(now,row.frequencyUpdatedAt)/30))+1;
   row.frequencyUpdatedAt=now;row.lastCountedAt=now;
  }
  row.lastUsedAt=Math.max(row.lastUsedAt??0,now);next.items[id]=row;
 }
 return next;
}
export function rankingDetails(row,now=Date.now()){
 const r=row||empty(),age=r.createdAt===null?Infinity:elapsed(now,r.createdAt),recent=r.lastUsedAt===null?0:45*2**(-elapsed(now,r.lastUsedAt)/7),fresh=30*2**(-age/3);
 const count=r.frequencyUpdatedAt===null?0:r.frequencyValue*2**(-elapsed(now,r.frequencyUpdatedAt)/30),frequency=25*Math.min(1,Math.log1p(count)/Math.log(21));
 return {score:recent+fresh+frequency,newFirst:age<1,createdAt:r.createdAt??-1,lastUsedAt:r.lastUsedAt??-1};
}
export function rankTrains(items,usage,now=Date.now()){
 return items.map((entry,index)=>({entry,index,...rankingDetails(usage.items[entry.id],now)})).sort((a,b)=>Number(b.newFirst)-Number(a.newFirst)||(a.newFirst?b.createdAt-a.createdAt:0)||b.score-a.score||b.lastUsedAt-a.lastUsedAt||b.createdAt-a.createdAt||a.index-b.index).map(row=>row.entry);
}
