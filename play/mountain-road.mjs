import {routeFrom,LOWER_CURVES,FIRST_CLIMB_CURVES,MUSEUM_CLIMB_CURVES} from './mountain-route-geometry.mjs?v=train-limit-65';
export const MOUNTAIN_BUS_ID='mountain-tour-bus';
export const MOUNTAIN_MINIBUS_ID='kindergarten-minibus';
export const MOUNTAIN_ROAD_WIDTH=8;
const controls=[[256,281,29.5],[310,281,31.5],[440,300,42],[780,340,66],[420,410,90],[830,480,116],[480,550,142],[600,600,156],[520,650,170.32],[485,680,170.32],[485,703,171.16],[485,723,171.16],[485,743,170.32],[485,760,170.32],[485,780,170.32]];
// Rounded corners, with linear height interpolation, keep the road inside its corridor.
const points=[];
function line(a,b){const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));for(let j=1;j<=steps;j++)points.push(a.map((v,k)=>v+(b[k]-v)*j/steps));}
const lower=routeFrom(LOWER_CURVES,true,true);
for(let d=0;d<lower.length;d+=2){const p=lower.sample(d);points.push([p[0]+Math.sin(p[2])*22,p[1]-Math.cos(p[2])*22,p[3]-.8-3.2*Math.min(1,d/400)**2]);}
const end=lower.sample(lower.length);points.push([end[0],end[1]-22,end[3]-4]);
const lowerCount=points.length,lowerHeight=end[3]-4;
const joinStart=points.at(-1);
for(let i=1;i<=90;i++){const t=i/90,u=1-t;points.push([u*u*u*joinStart[0]+3*u*u*t*156+3*u*t*t*200+t*t*t*256,u*u*u*joinStart[1]+3*u*u*t*238+3*u*t*t*281+t*t*t*281,lowerHeight]);}
for(let i=1;i<controls.length-1;i++){const a=controls[i-1],b=controls[i],c=controls[i+1],la=Math.hypot(b[0]-a[0],b[1]-a[1]),lb=Math.hypot(c[0]-b[0],c[1]-b[1]),incoming=Math.atan2(b[1]-a[1],b[0]-a[0]),outgoing=Math.atan2(c[1]-b[1],c[0]-b[0]),angle=Math.atan2(Math.sin(outgoing-incoming),Math.cos(outgoing-incoming));if(Math.abs(angle)<.001){line(points.at(-1),b);continue;}const cut=Math.min(12*Math.tan(Math.abs(angle)/2),la*.42,lb*.42),radius=cut/Math.tan(Math.abs(angle)/2),p=b.map((v,k)=>v+(a[k]-v)*cut/la),q=b.map((v,k)=>v+(c[k]-v)*cut/lb),sign=Math.sign(angle),cx=p[0]-Math.sin(incoming)*sign*radius,cy=p[1]+Math.cos(incoming)*sign*radius,start=Math.atan2(p[1]-cy,p[0]-cx),steps=Math.max(8,Math.ceil(Math.abs(angle)*radius/.5));line(points.at(-1),p);for(let j=1;j<=steps;j++){const t=j/steps,theta=start+angle*t;points.push([cx+radius*Math.cos(theta),cy+radius*Math.sin(theta),p[2]+(q[2]-p[2])*t]);}}

line(points.at(-1),controls.at(-1));
let distance=0;
export const MOUNTAIN_ROAD=points.map((p,i)=>{if(i)distance+=Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1]);return {p,d:distance};});
export const MOUNTAIN_ROAD_LENGTH=distance;
const [lowerX,lowerY,lowerYardHeight]=MOUNTAIN_ROAD[0].p;
// The lower turn extends past the end of the road toward the east.
export const MOUNTAIN_LOWER_APRON={x:lowerX+1.5,y:lowerY,height:lowerYardHeight,width:26,depth:22};
const closest=(x,y)=>MOUNTAIN_ROAD.reduce((a,b)=>Math.hypot(b.p[0]-x,b.p[1]-y)<Math.hypot(a.p[0]-x,a.p[1]-y)?b:a);
const bridgeEnd=closest(310,281).d,top=closest(540,637).d;
const elevationStops=[[MOUNTAIN_ROAD[lowerCount-1].d,lowerHeight],[bridgeEnd,31.5],[top,170.32],[closest(485,703).d,171.16],[closest(485,733).d,171.16],[closest(485,750).d,170.32],[distance,170.32]];
for(const row of MOUNTAIN_ROAD.slice(lowerCount)){let i=1;while(i<elevationStops.length-1&&row.d>elevationStops[i][0])i++;const a=elevationStops[i-1],b=elevationStops[i];row.p[2]=a[1]+(b[1]-a[1])*(row.d-a[0])/(b[0]-a[0]);}

export function roadSample(d){d=Math.max(0,Math.min(distance,d));let lo=1,hi=MOUNTAIN_ROAD.length-1;while(lo<hi){const m=(lo+hi)>>1;if(MOUNTAIN_ROAD[m].d<d)lo=m+1;else hi=m;}const a=MOUNTAIN_ROAD[lo-1],b=MOUNTAIN_ROAD[lo],t=(d-a.d)/(b.d-a.d||1);return [a.p[0]+(b.p[0]-a.p[0])*t,a.p[1]+(b.p[1]-a.p[1])*t,Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0]),a.p[2]+(b.p[2]-a.p[2])*t,Math.atan2(b.p[2]-a.p[2],b.d-a.d)];}
// Follow the unchanged railway; turn before the second shared stem to avoid crossing it.
export const MOUNTAIN_MUSEUM_ROAD=[];
function museumPoint(p){const last=MOUNTAIN_MUSEUM_ROAD.at(-1);const ds=last?Math.hypot(p[0]-last.p[0],p[1]-last.p[1]):0;if(last&&ds<1e-6)return;MOUNTAIN_MUSEUM_ROAD.push({p,d:(last?.d||0)+ds});}
museumPoint([...MOUNTAIN_ROAD[lowerCount-1].p]);
function switchLoop(x,y,height,start){for(let i=1;i<=80;i++){const angle=start+Math.PI*i/80;museumPoint([x+22*Math.cos(angle),y+22*Math.sin(angle),height]);}}
switchLoop(100,260,lowerHeight,-Math.PI/2);
const firstClimb=routeFrom(FIRST_CLIMB_CURVES,true,true),museumClimb=routeFrom(MUSEUM_CLIMB_CURVES,true,true);
function parallelRoad(route,limit,start=0){for(let d=start;d<limit;d+=1){const p=route.sample(d);museumPoint([p[0]+Math.sin(p[2])*22,p[1]-Math.cos(p[2])*22,p[3]-4]);}const p=route.sample(limit);museumPoint([p[0]+Math.sin(p[2])*22,p[1]-Math.cos(p[2])*22,p[3]-4]);}
parallelRoad(firstClimb,200);
const bendStart=MOUNTAIN_MUSEUM_ROAD.at(-1).p;
const next=museumClimb.sample(260),bendEnd=[next[0]+Math.sin(next[2])*22,next[1]-Math.cos(next[2])*22,next[3]-4];
const bend=[bendStart,[-130,342,65],[-155,360,75],bendEnd];
for(let i=1;i<=100;i++){const t=i/100,u=1-t;museumPoint([0,1,2].map(k=>u*u*u*bend[0][k]+3*u*u*t*bend[1][k]+3*u*t*t*bend[2][k]+t*t*t*bend[3][k]));}
const museumStop=museumClimb.samples.reduce((a,b)=>Math.hypot(b.p[0]+10,b.p[1]-470)<Math.hypot(a.p[0]+10,a.p[1]-470)?b:a).d;
parallelRoad(museumClimb,museumStop-55,260);
const approach=MOUNTAIN_MUSEUM_ROAD.at(-1).p;
const entrance=[52.2254,475.65685,86.05];
const entranceCurve=[approach,[approach[0]+30,approach[1]+30,84.8],[31,454.43,86.05],entrance];
for(let i=1;i<=120;i++){const t=i/120,u=1-t;museumPoint([0,1,2].map(k=>u*u*u*entranceCurve[0][k]+3*u*u*t*entranceCurve[1][k]+3*u*t*t*entranceCurve[2][k]+t*t*t*entranceCurve[3][k]));}
// A constant gentle climb avoids the railway's steeper reversing ramps.
const museumLength=MOUNTAIN_MUSEUM_ROAD.at(-1).d;
for(const row of MOUNTAIN_MUSEUM_ROAD)row.p[2]=lowerHeight+(86.05-lowerHeight)*Math.max(0,row.d-MOUNTAIN_MUSEUM_ROAD[80].d)/(museumLength-MOUNTAIN_MUSEUM_ROAD[80].d);
// Museum forecourt stays beyond the sculpture garden's outer edge.
export const MOUNTAIN_MUSEUM_TURN={x:entrance[0]+Math.SQRT1_2*28,y:entrance[1]+Math.SQRT1_2*28,height:86.05,radius:16};
const museumExtension=[];
for(let i=0;i<=28;i++)museumExtension.push({p:[entrance[0]+Math.SQRT1_2*i,entrance[1]+Math.SQRT1_2*i,86.05],d:i});
export const MOUNTAIN_BUS_SPUR=[...MOUNTAIN_MUSEUM_ROAD,...museumExtension.slice(1).map(r=>({p:r.p,d:museumLength+r.d}))];
export const MOUNTAIN_BUS_MERGE=[];
const mergeStart=MOUNTAIN_MUSEUM_ROAD[40].p,mergeEnd=closest(198,268),mergeCurve=[mergeStart,[122,230,50],[165,255,44],mergeEnd.p];
let mergeDistance=0;
for(let i=0;i<=120;i++){const t=i/120,u=1-t,p=[0,1,2].map(k=>u*u*u*mergeCurve[0][k]+3*u*u*t*mergeCurve[1][k]+3*u*t*t*mergeCurve[2][k]+t*t*t*mergeCurve[3][k]);const last=MOUNTAIN_BUS_MERGE.at(-1);if(last)mergeDistance+=Math.hypot(p[0]-last.p[0],p[1]-last.p[1]);MOUNTAIN_BUS_MERGE.push({p,d:mergeDistance});}
for(const row of MOUNTAIN_BUS_MERGE)row.p[2]=mergeStart[2]+(mergeEnd.p[2]-mergeStart[2])*row.d/mergeDistance;
export function museumRoadWidth(p){const d=Math.hypot(p[0]-MOUNTAIN_MUSEUM_TURN.x,p[1]-MOUNTAIN_MUSEUM_TURN.y);return 12+10*Math.max(0,1-d/65);}
// Only nearby buckets are searched for terrain shaping and planting exclusions.
const buckets=new Map();for(const path of [MOUNTAIN_ROAD,MOUNTAIN_BUS_SPUR,MOUNTAIN_BUS_MERGE])for(let i=1;i<path.length;i++){const a=path[i-1].p,b=path[i].p;for(let x=Math.floor((Math.min(a[0],b[0])-30)/40);x<=Math.floor((Math.max(a[0],b[0])+30)/40);x++)for(let y=Math.floor((Math.min(a[1],b[1])-30)/40);y<=Math.floor((Math.max(a[1],b[1])+30)/40);y++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push({a,b});}}
export function nearestMountainRoad(x,y){let best={distance:Infinity,height:0},floor=Infinity;for(const {a,b} of buckets.get(Math.floor(x/40)+','+Math.floor(y/40))||[]){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),distance=Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);const height=a[2]+(b[2]-a[2])*t;if(distance<14)floor=Math.min(floor,height);if(distance<best.distance)best={distance,height};}if(Number.isFinite(floor))best.height=floor;const turnDistance=Math.hypot(x-MOUNTAIN_MUSEUM_TURN.x,y-MOUNTAIN_MUSEUM_TURN.y);if(turnDistance<42)return {distance:Math.min(best.distance,Math.max(0,turnDistance-16)),height:Math.min(best.height||Infinity,MOUNTAIN_MUSEUM_TURN.height)};return best;}
export function mountainRoadPaved(x,y){if(Math.hypot(x-MOUNTAIN_MUSEUM_TURN.x,y-MOUNTAIN_MUSEUM_TURN.y)<=16)return true;
 for(const path of[MOUNTAIN_ROAD,MOUNTAIN_BUS_SPUR,MOUNTAIN_BUS_MERGE])for(let i=1;i<path.length;i++){const a=path[i-1].p,b=path[i].p,dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),p=[a[0]+dx*t,a[1]+dy*t];if(Math.hypot(x-p[0],y-p[1])<=(path===MOUNTAIN_BUS_SPUR?museumRoadWidth(p)/2:4))return true;}return false;}
export const MOUNTAIN_TURNTABLE={x:485,y:780,height:170.32,radius:7.5};
const speed=6,bottomDwell=6,topDwell=12,slowDistance=24,slowTime=8,travel=(distance-slowDistance)/speed+slowTime,cycle=2*travel+topDwell+bottomDwell;

const nearY=y=>MOUNTAIN_ROAD.reduce((a,b)=>Math.hypot(b.p[0]-485,b.p[1]-y)<Math.hypot(a.p[0]-485,a.p[1]-y)?b:a).d;
// The gates are at y=711 and y=735. Leave room for the bus nose on both approaches.
const lightOffset=travel+topDwell;
const cycleTime=time=>((time%cycle)+cycle)%cycle;
const busStops=[nearY(704)/speed,travel+topDwell+slowTime+(distance-nearY(742)-slowDistance)/speed];
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function vehicleTurntableState(time){const t=cycleTime(time),elapsed=t-travel,u=Math.max(0,Math.min(1,(elapsed-2)/8));return {angle:Math.PI*ease(u),occupied:elapsed>=0&&elapsed<=topDwell,rotating:elapsed>2&&elapsed<10,phase:elapsed<0?'approach':elapsed<2?'stop':elapsed<10?'rotate':elapsed<12?'ready':'depart'};}
function vehicleFrame(time,id,axleHalf){
 const t=cycleTime(time),reverse=t>=travel+topDwell,phase=reverse?t-travel-topDwell:t;
 let d;if(reverse)d=distance-(phase<slowTime?slowDistance*(phase/slowTime)**2:Math.min(distance,slowDistance+(phase-slowTime)*speed));else{const start=travel-slowTime,u=Math.max(0,Math.min(1,(phase-start)/slowTime));d=phase<start?phase*speed:distance-slowDistance+slowDistance*(2*u-u*u);}
 d=Math.max(0,Math.min(distance,d));
 const p=roadSample(d);
 // The two axles follow a chord across bends and grade changes.
 const halfWheelbase=Math.min(axleHalf,d,distance-d);
 if(halfWheelbase>.01){
  const a=roadSample(d-halfWheelbase),b=roadSample(d+halfWheelbase);
  p[0]=(a[0]+b[0])/2;
  p[1]=(a[1]+b[1])/2;
  p[2]=Math.atan2(b[1]-a[1],b[0]-a[0]);
  p[3]=(a[3]+b[3])/2;
  p[4]=Math.atan2(b[3]-a[3],Math.hypot(b[0]-a[0],b[1]-a[1]));
 }
 const yaw=p[2]+(reverse?Math.PI:0),lane=1.6*ease((distance-d)/18);
 const turn=reverse&&phase>travel?Math.min(1,(phase-travel)/bottomDwell)*Math.PI:0;
 const forward=8*Math.sin(turn),side=lane*Math.cos(turn),table=vehicleTurntableState(time);
 const heading=table.occupied?p[2]+table.angle:turn?yaw+Math.atan2(-lane*Math.sin(turn),8*Math.cos(turn)):yaw;
 return {id,body:[p[0]+Math.cos(yaw)*forward-Math.sin(yaw)*side,p[1]+Math.sin(yaw)*forward+Math.cos(yaw)*side,heading,p[3]+.03*ease((d-(distance-10))/3),table.occupied?0:reverse?-p[4]:p[4]],trailer:p};
}
// The bus follows the museum spur once on the outbound trip, then the existing summit road.
function samplePath(path,d){d=Math.max(0,Math.min(path.at(-1).d,d));let lo=1,hi=path.length-1;while(lo<hi){const m=(lo+hi)>>1;if(path[m].d<d)lo=m+1;else hi=m;}const a=path[lo-1],b=path[lo],t=(d-a.d)/(b.d-a.d||1);return [a.p[0]+(b.p[0]-a.p[0])*t,a.p[1]+(b.p[1]-a.p[1])*t,Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0]),a.p[2]+(b.p[2]-a.p[2])*t];}
const busPrelude=[];
function busPoint(p){const last=busPrelude.at(-1),ds=last?Math.hypot(p[0]-last.p[0],p[1]-last.p[1]):0;if(last&&ds<1e-7)return;busPrelude.push({p,d:(last?.d||0)+ds});}
function lanePoint(p,lane){return [p[0]-Math.sin(p[2])*lane,p[1]+Math.cos(p[2])*lane,p[3]];}
const stationDistance=38,spurLength=MOUNTAIN_BUS_SPUR.at(-1).d;
for(let d=stationDistance;d<MOUNTAIN_ROAD[lowerCount-1].d;d+=.5)busPoint(lanePoint(roadSample(d),1.6));
for(let d=0;d<=spurLength;d+=.5){const p=samplePath(MOUNTAIN_BUS_SPUR,d),lane=1.6+7.4*ease((d-(spurLength-65))/65);busPoint(lanePoint(p,lane));}
const stopPoint=samplePath(MOUNTAIN_BUS_SPUR,spurLength);busPoint(lanePoint(stopPoint,9));
export const MOUNTAIN_BUS_MUSEUM_ARRIVAL=busPrelude.at(-1).d/speed;
for(let i=1;i<=180;i++){const angle=Math.PI*i/180,forward=9*Math.sin(angle),side=9*Math.cos(angle);busPoint([stopPoint[0]+Math.cos(stopPoint[2])*forward-Math.sin(stopPoint[2])*side,stopPoint[1]+Math.sin(stopPoint[2])*forward+Math.cos(stopPoint[2])*side,stopPoint[3]]);}
for(let d=spurLength-.5;d>MOUNTAIN_MUSEUM_ROAD[40].d;d-=.5){const p=samplePath(MOUNTAIN_BUS_SPUR,d),lane=1.6+7.4*ease((d-(spurLength-65))/65);busPoint(lanePoint(p,-lane));}
for(let d=0;d<=mergeDistance;d+=.5)busPoint(lanePoint(samplePath(MOUNTAIN_BUS_MERGE,d),1.6));
busPoint(lanePoint(roadSample(mergeEnd.d),1.6));
const museumDwell=4,preludeTravel=busPrelude.at(-1).d/speed+museumDwell,busDelay=preludeTravel-mergeEnd.d/speed,extra=busDelay+stationDistance/speed,serviceCycle=cycle+extra;
export const MOUNTAIN_ROAD_TIMING={travel:travel+busDelay,topDwell,bottomDwell,cycle:serviceCycle,museumArrival:MOUNTAIN_BUS_MUSEUM_ARRIVAL,museumDwell};
const serviceTime=time=>((time%serviceCycle)+serviceCycle)%serviceCycle;
function busTime(t){return t-busDelay;}
function lightTime(t){const hold=travel+bottomDwell;return lightOffset+(t<hold?t:t<hold+extra?hold:t-extra);}
export const MOUNTAIN_LIGHT_OFFSET=slowTime+(distance/2-slowDistance)/speed;
export function mountainTurntableState(time){const t=serviceTime(time),bus=t>=preludeTravel?vehicleTurntableState(busTime(t)):{occupied:false},light=vehicleTurntableState(lightTime(t));const middle=vehicleTurntableState(lightTime(serviceTime(t+MOUNTAIN_LIGHT_OFFSET)));return bus.occupied?bus:light.occupied?light:middle;}
export function advanceMountainRoadTime(time,dt,closed){if(!closed)return time+dt;const events=[...busStops.map(t=>t+busDelay),cycleTime(busStops[1]-lightOffset),cycleTime(busStops[0]-lightOffset)+extra,...[cycleTime(busStops[1]-lightOffset),cycleTime(busStops[0]-lightOffset)+extra].map(at=>serviceTime(at-MOUNTAIN_LIGHT_OFFSET))].sort((a,b)=>a-b),base=Math.floor(time/serviceCycle)*serviceCycle;for(const at of events.map(t=>base+t))if(time<=at+1e-7&&time+dt>=at)return at;return time+dt;}
export function mountainRoadFrame(time){const t=serviceTime(time);let bus;
 if(t<preludeTravel){const arrival=MOUNTAIN_BUS_MUSEUM_ARRIVAL,elapsed=t<arrival?t:t<arrival+museumDwell?arrival:t-museumDwell,d=elapsed*speed,p=samplePath(busPrelude,d),a=samplePath(busPrelude,d-2.65),b=samplePath(busPrelude,d+2.65);bus={id:MOUNTAIN_BUS_ID,body:[p[0],p[1],Math.atan2(b[1]-a[1],b[0]-a[0]),p[3],Math.atan2(b[3]-a[3],Math.hypot(b[0]-a[0],b[1]-a[1]))],trailer:p};}
 else bus=vehicleFrame(busTime(t),MOUNTAIN_BUS_ID,2.65);
 return [bus,vehicleFrame(lightTime(t),MOUNTAIN_MINIBUS_ID,1.85),vehicleFrame(lightTime(serviceTime(t+MOUNTAIN_LIGHT_OFFSET)),'nbox',1.26)];
}
