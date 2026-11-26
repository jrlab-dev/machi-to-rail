import {isHighSpeed} from './train-types.mjs?v=rail-90';
import {fullPowerLimit} from './cab-power.mjs?v=rail-90';
import {nearestMountainRoad} from './mountain-road.mjs?v=rail-90';
export const MOUNTAIN_ID='onsen-mountain-v1';
export const isMountain=scene=>scene?.mountain===MOUNTAIN_ID;
export const mountainTypeAllowed=type=>!isHighSpeed(type);
export const MOUNTAIN_HOTELS=[20,65,110,155,200].map((x,i)=>({x,y:165,width:28,depth:22,floors:6+i%3,base:i===4?25:32,name:'温泉ホテル '+(i+1)}));
export const MOUNTAIN_STATIONS=['温泉街','森の美術館前','山腹','見晴らし'];
export function mountainTown(){return {format:'rail-town',version:3,mountain:MOUNTAIN_ID,rails:[],props:[],train:'original',oppositeTrain:'original',formation:{count:2,assetVersion:'legacy-cab-v1',cars:[{id:'car-1',kind:'cab',orientation:'front',roofVariant:'pantograph'},{id:'car-2',kind:'cab',orientation:'rear',roofVariant:'plain'}]}};}

import {routeFrom,line,LOWER_CURVES,FIRST_CLIMB_CURVES,MUSEUM_CLIMB_CURVES,mountainElevation} from './mountain-route-geometry.mjs?v=rail-90';
export {mountainElevation};
const a=[20,260,24],ae=[100,260,24],b=[-300,380,35],be=[-380,380,35],c=[80,600,39.7],ce=[160,600,39.7];
export const MOUNTAIN_ROUTES=[
 routeFrom(LOWER_CURVES,true,true),
 routeFrom(FIRST_CLIMB_CURVES,true,true),
 routeFrom(MUSEUM_CLIMB_CURVES,true,true),
 routeFrom([line(ce,c),[c,[-120,600,39.7],[-270,470,49],[-270,550,52]],[[-270,550,52],[-270,610,56],[-330,650,59],[-220,650,59]],line([-220,650,59],[-140,650,59]),[[-140,650,59],[-45,650,59],[-35,720,68],[80,720,68]],line([80,720,68],[600,720,68])],true,'wide')
];
export const MOUNTAIN_MIDDLE=MOUNTAIN_ROUTES[3].samples.reduce((best,s)=>Math.hypot(s.p[0]+180,s.p[1]-650)<Math.hypot(best.p[0]+180,best.p[1]-650)?s:best).d;
export const MOUNTAIN_MUSEUM_DISTANCE=MOUNTAIN_ROUTES[2].samples.reduce((best,s)=>Math.hypot(s.p[0]+10,s.p[1]-470)<Math.hypot(best.p[0]+10,best.p[1]-470)?s:best).d;
export const MOUNTAIN_MUSEUM={leg:2,s:MOUNTAIN_MUSEUM_DISTANCE,pose:MOUNTAIN_ROUTES[2].sample(MOUNTAIN_MUSEUM_DISTANCE),name:'森の美術館前'};
export function museumPoint(along,side){const p=MOUNTAIN_MUSEUM.pose,c=Math.cos(p[2]),s=Math.sin(p[2]);return [p[0]+along*c-side*s,p[1]+along*s+side*c,p[3]];}
export function museumCoordinates(x,y){const p=MOUNTAIN_MUSEUM.pose,dx=x-p[0],dy=y-p[1];return [dx*Math.cos(p[2])+dy*Math.sin(p[2]),-dx*Math.sin(p[2])+dy*Math.cos(p[2])];}
export function inMuseumPlaza(x,y,margin=0){const [a,b]=museumCoordinates(x,y);return Math.abs(a)<51+margin&&b>-85-margin&&b<-15+margin;}
function laneEase(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
export function mountainLaneOffset(leg,d){const r=MOUNTAIN_ROUTES[leg];if(leg===2)return 8*laneEase((d-(MOUNTAIN_MUSEUM_DISTANCE-95))/45)*laneEase((MOUNTAIN_MUSEUM_DISTANCE+95-d)/45);if(leg===0)return 6*laneEase((d-65)/65)*laneEase((r.length-85-d)/65);if(leg===3)return 6*laneEase((d-(MOUNTAIN_MIDDLE-115))/65)*laneEase((r.length-65-d)/65);return 0;}
export function mountainSample(state,d){const leg=state.leg||0,r=MOUNTAIN_ROUTES[leg];if(state.trip>=0||![0,2,3].includes(leg))return r.sample(d);const point=at=>{const p=r.sample(at),a=r.sample(Math.max(0,at-2)),b=r.sample(Math.min(r.length,at+2)),yaw=Math.atan2(b[1]-a[1],b[0]-a[0]),side=mountainLaneOffset(leg,at);return [p[0]-Math.sin(yaw)*side,p[1]+Math.cos(yaw)*side,p[3]];};const p=point(d),a=point(Math.max(0,d-.1)),b=point(Math.min(r.length,d+.1));return [p[0],p[1],Math.atan2(b[1]-a[1],b[0]-a[0]),p[2],Math.atan2(b[2]-a[2],Math.hypot(b[0]-a[0],b[1]-a[1]))];}
export const MOUNTAIN_TRACKS=MOUNTAIN_ROUTES.flatMap((r,leg)=>{const rows=[];for(const lane of [0,1]){const points=[];for(let d=leg===0?0:80;d<r.length;d+=2){if(lane&&mountainLaneOffset(leg,d)<.002)continue;const p=mountainSample({leg,trip:lane?-1:1},d);points.push([p[0],p[1],p[3]]);}if(!lane){const p=r.sample(r.length);points.push([p[0],p[1],p[3]]);}if(points.length)rows.push({leg,lane,points});}return rows;});
export const mountainRoute=state=>MOUNTAIN_ROUTES[state?.leg||0];
export function initialMountainState(carLength=20.9){return {leg:0,s:carLength+.225,speed:0,dir:1,trip:1,playing:false,stationPhase:'dwell',dwell:8,stopKind:'station',label:'温泉街',middlePassed:false,facing:1};}
export function advanceMountain(state,dt,requested,carLength=20.9){
 let s={...state};if(!s.playing)return {...s,speed:0};
 const r=mountainRoute(s),half=carLength+.225;
 if(s.dwell>0){s.speed=0;s.dwell=Math.max(0,s.dwell-dt);if(s.dwell>0)return s;
  if(s.stopKind==='switch'){
   const next=s.leg+s.trip;s.leg=next;s.s=s.trip>0?half:mountainRoute(s).length-half;s.facing*=-1;s.middlePassed=false;
  }else if(s.stopKind==='terminal'){s.trip*=-1;s.dir=s.trip;s.middlePassed=false;}
  s.stationPhase='run';s.stopKind=null;return s;
 }
 const terminal=s.trip>0?r.length-half:half;
 const station=s.leg===2?MOUNTAIN_MUSEUM_DISTANCE:MOUNTAIN_MIDDLE;
 const mid=[2,3].includes(s.leg)&&!s.middlePassed&&(station-s.s)*s.trip>.001;
 const target=mid?station:terminal,remaining=Math.max(0,(target-s.s)*s.trip),cap=Math.min(fullPowerLimit(10),Math.max(0,requested),Math.sqrt(2*1.2*remaining));
 s.speed=Math.max(0,s.speed+Math.max(-1.8*dt,Math.min(.8*dt,cap-s.speed)));
 const step=Math.min(remaining,s.speed*dt);s.s+=s.trip*step;
 if(remaining<.03||step>=remaining){s.s=target;s.speed=0;
  if(mid){s.middlePassed=true;s.dwell=8;s.stationPhase='dwell';s.stopKind='station';s.label=s.leg===2?'森の美術館前':'山腹';}
  else if((s.trip>0&&s.leg===3)||(s.trip<0&&s.leg===0)){s.dwell=8;s.stationPhase='dwell';s.stopKind='terminal';s.label=s.trip>0?'見晴らし':'温泉街';}
  else{s.dwell=4;s.stationPhase='switch';s.stopKind='switch';s.label='山の折返し '+(s.trip>0?s.leg+1:s.leg);}
 }
 return s;
}
export function mountainPlatformCenter(visual){const body=visual.body||visual.cars?.[0]?.body;if(!body)return 5;const [a,b]=museumCoordinates(body[0],body[1]);if(Math.abs(a)<65&&Math.abs(b)<20)return car=>-car.body[1]+(visual.service?.dir<0?-4.6:4.6)*Math.cos(MOUNTAIN_MUSEUM.pose[2]);return -body[1]+(Math.abs(body[1]-656)<20&&visual.service?.dir<0?-4.3:4.3);}
export function mountainPoses(state,carLength=20.9,offsets=[],locomotive=false){
 const r=mountainRoute(state),spacing=carLength+.45,facing=state.facing||1;
 return [0,1].map(i=>{const d=state.s+(i===0?.5:-.5)*spacing*facing,bo=offsets[i]?.bogies||[6.9,-6.9],tail=i===1&&!locomotive;
  const p=mountainSample(state,d),front=mountainSample(state,d+bo[0]*facing),back=mountainSample(state,d+bo[1]*facing);p[2]+=facing<0?Math.PI:0;p[4]*=facing;front[2]+=facing<0?Math.PI:0;back[2]+=facing<0?Math.PI:0;front[4]*=facing;back[4]*=facing;
  return {body:p,front:tail?back:front,back:tail?front:back,tail};
 });
}
export function mountainLead(cars,state){
 const backing=state.trip!==state.facing,car=cars[backing?1:0];if(!backing)return car;
 const reverse=p=>p.map((v,i)=>i===2?v+Math.PI:i===4?-v:v);
 return {...car,body:reverse(car.body),front:reverse(car.back),back:reverse(car.front)};
}
const terrainSegments=[];const trackBuckets=new Map(),BUCKET=64;
for(const row of MOUNTAIN_TRACKS){const ss=row.points.map(p=>({p}));for(let i=1;i<ss.length;i++){const a=ss[i-1].p,b=ss[i].p;if((a[1]+b[1])/2>710&&(a[0]+b[0])/2>140&&(a[0]+b[0])/2<405)continue;const segment={a,b};terrainSegments.push(segment);for(let gx=Math.floor((Math.min(a[0],b[0])-200)/BUCKET);gx<=Math.floor((Math.max(a[0],b[0])+200)/BUCKET);gx++)for(let gy=Math.floor((Math.min(a[1],b[1])-200)/BUCKET);gy<=Math.floor((Math.max(a[1],b[1])+200)/BUCKET);gy++){const key=gx+','+gy;if(!trackBuckets.has(key))trackBuckets.set(key,[]);trackBuckets.get(key).push(segment);}}}
export function mountainTrackNearest(x,y){let best=Infinity,out=null,floor=Infinity;for(const {a,b} of trackBuckets.get(Math.floor(x/BUCKET)+','+Math.floor(y/BUCKET))||[]){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),px=a[0]+t*dx,py=a[1]+t*dy,d=(x-px)**2+(y-py)**2;if(d<225)floor=Math.min(floor,a[2]+(b[2]-a[2])*t);if(d<best){best=d;out={x:px,y:py,height:a[2]+(b[2]-a[2])*t};}}return {...out,distance:Math.sqrt(best),floor};}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const terrainRandom=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b),h=(i,j)=>terrainRandom(i*17+j*193);return (h(a,b)*(1-u)+h(a+1,b)*u)*(1-v)+(h(a,b+1)*(1-u)+h(a+1,b+1)*u)*v;}
const riverRoute=routeFrom([
 [[-1200,-310,-5],[-680,-235,-5],[-380,-95,-5],[-120,-55,-5]],
 [[-120,-55,-5],[40,-31,-5],[230,-90,-4],[285,90,-3]],
 [[285,90,-3],[335,255,0],[185,440,3],[255,720,8]],
 [[255,720,8],[290,895,11],[90,1170,17],[180,1520,23]]
]);
export const MOUNTAIN_RIVER=riverRoute.samples.filter((_,i)=>i%2===0).map(s=>s.p);
export function riverFrame(d){const p=riverRoute.sample(d);return {x:p[0],y:p[1],yaw:p[2],height:p[3]};}
export const RIVER_TOWN_START=330+riverRoute.samples.reduce((a,b)=>Math.abs(a.p[0]+285)<Math.abs(b.p[0]+285)?a:b).d;
export function riverNearest(x,y){let best=Infinity,result;for(let i=1;i<MOUNTAIN_RIVER.length;i++){const a=MOUNTAIN_RIVER[i-1],b=MOUNTAIN_RIVER[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),px=a[0]+dx*t,py=a[1]+dy*t,dist=(x-px)**2+(y-py)**2;if(dist<best){best=dist;result={x:px,y:py,height:a[2]+(b[2]-a[2])*t,side:Math.sign(dx*(y-py)-dy*(x-px))||1};}}return {...result,distance:Math.sqrt(best)};}
export function riverWidth(y){return 17+5*Math.sin(y*.008+1)+3*Math.sin(y*.019);}
export function naturalMountainHeight(x,y,river=riverNearest(x,y)){
 const r={...river};r.height=(r.height-20)/1.8;const d=r.distance,w=riverWidth(r.y)/2,up=Math.max(0,y),town=1-smooth((up-180)/220),terrace=12+town*53;
 if(d<w)return mountainElevation(r.height-2.4+1.2*(d/w)**2);
 const bank=r.height+4.8;
 if(d<w+6)return mountainElevation(r.height-1.2+6*smooth((d-w)/6));
 const east=Math.max(smooth((x-220)/320),smooth((-y-70)/360)),edge=w+6+terrace,shoulder=7+up*.08+25*town*east,rise=smooth((d-edge)/(110+town*65)),base=bank*(1-smooth(d/170))+(-.2+up*.018)*smooth(d/170);
 let h=base+Math.max(0,shoulder-base)*rise;
 const far=Math.max(0,d-(650*(1-east)+(110+120*smooth(up/400))*east));
 h+=Math.pow(far,.85)*(.5+.2*east)*(.7+.65*noise(x/350,y/400))*smooth((d-edge)/90);
 h+=90*smooth((y-1100)/500);
 const rough=smooth((d-edge)/100),broad=(noise(x/150,y/190)-.5)*24,detail=(noise(x/43,y/47)-.5)*8+(noise(x/17,y/19)-.5)*2;
 h+=(broad+detail)*rough;
 // Shallow tributary gullies break the slopes without cutting rectangular shelves.
 const gullies=Math.abs(Math.sin((y+.32*x)/170+1.8*Math.sin(x/310)));
 h-=Math.min(18,h*.12)*(1-smooth(gullies/.22))*rough;
 // The inhabited valley opens into a continuous descending slope below the railway.
 const opening=smooth((x+500)/180)*(1-smooth((x-170)/180))*(1-smooth((y-690)/140))*smooth((y-70)/80);
 const valleySlope=4+Math.max(0,y-100)*.095-2*noise(x/100,y/120);
 h+=(Math.min(h,valleySlope)-h)*opening;
 return mountainElevation(h);
}
export function mountainHeight(x,y,river=riverNearest(x,y),near=mountainTrackNearest(x,y),road=nearestMountainRoad(x,y)){
 const natural=naturalMountainHeight(x,y,river);let h=natural;
 for(const hotel of MOUNTAIN_HOTELS){const t=(1-smooth((Math.abs(x-hotel.x)-hotel.width/2-2)/8))*(1-smooth((Math.abs(y-hotel.y)-hotel.depth/2-2)/8));h+=(hotel.base-h)*t;}
 const [museumAlong,museumSide]=museumCoordinates(x,y),museumBlend=(1-smooth((Math.abs(museumAlong)-50)/18))*smooth((museumSide+100)/15)*(1-smooth((museumSide+15)/10));h+=(MOUNTAIN_MUSEUM.pose[3]-1.1-h)*museumBlend;
 const terrace=smooth((x-400)/30)*(1-smooth((x-650)/70))*smooth((y-630)/30)*(1-smooth((y-815)/65));h+=(170.032-h)*terrace;
 // Narrow the valley-facing embankment below the upper hillside viewing section.
 const valleyBank=smooth((x+260)/40)*(1-smooth((x+80)/40))*smooth((y-480)/30)*(1-smooth((y-565)/30));
 const broadWidth=Number.isFinite(near.distance)&&!(y>680&&x>100)?Math.max(24,Math.min(75,(near.height-h)*1.6+12)):24,width=broadWidth+(24-broadWidth)*valleyBank;
 if(near.distance<width){const t=smooth((near.distance-12)/(width-12));h=(near.height-.85)*(1-t)+h*t;}
 h=Math.min(h,near.floor-1.2);
 if(y>708&&y<732&&x>=138&&x<=402)h=Math.min(h,MOUNTAIN_ROUTES[3].sample(MOUNTAIN_ROUTES[3].length)[3]-3.2);
 if(near.distance>12)h+=(MOUNTAIN_MUSEUM.pose[3]-1.1-h)*museumBlend;
 const bankBlend=smooth((river.distance-riverWidth(river.y)/2-5)/12);
 h=natural+(h-natural)*bankBlend;if(road.distance<26&&river.distance>riverWidth(river.y)/2+8&&near.distance>10){const weight=1-smooth((road.distance-14)/12);h+=(road.height-.5-h)*weight;}return h;
}

const surfaceCache=new Map();
export function mountainSurfaceHeight(x,y){const dx=2200/366,dy=2150/358,xx=(x+1100)/dx,yy=(1495-y)/dy,i=Math.floor(xx),j=Math.floor(yy),tx=xx-i,ty=yy-j;const v=(i,j)=>{const k=i+','+j;if(!surfaceCache.has(k))surfaceCache.set(k,mountainHeight(-1100+i*dx,1495-j*dy));return surfaceCache.get(k);};const a=v(i,j),b=v(i,j+1),c=v(i+1,j+1),d=v(i+1,j);return tx+ty<=1?a+tx*(d-a)+ty*(b-a):c+(1-tx)*(b-c)+(1-ty)*(d-c);}
