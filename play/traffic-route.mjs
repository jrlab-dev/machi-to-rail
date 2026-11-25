import {districtTown} from './district.mjs?v=marks-88';
export const TRAFFIC_CORNERS=[[5,40,0],[385,40,Math.PI/2],[385,240,Math.PI],[5,240,-Math.PI/2]];
const R=16,quarter=Math.PI*R/2;
const segments=[
 {l:344,x:23,y:42,a:0},{l:quarter,cx:367,cy:58,start:-Math.PI/2},
 {l:164,x:383,y:58,a:Math.PI/2},{l:quarter,cx:367,cy:222,start:0},
 {l:344,x:367,y:238,a:Math.PI},{l:quarter,cx:23,cy:222,start:Math.PI/2},
 {l:164,x:7,y:222,a:-Math.PI/2},{l:quarter,cx:23,cy:58,start:Math.PI}
];
export const TRAFFIC_LENGTH=segments.reduce((n,p)=>n+p.l,0);
export const TRAFFIC_VEHICLES=[{id:'nbox',name:'軽ボックス'},{id:'scania',name:'トレーラー'},{id:'unic',name:'クレーントラック'},{id:'sedan',name:'乗用車'},{id:'van',name:'箱型トラック'},{id:'work',name:'平ボディトラック'},{id:'aerial',name:'高所作業車'},{id:'marking',name:'路面標示車'}].map((v,i,all)=>({...v,offset:78+(i===0?1:i===1?0:i)*TRAFFIC_LENGTH/all.length}));
export function trafficPoint(s){s=((s%TRAFFIC_LENGTH)+TRAFFIC_LENGTH)%TRAFFIC_LENGTH;for(const p of segments){if(s<=p.l){if(p.cx!==undefined){const a=p.start+s/R;return[p.cx+R*Math.cos(a),p.cy+R*Math.sin(a),a+Math.PI/2];}return[p.x+s*Math.cos(p.a),p.y+s*Math.sin(p.a),p.a];}s-=p.l;}}
export function hasTrafficRoads(town,kit){
 if(town.district!=='midori-central-v1')return false;
 const required=districtTown(kit).props.filter(p=>['road','corner','tee'].includes(p.type)&&(p.pose[0]===5||p.pose[0]===385||p.pose[1]===40||p.pose[1]===240));
 return required.every(e=>town.props.some(p=>p.type===e.type&&p.pose.every((v,i)=>Math.abs(v-e.pose[i])<1e-5)));
}
const count=Math.ceil(TRAFFIC_LENGTH/.12),step=TRAFFIC_LENGTH/count,angles=new Float64Array(count+1);
const hitch=p=>[p[0]-1.65*Math.cos(p[2]),p[1]-1.65*Math.sin(p[2])];
let heading=0,previous=hitch(trafficPoint(0));
// Warm up a complete lap before keeping a periodic, distance-indexed trailer solution.
for(let lap=0;lap<3;lap++)for(let i=0;i<=count;i++){
 const p=hitch(trafficPoint(i*step)),dx=p[0]-previous[0],dy=p[1]-previous[1];
 const rate=a=>(-Math.sin(a)*dx+Math.cos(a)*dy)/9.3;
 heading+=rate(heading+rate(heading)/2);previous=p;
 if(lap===2)angles[i]=heading;
}
export function trafficPose(distance){
 const s=((distance%TRAFFIC_LENGTH)+TRAFFIC_LENGTH)%TRAFFIC_LENGTH,p=trafficPoint(s),q=s/step,i=Math.min(count-1,Math.floor(q));
 const a=angles[i]+(angles[i+1]-angles[i])*(q-i),h=hitch(p);
 return{body:p,trailer:[h[0],h[1],a]};
}
export function trafficFrame(time,selection=TRAFFIC_VEHICLES.map(v=>v.id)){const vehicles=TRAFFIC_VEHICLES.filter(v=>selection.includes(v.id));return vehicles.map((v,i)=>({id:v.id,...trafficPose(78+(i===0&&vehicles.length>1?1:i===1?0:i)*TRAFFIC_LENGTH/vehicles.length+time*5)}));}
