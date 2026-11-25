import {mountainLead} from './mountain-data.mjs?v=retro-87';
const clamp=x=>Math.max(0,Math.min(1,x));
export function movingView(v){
  if(v?.service?.mountain)return v;
  if(!v?.service?.facing||v.service.dir===v.service.facing)return v;
  const cars=[...(v.cars||[])].reverse().map(c=>({...c,body:c.body.map((x,i)=>i===2?x+Math.PI:x)}));
  return{...v,cars,body:cars[0]?.body||v.body};
}
export function trainView(visual,other=false){
  const selected=other&&visual?.opposite?.cars?.length?visual.opposite:visual;
  if(!selected)return selected;
  const lead=selected.service?.mountain?(selected.body?selected:mountainLead(selected.cars,{trip:selected.service.dir,facing:selected.service.facing})):selected.cars?.[0];
  return {...selected,opposite:undefined,body:lead?.body||selected.body,front:lead?.front||selected.front,back:lead?.back||selected.back};
}
export function doorOpening(service,speed=0){
  if(service?.stationPhase!=='dwell'||!Number.isFinite(service.dwell)||Math.abs(speed)>.01)return 0;
  const d=service.dwell;
  const x=Math.min(clamp(((service.dwellDuration??8)-d-.3)/1),clamp((d-.8)/1.7));
  return x*x*(3-2*x);
}
export function autoView(v,step,district,previous=null,carLength=20.9){
  const cars=(v?.cars||[]).filter(c=>c.body?.every(Number.isFinite));
  if(district&&cars.some(c=>Math.abs(c.body[1])<16&&c.body[0]>90&&c.body[0]<330))return 'station-doors';
  const straight=cars.find(c=>c.body[1]>270&&c.body[1]<301&&Math.abs(Math.cos(c.body[2]))>.9);
  if(district&&straight){const dir=Math.sign(Math.cos(straight.body[2])),front=dir*(cars[0].body[0]-185)+carLength/2,rear=dir*(cars.at(-1).body[0]-185)-carLength/2;
   if(front>=-(previous==='crossing-person'?125:105)&&rear<65)return 'crossing-person';
  }
  return 'front-exterior';
}
