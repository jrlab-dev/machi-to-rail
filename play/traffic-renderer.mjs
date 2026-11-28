import * as T from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {MOUNTAIN_BUS_ID,MOUNTAIN_MINIBUS_ID} from './mountain-road.mjs?v=rail-90';
import {carTex,vehicleRaw} from './vehicle-source.mjs?v=rail-90';
import {loadRoadVehicle} from './road-vehicle-assets.mjs?v=rail-90';
import {selectedVehicles} from './traffic-selection.mjs?v=rail-90';
import {TRAFFIC_VEHICLES,trafficFrame} from './traffic-route.mjs?v=rail-97';
export function createTrafficRenderer(){
 const root=new T.Group();root.name='street-traffic';
 const texture=new T.CanvasTexture(carTex());texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const mat=new T.MeshStandardMaterial({map:texture,roughness:.58,metalness:.12,side:T.DoubleSide});
 const lamps=new T.MeshStandardMaterial({color:'#fff2cd',emissive:'#fff0ce',emissiveIntensity:2});
 const tails=new T.MeshStandardMaterial({color:'#a71d19',emissive:'#ff2318',emissiveIntensity:1.4});
 let items=[],selection=[],lastTime=0,selectionTicket=0;const cache=new Map();
 function headlight(group,z,height=.8){
  const beam=new T.SpotLight('#fff1cc',0,32,.48,.65,1.3),target=new T.Object3D();
  beam.position.set(0,height,z);target.position.set(0,-.25,z+15);beam.target=target;group.add(beam,target);
  return beam;
 }
 async function buildMountainBus(id=MOUNTAIN_BUS_ID){
  const asset=new URL(`./assets/road-vehicles/${id}.glb.gz`,import.meta.url);
  const response=await fetch(asset);
  if(!response.ok)throw Error('観光バスを読みこめません。');
  const bytes=await response.arrayBuffer(),magic=new Uint8Array(bytes,0,2);
  // A host may decode gzip on transfer; the GLB still reaches the loader unchanged.
  const buffer=magic[0]===0x1f&&magic[1]===0x8b
   ?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
   :bytes;
  const {scene}=await new GLTFLoader().parseAsync(buffer,'');
  scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  const body=new T.Group();
  body.name=id;body.add(scene);body.visible=false;root.add(body);
  const bounds=new T.Box3().setFromObject(body);
  return {id,groups:[body],beam:headlight(body,bounds.max.z,.86),bounds};
 }
 async function build(v){
  let material=mat,raw;
  if(['van','work','marking'].includes(v.id)){
   const asset=await loadRoadVehicle(v.id),c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');asset.colors.forEach((rgb,i)=>{ctx.fillStyle='rgb('+rgb.join(',')+')';ctx.fillRect(i%8*8,Math.floor(i/8)*8,8,8);});ctx.fillStyle='#dce4e7';ctx.fillRect(56,56,8,8);
   const tx=new T.CanvasTexture(c);tx.flipY=false;tx.colorSpace=T.SRGBColorSpace;tx.magFilter=T.NearestFilter;tx.minFilter=T.NearestFilter;material=new T.MeshStandardMaterial({map:tx,roughness:.65,metalness:.12,side:T.DoubleSide});
   raw={v:[],i:[],n:0};for(const part of asset.parts){for(let i=0;i<part.n;i++){const row=part.v.slice(i*9,i*9+9);if(part.plain){row[6]=.9375;row[7]=.9375;}raw.v.push(...row);}for(const i of part.i)raw.i.push(i+raw.n);raw.n+=part.n;}
  }else raw=vehicleRaw(v.id);
  const groups=[new T.Group(),new T.Group()];
  groups.forEach((group,i)=>group.name=v.id+'-'+i);
  // The original renderer accepts both windings without flipping its supplied normals.
  // Align faces to those normals before Three's double-sided lighting is applied.
  for(let j=0;j<raw.i.length;j+=3){
   const [a,b,c]=raw.i.slice(j,j+3).map(i=>raw.v.slice(i*9,i*9+6)),u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]);
   const dot=(u[1]*w[2]-u[2]*w[1])*a[3]+(u[2]*w[0]-u[0]*w[2])*a[4]+(u[0]*w[1]-u[1]*w[0])*a[5];
   if(dot<0)[raw.i[j+1],raw.i[j+2]]=[raw.i[j+2],raw.i[j+1]];
  }
  for(let part=0;part<(v.id==='scania'?2:1);part++){
   const vertices=[],normals=[],uv=[];
   for(const i of raw.i){if(raw.scParts&&raw.scParts[i]!==part)continue;const j=i*9;vertices.push(...raw.v.slice(j,j+3));normals.push(...raw.v.slice(j+3,j+6));uv.push(...raw.v.slice(j+6,j+8));}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingSphere();
   const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;groups[part].add(m);groups[part].visible=false;root.add(groups[part]);
  }
  const bounds=new T.Box3().setFromObject(groups[0]),known={nbox:[.48,.81,1.71,-1.72],unic:[.65,.80,2.84,-2.86],scania:[1,.85,3.32,-11.59],van:[.72,.55,2.35,-2.42],work:[.72,.55,2.35,-2.394],sedan:[.60,.72,2.25,-2.25],aerial:[.65,.80,2.84,-2.86]};
  const [w,y,z,rear]=known[v.id]||[.65,.99,bounds.max.z+.012,bounds.min.z-.012];
  for(const side of[-1,1]){
   const head=new T.Mesh(new T.BoxGeometry(v.id==='nbox'?.18:.25,.08,.025),lamps);head.position.set(side*w,y,z);groups[0].add(head);
   const tail=new T.Mesh(new T.BoxGeometry(.12,.12,.025),tails);tail.position.set(side*w,.78,rear);groups[v.id==='scania'?1:0].add(tail);
  }
  return{...v,groups,beam:headlight(groups[0],z),bounds};
 }
 async function select(ids,{mountain=false}={}){
  const next=mountain?[MOUNTAIN_BUS_ID,MOUNTAIN_MINIBUS_ID,'nbox']:selectedVehicles(ids),ticket=++selectionTicket;
  const result=await Promise.all(next.map(id=>{
   if(!cache.has(id)){
    const loading=[MOUNTAIN_BUS_ID,MOUNTAIN_MINIBUS_ID].includes(id)?buildMountainBus(id):build(TRAFFIC_VEHICLES.find(v=>v.id===id));
    cache.set(id,loading.catch(e=>{cache.delete(id);throw e;}));
   }
   return cache.get(id);
  }));
  if(ticket!==selectionTicket)return;
  for(const item of items){item.groups.forEach(g=>g.visible=false);item.beam.intensity=0;}
  items=result;selection=mountain?[]:next;update(lastTime, mountain?frame:null);phase(currentPhase);
 }
 let currentPhase='day';
 let frame=[];
 function update(time,customFrame=null){lastTime=time;frame=customFrame||trafficFrame(time,selection);for(let i=0;i<items.length;i++)for(let part=0;part<items[i].groups.length;part++){const f=frame.find(f=>f.id===items[i].id);items[i].groups[part].visible=!!f;if(!f)continue;const p=part?f.trailer:f.body;items[i].groups[part].position.set(p[0],Number.isFinite(p[3])?p[3]:-.415,-p[1]);items[i].groups[part].rotation.set(-(p[4]||0),p[2]+Math.PI/2,0,'YXZ');}}
 function camera(index,portrait=false,look="outside"){const id=typeof index==='string'?index:TRAFFIC_VEHICLES[index]?.id,f=frame.find(v=>v.id===id)||frame[0],item=items.find(v=>v.id===f?.id);if(!f)return null;const p=f.body,a=p[2],b=item?.bounds,length=b?b.max.z-b.min.z:6,large=f.id==='scania';
  if(item&&look!=='outside'){
   const seat=item.groups[0],side=look==='left'?1:look==='right'?-1:0;
   const position=seat.localToWorld(new T.Vector3(-.34,Math.min(b.max.y*.79,2.55),b.max.z*.55));
   const target=seat.localToWorld(new T.Vector3(-.34+side*25,Math.min(b.max.y*.79,2.55)-.4,b.max.z*.55+(side?2:25)));
   for(const group of item.groups)group.visible=false;
   return {position,target};
  }
  if(f.id===MOUNTAIN_BUS_ID){
   const d=portrait?14:10,side=portrait?12:8;
   return {
    position:new T.Vector3(p[0]+d*Math.cos(a)+side*Math.sin(a),p[3]+6.5,-p[1]-d*Math.sin(a)+side*Math.cos(a)),
    target:new T.Vector3(p[0],p[3]+1.7,-p[1])
   };
  }
  const d=(large?20:Math.max(8,length*1.8))*(portrait?1.4:1),side=large?10:Math.max(7,length);return{position:new T.Vector3(p[0]+d*Math.cos(a)+side*Math.sin(a),(p[3]||0)+(large?12:Math.max(7,(b?.max.y||3)*2)),-p[1]-d*Math.sin(a)+side*Math.cos(a)),target:new T.Vector3(p[0]-(large?4:0)*Math.cos(a),(p[3]||0)+1,-p[1]+(large?4:0)*Math.sin(a))};}
 function phase(value){currentPhase=value;lamps.emissiveIntensity=value==='night'?3:1;tails.emissiveIntensity=value==='night'?2:.5;for(const item of items)item.beam.intensity=value==='night'?25:value==='sunset'?5:0;}
 return{root,select,update,camera,phase,get frame(){return frame;}};
}
