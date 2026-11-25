import * as T from 'three';
import {drawLetter} from './train-lettering.mjs';
import {attachDoorLettering} from './train-doors.mjs?v=retro-87';

export function prepareLettering(cars,profile={length:20,width:3,height:2.75,bottom:1,front:9.835,side:1.51,doubleEnded:false}){
 if(profile.surfacePaint)return prepareSurfaceLettering(cars,profile);
 const slots={},frontWidth=profile.letterFrontWidth||profile.width-.2,doorGeometries=new Set();
 for(const key of ['side','front']){
  const c=document.createElement('canvas');c.width=key==='side'?2048:480;c.height=Math.round((key==='side'?2048/profile.length:480/frontWidth)*profile.height);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const material=new T.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.6,polygonOffset:true,polygonOffsetFactor:-1});
  material.userData.letteringOverlay=true;
  const geometry=new T.PlaneGeometry(key==='side'?profile.length:frontWidth,profile.height),meshes=[];
  cars.forEach((car,i)=>{if(key==='front'&&i!==0&&i!==cars.length-1)return;for(const s of key==='side'||profile.doubleEnded?[-1,1]:[1]){
   const mesh=new T.Mesh(geometry,material);mesh.position.set(key==='front'?s*profile.front:0,profile.bottom+profile.height/2,key==='side'?s*profile.side:0);mesh.rotation.y=key==='front'?s*Math.PI/2:s===1?0:Math.PI;mesh.renderOrder=2;
   if(key==='side'&&car.doors?.length){const result=attachDoorLettering(mesh,car);meshes.push(...result.meshes);result.geometries.forEach(g=>doorGeometries.add(g));}else{car.parts.body.add(mesh);meshes.push(mesh);}
  }});slots[key]={canvas:c,texture,material,geometry,meshes};
 }
 let previous='';
 return {apply(d){const next=JSON.stringify(d||null);if(next===previous)return;previous=next;for(const [key,slot] of Object.entries(slots)){drawLetter(slot.canvas.getContext('2d'),d?.[key]);slot.texture.needsUpdate=true;slot.meshes.forEach(m=>m.visible=!!d?.[key]?.text);}},dispose(){for(const s of Object.values(slots)){s.meshes.forEach(m=>m.removeFromParent());s.texture.dispose();s.material.dispose();s.geometry.dispose();}doorGeometries.forEach(g=>g.dispose());}};
}

function prepareSurfaceLettering(cars,profile){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=512;
 const side=document.createElement('canvas');side.width=1536;side.height=Math.round(1536/profile.length*profile.height);
 const front=document.createElement('canvas');front.width=512;front.height=Math.round(512/profile.width*profile.height);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.channel=1;texture.anisotropy=4;
 const material=new T.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.6,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 material.userData.letteringOverlay=true;
 const meshes=[],blank=new T.MeshBasicMaterial();blank.visible=false;
 const eligible=m=>m.name.startsWith('Paint_')&&!m.name.startsWith('Paint_roof');
 for(const car of cars){const sources=[];car.parts.body.traverse(o=>{if(o.isMesh&&o.geometry.attributes.uv1&&(Array.isArray(o.material)?o.material:[o.material]).some(eligible))sources.push(o);});
  for(const source of sources){const mats=Array.isArray(source.material)?source.material.map(m=>eligible(m)?material:blank):material;const mesh=new T.Mesh(source.geometry,mats);mesh.renderOrder=2;source.add(mesh);meshes.push(mesh);}
 }
 let previous='';return{apply(d){const key=JSON.stringify(d||null);if(key===previous)return;previous=key;drawLetter(side.getContext('2d'),d?.side);drawLetter(front.getContext('2d'),d?.front);const c=canvas.getContext('2d');c.clearRect(0,0,2048,512);c.drawImage(side,0,0,1536,512);c.drawImage(front,1536,0,512,512);texture.needsUpdate=true;meshes.forEach(m=>m.visible=!!(d?.side?.text||d?.front?.text));},dispose(){meshes.forEach(m=>m.removeFromParent());texture.dispose();material.dispose();blank.dispose();}};
}
