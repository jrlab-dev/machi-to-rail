import {normalizeLand} from './growing-land.mjs?v=rail-94';
import {isSuspended} from './suspended-route.mjs?v=rail-90';
import {isIsland} from './island-route.mjs?v=rail-90';
import {registerConnector,connectorPoint} from './rail-connector.mjs?v=rail-90';
import {isTokyo} from './tokyo-route.mjs?v=rail-90';
import {isMountain,MOUNTAIN_ID,mountainTypeAllowed} from './mountain-data.mjs?v=rail-90';
import {isIntercity,INTERCITY_ID} from './intercity-data.mjs?v=rail-90';
import {railHeight,railPitch,validRailPose,CLEARANCE} from './rail-elevation.mjs?v=rail-90';
import {normalizeLibrary,validTrainId} from './train-library.mjs?v=rail-90';
import {normalizeSoundProfile} from './train-sound-recipe.mjs?v=rail-90';
import {normalizeStations} from './free-station.mjs?v=rail-94';
import {selectedVehicles} from './traffic-selection.mjs?v=rail-90';
import {normalizeDesign,TRAIN_EXAMPLES} from './train-design.mjs?v=rail-90';
import {trainType,TRAIN_TYPES,shinkansenTypes,limitedExpressTypes,designKey,expressLimit,isHighSpeed,intercityTrainSpeed,isLocomotive} from './train-types.mjs?v=rail-90';
const legacyExample=type=>TRAIN_EXAMPLES[{keihin:0,yamanote:1,rinkai:2}[type]]?.design;
const oppositeType=raw=>trainType(Object.hasOwn(TRAIN_TYPES,raw.oppositeTrain)||['keihin','rinkai','yamanote'].includes(raw.oppositeTrain)?raw.oppositeTrain:raw.train);
// Scene data stays independent of rendering and recording.
export const clone=x=>JSON.parse(JSON.stringify(x));
export const TAU=Math.PI*2;
export function point(r,t){if(r.kind==='connector')return connectorPoint(r,t);if(r.kind==='line')return[r.length*t,0,0];const a=r.angle*t,s=Math.sign(r.angle);return[r.radius*Math.sin(Math.abs(a)),s*r.radius*(1-Math.cos(a)),a]}
export function transform(p,pose){const c=Math.cos(pose[2]),s=Math.sin(pose[2]);return[pose[0]+c*p[0]-s*p[1],pose[1]+s*p[0]+c*p[1],(p[2]||0)+pose[2]]}
export function allPorts(items,kit){for(const it of items)registerConnector(it.piece,kit);return items.flatMap(it=>kit.pieces[it.piece].ports.map(p=>{const v=transform([p.position[0],p.position[1],p.outward],it.pose);return{uid:it.uid,id:p.id,key:it.uid+':'+p.id,x:v[0],y:v[1],a:v[2],h:p.position[2]||0}}))}
export function matches(a,b){return a.uid!==b.uid&&Math.hypot(a.x-b.x,a.y-b.y)<.001&&Math.cos(a.a-b.a)<-.99999&&Math.abs((a.h||0)-(b.h||0))<.001}
export function openPorts(items,kit){const ps=allPorts(items,kit);return ps.filter(p=>!ps.some(q=>matches(p,q)))}
export function sampleItem(it,r,t){const p=transform(point(r,t),it.pose);return r.heightStart!=null?[...p,railHeight(r,t),railPitch(r,t)]:p}
export function makeRoute(items,kit,startUid){
  const ps=allPorts(items,kit),segments=items.map(it=>({it,r:kit.pieces[it.piece].routes.find(r=>r.to===(it.branch||'B'))||kit.pieces[it.piece].routes[0]}));
  const segMap=new Map(segments.map(s=>[s.it.uid,s]));
  function next(seg,end){const p=ps.find(p=>p.uid===seg.it.uid&&p.id===end);const peers=ps.filter(q=>matches(p,q));if(peers.length!==1)return null;const q=peers[0],s=segMap.get(q.uid);if(q.id!==s.r.from&&q.id!==s.r.to)return null;return{s,rev:q.id===s.r.to}}
  let start=segMap.get(startUid)||segments[0];if(!start)return{parts:[],length:0,closed:false};
  let lead={s:start,rev:false},seen=new Set([start.it.uid]),closed=false;
  // First find an open beginning; a closed component retains a stable first piece.
  while(true){const n=next(lead.s,lead.rev?lead.s.r.to:lead.s.r.from);if(!n)break;if(seen.has(n.s.it.uid)){closed=n.s.it.uid===start.it.uid;lead={s:start,rev:false};break;}lead={s:n.s,rev:!n.rev};seen.add(n.s.it.uid)}
  const parts=[];seen=new Set();let current=lead,length=0;
  while(current&&!seen.has(current.s.it.uid)){seen.add(current.s.it.uid);parts.push({...current.s,rev:current.rev,start:length});length+=current.s.r.length;const n=next(current.s,current.rev?current.s.r.from:current.s.r.to);current=n;}
  if(current&&current.s.it.uid===lead.s.it.uid)closed=true;
  return{parts,length,closed};
}
export function sampleRoute(route,d){
  if(route.sample)return route.sample(d);
  if(!route.length)return[0,0,0];d=route.closed?((d%route.length)+route.length)%route.length:Math.max(0,Math.min(route.length,d));
  const p=route.parts.find(p=>d<=p.start+p.r.length+1e-8)||route.parts.at(-1);let t=(d-p.start)/p.r.length;if(p.rev)t=1-t;
  const q=sampleItem(p.it,p.r,t);if(p.rev){q[2]+=Math.PI;if(q.length===5)q[4]*=-1;}return q;
}
export function distanceOnRoute(route,a,b){let d=a-b;if(route.closed)d=((d+route.length/2)%route.length+route.length)%route.length-route.length/2;return d}
export function advance(route,state,dt,targetSpeed){
  const half=10.3,brake=4;
  if(route.length<half*2)return{...state,speed:0,playing:false};
  let target=state.playing?targetSpeed:0;
  const remaining=state.dir>0?route.length-half-state.s:state.s-half;
  if(!route.closed)target=Math.min(target,Math.sqrt(Math.max(0,2*brake*remaining)));
  const speed=Math.max(0,state.speed+Math.max(-brake*dt,Math.min(2*dt,target-state.speed)));
  let s=state.s+state.dir*speed*dt,playing=state.playing;
  if(route.closed)s=((s%route.length)+route.length)%route.length;
  else{if(s<=half||s>=route.length-half){s=Math.max(half,Math.min(route.length-half,s));playing=false;return{...state,s,speed:0,playing}}}
  return{...state,s,speed,playing};
}
// Formation data is deliberately renderer-independent.  A car's distance is its
// centre on the route; the first item is always the currently leading cab.
export const FORMATION_MIN=2,FORMATION_MAX=11,LEGACY_CAR_LENGTH=20.6;
export function defaultFormation(count=4,assetVersion='legacy-cab-v1'){
  count=Math.max(FORMATION_MIN,Math.min(FORMATION_MAX,Number(count)||4));
  return {count,assetVersion,cars:Array.from({length:count},(_,i)=>({
    id:`car-${i+1}`,kind:i===0||i===count-1?'cab':'middle',
    orientation:i===0?'front':'rear',roofVariant:i>0&&i<count-1&&i%2?'pantograph':'plain'
  }))};
}
export function normalizeFormation(value){
  if(!value)return {count:1,assetVersion:'legacy-cab-v1',cars:[{id:'car-1',kind:'cab',orientation:'front',roofVariant:'plain'}]};
  const n=Number(value.count);
  if(!Number.isInteger(n)||n<FORMATION_MIN||n>FORMATION_MAX||!Array.isArray(value.cars)||value.cars.length!==n)throw Error('編成は2〜11両で指定してください。');
  const ids=new Set();
  const cars=value.cars.map((car,i)=>{
    if(!car||typeof car.id!=='string'||ids.has(car.id)||!['cab','middle'].includes(car.kind)||!['front','rear'].includes(car.orientation)||!['plain','pantograph'].includes(car.roofVariant||'plain'))throw Error('編成データに不正な車両があります。');
    ids.add(car.id);return {id:car.id,kind:car.kind,orientation:car.orientation,roofVariant:car.roofVariant||'plain'};
  });
  if(cars.filter(c=>c.kind==='cab').length!==2||cars[0].kind!=='cab'||cars.at(-1).kind!=='cab'||cars.slice(1,-1).some(c=>c.kind!=='middle'))throw Error('編成の前と後ろは先頭車、間は中間車にしてください。');
  return {count:n,assetVersion:typeof value.assetVersion==='string'?value.assetVersion:'unknown',cars};
}
export function formationLength(formation,carLength=LEGACY_CAR_LENGTH,couplerGap=.45){return formation.cars.length*carLength+Math.max(0,formation.cars.length-1)*couplerGap}
export function formationDistances(route,state,formation,carLength=LEGACY_CAR_LENGTH,couplerGap=.45){
  const spacing=carLength+couplerGap,dir=state.dir<0?-1:1;
  return formation.cars.map((car,i)=>({car,index:i,d:state.s-dir*i*spacing,pose:sampleRoute(route,state.s-dir*i*spacing),direction:dir}));
}
export function formationFitsRoute(route,formation,carLength=LEGACY_CAR_LENGTH,couplerGap=.45){return route.closed||route.length>=formationLength(formation,carLength,couplerGap)+.001}
export function formationOccupiesDistance(route,state,formation,distance,carLength=LEGACY_CAR_LENGTH,couplerGap=.45,margin=0){
  const half=carLength/2+margin;
  return formationDistances(route,state,formation,carLength,couplerGap).some(x=>Math.abs(distanceOnRoute(route,x.d,distance))<=half);
}
export function formationAdvance(route,state,formation,dt,targetSpeed,carLength=LEGACY_CAR_LENGTH,couplerGap=.45,acceleration=2){
  if(!formationFitsRoute(route,formation,carLength,couplerGap))return {...state,speed:0,playing:false};
  const half=formationLength(formation,carLength,couplerGap)/2,brake=4;
  let target=state.playing?targetSpeed:0,remaining=state.dir>0?route.length-half-state.s:state.s-half;
  if(!route.closed)target=Math.min(target,Math.sqrt(Math.max(0,2*brake*remaining)));
  const speed=Math.max(0,state.speed+Math.max(-brake*dt,Math.min(acceleration*dt,target-state.speed)));
  let s=state.s+state.dir*speed*dt,playing=state.playing;
  if(route.closed)s=((s%route.length)+route.length)%route.length;
  else if(s<=half||s>=route.length-half){s=Math.max(half,Math.min(route.length-half,s));playing=false;return {...state,s,speed:0,playing};}
  return {...state,s,speed,playing};
}
const finite=n=>Number.isFinite(n)&&Math.abs(n)<=100000;
export const BUILDING_TYPES=['shop','warehouse','hotel','office','apartment'];
export const ROAD_TYPES=['road','corner','tee','junction','crossing'];
// 自由編集の駅。だめな駅だけ捨てる。空なら項目を出さない（駅の無い街の保存結果を変えない）。
function stationField(raw,rails,kit){if(raw===undefined)return {};const stations=normalizeStations(raw,rails,kit);return stations.length?{stations}:{};}
export const propLimit=town=>town?.version===4&&town.land?800:200;
export function validateScene(raw,kit){
  if(raw?.version===1&&Array.isArray(raw.items))raw={format:'rail-town',version:2,rails:raw.items,props:[],train:'original'};
  if(!raw||raw.format!=='rail-town'||![2,3,4].includes(raw.version)||!Array.isArray(raw.rails)||raw.rails.length>300||!Array.isArray(raw.props)||raw.props.length>propLimit(raw))throw Error('この街ファイルは読みこめません。');
  if((raw.version===4)!==(raw.land!==undefined))throw Error('この土地の保存形式を確認してください。');
  const land=raw.version===4?normalizeLand(raw.land):null;
  if(land&&['mountain','district','intercity','tokyo','suspended','island'].some(key=>raw[key]!==undefined))throw Error('地形と路線の種類が合いません。');
  if(raw.rails.some(r=>r.piece?.startsWith('intercity_'))&&!isIntercity(raw))throw Error('都市間路線の形が合いません。');
  if(raw.mountain!==undefined&&(!isMountain(raw)||raw.rails.length||raw.props.length||(!mountainTypeAllowed(raw.train)||!mountainTypeAllowed(raw.oppositeTrain||raw.train))||raw.formation?.count!==2))throw Error('登山鉄道は2両編成です。新幹線とリニアは走れません。');
  const ids=new Set();
  const rails=raw.rails.map(x=>{if(!x||typeof x!=='object')throw Error('線路データに不正な値があります。');registerConnector(x.piece,kit);if(!Number.isInteger(x.uid)||x.uid<1||ids.has(x.uid)||!Object.hasOwn(kit.pieces,x.piece)||!Array.isArray(x.pose)||x.pose.length!==3||!x.pose.every(finite)||x.branch&&!['B','C'].includes(x.branch))throw Error('線路データに不正な値があります。');ids.add(x.uid);return{uid:x.uid,piece:x.piece,pose:[...x.pose],branch:x.branch||'B'}});
  ids.clear();const props=raw.props.map(x=>{if(!Number.isInteger(x.uid)||ids.has(x.uid)||![...BUILDING_TYPES,...ROAD_TYPES,'tree'].includes(x.type)||!Array.isArray(x.pose)||x.pose.length!==3||!x.pose.every(finite)||!Number.isFinite(x.scale)||x.scale<.5||x.scale>2||!/^#[0-9a-f]{6}$/i.test(x.tint||''))throw Error('建物データに不正な値があります。');ids.add(x.uid);return{uid:x.uid,type:x.type,pose:[...x.pose],scale:x.scale,tint:x.tint}});
  const special=isSuspended(raw)?'suspended-monorail':isIsland(raw)?'monorail':null;
  const routeTrain=type=>special?(type===special?special:'original'):trainType(type==='monorail'||type==='suspended-monorail'?'original':type);
  const stations=stationField(raw.stations,rails,kit);
  if(land&&raw.stations!==undefined&&(!Array.isArray(raw.stations)||raw.stations.length!==(stations.stations?.length||0)))throw Error('この土地の駅の記録を確認してください。');
  return{format:'rail-town',version:land?4:3,...(land?{land}:{}),rails,props,...(isSuspended(raw)?{suspended:raw.suspended}:{}),...(isIsland(raw)?{island:raw.island}:{}),...(isTokyo(raw)?{tokyo:raw.tokyo}:{}),...(isMountain(raw)?{mountain:MOUNTAIN_ID}:{}),...(raw.soundProfile!==undefined?{soundProfile:normalizeSoundProfile(raw.soundProfile)}:{}),...(raw.oppositeSoundProfile!==undefined?{oppositeSoundProfile:normalizeSoundProfile(raw.oppositeSoundProfile)}:{}),...(raw.trafficVehicles!==undefined?{trafficVehicles:selectedVehicles(raw.trafficVehicles)}:{}),...(isIntercity(raw)?{intercity:INTERCITY_ID,...(raw.intercityStations===1?{intercityStations:1}:{})}:{}),...(raw.trainLibrary?{trainLibrary:normalizeLibrary(raw.trainLibrary)}:{}),...(validTrainId(raw.trainId)?{trainId:raw.trainId}:{}),...(validTrainId(raw.oppositeTrainId)?{oppositeTrainId:raw.oppositeTrainId}:{}),train:routeTrain(raw.train),oppositeTrain:routeTrain(oppositeType(raw)),...Object.fromEntries([...shinkansenTypes,'steam','maglev','freight','monorail','suspended-monorail',...limitedExpressTypes].flatMap(type=>[false,true].map(other=>designKey(type,other))).filter(key=>raw[key]).map(key=>[key,normalizeDesign(raw[key])])),formation:isSuspended(raw)?defaultFormation(2):isIsland(raw)?defaultFormation(3):normalizeFormation(raw.version>=3?raw.formation:null),...(raw.trainDesign||raw.train!=='tram'?{trainDesign:normalizeDesign(raw.trainDesign||legacyExample(raw.train))}:{}),...(raw.oppositeTrainDesign||(raw.oppositeTrain||raw.train)!=='tram'?{oppositeTrainDesign:normalizeDesign(raw.oppositeTrainDesign||legacyExample(raw.oppositeTrain||raw.train),1)}:{}),...(raw.tramDesign?{tramDesign:normalizeDesign(raw.tramDesign)}:{}),...(raw.oppositeTramDesign?{oppositeTramDesign:normalizeDesign(raw.oppositeTramDesign)}:{}),...(raw.district==='midori-central-v1'?{district:raw.district}:{}),...stations};
}
export function effectiveFormation(scene,other=false){
  const type=other?(scene.oppositeTrain||scene.train):scene.train;
  if(type==='tram'&&!isMountain(scene))return{count:1,assetVersion:'tram-v1',cars:[{id:'tram-1',kind:'cab',orientation:'front',roofVariant:'pantograph'}]};
  const formation=scene.formation.count>expressLimit(scene)?defaultFormation(expressLimit(scene),scene.formation.assetVersion):scene.formation;
  return isLocomotive(type)?{...formation,locomotiveDirection:other?-1:1,cars:formation.cars.map((car,i)=>({...car,kind:i===0?'cab':'middle',roofVariant:'plain',orientation:'front'}))}:formation;
}
export function defaultTown(kit){
  // A crossing replaces one long straight with two ten-metre pieces, keeping closure.
  const rails=clone(kit.presets.oval);const first=rails.shift();rails.unshift({...first,piece:'crossing'},{uid:100,piece:'straight_short',pose:[10,0,0]});
  const props=[],add=(type,x,y,a=0,scale=1,tint='#ffffff')=>props.push({uid:props.length+1,type,pose:[x,y,a],scale,tint});
  for(let i=0;i<5;i++){add(['office','apartment','shop','hotel','warehouse'][i],-32+i*24,112,Math.PI,1);add(['shop','office','apartment','office','shop'][i],-30+i*24,-28,0,.8)}
  for(let i=0;i<4;i++){add('road',-20+i*20,96,0);add('road',-20+i*20,-14,0)}
  add('crossing',5,-4,Math.PI/2);add('road',5,16,Math.PI/2);add('junction',5,-14,0);
  for(const[x,y]of [[-16,33],[12,37],[35,43],[58,33],[14,63],[46,63],[-49,8],[90,73]])add('tree',x,y,0,1);
  add('shop',30,23,0,.65);add('office',28,57,Math.PI,.6);
  return{format:'rail-town',version:3,rails,props,train:'original',oppositeTrain:'original',trainDesign:normalizeDesign(),oppositeTrainDesign:normalizeDesign(undefined,1),formation:defaultFormation()};
}
export function overlapsRail(prop,rails,kit){
  if(ROAD_TYPES.includes(prop.type)||prop.type==='tree')return false;
  const half=prop.type==='warehouse'?10:8,angle=-prop.pose[2];
  return rails.some(it=>kit.pieces[it.piece].routes.some(r=>{for(let i=0;i<=30;i++){const p=sampleItem(it,r,i/30),dx=p[0]-prop.pose[0],dy=p[1]-prop.pose[1],x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);if(Math.abs(x)<half+3.5&&Math.abs(y)<7+3.5)return true}return false}));
}
export function railIntersections(rails,kit){
 const lines=rails.map(it=>kit.pieces[it.piece].routes.flatMap(r=>{const n=Math.max(16,Math.ceil(r.length/2)),ps=Array.from({length:n+1},(_,i)=>sampleItem(it,r,i/n));return ps.slice(1).map((b,i)=>[ps[i],b]);}));
 const ps=allPorts(rails,kit),h=(a,b,t)=>(a[3]||0)+((b[3]||0)-(a[3]||0))*t;let found=0;
 for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){
  const shared=ps.filter(p=>p.uid===rails[i].uid&&ps.some(q=>q.uid===rails[j].uid&&matches(p,q)));let hit=false;
  for(const[a,b]of lines[i]){for(const[c,d]of lines[j]){
   const rx=b[0]-a[0],ry=b[1]-a[1],sx=d[0]-c[0],sy=d[1]-c[1],dx=c[0]-a[0],dy=c[1]-a[1],den=rx*sy-ry*sx;
   if(Math.abs(den)>1e-9){const t=(dx*sy-dy*sx)/den,u=(dx*ry-dy*rx)/den;
    if(t>=-1e-8&&t<=1+1e-8&&u>=-1e-8&&u<=1+1e-8&&Math.abs(h(a,b,t)-h(c,d,u))<CLEARANCE){const x=a[0]+t*rx,y=a[1]+t*ry;if(!shared.some(p=>Math.hypot(p.x-x,p.y-y)<.005)){hit=true;break;}}
   }else if(Math.abs(dx*ry-dy*rx)<1e-8){const len=rx*rx+ry*ry,proj=p=>((p[0]-a[0])*rx+(p[1]-a[1])*ry)/len,lo=Math.max(0,Math.min(proj(c),proj(d))),hi=Math.min(1,Math.max(proj(c),proj(d)));
    if(hi-lo>1e-5){for(const t of[lo,(lo+hi)/2,hi]){const x=a[0]+rx*t,y=a[1]+ry*t,u=((x-c[0])*sx+(y-c[1])*sy)/(sx*sx+sy*sy);if(Math.abs(h(a,b,t)-h(c,d,u))<CLEARANCE){hit=true;break;}}}
   }
  }if(hit)break;}if(hit)found++;
 }return found;
}
export function validateReplay(raw,kit){
  if(raw?.format!=='rail-town-replay'||![1,2].includes(raw.version)||!Array.isArray(raw.frames)||raw.frames.length<2||raw.frames.length>6001)throw Error('走行記録を読みこめません。');
  const scene=validateScene(raw.scene,kit);let last=-1;const validMountainPose=p=>Array.isArray(p)&&p.length===5&&p.every(finite)&&p[3]>=-.1&&p[3]<=250&&Math.abs(p[4])<=.35;const replayPose=isIsland(scene)?p=>Array.isArray(p)&&p.length===5&&p.every(finite)&&Math.abs(p[3]-12)<.01&&Math.abs(p[4])<.001:(isSuspended(scene)||isMountain(scene))?validMountainPose:isTokyo(scene)?p=>Array.isArray(p)&&p.length===5&&p.every(finite)&&p[3]>=-.1&&p[3]<=18.1&&Math.abs(p[4])<=.06:validRailPose;
  const speedLimit=(other=false)=>{const type=other?(scene.oppositeTrain||scene.train):scene.train;return isIntercity(scene)&&isHighSpeed(type)?Math.ceil(intercityTrainSpeed(type)):20;};
  for(const f of raw.frames){if(!Number.isFinite(f.t)||f.t<0||f.t<=last||f.t>600||!Array.isArray(f.body)||!replayPose(f.body)||!f.body.every(finite)||!Array.isArray(f.front)||!Array.isArray(f.back)||!replayPose(f.front)||!replayPose(f.back)||!f.front.every(finite)||!f.back.every(finite)||!Number.isFinite(f.speed)||f.speed<0||f.speed>speedLimit()||!Array.isArray(f.gates)||f.gates.length>300||f.gates.some(g=>!Number.isInteger(g.uid)||!Number.isFinite(g.angle)||g.angle<0||g.angle>1||typeof g.alarm!=='boolean'))throw Error('走行記録に不正な値があります。');const validPose=replayPose;const validCars=(c,other=false)=>Array.isArray(c)&&c.length===effectiveFormation(scene,other).count&&c.every(x=>x&&validPose(x.body)&&validPose(x.front)&&validPose(x.back)&&typeof x.tail==='boolean');if(f.cars&&!validCars(f.cars))throw Error('編成の走行記録が不正です。');if(f.opposite&&(!validCars(f.opposite.cars,true)||!Number.isFinite(f.opposite.speed)||f.opposite.speed<0||f.opposite.speed>speedLimit(true)))throw Error('対向列車の記録が不正です。');last=f.t;}
  for(const f of raw.frames){
    if(Boolean(f.returnTrains)!==Boolean(raw.frames[0].returnTrains))throw Error('追加列車の記録がとちゅうで変わっています。');
    if(f.returnTrains&&(!isIntercity(scene)||!Array.isArray(f.returnTrains)||![0,2].includes(f.returnTrains.length)||f.returnTrains.length!==raw.frames[0].returnTrains.length||f.returnTrains.some((r,i)=>!r||!Number.isFinite(r.speed)||r.speed<0||r.speed>speedLimit(i===1)||!Array.isArray(r.cars)||r.cars.length!==effectiveFormation(scene,i===1).count||r.cars.some(c=>!c||!validRailPose(c.body)||!validRailPose(c.front)||!validRailPose(c.back)||typeof c.tail!=='boolean'))))throw Error('追加列車の走行記録が不正です。');
  }
  return{format:'rail-town-replay',version:2,scene,frames:clone(raw.frames)};
}
