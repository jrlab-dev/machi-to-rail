import * as T from 'three';

export function createFuji(){
 const positions=[],colors=[],indices=[],slices=96,rings=24;
 const foot=new T.Color('#9aacb2'),rock=new T.Color('#70889d'),snow=new T.Color('#e6edf2');
 for(let j=0;j<=rings;j++){
  const t=j/rings;
  for(let i=0;i<=slices;i++){
   const a=i/slices*Math.PI*2,ridge=Math.sin(a*17+.6)*.019+Math.sin(a*29)*.009;
   const radius=.04+.96*Math.pow(1-t,1.3),r=1800*radius*(1+ridge*Math.sin(t*Math.PI));
   const y=780*t+(Math.sin(a*3)+Math.cos(a*7))*4*t*t;
   positions.push(Math.cos(a)*r,y,Math.sin(a)*r);
   const snowLine=.56+.036*Math.sin(a*5+.4)+.026*Math.sin(a*11)-.09*Math.pow(Math.max(0,-Math.sin(a*17+.6)),3),white=T.MathUtils.smoothstep(t,snowLine,snowLine+.045);
   const color=foot.clone().lerp(rock,T.MathUtils.smoothstep(t,.04,.4)).lerp(snow,white);
   color.multiplyScalar(1+ridge*5*Math.sin(t*Math.PI));colors.push(color.r,color.g,color.b);
  }
 }
 for(let j=0;j<rings;j++)for(let i=0;i<slices;i++){const p=j*(slices+1)+i;indices.push(p,p+slices+1,p+1,p+1,p+slices+1,p+slices+2);}
 const top=positions.length/3;positions.push(0,774,0);colors.push(snow.r*.9,snow.g*.9,snow.b*.9);
 for(let i=0;i<slices;i++)indices.push(rings*(slices+1)+i,top,rings*(slices+1)+i+1);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:1,transparent:true,depthWrite:false});
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vMountainHeight;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMountainHeight = position.y;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vMountainHeight;').replace('#include <fog_fragment>',`#ifdef USE_FOG
   float baseHaze = 1.0 - smoothstep(0.0, 340.0, vMountainHeight);
   float distanceHaze = 0.18 + 0.5 * smoothstep(1800.0, 8000.0, vFogDepth);
   gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, max(baseHaze * 0.94, distanceHaze));
   gl_FragColor.a *= smoothstep(5.0, 65.0, vMountainHeight);
  #endif`);
 };
 material.customProgramCacheKey=()=> 'fuji-distance-haze-v1';
 const root=new T.Mesh(geometry,material);root.name='mount-fuji';root.position.set(3200,-.35,-3400);
 return {root,dispose(){geometry.dispose();material.dispose();}};
}
