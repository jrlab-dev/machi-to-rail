import * as T from 'three';
// Only direct, static boxes: animated children retain their original transforms.
export function batchMountainBoxes(root,geometry){
 const groups=new Map();
 for(const o of [...root.children]){
  if(!o.isMesh||o.isInstancedMesh||o.geometry!==geometry||Array.isArray(o.material)||o.material.transparent)continue;
  const key=[o.material.uuid,o.castShadow,o.receiveShadow,Math.floor(o.position.x/160),Math.floor(o.position.z/160)].join(':');
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
 }
 const batches=[];
 for(const rows of groups.values()){
  if(rows.length<2)continue;
  const first=rows[0],batch=new T.InstancedMesh(geometry,first.material,rows.length);batch.name='mountain-static-batch';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
  rows.forEach((o,i)=>{o.updateMatrix();batch.setMatrixAt(i,o.matrix);root.remove(o);});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();root.add(batch);batches.push(batch);
 }
 return batches;
}
