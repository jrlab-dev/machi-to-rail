import {formationAdvance} from './core.mjs?v=rail-90';
import {coachDoorPositions} from './scenic-cameras.mjs?v=rail-92';
export const STATIONS=[{id:'akatsuki',name:'あかつき中央',x:300,color:'#c46b42'},{id:'minato',name:'みなと中央',x:5700,color:'#29888c'}];
export const STATION_LANES=[-9,0,9,18],PLATFORM_LENGTH=260;
export function stationAt(body,margin=0){return STATIONS.find(s=>Math.abs(body?.[1]||0)<24&&Math.abs((body?.[0]||0)-s.x)<PLATFORM_LENGTH/2+margin);}
export function platformZ(body){return -(body?.[1]||0)<4.5?-4.5:13.5;}
export function stationStop(station,formation,dir,length){return station.x+dir*(formation.count-1)*(length+.45)/2;}
export function initialIntercityService(formation,dir,length){return {s:stationStop(STATIONS[0],formation,dir,length),dir,speed:0,playing:false,stationPhase:'dwell',dwell:8,departed:0};}
export function advanceIntercityService(route,state,formation,dt,target,length,couplerGap=.45,acceleration=2){
 const s={...state},wrap=x=>(x%route.length+route.length)%route.length;
 if(!s.playing)return formationAdvance(route,s,formation,dt,0,length);
 if(s.stationPhase==='dwell'){s.speed=0;s.dwell=Math.max(0,s.dwell-dt);if(s.dwell===0){s.stationPhase='depart';s.departed=0;}return s;}
 if(s.stationPhase==='depart'&&(s.departed||0)>2)s.stationPhase='cruise';
 const stops=STATIONS.map(station=>({stop:stationStop(station,formation,s.dir,length)}));
 for(const item of stops)item.remaining=wrap((item.stop-s.s)*s.dir);
 const next=stops.sort((a,b)=>a.remaining-b.remaining)[0];
 const approaching=s.stationPhase!=='depart'&&next.remaining<550;
 const limit=approaching?Math.min(target,Math.sqrt(2*1.5*Math.max(0,next.remaining-.02))):target;
 const moved=formationAdvance(route,s,formation,dt,limit,length,couplerGap,acceleration),travel=moved.speed*dt;
 if(approaching&&(next.remaining<=travel+.02||(next.remaining<.08&&moved.speed<.5)))return {...s,s:next.stop,speed:0,stationPhase:'dwell',dwell:8,departed:0};
 return {...moved,departed:(s.departed||0)+travel};
}
export function reverseIntercityService(state,formation,length,route){
 return {...state,s:((state.s-state.dir*(formation.count-1)*(length+.45))%route.length+route.length)%route.length,dir:-state.dir,speed:0,playing:false};
}
export function stationCamera(visual,carLength=27,portrait=false,steam=false){
 const cars=visual.cars||[],p=cars[0]?.body||visual.body,s=stationAt(p,200)||STATIONS.reduce((a,b)=>Math.abs(a.x-p[0])<Math.abs(b.x-p[0])?a:b);
 if(steam){
  const door=coachDoorPositions(visual).filter(p=>Math.abs(p[0]-s.x)<130&&Math.abs(p[2])<24).sort((a,b)=>Math.abs(a[0]-s.x)-Math.abs(b[0]-s.x))[0];
  if(door){const side=Math.sign(platformZ(p)-door[2]);return{position:[door[0]+(portrait?5:3),door[1]+.6,door[2]+side*2.65],target:door,fov:portrait?66:62};}
 }
 const near=cars.filter(c=>Math.abs(c.body[0]-s.x)<145&&Math.abs(c.body[1])<24);
 if(!near.length)return {position:[s.x+24,10.65,-2.65],target:[s.x,10,0],fov:62};
 const ref=near.reduce((best,c)=>!best||Math.abs(c.body[0]-(s.x+50))<Math.abs(best.body[0]-(s.x+50))?c:best,null);
 const x=visual.speed<.01&&ref?ref.body[0]+(carLength>24?(ref.tail?1:-1)*(Math.sign(Math.cos(ref.body[2]))||1)*10.7:0):Math.max(Math.min(...near.map(c=>c.body[0])),Math.min(s.x+60,Math.max(...near.map(c=>c.body[0]))));
 const z=platformZ(p),track=-p[1],side=Math.sign(z-track),dir=Math.sign(Math.cos(p[2]))||1;
 return {position:[x+dir*(portrait?9:7),10.65,track+side*2.65],target:[x,10,track],fov:portrait?66:62};
}
