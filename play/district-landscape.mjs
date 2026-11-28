import {sampleRoute,distanceOnRoute,formationOccupiesDistance} from './core.mjs?v=rail-94';

export const CROSSING={uid:900001,x:185,y:280,outerY:290,width:6};
export function crossingDistance(route,y){
  for(const p of route.parts){
    if(p.r.kind!=='line')continue;
    const a=sampleRoute(route,p.start),b=sampleRoute(route,p.start+p.r.length);
    if(Math.abs(a[1]-y)<.01&&Math.abs(b[1]-y)<.01&&CROSSING.x>=Math.min(a[0],b[0])&&CROSSING.x<=Math.max(a[0],b[0]))return p.start+Math.abs(CROSSING.x-a[0]);
  }
  throw Error('ふみきりを置ける直線がありません');
}
export function crossingDemand(route,state,formation,cross,carLength){
  const ahead=distanceOnRoute(route,cross,state.s)*state.dir;
  return formationOccupiesDistance(route,state,formation,cross,carLength,.45,9)||(ahead>=0&&ahead<Math.max(65,state.speed*7+carLength/2));
}
export function advanceCrossing(gate,trains,formation,dt,carLength){
  const alarm=trains.some(t=>crossingDemand(t.route,t.state,t.formation||formation,t.cross,t.carLength??carLength));
  const clear=alarm?0:gate.clear+dt;
  return{alarm,clear,angle:Math.max(0,Math.min(1,gate.angle+(alarm?-dt/1.4:clear>1?dt/2:0)))};
}

// Continuous terrain: broad ridges carry smaller branching spurs and valleys.
export function mountainHeight(x,t,layer){
  const phase=layer*2.17;
  const ridge=.50+.20*Math.sin(x*.0031+phase)+.15*Math.sin(x*.0073+1.8+phase)+.08*Math.sin(x*.0191+phase)+.035*Math.sin(x*.047+2);
  const crest=.53+.09*Math.sin(x*.0023+phase);
  const slope=Math.max(0,1-Math.abs(t-crest)/(t<crest?crest:1-crest));
  const spurs=1+.13*Math.sin(x*.015+t*14+phase)+.055*Math.sin(x*.042-t*18);
  return Math.max(0,(220+layer*90)*ridge*Math.pow(slope,1.2)*spurs);
}
