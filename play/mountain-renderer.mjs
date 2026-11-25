import {MOUNTAIN_HOTELS} from './mountain-data.mjs?v=retro-87';
import {mountainBedSection,mountainRiverSpans} from './mountain-rail-bed.mjs?v=retro-87';
import {batchMountainBoxes} from './mountain-batching.mjs?v=rail-connector-52';
import {MOUNTAIN_ROAD,MOUNTAIN_MUSEUM_ROAD,MOUNTAIN_BUS_SPUR,MOUNTAIN_BUS_MERGE,MOUNTAIN_MUSEUM_TURN,museumRoadWidth,MOUNTAIN_ROAD_WIDTH,MOUNTAIN_LOWER_APRON,nearestMountainRoad,MOUNTAIN_TURNTABLE,mountainTurntableState} from './mountain-road.mjs?v=train-limit-65';
import * as T from 'three';
import {summitCrossingState,SUMMIT_CROSSING,inSummitCrossingSpace} from './mountain-crossing.mjs?v=mountain-gentle-55';
import {MOUNTAIN_LOWER_GATE,MOUNTAIN_UPPER_GATE} from './mountain-traffic.mjs?v=retro-87';
import {MOUNTAIN_ROUTES,MOUNTAIN_MIDDLE,MOUNTAIN_MUSEUM,museumPoint,inMuseumPlaza,MOUNTAIN_TRACKS,mountainHeight,naturalMountainHeight,MOUNTAIN_RIVER,riverFrame,riverNearest,riverWidth,RIVER_TOWN_START,terrainRandom,mountainTrackNearest,mountainSurfaceHeight} from './mountain-data.mjs?v=retro-87';
export function createMountainRenderer(){
 const root=new T.Group();root.name='mountain-course';const mats=[],geos=[],textures=[],labels=[],obj=new T.Object3D();
 const mat=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.9,...extra});mats.push(m);return m;};
 const geo=g=>(geos.push(g),g),cube=geo(new T.BoxGeometry(1,1,1));
 const textureLoads=[],loader=new T.TextureLoader(),loadTexture=url=>{let resolve,reject;textureLoads.push(new Promise((ok,bad)=>{resolve=ok;reject=bad;}));return loader.load(url,resolve,undefined,reject);},forestTexture=loadTexture(new URL('./assets/landscape/forest-canopy-43.webp',import.meta.url).href),leafTexture=loadTexture(new URL('./assets/landscape/leaf-branch-43.webp',import.meta.url).href);textures.push(forestTexture,leafTexture);for(const tex of [forestTexture,leafTexture]){tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;}forestTexture.wrapS=forestTexture.wrapT=T.RepeatWrapping;
 function groundMaterial(){const m=mat('#ffffff',{vertexColors:true});m.onBeforeCompile=shader=>{shader.uniforms.forestMap={value:forestTexture};shader.vertexShader='attribute float forestWeight; varying float vForestWeight; varying vec3 vForestPos; varying vec3 vForestNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvForestPos=position;vForestNormal=normal;vForestWeight=forestWeight;');shader.fragmentShader='uniform sampler2D forestMap; varying float vForestWeight; varying vec3 vForestPos; varying vec3 vForestNormal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec3 blend=pow(abs(normalize(vForestNormal)),vec3(4.0));blend/=max(dot(blend,vec3(1.0)),0.001);vec3 forestColor=texture2D(forestMap,vForestPos.yz/95.0).rgb*blend.x+texture2D(forestMap,vForestPos.xz/95.0).rgb*blend.y+texture2D(forestMap,vForestPos.xy/95.0).rgb*blend.z;float groundGrain=0.5+0.25*sin(vForestPos.x*11.0+sin(vForestPos.z*4.0))+0.25*sin(vForestPos.z*17.0+sin(vForestPos.x*3.0));diffuseColor.rgb*=0.96+groundGrain*0.08;diffuseColor.rgb=mix(diffuseColor.rgb,forestColor*1.18,clamp(vForestWeight,0.0,1.0));');};m.customProgramCacheKey=()=> 'mountain-forest-43';return m;}
 const stone=mat('#9b9d8b'),wood=mat('#664f3d'),roof=mat('#394e50'),cream=mat('#e4d4b6'),rail=mat('#758689',{metalness:.65,roughness:.3}),red=mat('#a84f36'),glass=mat('#42616b',{roughness:.75,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),green=mat('#487449');
 function box(x,y,z,w,h,d,m,yaw=0){const o=new T.Mesh(cube,m);o.position.set(x,y,-z);o.scale.set(w,h,d);o.rotation.y=yaw;o.receiveShadow=true;root.add(o);return o;}
 function beam(a,b,width,m){const p=new T.Vector3(a[0],a[2],-a[1]),q=new T.Vector3(b[0],b[2],-b[1]),o=new T.Mesh(cube,m);o.position.copy(p).add(q).multiplyScalar(.5);o.scale.set(width,p.distanceTo(q),width);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());root.add(o);return o;}
 function label(text,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f2eee0';ctx.fillRect(0,0,512,128);ctx.fillStyle='#294b3e';ctx.font='bold 58px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,84);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=new T.SpriteMaterial({map:tex});mats.push(m);const s=new T.Sprite(m);s.position.set(x,y,-z);s.scale.set(43,10.75,1);root.add(s);labels.push(s);}
 const terrain=geo(new T.PlaneGeometry(2200,2150,366,358));terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position,colors=[],forestWeights=[];
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=-pos.getZ(i)+420,nr=riverNearest(x,y),near=mountainTrackNearest(x,y),roadNear=nearestMountainRoad(x,y),h=mountainHeight(x,y,nr,near,roadNear);pos.setXYZ(i,x,h,-y);const color=new T.Color(nr.distance<riverWidth(nr.y)/2+8?'#a29e89':h>180?'#4c6851':h>20?'#5b7850':'#7c8962');color.multiplyScalar(.88+.15*terrainRandom(Math.floor(x/9)+Math.floor(y/9)*719));colors.push(color.r,color.g,color.b);const opposite=nr.side<0&&x>nr.x+25,forest=opposite?1:Math.max(.13,Math.min(1,(near.distance-70)/110));const summit=x>445&&x<665&&y>660&&y<820;forestWeights.push(!summit&&roadNear.distance>12&&h>42&&nr.distance>riverWidth(nr.y)/2+30?forest:0);}
 terrain.setAttribute('forestWeight',new T.Float32BufferAttribute(forestWeights,1));terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const terrainMesh=new T.Mesh(terrain,groundMaterial());terrainMesh.receiveShadow=true;root.add(terrainMesh);
 // Coarse outer slopes continue beyond the detailed valley so no cut mesh edge faces the train.
 const outer=geo(new T.PlaneGeometry(9000,9000,160,160));outer.rotateX(-Math.PI/2);const op=outer.attributes.position,oi=[];
 for(let i=0;i<op.count;i++){const x=op.getX(i),y=-op.getZ(i)+420;op.setXYZ(i,x,naturalMountainHeight(x,y)-.5,-y);}
 const idx=outer.index.array;for(let i=0;i<idx.length;i+=3){const ids=[idx[i],idx[i+1],idx[i+2]],inside=ids.every(k=>Math.abs(op.getX(k))<1060&&-op.getZ(k)>-615&&-op.getZ(k)<1455);if(!inside)oi.push(...ids);}
 outer.setIndex(oi);outer.setAttribute('color',new T.Float32BufferAttribute(Array(op.count*3).fill(1),3));outer.setAttribute('forestWeight',new T.Float32BufferAttribute(Array(op.count).fill(1),1));outer.computeVertexNormals();root.add(new T.Mesh(outer,groundMaterial()));
 function ribbon(points,width,height,m){const vertices=[],indices=[];for(let i=0;i<points.length;i++){const p=points[i],q=points[Math.min(i+1,points.length-1)],a=points[Math.max(0,i-1)],yaw=Math.atan2(q[1]-a[1],q[0]-a[0]);for(const side of[-1,1])vertices.push(p[0]-Math.sin(yaw)*side*(typeof width==='function'?width(p):width)/2,p[2]+height,-p[1]-Math.cos(yaw)*side*(typeof width==='function'?width(p):width)/2);if(i){const k=2*i;indices.push(k-2,k,k-1,k-1,k,k+1);}}const g=geo(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const o=new T.Mesh(g,m);o.receiveShadow=true;root.add(o);}
 const riverMat=mat('#3c858b',{roughness:.38,metalness:.12}),shore=mat('#aaa28d'),road=mat('#747a72'),path=mat('#b3ac99');
 ribbon(MOUNTAIN_RIVER,p=>riverWidth(p[1])+9,-.45,shore);
 ribbon(MOUNTAIN_RIVER,p=>riverWidth(p[1]),0,riverMat);
 const bankPoint=(p,offset)=>{const x=p.x-Math.sin(p.yaw)*offset,y=p.y+Math.cos(p.yaw)*offset;return [x,y,mountainHeight(x,y)+.4];};
 const street=[],lane=[];for(let d=RIVER_TOWN_START-50;d<RIVER_TOWN_START+1030;d+=5){const p=riverFrame(d);street.push(bankPoint(p,riverWidth(p.y)/2+17));}
 ribbon(street,6.4,0,road);for(let i=0;i<street.length;i+=4)ribbon(street.slice(i,i+2),.18,.02,cream);
 for(let d=RIVER_TOWN_START-30;d<RIVER_TOWN_START+520;d+=5){const p=riverFrame(d);lane.push(bankPoint(p,-riverWidth(p.y)/2-13));}ribbon(lane,3.2,0,path);
 for(const d of[RIVER_TOWN_START+100,RIVER_TOWN_START+430]){const p=riverFrame(d),span=riverWidth(p.y)+38,a=bankPoint(p,-span/2),b=bankPoint(p,span/2),height=Math.max(a[2],b[2])+1;beam([a[0],a[1],height],[b[0],b[1],height],3.8,stone);for(const side of[-1,1])beam([a[0]+Math.cos(p.yaw)*side*2,a[1]+Math.sin(p.yaw)*side*2,height+2],[b[0]+Math.cos(p.yaw)*side*2,b[1]+Math.sin(p.yaw)*side*2,height+2],.17,red);}
 // Irregular boulders belong to the riverbed and banks, not a repeated border.
 const rockGeo=geo(new T.IcosahedronGeometry(1,0)),rocks=new T.InstancedMesh(rockGeo,shore,180);root.add(rocks);
 for(let i=0;i<180;i++){const p=riverFrame(RIVER_TOWN_START-100+terrainRandom(i+91)*1550),offset=(terrainRandom(i+42)-.5)*riverWidth(p.y)*1.25;obj.position.set(p.x-Math.sin(p.yaw)*offset,p.height-.2,-p.y-Math.cos(p.yaw)*offset);obj.rotation.set(i*.7,i,0);const size=.5+terrainRandom(i+610)*1.7;obj.scale.set(size*1.5,size*.6,size);obj.updateMatrix();rocks.setMatrixAt(i,obj.matrix);}rocks.instanceMatrix.needsUpdate=true;
 const ballastCanvas=document.createElement('canvas');ballastCanvas.width=ballastCanvas.height=128;const bc=ballastCanvas.getContext('2d');bc.fillStyle='#6d6b5e';bc.fillRect(0,0,128,128);for(let i=0;i<3200;i++){const c=Math.floor(70+terrainRandom(i)*95);bc.fillStyle=`rgb(${c},${c-3},${c-12})`;bc.fillRect(terrainRandom(i+1)*128,terrainRandom(i+2)*128,1+terrainRandom(i+3)*3,1+terrainRandom(i+4)*2);}const ballastTexture=new T.CanvasTexture(ballastCanvas);ballastTexture.colorSpace=T.SRGBColorSpace;ballastTexture.wrapS=ballastTexture.wrapT=T.RepeatWrapping;textures.push(ballastTexture);const ballastMat=mat('#c0bba7',{map:ballastTexture});
 function trackBed(points){const vs=[],ix=[];for(let i=0;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],yaw=Math.atan2(b[1]-a[1],b[0]-a[0]);for(const vertex of mountainBedSection(p,yaw))vs.push(...vertex);if(i)for(let j=0;j<3;j++){const k=i*4+j;ix.push(k-4,k,k-3,k-3,k,k+1);}}const g=geo(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(vs,3));const uv=[];for(let i=0;i<vs.length;i+=3)uv.push(vs[i]/5,vs[i+2]/5);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();root.add(new T.Mesh(g,ballastMat));}
 const trackPoints=[];
 for(const row of MOUNTAIN_TRACKS){
  const points=row.points;for(let i=0;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];trackPoints.push([p[0],p[1],Math.atan2(b[1]-a[1],b[0]-a[0]),p[2],Math.atan2(b[2]-a[2],Math.hypot(b[0]-a[0],b[1]-a[1]))]);}
  // River crossings get shallow girders; never stretch the ballast down to water.
  for(const span of mountainRiverSpans(points)){
   ribbon(span,7,-1.25,stone);
   for(let i=1;i<span.length;i++){const a=span[i-1],b=span[i],yaw=Math.atan2(b[1]-a[1],b[0]-a[0]);for(const side of [-1,1])beam([a[0]-Math.sin(yaw)*side*2.7,a[1]+Math.cos(yaw)*side*2.7,a[2]-1.8],[b[0]-Math.sin(yaw)*side*2.7,b[1]+Math.cos(yaw)*side*2.7,b[2]-1.8],.7,rail);}
   for(const p of [span[0],span.at(-1)]){const base=mountainSurfaceHeight(p[0],p[1]),h=p[2]-1.3-base;if(h>0)box(p[0],base+h/2,p[1],3,h,6,stone);}
  }
  trackBed(points);ribbon(points,.035,5.7,rail);for(const side of[-1,1])ribbon(points.map((p,i)=>{const next=points[Math.min(i+1,points.length-1)],prev=points[Math.max(0,i-1)],a=Math.atan2(next[1]-prev[1],next[0]-prev[0]);return[p[0]-Math.sin(a)*side*.57,p[1]+Math.cos(a)*side*.57,p[2]];}),.075,.015,rail);
 }
 const ties=new T.InstancedMesh(cube,wood,trackPoints.length);root.add(ties);trackPoints.forEach((p,i)=>{obj.position.set(p[0],p[3]-.1,-p[1]);obj.rotation.set(0,p[2],p[4]);obj.scale.set(.22,.13,2.3);obj.updateMatrix();ties.setMatrixAt(i,obj.matrix);});ties.instanceMatrix.needsUpdate=true;
 for(let i=0;i<trackPoints.length;i+=18){const p=trackPoints[i],x=p[0]-Math.sin(p[2])*3,y=p[1]+Math.cos(p[2])*3;if(inSummitCrossingSpace(x,y,1))continue;beam([x,y,p[3]],[x,y,p[3]+6.2],.16,rail);beam([x,y,p[3]+5.9],[p[0],p[1],p[3]+5.9],.12,rail);}
 for(const [j,r] of MOUNTAIN_ROUTES.entries()){if(j===3)continue;const p=r.sample(r.length);box(p[0],p[3]+.5,p[1],.3,1,2.3,red);label('折返し '+(j+1),p[0],p[3]+10,p[1]-8);}
 const bridgeHeight=MOUNTAIN_ROUTES[3].sample(MOUNTAIN_ROUTES[3].length)[3];
 // Open truss bridge connects the two mountain slopes.
 box(270,bridgeHeight-1.8,723,240,1.5,12.2,stone);
 for(const side of[-1,1]){const y=723+side*6;beam([150,y,bridgeHeight],[390,y,bridgeHeight],.45,red);beam([150,y,bridgeHeight+11],[390,y,bridgeHeight+11],.45,red);for(let x=150;x<390;x+=24){beam([x,y,bridgeHeight],[x,y,bridgeHeight+11],.35,red);beam([x,y,bridgeHeight],[x+24,y,bridgeHeight+11],.3,red);beam([x,y,bridgeHeight+11],[x+24,y,bridgeHeight],.3,red);}}
 for(const x of[150,390]){const base=mountainHeight(x,720);box(x,(bridgeHeight-2+base)/2,723,6,bridgeHeight-2-base,13,stone);}label('山あいの大橋',270,bridgeHeight+20,720);
 function station(name,r,d,side=1){const p=r.sample(d);const g=new T.Group();g.position.set(p[0],p[3],-p[1]);g.rotation.y=p[2];root.add(g);const local=(x,y,z,w,h,depth,m)=>{const o=new T.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,depth);g.add(o);};const z=side===1?4.3:-10.3;local(0,.25,z,62,.8,5,stone);local(0,4.4,z,38,.35,5.8,roof);for(const x of[-16,0,16])local(x,2.5,z+side*1.7,.18,3.5,.18,wood);local(0,1.2,z+side*1.7,6,.2,.6,wood);if(name)label(name,p[0],p[3]+10,p[1]-10);}
 station('温泉街',MOUNTAIN_ROUTES[0],38);station('山腹',MOUNTAIN_ROUTES[3],MOUNTAIN_MIDDLE);station('',MOUNTAIN_ROUTES[3],MOUNTAIN_MIDDLE,-1);station('見晴らし',MOUNTAIN_ROUTES[3],MOUNTAIN_ROUTES[3].length-36);
 // Exchange station and sculpture garden between the first two reversals.
 const museumYaw=MOUNTAIN_MUSEUM.pose[2],museumLevel=MOUNTAIN_MUSEUM.pose[3];
 const museumBox=(a,b,h,w,d,height,m)=>{const p=museumPoint(a,b);return box(p[0],museumLevel+h,p[1],w,height,d,m,museumYaw);};
 for(const side of[-4.6,12.6]){museumBox(0,side,.15,76,3.2,.7,stone);museumBox(0,side,4.3,36,4,.25,roof);for(const a of[-15,0,15])museumBox(a,side+(side<0?-1:1),2.2,.16,.16,4,wood);museumBox(-19,side,1,5,.55,.22,wood);}
 const museumSign=museumPoint(0,-6.8);label('森の美術館前',museumSign[0],museumLevel+9,museumSign[1]);
 const pavingMuseum=mat('#d5d1bd'),museumWhite=mat('#ebe6d7'),bronze=mat('#987d54',{metalness:.55,roughness:.4});
 museumBox(0,-48,-1.3,100,66,1.8,stone);museumBox(0,-48,-.35,100,66,.14,pavingMuseum);museumBox(0,-10.5,-.1,8,13,.25,pavingMuseum);
 // Low gallery on the far edge, with a recessed glazed frontage.
 museumBox(0,-70,2.8,44,17,6.2,museumWhite);museumBox(0,-60.9,2.8,38,.18,4.6,glass);museumBox(0,-68,6.1,48,22,.35,roof);
 for(const a of[-19,-9,1,11,19])museumBox(a,-59,2.7,.3,.3,5.6,wood);
 museumBox(0,-58,.15,12,5,.9,stone);museumBox(0,-55,-.08,14,3,.4,stone);
 const plazaSign=museumPoint(0,-57);label('森の美術館・彫刻の庭',plazaSign[0],museumLevel+11,plazaSign[1]);
 for(const [a,b,kind]of[[-28,-36,0],[0,-42,1],[28,-36,2]]){museumBox(a,b,.15,5,5,1,stone);const p=museumPoint(a,b),g=geo(kind===0?new T.TorusGeometry(2.5,.35,8,24):kind===1?new T.IcosahedronGeometry(2.4,0):new T.ConeGeometry(2.1,5,5)),o=new T.Mesh(g,kind===1?red:bronze);o.position.set(p[0],museumLevel+(kind===1?3.2:3.3),-p[1]);o.rotation.y=museumYaw;o.castShadow=true;root.add(o);}
 for(const a of[-40,40])for(const b of[-25,-48,-72]){if(a===40&&b===-48)continue;museumBox(a,b,.7,5,.8,.25,wood);for(const da of[-1.8,1.8])museumBox(a+da,b,.2,.2,.6,.8,stone);}
 const gardenCrown=geo(new T.IcosahedronGeometry(1,1));for(const a of[-46,46])for(const b of[-20,-37,-55,-76]){const entrance=museumPoint(a,b);if(nearestMountainRoad(entrance[0],entrance[1]).distance<12)continue;museumBox(a,b,-.05,3.5,3.5,.5,stone);museumBox(a,b,2,.35,.35,4,wood);const p=museumPoint(a,b),o=new T.Mesh(gardenCrown,green);o.position.set(p[0],museumLevel+4,-p[1]);o.scale.set(2.2,2.8,2.2);root.add(o);}
 const gardenGrass=mat('#71885a'),cedarCrown=geo(new T.ConeGeometry(1,1,7));
 for(const a of[-17,17]){museumBox(a,-35,-.25,9,18,.13,gardenGrass);museumBox(a,-48,.25,8,2.2,1,stone);for(const da of[-2,0,2]){const p=museumPoint(a+da,-48),o=new T.Mesh(gardenCrown,green);o.position.set(p[0],museumLevel+.9,-p[1]);o.scale.set(1.1,.8,1.1);root.add(o);}}
 // A woodland edge around the sculpture garden, kept away from all tracks.
 for(let i=0;i<36;i++){const a=i<18?-58:58,b=-18-(i%18)*4,p=museumPoint(a,b);if(mountainTrackNearest(p[0],p[1]).distance<13||nearestMountainRoad(p[0],p[1]).distance<8)continue;const base=mountainSurfaceHeight(p[0],p[1]),height=5+terrainRandom(i+808)*4;box(p[0],base+height*.35,p[1],.3,height*.7,.3,wood);for(let j=0;j<2;j++){const crown=new T.Mesh(cedarCrown,green);crown.position.set(p[0],base+height*(.55+j*.2),-p[1]);crown.scale.set(2.4-j*.7,height*.65,2.4-j*.7);root.add(crown);}}
 const signals=[];for(const [leg,d,offset]of[[0,MOUNTAIN_LOWER_GATE,-5],[3,MOUNTAIN_UPPER_GATE,11],[MOUNTAIN_MUSEUM.leg,MOUNTAIN_MUSEUM.s+30,-4],[MOUNTAIN_MUSEUM.leg,MOUNTAIN_MUSEUM.s-30,12]]){const p=MOUNTAIN_ROUTES[leg].sample(d),x=p[0]-Math.sin(p[2])*offset,y=p[1]+Math.cos(p[2])*offset;box(x,p[3]+2,y,.15,4,.15,rail);box(x,p[3]+4.2,y,.7,1.1,.4,roof);const sm=mat('#bb3028',{emissive:'#bb3028',emissiveIntensity:.8});const lamp=new T.Mesh(geo(new T.SphereGeometry(.22,8,6)),sm);lamp.position.set(x,p[3]+4.2,-y);root.add(lamp);signals.push(sm);}label('すれ違い待ち',MOUNTAIN_ROUTES[0].sample(MOUNTAIN_LOWER_GATE)[0],MOUNTAIN_ROUTES[0].sample(MOUNTAIN_LOWER_GATE)[3]+13,MOUNTAIN_ROUTES[0].sample(MOUNTAIN_LOWER_GATE)[1]-15);
 // Small plots follow the bend of the river, with foundations anchored to each plot.
 const hotelMats=[cream,mat('#c3b299'),mat('#d3c3a5'),mat('#b7b7a4')],steamMat=mat('#eff4e8',{transparent:true,opacity:.26,depthWrite:false}),steamGeo=geo(new T.IcosahedronGeometry(1,1)),plots=[];
 for(let i=0,d=RIVER_TOWN_START;i<13;i++){
  const p=riverFrame(d),hotel=i===2||i===7||i===10,w=hotel?30+terrainRandom(i)*7:14+terrainRandom(i)*9,depth=hotel?22:15,floors=hotel?4+i%2:2,h=floors*3.1,offset=-riverWidth(p.y)/2-20-depth/2,x=p.x-Math.sin(p.yaw)*offset,y=p.y+Math.cos(p.yaw)*offset,base=mountainHeight(x,y);plots.push({x,y,r:Math.max(w,depth)*.75});
  const b=(lx,ly,lz,bw,bh,bd,m)=>box(x+Math.cos(p.yaw)*lx-Math.sin(p.yaw)*lz,base+ly,y+Math.sin(p.yaw)*lx+Math.cos(p.yaw)*lz,bw,bh,bd,m,p.yaw);
  b(0,-.8,0,w+2,2,depth+2,stone);b(0,h/2,0,w,h,depth,hotelMats[i%4]);b(0,h+.4,0,w+2,.6,depth+2,roof);
  for(let f=0;f<floors;f++)for(const side of[-1,1]){for(let j=0;j<4;j++)b(-w*.36+j*w*.24,1.6+f*3.1,side*(depth/2+.25),w*.15,1.6,.12,glass);if(hotel)b(0,.7+f*3.1,side*(depth/2+.5),w,.16,1.3,stone);}
  for(let f=0;f<floors;f++)for(const side of[-1,1])for(let j=0;j<2;j++)b(side*(w/2+.25),1.6+f*3.1,-depth*.2+j*depth*.4,.12,1.6,2.3,glass);
  b(0,1.2,depth/2+.6,3.2,2.4,1.3,wood);
  if(!hotel)for(const side of[-1,1]){const cap=b(0,h+1,side*depth/4,w+3,.3,depth*.58,roof);cap.rotateX(side*.32);}
  if(i%4===1)for(let k=0;k<3;k++){const puff=new T.Mesh(steamGeo,steamMat);puff.position.set(x,base+h+2+k*2,-y);puff.scale.set(1.2+k*.3,2,1.2+k*.3);root.add(puff);}
  d+=w+8+terrainRandom(i+70)*9;
 }
 // Five mid-rise hotels add a recognisable station-front resort district.
 for(const hotel of MOUNTAIN_HOTELS){const {x,y,width:w,depth:d,floors,base,name}=hotel,h=floors*3.2;
  plots.push({x,y,r:23});box(x,base+.1,y,w+4,.2,d+4,stone);
  box(x,base+h/2,y,w,h,d,hotelMats[floors%4]);box(x,base+h+.3,y,w+1,.6,d+1,roof);
  for(let f=0;f<floors;f++)for(const side of [-1,1])for(let j=0;j<5;j++)box(x-10+j*5,base+1.7+f*3.2,y+side*(d/2+.25),2.6,1.7,.12,glass);
  for(let f=0;f<floors;f++)for(const side of [-1,1])for(let j=0;j<3;j++)box(x+side*(w/2+.25),base+1.7+f*3.2,y-6+j*6,.12,1.7,2.5,glass);
  box(x,base+1.5,y-d/2-.4,5,3,.2,glass);box(x,base+3.2,y-d/2-1.7,9,.3,4,roof);
  label(name,x,base+h+3,y);
 }
 label('川沿いの温泉街',280,48,65);
 // A compact mountain resort sits on a connected terrace beyond the bridge.
 const summitBase=170.032,asphalt=mat('#777b76'),paving=mat('#c4c1ae'),white=mat('#e7e4d5'),yellow=mat('#eac44a'),dark=mat('#343e39');
 box(563,summitBase+.12,696,128,.22,24,paving);box(561,summitBase+.16,734,124,.25,4,paving);box(630,summitBase+.16,727,4,.25,60,paving);box(552,summitBase+.15,760,156,.25,7,asphalt);
 box(485,summitBase+.15,723,7,.25,88,asphalt);box(553,summitBase+.15,680,143,.25,7,asphalt);
 // Open shoulders reserve a 24 m corridor; leave the railway and gates unobstructed.
 for(const y of [689,757])box(485,summitBase+.05,y,24,.1,36,paving);
 // Timber crossing panels leave rail heads visible; road approaches meet the ballast.
 box(485,bridgeHeight-.13,723,7,.12,18,wood);
 for(const side of [-1,1])ribbon([[485,723+side*9,bridgeHeight-.07],[485,723+side*20,summitBase+.29]],7,0,asphalt);
 for(const y of [710,735])box(485,summitBase+.3,y,6,.07,.4,white);
 for(let x=495;x<625;x+=12)box(x,summitBase+.3,760,5,.05,.12,white);
 const museumRoadPoints=MOUNTAIN_BUS_SPUR.map(s=>s.p);
 ribbon(museumRoadPoints,museumRoadWidth,0,asphalt);
 ribbon(MOUNTAIN_BUS_MERGE.map(s=>s.p),8,0,asphalt);
 const museumTurn=MOUNTAIN_MUSEUM_TURN,turnMesh=new T.Mesh(geo(new T.CylinderGeometry(16,16,.3,64)),asphalt);turnMesh.position.set(museumTurn.x,museumTurn.height-.15,-museumTurn.y);root.add(turnMesh);
 label('美術館 バスのりば',museumTurn.x,museumTurn.height+6,museumTurn.y);
 label('温泉街駅 バスのりば',220,29,122);
 for(let i=0;i<museumRoadPoints.length-8;i+=16){ribbon(museumRoadPoints.slice(i,i+8),.14,.025,white);const p=museumRoadPoints[i],q=museumRoadPoints[Math.min(i+16,museumRoadPoints.length-1)],yaw=Math.atan2(q[1]-p[1],q[0]-p[0]),r=riverNearest(p[0],p[1]);
  if(r.distance<riverWidth(r.y)/2+30){ribbon(museumRoadPoints.slice(i,Math.min(i+17,museumRoadPoints.length)),8.2,-.5,stone);for(const side of[-1,1])beam([p[0]-Math.sin(yaw)*side*4,p[1]+Math.cos(yaw)*side*4,p[2]+.9],[q[0]-Math.sin(yaw)*side*4,q[1]+Math.cos(yaw)*side*4,q[2]+.9],.15,rail);}
 }
 const museumRoadEnd=museumRoadPoints.at(-1);label('森の美術館 入口',museumRoadEnd[0]+6,museumRoadEnd[2]+5,museumRoadEnd[1]);
 const mountainRoadPoints=MOUNTAIN_ROAD.map(s=>s.p);
 ribbon(mountainRoadPoints,MOUNTAIN_ROAD_WIDTH,0,asphalt);
 for(let i=0;i<mountainRoadPoints.length-3;i+=10){const p=mountainRoadPoints[i];if(Math.abs(p[0]-485)<8&&p[1]>705&&p[1]<740)continue;ribbon(mountainRoadPoints.slice(i,i+5),.14,.025,white);}
 // Retaining walls meet the shaped terrain; the river bridge stays open underneath.
 for(const side of [-1,1]){const vertices=[],indices=[];for(let i=0;i<mountainRoadPoints.length;i++){const p=mountainRoadPoints[i],a=mountainRoadPoints[Math.max(0,i-1)],b=mountainRoadPoints[Math.min(i+1,mountainRoadPoints.length-1)],yaw=Math.atan2(b[1]-a[1],b[0]-a[0]),x=p[0]-Math.sin(yaw)*side*4,y=p[1]+Math.cos(yaw)*side*4,r=riverNearest(x,y),bridge=r.distance<riverWidth(r.y)/2+8;vertices.push(x,p[2]-.03,-y,x,bridge?p[2]-.4:Math.min(p[2]-.4,mountainSurfaceHeight(x,y)-.1),-y);if(i){const k=i*2;indices.push(k-2,k,k-1,k-1,k,k+1);}}const g=geo(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();root.add(new T.Mesh(g,mat('#8e9286',{side:T.DoubleSide})));}
 const apron=MOUNTAIN_LOWER_APRON;
 box(apron.x,apron.height-.31,apron.y,apron.width,.60,apron.depth,asphalt);
 const roadEnd=mountainRoadPoints.at(-1);box(roadEnd[0],roadEnd[2]-.08,roadEnd[1],22,.16,22,asphalt);
 for(let i=0;i<mountainRoadPoints.length;i+=10){const p=mountainRoadPoints[i],q=mountainRoadPoints[Math.min(i+10,mountainRoadPoints.length-1)],yaw=Math.atan2(q[1]-p[1],q[0]-p[0]);if(p[0]>470&&p[1]>675)continue;for(const side of [-1,1]){const off=side*4.3,x=p[0]-Math.sin(yaw)*off,y=p[1]+Math.cos(yaw)*off;box(x,p[2]+.5,y,.12,1,.12,rail);beam([x,y,p[2]+.9],[q[0]-Math.sin(yaw)*off,q[1]+Math.cos(yaw)*off,q[2]+.9],.12,rail);}if(p[1]>265&&p[1]<300&&p[0]>265&&p[0]<325){const floor=mountainSurfaceHeight(p[0],p[1]);box(p[0],(p[2]+floor)/2,p[1],1.2,p[2]-floor,1.2,stone);}}
 // A flush bus turntable, inspired by the circular installation beside Gora crossing.
 const tt=MOUNTAIN_TURNTABLE,turntable=new T.Group();turntable.position.set(tt.x,tt.height+.03,-tt.y);root.add(turntable);
 const disk=new T.Mesh(geo(new T.CylinderGeometry(tt.radius,tt.radius,.18,96)),mat('#7c8586',{roughness:.75,metalness:.25}));disk.position.y=-.09;turntable.add(disk);
 for(const side of [-1,1]){const stripe=new T.Mesh(cube,yellow);stripe.position.set(side*1.4,.012,0);stripe.scale.set(.12,.02,12);turntable.add(stripe);}
 for(let i=0;i<8;i++){const seam=new T.Mesh(cube,dark);seam.rotation.y=i*Math.PI/4;seam.position.y=.005;seam.scale.set(.025,.01,tt.radius*2-.3);turntable.add(seam);}
 const ring=new T.Mesh(geo(new T.RingGeometry(tt.radius+.08,tt.radius+.55,96)),yellow);ring.rotation.x=-Math.PI/2;ring.position.set(tt.x,tt.height+.035,-tt.y);root.add(ring);
 for(let i=0;i<20;i++){const a=i*Math.PI/10,r=tt.radius+1.6,m=box(tt.x+Math.cos(a)*r,tt.height+.025,tt.y+Math.sin(a)*r,.18,.025,1.7,yellow);m.rotation.y=-a-Math.PI/2;}
 box(tt.x-10,tt.height+1.8,tt.y+5,.12,3.6,.12,rail);box(tt.x-10,tt.height+3.1,tt.y+5,3.8,1.5,.15,cream);
 const shopColors=[mat('#d8c6aa'),mat('#c6b99c'),mat('#e7dac2')];
 function sign(text,x,h,y,w,color='#294d43'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f5ebcf';ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 68px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,88);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;textures.push(tx);const m=new T.MeshBasicMaterial({map:tx,side:T.DoubleSide});mats.push(m);const o=new T.Mesh(geo(new T.PlaneGeometry(w,w/4)),m);o.position.set(x,h,-y);root.add(o);
 }
 sign('停止位置',tt.x-10,tt.height+3.1,tt.y+4.9,3.5);
 const summitPlots=[
  [518,790,24,25,12,'山のホテル'],[607,793,30,28,12,'見晴らしホテル'],
  [550,785,18,20,2,'民宿 こもれび'],[578,785,18,20,2,'民宿 やまびこ'],[638,742,20,20,2,'民宿 そよ風'],
  [514,744,17,14,1,'山のおみやげ'],[540,744,17,14,1,'温泉まんじゅう'],[566,744,17,14,1,'山の茶屋']];
 for(const [i,p]of summitPlots.entries()){
  const [x,y,w,d,floors,name]=p,h=floors*3.3,base=summitBase;plots.push({x,y,r:Math.max(w,d)});
  box(x,base+.04,y,w+5,.1,d+5,paving);if(y>775)box(x,base+.14,(760+y-d/2)/2,3,.2,y-d/2-760,paving);box(x,base-.6,y,w+1.6,1.4,d+1.6,stone);box(x,base+h/2,y,w,h,d,shopColors[i%3]);box(x,base+h+.3,y,w+1.6,.55,d+1.6,roof);
  for(let f=0;f<floors;f++)for(const side of [-1,1])for(let j=0;j<4;j++)box(x-w*.35+j*w*.23,base+1.8+f*3.3,y+side*(d/2+.25),w*.14,1.5,.14,glass);
  box(x,base+1.4,y-d/2-.12,2.4,2.8,.2,wood);
  if(floors<3){for(const side of[-1,1]){const cap=box(x,base+h+.8,y+side*d/4,w+2,.3,d*.59,roof);cap.rotateX(side*.3);}}
  if(floors===1){box(x,base+2.9,y-d/2-1.3,w, .25,2.7,i%2?green:red);for(let j=0;j<3;j++){box(x-w*.32+j*w*.32,base+.7,y-d/2-1.2,2.5,1.4,1,wood);box(x-w*.32+j*w*.32,base+1.5,y-d/2-1.2,2,.2,.8,cream);}}
  sign(name,x,base+(floors===1?4.1:3.4),y-d/2-.3,Math.min(w-1,16));
 }
 // Low valley-facing terrace, benches and station access preserve the vista.
 for(let x=502;x<625;x+=8){box(x,summitBase+.7,667,.12,1.4,.12,wood);if(x<620)beam([x,667,summitBase+1.2],[x+8,667,summitBase+1.2],.13,wood);}
 for(const x of[526,555,596]){box(x,summitBase+.55,672,4,.25,1.1,wood);for(const dx of[-1.4,1.4])box(x+dx,summitBase+.25,672,.18,.5,.7,dark);}
 box(594,summitBase+.22,711,8,.4,8,paving);const shrubGeo=geo(new T.IcosahedronGeometry(1,1));for(const x of[510,545,580,615]){box(x,summitBase+.35,684,3,.7,2,stone);const shrub=new T.Mesh(shrubGeo,green);shrub.position.set(x,summitBase+1.2,-684);shrub.scale.set(1.6,.8,1);root.add(shrub);}sign('見晴らし駅',564,bridgeHeight+3.1,710,12);label('山の宿とおみやげ通り',563,bridgeHeight+24,785);
 const crossingArms=[],crossingLights=[];
 for(const side of[-1,1]){
  const x=485+side*4.3,y=723-side*12;box(x,bridgeHeight+2,y,.22,4,.22,yellow);
  for(let j=0;j<6;j++)box(x,bridgeHeight+.35+j*.6,y,.24,.25,.24,dark);
  for(const angle of[-.7,.7]){const cross=box(x,bridgeHeight+4.3,y,2,.18,.16,yellow);cross.rotation.z=angle;}
  for(const dx of[-.45,.45]){const m=mat('#b72624',{emissive:'#b72624',emissiveIntensity:.1});const lamp=new T.Mesh(geo(new T.SphereGeometry(.23,10,8)),m);lamp.position.set(x+dx,bridgeHeight+3.5,-y);root.add(lamp);crossingLights.push(m);}
  const pivot=new T.Group();pivot.position.set(x,bridgeHeight+1,-y);root.add(pivot);pivot.userData.side=side;crossingArms.push(pivot);
  for(let j=0;j<10;j++){const o=new T.Mesh(cube,j%2?dark:yellow);o.position.x=-side*(j*.75+.375);o.scale.set(.75,.15,.15);pivot.add(o);}
 }

 const leafMaterial=mat('#d6e5bf',{map:leafTexture,alphaTest:.35,side:T.DoubleSide,roughness:1}),leafGeo=geo(new T.PlaneGeometry(1,1)),stemGeo=geo(new T.CylinderGeometry(.55,1,1,5)),leaves=new T.InstancedMesh(leafGeo,leafMaterial,72800),stems=new T.InstancedMesh(stemGeo,wood,10000);root.add(leaves,stems);let li=0,si=0,ti=0;
 const addStem=(a,b,r)=>{if(si>=10000)return;const p=new T.Vector3(...a),q=new T.Vector3(...b);obj.position.copy(p).add(q).multiplyScalar(.5);obj.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.clone().sub(p).normalize());obj.scale.set(r,p.distanceTo(q),r);obj.updateMatrix();stems.setMatrixAt(si++,obj.matrix);};
 const addLeaf=(x,h,y,w,angle,tilt,seed)=>{if(li>=72800)return;obj.position.set(x,h,-y);obj.rotation.set(tilt,angle,terrainRandom(seed)*.6-.3);obj.scale.set(w,w*.67,1);obj.updateMatrix();leaves.setMatrixAt(li,obj.matrix);leaves.setColorAt(li++,new T.Color().setHSL(.22+terrainRandom(seed+2)*.05,.2,.62+terrainRandom(seed+3)*.12));};
 for(let i=0;i<14000&&ti<1400;i++){
  const x=-510+terrainRandom(i*5+13)*850,y=-100+terrainRandom(i*5+71)*1000,near=mountainTrackNearest(x,y),river=riverNearest(x,y);if(inMuseumPlaza(x,y,5)||nearestMountainRoad(x,y).distance<14||inSummitCrossingSpace(x,y,4)||near.distance>175||near.distance<8||river.side<0||river.distance<riverWidth(river.y)/2+27||plots.some(p=>Math.hypot(x-p.x,y-p.y)<p.r+6))continue;
  const h=mountainSurfaceHeight(x,y),valleySide=h<near.height&&y<near.y+25,townView=y>-10&&y<710&&Math.abs(x-(200+(y-100)*70/620))<55,low=near.distance<45||valleySide||townView||(x>-350&&x<350&&y>80&&y<650),cedar=!low&&i%3===0,tall=low?.6+terrainRandom(i+31)*1.1:6+terrainRandom(i+31)*6,radius=low?.45+terrainRandom(i+9)*.45:cedar?tall*.18:tall*.35;
  addStem([x,h,-y],[x,h+tall*.65,-y],low?.055:.16+tall*.01);
  const tiers=low?3:cedar?7:5;for(let k=0;k<tiers;k++){const angle=i*2.399+k*2.4,level=low?.25+k*.25:cedar?.2+k*.1:.35+k*.11,spread=radius*(cedar?1-level:Math.sin(level*Math.PI)),bx=x+Math.cos(angle)*spread,by=y+Math.sin(angle)*spread,bh=h+tall*level;
   addStem([x,h+tall*(level-.12),-y],[bx,bh,-by],low?.025:.045);for(let j=0;j<3;j++)addLeaf(bx,bh+tall*.1,by,low?.8:cedar?Math.max(1,spread*1.7):radius*1.15,angle+j*Math.PI/3,.2+(j===2?1:0),i*31+k*3+j);
  }
  for(let k=0;k<(low?16:28);k++){const angle=terrainRandom(i*51+k)*Math.PI*2,level=.35+terrainRandom(i*39+k)*.65,rr=radius*Math.sin(level*Math.PI)*Math.sqrt(terrainRandom(i*71+k));addLeaf(x+Math.cos(angle)*rr,h+tall*level,y+Math.sin(angle)*rr,low?.9:cedar?1.5:2.1,angle,terrainRandom(i+k)*1.8-.9,i*19+k);}
  // Understory is made from small tilted foliage cards around real stems.
  if(!low)for(let k=0;k<3;k++){const a=k*2.1+i,xx=x+Math.cos(a)*1.1,yy=y+Math.sin(a)*1.1;addLeaf(xx,mountainHeight(xx,yy)+.35,yy,1.1,a,.7,i+k);}
  ti++;
 }
 leaves.count=li;stems.count=si;leaves.instanceMatrix.needsUpdate=stems.instanceMatrix.needsUpdate=true;
 const staticBatches=batchMountainBoxes(root,cube);
 return {root,ready:Promise.all(textureLoads),update(mode,control,states,visual,time=0){turntable.rotation.y=mountainTurntableState(visual?.trafficTime??0).angle;const crossing=summitCrossingState(visual);crossingArms.forEach(p=>p.rotation.z=-p.userData.side*(1-crossing.close)*Math.PI/2);crossingLights.forEach((m,i)=>m.emissiveIntensity=crossing.alarm&&Math.floor(time*2)%2===i%2?2:.05);for(const label of labels)label.visible=mode==='orbit';if(states)signals.forEach((m,j)=>{const block=[0,1,1,0][j],owner=Array.isArray(control?.owners)?control.owners[block]:control?.owner,s=owner===null||owner===undefined?null:states[owner],direction=visual?.mountainSignals?.[block]??s?.trip,green=direction===(j===0||j===2?1:-1),color=green?'#40c96b':'#bb3028';m.color.set(color);m.emissive.set(color);});},dispose(){for(const b of staticBatches)b.dispose();leaves.dispose();stems.dispose();ties.dispose();rocks.dispose();for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();},treeCount:ti};
}
