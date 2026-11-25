// Shared timetable in simulation seconds. All poses are seekable for replay.
const period=184;
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=(a,b,x)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u);};
const mix=(a,b,u)=>a+(b-a)*u;
const between=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
const phase=time=>((time%period)+period)%period;

export function helicopterPose(time,body,padX,padZ,base){
  const t=phase(time),heading=body?.[2]??0;
  // The outer side of each straight has a clear approach from open water.
  const offset=60+50*(1-Math.cos(heading))/2;
  const trackX=(body?.[0]??-85)+Math.sin(heading)*offset+Math.cos(heading)*5;
  const trackZ=-(body?.[1]??-60)+Math.cos(heading)*offset-Math.sin(heading)*5;
  const rendezvous=smooth(10,36,t)*(1-smooth(70,96,t));
  const lift=smooth(2,12,t)*(1-smooth(94,104,t));
  const alongside=smooth(31,41,t)*(1-smooth(65,75,t));
  const cruiseHeight=base+75*lift;
  const parked=Math.PI+.28;
  const dx=trackX-padX,dz=trackZ-padZ;
  const outbound=Math.atan2(-dz,dx),inbound=Math.atan2(dz,-dx);
  let yaw=between(parked,outbound,smooth(4,15,t));
  yaw=between(yaw,heading,smooth(28,39,t));
  yaw=between(yaw,inbound,smooth(65,74,t));
  yaw=between(yaw,parked,smooth(89,100,t));
  return {x:mix(padX,trackX,rendezvous),z:mix(padZ,trackZ,rendezvous),
    y:mix(cruiseHeight,(body?.[3]??12)+13,alongside),yaw};
}

// Hermite segments preserve airspeed when the aircraft crosses a phase boundary.
function travel(t,duration,start,end,v0,v1){
  const u=clamp(t/duration),v=1-u;
  return start*v*v*(1+2*u)+end*u*u*(3-2*u)+duration*u*v*(v*v0-u*v1);
}
export function airlinerPose(time){
  const t=phase(time);
  let x=1130;
  if(t>=108&&t<120)x=travel(t-108,12,1130,1380,0,45);
  else if(t>=120&&t<140)x=travel(t-120,20,1380,4100,45,145);
  else if(t>=140&&t<144)return {x:4100,y:141.47,z:-125,yaw:0,pitch:0,scale:0};
  else if(t>=144&&t<169)x=travel(t-144,25,-4100,906,155,42);
  else if(t>=169)x=travel(t-169,15,906,1130,42,0);
  const arrival=t>=144,climb=smooth(1290,2140,x),descent=1-smooth(570,952,x);
  const turn=smooth(100,880,x);
  const height=arrival?65*descent:140*climb;
  return {x,y:1.47+height,z:arrival?mix(136,-125,turn):-125,
    yaw:arrival&&x>100&&x<880?Math.atan(261*6*((x-100)/780)*(1-(x-100)/780)/780):0,
    pitch:arrival?-.09*Math.sin(Math.PI*descent):.13*Math.sin(Math.PI*climb),
    scale:arrival?smooth(-3950,-3050,x):1-smooth(3050,3950,x)};
}
