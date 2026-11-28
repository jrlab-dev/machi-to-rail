import {elevatedSupportPlan} from './elevated-supports.mjs?v=rail-94';
import * as T from 'three';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
import {sampleItem} from './core.mjs?v=rail-94';
// All repeating structures share instanced geometry, including the ramp sleepers.
export function buildElevatedRails(town,kit,groundHeight=null){
 const root=new T.Group(),buckets=new Map(),strips=new Map(),colors={concrete:'#c1c4be',edge:'#d9dbd4',bed:'#888c89',sleeper:'#b9b9ac',rail:'#77838a',wire:'#54646b',cap:'#858e8a'};
 const add=(kind,w,h,d,x,y,z,yaw=0,pitch=0)=>{if(!buckets.has(kind))buckets.set(kind,[]);buckets.get(kind).push({w,h,d,x,y,z,yaw,pitch});};
 const at=(p,side=0)=>[p[0]+Math.sin(p[2])*side,(p[3]||0),-p[1]+Math.cos(p[2])*side];
 const sweep=(kind,it,r,side,width,height,thick)=>{const pos=[],indices=[],n=Math.ceil(r.length/1.2);for(let i=0;i<=n;i++){const p=sampleItem(it,r,i/n);for(const [s,h]of[[side-width/2,height-thick/2],[side+width/2,height-thick/2],[side+width/2,height+thick/2],[side-width/2,height+thick/2]]){const v=at(p,s);pos.push(v[0],v[1]+h,v[2]);}}for(let i=0;i<n;i++)for(let j=0;j<4;j++){const a=i*4+j,b=(i+1)*4+j,c=(i+1)*4+(j+1)%4,d=i*4+(j+1)%4;indices.push(a,b,c,a,c,d);}indices.push(0,1,2,0,2,3,n*4,n*4+2,n*4+1,n*4,n*4+3,n*4+2);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();if(!strips.has(kind))strips.set(kind,[]);strips.get(kind).push(g);};
 const supportPlan=elevatedSupportPlan(town,kit);
 for(const it of town.rails){const spec=kit.pieces[it.piece];if(!spec.procedural&&!spec.connector)continue;const r=spec.routes[0],n=Math.ceil(r.length/1.2);
  if(spec.procedural)sweep('concrete',it,r,0,11.4,-.95,1);sweep('bed',it,r,0,3.2,-.38,.28);
  for(const side of(spec.procedural?[-5.5,5.5]:[])){sweep('edge',it,r,side,.2,.1,1.1);sweep('cap',it,r,side,.27,.69,.09);}
  for(const side of[-kit.gauge_center/2,kit.gauge_center/2])sweep('rail',it,r,side,.065,-.07,.14);
  const count=Math.ceil(r.length/.65);for(let i=0;i<count;i++){const p=sampleItem(it,r,(i+.5)/count),[x,y,z]=at(p);add('sleeper',.22,.16,2.5,x,y-.22,z,p[2],p[4]||0);}
  const spans=Math.max(1,Math.ceil(r.length/24));for(let i=0;i<spans;i++){const p=sampleItem(it,r,(i+.5)/spans),[x,y,z]=at(p);if(supportPlan.byUid.get(it.uid)?.includes(i)){for(const side of[-2.7,2.7]){const q=at(p,side);
    // Rail height stays fixed. On a riverbed the pier grows down to its footing.
    const floor=groundHeight?groundHeight(q[0],-q[2]):-.5,delta=floor+.5;
    add('concrete',1.1,y-.9-delta,1.1,q[0],(y-1.4+delta)/2,q[2],p[2]);
    add('cap',2,.3,2,q[0],-.3+delta,q[2],p[2]);}add('concrete',1.4,.6,8,x,y-1.5,z,p[2]);}
   const side=at(p,-5.1);add('wire',.18,6.45,.18,side[0],y+2.9,side[2],p[2]);add('wire',.12,.13,5.5,x+Math.sin(p[2])*-2.4,y+6.12,z+Math.cos(p[2])*-2.4,p[2]);
  }
  const wires=Math.ceil(r.length/4);for(let i=0;i<wires;i++){const a=sampleItem(it,r,i/wires),b=sampleItem(it,r,(i+1)/wires),p=sampleItem(it,r,(i+.5)/wires),[x,y,z]=at(p);add('wire',Math.hypot(b[0]-a[0],b[1]-a[1],b[3]-a[3])+.01,.025,.025,x,y+6.12,z,p[2],p[4]||0);}
 }
 const dummy=new T.Object3D();for(const[k,rows]of buckets){const geometry=new T.BoxGeometry(1,1,1),material=new T.MeshStandardMaterial({color:colors[k],roughness:k==='rail'?.35:.9,metalness:k==='rail'?.55:0}),mesh=new T.InstancedMesh(geometry,material,rows.length);mesh.userData.ownedGeometry=true;mesh.userData.ownedMaterial=true;mesh.castShadow=true;mesh.receiveShadow=true;rows.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.yaw,p.pitch,'YXZ');dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();root.add(mesh);}
 for(const[k,gs]of strips){const geometry=mergeGeometries(gs);gs.forEach(g=>g.dispose());const material=new T.MeshStandardMaterial({color:colors[k],roughness:k==='rail'?.35:.9,metalness:k==='rail'?.55:0}),mesh=new T.Mesh(geometry,material);mesh.userData.ownedGeometry=true;mesh.userData.ownedMaterial=true;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}return root;
}
