import {decoratePaint} from './train-decorated-paint.mjs?v=rail-90';
import * as T from 'three';
import {preparePaint} from './train-paint.mjs?v=rail-90';
import {setupPreviewOrbit} from './preview-orbit.mjs?v=rail-90';
import {createIslandTrain} from './island-train.mjs?v=rail-90';
import {isLimitedExpress,isMonorail,hasNamedParts} from './train-types.mjs?v=rail-90';

export function createTrainPreview(canvas,loadAsset,onManual=()=>{}){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color('#e8efe7');
 scene.add(new T.HemisphereLight('#ffffff','#819782',2.5));const sun=new T.DirectionalLight('#fff4df',3);sun.position.set(15,30,20);scene.add(sun);
 const camera=new T.PerspectiveCamera(35,1,.1,500),pivot=new T.Group();scene.add(pivot);
 let paint=null,ticket=0,active=false,raf=0,previous=0,radius=15,centerHeight=3,modelHeight=6,viewPitch=.3,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const orbit=setupPreviewOrbit(canvas,{read:()=>({yaw:pivot.rotation.y,pitch:viewPitch}),write:p=>{pivot.rotation.y=p.yaw;viewPitch=p.pitch;},manual:()=>{paused=true;onManual();}});
 function frame(now){if(!active)return;const dt=Math.min(.05,(now-previous)/1000);previous=now;
  if(!paused&&!document.hidden)pivot.rotation.y+=dt*.24;
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
  camera.aspect=w/h;const tangent=Math.tan(camera.fov*Math.PI/360),distance=Math.max(radius/Math.sin(Math.atan(tangent*camera.aspect)),(modelHeight*.5+radius*.3)/tangent+radius*.4)*1.12;
  camera.position.set(distance*Math.cos(viewPitch)*.251,distance*Math.sin(viewPitch),distance*Math.cos(viewPitch)*.968);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.render(scene,camera);
  canvas.dataset.angle=String(pivot.rotation.y);canvas.dataset.pitch=String(viewPitch);canvas.dataset.meshes=String(renderer.info.render.triangles);canvas.dataset.resources=JSON.stringify(renderer.info.memory);raf=requestAnimationFrame(frame);
 }
 function clear(){paint?.dispose();paint=null;pivot.clear();canvas.dataset.ready='false';}
 return{
  get paused(){return paused;},toggle(){paused=!paused;return paused;},
  start(){if(active)return;active=true;previous=performance.now();raf=requestAnimationFrame(frame);},
  stop(){orbit.cancel();active=false;ticket++;cancelAnimationFrame(raf);clear();renderer.render(scene,camera);},
  async show(type,design,spec){const own=++ticket;clear();
   let root;
   if(isLimitedExpress(type)){
     const {createLimitedExpress}=await import('./limited-express-model.mjs?v=rail-90');
     if(own!==ticket||!active)return false;
     const model=createLimitedExpress(type,{count:1,cars:[{kind:'cab',orientation:'front',roofVariant:'plain'}]},design);
     root=model.root;paint=decoratePaint(model,design).paint;
   }else if(isMonorail(type)){
     const model=createIslandTrain({count:1,cars:[{kind:'cab'}]},type==='suspended-monorail',false,design);
     root=model.root;paint=decoratePaint(model,design).paint;
   }else{
   const gltf=await loadAsset(spec?.cab?.asset||type+'.glb');if(own!==ticket||!active)return false;
   root=new T.Group();const parts={};gltf.scene.updateMatrixWorld(true);
   for(const name of ['body','bogieFront','bogieBack']){const group=new T.Group();
    if(hasNamedParts(type)){const source=gltf.scene.getObjectByName(name);if(!source)throw Error('模型の部品がありません。');group.add(source.clone(true));}
    else {gltf.scene.traverse(o=>{if(o.isMesh&&(o.name===name||o.name.startsWith(name+'_'))){const mesh=new T.Mesh(o.geometry,o.material);mesh.applyMatrix4(o.matrixWorld);group.add(mesh);}});if(!group.children.length){const source=gltf.scene.getObjectByName(name);if(source)group.add(source.clone(true));}}
    parts[name]=group;root.add(group);
   }
   const cars=[{parts}];
   paint=decoratePaint({root,cars,train:type,length:spec?.cab?.bodyLength,paint:preparePaint(root,cars,design,spec?.paintProfile)},design).paint;
   const painted=await paint.ready();if(own!==ticket||!active)return false;if(!painted){clear();throw Error('ラッピング画像を読みこめません。');}
   }
   const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());radius=size.length()/2;modelHeight=size.y;centerHeight=center.y;root.position.sub(center);pivot.add(root);pivot.rotation.y=-.45;viewPitch=.3;
   canvas.dataset.ready='true';canvas.dataset.type=type;canvas.dataset.design=JSON.stringify(design);canvas.dataset.cars='1';canvas.dataset.height=String(centerHeight);return true;
  }
 };
}
