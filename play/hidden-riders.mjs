import * as T from 'three';
import {isExpress,isLimitedExpress} from './train-types.mjs?v=retro-87';

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
    const texture=new T.TextureLoader().load(new URL('./assets/hidden-riders.webp',import.meta.url).href);
    texture.colorSpace=T.SRGBColorSpace;
    material=new T.MeshBasicMaterial({map:texture,alphaTest:.32,toneMapped:false});
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
    // The soft mascots rest on the cushion. The other riders have legs in front of it.
    const onCushion=id===7||id===8;
    const h=Math.min(height*(onCushion?1:1.42),width/cast.length*(onCushion?1.27:1.85));
    const feet=onCushion?.045:Math.max(-.40,-h*.27);
    mesh.scale.set(h*1.25,h,1);mesh.position.set(((i+.5)/cast.length-.5)*width,h/2+feet,onCushion?.005:.18);
    row.add(mesh);
  });
  return row;
}
export function attachHiddenRiders(model,readTargets){
  const {train,cars}=model;
  const roles=cast[isExpress(train)?'express':train==='maglev'||train==='tram'?train:
    (isLimitedExpress(train)||['steam','freight','monorail','suspended-monorail'].includes(train))?'costumes':'electric'];
  const layouts=cars.map(car=>({car,targets:car.doorTargets?.length?car.doorTargets:readTargets(car.parts.body,car.doors)}));
  for(const side of [-1,1]){
    const spots=layouts.flatMap(({car,targets})=>{
      return targets.filter(d=>d.side===side).sort((a,b)=>a.center[0]-b.center[0]).map(d=>({car,d}));
    });
    if(!spots.length){
      if(train==='freight'||train==='steam'){
        const row=bench([roles[side>0?0:1]],.88,.82);
        row.rotation.y=side<0?Math.PI:0;
        row.position.set(train==='freight'?8.65:-2.55,train==='freight'?2.52:2.47,side*(train==='freight'?1.25:1.14));
        cars[0].parts.body.add(row);
      }
      continue;
    }
    const count=Math.min(spots.length,roles.length);
    for(let i=0;i<count;i++){
      const {car,d}=spots[Math.floor(i*spots.length/count)];
      const group=roles.slice(Math.floor(i*roles.length/count),Math.floor((i+1)*roles.length/count));
      const row=bench(group,Math.min(1.6,Math.max(.90,d.max[0]-d.min[0])+.16),.89);
      row.rotation.y=side<0?Math.PI:0;
      const deepVestibule=train==='suspended-monorail'||train==='tram'||roles===cast.electric;
      const inset=deepVestibule ? .92 : .48;
      row.position.set(d.center[0]+side*.08,d.min[1]+.40,d.center[2]-side*inset);
      row.visible=false;car.parts.body.add(row);
      (car.riderRows??=[]).push({row,side});
    }
  }
}
