import * as T from 'three';
import {stations,length} from './san-kai-route.mjs?v=rail-97';
import {center} from './san-kai-service.mjs?v=rail-97';
export function track(m,lane=-2.2,h=0){return new T.Vector3(center(m)+lane,h,-m)}
const cube=new T.BoxGeometry(1,1,1),pine=new T.ConeGeometry(1,1,7),hill=new T.ConeGeometry(1,1,13);
const stone=new T.MeshStandardMaterial({color:0xffffff,roughness:.85});
const lit=new T.MeshBasicMaterial({color:0xffffff});
const signCache=new Map();
function signTexture(name){
 if(signCache.has(name))return signCache.get(name);
 const c=document.createElement('canvas');c.width=384;c.height=96;const g=c.getContext('2d');
 g.fillStyle='#faf1dc';g.fillRect(0,0,384,96);g.fillStyle='#1d7067';g.fillRect(0,74,384,18);
 g.textAlign='center';g.fillStyle='#132d34';g.font='bold 46px sans-serif';g.fillText(name,192,56);
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
 const material=new T.MeshBasicMaterial({map,side:T.DoubleSide});signCache.set(name,material);return material;
}
function region(m){
 if(m<2100)return '都心';if(m<4210)return '郊外';if(m<5020)return '大川の鉄橋';
 if(m<9000)return '水郷の田園';if(m<11200)return '城下の街';if(m<15750)return '山あい';return '海辺の温泉郷';
}
export {region};
const signGeom=new T.PlaneGeometry(6,1.5);
function makeChunk(index){
 const start=index*100,end=start+100,mid=start+50,group=new T.Group(),batches=new Map();
 group.position.z=-start;
 const matrices=new T.Object3D();
 function shape(geo,x,y,m,w,h,d,color,rz=0,material=stone,ry=0){
  if(!batches.has(material))batches.set(material,new Map());
  const map=batches.get(material);if(!map.has(geo))map.set(geo,[]);
  matrices.position.set(x,y,start-m);matrices.scale.set(w,h,d);matrices.rotation.set(0,ry,rz);matrices.updateMatrix();
  map.get(geo).push([matrices.matrix.clone(),new T.Color(color)]);
 }
 const box=(...args)=>shape(cube,...args);
 let seed=(Math.imul(index+99,1597334677)>>>0)||1;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const zone=region(mid),bridge=mid>=4300&&mid<5000,coast=mid>=15800;
 box(-160,-2,mid,320,3,100,zone==='山あい'?'#798558':'#a5ae78');
 box(166,coast?-3:-2,mid,334,coast?1:3,100,coast?'#629ba8':'#a5ae78');
 if(coast){
  box(center(mid)+4,-1.15,mid,40,1,100,'#c5b791');
  box(600,-3.1,mid,650,1,100,'#669eac');
  for(let k=0;k<16;k++){
   const x=36+rand()*255,m=start+rand()*100;
   box(x,-2.41,m,1+rand()*5,.05,1+rand()*9,'#8ab1b6');
  }
  if(index%3===0)shape(hill,168+rand()*50,-1,mid,37,13+rand()*11,50,'#718d88');
  if(mid>17200){
   const dockX=center(mid)+46;
   box(dockX,-.4,mid,4,.9,86,'#918878');
   if(index%2===0)box(dockX-9,-.3,mid,20,.9,3,'#9a907e');
   for(let k=0;k<3;k++){
    const m=start+20+24*k,x=dockX+5;
    box(x,-1.62,m,3.6,1.3,10,'#8c5850');box(x,-.85,m,3.35,.4,9,'#e2d4b4');
    box(x,-.01,m+1,2,1.55,3,'#e4dbb8');box(x,.21,m-.52,1.6,.54,.06,'#425e6a');
    box(x,2,m+3,.09,5.2,.09,'#8b8474');
   }
   box(dockX+2,1.4,mid+21,.2,4,.2,'#736957');box(dockX+2,3.6,mid+21,.6,.6,.6,'#ffdfa0',0,lit);
   if(index===180){
    shape(hill,80,0,mid,18,7,25,'#79847a');box(80,6.8,mid,3,10,3,'#eee5d8');
    box(80,9,mid,3.06,2,3.06,'#af5145');box(80,12.5,mid,3.4,1.6,3.4,'#ffdb91',0,lit);
   }
  }
 }
 if(bridge)box(0,-.4,mid,560,.35,100,'#6398a4');
 for(let m=start;m<end;m+=10){
  const x=center(m+5),yaw=-Math.atan2(center(m+10)-center(m),10);
  box(x,bridge?.65:.05,m+5,10,bridge?.9:1.8,10.15,bridge?'#626f72':'#8f8c7b',0,stone,yaw);
  for(const lane of [-2.2,2.2]){
   for(const offset of [-.72,.72])box(x+lane+offset,1.18,m+5,.12,.18,10.12,'#bbc0b9',0,stone,yaw);
   for(let k=0;k<10;k+=1.7)box(center(m+k)+lane,1.04,m+k,2.48,.14,.32,'#645c52',0,stone,yaw);
  }
  if(bridge){
   for(const side of [-1,1]){
    box(x+side*5.2,3.9,m, .28,6,.28,'#944d42');
    box(x+side*5.2,6.8,m+5,.4,.35,10.1,'#a65849');
    const beam=new T.Vector3(center(m+10)-center(m),5.8,-10);
    matrices.position.set(x+side*5.2,3.9,start-m-5);matrices.scale.set(.22,beam.length(),.24);
    matrices.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),beam.normalize());matrices.updateMatrix();
    batches.get(stone).get(cube).push([matrices.matrix.clone(),new T.Color('#a25c50')]);
   }
   if(m%20===0)box(x,6.8,m,10.6,.25,.4,'#944d42');
  }
 }
 if(start>=15400&&start<15700){
  for(let m=start+5;m<end;m+=10){
   const x=center(m),yaw=-Math.atan2(center(m+5)-center(m-5),10);
   for(const side of [-1,1])box(x+side*8,4.5,m,1.4,11,10.3,'#4b504b',0,stone,yaw);
   box(x,10,m,18,2,10.3,'#4e554b',0,stone,yaw);
   if(m%30===5)box(x-7.22,5.2,m,.3,.32,1.6,'#ffe6a5',0,lit);
  }
  shape(hill,center(mid),30,mid,20,38,61,'#78836b');
 }
 for(const m of [start+25,start+75]){
  box(center(m)-5.8,4.5,m,.24,8,.24,'#737c77');box(center(m)-1,8.4,m,10,.18,.2,'#737c77');
  for(const lane of [-2.2,2.2])box(center(m)+lane,7.3,m+25,.04,.05,50.2,'#676c67',0,stone,-Math.atan2(center(m+50)-center(m),50));
 }
 if(!bridge){
  const city=zone==='都心'||zone==='城下の街', rural=zone==='水郷の田園',mountain=zone==='山あい';
  for(const side of [-1,1]){
   if(side===1&&coast)continue;
   if(rural)for(let n=0;n<3;n++)box(center(mid)+side*(44+n*49),-.37,mid,46,.34,94,['#a9af64','#819660','#bca66d'][n]);
   if(city)box(center(mid)+side*22,-.33,mid,7,.4,100,'#787971');
   const count=city?14:mountain?0:rural?2:5;
   for(let i=0;i<count;i++){
    const m=start+(i+.3)*100/count,x=center(m)+side*(city?30+rand()*75:26+rand()*62);
    const h=city?9+rand()*(zone==='都心'?47:21):4+rand()*5,w=city?7+rand()*9:7,d=city?7:8;
    box(x,h/2-.45,m,w,h,d,['#cdc5b6','#b0bfc2','#cab8a8','#dfd5bc'][i%4]);
    box(x,h-.33,m,w+1,.53,d+.7,city?'#969e98':'#795f54');
    for(let yy=2.5;yy<h-1;yy+=3.3){
     box(x-side*(w/2+.02),yy,m,.12,.9,d*.65,'#667e85');
     box(x,yy,m-d/2-.03,w*.65,.8,.12,rand()>.55?'#e5c389':'#71868a',0,lit);
    }
   }
   if(mountain||coast||rural){
    shape(hill,center(mid)+side*(140+rand()*85),5,mid,90+rand()*80,50+rand()*(mountain?160:65),125,'#74846d');
   }
   for(let i=0;i<(mountain?42:7);i++){
    const m=start+rand()*100,x=center(m)+side*(13+rand()*110),h=4+rand()*9;
    box(x,h*.23,m,.65,h*.54,.65,'#73624e');shape(pine,x,h*.64,m,h*.27,h*.82,h*.27,['#536f54','#607c56','#71845d'][i%3]);
   }
  }
 }
 for(const s of stations){
  const dz=s.m-mid;if(Math.abs(dz)>85)continue;
  const a=Math.max(start,s.m-35),b=Math.min(end,s.m+35);if(a>=b)continue;
  for(const side of [-1,1]){
   const x=center((a+b)/2)+side*6;
   box(x,1.15,(a+b)/2,3.8,1.7,b-a,'#aaa59a');
   box(x-side*1.45,2.03,(a+b)/2,.26,.05,b-a,'#dec375');
   const ca=Math.max(a,s.m-28),cb=Math.min(b,s.m-8);
   if(ca<cb)box(center((ca+cb)/2)+side*6,5.25,(ca+cb)/2,4.5,.32,cb-ca,'#637f80');
   for(let m=a+3;m<b;m+=13){
    box(center(m)+side*6,3.6,m,.22,3.2,.24,'#a4aba2');
    box(center(m)+side*6,5.16,m,1.15,.15,.37,'#fff0b5',0,lit);
   }
  }
  if(s.m>=start&&s.m<end){
   const sign=new T.Mesh(signGeom,signTexture(s.name));sign.position.set(center(s.m)-8,4,start-s.m);group.add(sign);
  }
 }
 for(const [material,map] of batches)for(const [geo,rows] of map){
  const mesh=new T.InstancedMesh(geo,material,rows.length);
  rows.forEach(([matrix,color],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,color)});group.add(mesh);
 }
 return group;
}
export function landscape(scene){
 const chunks=new Map();let current;
 return m=>{
  const id=Math.floor(m/100);if(id===current)return;current=id;
  for(const [key,g] of chunks)if(key<id-3||key>id+10){
   scene.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose()});chunks.delete(key);
  }
  for(let k=Math.max(-3,id-3);k<=Math.min(Math.ceil(length/100)+8,id+10);k++)if(!chunks.has(k)){
   const g=makeChunk(k);chunks.set(k,g);scene.add(g);
  }
 };
}
