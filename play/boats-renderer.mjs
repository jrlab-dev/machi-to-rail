import * as T from 'three';
import {BOAT_COLORS,buildBoats} from './boats-data.mjs?v=fuji-land-31';
export function createBoats(){
 const root=new T.Group();root.name='sea-boats';const data=buildBoats(),materials=[],geometries=[];
 for(const batch of data.geometry){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(batch.positions,3));geometry.setAttribute('normal',new T.BufferAttribute(batch.normals,3));geometry.setIndex(new T.BufferAttribute(batch.indices,1));geometry.computeBoundingSphere();geometries.push(geometry);const color=BOAT_COLORS[batch.color],material=new T.MeshStandardMaterial({color,roughness:.84,metalness:0,side:T.DoubleSide});materials.push({material,color});const mesh=new T.Mesh(geometry,material);mesh.name='boat-'+batch.color;root.add(mesh);}
 let previous,disposed=false;
 root.userData.boats={count:data.boats.length,boats:data.boats,triangles:data.triangles,draws:data.draws,geometryBytes:data.bytes,textures:0};
 return{root,update(phase='day'){if(phase===previous)return;previous=phase;const tint=new T.Color(phase==='night'?'#31465e':phase==='sunset'?'#e7b39d':'#ffffff');for(const {material,color}of materials)material.color.set(color).multiply(tint);},dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const g of geometries)g.dispose();for(const {material}of materials)material.dispose();root.clear();}};
}
