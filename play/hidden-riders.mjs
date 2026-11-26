import * as T from 'three';
import {isExpress,isLimitedExpress} from './train-types.mjs?v=rail-90';

const cast={
  maglev:[0,1], express:[2,3,4], costumes:[5,6], electric:[7,8], tram:[9,10,11,12,13]
};
const portraits=new Map();
const cushion=new T.MeshStandardMaterial({color:0x456c70,roughness:.92});
const frame=new T.MeshStandardMaterial({color:0x525c63,roughness:.56,metalness:.35});
const box=new T.BoxGeometry();
let material;
function portrait(id){
  if(!material){
    const texture=new T.TextureLoader().load(new URL('./assets/seated-riders.webp',import.meta.url).href);
    texture.colorSpace=T.SRGBColorSpace;
    material=new T.MeshBasicMaterial({map:texture,alphaTest:.32,color:0xc0c7c8,toneMapped:false});
  }
  if(!portraits.has(id)){
    const plane=new T.PlaneGeometry(1,1),uv=plane.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(id%4+uv.getX(i))/4,(3-Math.floor(id/4)+uv.getY(i))/4);
    portraits.set(id,plane);
  }
  return new T.Mesh(portraits.get(id),material);
}
function bench(cast,width,height){
  const row=new T.Group(),seat=new T.Mesh(box,cushion);
  seat.scale.set(width,.10,.27);row.add(seat);
  const base=new T.Mesh(box,frame);
  base.scale.set(width*.83,.37,.21);base.position.set(0,-.22,-.025);row.add(base);
  const back=new T.Mesh(box,cushion);
  back.scale.set(width,.30,.075);back.position.set(0,.16,-.10);row.add(back);
  cast.forEach((id,i)=>{
    const mesh=portrait(id);
    const h=Math.min(height,width/cast.length*1.55);
    mesh.scale.set(h,h,1);
    mesh.position.set(((i+.5)/cast.length-.5)*width,h*.5-h*.32,.10);
    row.add(mesh);
  });
  return row;
}
export function attachHiddenRiders(model,readTargets){
  const {train,cars}=model;
  const roles=cast[isExpress(train)?'express':train==='maglev'||train==='tram'?train:
    (isLimitedExpress(train)||['steam','freight','monorail','suspended-monorail'].includes(train))?'costumes':'electric'];
  if(train==='freight'){
    // A fixed cab at each end. The console is at x ±8.95 and both side panes start at |x|=8.
    for(const [i,end] of [1,-1].entries()){
      const row=bench([roles[i]],.62,1.00);
      row.rotation.y=end>0?1.02:1.02+Math.PI;
      row.position.set(end*8.14,2.46,end*.55);
      cars[0].parts.body.add(row);
    }
    return;
  }
  const layouts=cars.map(car=>({car,targets:car.doorTargets?.length?car.doorTargets:readTargets(car.parts.body,car.doors)}));
  for(const side of [-1,1]){
    const spots=layouts.flatMap(({car,targets})=>{
      return targets.filter(d=>d.side===side).sort((a,b)=>a.center[0]-b.center[0]).map(d=>({car,d}));
    });
    if(!spots.length){
      if(train==='steam'){
        const row=bench([roles[side>0?0:1]],.88,.82);
        row.rotation.y=side<0?Math.PI:0;
        row.position.set(-2.55,2.47,side*.57);
        cars[0].parts.body.add(row);
      }
      continue;
    }
    const count=Math.min(spots.length,roles.length);
    for(let i=0;i<count;i++){
      const {car,d}=spots[Math.floor(i*spots.length/count)];
      const group=roles.slice(Math.floor(i*roles.length/count),Math.floor((i+1)*roles.length/count));
      const row=bench(group,Math.min(1.6,Math.max(.90,d.max[0]-d.min[0])+.16),.89);
      const along=d.center[0]>0?-1:1;
      const doorHalfWidth=(d.max[0]-d.min[0])*.5;
      const rowWidth=row.children[0].scale.x;
      // The entire seat sits behind the jamb. An oblique sightline through the open door reaches it.
      const offset=doorHalfWidth+rowWidth*.38+.16;
      row.rotation.y=(side<0?Math.PI:0)-along*side*.32;
      row.position.set(d.center[0]+along*offset,d.min[1]+.43,d.center[2]-side*1.10);
      row.visible=false;car.parts.body.add(row);
      (car.riderRows??=[]).push({row,side});
    }
  }
}
