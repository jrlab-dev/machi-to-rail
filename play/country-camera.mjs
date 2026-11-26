import {frameSubject,facePoints,consistPoints,projectPoint,projectedBounds,boundsSafe,cameraClear,shiftVisual} from './camera-composition.mjs?v=rail-90';
// Fifteen metres covers the longest half-car plus its lateral extent on straight track.
export function countryAvailable(v){return !!v?.cars?.length&&v.cars.every(c=>c.body[0]-15>1450&&c.body[0]+15<4550&&Math.abs(Math.sin(c.body[2]))<.01);}
export function countryGeometry(v){const cars=v.cars,p=v.body||cars[0].body,dir=Math.sign(Math.cos(p[2]))||1;return{dir,x:cars.reduce((s,c)=>s+c.body[0],0)/cars.length,z:-p[1],y:p[3]||0,lead:dir>0?Math.max(...cars.map(c=>c.body[0])):Math.min(...cars.map(c=>c.body[0]))};}
export function countryAuto(v){if(!countryAvailable(v))return 'front';const g=countryGeometry(v),progress=g.dir>0?g.x:6000-g.x;return progress>=2250&&progress<2900?'trackside':'front-exterior';}
export function countryAnchor(v,portrait=false){const g=countryGeometry(v);return[g.x+g.dir*140,g.y+22,g.z+(g.z>-400?1:-1)*(portrait?75:70)];}
export function countryCamera(v,mode,anchor,portrait){const g=countryGeometry(v),side=g.z>-400?1:-1;
 if(mode==='trackside')return{position:anchor,target:[g.x,g.y+2,g.z],fov:portrait?58:68};
 const scale=portrait?1.6:1;return{position:[g.lead+g.dir*50*scale,g.y+20*scale,g.z+side*36*scale],target:[g.lead-g.dir*20,g.y+2,g.z],fov:portrait?64:54};
}

export function countryExtent(v,carLength=20.9){
 const g=countryGeometry(v),ends=v.cars.flatMap(c=>[-1,1].map(end=>g.dir*(c.body[0]+Math.cos(c.body[2])*carLength/2*end)));
 return{...g,front:Math.max(...ends),rear:Math.min(...ends),center:g.dir*g.x,section:g.z>-400?'outbound':'inbound'};
}
export function countryRemaining(v,maxSpeed,carLength=20.9){if(!countryAvailable(v))return 0;const g=countryExtent(v,carLength),edge=g.dir>0?4550:-1450;return Math.max(0,(edge-Math.max(...v.cars.map(c=>g.dir*c.body[0]+15)))/Math.max(5,maxSpeed));}

// Conservative collision envelopes cover the fixed tunnel portals, deck and parapets.
// City obstacles are supplied once from the edited town's building footprints.
export function countryObstacles(stations=true){
 const boxes=[];
 for(const center of[stations?4.5:2.5,-800-(stations?4.5:2.5)]){
  const radius=stations?23:15.5;
  for(const x of[800,4800])boxes.push({min:[x-2,7.1,center-radius-3],max:[x+402,100,center+radius+3]});
  boxes.push({min:[1200,6.55,center-(stations?17:11)],max:[4800,7.55,center+(stations?17:11)]});
  for(const side of[-1,1]){const z=center+side*(stations?16.5:10.5);boxes.push({min:[1200,7.55,z-.2],max:[4800,8.7,z+.2]});}
 }
 return boxes;
}
export function heroCandidate(v,{viewport,carLength=20.9,carHeight=3.3,obstacles=[],phase='day',locomotive=false}={}){
 if(!countryAvailable(v))return{rejected:'consist-outside'};
 if(phase==='night'&&locomotive)return{rejected:'night-locomotive-exterior-unverified'};
 const g=countryGeometry(v),base=countryCamera(v,'front-exterior',null,viewport.portrait),face=facePoints(v,carLength,carHeight),subject=face.reduce((s,p)=>s.map((x,i)=>x+p[i]/face.length),[0,0,0]);
 if(viewport.portrait)base.position=[g.lead+g.dir*36,g.y+12,g.z+(g.z>-400?1:-1)*26];
 const minimum=viewport.portrait?20:18;
 for(const fov of[base.fov,54,48,42,36,30]){
  const shot=frameSubject({...base,fov},subject,viewport),bounds=projectedBounds(face,shot,viewport);
  if(!boundsSafe(bounds,viewport)||bounds.bottom-bounds.top<minimum)continue;
  const faceCenter=projectPoint(subject,shot,viewport),ahead=projectPoint([subject[0]+g.dir*5,subject[1],subject[2]],shot,viewport),leadRoom=ahead.x>=faceCenter.x?viewport.safe.right-bounds.right:bounds.left-viewport.safe.left;
  if(leadRoom<(viewport.safe.right-viewport.safe.left)*.15)continue;
  if(!cameraClear(shot,subject,obstacles))continue;
  const side=Math.sign(shot.position[2]-g.z)||1;
  return{id:'hero',mode:'front-exterior',pose:shot,side,minimum:5,duration:5,offset:shot.position.map((x,i)=>x-[g.lead,g.y,g.z][i]),targetOffset:shot.target.map((x,i)=>x-[g.lead,g.y,g.z][i]),metrics:{faceHeight:bounds.bottom-bounds.top,leadRoomFraction:leadRoom/(viewport.safe.right-viewport.safe.left)}};
 }
 return{rejected:'hero-face-projection-or-occlusion'};
}
function passProjection(v,pose,viewport,carLength,carHeight){
 const b=projectedBounds(consistPoints(v,carLength,carHeight),pose,viewport),r=viewport.safe;
 if(!b)return false;
 const visibleWidth=Math.max(0,Math.min(r.right,b.right)-Math.max(r.left,b.left));
 return visibleWidth>=(r.right-r.left)*.2&&b.bottom-b.top>=12&&b.bottom>r.top&&b.top<r.bottom;
}
export function passCandidate(v,{viewport,carLength=20.9,carHeight=3.3,obstacles=[],anchorAxis=null,reducedMotion=false,reframe=null,phase='day',locomotive=false}={}){
 if(!countryAvailable(v))return{rejected:'consist-outside'};
 if(phase==='night'&&locomotive)return{rejected:'night-locomotive-exterior-unverified'};
 if(reducedMotion)return{rejected:'reduced-motion'};
 const speed=Math.abs(v.speed||0)||(reframe?.speed||0),g=countryExtent(v,carLength),axis=anchorAxis??g.center+140,approach=axis-g.front,duration=reframe?.duration??((axis-g.rear)/Math.max(.001,speed)+.8);
 if(!reframe&&(speed<5||approach<=0||duration<4||duration>10))return{rejected:'pass-duration-or-approach'};
 const side=g.z>-400?1:-1,minimumSide=Math.max(viewport.portrait?75:70,speed/(25*Math.PI/180)*1.05);
 for(const distance of[minimumSide,minimumSide*1.18,minimumSide*1.5,minimumSide*2])for(const fov of[42,36,30,24,18]){
  const anchor=[g.dir*axis,g.y+22,g.z+side*distance],raw={position:anchor,target:[g.x,g.y+2,g.z],fov},pose=frameSubject(raw,raw.target,viewport),targetOffset=pose.target.map((x,i)=>x-raw.target[i]);
  const samples=[0,Math.max(0,axis-g.center),Math.max(0,axis-g.rear)].map(delta=>shiftVisual(v,g.dir*delta));
  const panDegrees=speed/Math.hypot(anchor[1]-pose.target[1],anchor[2]-pose.target[2])*180/Math.PI;
  if(panDegrees>25)continue;
  const valid=samples.every(sample=>{const q=countryGeometry(sample),p={...pose,target:[q.x+targetOffset[0],q.y+2+targetOffset[1],q.z+targetOffset[2]]};return countryAvailable(sample)&&passProjection(sample,p,viewport,carLength,carHeight)&&cameraClear(p,[q.x,q.y+2,q.z],obstacles);});
  if(!valid)continue;
  return{id:'pass',mode:'trackside',pose,anchor,axis,side,speed,minimum:4,duration,targetOffset,metrics:{panDegrees,duration,axis,approach}};
 }
 return{rejected:'pass-projection-or-occlusion'};
}
export function countryShotPose(v,candidate){const g=countryGeometry(v);if(candidate.id==='pass')return{position:candidate.anchor,target:[g.x+candidate.targetOffset[0],g.y+2+candidate.targetOffset[1],g.z+candidate.targetOffset[2]],fov:candidate.pose.fov};return{position:[g.lead+candidate.offset[0],g.y+candidate.offset[1],g.z+candidate.offset[2]],target:[g.lead+candidate.targetOffset[0],g.y+candidate.targetOffset[1],g.z+candidate.targetOffset[2]],fov:candidate.pose.fov};}
export function countryShotSafe(v,candidate,options){
 if(!countryAvailable(v))return false;
 if(options.phase==='night'&&options.locomotive)return false;
 const pose=options.poseOverride||countryShotPose(v,candidate),g=countryGeometry(v);
 if(!cameraClear(pose,[candidate.id==='hero'?g.lead:g.x,g.y+2,g.z],options.obstacles))return false;
 if(candidate.id==='hero'){const b=projectedBounds(facePoints(v,options.carLength,options.carHeight),pose,options.viewport);return boundsSafe(b,options.viewport)&&b.bottom-b.top>=(options.viewport.portrait?20:18);}
 // The 0.8 s farewell is allowed after the consist has passed the anchor.
 const extent=countryExtent(v,options.carLength);return (!options.poseOverride&&extent.rear>=candidate.axis)||passProjection(v,pose,options.viewport,options.carLength,options.carHeight);
}
