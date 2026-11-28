// Distances are model metres. Both services use the same scale and world clock.
const stops=[
 ['都央',0],['柳町',920],['東桜台',1710],['緑ヶ丘',2490],['麦野',3260],
 ['大川堤',4150],['川向',5260],['水郷中央',6190],['稲穂',7030],['秋津野',7890],
 ['里見',8720],['城下町',9670],['山門市',10720],['杉の里',11580],['峡谷口',12560],
 ['奥山',13680],['峠下',14820],['海見坂',15740],['朝凪浦',16800],['山海温泉港',17980]
];
export const stations=stops.map(([name,m],i)=>({name,m,express:[0,7,12,19].includes(i)}));
export const length=stations.at(-1).m;
function plan(local){
 const step=10, points=Array.from({length:length/step+1},(_,i)=>i*step);
 const served=new Map(stations.filter(s=>local||s.express).map(s=>[s.m,s]));
 const speeds=points.map(m=>served.has(m)?0:Math.min(local?90:120,m>=11900&&m<=14900?78:120)/3.6);
 for(let i=1;i<speeds.length;i++)speeds[i]=Math.min(speeds[i],Math.sqrt(speeds[i-1]**2+2*.74*step));
 for(let i=speeds.length-2;i>=0;i--)speeds[i]=Math.min(speeds[i],Math.sqrt(speeds[i+1]**2+2*.86*step));
 let time=0;const segments=[],arrivals=[];
 for(let i=0;i<points.length;i++){
  const m=points[i],station=served.get(m);
  if(station){arrivals.push({station,at:time});if(m>0&&m<length){
   segments.push({t:time,m,v:0,a:0,station});time+=local?10:12;
  }}
  if(m===length)break;
  const dt=2*step/(speeds[i]+speeds[i+1]);
  segments.push({t:time,m,v:speeds[i],a:(speeds[i+1]-speeds[i])/dt});time+=dt;
 }
 return {segments,arrivals,duration:time};
}
let expressPlan,localPlan;
export const services={
 get express(){return expressPlan??=plan(false)},
 get local(){return localPlan??=plan(true)}
};
export function clock(t){
 const minutes=900+Math.floor(t*(960/services.express.duration)+1e-8);
 return {day:1+Math.floor(minutes/1440),hour:Math.floor(minutes/60)%24,minute:minutes%60};
}
export function clockText(t){
 const c=clock(t);return c.day+'日目 '+String(c.hour).padStart(2,'0')+'時'+String(c.minute).padStart(2,'0')+'分';
}
export function sample(plan,time){
 if(time>=plan.duration)return {m:length,v:0,station:stations.at(-1)};
 let lo=0,hi=plan.segments.length;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(plan.segments[mid].t<=time)lo=mid;else hi=mid}
 const s=plan.segments[lo],dt=Math.max(0,time-s.t);
 return {m:s.m+s.v*dt+s.a*dt*dt/2,v:s.v+s.a*dt,station:s.station};
}
