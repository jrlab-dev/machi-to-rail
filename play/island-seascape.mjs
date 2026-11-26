import {islandTrackSpacing} from './island-route.mjs?v=rail-90';
import * as T from 'three';

// Each coast uses the same profile at four elevations, from submerged sand to turf.
function coastline(x,z,rx,rz,phase,grass,root,resources){
  const coast=new T.Shape(),sections=64;
  for(let i=0;i<sections;i++){
    const a=2*Math.PI*i/sections;
    const r=1+.082*Math.cos(3*a+phase)+.048*Math.sin(5*a-phase)+.025*Math.cos(9*a);
    const u=rx*r*Math.cos(a),v=rz*r*Math.sin(a);
    if(i===0)coast.moveTo(u,v);else coast.lineTo(u,v);
  }
  coast.closePath();
  const g=new T.ExtrudeGeometry(coast,{depth:1,bevelEnabled:false});g.rotateX(-Math.PI/2);resources.push(g);
  for(const [scale,base,height,color] of [[1.11,-2,.85,'#7ea99c'],[1.065,-1.2,.95,'#c7bf96'],[1.025,-.27,.78,'#cbb990'],[1,.44,.84,grass]]){
    const material=new T.MeshStandardMaterial({color,roughness:1});resources.push(material);
    const mesh=new T.Mesh(g,material);mesh.scale.set(scale,height,scale);mesh.position.set(x,base,z);root.add(mesh);
  }
}

export function createSeascape(root,box,round,put,tree,resources){
  const sites=[
    [550,23,140,77,.4,'#86a875'],[562,-454,126,66,1.8,'#819f72'],
    [34,-457,128,76,3.1,'#80a56c'],[-563,-463,137,86,1.2,'#8b9f73'],
    [-556,45,105,74,2.6,'#85a17b']
  ];
  for(const site of sites)coastline(...site,root,resources);
  const seaMat=new T.MeshStandardMaterial({color:'#378d9a',roughness:.48,metalness:.10});
  const time={value:0};
  seaMat.onBeforeCompile=shader=>{
    shader.uniforms.seaTime=time;
    shader.vertexShader='varying vec3 seaPoint;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nseaPoint=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 seaPoint; uniform float seaTime;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=seaPoint.xz;
      float swell=sin(p.y*.18+p.x*.032+1.2*sin(p.x*.085)+seaTime*.76);
      float chop=sin(p.y*.72+p.x*.11+.8*sin(p.x*.23)-seaTime*1.25);
      float detail=1.-smoothstep(60.,650.,distance(cameraPosition,seaPoint));
      float glint=smoothstep(.64,.97,swell*.65+chop*.35);
      diffuseColor.rgb*=.93+.08*sin(p.x*.013+p.y*.022)+detail*.065*swell;
      diffuseColor.rgb+=vec3(.047,.082,.077)*glint*detail;`);
  };
  const plane=new T.PlaneGeometry(7500,7500);plane.rotateX(-Math.PI/2);const water=new T.Mesh(plane,seaMat);water.position.y=-1.38;root.add(water);resources.push(plane,seaMat);
  // A section member between two world points, used for pylons, trusses and masts.
  function member(x1,h1,z1,x2,h2,z2,w,d,color){
    const dx=x2-x1,dy=h2-h1,dz=z2-z1;
    box((x1+x2)/2,(h1+h2)/2,(z1+z2)/2,Math.hypot(dx,dy,dz),w,d,color,Math.atan2(-dz,dx),Math.atan2(dy,Math.hypot(dx,dz)));
  }
  // Cable stays land beside the vehicle clearance envelope on both sides.
  const bridgeZ=60+islandTrackSpacing/2;
  for(const x of [267,364]){
    for(const edge of [-1,1]){
      const z=bridgeZ+edge*(4.4+islandTrackSpacing/2);
      member(x,-1.4,z+edge*1.4,x,38,z,1.65,1.65,'#dedfd0');
      for(const dx of [-41,-30,-19,19,30,41])member(x,29+Math.abs(dx)*.19,z,x+dx,10,z,.17,.17,'#99b3b5');
    }
    box(x,36,bridgeZ,2.4,1.35,9.8+islandTrackSpacing,'#d6e1d8');
  }
  for(const edge of [-1,1]){
    box(316,9.9,bridgeZ+edge*(4.4+islandTrackSpacing/2),190,.8,.8,'#919b9b');
    if(edge===1)for(let x=224;x<411;x+=8)box(x,10.1,bridgeZ,1,.65,9.2+islandTrackSpacing,'#afbcb9');
    const z=bridgeZ+edge*(3.2+islandTrackSpacing/2),start=-426;
    box(start+64,16.5,z,128,.35,.38,'#aa5b4d');box(start+64,10.36,z,128,.45,.4,'#974e45');
    for(let j=0;j<8;j++){
      const u=start+j*16;member(u,10.4,z,u+8,16.5,z,.32,.32,'#ae6352');member(u+8,16.5,z,u+16,10.4,z,.32,.32,'#ae6352');
      if(edge===1){
        box(u+8,17.1,bridgeZ,.32,.35,6.8+islandTrackSpacing,'#aa6256');
        box(u+8,10.40,bridgeZ,.72,.42,6.8+islandTrackSpacing,'#974e45');
      }
    }
  }
  for(const [cx,cz,rx,rz] of sites){
    for(let k=0;k<43;k++){
      const a=k*2.39996,x=cx+Math.cos(a)*rx*.81,z=cz+Math.sin(a)*rz*.80;
      if(Math.min(Math.abs(z-bridgeZ),Math.abs(z+430+islandTrackSpacing/2))<9+islandTrackSpacing/2)continue;
      tree(x,z,3.7+1.5*Math.sin(k*.81)**2);
    }
  }
  // Raised boardwalks lead from each stair landing into a distinct waterfront district.
  for(const [x,z,direction,landmarkZ] of [[540,60,1,20],[565,-430,-1,-484],[35,-430,-1,-461],[-560,-430,-1,-490],[-550,60,1,22]]){
    const stairX=x+direction*44,landingZ=z-direction*4.55;
    box(stairX,1.34,(landmarkZ+landingZ)/2,3.8,.15,Math.abs(landmarkZ-landingZ)+3.8,'#dbceb0');
    box((x+stairX)/2,1.34,landmarkZ,Math.abs(x-stairX),.15,3.8,'#dbceb0');
    for(let step=0;step<Math.abs(landmarkZ-landingZ);step+=10){
      const v=landingZ+Math.sign(landmarkZ-landingZ)*step;
      round(stairX+2.5,3.2,v,.20,3.8,.20,'#627775');
      round(stairX+2.5,5.17,v,.84,.21,.84,'#e6dab6');
    }
  }
  function pavilion(x,z,w,d,accent){
    box(x,1.55,z,w+2,.55,d+2,'#cdc3ae');
    box(x,4.0,z,w,4.4,d,'#527782');
    for(let dx=-w/2;dx<=w/2;dx+=3.5)box(x+dx,4.05,z,.23,4.6,d+.28,'#dcdac6');
    box(x,6.46,z,w+2.6,.65,d+2.8,accent);
    box(x,6.87,z,w*.72,.24,d*.68,'#617e81');
  }
  pavilion(583,15,23,10,'#b87652');pavilion(593,31,13,8,'#e1dac3');
  pavilion(530,-465,31,12,'#f4e9c9');pavilion(605,-475,19,9,'#65969c');
  for(let k=0;k<7;k++){
    const x=501+k*14;
    round(x,6,-498,.19,9,.19,'#d9ded2');
    box(x+1.15,9.2,-498,2.2,1.25,.08,k%2?'#c6734d':'#56a7a6');
  }
  pavilion(82,-470,18,11,'#a6bb8c');
  for(let k=0;k<4;k++){
    const x=-33+k*12;
    for(let j=0;j<4;j++){
      const z=-482-j*5;
      round(x,1.52,z,8,.46,3.2,'#9eae76');
      for(let l=0;l<5;l++)put('ball',x-2.8+l*1.35,1.83,z,1.4,.50,1.2,j%2?'#bf835f':'#c5a65f');
    }
  }
  pavilion(-590,-475,18,10,'#9ca9b8');
  for(let k=0;k<3;k++)for(let j=0;j<4;j++){
    const x=-540+j*8,z=-479-k*6;box(x,2.01,z,.35,1.56,.35,'#767e7c');
    box(x,2.94,z,6.8,.24,4.4,'#365775',0,.10);
  }
  pavilion(-526,22,15,8,'#ad7064');
  // Ferry terminal on the small quay across from the gateway.
  pavilion(-190,234,30,12,'#578a91');
  for(let k=0;k<6;k++)tree(-225+k*13,251,4.8);
  // Red-and-ivory light overlooking the western approach, with keeper's house.
  const lx=-590,lz=12;
  for(let j=0;j<7;j++)round(lx,3.65+j*4.5,lz,9-j*.63,4.5,9-j*.63,j%2?'#af5548':'#ebe5d3');
  for(const [d,h,y,c] of [[8,.7,33.3,'#405964'],[4.8,3.7,35.4,'#e6c582'],[7,.8,37.5,'#384e59'],[3,1,38.3,'#994f43']])round(lx,y,lz,d,h,d,c);
  box(lx+14,4,lz,13,5.4,9,'#e7dec9');box(lx+14,6.9,lz,15,.75,11,'#a15b4a');
  for(let i=0;i<24;i++){const a=i*.73;put('leaf',-614+Math.sin(a)*36,-.15,57+Math.cos(a)*48,5+i%5,2.8+i%3,4+i%4,'#7b8883',a);}
  // Sports island floodlights.
  for(const x of [496,575])for(const z of [-21,36]){
    round(x,10,z,.52,18,.52,'#879491');box(x,19,z,4.5,1.4,.6,'#e9e4d0');
  }
  // Wind technology island. Blades share geometry and turn about the hub.
  const rotors=[];
  const blade=new T.Shape();blade.moveTo(-.46,0);blade.lineTo(-1.20,4);blade.quadraticCurveTo(-1.12,12,.20,19);blade.lineTo(.68,6);blade.closePath();
  const bladeGeometry=new T.ShapeGeometry(blade),bladeMat=new T.MeshStandardMaterial({color:'#f2eadb',side:T.DoubleSide});resources.push(bladeGeometry,bladeMat);
  for(const [x,z,h] of [[-625,-486,36],[-558,-517,43],[-491,-482,38]]){
    round(x,1.4+h/2,z,1.9,h,1.9,'#d8ddd6');box(x,h+1.4,z,2.9,2.7,4,'#d0d9d4');
    const rotor=new T.Group();rotor.position.set(x,h+1.4,z+2.1);root.add(rotor);
    for(let k=0;k<3;k++){const m=new T.Mesh(bladeGeometry,bladeMat);m.rotation.z=k*Math.PI*2/3;rotor.add(m);}rotors.push(rotor);
  }
  // Two offshore navigation channels, with anchored buoys and a moving catamaran.
  for(const [x,z] of [[240,-100],[370,-175],[450,-268],[-280,-210],[-710,-140],[820,-220]]){
    round(x,-.4,z,2.2,2,2.2,'#b44e43');round(x,1.25,z,.35,2.1,.35,'#efe5c8');round(x,2.4,z,.65,.4,.65,'#d05a4c');
  }
  const ferry=new T.Group();root.add(ferry);const hull=new T.SphereGeometry(1,18,10),deck=new T.BoxGeometry();resources.push(hull,deck);
  function vesselPart(g,x,y,z,w,h,d,color){
    const mat=new T.MeshStandardMaterial({color});resources.push(mat);
    const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.scale.set(w,h,d);ferry.add(m);
  }
  for(const z of [-2.8,2.8])vesselPart(hull,0,.05,z,15,1.45,1.25,'#e5e4d4');
  vesselPart(deck,-1,1.25,0,22,1.25,7.8,'#e6ece3');vesselPart(deck,-1,2.85,0,18,2.25,6.6,'#346373');vesselPart(deck,-1,4.13,0,19,.42,7.4,'#e6ebdc');
  return t=>{
    time.value=t;rotors.forEach((r,i)=>r.rotation.z=t*.32+i*1.6);
    const a=t*.012;ferry.position.set(295+190*Math.cos(a),-.35+.14*Math.sin(t),-200+85*Math.sin(a));ferry.rotation.y=Math.atan2(-85*Math.cos(a),-190*Math.sin(a));
  };
}
