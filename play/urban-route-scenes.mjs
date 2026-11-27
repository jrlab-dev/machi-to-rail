import {northing} from './suspended-route.mjs?v=rail-90';
import {addUrbanBuildings} from './urban-buildings.mjs?v=rail-93';
import {tokyoLots,suspendedLots,intercityLots,departureGround,suspendedStreets} from './urban-route-lots.mjs?v=rail-93';

export function dressTokyo(three,surface,existing){
  addUrbanBuildings(three,surface,tokyoLots(existing));
}
export function dressSuspended(three,root,groundHeight){
  addUrbanBuildings(three,root,suspendedLots(groundHeight));
  const positions=[],colors=[];
  const offsets={paving:.052,walk:.11,street:.15};
  const tints={paving:'#acb0a4',walk:'#c8c6b9',street:'#777f80'};
  for(const {x0,x1,v0,v1,kind} of suspendedStreets()){
    const count=Math.ceil((x1-x0)/6),c=new three.Color(tints[kind]);
    const vertex=(x,v)=>{
      const z=-northing(x)-v;
      return [x,groundHeight(x,z)+offsets[kind],z];
    };
    for(let i=0;i<count;i++){
      const a=x0+(x1-x0)*i/count,b=x0+(x1-x0)*(i+1)/count;
      // The lateral offsets switch sign across the line. Keep all faces up.
      const lo=Math.min(v0,v1),hi=Math.max(v0,v1);
      const p=vertex(a,lo),q=vertex(b,lo),r=vertex(b,hi),s=vertex(a,hi);
      positions.push(...p,...q,...r,...p,...r,...s);
      for(let j=0;j<6;j++)colors.push(c.r,c.g,c.b);
    }
  }
  const geometry=new three.BufferGeometry();
  geometry.setAttribute('position',new three.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new three.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  const material=new three.MeshStandardMaterial({vertexColors:true,roughness:1});
  const streets=new three.Mesh(geometry,material);
  streets.name='shiomi-central-side-streets';root.add(streets);
  return ()=>{geometry.dispose();material.dispose();};
}
export function dressIntercity(three,root,arrival,plan,trees){
  addUrbanBuildings(three,root,intercityLots(arrival,plan,trees));
  if(arrival)return;
  const tiles=departureGround(plan);
  if(!tiles.length)return;
  const geometry=new three.BoxGeometry(),material=new three.MeshStandardMaterial({roughness:1});
  const mesh=new three.InstancedMesh(geometry,material,tiles.length);
  const pose=new three.Object3D(),tint=new three.Color();
  for(const [i,tile] of tiles.entries()){
    pose.position.set(tile.x,tile.height,-tile.y);
    pose.scale.set(tile.w,.025,tile.d);
    pose.updateMatrix();
    mesh.setMatrixAt(i,pose.matrix);mesh.setColorAt(i,tint.set(tile.color));
  }
  mesh.name='departure-street-paving';
  mesh.computeBoundingSphere();
  mesh.addEventListener('dispose',()=>{geometry.dispose();material.dispose();});
  root.add(mesh);
}
