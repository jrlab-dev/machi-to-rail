import * as T from 'three';
import {doorOpening} from './service-presentation.mjs?v=rail-90';
const cache=new WeakMap();
const floors=new Map(),floorMaterial=new T.MeshStandardMaterial({color:'#555d60',roughness:.95});
// Clip each triangle, retaining all vertex attributes and the original paint UVs.
function cut(poly,axis,value,sign){
  const inside=[],outside=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign;
    (da>=0?inside:outside).push(a);
    if((da>=0)!==(db>=0)){const t=da/(da-db),v=a.map((x,k)=>x+(b[k]-x)*t);inside.push(v);outside.push(v);}
  }return [inside,outside];
}
function append(out,poly){for(let i=1;i<poly.length-1;i++)for(const v of [poly[0],poly[i],poly[i+1]])out.push(...v);}
function splitGeometry(mesh,profile){
  let entries=cache.get(mesh.geometry);if(!entries){entries=new Map();cache.set(mesh.geometry,entries);}
  const key=JSON.stringify(profile)+mesh.matrix.elements.join(',');if(entries.has(key))return entries.get(key);
  const g=mesh.geometry.clone().applyMatrix4(mesh.matrix),attrs=Object.entries(g.attributes).filter(([n])=>['position','normal','uv','uv1','color'].includes(n));
  attrs.sort(([a],[b])=>a==='position'?-1:b==='position'?1:0);
  const stride=attrs.reduce((s,[,a])=>s+a.itemSize,0),vertices=[];
  for(let i=0;i<g.attributes.position.count;i++){const v=[];for(const[,a]of attrs)for(let k=0;k<a.itemSize;k++)v.push(a.array[i*a.itemSize+k]);vertices.push(v);}
  const tram=profile==='tram',centers=tram?[-4.58,4.58]:profile==='middle'?[-7.25,-2.45,2.45,7.25]:[-7.6,-2.8,2,6.8];
  const zones=[];for(const side of [-1,1])for(const x of centers)for(const half of [-1,1])zones.push({side,half,planes:[[0,x+(half<0?-.705:0),1],[0,x+(half<0?0:.705),-1],[1,tram?.92:profile==='middle'?1.215:1.125,1],[1,tram?2.91:3.085,-1],[2,side*(tram?1.08:1.27),side]],data:[]});
  const fixed=[],indices=g.index?.array||Array.from({length:vertices.length},(_,i)=>i);
  for(let i=0;i<indices.length;i+=3){let pending=[[vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]]]];
    for(const zone of zones){const next=[];for(const poly of pending){
      if(zone.planes.some(([axis,value,sign])=>poly.every(v=>(v[axis]-value)*sign<0))){next.push(poly);continue;}
      let inner=poly;for(const [axis,value,sign]of zone.planes){const [yes,no]=cut(inner,axis,value,sign);if(no.length>=3)next.push(no);inner=yes;if(inner.length<3)break;}
      if(inner.length>=3)append(zone.data,inner);
    }pending=next;}
    for(const poly of pending)append(fixed,poly);
  }
  function geometry(data){if(!data.length)return null;const result=new T.BufferGeometry();let offset=0;for(const[name,a]of attrs){const out=new Float32Array(data.length/stride*a.itemSize);for(let i=0;i<data.length/stride;i++)for(let k=0;k<a.itemSize;k++)out[i*a.itemSize+k]=data[i*stride+offset+k];result.setAttribute(name,new T.BufferAttribute(out,a.itemSize));offset+=a.itemSize;}result.computeBoundingSphere();return result;}
  const result={fixed:geometry(fixed),zones:zones.map(z=>({...z,data:undefined,geometry:geometry(z.data)}))};g.dispose();entries.set(key,result);return result;
}
export function prepareDoors(body,profile){
  body.userData.doorProfile=profile;
  if(typeof profile==='object'){
    const leaves=[];body.traverse(o=>{if(/^door_(left|right)_(front|rear)$/.test(o.name)){const side=o.name.includes('_left_')?-1:1; o.userData={...o.userData,side,half:o.name.endsWith('_front')?1:-1,travel:1,baseX:o.position.x,baseZ:o.position.z};leaves.push(o);}});
    return leaves;
  }
  const leaves=[];const groups=new Map();
  body.updateMatrixWorld(true);const meshes=[];body.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const inverse=body.matrixWorld.clone().invert();
  for(const mesh of meshes){mesh.matrix.copy(inverse).multiply(mesh.matrixWorld);const split=splitGeometry(mesh,profile);mesh.removeFromParent();
    if(split.fixed)body.add(new T.Mesh(split.fixed,mesh.material));
    split.zones.forEach((zone,i)=>{if(!zone.geometry)return;let group=groups.get(i);if(!group){group=new T.Group();group.userData={side:zone.side,half:zone.half,zoneIndex:i};groups.set(i,group);leaves.push(group);body.add(group);}group.add(new T.Mesh(zone.geometry,mesh.material));});
  }
  if(!floors.has(profile)){const floor=new T.BoxGeometry(profile==='tram'?11.5:19.1,.09,profile==='tram'?2.15:2.65);floor.translate(0,profile==='tram'?.88:1.13,0);floors.set(profile,floor);}
  body.add(new T.Mesh(floors.get(profile),floorMaterial));
  return leaves;
}
export function attachDoorLettering(mesh,car){
  const body=car.parts.body,profile=body.userData.doorProfile;
  if(!profile){body.add(mesh);return {meshes:[mesh],geometries:[]};}
  mesh.updateMatrix();const split=splitGeometry(mesh,profile),meshes=[],geometries=[];
  function add(geometry,parent){if(!geometry)return;const part=new T.Mesh(geometry,mesh.material);part.renderOrder=mesh.renderOrder;parent.add(part);meshes.push(part);geometries.push(geometry);}
  add(split.fixed,body);split.zones.forEach((z,i)=>add(z.geometry,car.doors.find(d=>d.userData.zoneIndex===i)||body));
  return {meshes,geometries};
}
export function animateDoors(parts,cars,visual,enabled,platformCenter=5){
  const amount=enabled?doorOpening(visual?.service,visual?.speed):0;
  for(let i=0;i<parts.length;i++){const c=cars[i]||cars[0];if(!c)continue;const center=typeof platformCenter==='function'?platformCenter(c):platformCenter;
    // 数なら今まで通り（x軸沿いの線路）。{side} の形なら側をそのまま使う：0＝開けない、±1＝片側、2＝両側（自由編集の駅）。
    const platformSide=center&&typeof center==='object'?center.side:Math.sign((center+c.body[1])*Math.cos(c.body[2]+(c.tail?Math.PI:0))),opens=side=>platformSide===2?side!==0:side===platformSide;
    for(const {row,side} of parts[i].riderRows||[])row.visible=opens(side)&&amount>0;
    for(const leaf of parts[i].doors||[]){const a=opens(leaf.userData.side)?amount:0;leaf.position.x=(leaf.userData.baseX||0)+leaf.userData.half*(leaf.userData.travel||.69)*a;leaf.position.z=(leaf.userData.baseZ||0)-leaf.userData.side*(leaf.userData.depthTravel??.08)*a;}
  }return amount;
}
