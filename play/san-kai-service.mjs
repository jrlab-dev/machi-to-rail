import {stations,services,sample,length} from './san-kai-route.mjs?v=rail-97';
export const center=m=>18*Math.sin(m/430)+12*Math.sin(m/318);
export const lanes=[-2.2,2.2].map(offset=>({parts:[],closed:false,length,
 sample(m){return [center(m)+offset,m,Math.atan2(1,(center(m+.1)-center(m-.1))*5),1.28,0];}
}));
export function newService(kind,other=false){
 const duration=services[kind].duration;
 const t=other?duration*.71:0;
 return {kind,t,elapsed:0,boarding:other?0:8,stationPhase:other?'run':'dwell',dwell:other?0:8,dwellDuration:8,s:sample(services[kind],t).m,dir:other?-1:1,speed:0,playing:false};
}
export function advanceTrip(state,dt,limit){
 if(!state.playing)return {...state,speed:0};
 if(state.boarding>0){
  const boarding=Math.max(0,state.boarding-dt);
  const waiting={...state,boarding,dwell:boarding,speed:0};
  return dt>state.boarding?advanceTrip(waiting,dt-state.boarding,limit):waiting;
 }
 const plan=services[state.kind],probe=sample(plan,state.t),factor=Math.min(1,Math.max(0,limit)/Math.max(.01,probe.v));
 const t=Math.max(0,Math.min(plan.duration,state.t+dt*factor*state.dir));
 const point=sample(plan,t),stopped=state.dir>0?t===plan.duration:t===0;
 const arrival=point.station&&plan.arrivals.find(a=>a.station===point.station);
 const duration=state.kind==='local'?10:12;
 return {...state,t,s:point.m,elapsed:state.elapsed+dt,speed:stopped?0:Math.min(limit,point.v),playing:!stopped,
  stationPhase:point.station?'dwell':'run',dwellDuration:duration,dwell:arrival?Math.max(0,state.dir>0?arrival.at+duration-t:t-arrival.at):0};
}
export function tripStation(m){return stations.reduce((a,b)=>Math.abs(b.m-m)<Math.abs(a.m-m)?b:a)}
export function tripLabel(state){
 const near=tripStation(state.s);
 if(Math.abs(near.m-state.s)<1&&state.speed<.1)return near.name+'　停車中';
 if(state.kind==='express'&&!near.express&&Math.abs(near.m-state.s)<90)return near.name+'　通過';
 const stops=services[state.kind].arrivals;
 const next=state.dir>0?stops.find(a=>a.station.m>state.s):stops.findLast(a=>a.station.m<state.s);
 return '次は '+(next?.station.name||near.name);
}
