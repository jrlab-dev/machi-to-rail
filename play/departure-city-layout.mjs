import {intercityTown} from './intercity-data.mjs?v=rail-90';
import {overlaps,propFootprint,splitRoads,buildingClearance} from './arrival-city-layout.mjs?v=rail-90';
const originals=new Map(intercityTown().props.filter(p=>p.pose[0]<1000).map(p=>[p.uid,JSON.stringify(p)]));
export const isDepartureTemplateProp=p=>originals.get(p.uid)===JSON.stringify(p);
export function departureFootprint(b){const extra=b.kind==='house'||b.kind==='rural'?10:b.kind==='commercial'?10:3;return{x:b.x,y:b.y,w:b.kind==='house'&&b.x===468?13.4:b.w+extra,d:b.d+extra};}
export function departurePlan(blockers=[]){const buildings=[],roads=[],reserved=blockers.map(propFootprint);let id=0;
 const add=(x,y,w,d,h,kind)=>buildings.push({id:id++,x,y,w,d,h,kind});
 for(const x of[170,198,226,254,346,374,402,430])for(const y of[130,158,210,238])add(x,y,21,21,28+(id*7%31),'core');
 for(const x of[90,124,158,192,226,260,340,374,408,442,510])for(const y of[300,328])add(x,y,22,20,8+(id%4)*3,'mid');
 for(const x of[80,114,510,544])for(const y of[130,164,210,244])add(x,y,21,22,9+(id%3)*3,'mid');
 for(const x of[100,142,184,226,268,342,384,426,468,510,552])for(const y of[390,420,480,510])add(x,y,10+(id%2)*2,12,5.8,'house');
 for(const [x,y]of[[80,600],[210,665],[425,580],[560,680],[650,400],[715,570],[620,170],[690,265],[740,360]])add(x,y,11,13,5.8,'rural');
 for(const y of[100,184,270,358,448,548])roads.push({x:315,y,w:560,d:y===100?18:12});
 for(const x of[50,300,480,585]){
  if(x===480){roads.push({x,y:224,w:12,d:268},{x,y:459,w:10,d:202});}
  else roads.push({x,y:325,w:x===300?18:12,d:470});
 }
 const commercial=[];
 for(const[i,x]of[80,134,188,242,370,424,478,532,638,692].entries()){
  const b={id:id++,x,y:-65,w:30+(i%2)*4,d:24,h:12+(i%4)*5,kind:'commercial'};
  if(buildingClearance(departureFootprint(b))>=34)commercial.push(b);
 }
 roads.push({x:340,y:-91,w:740,d:18,added:true});
 for(const x of[50,585])roads.push({x,y:-.5,w:8,d:181,added:true});
 const all=buildings.concat(commercial).filter(b=>!reserved.some(p=>overlaps(departureFootprint(b),p,1)));
 const streets=splitRoads(roads,reserved),trees=commercial.map(b=>({x:b.x+departureFootprint(b).w/2+4.5,y:-77,w:6.5,d:6.5,h:5.5})).filter(t=>!reserved.some(p=>overlaps(t,p,1))&&!all.some(b=>overlaps(t,departureFootprint(b),1))&&!streets.some(r=>overlaps(t,r,.2)));
 const paving=splitRoads([{x:381,y:-64,w:682,d:36}],reserved);
 return{buildings:all,roads:streets,paving,trees,reserved};
}
