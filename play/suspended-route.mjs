import {stepLoop} from './station-loop.mjs?v=rail-towns-71';
export const isSuspended=t=>t?.suspended==='shiomi-v1';
export const suspendedStations=[
  {name:'潮見中央ビル',s:70},{name:'桜ヶ丘住宅前',s:540},{name:'緑谷公園',s:1040},
  {name:'山の手口',s:1500},{name:'潮見海岸',s:2060}
];
const length=2140,spacing=15.75,half=spacing/2;
function ease(x,a,b){const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);}
export const northing=x=>56*ease(x,145,470)-122*ease(x,600,982)+104*ease(x,1100,1440)-81*ease(x,1560,1990);
export const floorHeight=x=>12-2*ease(x,220,480)+18*ease(x,600,980)+15*ease(x,1100,1450)-34*ease(x,1550,2005);
export const portal=[1580,1810];
export const rockCuts=[[1552,portal[0]],[portal[1],1850]];
// Cross section measured laterally from the centre of the double track.
export function cutProfile(x,side){
  const distance=Math.min(Math.abs(x-portal[0]),Math.abs(x-portal[1]));
  const run=x<=portal[0]?portal[0]-rockCuts[0][0]:rockCuts[1][1]-portal[1];
  const shoulder=1-ease(distance,side>0?10:14,run);
  const pinch=7.9+3*(1-shoulder)+.55*Math.sin(x*.37+side);
  const face=11.1+(pinch-11.1)*ease(distance,0,6);
  const height=-9+shoulder*(20+2.2*Math.sin(x*.28+side));
  return [[face,-9],[face+.35,-9+(height+9)*.46],[face+1.15,height],
    [face+5,height+2*shoulder],[face+23,-9.2]];
}
export function railSample(x,offset){
  const slope=(northing(x+.1)-northing(x-.1))*5,yaw=Math.atan(slope);
  return [x-offset*Math.sin(yaw),northing(x)+offset*Math.cos(yaw),yaw,floorHeight(x),Math.atan((floorHeight(x+.1)-floorHeight(x-.1))*5/Math.hypot(1,slope))];
}
export function lane(x,dir){return dir>0?4.5-9*ease(x,1895,1980):4.5-9*ease(x,145,230);}
function serviceRoute(dir){return {length,closed:false,parts:[],sample(x){
  const p=railSample(x,lane(x,dir)),a=railSample(x-.1,lane(x-.1,dir)),b=railSample(x+.1,lane(x+.1,dir));
  p[2]=Math.atan2(b[1]-a[1],b[0]-a[0]);return p;
}};}
export const suspendedRoutes=[serviceRoute(1),serviceRoute(-1)];
export const lineFor=state=>suspendedRoutes[state.dir>0?0:1];
export function startSuspended(other=false){
  const station=other?4:0,dir=other?-1:1;
  return {s:suspendedStations[station].s+dir*half,station,dir,dwell:4,speed:0,playing:false,stationPhase:'dwell'};
}
export function advanceSuspended(state,dt,speed,formation){
  let next=stepLoop(state,dt,speed,formation,15.3,suspendedStations,length);
  if(state.stationPhase==='running'&&next.stationPhase==='dwell'&&(next.station===0||next.station===4)){
    next.s-=next.dir*spacing;next.dir*=-1;next.dwell=6;
  }
  if(state.stationPhase==='running'&&next.stationPhase==='dwell')next.dwellDuration=next.dwell;
  return next;
}
export function platformCenter(body){
  const nearest=suspendedStations.reduce((a,b)=>Math.abs(body[0]-a.s)<Math.abs(body[0]-b.s)?a:b);
  const y=northing(nearest.s);return -y+(body[1]>y?-1:1)*8.5;
}
