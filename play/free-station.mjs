// 自由編集の駅（設計書/自由編集の駅_20261126.md）。描画を持たない計算だけの部品。
// core.mjs とは循環 import になるので、core の値はモジュールの上の段では使わない（関数の中だけで使う）。
import {allPorts,matches,sampleItem,makeRoute,sampleRoute,formationAdvance,formationLength,formationFitsRoute,distanceOnRoute,BUILDING_TYPES,ROAD_TYPES} from './core.mjs?v=rail-90';
import {ROAD_CATALOG} from './road-network.mjs?v=rail-90';
import {CLEARANCE} from './rail-elevation.mjs?v=rail-90';

export const STATION_MAX=8,STATION_SPAN_MIN=20,STATION_SPAN_MAX=240,STATION_DWELL=8,STATION_NAME_MAX=8;
// 見本の島式ホームの寸法を写したもの（district-renderer.mjs は変えない）。
export const PLATFORM={inner:2,outer:7,lift:1.22,top:.1,tactile:.28,tactileWidth:.32,edge:.1,roofShare:.75,roofHeight:4.35,pillarStep:14,signHeight:2.5,
 buildingHalf:6,buildingNear:7,buildingFar:13,buildingHeight:5,centerline:4.5};
export const STATION_COLORS={concrete:'#bfc3bc',platform:'#8e9694',yellow:'#d5b553',edge:'#eee9d8',roof:'#3b5556',steel:'#657676'};
export const STATION_NAMES=['さくら','ひまわり','うみべ','もりのまえ','ほしぞら','にじいろ','こうえんまえ','みなと','おかのうえ','かわべり','はなばたけ','どうぶつえんまえ'];
export const STATION_SIDES=['left','right','both'];
const STRAIGHTS=['straight_long','straight_short'];
// 子どもに見せる文。app.mjs の変更を小さくするため、ここにまとめる。
export const STATION_TEXT={
 help:'まっすぐな せんろを タップすると、えきが できるよ。',
 curve:'まがった せんろには えきを おけないよ。まっすぐな せんろを えらんでね。',
 turnout:'ぶんきの ところには えきを おけないよ。',
 crossing:'ふみきりの うえには えきを おけないよ。となりの まっすぐな せんろを えらんでね。',
 elevated:'さかや たかい せんろには、まだ えきを おけないよ。',
 short:'せんろが みじかいよ。まっすぐな せんろを もう ひとつ つなげてね。',
 exists:'この えきを えらんだよ。',
 limit:'えきは 8こまで おけるよ。',
 district:'この まちには もう えきが あるよ。せんろを かえると、じぶんの えきを おけるよ。',
 offRoute:'でんしゃが とおらない せんろだよ。でんしゃが とおると とまるよ。',
 noRail:'まっすぐな せんろの うえを タップしてね。',
 placed:name=>name+'えきが できたよ！',
 blocked:kind=>(KIND_WORD[kind]||'たてもの')+'が じゃまで えきを おけないよ。あかい ところを どかしてね。',
 railChanged:'えきも いっしょに かわったよ。「↶ もどす」で もどせるよ。',
 resting:'みほんの えきが もどったので、じぶんの えきは おやすみ しているよ。',
 flipped:'ホームを はんたいがわに したよ。',
 bothSides:'りょうがわに ホームを つけたよ。',
 oneSide:'かたがわだけに ホームを つけたよ。',
 renamed:name=>'なまえを 「'+name+'」に したよ。',
 badName:'なまえは 1〜8もじで つけてね。',
 removed:'えきを けしたよ。「↶ もどす」で もどせるよ。',
 shortPlatform:'ホームが みじかいので、ホームに いる しゃりょうだけ ドアが あくよ。',
 trouble:{building:'えきに たてものが ぶつかっているよ。',tree:'えきに きが ぶつかっているよ。',road:'えきの うえを どうろが とおっているよ。',rail:'えきの よこに せんろが ちかすぎるよ。',station:'えきと えきが かさなっているよ。'}
};
const KIND_WORD={building:'たてもの',road:'どうろ',rail:'せんろ',tree:'き',station:'ほかの えき'};
export const KIND_ORDER=['building','road','rail','tree','station'];

const pieceLength=(kit,it)=>kit.pieces[it.piece].routes[0].length;
const isStraight=(kit,it)=>!!it&&STRAIGHTS.includes(it.piece)&&!kit.pieces[it.piece]?.procedural;
// 置けない理由（タップした線路の種類）。
export function railReason(kit,it){
 if(!it)return 'noRail';
 if(isStraight(kit,it))return null;
 const p=kit.pieces[it.piece];
 if(it.piece==='crossing')return 'crossing';
 if(it.piece.startsWith('turnout'))return 'turnout';
 if(p?.procedural)return 'elevated';
 return 'curve';
}
export function validStationName(name){return typeof name==='string'&&[...name].length>=1&&[...name].length<=STATION_NAME_MAX&&name.trim()!==''&&!/[<>\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(name);}
export function nextStationId(stations=[]){let n=0;for(const s of stations){const m=/^st-(\d+)$/.exec(s.id||'');if(m)n=Math.max(n,Number(m[1]));}return 'st-'+(n+1);}
export function nextStationName(stations=[],current=null){
 const used=new Set(stations.map(s=>s.name).filter(n=>n!==current));const start=current==null?-1:STATION_NAMES.indexOf(current);
 for(let k=1;k<=STATION_NAMES.length;k++){const name=STATION_NAMES[(start+k+STATION_NAMES.length)%STATION_NAMES.length];if(!used.has(name))return name;}
 return current||STATION_NAMES[0];
}
function portIndex(rails,kit){
 const ports=allPorts(rails,kit),byKey=new Map(ports.map(p=>[p.key,p]));
 const peer=(uid,id)=>{const p=byKey.get(uid+':'+id);if(!p)return null;const q=ports.filter(q=>matches(p,q));return q.length===1?q[0]:null;};
 return {peer};
}
// タップした直線から、ポートでつながった地上の直線を前後へたどる。taken＝ほかの駅の線路（入れない）。
export function stationRun(rails,kit,uid,taken=new Set()){
 const byUid=new Map(rails.map(r=>[r.uid,r])),it=byUid.get(uid),reason=railReason(kit,it);
 if(reason)return {reason};
 const {peer}=portIndex(rails,kit),seen=new Set([uid]);
 const walk=(fromUid,exit)=>{const out=[];let cur={uid:fromUid,exit};while(true){const q=peer(cur.uid,cur.exit);if(!q)break;const next=byUid.get(q.uid);if(!isStraight(kit,next)||seen.has(q.uid)||taken.has(q.uid))break;seen.add(q.uid);out.push(q.uid);cur={uid:q.uid,exit:q.id==='A'?'B':'A'};}return out;};
 const forward=walk(uid,'B'),backward=walk(uid,'A');
 const list=[...backward.reverse(),uid,...forward],len=list.map(u=>pieceLength(kit,byUid.get(u)));
 const t=backward.length;let i=t,j=t,total=len[t],leftSum=0,rightSum=0;
 while(true){
  const tryRight=()=>j+1<list.length&&total+len[j+1]<=STATION_SPAN_MAX+1e-9?(j++,total+=len[j],rightSum+=len[j],true):false;
  const tryLeft=()=>i-1>=0&&total+len[i-1]<=STATION_SPAN_MAX+1e-9?(i--,total+=len[i],leftSum+=len[i],true):false;
  const ok=rightSum<=leftSum?(tryRight()||tryLeft()):(tryLeft()||tryRight());
  if(!ok)break;
 }
 if(total<STATION_SPAN_MIN-1e-9)return {reason:'short'};
 return {rails:list.slice(i,j+1),span:total};
}
// 駅の座標系：原点＝ホームの中心、x軸＝rails の並び方向、y軸＝その左。だめな駅は null。
export function stationGeometry(station,rails,kit,index=null){
 if(!station||!Array.isArray(station.rails)||!station.rails.length)return null;
 const byUid=new Map(rails.map(r=>[r.uid,r])),items=station.rails.map(u=>byUid.get(u));
 if(items.some(it=>!isStraight(kit,it))||new Set(station.rails).size!==station.rails.length)return null;
 const {peer}=index||portIndex(rails,kit);
 let entry='A';
 if(items.length>1){const b=peer(items[0].uid,'B'),a=peer(items[0].uid,'A');entry=b?.uid===items[1].uid?'A':a?.uid===items[1].uid?'B':null;if(!entry)return null;}
 const ends=[];let span=0;
 for(let k=0;k<items.length;k++){
  const it=items[k],exit=entry==='A'?'B':'A',r=kit.pieces[it.piece].routes[0];
  ends.push(sampleItem(it,r,entry==='A'?0:1),sampleItem(it,r,entry==='A'?1:0));span+=r.length;
  if(k+1<items.length){const q=peer(it.uid,exit);if(!q||q.uid!==items[k+1].uid)return null;entry=q.id;}
 }
 const a=ends[0],b=ends.at(-1),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
 if(Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1])-span)>.01)return null;
 return {cx:(a[0]+b[0])/2,cy:(a[1]+b[1])/2,angle,span,length:span-2,start:[a[0],a[1]],end:[b[0],b[1]],side:station.side,name:station.name,id:station.id};
}
export const toWorld=(g,x,y)=>{const c=Math.cos(g.angle),s=Math.sin(g.angle);return [g.cx+c*x-s*y,g.cy+s*x+c*y];};
export const toLocal=(g,x,y)=>{const c=Math.cos(g.angle),s=Math.sin(g.angle),dx=x-g.cx,dy=y-g.cy;return [c*dx+s*dy,-s*dx+c*dy];};
export const platformSides=side=>side==='both'?[1,-1]:side==='right'?[-1]:[1];
export const buildingSide=side=>side==='right'?-1:1;
// 足あと（向き付き長方形）。hx/hy は半分の長さ。
export function stationFootprint(g,side=g.side){
 const rects=[],rect=(kind,x,y,hx,hy)=>{const [cx,cy]=toWorld(g,x,y);rects.push({kind,cx,cy,angle:g.angle,hx,hy,lx:x,ly:y});};
 for(const s of platformSides(side))rect('platform',0,s*(PLATFORM.inner+PLATFORM.outer)/2,g.length/2,(PLATFORM.outer-PLATFORM.inner)/2);
 rect('building',0,buildingSide(side)*(PLATFORM.buildingNear+PLATFORM.buildingFar)/2,PLATFORM.buildingHalf,(PLATFORM.buildingFar-PLATFORM.buildingNear)/2);
 return rects;
}
function axes(r){const c=Math.cos(r.angle),s=Math.sin(r.angle);return [[c,s],[-s,c]];}
function corners(r){const [u,v]=axes(r);return [[1,1],[1,-1],[-1,-1],[-1,1]].map(([a,b])=>[r.cx+u[0]*a*r.hx+v[0]*b*r.hy,r.cy+u[1]*a*r.hx+v[1]*b*r.hy]);}
// 向き付き長方形どうしの分離軸判定。
export function rectsOverlap(a,b,eps=1e-6){
 const ca=corners(a),cb=corners(b);
 for(const ax of [...axes(a),...axes(b)]){
  const pa=ca.map(p=>p[0]*ax[0]+p[1]*ax[1]),pb=cb.map(p=>p[0]*ax[0]+p[1]*ax[1]);
  if(Math.max(...pa)<=Math.min(...pb)+eps||Math.max(...pb)<=Math.min(...pa)+eps)return false;
 }return true;
}
function insideRect(r,x,y,margin=0){const c=Math.cos(r.angle),s=Math.sin(r.angle),dx=x-r.cx,dy=y-r.cy;return Math.abs(c*dx+s*dy)<=r.hx+margin&&Math.abs(-s*dx+c*dy)<=r.hy+margin;}
export function propBox(p){const half=p.type==='warehouse'?10:8;return {cx:p.pose[0],cy:p.pose[1],angle:p.pose[2],hx:half,hy:7};}
export function roadRects(p){
 const entry=ROAD_CATALOG[p.type];if(!entry)return [];const c=Math.cos(p.pose[2]),s=Math.sin(p.pose[2]),w=q=>[p.pose[0]+c*q[0]-s*q[1],p.pose[1]+s*q[0]+c*q[1]];
 return entry.segments.map(([a,b])=>{const A=w(a),B=w(b);return {cx:(A[0]+B[0])/2,cy:(A[1]+B[1])/2,angle:Math.atan2(B[1]-A[1],B[0]-A[0]),hx:Math.hypot(B[0]-A[0],B[1]-A[1])/2,hy:(entry.width||8)/2};});
}
// 駅の重なり。相手ごとに1件（kind, 赤い丸の場所）。順番は KIND_ORDER。
export function stationConflicts(town,kit,station,{geometry=null,others=[],index=null}={}){
 const g=geometry||stationGeometry(station,town.rails,kit,index);if(!g)return [];
 const rects=stationFootprint(g,station.side),platforms=rects.filter(r=>r.kind==='platform'),out=[];
 for(const p of town.props){
  if(BUILDING_TYPES.includes(p.type)){if(rects.some(r=>rectsOverlap(r,propBox(p))))out.push({kind:'building',uid:p.uid,x:p.pose[0],y:p.pose[1],h:0,r:11});}
  else if(ROAD_TYPES.includes(p.type)){const rr=roadRects(p);if(platforms.some(r=>rr.some(q=>rectsOverlap(r,q))))out.push({kind:'road',uid:p.uid,x:p.pose[0],y:p.pose[1],h:0,r:11});}
 }
 const own=new Set(station.rails),sides=platformSides(station.side),bs=buildingSide(station.side);
 for(const it of town.rails){
  if(own.has(it.uid))continue;
  hit:for(const r of kit.pieces[it.piece].routes){const n=Math.max(1,Math.ceil(r.length/2));for(let i=0;i<=n;i++){
   const p=sampleItem(it,r,i/n),h=p[3]||0;if(Math.abs(h)>=CLEARANCE)continue;const [lx,ly]=toLocal(g,p[0],p[1]);
   // ホーム＋2m。線路の中心側は 1.5m で切る（駅の両はしからつづく線路を数えないため）。
   const near=sides.some(s=>Math.abs(lx)<=g.length/2+2&&s*ly>1.5&&s*ly<PLATFORM.outer+2)||(Math.abs(lx)<=PLATFORM.buildingHalf+2&&bs*ly>PLATFORM.buildingNear-2&&bs*ly<PLATFORM.buildingFar+2);
   if(near){out.push({kind:'rail',uid:it.uid,x:p[0],y:p[1],h,r:7});break hit;}
  }}
 }
 for(const p of town.props)if(p.type==='tree'&&rects.some(r=>insideRect(r,p.pose[0],p.pose[1],1.5)))out.push({kind:'tree',uid:p.uid,x:p.pose[0],y:p.pose[1],h:0,r:11});
 for(const o of others){if(o.id===station.id)continue;const og=stationGeometry(o,town.rails,kit,index);if(!og)continue;const orects=stationFootprint(og,o.side);if(rects.some(a=>orects.some(b=>rectsOverlap(a,b))))out.push({kind:'station',id:o.id,x:og.cx,y:og.cy,h:0,r:11});}
 return out.sort((a,b)=>KIND_ORDER.indexOf(a.kind)-KIND_ORDER.indexOf(b.kind));
}
// 街の全部の駅の重なり（findTrouble 用）。駅どうしは1組を1件にする。
export function townStationConflicts(town,kit){
 const stations=town.stations||[];if(!stations.length)return [];
 const index=portIndex(town.rails,kit),out=[];
 stations.forEach((st,i)=>{for(const c of stationConflicts(town,kit,st,{others:stations.slice(i+1),index}))out.push({...c,station:st.id});});
 return out;
}
function routeCentroid(rails,kit,uid){
 const route=makeRoute(rails,kit,uid);let x=0,y=0,n=0;
 for(let d=0;d<=route.length;d+=4){const p=sampleRoute(route,d);x+=p[0];y+=p[1];n++;}
 return n?[x/n,y/n]:null;
}
// 置く計画。mode＝'one'（かたがわ・自動で側を決める）か 'both'。
export function planStation(town,kit,uid,mode='one'){
 const stations=town.stations||[],owner=stations.find(s=>s.rails.includes(uid));
 if(owner)return {ok:false,reason:'exists',select:owner.id};
 const it=town.rails.find(r=>r.uid===uid),why=railReason(kit,it);if(why)return {ok:false,reason:why};
 if(stations.length>=STATION_MAX)return {ok:false,reason:'limit'};
 const taken=new Set(stations.flatMap(s=>s.rails)),run=stationRun(town.rails,kit,uid,taken);if(run.reason)return {ok:false,reason:run.reason};
 const base={id:nextStationId(stations),rails:run.rails,name:nextStationName(stations)};
 const r=chooseSide(town,kit,base,mode,stations);return r.ok?{ok:true,station:r.station}:{ok:false,reason:'blocked',kind:r.kind,spots:r.spots};
}
// 側を決める。mode＝'one'：重ならない側、両方空けば輪の外側（経路の重心から遠い側）。'both'：両側。'left'/'right'：その側だけ。
export function chooseSide(town,kit,base,mode,others=town.stations||[]){
 const index=portIndex(town.rails,kit),rest=others.filter(o=>o.id!==base.id);
 const test=side=>{const st={...base,side};return {st,conflicts:stationConflicts(town,kit,st,{others:rest,index})};};
 const fail=list=>{const spots=[...list].sort((a,b)=>KIND_ORDER.indexOf(a.kind)-KIND_ORDER.indexOf(b.kind));return {ok:false,kind:spots[0].kind,spots};};
 if(mode!=='one'){const r=test(mode);return r.conflicts.length?fail(r.conflicts):{ok:true,station:r.st};}
 const L=test('left'),R=test('right');
 if(!L.conflicts.length&&!R.conflicts.length){
  const g=stationGeometry(L.st,town.rails,kit,index),c=routeCentroid(town.rails,kit,base.rails[0]);
  if(!c||!g)return {ok:true,station:L.st};
  const pl=toWorld(g,0,PLATFORM.centerline),pr=toWorld(g,0,-PLATFORM.centerline);
  return {ok:true,station:Math.hypot(pl[0]-c[0],pl[1]-c[1])>=Math.hypot(pr[0]-c[0],pr[1]-c[1])?L.st:R.st};
 }
 if(!L.conflicts.length)return {ok:true,station:L.st};
 if(!R.conflicts.length)return {ok:true,station:R.st};
 return fail([...L.conflicts,...R.conflicts]);
}
// 線路を消したときの駅の更新。changed＝何か変わったか。
export function stationsAfterRailRemoval(stations=[],removed,rails,kit){
 const gone=new Set(Array.isArray(removed)?removed:[removed]),byUid=new Map(rails.map(r=>[r.uid,r]));let changed=false;const next=[];
 for(const st of stations){
  if(!st.rails.some(u=>gone.has(u))){next.push(st);continue;}
  changed=true;const runs=[];let cur=[];
  for(const u of st.rails){if(gone.has(u)){if(cur.length)runs.push(cur);cur=[];}else cur.push(u);}if(cur.length)runs.push(cur);
  const len=run=>run.reduce((a,u)=>a+(byUid.get(u)?pieceLength(kit,byUid.get(u)):0),0);
  let best=null;for(const run of runs)if(!best||len(run)>len(best))best=run;
  if(best&&len(best)>=STATION_SPAN_MIN-1e-9)next.push({...st,rails:best});
 }
 return {stations:next,changed};
}
// 保存データの点検（core.mjs の validateScene から呼ぶ）。だめな駅だけ捨てる。例外は投げない。
export function normalizeStations(raw,rails,kit){
 if(!Array.isArray(raw))return [];
 const out=[],ids=new Set();let index=null;
 for(const s of raw){
  if(out.length>=STATION_MAX)break;
  try{
   if(!s||typeof s!=='object'||typeof s.id!=='string'||!/^st-[1-9]\d{0,5}$/.test(s.id)||ids.has(s.id))continue;
   if(!Array.isArray(s.rails)||!s.rails.length||s.rails.length>STATION_SPAN_MAX/10||!s.rails.every(Number.isInteger))continue;
   if(!STATION_SIDES.includes(s.side)||!validStationName(s.name))continue;
   const st={id:s.id,rails:[...s.rails],side:s.side,name:s.name};
   index??=portIndex(rails,kit);
   const g=stationGeometry(st,rails,kit,index);if(!g||g.span<STATION_SPAN_MIN-1e-9||g.span>STATION_SPAN_MAX+1e-9)continue;
   if(out.some(o=>o.rails.some(u=>st.rails.includes(u))))continue;
   ids.add(st.id);out.push(st);
  }catch{continue;}
 }
 return out;
}
// 止まる場所の一覧。駅の線路が全部、今の経路にひとつながりで入っている駅だけ。
export function stopsOnRoute(route,stations=[]){
 if(!route?.parts?.length)return [];
 const at=new Map(route.parts.map((p,i)=>[p.it.uid,i])),n=route.parts.length,out=[];
 stations.forEach((st,index)=>{
  const ids=st.rails.map(u=>at.get(u));if(ids.some(i=>i===undefined))return;
  const set=new Set(ids);if(set.size!==ids.length||set.size>=n&&route.closed)return;
  const first=[...set].find(i=>!set.has(route.closed?(i-1+n)%n:i-1));if(first===undefined)return;
  let total=0;for(let k=0;k<set.size;k++){const i=route.closed?(first+k)%n:first+k;if(!set.has(i))return;total+=route.parts[i].r.length;}
  let s=route.parts[first].start+total/2;if(route.closed)s=((s%route.length)+route.length)%route.length;
  out.push({index,id:st.id,s,length:total-2,span:total,side:st.side,name:st.name});
 });
 return out.sort((a,b)=>a.s-b.s);
}
const GAP=.45;
export function freeStopTarget(route,stop,dir,formation,carLength){
 const L=formationLength(formation,carLength,GAP);let t=stop.s+(dir<0?-1:1)*(L/2-carLength/2);
 if(route.closed)t=((t%route.length)+route.length)%route.length;else t=Math.max(L/2,Math.min(route.length-L/2,t));
 return t;
}
export function nextFreeStop(route,state,formation,carLength,stops){
 let best=null;
 stops.forEach((stop,k)=>{const t=freeStopTarget(route,stop,state.dir,formation,carLength);let r=(t-state.s)*(state.dir<0?-1:1);if(route.closed)r=((r%route.length)+route.length)%route.length;else if(r<-1e-6)return;r=Math.max(0,r);
  // 発車したばかり（depart）なら、今出た駅は「次」にしない（輪なら一周先）。走りの計算は depart の間これを使わないので動きは同じ。
  if(state.stationPhase==='depart'&&r<1){if(!route.closed)return;r+=route.length;}
  if(!best||r<best.r)best={k,t,r};});
 return best;
}
// 駅に止まる走り。stops が空なら formationAdvance と同じ（駅の無い街は今まで通り）。
export function advanceFreeService(route,state,formation,dt,limit,carLength,stops,acceleration=2){
 if(!stops?.length)return formationAdvance(route,state,formation,dt,limit,carLength,GAP,acceleration);
 if(!formationFitsRoute(route,formation,carLength,GAP))return {...state,speed:0,playing:false};
 if(!state.playing)return formationAdvance(route,state,formation,dt,limit,carLength,GAP,acceleration);
 const s={...state};
 if(s.stationPhase==='dwell'){s.speed=0;s.dwell=Math.max(0,(s.dwell??STATION_DWELL)-dt);if(s.dwell<=0){s.stationPhase='depart';s.departed=0;}return s;}
 if(s.stationPhase==='depart'&&(s.departed||0)>30)s.stationPhase='cruise';
 const half=formationLength(formation,carLength,GAP)/2,brake=4,next=nextFreeStop(route,s,formation,carLength,stops);
 const approaching=s.stationPhase!=='depart'&&next&&next.r<160;
 let target=limit;if(approaching)target=Math.min(target,Math.sqrt(2*1.2*Math.max(0,next.r-.015)));
 if(!route.closed){const remaining=s.dir>0?route.length-half-s.s:s.s-half;target=Math.min(target,Math.sqrt(Math.max(0,2*brake*remaining)));}
 s.speed=Math.max(0,s.speed+Math.max(-brake*dt,Math.min(acceleration*dt,target-s.speed)));
 const travel=s.speed*dt;
 if(approaching&&(next.r<=travel+.015||next.r<.07&&s.speed<.4))return {...s,s:next.t,speed:0,stationPhase:'dwell',dwell:STATION_DWELL,dwellDuration:STATION_DWELL,station:stops[next.k].index,departed:0};
 let pos=s.s+(s.dir<0?-1:1)*travel;
 if(route.closed)pos=((pos%route.length)+route.length)%route.length;
 else if(pos<=half||pos>=route.length-half){return {...s,s:Math.max(half,Math.min(route.length-half,pos)),speed:0,playing:false};}
 return {...s,s:pos,departed:(s.departed||0)+travel};
}
// 始まりの位置：今いる場所に一番近い駅で、停車中から始める。止まれる駅が無ければ null。
export function initialFreeService(route,formation,carLength,stops,s=0,dir=1){
 if(!stops?.length||!formationFitsRoute(route,formation,carLength,GAP))return null;
 const L=formationLength(formation,carLength,GAP),center=s-(dir<0?-1:1)*(L/2-carLength/2);let best=null;
 stops.forEach(stop=>{const d=Math.abs(distanceOnRoute(route,stop.s,center));if(!best||d<best.d)best={d,stop};});
 return {s:freeStopTarget(route,best.stop,dir,formation,carLength),dir:dir<0?-1:1,speed:0,playing:false,dwell:STATION_DWELL,dwellDuration:STATION_DWELL,stationPhase:'dwell',station:best.stop.index,departed:0};
}
// 方向を変える。駅が無いときは今の街と同じ（dir だけ反転）。
export function reverseFreeService(route,state,formation,carLength,stops){
 if(!stops?.length)return {...state,dir:-state.dir};
 let s=state.s-state.dir*(formation.count-1)*(carLength+GAP);if(route.closed)s=((s%route.length)+route.length)%route.length;
 return {...state,s,dir:-state.dir,speed:0,playing:false,stationPhase:state.stationPhase==='dwell'?'dwell':'depart',departed:0};
}
// ドアの側。今の animateDoors の規則（+1＝車両の進む向きの右）を向きを問わない形にしたもの。2＝両側。
export function freeDoorSide(car,g){
 const [lx]=toLocal(g,car.body[0],car.body[1]);if(Math.abs(lx)>g.length/2)return {side:0};
 if(g.side==='both')return {side:2};
 const [tx,ty]=toWorld(g,lx,(g.side==='right'?-1:1)*PLATFORM.centerline),dx=tx-car.body[0],dy=ty-car.body[1],a=car.body[2]+(car.tail?Math.PI:0);
 return {side:Math.sign(dx*Math.sin(a)-dy*Math.cos(a))||0};
}
// 自由な駅が動く街か（見本の駅が動いている間は休む）。
export function activeStations(town,activeDistrict){return activeDistrict?[]:(town?.stations||[]);}

// ---- 段階3・4：走行中の表示・ドア・視点で使う小さな計算 ----
// 列車のどれかの車両がホームの横（線路の中心から3m以内）にいる駅。いなければ null。
export function freeStationOf(cars,geometries){
 for(const g of geometries||[])for(const c of cars||[]){const b=c?.body;if(!b?.every?.(Number.isFinite))continue;const [lx,ly]=toLocal(g,b[0],b[1]);if(Math.abs(lx)<=g.span/2&&Math.abs(ly)<3)return g;}
 return null;
}
// 編成がホームより長いか（ホームから外れた車両はドアを開けない）。
export const formationOverhangs=(stop,formation,carLength)=>!!stop&&formationLength(formation,carLength,GAP)>stop.length+1e-6;
// 運転情報の文。既存の書き方（「次は ○○ · 40 km/h」「○○ · 停車中 5秒」）に合わせる。
export function freeServiceText(state,stops,stations,next){
 const name=i=>stations?.[i]?.name||'';
 if(state?.stationPhase==='dwell'&&Number.isInteger(state.station))return name(state.station)+' · 停車中 '+Math.ceil(state.dwell||0)+'秒';
 const kmh=Math.round((state?.speed||0)*3.6)+' km/h';
 return next?'次は '+name(stops[next.k].index)+' · '+kmh:'この先は 線路の終わり · '+kmh;
}
// 「駅を眺める」：ホーム側の斜め上、ホームの手前のはしの外から、駅の中心を見下ろす。
// 設計の値（x=−長さ×0.45, 26m, 高さ9m）では駅舎が手前をふさいだため（2026-11-26 写真で確認）、駅舎より外・高めへ下げた。
export function freeStationView(g,portrait=false){
 const side=g.side==='right'?-1:1,[px,py]=toWorld(g,-(g.length/2+18),side*(26+g.length*.1)),[tx,ty]=toWorld(g,0,0);
 return {position:[px,12+g.length*.04,-py],target:[tx,1.5,-ty],fov:portrait?54:46};
}
