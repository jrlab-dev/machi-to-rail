import * as T from 'three';

// One static panorama shared by every camera; no cloud meshes or per-frame work.
export function createSky(night=false){
  const dusk=night==='sunset';night=night===true;const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,night?'#050d20':dusk?'#647c9e':'#3288d2');gradient.addColorStop(.28,night?'#101e37':dusk?'#cfa8a0':'#79b9e8');
  gradient.addColorStop(.5,night?'#17283e':dusk?'#eac4a3':'#d8e8f0');gradient.addColorStop(1,night?'#17283e':dusk?'#eac4a3':'#d8e8f0');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
  for(const [x,y,w]of night?[]:[[100,220,65],[300,230,70],[490,212,85],[740,225,75],[915,218,60]]){
    ctx.save();ctx.translate(x,y);ctx.scale(w,9);
    const cloud=ctx.createRadialGradient(0,0,.1,0,0,1);
    cloud.addColorStop(0,'rgba(255,255,255,.68)');cloud.addColorStop(.6,'rgba(255,255,255,.38)');cloud.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=cloud;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  const texture=new T.CanvasTexture(canvas);texture.mapping=T.EquirectangularReflectionMapping;
  texture.colorSpace=T.SRGBColorSpace;return texture;
}
