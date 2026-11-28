import {STATIONS,platformZ} from './intercity-stations.mjs?v=rail-94';
// Keep a platform view aimed at an actual vehicle rather than a passenger doorway.
export function freightPlatformView(visual,elevated=false,other=false,portrait=false){
 const cars=visual.cars||[],p=cars[0]?.body||visual.body||[210,0,0],center=elevated?STATIONS.reduce((a,b)=>Math.abs(a.x-p[0])<Math.abs(b.x-p[0])?a:b).x:210;
 const near=cars.filter(c=>Math.abs(c.body[0]-center)<130&&Math.abs(c.body[1])<24);
 const ref=near[0]?.body,level=elevated?8:0,platform=elevated?platformZ(ref||p):5;
 if(!ref)return{position:[center+18,level+3,platform],target:[center,level+2,other?10:0],fov:60};
 const dir=Math.sign(Math.cos(ref[2]))||1,track=-ref[1];
 return{position:[ref[0]+dir*(portrait?21:18),level+3.2,platform],target:[ref[0]+dir*3,level+2.2,track],fov:portrait?68:64};
}
