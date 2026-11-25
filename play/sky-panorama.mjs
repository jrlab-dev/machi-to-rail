import * as T from 'three';
import {SKY_FACE_SIZE,SKY_SOURCE_WIDTH,SKY_SOURCE_HEIGHT,skyImageBudget,createSkyRegionPolicy,skyCameraCovered,skyBlendAt} from './sky-policy.mjs?v=nature-sky-24';
const memory=skyImageBudget();
export function createNatureSky(renderer){
 const policy=createSkyRegionPolicy(),status={state:'idle',requests:0,faceSize:SKY_FACE_SIZE,sourceWidth:SKY_SOURCE_WIDTH,sourceHeight:SKY_SOURCE_HEIGHT,readyMs:0,conversionMs:0,memory,active:false};
 let preparation=null,target=null,authorized=false,dome=null,transitionSource=null;
 async function prepare(){
  if(preparation)return preparation;
  preparation=(async()=>{status.state='loading';status.requests++;const started=performance.now();let source=null,bitmap=null,mesh=null,material=null,expired=false;const abort=new AbortController();let timer;const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;abort.abort();reject(Error('sky-timeout'));},1500);});const within=promise=>Promise.race([promise,deadline]);
   try{
    const response=await within(fetch(new URL('./assets/sky/cumulus.webp',import.meta.url),{signal:abort.signal}));if(!response.ok)throw Error('sky-load');
    const blob=await within(response.blob());bitmap=await within(createImageBitmap(blob,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'}).then(image=>{if(expired){image.close();throw Error('sky-timeout');}return image;}));
    if(bitmap.width!==SKY_SOURCE_WIDTH||bitmap.height!==SKY_SOURCE_HEIGHT)throw Error('sky-dimensions');
    source=new T.Texture(bitmap);source.colorSpace=T.SRGBColorSpace;source.minFilter=T.LinearFilter;source.magFilter=T.LinearFilter;source.generateMipmaps=false;source.flipY=false;source.needsUpdate=true;
    target=new T.WebGLCubeRenderTarget(SKY_FACE_SIZE,{type:T.UnsignedByteType,format:T.RGBAFormat,colorSpace:T.SRGBColorSpace,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter,magFilter:T.LinearFilter,depthBuffer:false,stencilBuffer:false});
    status.target={width:target.width,height:target.height,faces:target.texture.image.length,type:target.texture.type,format:target.texture.format,mipmaps:target.texture.generateMipmaps,depth:target.depthBuffer,stencil:target.stencilBuffer};
    material=new T.ShaderMaterial({name:'StaticNatureSky',uniforms:{panorama:{value:source},horizon:{value:new T.Color('#d8e8f0')}},side:T.BackSide,blending:T.NoBlending,toneMapped:false,
     vertexShader:'varying vec3 direction;void main(){direction=normalize((modelMatrix*vec4(position,0.)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
     fragmentShader:`uniform sampler2D panorama;uniform vec3 horizon;varying vec3 direction;
      #include <common>
      void main(){vec3 d=normalize(direction);vec2 uv=equirectUv(d);float edge=min(uv.x,1.-uv.x);float seam=.5*(1.-smoothstep(0.,.025,edge));vec4 color=mix(texture2D(panorama,uv),texture2D(panorama,vec2(1.-uv.x,uv.y)),seam);float haze=1.-smoothstep(0.,.13,max(0.,d.y));color.rgb=mix(color.rgb,horizon,haze);gl_FragColor=color;}`});
    mesh=new T.Mesh(new T.BoxGeometry(5,5,5),material);const conversion=performance.now();new T.CubeCamera(1,10,target).update(renderer,mesh);status.conversionMs=performance.now()-conversion;
    const blendMaterial=new T.ShaderMaterial({name:'NatureSkyBlend',uniforms:{oldSky:{value:null},newSky:{value:target.texture},mixAmount:{value:0},rotation:{value:new T.Matrix3().setFromMatrix4(new T.Matrix4().makeRotationY(-305*Math.PI/180))}},side:T.BackSide,depthTest:false,depthWrite:false,blending:T.NoBlending,toneMapped:false,
     vertexShader:'varying vec3 direction;void main(){direction=position;vec4 p=projectionMatrix*mat4(mat3(viewMatrix))*vec4(position,1.);gl_Position=p.xyww;}',
     fragmentShader:`uniform sampler2D oldSky;uniform samplerCube newSky;uniform float mixAmount;uniform mat3 rotation;varying vec3 direction;
      #include <common>
      void main(){vec3 d=normalize(direction);vec3 color=textureCube(newSky,rotation*d).rgb*.94;if(mixAmount<.9999)color=mix(texture2D(oldSky,equirectUv(d)).rgb,color,mixAmount);gl_FragColor=vec4(color,1.);
      #include <colorspace_fragment>
      }`});
    dome=new T.Mesh(new T.BoxGeometry(5,5,5),blendMaterial);dome.frustumCulled=false;dome.renderOrder=-10000;dome.visible=false;dome.name='NatureSkyBackground';status.readyMs=performance.now()-started;status.state='ready';return target.texture;
   }catch{target?.dispose();target=null;status.state='fallback';status.readyMs=performance.now()-started;return null;}
   finally{clearTimeout(timer);mesh?.geometry.dispose();material?.dispose();source?.dispose();bitmap?.close();}
  })();return preparation;
 }
 return{prepare,authorize(){if(status.state==='ready')authorized=true;},update(scene,base,settings){if(status.state==='ready'&&!authorized&&skyCameraCovered(settings.camera,settings.stations)&&skyBlendAt(settings.camera[0])===0)authorized=true;const active=policy.update(settings)&&status.state==='ready'&&authorized;status.active=active;status.blend=active?policy.blend:0;status.rotation=305*Math.PI/180;if(dome){if(dome.parent!==scene)scene.add(dome);dome.visible=active;if(active&&!transitionSource){
// Share the GPU image allocated with LinearFilter by the existing equirectangular conversion.
transitionSource=base.clone();transitionSource.minFilter=T.LinearFilter;transitionSource.needsUpdate=true;}dome.material.uniforms.oldSky.value=transitionSource;dome.material.uniforms.mixAmount.value=status.blend;}scene.background=active?null:base;scene.backgroundRotation.y=0;scene.backgroundIntensity=1;return active;},get status(){return{...status,memory:{...memory}};},dispose(){policy.reset();target?.dispose();target=null;transitionSource?.dispose();transitionSource=null;dome?.removeFromParent();dome?.geometry.dispose();dome?.material.dispose();dome=null;status.active=false;}};
}
