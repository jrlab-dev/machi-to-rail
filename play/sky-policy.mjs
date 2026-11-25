export const SKY_FACE_SIZE=512,SKY_SOURCE_WIDTH=1774,SKY_SOURCE_HEIGHT=887,SKY_SOURCE_BYTES=234396;
export function skyImageBudget(face=SKY_FACE_SIZE){
 let mipPixels=0;for(let size=face;size>=1;size=Math.floor(size/2))mipPixels+=size*size;
 const cube=mipPixels*6*4,source=SKY_SOURCE_WIDTH*SKY_SOURCE_HEIGHT*4;
 // Allow an additional full decoded copy and retained browser decode cache.
 const existing={phases:3,canvas:3*1024*512*4,sourceGpu:3*2796204,cubeColor:3*8388600,cubeDepthUpper:3*6*512*512*4};existing.total=existing.canvas+existing.sourceGpu+existing.cubeColor+existing.cubeDepthUpper;
 return{face,format:'RGBA8',faces:6,depth:0,cube,source,peak:cube+source*3+SKY_SOURCE_BYTES,retained:cube+source+SKY_SOURCE_BYTES,existing,totalRetainedUpper:existing.total+cube+source+SKY_SOURCE_BYTES};
}
export function skyCameraCovered(camera,stations=true){if(!camera?.slice(0,3).every(Number.isFinite))return false;const [x,y,z]=camera,center=stations?4.5:2.5,radius=(stations?23:15.5)-1;return((x>=820&&x<=1180)||(x>=4820&&x<=5180))&&y>=8&&Math.min((z-center)**2,(z+800+center)**2)+(y-8)**2<radius**2;}
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function skyBlendAt(x){return Math.min(smooth((x-900)/200),smooth((5100-x)/200));}
export function createSkyRegionPolicy(){let blend=0;return{reset(){blend=0;},update({intercity=false,day=false,light=false,editing=false,body,camera}){
 if(!intercity||!day||light||editing||!body||!camera||!Number.isFinite(body[0])||!Number.isFinite(body[1])||!camera.slice(0,3).every(Number.isFinite)||(Math.abs(body[1])>40&&Math.abs(body[1]-800)>40)||body[0]<800||body[0]>5200){blend=0;return false;}
 blend=skyBlendAt(camera[0]);
 return blend>0;
 },get active(){return blend>0;},get blend(){return blend;}};}
