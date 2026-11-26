import {MOUNTAIN_MUSEUM,museumPoint,mountainSurfaceHeight} from './mountain-data.mjs?v=rail-90';
import {mountainSceneryCamera,mountainExteriorCamera,clearMountainTerrain} from './mountain-camera.mjs?v=rail-90';
import {cameraBasis} from './camera-composition.mjs?v=rail-90';
const center=v=>{const cars=v.cars||[{body:v.body}],n=cars.length;return cars.reduce((a,c)=>a.map((x,i)=>x+c.body[[0,3,1][i]]*(i===2?-1:1)/n),[0,0,0]);};
export function mountainFeatureCamera(v,kind,{aspect=1.6,carLength=20.9,traffic=[],height=mountainSurfaceHeight}={}){
 if(kind==='scenery')return mountainSceneryCamera(v,{aspect,carLength,height});
 if(kind==='train')return mountainExteriorCamera(v,'front-exterior',{aspect,carLength,height});
 const train=center(v),points=(v.cars||[]).flatMap(({body:p})=>[-1,1].flatMap(end=>[-1,1].flatMap(side=>[0,5].map(h=>[p[0]+Math.cos(p[2])*end*carLength/2-Math.sin(p[2])*side*1.8,p[3]+h,-p[1]-Math.sin(p[2])*end*carLength/2-Math.cos(p[2])*side*1.8]))));
 let focus,offset;
 if(kind==='museum'){const p=MOUNTAIN_MUSEUM.pose;focus=[p[0]+15,p[3]+3,-p[1]+20];offset=[105,75,110];for(const a of[-50,50])for(const b of[-82,-15]){const p=museumPoint(a,b);points.push([p[0],p[2]+7,-p[1]]);}}
 else if(kind==='crossing'){focus=[485,174,-723];offset=[65,33,65];points.push([475,175,-706],[495,175,-740]);}
 else if(kind==='summit'){focus=[560,190,-765];offset=[85,90,140];for(const x of[505,624])for(const z of[-732,-807])points.push([x,211,z]);}
 else {const bus=traffic.find(t=>t.id==='mountain-tour-bus')||traffic[0];if(!bus)return mountainSceneryCamera(v,{aspect,carLength,height});const p=bus.body;focus=[p[0],p[3]+2,-p[1]];offset=[65,42,65];for(const x of[-7,7])for(const z of[-7,7])points.push([focus[0]+x,focus[1]+3,focus[2]+z]);}
 const target=train.map((x,i)=>x*.45+focus[i]*.55);target[1]+=2;
 let position=target.map((x,i)=>x+offset[i]);const fov=50,tan=Math.tan(fov*Math.PI/360)*.82;
 for(let iteration=0;iteration<4;iteration++){
  const basis=cameraBasis({position,target});let distance=Math.hypot(...position.map((x,i)=>x-target[i]));
  for(const p of points){const d=p.map((x,i)=>x-target[i]),dot=a=>a.reduce((s,x,i)=>s+x*d[i],0),depth=dot(basis.forward);distance=Math.max(distance,Math.abs(dot(basis.right))/(tan*Math.max(.35,aspect))-depth,Math.abs(dot(basis.up))/tan-depth);}
  position=target.map((x,i)=>x-basis.forward[i]*distance);position=clearMountainTerrain(position,[train[0],train[1]+2,train[2]],height,30);position=clearMountainTerrain(position,focus,height,30);
 }
 return {position,target,fov};
}
export function stepMountainDirector(previous,{v,time,identity,aspect,carLength,traffic=[],height=mountainSurfaceHeight,loading=false}={}){
 if(loading)return {...previous,reason:'model-loading-hold'};
 const reset=previous.identity!==identity||time<(previous.time??time),dt=reset?0:Math.max(0,time-(previous.time??time)),held=reset?0:(previous.held||0)+dt,p=center(v),service=v.service||{};
 let kind='scenery';
 if(service.stationPhase==='dwell')kind='doors';
 else if(Math.abs(p[0]-485)<85&&Math.abs(-p[2]-723)<35)kind='crossing';
 else if(Math.hypot(p[0]-MOUNTAIN_MUSEUM.pose[0],-p[2]-MOUNTAIN_MUSEUM.pose[1])<155)kind='museum';
 else if(p[0]>410&&-p[2]>680)kind='summit';
 else {const bus=traffic.find(t=>t.id==='mountain-tour-bus'),near=bus&&Math.hypot(bus.body[0]-p[0],bus.body[1]+p[2],bus.body[3]-p[1])<140,slot=Math.floor(time/10)%5;kind=near&&slot===1?'bus':slot===3?'train':'scenery';}
 const old=previous.candidate?.mountainKind;
 if(old&&kind!==old&&!reset&&held<8&&kind!=='doors'&&old!=='doors')kind=old;
 const id='mountain-'+kind,changed=reset||previous.shotId!==id,pose=kind==='doors'?null:mountainFeatureCamera(v,kind,{aspect,carLength,traffic,height});
 return {...previous,identity,time,held:changed?0:held,shotId:id,mode:kind==='doors'?'station-doors':'bridge-town',reason:'mountain-'+kind,candidate:{id,mountainKind:kind},cut:(previous.cut||0)+(changed?1:0),history:changed?[...(previous.history||[]),{shotId:id,time,reason:'mountain-location'}].slice(-30):previous.history,pose};
}
