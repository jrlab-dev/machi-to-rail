import {airlinerPose} from './island-air-traffic.mjs?v=rail-90';
import {createHelicopter} from './island-helicopter.mjs?v=rail-90';
import * as T from 'three';

// Combine the airframe, swept wings, glazing and undercarriage into a shared mesh.
function airlinerGeometry(){
  const positions=[],normals=[],colors=[];
  const sphere=new T.SphereGeometry(1,20,12), cube=new T.BoxGeometry(),detail=new T.SphereGeometry(1,8,5);
  const obj=new T.Object3D(),point=new T.Vector3(),normal=new T.Vector3(),normalMatrix=new T.Matrix3();
  function part(geo,x,h,z,w,height,d,tint,roll=0){
    obj.position.set(x,h,z);obj.rotation.set(0,0,roll);obj.scale.set(w,height,d);obj.updateMatrix();
    normalMatrix.getNormalMatrix(obj.matrix);
    const {position,normal:n}=geo.attributes,c=new T.Color(tint),index=geo.index;
    for(let k=0;k<(index?.count??position.count);k++){
      const i=index?index.getX(k):k;point.fromBufferAttribute(position,i).applyMatrix4(obj.matrix);
      normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();
      positions.push(point.x,point.y,point.z);normals.push(normal.x,normal.y,normal.z);colors.push(c.r,c.g,c.b);
    }
  }
  function panel(vertices,tint){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    g.computeVertexNormals();part(g,0,0,0,1,1,1,tint);g.dispose();
  }
  part(sphere,0,3.14,0,16,1.78,1.73,'#ebece4');
  part(sphere,12.35,3.88,0,2.4,.53,1.04,'#254b5c',-.17);
  for(const side of [-1,1]){
    panel([3.2,2.85,side,-4.2,2.82,side,-8.4,3.62,side*14.7,3.2,2.85,side,-8.4,3.62,side*14.7,-6.85,3.65,side*14.85],'#becbd0');
    panel([-9.9,3.51,side*.7,-14.2,3.6,side*.7,-15.5,4.05,side*5.75,-9.9,3.51,side*.7,-15.5,4.05,side*5.75,-13.9,4.08,side*5.75],'#b8c9ca');
    part(sphere,.35,2.20,side*5.15,2.65,.82,.80,'#467e8b');
    part(sphere,2.61,2.21,side*5.15,.23,.51,.51,'#32464d');
    for(let k=-10;k<=10;k+=1.15){
      const offset=1.70*Math.sqrt(Math.max(0,1-(k/16)**2-.1));
      part(detail,k,3.65,side*offset,.26,.22,.10,'#365d69');
    }
    part(sphere,-2.3,.57,side*1.36,.52,.54,.27,'#384249');
    part(cube,-2.3,1.44,side*1.36,.22,1.24,.20,'#7c898a');
  }
  panel([-8,4.3,0,-14.4,3.55,0,-15.1,9.4,0,-8,4.3,0,-15.1,9.4,0,-13.48,9.24,0],'#217b8b');
  part(sphere,9.6,.52,0,.38,.45,.32,'#384249');part(cube,9.6,1.48,0,.19,1.65,.20,'#83918f');
  sphere.dispose();cube.dispose();detail.dispose();
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  return g;
}

export function createAirport(root,box,round,resources){
  // A reclaimed island with chamfered breakwaters and flat operational surfaces.
  const shape=new T.Shape();
  const coast=[[785,-93],[820,-168],[870,-190],[1448,-190],[1510,-147],[1510,46],[1465,99],[1390,110],[840,110],[785,72]];
  coast.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const land=new T.ExtrudeGeometry(shape,{depth:3.5,bevelEnabled:false});land.rotateX(-Math.PI/2);
  const grass=new T.MeshStandardMaterial({color:'#91a779'}),island=new T.Mesh(land,grass);island.position.y=-2.2;root.add(island);resources.push(land,grass);
  for(let i=0;i<coast.length;i++){
    const [x,z]=coast[i],[u,v]=coast[(i+1)%coast.length];
    box((x+u)/2,-.22,(z+v)/2,Math.hypot(x-u,z-v),3.35,2.5,'#acb4a4',Math.atan2(z-v,u-x));
  }
  const runwayZ=-125;
  box(1150,1.36,runwayZ,604,.12,35,'#46545b');
  box(1150,1.38,-69,598,.13,12,'#738185');
  box(1158,1.38,-23,236,.13,79,'#a5a79e');
  for(const x of [875,1418]){
    box(x,1.39,-97,13,.13,56,'#768286');box(x,1.49,-97,.35,.035,56,'#ebca67');
  }
  box(1150,1.49,-69,551,.035,.35,'#ebca67');
  for(const side of [-1,1]){
    box(1150,1.45,runwayZ+side*16.7,599,.045,.38,'#f1efdb');
    for(let x=855;x<1450;x+=20)round(x,1.57,runwayZ+side*18,.48,.19,.48,'#e6edc6');
    for(const x of [861,1439])for(let j=1;j<=4;j++)box(x,1.46,runwayZ+side*(2+j*2.8),14,.06,1.4,'#eeeadd');
    for(const x of [928,1372])box(x,1.46,runwayZ+side*8.4,16,.05,3.2,'#f1efdf');
  }
  for(let x=906;x<=1396;x+=23)box(x,1.46,runwayZ,10,.05,.64,'#f1efdf');
  function sign(text,x,h,z,width,height,color,rotationX=0,rotationZ=0){
    const c=document.createElement('canvas');c.width=768;c.height=128;
    const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='bold 84px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,68,740);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
    const m=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),g=new T.PlaneGeometry(width,height),mesh=new T.Mesh(g,m);
    mesh.position.set(x,h,z);mesh.rotation.set(rotationX,0,rotationZ);root.add(mesh);resources.push(tex,m,g);
  }
  sign('09',884,1.49,runwayZ,39,12,'#f4f0dd',-Math.PI/2,-Math.PI/2);
  sign('27',1416,1.49,runwayZ,39,12,'#f4f0dd',-Math.PI/2,Math.PI/2);
  // Landside terminal with a glazed front and a ribbed, arched departure hall.
  box(1220,7.9,22,93,13.2,24,'#487385');
  for(let x=1174;x<=1267;x+=4.2)box(x,8.1,22,.35,13.4,24.3,'#cad7d4');
  for(const h of [4.7,9.0])box(1220,h,22,94,.32,24.6,'#c0d2cf');
  for(let j=0;j<15;j++){
    const dz=(j-7)*1.85;
    box(1220,14.75+2.15*Math.cos(dz/14*Math.PI/2),22+dz,97,.55,2.08,j%3===0?'#689097':'#cbdad5');
  }
  box(1220,12.1,34.4,75,3.9,.24,'#244953');sign('未来島空港　 YUME AIRPORT',1220,12.15,34.56,72,3.65,'#fff5d7');
  // Level boarding link from the platform to the departure hall.
  box(1176,12.79,44,4,.4,21,'#a1b2af');
  box(1176,16.35,44,4.45,.4,21,'#cddad1');
  for(const x of [1174,1178])for(let z=35;z<53;z+=3)box(x,14.48,z,.16,3.51,.17,'#6e8686');
  // Airside gate pier, passenger bridges and three occupied stands.
  box(1167,5.9,5,148,8.8,11,'#738e98');box(1167,10.62,5,151,.7,12.5,'#d6ded3');
  const planeGeo=airlinerGeometry(),planeMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.55});resources.push(planeGeo,planeMat);
  function aircraft(x,z,yaw){
    const mesh=new T.Mesh(planeGeo,planeMat);mesh.position.set(x,1.47,z);mesh.rotation.y=yaw;root.add(mesh);return mesh;
  }
  // An open apron beside the pier keeps one aircraft in view from the train.
  box(1070,1.4,-1,57,.13,62,'#aaa99d');
  aircraft(1070,2,-Math.PI*.32);
  for(const z of [23,31]){
    box(1083,3.05,z,9.6,2.85,2.7,'#e6e7d4');box(1083,3.62,z,9.15,.98,2.78,'#375864');
    for(const dx of [-3,3])round(1083+dx,1.74,z,1,.54,2.8,'#485258');
  }
  for(let j=0;j<18;j++)box(1043+j*2.9,1.51,36,1.45,.045,.22,'#ebe8d5');
  for(const x of [1110,1161,1212]){
    aircraft(x,-28,-Math.PI/2);
    box(x+2.35,5.15,-8,2.9,2.7,17,'#c5d1cc');
    round(x+2.35,2.62,-14,.7,2.5,.7,'#728581');
    box(x,1.49,-53,.32,.04,25,'#e9c963');
    box(x-13,2.12,-13,3.5,1.3,1.6,'#e4b854');
  }
  // Control tower, maintenance hangars and apron floodlights.
  round(1034,17,-2,4.8,31.6,4.8,'#d7d9c9');round(1034,32.8,-2,11,1.2,11,'#64808b');
  round(1034,35.65,-2,9.6,4.7,9.6,'#30596c');round(1034,38.4,-2,12,.85,12,'#dce3d5');round(1034,41,-2,.3,5,.3,'#a6b4b0');
  for(const x of [1341,1391]){box(x,7.4,-18,41,12,34,'#b4c3c3');box(x,13.9,-18,43,.8,36,'#dae1d8');box(x,6.3,-35.2,32,9.6,.35,'#71848b');}
  for(const x of [1070,1137,1190,1260]){round(x,9,-4,.32,15.5,.32,'#879394');box(x,16.9,-4,3.3,.85,.65,'#e4dfc8');}
  const updateHelicopter=createHelicopter(root,box,round,resources);
  const flyer=aircraft(1130,runwayZ,0);flyer.name='未来島・運航旅客機';
  return (time,body)=>{
    updateHelicopter(time,body);
    const pose=airlinerPose(time);
    flyer.visible=pose.scale>0;
    flyer.position.set(pose.x,pose.y,pose.z);flyer.scale.setScalar(pose.scale);
    flyer.rotation.set(0,pose.yaw,pose.pitch,'YXZ');
  };
}
