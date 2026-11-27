import * as T from 'three';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
import {cityPlan,cityFootprint,arrivalTrees} from './arrival-city-layout.mjs?v=rail-93';

// City coordinates use the same map convention as the railway (world z = -map y).
export function createArrivalCity(blockers=[]){
 const root=new T.Group();root.name='minato-city';
 const owned=[],materials=[],textures=[],sectors=[],jobs=[],plan=cityPlan(blockers);
 let disposed=false,phase='',built=0;
 const colors=['#80a3ad','#477180','#c2c7bf','#9c9f9a'];
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.72,...extra});materials.push(m);return m;};
 const stone=material('#ffffff',{vertexColors:true}),glass=[],shopGlass=material('#426773',{emissive:'#d9c7a0',emissiveIntensity:0,roughness:.3,metalness:.2});
 for(let k=0;k<4;k++){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle=['#b1c6cb','#83a6b0','#d6d5c6','#c7bda8'][k];ctx.fillRect(0,0,128,128);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   ctx.fillStyle=colors[k];ctx.fillRect(col*32+1,row*32+1,k===2?24:30,k===2?25:28);
   ctx.fillStyle=`rgba(230,247,249,${.03+((row*3+col*7+k)%5)*.015})`;ctx.fillRect(col*32+2,row*32+2,28,25);
   ctx.fillStyle='rgba(225,245,244,.18)';ctx.fillRect(col*32+2,row*32+2,28,2);
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;textures.push(t);
  const e=document.createElement('canvas');e.width=e.height=128;const ec=e.getContext('2d');ec.fillStyle='#000';ec.fillRect(0,0,128,128);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++)if((row*3+col*7+k)%5<2){ec.fillStyle=(row+col)%2?'#ffda91':'#c8e6ed';ec.fillRect(col*32+3,row*32+3,25,24);}
  const et=new T.CanvasTexture(e);et.colorSpace=T.SRGBColorSpace;et.wrapS=et.wrapT=T.RepeatWrapping;textures.push(et);
  glass.push(material('#ffffff',{map:t,emissive:'#ffffff',emissiveMap:et,emissiveIntensity:0,metalness:.3,roughness:.35}));
 }
 function box(x,y,z,w,h,d,color='#ffffff',windows=false){
  const g=new T.BoxGeometry(w,h,d),uv=g.attributes.uv;
  if(windows)for(let i=0;i<uv.count;i++){const side=Math.floor(i/4);uv.setXY(i,uv.getX(i)*(side<2?d:w)/16,uv.getY(i)*(side===2||side===3?d:h)/16);}
  const c=new T.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));g.translate(x,y,-z);return g;
 }
 function batch(parent,geos,mat){
  if(!geos.length)return;
  const g=mergeGeometries(geos,false);for(const a of geos)a.dispose();owned.push(g);
  const mesh=new T.Mesh(g,mat);mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 const ground=[];
 ground.push(box(5770,-.15,400,1350,.15,1880,'#a1ad91'));
 for(const y of[-140,100,700,940])ground.push(box(5760,-.06,y,1040,.05,94,'#b7beb4'));
 // Trim road surfaces, including their sidewalks, around retained edited props.
 for(const r of plan.roads){
  const horizontal=r.horizontal,length=horizontal?r.w:r.d;
  ground.push(box(r.x,-.045,r.y,r.w,.04,r.d,'#d0d0c4'),box(r.x,-.01,r.y,horizontal?r.w:24,.025,horizontal?25:r.d,'#667478'));
  for(let t=-length/2+7;t<length/2-3;t+=22)for(const side of(horizontal?[-1,1]:[0]))ground.push(box(r.x+(horizontal?t:0),.025,r.y+(horizontal?side*5:t),horizontal?Math.min(10,length):.25,.02,horizontal?.22:10,'#e5e1ce'));
  if(horizontal)ground.push(box(r.x,.06,r.y,r.w,.15,2.2,'#9aa97c'));
 }
 // A continuous pedestrian entrance from the station through the boulevard.
 ground.push(box(5700,.08,144,34,.14,112,'#dcd7c3'));
 for(let x=5686;x<=5714;x+=4)ground.push(box(x,.17,170,2,.03,24,'#f1edda'));
 ground.push(box(5700,.065,400,650,.2,390,'#789861'));
 ground.push(box(5700,.18,400,10,.1,390,'#d8d0b4'));
 batch(root,ground,stone);
 const park=new T.Group();root.add(park);
 const lawnCanvas=document.createElement('canvas');lawnCanvas.width=lawnCanvas.height=256;const lc=lawnCanvas.getContext('2d');lc.fillStyle='#799b62';lc.fillRect(0,0,256,256);
 for(let i=0;i<6000;i++){const x=(i*71.37)%256,y=(i*137.23)%256;lc.fillStyle=i%2?'rgba(210,219,143,.08)':'rgba(38,80,37,.07)';lc.fillRect(x,y,1,2);}
 for(let i=0;i<8;i++){lc.fillStyle=i%2?'rgba(210,225,166,.025)':'rgba(43,87,35,.025)';lc.fillRect(i*32,0,32,256);}
 const lawnTex=new T.CanvasTexture(lawnCanvas);lawnTex.colorSpace=T.SRGBColorSpace;lawnTex.wrapS=lawnTex.wrapT=T.RepeatWrapping;lawnTex.repeat.set(10,6);textures.push(lawnTex);
 const lawnGeo=new T.PlaneGeometry(650,390);lawnGeo.rotateX(-Math.PI/2);lawnGeo.translate(5700,.18,-400);owned.push(lawnGeo);const lawn=new T.Mesh(lawnGeo,material('#ffffff',{map:lawnTex}));lawn.receiveShadow=true;park.add(lawn);
 function path(points,width,color,y=.22){
  const vertices=[],indices=[];
  for(let i=0;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz)||1;vertices.push(p[0]-dz/length*width/2,y,-p[1]-dx/length*width/2,p[0]+dz/length*width/2,y,-p[1]+dx/length*width/2);if(i)indices.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();owned.push(g);park.add(new T.Mesh(g,material(color,{side:T.DoubleSide})));
 }
 const oval=Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*2;return[5700+295*Math.cos(a),400+165*Math.sin(a)];});path(oval,6,'#d9d0b3');
 const waterMat=material('#679f9f',{metalness:.45,roughness:.22,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const lake=new T.Shape();for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,r=1+.07*Math.sin(a*3);const x=5840+104*r*Math.cos(a),y=390+72*r*Math.sin(a);if(i)lake.lineTo(x,y);else lake.moveTo(x,y);}const lg=new T.ShapeGeometry(lake);lg.rotateX(-Math.PI/2);lg.translate(0,.21,0);owned.push(lg);park.add(new T.Mesh(lg,waterMat));
 path(Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2,r=1+.07*Math.sin(a*3);return[5840+111*r*Math.cos(a),390+79*r*Math.sin(a)];}),4,'#d2cbb6',.25);
 const furniture=[],lamps=[],lampMaterial=material('#e6d9b6',{emissive:'#ffdc92',emissiveIntensity:0});
 // Low park pavilion with overhanging roofs, clear of the station axis.
 furniture.push(box(5500,4,465,54,8,22,'#537d7f'),box(5500,8.3,465,65,.7,31,'#e5e0cf'),box(5500,.35,465,70,.5,40,'#c7bea5'));
 for(let x=5478;x<5528;x+=8)furniture.push(box(x,4,451,.45,8,.45,'#c7c4b2'));
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2,x=5700+304*Math.cos(a),y=400+174*Math.sin(a);furniture.push(box(x,.85,y,3.8,.35,1,'#a78c65'),box(x,1.4,y+.45,3.8,.8,.15,'#a78c65'),box(x,3,y+3,.15,6,.15,'#637575'));lamps.push(box(x,6,y+3,1.1,.35,1.1));}
 for(const y of[170,630])for(let x=5410;x<6010;x+=40){furniture.push(box(x,4,y,.18,8,.18,'#637575'));lamps.push(box(x,8,y,1.5,.25,.8));}
 batch(park,furniture,stone);
 batch(park,lamps,lampMaterial);
 const treePositions=arrivalTrees(plan);
 import('./urban-route-scenes.mjs?v=rail-93').then(({dressIntercity})=>{
  if(!disposed)dressIntercity(T,root,true,plan,treePositions.map(([x,y,h])=>({x,y,w:h*1.24,d:h*1.16})));
 });
 const o=new T.Object3D(),tg=new T.IcosahedronGeometry(1,1),trunkG=new T.CylinderGeometry(.25,.4,1,5);owned.push(tg,trunkG);
 const leaves=new T.InstancedMesh(tg,material('#ffffff',{vertexColors:false}),treePositions.length),trunks=new T.InstancedMesh(trunkG,material('#776c54'),treePositions.length);
 treePositions.forEach(([x,y,h],i)=>{o.position.set(x,h*.72,-y);o.scale.set(h*.62,h*.62,h*.58);o.updateMatrix();leaves.setMatrixAt(i,o.matrix);leaves.setColorAt(i,new T.Color(['#54825b','#71925b','#60885d','#88a36c'][i%4]));o.position.y=h*.28;o.scale.set(1,h*.55,1);o.updateMatrix();trunks.setMatrixAt(i,o.matrix);});
 leaves.instanceMatrix.needsUpdate=trunks.instanceMatrix.needsUpdate=true;park.add(leaves,trunks);
 const buckets=new Map();
 for(const b of plan.buildings){const key=Math.floor((b.x-5100)/330)+':'+Math.floor((b.y+550)/400);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(b);}
 for(const buildings of buckets.values()){
  const group=new T.Group(),details=new T.Group();root.add(group);group.add(details);
  const cx=buildings.reduce((s,b)=>s+b.x,0)/buildings.length,cy=buildings.reduce((s,b)=>s+b.y,0)/buildings.length;
  const shells=[[],[],[],[]];for(const b of buildings)shells[b.style].push(box(b.x,b.h/2,b.y,b.w,b.h,b.d,'#ffffff',true));
  shells.forEach((a,i)=>{const mesh=batch(group,a,glass[i]);if(mesh)mesh.castShadow=true;});sectors.push({group,details,cx,cy});
  jobs.push(()=>{
   const parts=[],shops=[];
   for(const b of buildings){
    const low=b.kind==='commercial',podium=low?0:6,facade=b.d/2+podium+.12;
    parts.push(box(b.x,low?5:3.8,b.y,b.w+podium*2,low?10:7.6,b.d+podium*2,['#c3c7bc','#babfb8','#d4cdbb','#bcc8c8'][b.style]));
    // Tall glazed shopfronts, a distinct entrance and a shallow canopy read from the viaduct.
    for(const side of[-1,1]){
     const face=b.y+side*facade,bays=Math.max(3,Math.floor((b.w-3)/6)),bw=(b.w-3)/bays;
     for(let i=0;i<bays;i++){
      const x=b.x-b.w/2+1.5+(i+.5)*bw;
      shops.push(box(x,low?4.7:3.65,face,bw-.35,low?8.6:5.9,.16));
      parts.push(box(x-bw/2,low?4.7:3.65,face+side*.1,.18,low?8.8:6.2,.25,'#d6d7c9'),box(x,low?6.6:4.9,face+side*.13,bw-.3,.12,.25,'#a8bab7'));
     }
     const entry=b.x+(b.style%2?1:-1)*b.w*.19;
     parts.push(box(entry,3.3,face+side*.17,.13,6,.24,'#e2dfcc'),box(entry+.65,3.1,face+side*.25,.08,.7,.16,'#e7dfbd'));
     parts.push(box(b.x,low?9.45:7,face+side*.45,b.w-1,.85,1.1,['#426e70','#7d6957','#647868','#616e82'][b.style]),box(b.x,low?8.9:6.45,face+side*1.1,b.w+1,.3,2.8,'#dfdccb'));
     if(low){
      for(const edge of[-1,1])parts.push(box(entry+edge*2.15,4.9,face+side*1.2,.5,9.1,.4,'#eee7cf'));
      parts.push(box(entry,9.45,face+side*1.2,4.8,.55,.4,'#eee7cf'),box(entry,9.75,face+side,5.6,.3,2,'#eee7cf'));
     }
    }
    // Crown, vertical fins and stepped upper mass break up each silhouette.
    parts.push(box(b.x,b.h+.8,b.y,b.w+1,1.6,b.d+1,'#ccd7d6'));
    if(low){parts.push(box(b.x+(b.style-1.5)*2,b.h+1.5,b.y,b.w*.48,3,b.d*.55,'#809497'),box(b.x-b.w*.3,b.h+.7,b.y-b.d*.2,3,1.4,4,'#b3bcba'));}
    else if(b.style%2===0)parts.push(box(b.x,b.h+7,b.y,b.w*.64,12,b.d*.65,'#9aafb3'),box(b.x,b.h+14,b.y,b.w*.42,2,b.d*.48,'#d4dcda'));
    else parts.push(box(b.x-b.w*.35,b.h+6,b.y,b.w*.2,11,b.d,'#6c8d98'));
    for(const side of[-1,1])for(let i=0;i<4;i++){const x=b.x-b.w/2+i*b.w/3;parts.push(box(x,b.h/2,b.y+side*(b.d/2+.12),.65,b.h,.28,b.style===2?'#e1e0d2':'#b3c9cb'));}
    for(let i=low?10:16;i<b.h;i+=low?6:16)parts.push(box(b.x,i,b.y,b.w+.5,.55,b.d+.5,'#a9bcbf'));
    const f=cityFootprint(b);parts.push(box(b.x,.15,b.y,f.w,.25,f.d,'#d2d0bf'));
   }
   batch(details,parts,stone);batch(details,shops,shopGlass);built++;
  });
 }
 function update(body,lighting,camera,light=false){
  if(disposed)return;
  // One bounded city block per frame; no background callbacks survive disposal.
  jobs.shift()?.();
  if(phase!==lighting){phase=lighting;for(const m of glass)m.emissiveIntensity=lighting==='night'?.75:lighting==='sunset'?.18:0;shopGlass.emissiveIntensity=lighting==='night'?.65:lighting==='sunset'?.2:0;lampMaterial.emissiveIntensity=lighting==='night'?2:lighting==='sunset'?.7:0;}
  const x=camera?.position.x??body[0],y=-(camera?.position.z??-body[1]);
  root.visible=x>3700||body[0]>4000;
  for(const s of sectors){const d=Math.hypot(s.cx-x,s.cy-y);s.group.visible=d<1900;s.details.visible=!light&&d<1000;}
  park.visible=Math.hypot(x-5700,y-400)<1600;
 }
 return{root,update,stats:()=>({buildings:plan.buildings.length,towers:plan.towers,commercial:plan.buildings.length-plan.towers,blocks:sectors.length,prepared:built,pending:jobs.length}),dispose(){disposed=true;jobs.length=0;root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of owned)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
