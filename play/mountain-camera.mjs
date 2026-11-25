import {cameraBasis} from './camera-composition.mjs';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]),length=a=>Math.hypot(...a);
function corners(cars,carLength){return cars.flatMap(({body:p})=>[-1,1].flatMap(end=>[-1,1].flatMap(side=>[0,4].map(h=>{const x=end*carLength/2,c=Math.cos(p[2]),s=Math.sin(p[2]),g=p[4]||0,a=x*Math.cos(g)-h*Math.sin(g);return [p[0]+c*a+s*side*1.8,(p[3]||0)+x*Math.sin(g)+h*Math.cos(g),-p[1]-s*a+c*side*1.8];}))));}
function fit(position,target,points,aspect,fov){
 const basis=cameraBasis({position,target}),t=Math.tan(fov*Math.PI/360)*.86;
 let distance=length(sub(position,target));
 for(const p of points){const d=sub(p,target),depth=dot(d,basis.forward);distance=Math.max(distance,Math.abs(dot(d,basis.right))/(t*aspect)-depth,Math.abs(dot(d,basis.up))/t-depth);}
 return target.map((x,i)=>x-basis.forward[i]*distance);
}
export function clearMountainTerrain(position,target,height,steps=20){
 const next=[...position];
 // Sample the ground along the line from the camera to the subject.
 for(let i=0;i<steps;i++){const t=i/steps,x=next[0]*(1-t)+target[0]*t,z=next[2]*(1-t)+target[2]*t,margin=i===0?2:1;next[1]=Math.max(next[1],(height(x,-z)+margin-target[1]*t)/(1-t));}
 return next;
}
export function mountainExteriorCamera(v,mode,{carLength=20.9,aspect=1.6,height=()=>0,anchor=null}={}){
 const cars=v.cars?.length?v.cars:[{body:v.body}],p=v.body||cars[0].body,center=[0,0,0];
 for(const c of cars){center[0]+=c.body[0]/cars.length;center[1]+=(c.body[3]||0)/cars.length;center[2]-=c.body[1]/cars.length;}
 const target=[center[0],center[1]+2,center[2]],dx=Math.cos(p[2]),dy=Math.sin(p[2]),front=mode==='follow'?-1:1,fov=50;
 const offset=carLength*.6+17,side=18;
 let position=[center[0]+front*dx*offset+dy*side*dx,center[1]+10,center[2]-front*dy*offset+dx*side*dx];
 const anchorRange=aspect<1?65:50;
 const anchored=mode==='trackside'&&anchor&&anchor.every(Number.isFinite)&&Math.hypot(anchor[0]-target[0],anchor[2]-target[2])<=anchorRange&&Math.hypot(anchor[0]-target[0],anchor[2]-target[2])>=10&&Math.abs(anchor[1]-target[1])<40;
 if(anchored)position=[...anchor];
 const points=corners(cars,carLength);
 // Fit the two cars to the viewport instead of multiplying all offsets for phones.
 for(let i=0;i<2;i++){position=fit(position,target,points,Math.max(.3,aspect),fov);position=clearMountainTerrain(position,target,height);}
 return {position,target,fov,anchor:mode==='trackside'?position:null};
}

// Follow the train immediately while easing changes of the camera's relative offset.
export function smoothMountainCamera(shot,previous,dt,height=()=>0){
 if(!previous||Math.hypot(...shot.target.map((x,i)=>x-previous.target[i]))>20)return shot;
 const alpha=1-Math.exp(-Math.max(0,Math.min(.1,dt))*7),offset=shot.position.map((x,i)=>x-shot.target[i]),old=previous.position.map((x,i)=>x-previous.target[i]);
 const position=clearMountainTerrain(shot.target.map((x,i)=>x+old[i]+(offset[i]-old[i])*alpha),shot.target,height);
 return {...shot,position};
}

export function mountainSceneryCamera(v,{carLength=20.9,aspect=1.6,height=()=>0}={}){
 const cars=v.cars?.length?v.cars:[{body:v.body}],center=[0,0,0];
 for(const car of cars){center[0]+=car.body[0]/cars.length;center[1]+=(car.body[3]||0)/cars.length;center[2]-=car.body[1]/cars.length;}
 const scenery=[235,34,-100],dx=scenery[0]-center[0],dz=scenery[2]-center[2],distance=Math.hypot(dx,dz),blend=Math.min(1,distance/140);
 // Near the lower station keep looking down-valley, without rotating around a nearby point.
 let x=dx/Math.max(1,distance)*blend,z=dz/Math.max(1,distance)*blend+1-blend;const norm=Math.hypot(x,z)||1;x/=norm;z/=norm;
 const subject=[center[0],center[1]+2,center[2]],target=[center[0]+x*32,center[1]+6,center[2]+z*32],fov=50;
 let position=[center[0]-x*85,center[1]+47,center[2]-z*85];
 const points=[...corners(cars,carLength),scenery];
 for(let i=0;i<5;i++){position=clearMountainTerrain(position,subject,height,20);for(const c of cars)position=clearMountainTerrain(position,[c.body[0],c.body[3]+2,-c.body[1]],height,20);position=fit(position,target,points,Math.max(.3,aspect),fov);}
 return {position,target,fov};
}
