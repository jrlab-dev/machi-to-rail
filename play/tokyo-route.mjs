import {initialLoop,stepLoop} from './station-loop.mjs?v=rail-90';
const straight=2200, radius=140, turn=Math.PI*radius;
export const tokyoLength=2*(straight+turn);
const wrap=d=>(d%tokyoLength+tokyoLength)%tokyoLength;
export const tokyoStations=[
  {name:'丸の内地下',s:260,underground:true},
  {name:'東京',s:1250,underground:false},
  {name:'有楽町',s:2010,underground:false},
  {name:'八重洲地下',s:3540,underground:true}
];
export const isTokyo=town=>town?.tokyo==='marunouchi-loop-v1';
export function tokyoPose(distance){
  const s=wrap(distance);
  let x,y,a;
  if(s<straight){x=s;y=0;a=0;}
  else if(s<straight+turn){a=(s-straight)/radius;x=straight+radius*Math.sin(a);y=radius*(1-Math.cos(a));}
  else if(s<2*straight+turn){x=2*straight+turn-s;y=2*radius;a=Math.PI;}
  else{a=Math.PI+(s-2*straight-turn)/radius;x=radius*Math.sin(a);y=radius*(1-Math.cos(a));}
  const rising=s<1800,span=rising?600:640;
  const t=Math.min(1,Math.max(0,rising?(s-420)/span:(2820-s)/span));
  return [x-1250,y,a,18*t*t*(3-2*t),Math.atan((rising?1:-1)*108*t*(1-t)/span)];
}
export const tokyoRoute={closed:true,length:tokyoLength,parts:[],sample:tokyoPose};
export const initialTokyo=(formation,length)=>initialLoop(formation,length,tokyoStations);
export const stepTokyo=(state,dt,limit,formation,length)=>stepLoop(state,dt,limit,formation,length,tokyoStations,tokyoLength);

// The opposite running line continues Tokyo platform 6 through both portals.
export const tokyoTrackSpacing=12.2;
const innerRadius=radius-tokyoTrackSpacing;
function transferDistance(distance,fromRadius,toRadius){
  const half=straight+Math.PI*fromRadius;
  const side=Math.floor(distance/half),local=distance-side*half;
  return side*(straight+Math.PI*toRadius)+Math.min(local,straight)+Math.max(0,local-straight)*toRadius/fromRadius;
}
export const tokyoInnerDistance=s=>transferDistance(s,radius,innerRadius);
export const tokyoInnerStations=tokyoStations.map(t=>({...t,s:tokyoInnerDistance(t.s)}));
const innerLength=tokyoInnerDistance(tokyoLength);
export const tokyoInnerRoute={closed:true,length:innerLength,parts:[],sample(distance){
  const s=transferDistance((distance%innerLength+innerLength)%innerLength,innerRadius,radius);
  const [x,y,a,h,p]=tokyoPose(s);
  const curved=s>straight&&s<straight+turn||s>2*straight+turn;
  return [x-tokyoTrackSpacing*Math.sin(a),y+tokyoTrackSpacing*Math.cos(a),a,h,Math.atan(Math.tan(p)*(curved?radius/innerRadius:1))];
}};
export function initialTokyoInner(formation,length){
  const state=initialLoop(formation,length,tokyoInnerStations);
  return {...state,dir:-1,s:2*tokyoInnerStations[0].s-state.s};
}
