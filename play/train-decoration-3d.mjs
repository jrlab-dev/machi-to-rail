import * as T from 'three';
import {decorationApplies,drawDecoration} from './train-decorations.mjs?v=rail-90';

// Length, width, lowest and highest paintable body heights, in car coordinates.
const profiles={
  original:[20,3,1,3.75],tram:[12.4,2.34,.8,3.3],
  'express-short':[27,3.35,.65,3.65],'express-long':[27,3.35,.65,3.65],'express-retro':[27,3.35,.39,3.68],
  maglev:[27,2.9,.65,3.10],steam:[20,2.9,1.03,3.93],freight:[20,2.9,1.05,3.70],
  'limited-classic':[20.4,2.94,.67,3.59],'limited-stream':[20.4,2.94,.64,3.58],'limited-panorama':[20.4,2.94,.72,4.45],
  monorail:[15.3,2.86,.92,3.47],'suspended-monorail':[15.12,2.92,.85,3.58]
};
const previous=new WeakMap(),picking=new WeakMap();
let pickContext;
const empty=()=>{};
const eligible=m=>m.userData.decorationSurface||/^Paint_(body|face|door|stripe2?)(?:\.\d+)?$/.test(m.name);

function reverseFlank(item){
  return item.kind==='band'?{...item,start:100-item.end,end:100-item.start,y:item.y-item.slope,slope:-item.slope}:{...item,x:100-item.x};
}

function makeAtlas(items,[length,width,bottom,top]){
  const side=items.some(item=>item.surface==='side'),front=items.some(item=>item.surface==='front');
  const scale=items.every(item=>item.kind==='band')?.5:1;
  const sideWidth=side?1536*scale:0,frontWidth=front?512*scale:0,h=512*scale;
  const canvas=document.createElement('canvas');canvas.width=sideWidth+frontWidth;canvas.height=h;
  const ctx=canvas.getContext('2d');
  function panel(surface,x,y,w,h,reverse){
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.translate(x,y);
    const physicalWidth=surface==='front'?width:length,height=top-bottom;
    ctx.scale(w/physicalWidth,h/height);
    for(let item of items){
      if(item.surface!==surface)continue;
      if(reverse){
        // Keep lettering readable and preserve its physical position on the opposite flank.
        item=reverseFlank(item);
      }
      drawDecoration(ctx,item,physicalWidth,height);
    }
    ctx.restore();
  }
  if(side){panel('side',0,0,sideWidth,h/2,false);panel('side',0,h/2,sideWidth,h/2,true);}
  if(front)panel('front',sideWidth,0,frontWidth,h,false);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  map.userData.flankFraction=sideWidth/canvas.width;
  return map;
}

const vertexHeader=`
uniform mat4 decorationFrame;
uniform mat3 decorationNormalMatrix;
varying vec3 decorationPosition;
varying vec3 decorationNormal;
varying vec2 decorationUv;
`;
const fragmentHeader=`
uniform sampler2D decorationAtlas;
uniform vec4 decorationProfile;
uniform vec2 decorationEnds;
uniform float flankFraction;
uniform bool moldedNose;
uniform vec4 decorationExclusions[12];
varying vec3 decorationPosition;
varying vec3 decorationNormal;
varying vec2 decorationUv;
vec4 sampleTrainDecoration(){
  vec3 n=normalize(decorationNormal), p=decorationPosition;
  float y=(p.y-decorationProfile.z)/(decorationProfile.w-decorationProfile.z);
  if(y<0.0 || y>1.0 || (!moldedNose && abs(n.y)>.985))return vec4(0.0);
  for(int i=0;i<12;i++){
    vec4 b=decorationExclusions[i];
    if(decorationUv.x>=b.x && decorationUv.x<=b.z && decorationUv.y>=b.y && decorationUv.y<=b.w)return vec4(0.0);
  }
  bool endFace=(moldedNose && p.x>.1*decorationProfile.x && abs(p.z)<.43*decorationProfile.y) || (abs(n.x)>.72*abs(n.z) && abs(p.x)>.22*decorationProfile.x);
  vec2 atlasUv;
  if(endFace){
    if(flankFraction>=1.0 || (p.x>0.0?decorationEnds.x:decorationEnds.y)<.5)return vec4(0.0);
    float u=.5-sign(p.x)*p.z/decorationProfile.y;
    atlasUv=vec2(flankFraction+(1.0-flankFraction)*clamp(u,.003,.997),clamp(y,.003,.997));
  }else{
    if(flankFraction<=0.0)return vec4(0.0);
    float side=p.z>=0.0?1.0:-1.0;
    float u=.5+side*p.x/decorationProfile.x;
    atlasUv=vec2(flankFraction*clamp(u,.001,.999),.5*clamp(y,.004,.996)+(side>0.0?.5:0.0));
  }
  return texture2D(decorationAtlas,atlasUv);
}
`;
function decoratedMaterial(source,frame,atlas,profile,ends,indices){
  const material=source.clone();
  // Paint.apply retains and edits its original materials, including switching wrapping textures.
  material.color=source.color;
  const exclusions=new Float32Array(48).fill(2);
  const skin=source.map?.image;
  (skin?.decorationExclusions||[]).slice(0,12).forEach(([x,y,w,h],i)=>{
    exclusions.set([x/skin.width,y/skin.height,(x+w)/skin.width,(y+h)/skin.height],i*4);
  });
  const normal=new T.Matrix3().getNormalMatrix(frame);
  const moldedNose=profile.x===27&&/^Paint_face/.test(source.name);
  picking.set(material,{frame,normal,profile,ends,exclusions,indices,moldedNose});
  material.onBeforeRender=()=>{
    if(material.map!==source.map){material.map=source.map;material.needsUpdate=true;}
  };
  material.onBeforeCompile=(shader,renderer)=>{
    source.onBeforeCompile(shader,renderer);
    Object.assign(shader.uniforms,{decorationAtlas:{value:atlas},flankFraction:{value:atlas.userData.flankFraction},moldedNose:{value:moldedNose},decorationFrame:{value:frame},
      decorationNormalMatrix:{value:normal},decorationProfile:{value:profile},decorationEnds:{value:ends},decorationExclusions:{value:exclusions}});
    shader.vertexShader=vertexHeader+shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n decorationPosition=(decorationFrame*vec4(transformed,1.0)).xyz; decorationNormal=decorationNormalMatrix*normal; decorationUv=vec2(uv.x,1.0-uv.y);');
    shader.fragmentShader=fragmentHeader+shader.fragmentShader.replace('#include <map_fragment>',
      '#include <map_fragment>\n vec4 sticker=sampleTrainDecoration(); diffuseColor.rgb=mix(diffuseColor.rgb,sticker.rgb,sticker.a);');
  };
  material.customProgramCacheKey=()=>source.customProgramCacheKey()+'-train-decoration-v1';
  return material;
}

// Use the closed door's position for projecting its artwork; the mesh and its paint then slide together.
function restFrame(mesh,body){
  const frame=new T.Matrix4();
  for(let part=mesh;part&&part!==body;part=part.parent){
    part.updateMatrix();
    const matrix=part.matrix.clone();
    if(Number.isFinite(part.userData.baseX))matrix.elements[12]=part.userData.baseX;
    if(Number.isFinite(part.userData.baseZ))matrix.elements[14]=part.userData.baseZ;
    frame.premultiply(matrix);
  }
  return frame;
}

export function attachDecorations(model,design){
  previous.get(model)?.();
  const items=design?.decorations;
  if(!items?.length||!model.cars?.length)return empty;
  const profile=profiles[model.train]||profiles.original,profileVector=new T.Vector4(...profile);
  const maps=new Map(),materials=new Map(),restore=[];
  model.cars.forEach((car,index)=>{
    const count=model.cars.length,head=index===0,last=index===count-1&&model.train!=='steam'&&model.train!=='freight';
    const ends=new T.Vector2(Number(head||last),Number((model.train==='tram'||model.train==='freight')&&head));
    const chosen=items.filter(item=>(item.surface==='side'||ends.x||ends.y)&&decorationApplies(item,index,count));
    if(!chosen.length)return;
    const key=JSON.stringify(chosen);
    if(!maps.has(key))maps.set(key,makeAtlas(chosen,profile));
    const atlas=maps.get(key),body=car.parts.body;
    body.traverse(mesh=>{
      if(!mesh.isMesh||mesh.isInstancedMesh)return;
      const original=mesh.material,list=Array.isArray(original)?original:[original];
      if(!list.some(eligible))return;
      const frame=restFrame(mesh,body);
      const mapped=list.map(m=>{
        if(!eligible(m))return m;
        const key=[m.uuid,atlas.uuid,ends.x,ends.y,...frame.elements].join(',');
        if(!materials.has(key))materials.set(key,decoratedMaterial(m,frame,atlas,profileVector,ends,chosen.map(item=>items.indexOf(item))));
        return materials.get(key);
      });
      restore.push([mesh,original]);mesh.material=Array.isArray(original)?mapped:mapped[0];
    });
  });
  let disposed=false;
  function dispose(){
    if(disposed)return;disposed=true;previous.delete(model);
    for(const [mesh,m] of restore)mesh.material=m;
    for(const m of materials.values())m.dispose();
    for(const map of maps.values())map.dispose();
  }
  previous.set(model,dispose);return dispose;
}

export function hitDecorationIndex(hit,design){
  const mesh=hit?.object;
  const m=Array.isArray(mesh?.material)?mesh.material[hit.face?.materialIndex]:mesh?.material;
  const data=picking.get(m);
  if(!data||!design?.decorations?.length||!hit.point||!(hit.normal||hit.face?.normal))return -1;
  const {profile,ends,frame,normal,exclusions,indices,moldedNose}=data;
  const p=mesh.worldToLocal(hit.point.clone()).applyMatrix4(frame);
  const n=(hit.normal||hit.face.normal).clone().applyNormalMatrix(normal);
  const height=profile.w-profile.z,y=1-(p.y-profile.z)/height;
  if(y<0||y>1||(!moldedNose&&Math.abs(n.y)>.985))return -1;
  if(hit.uv)for(let k=0;k<exclusions.length;k+=4){
    const x=hit.uv.x,v=1-hit.uv.y;
    if(x>=exclusions[k]&&x<=exclusions[k+2]&&v>=exclusions[k+1]&&v<=exclusions[k+3])return -1;
  }
  const front=(moldedNose&&p.x>.1*profile.x&&Math.abs(p.z)<.43*profile.y)||(Math.abs(n.x)>.72*Math.abs(n.z)&&Math.abs(p.x)>.22*profile.x);
  if(front&&!(p.x>0?ends.x:ends.y))return -1;
  const width=front?profile.y:profile.x,reverse=!front&&p.z<0;
  const x=.5+(front?-Math.sign(p.x)*p.z:(reverse?-p.x:p.x))/width;
  if(!pickContext){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    pickContext=canvas.getContext('2d',{willReadFrequently:true});
  }
  const ctx=pickContext,zoom=180;
  for(let i=indices.length-1;i>=0;i--){
    const item=design.decorations[indices[i]];
    if(!item||item.surface!==(front?'front':'side'))continue;
    ctx.resetTransform();ctx.clearRect(0,0,1,1);
    ctx.setTransform(zoom,0,0,zoom,.5-x*width*zoom,.5-y*height*zoom);
    drawDecoration(ctx,reverse?reverseFlank(item):item,width,height);
    if(ctx.getImageData(0,0,1,1).data[3]>32)return indices[i];
  }
  return -1;
}
