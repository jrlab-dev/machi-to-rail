import {BOATS} from './boats-data.mjs?v=rail-90';
import {countryAvailable,countryGeometry} from './country-camera.mjs?v=rail-90';
import {windowCamera,frameSubject,projectPoint,projectedBounds,inSafe,boundsSafe,cameraClear,shiftVisual,facePoints,segmentHitsBox} from './camera-composition.mjs?v=rail-90';
// Fixed public viewpoints in the station district; coordinates are world-space.
export function pedestrianCrossingView(visual, carLength = 20.9) {
  const position = [187, 1.65, -300];
  const cars = visual?.cars || [];
  const onStraight = cars.filter(c => c.body?.every(Number.isFinite) &&
    c.body[1] > 260 && c.body[1] < 310 && Math.abs(Math.cos(c.body[2])) > .8);
  const reference = onStraight.reduce((best,c) => !best ||
    Math.abs(c.body[0]-185)<Math.abs(best.body[0]-185)?c:best,null);
  if (!reference) return {position, target:[185,1.65,-285], fov:65, phase:'idle'};
  const dir = Math.sign(Math.cos(reference.body[2]));
  const lead = cars[0]?.body, tail = cars.at(-1)?.body;
  if (!lead?.every(Number.isFinite) || !tail?.every(Number.isFinite))
    return {position, target:[185,1.65,-285], fov:65, phase:'idle'};
  const frontDistance = dir*(lead[0]-185);
  const rearDistance = dir*(tail[0]-185)-carLength/2;
  // Hold the crossing composition for the entire consist, including its gaps.
  const offset = Math.min(8, frontDistance) + Math.max(0, rearDistance-6);
  const target = [185+dir*offset,1.65,-reference.body[1]];
  return {position,target,fov:65,phase:frontDistance<8?'approach':rearDistance<=6?'passing':'departure'};
}

export function platformDoorView(tram = false, other = false, express = null) {
  if(express?.skipFirst){
    const doors=coachDoorPositions(express.visual,Math.abs(express.doorX));
    const door=doors.sort((a,b)=>Math.abs(a[0]-210)-Math.abs(b[0]-210))[0];
    if(door)return{position:[door[0]+2,2.65,door[2]+(other?-3.5:3.5)],target:door,fov:66};
  }
  if(express){
    const cars=express.visual?.cars||[],center=210,dir=express.visual?.service?.dir<0?-1:1;
    const positions=cars.map((car,i)=>center+dir*((cars.length-1)/2-i)*((express.carLength||27)+.45)+dir*(car.tail?-1:1)*express.doorX);
    const x=positions.filter((x,i)=>(!express.skipFirst||i>0)&&x>105&&x<315).sort((a,b)=>Math.abs(a-center)-Math.abs(b-center))[0]??210;
    return{position:[x+2,2.65,other?6.5:3.5],target:[x,2.05,other?10:0],fov:66};
  }
  const view=tram
    ? {position: [218, 2.65, 4.5], target: [213.3, 1.9, 0], fov: 66}
    : {position: [228, 2.65, 4.5], target: [227, 1.9, 0], fov: 66};
  if(other){for(const key of ['position','target']){view[key][0]=420-view[key][0];view[key][2]=10-view[key][2];}}
  if(other){if(tram)view.position[2]=7;else{view.position=[228,2.65,5.5];view.target=[227,1.9,10];}}
  return view;
}
export function coachDoorPositions(visual,doorX=8.1){
  return(visual?.cars||[]).slice(1).flatMap(car=>[-doorX,doorX].map(x=>{const p=car.body;return[p[0]+Math.cos(p[2])*x,(p[3]||0)+2.05,-p[1]-Math.sin(p[2])*x];}));
}

export function landscapePose(v,candidate,profile={}){
 const raw=windowCamera(v,candidate.mode,{...profile,...candidate.windowProfile},candidate.subject==='sea'?[v.body[0],(v.body[3]||0)+2.32,candidate.side>0?12000:-12800]:candidate.aim);
 return{...raw,target:raw.target.map((x,i)=>x+candidate.targetOffset[i]),fov:candidate.pose.fov};
}
const CABIN_BOXES=[];
const cabinBox=(x,y,z,w,h,d)=>CABIN_BOXES.push({min:[x-w/2,y-h/2,z-d/2],max:[x+w/2,y+h/2,z+d/2]});
cabinBox(0,3.35,0,19,.12,2.9);cabinBox(0,1.08,0,19,.1,2.8);
for(const side of[-1,1]){
 cabinBox(0,1.43,side*1.43,19,.53,.06);cabinBox(0,3.14,side*1.43,19,.23,.06);
 for(const x of[-9,-6,-3,0,3,6,9])cabinBox(x,2.36,side*1.43,.11,1.35,.08);
 cabinBox(0,1.98,side*1.36,19,.07,.16);cabinBox(0,3.02,side*.79,17,.055,.055);
 for(const x of[-6,-4.5,-3,-1.5,0,1.5,3,4.5,6]){cabinBox(x,2.86,side*.79,.035,.29,.035);cabinBox(x,2.635,side*.79,.218,.218,.028);}
}
export function cabinSightClear(v,pose,points,options={}){
 const p=v.body,c=Math.cos(p[2]),s=Math.sin(p[2]),scale=options.tram?[.62,.92,.78]:[1,1,1],local=q=>{const x=q[0]-p[0],z=q[2]+p[1];return[(c*x-s*z)/scale[0],(q[1]-(p[3]||0))/scale[1],(s*x+c*z)/scale[2]];},from=local(pose.position);
 if(Math.abs(from[0])>=9.5||Math.abs(from[2])>=1.43||from[1]<=1.13||from[1]>=3.29)return false;
 return points.every(point=>{const to=local(point);return !CABIN_BOXES.some(box=>segmentHitsBox(from,to,box));});
}
function landscapeVisible(v,candidate,options){
 if(!countryAvailable(v)||options.phase==='night'||options.viewport.height<200)return false;
 if(candidate.subject!=='mountain'&&countryGeometry(v).z<=-400)return false;
 const pose=options.poseOverride||landscapePose(v,candidate,options.profile),vp=options.viewport,r=vp.safe;
 if(!cameraClear(pose,candidate.aim,options.obstacles))return false;
 if(candidate.subject==='mountain'){
  const peak=projectPoint([3200,780,-3400],pose,vp),snow=projectPoint([3200,550,-3100],pose,vp),base=projectPoint([3200,80,-3400],pose,vp);
  return inSafe(peak,vp)&&inSafe(snow,vp)&&base.depth>0&&base.y-peak.y>=(r.bottom-r.top)*.15&&cabinSightClear(v,pose,[[3200,780,-3400],[3200,550,-3100]],options);
 }
 if(candidate.subject==='boat'){
  const b=candidate.boat,c=Math.cos(b.yaw),s=Math.sin(b.yaw),points=[-1,1].flatMap(end=>[0,b.height].map(y=>[b.x+c*end*b.length/2,y,b.z-s*end*b.length/2])),bounds=projectedBounds(points,pose,vp);
  return !!bounds&&bounds.left>=r.left&&bounds.right<=r.right&&bounds.top>=r.top&&bounds.bottom<=r.bottom&&bounds.right-bounds.left>=(r.right-r.left)*.08&&cabinSightClear(v,pose,points,options);
 }
 return inSafe(projectPoint(candidate.aim,pose,vp),vp)&&cabinSightClear(v,pose,[[v.body[0],(v.body[3]||0)+2.32,candidate.side>0?12000:-12800]],options);
}
export function landscapeCandidates(v,options){
 if(!countryAvailable(v))return{candidates:[],rejected:['landscape-outside']};
 if(options.phase==='night')return{candidates:[],rejected:['night-landmarks-unverified']};
 if(options.viewport.height<200)return{candidates:[],rejected:['short-canvas-window-unreadable']};
 if(options.locomotive)return{candidates:[],rejected:['locomotive-window-unverified']};
 const g=countryGeometry(v),vp=options.viewport,candidates=[],rejected=[],duration=options.reducedMotion?8:6;
 const subjects=[];
 if(g.z>-400){
  const nearest=[...BOATS].sort((a,b)=>Math.hypot(a.x-g.x,a.z-g.z)-Math.hypot(b.x-g.x,b.z-g.z));
  for(const boat of nearest)subjects.push({subject:'boat',boat,aim:[boat.x,boat.height/2,boat.z]});
 }
 subjects.push({subject:'mountain',aim:[3200,380,-3400]});
 if(g.z>-400)subjects.push({subject:'sea',aim:[g.x,(v.body[3]||0)+2.32,12000]});
 for(const subject of subjects){
  const side=Math.sign(subject.aim[2]-g.z)||1,mode=side*g.dir<0?'left':'right',passengerX=options.profile?.passengerX??(options.tram?.7:1.1),passengerSide=options.tram?.74:.98;let accepted=null;
  for(const offset of[0,.5,-.5,1,-1]){
   const windowProfile={...options.profile,passengerX:passengerX+offset,passengerSide},raw=windowCamera(v,mode,windowProfile,subject.aim),pose=frameSubject(raw,subject.aim,vp),targetOffset=pose.target.map((x,i)=>x-raw.target[i]),candidate={...subject,id:'landscape-'+subject.subject+(subject.boat?'-'+subject.boat.id:''),mode,side,pose,targetOffset,windowProfile,minimum:duration,duration};
   if([0,duration/2,duration].every(t=>landscapeVisible(shiftVisual(v,g.dir*options.maxSpeed*t),candidate,options))){accepted=candidate;break;}
  }
  if(accepted)candidates.push(accepted);else rejected.push('landscape-'+subject.subject+'-projection-or-window-occlusion');
 }
 return{candidates,rejected};
}
export function landscapeSafe(v,candidate,options){return landscapeVisible(v,candidate,options);}

export function serviceExteriorPose(v,candidate){
 const p=v.body,c=Math.cos(p[2]),s=Math.sin(p[2]),world=a=>[p[0]+c*a[0]+s*a[2],(p[3]||0)+a[1],-p[1]-s*a[0]+c*a[2]];
 return{position:world(candidate.localPosition),target:world(candidate.localTarget),fov:candidate.pose.fov};
}
export function serviceExteriorCandidate(v,options){
 if(options.phase==='night'&&options.locomotive)return{rejected:'night-locomotive-exterior-unverified'};
 const p=v.body,c=Math.cos(p[2]),s=Math.sin(p[2]),world=a=>[p[0]+c*a[0]+s*a[2],(p[3]||0)+a[1],-p[1]-s*a[0]+c*a[2]],local=a=>{const x=a[0]-p[0],z=a[2]+p[1];return[c*x-s*z,a[1]-(p[3]||0),s*x+c*z];},f=options.viewport.portrait?1.4:1;
 const low=options.locomotive&&options.atStation&&Math.abs(p[1])<24,position=world(low?[options.carLength/2+16,3.4,-3.8]:[options.carLength/2+26*f,18*f,8]),face=facePoints(v,options.carLength,options.carHeight),subject=face.reduce((a,b)=>a.map((x,i)=>x+b[i]/face.length),[0,0,0]);
 for(const fov of[48,42,36,30]){const pose=frameSubject({position,target:world(low?[3,2.2,0]:[0,2,0]),fov},subject,options.viewport),bounds=projectedBounds(face,pose,options.viewport);
  if(!boundsSafe(bounds,options.viewport)||bounds.bottom-bounds.top<(options.viewport.portrait?20:18)||!cameraClear(pose,subject,options.obstacles))continue;
  return{id:'departure',mode:'front-exterior',minimum:5,duration:5,pose,localPosition:local(pose.position),localTarget:local(pose.target),metrics:{faceHeight:bounds.bottom-bounds.top}};
 }
 return{rejected:'service-exterior-projection-or-occlusion'};
}
export function serviceExteriorSafe(v,candidate,options){
 if(options.phase==='night'&&options.locomotive)return false;
 const pose=options.poseOverride||serviceExteriorPose(v,candidate),points=facePoints(v,options.carLength,options.carHeight),bounds=projectedBounds(points,pose,options.viewport),subject=points.reduce((a,b)=>a.map((x,i)=>x+b[i]/points.length),[0,0,0]);
 return boundsSafe(bounds,options.viewport)&&bounds.bottom-bounds.top>=(options.viewport.portrait?20:18)&&cameraClear(pose,subject,options.obstacles);
}
