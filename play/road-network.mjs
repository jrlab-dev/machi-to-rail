import {railHeight,CLEARANCE} from './rail-elevation.mjs';
// Road layout data is deliberately renderer-independent.  Coordinates follow core.mjs?v=train-order-47:
// Blender-style XY ground plane, with an angle in radians.  The renderer maps Y to -Z.
export const ROAD_TOLERANCE=0.001;
const TAU=Math.PI*2;
const PORT=(id,x,y,outward)=>Object.freeze({id,position:Object.freeze([x,y]),outward});

// `road`, `corner`, and `junction` are the v2 names already saved by the first release.
// `straight`, `t`, `cross`, and `rail_crossing` are friendly aliases accepted on input.
export const ROAD_CATALOG=Object.freeze({
  road:Object.freeze({type:'road',label:'直線道路',width:8,ports:Object.freeze([PORT('A',-10,0,Math.PI),PORT('B',10,0,0)]),segments:Object.freeze([[[-10,0],[10,0]]])}),
  corner:Object.freeze({type:'corner',label:'曲がり角',width:8,ports:Object.freeze([PORT('A',10,0,0),PORT('B',0,10,Math.PI/2)]),segments:Object.freeze([[[10,0],[0,0]],[[0,0],[0,10]]])}),
  tee:Object.freeze({type:'tee',label:'T字路',width:8,ports:Object.freeze([PORT('A',-10,0,Math.PI),PORT('B',10,0,0),PORT('C',0,10,Math.PI/2)]),segments:Object.freeze([[[-10,0],[10,0]],[[0,0],[0,10]]])}),
  junction:Object.freeze({type:'junction',label:'十字路',width:8,ports:Object.freeze([PORT('A',-10,0,Math.PI),PORT('B',10,0,0),PORT('C',0,10,Math.PI/2),PORT('D',0,-10,-Math.PI/2)]),segments:Object.freeze([[[-10,0],[10,0]],[[0,-10],[0,10]]])}),
  crossing:Object.freeze({type:'crossing',label:'踏切道路',width:8,ports:Object.freeze([PORT('A',-10,0,Math.PI),PORT('B',10,0,0)]),segments:Object.freeze([[[-10,0],[10,0]]])})
});

const ALIASES=Object.freeze({straight:'road',t:'tee',cross:'junction',rail_crossing:'crossing',road_crossing:'crossing'});
const finite=n=>Number.isFinite(n)&&Math.abs(n)<=100000;
const norm=a=>{a%=TAU;return a<=-Math.PI?a+TAU:a>Math.PI?a-TAU:a};
export const canonicalRoadType=type=>ROAD_CATALOG[type]?type:ALIASES[type]||null;
const rotate=([x,y],a)=>{const c=Math.cos(a),s=Math.sin(a);return[x*c-y*s,x*s+y*c]};
const world=(p,pose)=>{const q=rotate(p,pose[2]);return[pose[0]+q[0],pose[1]+q[1]]};
const compatible=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<=ROAD_TOLERANCE&&Math.cos(a.a-b.a)<-.99999;
const roadProps=props=>(Array.isArray(props)?props:[]).filter(p=>p&&canonicalRoadType(p.type)&&Array.isArray(p.pose)&&p.pose.length===3&&p.pose.every(finite));
const intentionalEnd=p=>p.prop.roadEnd===true||(Array.isArray(p.prop.roadEnds)&&p.prop.roadEnds.includes(p.id));

/** Return world-space road ports. A `key` is stable within one props array. */
export function roadPorts(props){
  const seen=new Set();
  return roadProps(Array.isArray(props)?props:[props]).flatMap(prop=>{
    const type=canonicalRoadType(prop.type),spec=ROAD_CATALOG[type];
    return spec.ports.map(port=>{
      const [x,y]=world(port.position,prop.pose),uid=prop.uid;
      const key=String(uid)+':'+port.id;
      // Invalid duplicated uids are reported by validateRoadNetwork; keep ports distinguishable here.
      const unique=seen.has(key)?key+'#'+seen.size:key;seen.add(key);
      return {uid,id:port.id,key:unique,type,x,y,a:norm(port.outward+prop.pose[2]),prop};
    });
  });
}

/** Build a new prop whose first port exactly faces and touches `selectedPort`. */
export function snapRoad(type,selectedPort,uid){
  const canonical=canonicalRoadType(type);
  if(!canonical)throw Error('未知の道路部品です。');
  if(!selectedPort||![selectedPort.x,selectedPort.y,selectedPort.a].every(finite))throw Error('接続する道路端が不正です。');
  if(!Number.isInteger(uid)||uid<1)throw Error('道路IDは1以上の整数にしてください。');
  const anchor=ROAD_CATALOG[canonical].ports[0];
  const angle=norm(selectedPort.a+Math.PI-anchor.outward),offset=rotate(anchor.position,angle);
  return {uid,type:canonical,pose:[selectedPort.x-offset[0],selectedPort.y-offset[1],angle],scale:1,tint:'#ffffff'};
}

function roadSegments(props){
  return roadProps(props).flatMap(prop=>{
    const spec=ROAD_CATALOG[canonicalRoadType(prop.type)];
    return spec.segments.map(([a,b])=>({prop,a:world(a,prop.pose),b:world(b,prop.pose)}));
  });
}
function railSegments(rails,kit){
  if(!Array.isArray(rails)||!kit?.pieces)return[];
  const transform=(p,pose)=>{const q=rotate([p[0],p[1]],pose[2]);return[pose[0]+q[0],pose[1]+q[1]]};
  const point=(route,t)=>route.kind==='line'?[route.length*t,0]:[route.radius*Math.sin(Math.abs(route.angle*t)),Math.sign(route.angle)*route.radius*(1-Math.cos(route.angle*t))];
  const out=[];
  for(const rail of rails){const piece=kit.pieces[rail?.piece];if(!piece||!Array.isArray(rail.pose))continue;for(const route of piece.routes||[]){let last=transform(point(route,0),rail.pose);for(let i=1;i<=24;i++){const next=transform(point(route,i/24),rail.pose);out.push({rail,a:last,b:next,h0:railHeight(route,(i-1)/24),h1:railHeight(route,i/24)});last=next;}}}
  return out;
}
function segmentHit(a,b,c,d){
  const rx=b[0]-a[0],ry=b[1]-a[1],sx=d[0]-c[0],sy=d[1]-c[1],den=rx*sy-ry*sx;
  if(Math.abs(den)<1e-9)return null;
  const qx=c[0]-a[0],qy=c[1]-a[1],t=(qx*sy-qy*sx)/den,u=(qx*ry-qy*rx)/den;
  // End-to-end contact belongs to the port graph, not an illegal rail crossing.
  // A rail is sampled into adjoining segments, so its interior crossing can sit on a
  // sample seam.  Only the road's own endpoint is excluded here; callers de-duplicate seams.
  return t>ROAD_TOLERANCE&&t<1-ROAD_TOLERANCE&&u>=-1e-9&&u<=1+1e-9?{x:a[0]+t*rx,y:a[1]+t*ry}:null;
}

/**
 * Validate road-only failures without making normal road warnings stop the train.
 * `valid` is false only for unsafe geometry (duplicate planes or an unapproved rail crossing).
 */
export function validateRoadNetwork(props,rails=[],kit){
  const roads=roadProps(props),ports=roadPorts(roads),byKey=new Map(ports.map(p=>[p.key,p]));
  const errors=[],warnings=[],connections=[],openPorts=[];
  const uidCount=new Map();for(const p of roads)uidCount.set(p.uid,(uidCount.get(p.uid)||0)+1);
  for(const [uid,count] of uidCount)if(count>1)errors.push({code:'duplicate_uid',uid,message:'道路IDが重複しています。'});
  for(const p of ports){const matches=ports.filter(q=>q.key!==p.key&&compatible(p,q));
    if(matches.length===1){if(p.key<matches[0].key)connections.push({a:p.key,b:matches[0].key});}
    else if(matches.length>1)errors.push({code:'ambiguous_port',port:p.key,message:'1つの道路端に複数の道路が重なっています。'});
    else openPorts.push(p);
  }
  const intentionalEnds=openPorts.filter(intentionalEnd),danglingPorts=openPorts.filter(p=>!intentionalEnd(p));
  for(const p of danglingPorts)warnings.push({code:'open_port',port:p.key,message:'道路の端がつながっていません。終端なら roadEnds:[端ID] を指定してください。'});
  const duplicates=[];for(let i=0;i<roads.length;i++)for(let j=i+1;j<roads.length;j++){const a=roads[i],b=roads[j],samePlace=Math.hypot(a.pose[0]-b.pose[0],a.pose[1]-b.pose[1])<ROAD_TOLERANCE,sameAngle=Math.abs(Math.sin(a.pose[2]-b.pose[2]))<1e-7;if(samePlace&&sameAngle){duplicates.push([a.uid,b.uid]);errors.push({code:'overlapping_surface',uids:[a.uid,b.uid],message:'同じ場所に道路面が重なっています。'});}}
  const crossingMap=new Map();for(const segment of roadSegments(roads))for(const rail of railSegments(rails,kit)){const at=segmentHit(segment.a,segment.b,rail.a,rail.b);if(at){const len=Math.hypot(rail.b[0]-rail.a[0],rail.b[1]-rail.a[1]),t=len?Math.hypot(at.x-rail.a[0],at.y-rail.a[1])/len:0;if(rail.h0+(rail.h1-rail.h0)*t>=CLEARANCE)continue;const item={roadUid:segment.prop.uid,roadType:canonicalRoadType(segment.prop.type),railUid:rail.rail.uid,railPiece:rail.rail.piece,at};const key=[item.roadUid,item.railUid,Math.round(at.x*1e6),Math.round(at.y*1e6)].join(':');crossingMap.set(key,item);}}
  const crossings=[...crossingMap.values()];
  const badRailCrossings=crossings.filter(x=>!(x.roadType==='crossing'&&x.railPiece==='crossing'));
  for(const x of badRailCrossings)errors.push({code:'rail_crossing_without_module',...x,message:'通常道路が線路を横切っています。踏切道路を使ってください。'});
  for(const p of roads.filter(p=>canonicalRoadType(p.type)==='crossing')){const count=crossings.filter(x=>x.roadUid===p.uid&&x.railPiece==='crossing').length;if(count!==1)errors.push({code:'invalid_crossing_module',uid:p.uid,message:'踏切道路は踏切レールを1か所だけ横切る必要があります。'});}
  const connected=new Set(connections.flatMap(x=>[x.a,x.b]));
  const isolated=roads.filter(p=>roadPorts([p]).every(port=>!connected.has(port.key)&&intentionalEnd(port))).map(p=>p.uid);
  for(const uid of isolated)warnings.push({code:'isolated_road',uid,message:'他の道路につながらない道路です。'});
  return {valid:errors.length===0,errors,warnings,connections,openPorts,danglingPorts,intentionalEnds,duplicateRoads:duplicates,railCrossings:crossings,normalRailCrossings:badRailCrossings,sidewalkConflicts:[],isolated};
}

/** A closed, visible two-block example with a single explicit rail crossing. */
export function buildExampleRoads(){
  const props=[{uid:1,type:'crossing',pose:[5,0,Math.PI/2],scale:1,tint:'#ffffff'}];
  let uid=2;
  const port=(id,name)=>roadPorts(props).find(p=>p.uid===id&&p.id===name);
  const add=(type,from)=>{const next=snapRoad(type,from,uid++);props.push(next);return next;};
  const loop=(start)=>{
    const feeder=add('road',start),hub=add('junction',port(feeder.uid,'B'));
    let p=port(hub.uid,'C');
    const r1=add('road',p),c1=add('corner',port(r1.uid,'B'));
    const r2=add('road',port(c1.uid,'B')),c2=add('corner',port(r2.uid,'B'));
    const r3=add('road',port(c2.uid,'B')),r4=add('road',port(r3.uid,'B'));
    const c3=add('corner',port(r4.uid,'B')),r5=add('road',port(c3.uid,'B'));
    const c4=add('corner',port(r5.uid,'B'));
    const end=port(c4.uid,'B'),target=port(hub.uid,'D');
    if(!compatible(end,target))throw Error('見本道路の閉路を作れませんでした。');
    // The remaining junction arm is an intentional future building-entrance approach,
    // not a broken road; its port id survives save/load in `roadEnds`.
    hub.roadEnds=['B'];
  };
  loop(port(1,'B'));loop(port(1,'A'));
  return props;
}
