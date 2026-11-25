import {normalizeDesign} from './train-design.mjs?v=marks-88';
import {largeTown} from './large-town.mjs?v=marks-88';
import {ROAD_TYPES,defaultFormation,makeRoute,transform,point,sampleRoute,formationLength} from './core.mjs?v=marks-88';
export const DISTRICT='midori-central-v1';
export const STATION={name:'みどり中央',start:90,end:330,offset:10,dwell:8};
export function districtTown(kit){
  const source=largeTown(kit),rails=source.rails.map(r=>({...r,piece:r.piece==='crossing'?'straight_short':r.piece}));
  const props=source.props.filter(p=>ROAD_TYPES.includes(p.type)&&p.pose[1]>=40&&p.pose[1]<=240);
  const corner=props.find(p=>p.pose[0]===5&&p.pose[1]===40);corner.type='corner';corner.pose[2]=0;
  let uid=Math.max(...props.map(p=>p.uid))+1;
  const add=(type,x,y,scale=1,angle=0,tint='#ffffff')=>props.push({uid:uid++,type,pose:[x,y,angle],scale,tint});
  for(const y of[65,115,165,215])for(const x of[33,61,89,117,145,173,237,265,293,321,349]){
    const n=Math.round(x+y),central=y===65&&x>89&&x<322;
    const type=central?['office','hotel','office'][n%3]:['shop','apartment','office','shop'][n%4];
    add(type,x,y,central?1.15+(n%4)*.17:type==='shop'?.7+(n%3)*.15:.6+(n%5)*.13,y===65||y===165?-Math.PI/2:Math.PI/2,['#e3e5e2','#f1e4d2','#d5e1e4','#e5e0d9'][n%4]);
  }
  for(const y of[20,260])for(const x of[35,65,355,385])add('shop',x,y,.8,y===20?Math.PI/2:-Math.PI/2);
  for(let i=0;i<9;i++)add(i%3===0?'apartment':'shop',88+i*29,260,.8+i%3*.15,-Math.PI/2);
  for(let i=0;i<10;i++){add('tree',24+i*38,26,1);add('tree',24+i*38,250,1.1);}
  for(const y of[-85,-45])for(let x=95;x<=315;x+=20){let type='road',a=0;if(x===95){type='corner';a=y===-85?0:-Math.PI/2;}if(x===315){type='corner';a=y===-85?Math.PI/2:Math.PI;}add(type,x,y,1,a);}
  for(const x of[95,315])add('road',x,-65,1,Math.PI/2);
  for(let i=0;i<8;i++)add('shop',128+i*22,-65,.65+i%3*.12,Math.PI/2);
  return{format:'rail-town',version:3,rails,props,train:'original',oppositeTrain:'original',trainDesign:normalizeDesign(),oppositeTrainDesign:normalizeDesign(undefined,1),formation:defaultFormation(6),district:DISTRICT};
}
export function isDistrict(town,kit){
  if(town?.district!==DISTRICT)return false;
  const expected=largeTown(kit).rails;
  return town.rails.length===expected.length&&expected.every((r,i)=>{const p=town.rails[i];return p.piece===(r.piece==='crossing'?'straight_short':r.piece)&&p.pose.every((v,j)=>Math.abs(v-r.pose[j])<1e-6)});
}
// Exact parallel curve: offset the starting pose and increase each arc radius.
export function parallelRoute(route,offset=STATION.offset){
  let length=0;const parts=route.parts.map(p=>{
    if(p.rev)throw Error('専用対向線の経路が不正です');
    const a=p.it.pose[2],pose=[p.it.pose[0]+Math.sin(a)*offset,p.it.pose[1]-Math.cos(a)*offset,a];
    const r=p.r.kind==='arc'?{...p.r,radius:p.r.radius+offset*Math.sign(p.r.angle),length:(p.r.radius+offset*Math.sign(p.r.angle))*Math.abs(p.r.angle)}:{...p.r};
    const result={...p,it:{...p.it,pose},r,start:length};length+=r.length;return result;
  });return{parts,length,closed:route.closed};
}
export function trainPoses(route,state,formation,carLength=20.9,bogieOffset=6.9){
  const dir=state.dir<0?-1:1,spacing=carLength+.45,facing=formation.locomotiveDirection||dir,backing=facing!==dir;
  return formation.cars.map((car,i)=>{
    const spec=Array.isArray(bogieOffset)?(bogieOffset[i]||[6.9,-6.9]):[bogieOffset,-bogieOffset],offsets=spec.bogies||spec,tail=!formation.locomotiveDirection&&formation.count>1&&i===formation.count-1;
    const local=tail?[-offsets[1],-offsets[0]]:offsets;
    const slot=backing?formation.count-1-i:i,d=state.s-dir*slot*spacing,forward=sampleRoute(route,d+facing*local[0]),rear=sampleRoute(route,d+facing*local[1]),weight=-local[1]/(local[0]-local[1]);
    const body=[rear[0]+(forward[0]-rear[0])*weight,rear[1]+(forward[1]-rear[1])*weight,Math.atan2(forward[1]-rear[1],forward[0]-rear[0])];
    if(forward.length===5||rear.length===5){body.push((rear[3]||0)+((forward[3]||0)-(rear[3]||0))*weight,Math.atan2((forward[3]||0)-(rear[3]||0),Math.hypot(forward[0]-rear[0],forward[1]-rear[1])));for(const p of[forward,rear]){if(p.length===3)p.push(0,0);p[4]*=facing;}}forward[2]+=facing<0?Math.PI:0;rear[2]+=facing<0?Math.PI:0;
    if(Number.isFinite(spec.bodyAnchor)){
      const anchor=spec.bodyAnchor,p=sampleRoute(route,d+facing*anchor),angle=p[2]+(facing<0?Math.PI:0),pitch=(p[4]||0)*facing;
      body[0]=p[0]-anchor*Math.cos(angle)*Math.cos(pitch);body[1]=p[1]-anchor*Math.sin(angle)*Math.cos(pitch);body[2]=angle;
      if(p.length===5){body[3]=(p[3]||0)-anchor*Math.sin(pitch);body[4]=pitch;}
    }
    return{body,front:tail?rear:forward,back:tail?forward:rear,tail};
  });
}

export function stopPosition(formation,dir,carLength=20.9){
  const length=formationLength(formation,carLength);
  return(STATION.start+STATION.end)/2+(dir>0?1:-1)*(length/2-carLength/2);
}
export function initialService(route,formation,dir=1,carLength=20.9){
  return{s:stopPosition(formation,dir,carLength),dir,speed:0,playing:false,dwell:STATION.dwell,stationPhase:'dwell',departed:0};
}
export function advanceService(route,state,formation,dt,targetSpeed,carLength=20.9){
  const s={...state};if(!s.playing){s.speed=Math.max(0,s.speed-2.2*dt);s.s=(s.s+s.dir*s.speed*dt+route.length)%route.length;return s;}
  if(s.stationPhase==='dwell'){s.speed=0;s.dwell=Math.max(0,s.dwell-dt);if(s.dwell<=0){s.stationPhase='depart';s.departed=0;}return s;}
  const stop=stopPosition(formation,s.dir,carLength);
  const remaining=((stop-s.s)*s.dir+route.length)%route.length;
  if(s.stationPhase==='depart'&&s.departed>30)s.stationPhase='cruise';
  const approaching=s.stationPhase!=='depart'&&remaining<160;
  const limit=approaching?Math.min(targetSpeed,Math.sqrt(2*1.2*Math.max(0,remaining-.015))):targetSpeed;
  s.speed=Math.max(0,s.speed+Math.max(-1.8*dt,Math.min(.85*dt,limit-s.speed)));
  const travel=s.speed*dt;
  if(approaching&&(remaining<=travel+.015||remaining<.07&&s.speed<.4))return{...s,s:stop,speed:0,stationPhase:'dwell',dwell:STATION.dwell};
  s.s=(s.s+s.dir*travel+route.length)%route.length;s.departed+=travel;return s;
}
export function reverseService(route,state,formation,carLength=20.9){
  const s=(state.s-state.dir*(formation.count-1)*(carLength+.45)+route.length)%route.length;
  return{...state,s,dir:-state.dir,speed:0,playing:false,stationPhase:state.stationPhase==='dwell'?'dwell':'depart',departed:0};
}
export function districtRoutes(kit){const town=districtTown(kit),main=makeRoute(town.rails,kit);return{town,main,opposite:parallelRoute(main)}}
