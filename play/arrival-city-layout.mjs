import {intercityTown} from './intercity-data.mjs?v=rail-90';

const originals=new Map(intercityTown().props.filter(p=>p.pose[0]>5000).map(p=>[p.uid,JSON.stringify(p)]));
export function isArrivalTemplateProp(p){return originals.get(p.uid)===JSON.stringify(p);}
export function railClearance(x,y){
 return x>=0&&x<=6000?Math.min(Math.abs(y),Math.abs(y-800)):Math.abs(Math.hypot(x<0?x:x-6000,y-400)-400);
}
export const overlaps=(a,b,gap=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+gap-.001&&Math.abs(a.y-b.y)<(a.d+b.d)/2+gap-.001;
// Includes the pavement and the full horizontal model envelope. Prop scale changes height only.
export function propFootprint(p){
 const size={shop:[20,18],warehouse:[24,20],hotel:[20,18],office:[20,18],apartment:[20,18],tree:[8,8]}[p.type]||[30,30];
 const a=p.pose[2]||0,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
 return{x:p.pose[0],y:p.pose[1],w:size[0]*c+size[1]*s,d:size[0]*s+size[1]*c};
}
export function cityFootprint(b){const extra=b.kind==='commercial'?10:21;return{x:b.x,y:b.y,w:b.w+extra,d:b.d+extra};}
export function splitRoads(roads,blockers=[],step=8){
 return roads.flatMap(r=>{const horizontal=r.w>r.d,length=horizontal?r.w:r.d,count=Math.ceil(length/step);return Array.from({length:count},(_,i)=>({...r,horizontal,x:horizontal?r.x-length/2+(i+.5)*length/count:r.x,y:horizontal?r.y:r.y-length/2+(i+.5)*length/count,w:horizontal?length/count:r.w,d:horizontal?r.d:length/count}));}).filter(r=>!blockers.some(p=>overlaps(r,p,1)));
}
export function arrivalRoads(){
 const roads=[];
 for(const y of[-400,-220,170,630,1020,1200])roads.push({x:5770,y,w:1270,d:36});
 for(const x of[5215,5370,5700,6030,6300])for(const[a,b]of(x===5700?[[95,186],[614,1380]]:x===5370||x===6030?[[-550,1380]]:[[-550,190],[610,1380]]))roads.push({x,y:(a+b)/2,w:36,d:b-a});
 return roads;
}
export function buildingClearance(b){
 let d=Infinity;
 for(let x=-b.w/2;x<=b.w/2+.01;x+=b.w/8)for(let y=-b.d/2;y<=b.d/2+.01;y+=b.d/8)d=Math.min(d,railClearance(b.x+x,b.y+y));
 // Distance to a curve is 1-Lipschitz; subtract half the sampling-cell diagonal.
 return d-Math.hypot(b.w/8,b.d/8)/2;
}
export function cityPlan(blockers=[]){
 const reserved=blockers.map(propFootprint),roads=arrivalRoads();
 const buildings=[];let n=0;
 function add(x,y,w,d,h,tier=0){
  const b={id:n++,x,y,w,d,h,tier,style:n%4};
  if(buildingClearance(cityFootprint(b))<34)return;
  if(Math.abs(x-5700)<85+w/2&&y>-50&&y<220)return;
  if([5215,5370,5700,6030,6300].some(rx=>Math.abs(x-rx)<w/2+29))return;
  if([-400,-220,170,630,1020,1200].some(ry=>Math.abs(y-ry)<d/2+24))return;
  if(reserved.some(p=>overlaps(cityFootprint(b),p,1)))return;
  buildings.push(b);
 }
 for(const y of[-140,100,700,940]){
  for(let i=0;i<7;i++){const x=5310+i*110,w=42+(i%3)*8,d=40+(i%2)*12;
   add(x,y,w,d,76+((i*37+Math.abs(y))%101),0);
  }
 }
 for(const y of[-300,1100])for(let i=0;i<9;i++)add(5240+i*125,y,52+(i%2)*12,58,80+(i*31%128),1);
 for(const y of[-490,1290])for(let i=0;i<10;i++)add(5200+i*140,y,54+(i%3)*9,66,64+(i*29%101),2);
 for(const y of[265,405,545]){add(5295,y,52,62,94+(y%70));add(6100,y,46,58,120+(y%65));}
 // Landmark replaces its row neighbour rather than overlapping it.
 const landmark=buildings.find(b=>b.x===5970&&b.y===-140);if(landmark)landmark.h=220;
 const towers=buildings.length;
 for(const y of[-72,872])for(const [i,x]of[5260,5435,5505,5580,5820,5900,5985,6075].entries()){
  const b={id:n++,x,y,w:34+(i%3)*4,d:24,h:14+(i%4)*6,tier:0,style:i%4,kind:'commercial'},f=cityFootprint(b);
  if(buildingClearance(f)<34||roads.some(r=>overlaps(f,r,2))||buildings.some(c=>overlaps(f,cityFootprint(c),3))||reserved.some(p=>overlaps(f,p,1)))continue;
  if(overlaps(f,{x:5700,y:85,w:170,d:270}))continue;
  buildings.push(b);
 }
 return {buildings,towers,roads:splitRoads(roads,reserved,32),reserved,park:{x:5700,y:400,w:650,d:390}};
}

export function arrivalTrees(plan){
 const treePositions=[];
 for(let i=0;i<150;i++){const a=i/150*Math.PI*2;treePositions.push([5700+(309+Math.sin(i*7)*10)*Math.cos(a),400+(181+Math.cos(i*5)*8)*Math.sin(a),6+(i%5)*.7]);}
 for(let i=0;i<52;i++)treePositions.push([5430+(i%7)*24+Math.sin(i*9)*12,267+Math.floor(i/7)*18+Math.cos(i*5)*12,6+i%5]);
 for(let i=0;i<30;i++)treePositions.push([5930+Math.sin(i*4)*37,485+Math.cos(i*7)*55,6+i%5]);
 for(const y of[62,740])for(let x=5340;x<6010;x+=28)if(Math.abs(x-5700)>70)treePositions.push([x,y,5+(x%3)]);
 for(const y of[-220,170,630,1020])for(let x=5250;x<6300;x+=32)if(Math.abs(x-5700)>25)treePositions.push([x,y+17,5.5]);
 for(const b of plan.buildings)for(const side of[-1,1])treePositions.push([b.x+side*(b.w/2+15),b.y+b.d/2+14,5+(b.id%3)]);
 return treePositions.filter(([x,y,h])=>{const f={x,y,w:h*1.24,d:h*1.16};return!plan.reserved.some(p=>overlaps(f,p,1))&&!plan.buildings.some(b=>overlaps(f,cityFootprint(b)));});
}
