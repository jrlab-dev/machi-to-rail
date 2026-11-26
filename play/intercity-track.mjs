import {sampleRoute} from './core.mjs?v=rail-90';

export function trackSamples(route){
 const distances=[];for(const part of route.parts){const count=Math.ceil(part.r.length/(part.r.kind==='line'?40:2));for(let i=0;i<count;i++)distances.push(part.start+part.r.length*i/count);}
 distances.push(route.length);return distances.map(d=>({d,pose:sampleRoute(route,d)}));
}
// Adjacent sections share exactly the same cross-section; no overlapping boxes.
export function trackRibbon(samples,{offset=0,width,height,thickness,skip}){
 const positions=[],normals=[],indices=[],profile=[[offset-width/2,height-thickness/2],[offset+width/2,height-thickness/2],[offset+width/2,height+thickness/2],[offset-width/2,height+thickness/2]];
 for(let face=0;face<4;face++){
  const base=positions.length/3;
  for(const {pose:p} of samples){const s=Math.sin(p[2]),c=Math.cos(p[2]),normal=face===0?[0,-1,0]:face===2?[0,1,0]:face===1?[s,0,c]:[-s,0,-c];
   for(const vertex of [profile[face],profile[(face+1)%4]]){positions.push(p[0]+s*vertex[0],vertex[1],-p[1]+c*vertex[0]);normals.push(...normal);}
  }
  for(let i=0;i<samples.length-1;i++){if(skip?.(samples[i],samples[i+1]))continue;const a=base+i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
 }
 return{positions,normals,indices};
}
