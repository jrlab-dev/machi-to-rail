import {prepareLettering} from './train-lettering-3d.mjs?v=marks-89';
import * as T from 'three';
import {normalizeDesign} from './train-design.mjs?v=marks-88';
import {drawLivery} from './train-livery.mjs';

const roleOf=m=>m.name.replace(/^Paint_/,'').replace(/\.\d+$/,'');
// Car-space UVs keep the skin continuous across separate body and door meshes.
function paintGeometry(mesh,profile){
 const face=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).every(m=>roleOf(m)==='face');
 const g=profile.surfacePaint&&mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone(),p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2),v=new T.Vector3(),normal=new T.Vector3(),nm=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
 let triangleNormalX=0;
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);normal.fromBufferAttribute(n,i).applyMatrix3(nm);
  if(profile.surfacePaint&&i%3===0){triangleNormalX=0;for(let j=0;j<3;j++)triangleNormalX+=new T.Vector3().fromBufferAttribute(n,i+j).applyMatrix3(nm).x/3;}
  const front=face||Math.abs(profile.surfacePaint?triangleNormalX:normal.x)>.7;
  const frontSign=face?(profile.surfacePaint&&!profile.doubleEnded?1:v.x):(profile.surfacePaint?triangleNormalX:normal.x);
  const u=front?(frontSign>=0?-v.z:v.z)/profile.width+.5:(normal.z>=0?v.x:-v.x)/profile.length+.5;
  uv[i*2]=(front?1536+Math.max(1,Math.min(511,u*512)):Math.max(1,Math.min(1535,u*1536)))/2048;
  uv[i*2+1]=Math.max(.002,Math.min(.998,(v.y-profile.bottom)/profile.height));
 }
 g.setAttribute('uv1',new T.BufferAttribute(uv,2));return g;
}

// Each formation owns its colors; cached source materials are never mutated.
export function preparePaint(root,cars,design,profile={}){
 profile={length:20,width:3,height:2.75,bottom:1,front:9.835,side:1.51,labelX:9.79,labelY:3.405,labelWidth:1.35,labelHeight:.17,doubleEnded:false,...profile};
 const materials=new Map(),owned=[],geometries=[],labels=[];root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh)return;const copy=source=>{if(!materials.has(source)){const m=source.clone();if(m.name==='BlackFace')m.name='Paint_mask';m.userData.originalMap=source.map;m.userData.originalColor=source.color.clone();materials.set(source,m);owned.push(m);}return materials.get(source);};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
  if((Array.isArray(o.material)?o.material:[o.material]).some(m=>m.name.startsWith('Paint_')&&(profile.surfacePaint||roleOf(m)!=='roof'))){o.geometry=paintGeometry(o,profile);geometries.push(o.geometry);}
 });
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const skin=document.createElement('canvas');skin.width=2048;skin.height=512;
 const side=document.createElement('canvas');side.width=1536;side.height=512;
 const front=document.createElement('canvas');front.width=512;front.height=512;
 const skinTexture=new T.CanvasTexture(skin);skinTexture.colorSpace=T.SRGBColorSpace;skinTexture.channel=1;skinTexture.anisotropy=4;
 const labelMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false});const labelGeometry=new T.PlaneGeometry(profile.labelWidth,profile.labelHeight);
 for(let i=0;i<cars.length;i++)if(!profile.surfacePaint&&(i===0||i===cars.length-1))for(const end of profile.doubleEnded?[1,-1]:[1]){const label=new T.Mesh(labelGeometry,labelMaterial);label.position.set(end*profile.labelX,profile.labelY,0);label.rotation.y=end*Math.PI/2;cars[i].parts.body.add(label);labels.push(label);}
 const lettering=prepareLettering(cars,profile);
 let name='',current,image=null,imageSource='',disposed=false,ticket=0,imageReady=Promise.resolve(true);
 function render(){const d=current,pattern=d.pattern!=='legacy'||!!d.wrap;
  drawLivery(side.getContext('2d'),d,image);drawLivery(front.getContext('2d'),d,image,true);
  const c=skin.getContext('2d');c.drawImage(side,0,0);c.drawImage(front,1536,0);skinTexture.needsUpdate=true;
  for(const m of owned){const role=roleOf(m);if(m.name.startsWith('Paint_')&&role==='mask'){m.color.copy(m.userData.originalColor);if(d.front)m.color.set(d.front.mask);continue;}if(!m.name.startsWith('Paint_')||!d[role])continue;
   const mapped=role==='face'?(!!d.front||pattern):(pattern&&role!=='roof'&&(role!=='door'||!d.doorSeparate||!!d.wrap));
   const map=mapped?skinTexture:m.userData.originalMap;
   if(m.map!==map){m.map=map;m.needsUpdate=true;}m.color.set(mapped?'#ffffff':d[role]);
  }
 }
 function apply(raw){if(disposed)return;current=normalizeDesign(raw);const d=current;
  const source=d.wrap?.image||'';
  if(source!==imageSource){imageSource=source;image=null;const id=++ticket;imageReady=source?new Promise(resolve=>{const next=new Image();next.onload=()=>{if(disposed||id!==ticket){resolve(false);return;}image=next;render();resolve(true);};next.onerror=()=>resolve(false);next.src=source;}):Promise.resolve(true);}
  render();
  if(name!==d.name){name=d.name;const c=canvas.getContext('2d');c.fillStyle='#101c23';c.fillRect(0,0,512,64);c.fillStyle='#f4f1d7';c.textAlign='center';c.textBaseline='middle';c.font='bold 40px sans-serif';c.fillText(name,256,33,490);texture.needsUpdate=true;}
  lettering.apply(d.lettering);root.userData.design={...d};
 }
 apply(design);
 return {apply,ready:()=>imageReady,dispose(){disposed=true;ticket++;lettering.dispose();owned.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());skinTexture.dispose();texture.dispose();labelMaterial.dispose();labelGeometry.dispose();labels.forEach(o=>o.removeFromParent());}};
}
