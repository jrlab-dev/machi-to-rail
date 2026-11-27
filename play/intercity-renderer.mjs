import {createDepartureCity} from './departure-city-renderer.mjs?v=rail-93';
import {createFuji} from './fuji-renderer.mjs?v=rail-90';
import {createCoast} from './coast-renderer.mjs?v=rail-90';
import {coastalLand} from './coast-data.mjs?v=rail-90';
import * as T from 'three';
import {trackSamples,trackRibbon} from './intercity-track.mjs?v=rail-90';
import {INTERCITY_LANES} from './intercity-traffic.mjs?v=rail-92';
import {STATIONS,STATION_LANES} from './intercity-stations.mjs?v=rail-92';
import {createStations} from './intercity-station-renderer.mjs?v=rail-92';
import {createArrivalCity} from './arrival-city-renderer.mjs?v=rail-93';
import {sampleRoute} from './core.mjs?v=rail-90';
import {TURN_LENGTH,INTERCITY_LENGTH,intercityZone} from './intercity-data.mjs?v=rail-90';
export function distanceForBody(p){const [x,y]=p;if(x>=0&&x<=6000)return y<400?x:6000+TURN_LENGTH+6000-x;if(x>6000)return 6000+Math.atan2(x-6000,400-y)*400;return 12000+TURN_LENGTH+Math.atan2(-x,y-400)*400;}
export function createIntercityRenderer(route,stationsEnabled=false,customProps=[]){
 const root=new T.Group(),rails=new T.Group(),land=new T.Group(),tunnels=new T.Group();root.add(rails,land,tunnels);const obj=new T.Object3D(),materials=[],pools=[];let last=-Infinity,lastSpan=0;
 const mat=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.95,...extra});materials.push(m);return m;};
 function pool(parent,count,color,extra={}){const m=new T.InstancedMesh(new T.BoxGeometry(1,1,1),mat(color,extra),count);m.frustumCulled=false;parent.add(m);pools.push(m);return m;}
 function put(m,i,x,y,z,w,h,d,yaw=0){obj.position.set(x,y,z);obj.rotation.set(0,yaw,0);obj.scale.set(w,h,d);obj.updateMatrix();m.setMatrixAt(i,obj.matrix);}
 const lanes=stationsEnabled?STATION_LANES:INTERCITY_LANES,center=stationsEnabled?4.5:2.5,outer=stationsEnabled?[-12,21]:[-7,12],radius=stationsEnabled?23:15.5;
 const samples=trackSamples(route);
 if(stationsEnabled){for(const s of STATIONS)for(const dx of[-16,16])samples.push({d:s.x+dx,pose:sampleRoute(route,s.x+dx)});samples.sort((a,b)=>a.d-b.d);}
 const ribbon=(name,color,width,height,thickness,offset=0,extra={},skip)=>{
  const data=trackRibbon(samples,{width,height,thickness,offset,skip}),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(data.normals,3));geometry.setIndex(data.indices);geometry.computeBoundingSphere();const mesh=new T.Mesh(geometry,mat(color,extra));mesh.name=name;rails.add(mesh);
 };
 if(stationsEnabled){
  for(const [a,b]of[[-12.5,-5.8],[-3.2,12.2],[14.8,21.5]])ribbon('deck','#b5bbb6',b-a,7.05,1,(a+b)/2);
  for(const z of[-4.5,13.5])ribbon('deck-stair-opening','#b5bbb6',2.6,7.05,1,z,{},(a,b)=>Math.abs(a.pose[1])<.01&&STATIONS.some(s=>(a.d+b.d)/2>s.x-16&&(a.d+b.d)/2<s.x+16));
 }else ribbon('deck','#b5bbb6',22,7.05,1,2.5);
 for(const edge of stationsEnabled?[-12,21]:[-8,13])ribbon('wall','#d3d8ce',.2,8.1,1.1,edge);
 ribbon("median-base","#aab3ad",.6,7.68,.22,center);
 ribbon("median-divider","#c4cec5",.22,8.1,1.1,center);
 ribbon("median-cap","#788b85",.3,8.68,.08,center);
 for(const lane of lanes){ribbon('bed','#858d89',3.2,7.62,.28,lane);
  for(const side of [-1,1])ribbon('rail','#6d7c80',.065,7.93,.14,lane+side*.5685,{metalness:.5});
  ribbon('wire','#697579',.025,14.12,.025,lane);
 }
 const supportCount=Math.ceil(route.length/40),tieCount=Math.ceil(route.length/1.5);
 const ties=pool(rails,tieCount*4,'#b1b7aa'),piers=pool(rails,supportCount*2,'#a4aca7'),beams=pool(rails,supportCount,'#a4aca7'),poles=pool(rails,supportCount*2,'#56666a'),arms=pool(rails,supportCount,'#56666a');
 for(let i=0;i<supportCount;i++){const [x,y,yaw]=sampleRoute(route,i*route.length/supportCount),z=-y,off=s=>[x+Math.sin(yaw)*s,z+Math.cos(yaw)*s];
  for(const [j,s] of outer.entries()){const a=off(s);put(piers,2*i+j,a[0],3.1,a[1],1.4,7.1,1.8,yaw);put(poles,2*i+j,a[0],10.9,a[1],.18,6.45,.18,yaw);}
  const a=off(center);const stair=stationsEnabled&&Math.abs(y)<.01&&STATIONS.some(s=>Math.abs(x-s.x)<17);put(beams,i,a[0],6,a[1],stair?0:1.6,1,stationsEnabled?33:21,yaw);put(arms,i,a[0],14.12,a[1],.13,.13,stationsEnabled?33:19,yaw);
 }
 for(let i=0;i<tieCount;i++){const p=sampleRoute(route,i*route.length/tieCount);for(const [j,s] of lanes.entries())put(ties,4*i+j,p[0]+Math.sin(p[2])*s,7.78,-p[1]+Math.cos(p[2])*s,.22,.16,2.5,p[2]);}
 for(const m of [ties,piers,beams,poles,arms])m.instanceMatrix.needsUpdate=true;
 const fields=pool(land,4096,'#ffffff'),paths=pool(land,96,'#969d77'),water=pool(land,32,'#738e8e');fields.name='fields';paths.name='field-boundaries';water.name='irrigation';
 const crop=document.createElement('canvas');crop.width=crop.height=256;const cc=crop.getContext('2d');cc.fillStyle='#d7ddbd';cc.fillRect(0,0,256,256);for(let i=0;i<256;i+=8){cc.fillStyle=i%16?'#b5c39a':'#c5d0ae';cc.fillRect(i,0,2,256);}const cropTex=new T.CanvasTexture(crop);cropTex.colorSpace=T.SRGBColorSpace;cropTex.anisotropy=4;fields.material.map=cropTex;
 // World-fixed roadside details provide nearby scale without changing train speed.
 const verges=pool(land,8,'#b2b09b'),shrubs=pool(land,600,'#647f51'),ruralPoles=pool(land,240,'#8a9289'),ruralArms=pool(land,240,'#8a9289');shrubs.geometry.dispose();shrubs.geometry=new T.IcosahedronGeometry(1,0);shrubs.name='near-shrubs';ruralPoles.name='rural-poles';let si=0,pi=0,vi=0;
 for(const center of[0,-800])for(const side of[-1,1]){put(verges,vi++,3000,-.17,center+side*18,3600,.12,3);put(verges,vi++,3000,-.18,center+side*21,3600,.1,.8);for(let x=1212;x<4800;x+=24){const h=1.2+(Math.sin(x)*.5+.5)*.9;put(shrubs,si++,x,h/2-.3,center+side*(38+Math.sin(x*.13)*4),2,h,1.8);}for(let x=1230;x<4800;x+=60){put(ruralPoles,pi,x,2.7,center+side*28,.16,6,.16);put(ruralArms,pi++,x,5.5,center+side*28,.12,.12,1.8);}}
 shrubs.count=si;ruralPoles.count=ruralArms.count=pi;for(const m of[verges,shrubs,ruralPoles,ruralArms])m.instanceMatrix.needsUpdate=true;
 const plazas=pool(land,stationsEnabled?0:2,'#afb8ac');for(let i=0;i<plazas.count;i++)put(plazas,i,i?5800:200,-.12,-400,800,.1,680);plazas.instanceMatrix.needsUpdate=true;
 const coast=createCoast();root.add(coast.root);
 const fuji=createFuji();root.add(fuji.root);
 const cards=[];
 const village=document.createElement('canvas');village.width=2048;village.height=256;const vc=village.getContext('2d');
 for(let i=0;i<90;i++){const x=i*23+Math.sin(i*3)*8,y=230,h=25+(i*19%34);vc.fillStyle=['#547451','#668358','#779367'][i%3];vc.beginPath();vc.moveTo(x-14,y);vc.lineTo(x-10,y-h*.7);vc.lineTo(x,y-h);vc.lineTo(x+14,y-h*.5);vc.lineTo(x+17,y);vc.fill();if(i%11===4){vc.fillStyle='#d4d2bb';vc.fillRect(x-27,y-33,45,32);vc.fillStyle='#65716f';vc.beginPath();vc.moveTo(x-34,y-33);vc.lineTo(x-7,y-48);vc.lineTo(x+24,y-33);vc.fill();vc.fillStyle='#5d777b';for(let w=0;w<3;w++)vc.fillRect(x-21+w*13,y-24,8,12);}}
 const vt=new T.CanvasTexture(village);vt.colorSpace=T.SRGBColorSpace;const vm=mat('#ffffff',{map:vt,transparent:true,alphaTest:.1,side:T.DoubleSide});
 for(let i=0;i<6;i++){const mesh=new T.Mesh(new T.PlaneGeometry(600,20),vm);mesh.name="distant-village";mesh.position.set(1500+i*600,8,-398);land.add(mesh);}

 for(let layer=0;layer<3;layer++){
  const c=document.createElement('canvas');c.width=2048;c.height=384;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,0,384);grad.addColorStop(0,['#a4b7bd','#708f91','#4f7667'][layer]);grad.addColorStop(1,['#becac1','#9bad95','#7b966b'][layer]);ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,384);for(let x=0;x<=2048;x+=4){const a=x/2048*Math.PI*2;const y=175+48*Math.sin(a*3+.7*layer)+29*Math.sin(a*7+layer)+14*Math.cos(a*13);ctx.lineTo(x,y);}ctx.lineTo(2048,384);ctx.closePath();ctx.fill();
  ctx.globalCompositeOperation="destination-in";const fade=ctx.createLinearGradient(0,0,2048,0);fade.addColorStop(0,"transparent");fade.addColorStop(.08,"white");fade.addColorStop(.92,"white");fade.addColorStop(1,"transparent");ctx.fillStyle=fade;ctx.fillRect(0,0,2048,384);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const material=mat('#ffffff',{map:texture,transparent:true,alphaTest:.05,side:T.DoubleSide});
  for(const side of[1])for(let tile=0;tile<1;tile++){const mesh=new T.Mesh(new T.PlaneGeometry(3600,400-layer*65),material);mesh.position.set(tile*1600,120-layer*28,side*(850-layer*210));land.add(mesh);mesh.scale.y=.20;cards.push({mesh,side,tile,layer});}
 }
 function tunnel(start,z){const vertices=[],indices=[];for(let end=0;end<2;end++){vertices.push(start+end*400,7.1,z+radius);for(let i=0;i<=24;i++){const a=i*Math.PI/24;vertices.push(start+end*400,8+Math.sin(a)*radius,z+Math.cos(a)*radius);}vertices.push(start+end*400,7.1,z-radius);}for(let i=0;i<26;i++){const a=i,b=i+27;indices.push(a,b,a+1,b,b+1,a+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const shell=new T.Mesh(geo,mat('#394849',{side:T.DoubleSide}));tunnels.add(shell);
  for(const x of[start,start+400]){const ring=new T.Mesh(new T.RingGeometry(radius,radius+2.5,48,1,0,Math.PI),mat('#b1b6ad',{side:T.DoubleSide}));ring.rotation.y=Math.PI/2;ring.position.set(x,8,z);tunnels.add(ring);const verts=[],idx=[];for(let row=0;row<9;row++)for(let col=0;col<43;col++){const dx=(row-4)*42,dz=(col-21)*12;const edge=Math.sin(row/8*Math.PI)*Math.sin(col/42*Math.PI),h=Math.max(Math.abs(dz)<=radius+14?radius+12:0,edge*(92+Math.sin(row*2.1+col*.9)*14));verts.push(x+dx,h,z+dz);}for(let r=0;r<8;r++)for(let c=0;c<42;c++){const a=r*43+c;for(const tri of [[a,a+43,a+1],[a+1,a+43,a+44]]){idx.push(...tri);}} const mg=new T.BufferGeometry();mg.setAttribute('position',new T.Float32BufferAttribute(verts,3));mg.setIndex(idx);mg.computeVertexNormals();const mountain=new T.Mesh(mg,mat('#789078',{side:T.DoubleSide})); // Keep the portal corridor open below the roof.
   mountain.position.x=x===start?190:-190;tunnels.add(mountain);
   for(const edgeX of [-168,168]){const cap=[],ci=[];for(let dz=-252;dz<=252;dz+=.5){const top=Math.abs(dz)<=radius+14?radius+12:Math.max(0,(radius+12)*(radius+26-Math.abs(dz))/12),bottom=Math.abs(dz)<=radius?8+Math.sqrt(Math.max(0,(radius+.5)**2-dz*dz)):0;cap.push(x+edgeX+mountain.position.x,Math.max(top,bottom),z+dz,x+edgeX+mountain.position.x,bottom,z+dz);}for(let i=0;i<cap.length/6-1;i++){const a=i*2;ci.push(a,a+1,a+2,a+1,a+3,a+2);}const cg=new T.BufferGeometry();cg.setAttribute("position",new T.Float32BufferAttribute(cap,3));cg.setIndex(ci);cg.computeVertexNormals();tunnels.add(new T.Mesh(cg,mat("#789078",{side:T.DoubleSide})));}

  }
  const floor=pool(tunnels,1,'#8b9391');put(floor,0,start+200,7.25,z,400,.3,radius*2);floor.instanceMatrix.needsUpdate=true;
  const lights=pool(tunnels,24,'#fff2c8',{emissive:'#ffebbd',emissiveIntensity:1.2});for(let i=0;i<24;i++)put(lights,i,start+16+(i>>1)*32,16,z+(i%2?1:-1)*(radius-3.5),2.2,.18,.25);lights.instanceMatrix.needsUpdate=true;
 }
 for(const z of[center,-800-center])for(const x of[800,4800])tunnel(x,z);
 const stationModel=stationsEnabled?createStations():null;if(stationModel)root.add(stationModel.root);
 const departure=stationsEnabled?createDepartureCity(customProps):null;if(departure)root.add(departure.root);
 const city=stationsEnabled?createArrivalCity(customProps):null;if(city)root.add(city.root);
 function update(body,phase='day',camera,light=false){
  coast.update(phase);departure?.update(body,phase,camera,light);
  city?.update(body,phase,camera,light);
  stationModel?.update(phase);
  const d=distanceForBody(body);root.visible=true;const zone=intercityZone(body);const night=phase==='night';for(const m of materials)if(m.map)m.color.set(night?'#47556b':phase==='sunset'?'#e8b994':'#ffffff');
  const span=zone.locked?2000:4000;if(Math.abs(d-last)<20&&span===lastSpan)return zone;last=d;lastSpan=span;
  const bx=Math.floor(body[0]/30)*30,bz=Math.floor(-body[1]/60)*60;let count=0;
  for(let row=0;row<32;row++)for(let col=0;col<64;col++){const x=bx+(col-32)*30,z=bz+(row-16)*60,seed=Math.abs(Math.sin(x*.017+z*.021)),split=seed<.25?2:1;for(let n=0;n<split;n++){if(!coastalLand(x+15,z+(n+.5)*60/split))continue;put(fields,count,x+15,-.35,z+(n+.5)*60/split,29.2,.12,60/split-.8);fields.setColorAt(count++,new T.Color(seed<.2?'#b5a476':seed<.4?'#9ca976':seed<.7?'#879b68':'#758f75'));}}
  fields.count=count;
  for(let i=0;i<64;i++){const x=bx+(i-32)*30;put(paths,i,x,-.23,bz,Math.round(x/30)%4===0?3:.8,.08,1920);}
  for(let i=0;i<32;i++){const z=bz+(i-16)*60;put(paths,64+i,bx,-.23,z,1920,.08,.8);put(water,i,bx,-.24,z+1,1920,.06,.7);}
  fields.instanceColor.needsUpdate=true;for(const c of cards)c.mesh.position.set(3000,(120-c.layer*28)*.20,-400+c.layer*55);
  for(const m of [fields,paths,water])m.instanceMatrix.needsUpdate=true;return zone;
 }
 return {root,update,cityStats:()=>city?.stats(),dispose(){root.remove(fuji.root);fuji.dispose();if(departure){root.remove(departure.root);departure.dispose();}root.remove(coast.root);coast.dispose();if(city){root.remove(city.root);city.dispose();}if(stationModel){root.remove(stationModel.root);stationModel.dispose();}root.traverse(o=>{o.geometry?.dispose();if(o.isInstancedMesh)o.dispose();});for(const m of materials){m.map?.dispose();m.dispose();}},reset(){last=-Infinity;}};
}
