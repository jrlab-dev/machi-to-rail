import {cameraBasis,projectedBounds,boundsSafe,segmentHitsBox} from './camera-composition.mjs?v=rail-90';

// Bounds are read from the closed, prepared door leaves; motion and meshes are untouched.
export function pairDoorLeaves(leaves){
 const remaining=leaves.filter(d=>d.min?.every(Number.isFinite)&&d.max?.every(Number.isFinite)).map((d,index)=>({...d,index})),doors=[];
 while(remaining.length){const a=remaining.shift(),ax=(a.min[0]+a.max[0])/2;let best=-1,distance=Infinity;
  remaining.forEach((b,i)=>{const dx=Math.abs((b.min[0]+b.max[0])/2-ax);if(b.side===a.side&&b.half!==a.half&&dx<2.4&&dx<distance){best=i;distance=dx;}});
  const pair=best<0?[a]:[a,remaining.splice(best,1)[0]],min=[0,1,2].map(i=>Math.min(...pair.map(d=>d.min[i]))),max=[0,1,2].map(i=>Math.max(...pair.map(d=>d.max[i]))),sweepMin=[...min],sweepMax=[...max];
  sweepMin[0]=Math.min(...pair.map(d=>d.min[0]+Math.min(0,d.half*d.travel)));sweepMax[0]=Math.max(...pair.map(d=>d.max[0]+Math.max(0,d.half*d.travel)));
  doors.push({id:a.side+':'+doors.length,side:a.side,leafCount:pair.length,min,max,sweepMin,sweepMax,center:min.map((x,i)=>(x+max[i])/2)});
 }
 return doors;
}
function doorWorld(car,point){const p=car.body,a=p[2]+(car.tail?Math.PI:0),c=Math.cos(a),s=Math.sin(a);return[p[0]+c*point[0]+s*point[2],(p[3]||0)+point[1],-p[1]-s*point[0]+c*point[2]];}
function sweptCorners(car,door){return[-1,1].flatMap(x=>[-1,1].map(y=>doorWorld(car,[x<0?door.sweepMin[0]:door.sweepMax[0],y<0?door.min[1]:door.max[1],door.center[2]])));}
function frameDoor(position,target,corners,fov,viewport){
 let pose={position,target:[...target],fov};const r=viewport.safe;
 for(let iteration=0;iteration<12;iteration++){const b=projectedBounds(corners,pose,viewport);if(!b)break;const basis=cameraBasis(pose),scale=2*Math.hypot(...pose.target.map((x,i)=>x-position[i]))*Math.tan(fov*Math.PI/360)/viewport.height,dx=((b.left+b.right)-(r.left+r.right))/2,dy=((r.top+r.bottom)-(b.top+b.bottom))/2;
  pose.target=pose.target.map((x,i)=>x+(basis.right[i]*dx+basis.up[i]*dy)*scale*.65);
 }
 return pose;
}
function platformPosts(centerX,platform,elevated){
 const xs=elevated?Array.from({length:15},(_,i)=>-112+i*16).filter(x=>Math.abs(x)>=20).map(x=>centerX+x):Array.from({length:13},(_,i)=>126+i*14);
 const bottom=elevated?9.06:1.05,top=elevated?13.06:4.25;
 const boxes=xs.map(x=>({min:[x-.12,bottom,platform-.12],max:[x+.12,top,platform+.12]}));
 if(elevated){
  // The island centre is an open stairwell enclosed by glass, not standing space.
  boxes.push({min:[centerX-17,0,platform-1.5],max:[centerX+17,12.6,platform+1.5]});
  boxes.push({min:[centerX-99.65,9.05,platform-1.25],max:[centerX-90.35,11.7,platform+1.25]});
 }else boxes.push({min:[187,.8,3.5],max:[205,8.4,6.5]});
 return boxes;
}
export function platformDoorShot(visual,doorSets,{centerX=210,platform=5,elevated=false,steam=false,viewport,selection=null}={}){
 const candidates=[],posts=platformPosts(centerX,platform,elevated);
 for(let carIndex=0;carIndex<(visual?.cars?.length||0);carIndex++){
  const car=visual.cars[carIndex],p=car.body;if(steam&&carIndex===0)continue;
  if(!p?.every(Number.isFinite)||Math.abs(p[1])>=24||Math.abs(p[0]-centerX)>155)continue;
  const angle=p[2]+(car.tail?Math.PI:0),side=Math.sign((platform+p[1])*Math.cos(angle));
  for(const door of doorSets[carIndex]||[]){if(door.side!==side)continue;if(selection&&(selection.carIndex!==carIndex||selection.doorId!==door.id))continue;
   const target=doorWorld(car,door.center);if(Math.abs(target[0]-centerX)>125)continue;
   candidates.push({car,carIndex,door,target,angle,score:Math.abs(target[0]-centerX)});
  }
 }
 candidates.sort((a,b)=>a.score-b.score||a.carIndex-b.carIndex||a.door.id.localeCompare(b.door.id));
 for(const corridor of[false,true])for(const candidate of candidates){const {car,carIndex,door,target,angle}=candidate,c=Math.cos(angle),s=Math.sin(angle),normal=[s*door.side,0,c*door.side],axis=[c,0,-s],distance=corridor?Math.abs(platform-target[2])-1.55:2.7,offset=distance*Math.tan(25*Math.PI/180),corners=sweptCorners(car,door);
  if(distance<1)continue;
  for(const along of[1,-1]){const position=target.map((x,i)=>x+normal[i]*distance+axis[i]*offset*along+(i===1?.12:0));
   if(Math.abs(position[2]-platform)>(elevated?2.4:2.9)||Math.abs(position[0]-centerX)>129)continue;
   if(corners.some(point=>posts.some(box=>segmentHitsBox(position,point,box))))continue;
   for(const fov of[54,60,66,72,78,84,90,96,102,108,114]){const pose=frameDoor(position,target,corners,fov,viewport),bounds=projectedBounds(corners,pose,viewport),r=viewport.safe;
    if(!boundsSafe(bounds,viewport)||bounds.bottom-bounds.top<Math.min(90,(r.bottom-r.top)*.55))continue;
    return{...pose,selection:{carIndex,doorId:door.id},door:{center:target,corners,side:door.side,carIndex,id:door.id,leafCount:door.leafCount},angle:25};
   }
  }
 }
 return null;
}

// Mountain platforms follow each car's local orientation and elevation.
export function mountainDoorShot(visual,doorSets,{platform,viewport}={}){
 for(let i=0;i<(visual?.cars?.length||0);i++){
  const car=visual.cars[i],p=car.body,a=p[2]+(car.tail?Math.PI:0),z=typeof platform==='function'?platform(car):platform;
  // 数なら今まで通り。{side} の形（自由編集の駅）なら側をそのまま使う：0＝この車両はホームの外、2＝両側。
  const sides=z&&typeof z==='object'?(z.side===2?[1,-1]:z.side?[z.side]:[]):[Math.sign((z+p[1])*Math.cos(a))||1];
  let door=null,side=0;for(const k of sides){door=(doorSets[i]||[]).filter(d=>d.side===k).sort((a,b)=>Math.abs(a.center[0])-Math.abs(b.center[0]))[0];if(door){side=k;break;}}
  if(!door)continue;
  const target=doorWorld(car,door.center),normal=[Math.sin(a)*side,0,Math.cos(a)*side],axis=[Math.cos(a),0,-Math.sin(a)],position=target.map((x,k)=>x+normal[k]*2.7+axis[k]*1.1+(k===1?.12:0)),corners=sweptCorners(car,door);
  for(const fov of [54,66,78,90,102,114]){const pose=frameDoor(position,target,corners,fov,viewport);if(boundsSafe(projectedBounds(corners,pose,viewport),viewport))return {...pose,selection:{carIndex:i,doorId:door.id}};}
 }
 return null;
}
