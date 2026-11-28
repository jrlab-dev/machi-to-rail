import {fullPowerLimit,tractionAcceleration} from './cab-power.mjs?v=rail-90';
import {parallelRoute,trainPoses} from './district.mjs?v=rail-97';
import {formationAdvance,sampleRoute} from './core.mjs?v=rail-97';
import {intercitySpeedLimit} from './intercity-data.mjs?v=rail-90';
import {STATION_LANES,advanceIntercityService,reverseIntercityService} from './intercity-stations.mjs?v=rail-97';
import {isHighSpeed,intercityTrainSpeed} from './train-types.mjs?v=rail-90';
export const INTERCITY_LANES=[-5,0,5,10];
export const LOCAL_SPEED=20;
export function intercityLanePlan(mainType,otherType,stations=true){
 const lanes=stations?STATION_LANES:INTERCITY_LANES;
 const pair=type=>isHighSpeed(type)?[lanes[1],lanes[2]]:[lanes[0],lanes[3]];
 const main=pair(mainType),other=pair(otherType),shared=isHighSpeed(mainType)===isHighSpeed(otherType);
 return {main:main[0],others:shared?[other[1]]:[other[0],main[1],other[1]],shared};
}
export function mapRouteDistance(base,lane,s){
 const d=((s%base.length)+base.length)%base.length;
 const i=base.parts.findIndex(p=>d<p.start+p.r.length);
 const p=base.parts[i],q=lane.parts[i];return q.start+(d-p.start)/p.r.length*q.r.length;
}
export function createIntercityTraffic(base,mainState,formation,mainLength,localFormation,localLength,express=true,stations=false,maxSpeed=express?200/3.6:15,types=null){
 const lanes=stations?STATION_LANES:INTERCITY_LANES,advance=stations?advanceIntercityService:formationAdvance;
 const plan=types?intercityLanePlan(types.main,types.other,stations):{main:0,others:[lanes[2],lanes[0],lanes[3]],shared:false};
 const mainRoute=parallelRoute(base,plan.main),routes=plan.others.map(lane=>parallelRoute(base,lane)),otherSpeed=types?intercityTrainSpeed(types.other):LOCAL_SPEED;
 const dir=mainState.dir<0?-1:1;
 // Calculate the initial timetable once; never reposition a moving train to force a pass.
 let probe={...mainState,speed:0,playing:true},elapsed=0,previous=sampleRoute(base,probe.s)[0];
 while(elapsed<600){probe=advance(base,probe,formation,.02,intercitySpeedLimit(probe.s+dir*14,dir,maxSpeed),mainLength);elapsed+=.02;const p=sampleRoute(base,probe.s);
  if((p[1]<10||p[1]>790)&&p[0]>1200&&p[0]<4800&&(previous-3000)*(p[0]-3000)<=0)break;previous=p[0];
 }
 const wrap=(s,r)=>(s%r.length+r.length)%r.length;
 const meeting=mapRouteDistance(base,routes[0],probe.s);
 let started=false;
 let states=plan.shared?[{s:mapRouteDistance(base,routes[0],mainState.s+dir*5000),dir:-dir,speed:Math.min(otherSpeed,80/3.6),playing:false}]:[{s:wrap(meeting-dir*otherSpeed*elapsed,routes[0]),dir,speed:otherSpeed,playing:false},
  {s:mapRouteDistance(base,routes[1],mainState.s+dir*5000),dir:-dir,speed:express?80/3.6:15,playing:false},
  {s:mapRouteDistance(base,routes[2],mainState.s+dir*3900),dir:-dir,speed:Math.min(otherSpeed,80/3.6),playing:false}];
 states=states.map((s,i)=>({...s,speed:Math.min(s.speed,intercitySpeedLimit(mapRouteDistance(routes[i],base,s.s)+s.dir*14,s.dir,i===1?maxSpeed:otherSpeed))}));
 const formations=states.map((s,i)=>{const f=i===1?formation:localFormation;return f.locomotiveDirection?{...f,locomotiveDirection:s.dir}:f;});
 return{routes,plan,mainRoute,mainCars(state,offsets,currentFormation=formation){return trainPoses(mainRoute,{...state,s:mapRouteDistance(base,mainRoute,state.s)},currentFormation,mainLength,offsets);},get states(){return states;},meeting:{s:probe.s,time:elapsed,position:sampleRoute(base,probe.s)},
  reverseMain(state,currentFormation=formation){const laneState={...state,s:mapRouteDistance(base,mainRoute,state.s)},reversed=reverseIntercityService(laneState,currentFormation,mainLength,mainRoute);return {...reversed,s:mapRouteDistance(mainRoute,base,reversed.s)};},
  stop(){states=states.map(s=>({...s,speed:0,playing:false}));},
  reverse(){states=states.map((s,i)=>reverseIntercityService(s,i===1?formation:localFormation,i===1?mainLength:localLength,routes[i]));},
  advance(dt,playing,otherRequested=Infinity,otherFullPower=false){if(playing)started=true;if(!started)return;states=states.map((s,i)=>{
   const nose=14+s.speed*dt+2*dt*dt;
   const limit=i===0?Math.min(otherFullPower?fullPowerLimit(otherSpeed):otherSpeed,otherRequested):i===1?maxSpeed:otherSpeed;
   const target=Math.min(intercitySpeedLimit(mapRouteDistance(routes[i],base,s.s)+s.dir*14,s.dir,limit),intercitySpeedLimit(mapRouteDistance(routes[i],base,s.s+s.dir*nose),s.dir,limit));
   return advance(routes[i],{...s,playing},i===1?formation:localFormation,dt,target,i===1?mainLength:localLength,.45,tractionAcceleration(i===0&&otherFullPower,types?.other==='maglev'));
  });},
  visual(mainOffsets,localOffsets){return states.map((s,i)=>({cars:trainPoses(routes[i],s,formations[i],i===1?mainLength:localLength,i===1?mainOffsets:localOffsets),speed:started?s.speed:0,service:{dir:s.dir,facing:formations[i].locomotiveDirection,stationPhase:s.stationPhase||'cruise',dwell:s.dwell||0}}));}
 };
}
