import * as THREE from 'three';
import {ROAD_CATALOG,canonicalRoadType,validateRoadNetwork} from './road-network.mjs?v=train-order-47';

const asphalt='#30363a',sidewalk='#c5c8bd',marking='#f6f0d7',signal='#26363a';
const shape=(points)=>{const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))s.lineTo(p[0],p[1]);s.closePath();return s};
const surfacePoints={
  road:[[-10,-4],[10,-4],[10,4],[-10,4]],
  crossing:[[-10,-4],[10,-4],[10,4],[-10,4]],
  corner:[[-4,-4],[10,-4],[10,4],[4,4],[4,10],[-4,10]],
  tee:[[-10,-4],[10,-4],[10,4],[4,4],[4,10],[-4,10],[-4,4],[-10,4]],
  junction:[[-10,-4],[-4,-4],[-4,-10],[4,-10],[4,-4],[10,-4],[10,4],[4,4],[4,10],[-4,10],[-4,4],[-10,4]]
};
const approachArms={road:[['x',-10,10]],crossing:[['x',-10,10]],corner:[['x',0,10],['y',0,10]],tee:[['x',-10,-4],['x',4,10],['y',4,10]],junction:[['x',-10,-4],['x',4,10],['y',-10,-4],['y',4,10]]};
const disposeGeometry=group=>group.traverse(o=>{if(o.isMesh||o.isLine)o.geometry?.dispose();});

function plane(geometry,material,x,z,y=.02){const mesh=new THREE.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);return mesh}
function addRect(group,w,d,x,z,material,y=.02){group.add(plane(new THREE.PlaneGeometry(w,d),material,x,z,y));}
function addMarkings(group,type,markMat){
  for(const [axis,a,b] of approachArms[type]||[]){
    const length=Math.abs(b-a),mid=(a+b)/2;
    if(axis==='x'){
      for(let x=Math.min(a,b)+2;x<Math.max(a,b)-1;x+=5)addRect(group,2.4,.16,x,0,markMat,.035);
      if(type!=='road'&&type!=='crossing')for(const x of [a,b])for(let z=-2.8;z<=2.8;z+=1.35)addRect(group,.35,.75,x+(x<0?.65:-.65),z,markMat,.04);
      if(type==='crossing')addRect(group,.18,6,mid-2.3,0,markMat,.04),addRect(group,.18,6,mid+2.3,0,markMat,.04);
    }else{
      for(let z=Math.min(a,b)+2;z<Math.max(a,b)-1;z+=5)addRect(group,.16,2.4,0,z,markMat,.035);
      for(const z of [a,b])for(let x=-2.8;x<=2.8;x+=1.35)addRect(group,.75,.35,x,z+(z<0?.65:-.65),markMat,.04);
    }
  }
}
function addSidewalks(group,type,walkMat){
  for(const [axis,a,b] of approachArms[type]||[]){const lo=Math.min(a,b),hi=Math.max(a,b),size=hi-lo;
    if(axis==='x'){addRect(group,size,1.2,(a+b)/2,4.6,walkMat,.025);addRect(group,size,1.2,(a+b)/2,-4.6,walkMat,.025);}
    else{addRect(group,1.2,size,4.6,(a+b)/2,walkMat,.025);addRect(group,1.2,size,-4.6,(a+b)/2,walkMat,.025);}
  }
}
function addSignals(group){for(const[x,z]of [[-5,-5],[5,-5],[-5,5],[5,5]]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,3.2,8),new THREE.MeshStandardMaterial({color:signal,roughness:.8}));pole.position.set(x,1.6,z);group.add(pole);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.38,.62,.25),new THREE.MeshStandardMaterial({color:'#303030',roughness:.7,emissive:'#170c05'}));lamp.position.set(x,3.05,z);group.add(lamp);}}

/**
 * Browser renderer for roads. `roadSurface` is the existing vendor/road-surface.js API.
 * `build` disposes geometry created by its previous build; callers remove the returned old
 * Group from their scene as usual. Shared textures/materials live until `dispose()`.
 */
export function createRoadRenderer({roadSurface}={}){
  let current=null,disposed=false;
  const source=document.createElement('canvas');source.width=source.height=128;
  const ctx=source.getContext('2d');ctx.fillStyle='#535b60';ctx.fillRect(0,0,128,128);
  if(roadSurface?.asphalt)roadSurface.asphalt(ctx,128,128,'#535b60');
  const roadTexture=source?new THREE.CanvasTexture(source):null;
  if(roadTexture){roadTexture.colorSpace=THREE.SRGBColorSpace;roadTexture.wrapS=roadTexture.wrapT=THREE.RepeatWrapping;roadTexture.repeat.set(.5,.5);}
  const roadMat=new THREE.MeshStandardMaterial({color:roadTexture?'#ffffff':asphalt,map:roadTexture,roughness:1,side:THREE.DoubleSide});
  const walkMat=new THREE.MeshStandardMaterial({color:sidewalk,roughness:.95,side:THREE.DoubleSide});
  const markMat=new THREE.MeshStandardMaterial({color:marking,roughness:.75,side:THREE.DoubleSide});
  function build(props,rails=[],kit,roundedCorners=[]){
    if(disposed)throw Error('破棄済みの道路描画器は再利用できません。');
    if(current)disposeGeometry(current);
    const root=new THREE.Group();root.name='road-network';
    for(const prop of Array.isArray(props)?props:[]){const type=canonicalRoadType(prop?.type),spec=ROAD_CATALOG[type];if(!spec||!Array.isArray(prop.pose))continue;
      const group=new THREE.Group();group.name='road-'+prop.uid;group.position.set(prop.pose[0],-.42,-prop.pose[1]);group.rotation.y=prop.pose[2];
      const corner=roundedCorners.find(c=>Math.hypot(c[0]-prop.pose[0],c[1]-prop.pose[1])<.01);
      if(corner){
        const ring=(inner,outer,mat,y)=>{const points=[];for(let i=0;i<=48;i++){const a=Math.PI+i*Math.PI/96;points.push([18+outer*Math.cos(a),18+outer*Math.sin(a)]);}for(let i=48;i>=0;i--){const a=Math.PI+i*Math.PI/96;points.push([18+inner*Math.cos(a),18+inner*Math.sin(a)]);}group.add(plane(new THREE.ShapeGeometry(shape(points)),mat,0,0,y));};
        ring(10,22,roadMat,0);ring(22,23.2,walkMat,.025);ring(8.8,10,walkMat,.025);
        for(let i=0;i<8;i++){const a=Math.PI+(i+.5)*Math.PI/16,o=plane(new THREE.PlaneGeometry(2,.16),markMat,18+18*Math.cos(a),-(18+18*Math.sin(a)),.035);o.rotation.z=a+Math.PI/2;group.add(o);}
        root.add(group);continue;
      }
      if(type==='road'){
        let lo=-10,hi=10,approach=null;const [x,y,a]=prop.pose;
        for(const c of roundedCorners){const dx=c[0]-x,dy=c[1]-y,u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(v)<.01&&Math.abs(u)<58){if(Math.abs(u)<28){if(u<0)lo=Math.max(lo,u+18);else hi=Math.min(hi,u-18);}const vx=Math.cos(c[2])-Math.sin(c[2]),vy=Math.sin(c[2])+Math.cos(c[2]);approach={u,side:Math.sign(-vx*Math.sin(a)+vy*Math.cos(a))};}}
        if(approach){
          const {u,side}=approach,edge=x=>4+4*Math.max(0,Math.min(1,(48-Math.abs(x-u))/30)),points=[];
          for(let i=0;i<=8;i++){const t=lo+(hi-lo)*i/8;points.push([t,side*edge(t)]);}points.push([hi,-side*4],[lo,-side*4]);
          group.add(plane(new THREE.ShapeGeometry(shape(points)),roadMat,0,0,0));
          const walk=[];for(let i=0;i<=8;i++){const t=lo+(hi-lo)*i/8;walk.push([t,side*edge(t)]);}for(let i=8;i>=0;i--){const t=lo+(hi-lo)*i/8;walk.push([t,side*(edge(t)+1.2)]);}group.add(plane(new THREE.ShapeGeometry(shape(walk)),walkMat,0,0,.025));
          addRect(group,hi-lo,1.2,(lo+hi)/2,side*4.6,walkMat,.025);
          for(let x=lo+1;x<hi-1;x+=5)addRect(group,2.4,.16,x,0,markMat,.035);root.add(group);continue;
        }
      }
      const mesh=plane(new THREE.ShapeGeometry(shape(surfacePoints[type])),roadMat,0,0,0);mesh.name='carriageway';group.add(mesh);
      addSidewalks(group,type,walkMat);addMarkings(group,type,markMat);if(type==='junction')addSignals(group);
      root.add(group);
    }
    current=root;root.userData.roadValidation=validateRoadNetwork(props,rails,kit);return root;
  }
  function dispose(){if(disposed)return;disposed=true;if(current)disposeGeometry(current);roadTexture?.dispose();roadMat.dispose();walkMat.dispose();markMat.dispose();current=null;}
  return {build,dispose};
}
