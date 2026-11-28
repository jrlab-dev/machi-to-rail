// 自由編集の駅の描画。見本の district-renderer.mjs には手を入れず、寸法と色だけ写す。
// 軽さ：色の違う箱は全部の駅で1つの InstancedMesh（色は1個ずつ）、灯りは1つ、駅名標は1枚の絵にまとめた1つのメッシュ。
import * as T from 'three';
import {PLATFORM,STATION_COLORS,toWorld,platformSides,buildingSide} from './free-station.mjs?v=rail-97';
const C={...STATION_COLORS,wall:'#e8e3d4',dark:'#39474a',bench:'#7a5b40',glass:'#6f8f96',white:'#f4f2ea'};
export function createFreeStationRenderer(){
 const solid=new T.MeshStandardMaterial({color:'#ffffff',roughness:.82,metalness:.08});
 const lamp=new T.MeshStandardMaterial({color:'#f0e1b3',emissive:'#ffdda1',emissiveIntensity:0,roughness:.6});
 let phase='day',root=null,owned=[];
 function clear(){for(const o of owned)o.dispose?.();owned=[];if(root){root.removeFromParent();root=null;}}
 function signTexture(names){
  const rows=Math.max(1,names.length),c=document.createElement('canvas');c.width=512;c.height=128*rows;const g=c.getContext('2d');
  names.forEach((name,i)=>{const y=i*128;g.fillStyle='#fbfaf4';g.fillRect(0,y,512,128);g.fillStyle='#2f6a55';g.fillRect(0,y+98,512,18);g.fillStyle='#e9e4d2';g.fillRect(0,y,512,6);
   g.fillStyle='#1d2b2b';let size=70;g.font=`bold ${size}px "Hiragino Sans","Noto Sans JP",sans-serif`;while(g.measureText(name).width>470&&size>30){size-=4;g.font=`bold ${size}px "Hiragino Sans","Noto Sans JP",sans-serif`;}
   g.textAlign='center';g.textBaseline='middle';g.fillText(name,256,y+52);g.fillStyle='#ffffff';g.font='bold 12px sans-serif';g.textAlign='left';g.fillText('えき',14,y+107);});
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
 }
 // g＝stationGeometry の結果の配列。
 function build(list){
  clear();root=new T.Group();root.name='free-stations';if(!list.length)return root;
  const boxes=[],lamps=[],signs=[],names=[...new Set(list.map(g=>g.name))];
  const flats=[],box=(g,x,y,z,lx,ly,h,color,out=boxes)=>{const [wx,wy]=toWorld(g,x,y);out.push({x:wx,y:z,z:-wy,angle:g.angle,sx:lx,sy:h,sz:ly,color});};
  const sign=(g,x,y,z,w,h,facing)=>signs.push({g,x,y,z,w,h,facing,row:names.indexOf(g.name)});
  for(const g of list){
   const L=g.length,mid=(PLATFORM.inner+PLATFORM.outer)/2,depth=PLATFORM.outer-PLATFORM.inner,roofL=L*PLATFORM.roofShare;
   for(const s of platformSides(g.side)){
    // 台は地面（-0.5）まで下ろす。上面は見本と同じ高さ（0.9＋床0.1＝1.0）。
    box(g,0,s*mid,(.9-.47)/2,L,depth,.9+.47,C.concrete,flats);
    box(g,0,s*mid,.95,L,depth,PLATFORM.top,C.platform,flats);
    box(g,0,s*(PLATFORM.inner+PLATFORM.edge/2),1.005,L,PLATFORM.edge,.02,C.edge,flats);
    box(g,0,s*(PLATFORM.inner+PLATFORM.tactile+PLATFORM.tactileWidth/2),1.005,L-.6,PLATFORM.tactileWidth,.02,C.yellow,flats);
    box(g,0,s*(PLATFORM.outer-.15),1.5,L,.3,1,C.concrete,flats);
    box(g,0,s*(mid+.3),PLATFORM.roofHeight,roofL,depth+.6,.24,C.roof);
    const n=Math.max(1,Math.floor(roofL/PLATFORM.pillarStep));
    for(let k=0;k<=n;k++){const x=-roofL/2+.6+(roofL-1.2)*k/n;box(g,x,s*5.6,(1+PLATFORM.roofHeight)/2,.22,.22,PLATFORM.roofHeight-1,C.steel);box(g,x,s*(mid+.3),PLATFORM.roofHeight-.2,.18,depth,.2,C.steel);
     if(k<n){const lx=x+(roofL-1.2)/n/2;box(g,lx,s*3.6,PLATFORM.roofHeight-.17,4,.22,.05,null,lamps);}}
    const count=L<60?1:Math.min(4,Math.max(2,Math.floor(L/45)));
    for(let k=0;k<count;k++){const x=count===1?-L*.18:-L/2+L*(k+.5)/count;
     for(const dx of[-1.25,1.25])box(g,x+dx,s*6.25,1+PLATFORM.signHeight/2-.1,.1,.1,PLATFORM.signHeight-.2,C.steel);
     box(g,x,s*6.25,1+PLATFORM.signHeight,2.7,.08,.78,C.steel);
     sign(g,x,s*6.25-s*.05,1+PLATFORM.signHeight,2.5,.62,-s);sign(g,x,s*6.25+s*.05,1+PLATFORM.signHeight,2.5,.62,s);
     box(g,x+3.4,s*5.9,1.24,1.8,.45,.06,C.bench);box(g,x+3.4,s*6.15,1.5,1.8,.06,.5,C.bench);for(const dx of[-.75,.75])box(g,x+3.4+dx,s*5.9,1.1,.08,.4,.22,C.dark);
    }
   }
   // 駅舎：かたがわはホームの外側、りょうがわは左側。ホームの中央、ホームから7〜13m。
   const b=buildingSide(g.side),cy=b*(PLATFORM.buildingNear+PLATFORM.buildingFar)/2,bd=PLATFORM.buildingFar-PLATFORM.buildingNear,bw=PLATFORM.buildingHalf*2;
   box(g,0,cy,-.45+PLATFORM.buildingHeight/2,bw,bd,PLATFORM.buildingHeight,C.wall);
   box(g,0,cy,PLATFORM.buildingHeight-.3,bw+1.2,bd+1.4,.35,C.roof);
   box(g,0,b*(PLATFORM.buildingFar+.03),.8,3.2,.08,2.5,C.glass);
   for(const x of[-4,4])box(g,x,b*(PLATFORM.buildingFar+.03),2.1,2,.08,1.3,C.glass);
   box(g,0,b*(PLATFORM.buildingFar+.06),3.45,6.4,.06,1.25,C.white);
   sign(g,0,b*(PLATFORM.buildingFar+.11),3.45,6,1.5,b);
   box(g,0,b*(PLATFORM.buildingFar+1.5),-.42,bw+4,3,.12,C.concrete,flats);
  }
  const unit=new T.BoxGeometry(1,1,1),dummy=new T.Object3D(),color=new T.Color();owned.push(unit);
  const instanced=(items,material,shadow)=>{if(!items.length)return;const mesh=new T.InstancedMesh(unit,material,items.length);items.forEach((o,i)=>{dummy.position.set(o.x,o.y,o.z);dummy.rotation.set(0,o.angle,0);dummy.scale.set(o.sx,o.sy,o.sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(o.color)mesh.setColorAt(i,color.set(o.color));});
   mesh.castShadow=shadow;mesh.receiveShadow=true;mesh.computeBoundingSphere();mesh.userData.freeStation=true;root.add(mesh);owned.push(mesh);};
  // 影を落とすもの（屋根・柱・駅舎など）と、落とさない平らなもの（ホームの台・床）に分ける。平らな面が自分の影でちらつく縞を防ぐ。
  instanced(boxes,solid,true);instanced(flats,solid,false);instanced(lamps,lamp,false);
  if(signs.length){
   const texture=signTexture(names),material=new T.MeshStandardMaterial({map:texture,roughness:.7,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:0});owned.push(texture,material);
   const pos=[],uv=[],nor=[],idx=[],rows=names.length;
   for(const s of signs){
    const v0=1-(s.row+1)/rows,v1=1-s.row/rows,base=pos.length/3;
    // 板の向き：facing（駅の y の向き）へ表を向ける。表から見て文字が左から右に読めるよう、左右の端を決める。
    const along=s.facing>0?-1:1,corners=[[-s.w/2*along,-s.h/2],[s.w/2*along,-s.h/2],[s.w/2*along,s.h/2],[-s.w/2*along,s.h/2]];
    for(const [dx,dz] of corners){const [wx,wy]=toWorld(s.g,s.x+dx,s.y);pos.push(wx,s.z+dz,-wy);}
    uv.push(0,v0,1,v0,1,v1,0,v1);
    const nx=-Math.sin(s.g.angle)*s.facing,ny=Math.cos(s.g.angle)*s.facing;for(let k=0;k<4;k++)nor.push(nx,0,-ny);
    idx.push(base,base+1,base+2,base,base+2,base+3);
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setIndex(idx);geo.computeBoundingSphere();
   // 表の向きは頂点の並びで決める。裏からは見えなくてよい（裏には別の板がある）。
   const mesh=new T.Mesh(geo,material);mesh.userData.freeStation=true;material.side=T.DoubleSide;root.add(mesh);owned.push(geo);
   root.userData.signMaterial=material;
  }
  setPhase(phase);return root;
 }
 function setPhase(next){phase=next;lamp.emissiveIntensity=phase==='night'?1.35:phase==='sunset'?.35:0;if(root?.userData.signMaterial)root.userData.signMaterial.emissiveIntensity=phase==='night'?.55:phase==='sunset'?.15:0;}
 return {build,clear,setPhase,get root(){return root;}};
}
