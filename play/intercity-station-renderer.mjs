import {createStationAds} from "./station-ads.mjs?v=marks-88";
import * as T from 'three';
import {STATIONS} from './intercity-stations.mjs?v=marks-88';
export function createStations(){
 const root=new T.Group();root.name='intercity-stations';const groups=new Map(),materials=[],textures=[],lamps=[],dummy=new T.Object3D();
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.8,...extra});materials.push(m);return m;};
 const concrete=material('#b9c4c4'),floor=material('#d3d5cd'),edge=material('#f2eee3'),yellow=material('#d8b95d'),steel=material('#647b80',{metalness:.45}),roof=material('#e7ebe8'),glass=material('#649399',{metalness:.3,roughness:.22}),wood=material('#a08360'),dark=material('#30484d'),white=material('#fff3c9',{emissive:'#fff1c5',emissiveIntensity:.25});lamps.push(white);
 function box(m,x,y,z,w,h,d,ry=0,rz=0){if(!groups.has(m))groups.set(m,[]);groups.get(m).push([x,y,z,w,h,d,ry,rz]);}
 function sign(text,sub,color,x,y,z,w=8,h=1.3,back=false){
  const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#f4f4e9';ctx.fillRect(0,0,1024,192);ctx.fillStyle=color;ctx.fillRect(0,152,1024,40);ctx.fillStyle='#243f44';ctx.font='bold 72px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,85);ctx.font='28px sans-serif';ctx.fillText(sub,512,133);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=material('#ffffff',{map:tex,side:T.DoubleSide,emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:.1});lamps.push(m);const mesh=new T.Mesh(new T.PlaneGeometry(w,h),m);mesh.position.set(x,y,z);if(back)mesh.rotation.y=Math.PI;root.add(mesh);
 }
 for(const s of STATIONS){
  const accent=material(s.color);
  // Continuous platforms except for the two stairwell openings.
  for(const z of[-4.5,13.5]){
   for(const side of[-1,1]){box(concrete,s.x+side*73,8.36,z,114,1.2,5);box(floor,s.x+side*73,9,z,114,.06,5);}
   for(const side of[-1,1]){box(concrete,s.x,8.36,z+side*1.9,32,1.2,1.2);box(floor,s.x,9,z+side*1.9,32,.06,1.2);}
   for(const side of[-1,1]){box(yellow,s.x,9.05,z+side*2.13,259,.04,.3);box(edge,s.x,9.03,z+side*2.47,260,.09,.08);}
   box(roof,s.x,13.15,z,244,.22,5.8);box(accent,s.x,13.04,z-2.88,244,.25,.1);box(accent,s.x,13.04,z+2.88,244,.25,.1);
   for(let dx=-112;dx<=112;dx+=16){if(Math.abs(dx)<20)continue;box(steel,s.x+dx,11.06,z,.22,4,.22);box(steel,s.x+dx,12.92,z,.16,.24,5.6);box(white,s.x+dx,12.76,z+1.4,5,.07,.18);}
   for(const dx of[-88,72,110]){box(wood,s.x+dx,9.5,z,4,.12,.7);for(const a of[-1.5,1.5])box(steel,s.x+dx+a,9.25,z,.12,.45,.55);}
   for(const dx of[-72,56]){for(const a of[-2.8,2.8])box(steel,s.x+dx+a,12.5,z,.06,.8,.06);sign(s.name,z<0?'1 普通 / 2 高速':'3 高速 / 4 普通',s.color,s.x+dx,11.5,z,7,1.2);sign(s.name,z<0?'1 普通 / 2 高速':'3 高速 / 4 普通',s.color,s.x+dx,11.5,z-.03,7,1.2,true);}
   // Enclosed stairs are kept in the island centre; edge corridors remain clear.
   for(let i=0;i<45;i++)box(concrete,s.x-15+i*.66,.1+i*.1,z,.68,.2+i*.2,2.4);
   box(floor,s.x+15.15,8.95,z,1.7,.16,2.6);
   for(const side of[-1,1]){box(glass,s.x,9.7,z+side*1.3,32,1.3,.08);box(steel,s.x,10.38,z+side*1.3,32,.08,.08);}
   box(roof,s.x,12.5,z,34,.2,3);sign('出口 ↓',s.name,s.color,s.x+16,11.25,z,3,1);
   // Compact glass waiting room, clear of stairs and both platform edges.
   box(glass,s.x-95,10.3,z,9,2.5,2.3);box(roof,s.x-95,11.62,z,9.3,.16,2.5);
  }
  // Ground-level entrance and concourse connect below the four-track deck.
  box(floor,s.x,-.1,-7,76,.2,55);for(const side of[-1,1])box(concrete,s.x+side*38,2.85,-7,.3,5.7,55);box(concrete,s.x,2.85,20.5,76,5.7,.3);box(glass,s.x,2.6,-34.6,65,4.5,.18);box(roof,s.x,5.85,-25,80,.28,24);
  for(let dx=-32;dx<=32;dx+=8){box(steel,s.x+dx,2.8,-34.8,.16,5.3,.2);box(edge,s.x+dx,5.1,-34.9,7.7,.2,.18);}
  box(accent,s.x,5.5,-35.1,76,.6,.25);sign(s.name,'STATION',s.color,s.x,4.5,-35.3,17,1.5,true);
  for(const dx of[-5,0,5]){box(dark,s.x+dx,1.55,-35,3.7,3.1,.2);box(glass,s.x+dx,1.7,-35.15,3.4,2.6,.1);}
  box(floor,s.x,-.1,-54,110,.2,42);box(roof,s.x,3.7,-40,58,.2,10);
  for(const dx of[-27,-9,9,27])box(edge,s.x+dx,1.8,-44,.25,3.6,.25);
  for(let dx=-48;dx<=48;dx+=12){box(dark,s.x+dx,.1,-70,4,.3,2);box(accent,s.x+dx,.7,-70,3.6,.9,1.6);}
  // A pedestrian approach ties each forecourt to the existing town.
  box(floor,s.x,-.1,-86,16,.18,30);for(const dx of[-8,8])box(yellow,s.x+dx,-.005,-86,.12,.04,30);
 }
 for(const [m,rows]of groups){const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),m,rows.length);rows.forEach(([x,y,z,w,h,d,ry,rz],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,ry,rz);dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
 const ads=createStationAds();root.add(ads.root);
 return {root,update(phase){ads.update(phase);for(const m of lamps)m.emissiveIntensity=phase==='night'?1.1:phase==='sunset'?.5:.15;const night=phase==='night';floor.emissive.set('#aac6ca');floor.emissiveIntensity=night?.18:0;roof.emissive.set('#a9c2ca');roof.emissiveIntensity=night?.08:0;glass.emissive.set('#e1bb7a');glass.emissiveIntensity=night?.28:0;},dispose(){root.remove(ads.root);ads.dispose();root.traverse(o=>{o.geometry?.dispose();if(o.isInstancedMesh)o.dispose();});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}};
}
