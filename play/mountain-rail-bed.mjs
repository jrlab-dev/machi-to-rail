import {riverNearest,riverWidth,mountainSurfaceHeight} from './mountain-data.mjs?v=retro-87';
export const onMainMountainBridge=(x,y)=>y>710&&x>140&&x<405;
export function onMountainRiverBridge(x,y,railHeight){
 if(onMainMountainBridge(x,y))return true;
 const river=riverNearest(x,y);
 return river.distance<riverWidth(river.y)/2+35&&railHeight-river.height>12;
}
export function mountainBedSection(p,yaw){
 return [-3.5,-2,2,3.5].map(side=>{
  const x=p[0]-Math.sin(yaw)*side,y=p[1]+Math.cos(yaw)*side,outer=Math.abs(side)>2;
  const bridge=onMountainRiverBridge(p[0],p[1],p[2])||onMountainRiverBridge(x,y,p[2]);
  return [x,outer?(bridge?p[2]-1.2:Math.min(p[2]-1.2,mountainSurfaceHeight(x,y)-.08)):p[2]-.2,-y];
 });
}
export function mountainRiverSpans(points){
 const spans=[];let start=null;
 for(let i=0;i<=points.length;i++){
  const p=points[i],bridge=p&&!onMainMountainBridge(p[0],p[1])&&onMountainRiverBridge(...p);
  if(bridge&&start===null)start=Math.max(0,i-1);
  if(!bridge&&start!==null){spans.push(points.slice(start,Math.min(points.length,i+1)));start=null;}
 }
 return spans.filter(points=>points.length>1);
}
