const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/(Math.hypot(...a)||1));
export function cameraBasis(shot){const forward=unit(sub(shot.target,shot.position)),right=unit(cross(forward,[0,1,0]));return{forward,right,up:cross(right,forward)};}
export function projectPoint(point,shot,viewport){
 const {forward,right,up}=cameraBasis(shot),delta=sub(point,shot.position),depth=dot(delta,forward),k=Math.tan(shot.fov*Math.PI/360);
 return{x:viewport.width/2+dot(delta,right)/depth/k*viewport.height/2,y:viewport.height/2-dot(delta,up)/depth/k*viewport.height/2,depth};
}
export function inSafe(point,viewport){const r=viewport.safe;return point.depth>0&&point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom;}
// The largest clear rectangle uses actual DOM boxes; no HUD dimensions are assumed.
export function safeViewport(width,height,blocked=[]){
 const base={left:width*.05,right:width*.95,top:height*.05,bottom:height*.95},boxes=blocked.filter(b=>b.right>base.left&&b.left<base.right&&b.bottom>base.top&&b.top<base.bottom);
 const xs=[base.left,base.right,...boxes.flatMap(b=>[Math.max(base.left,b.left),Math.min(base.right,b.right)])].sort((a,b)=>a-b),ys=[base.top,base.bottom,...boxes.flatMap(b=>[Math.max(base.top,b.top),Math.min(base.bottom,b.bottom)])].sort((a,b)=>a-b);
 let best={...base,right:base.left,bottom:base.top},area=0;
 for(let a=0;a<xs.length;a++)for(let b=a+1;b<xs.length;b++)for(let c=0;c<ys.length;c++)for(let d=c+1;d<ys.length;d++){
  const r={left:xs[a],right:xs[b],top:ys[c],bottom:ys[d]},size=(r.right-r.left)*(r.bottom-r.top);
  if(size<=area||boxes.some(o=>r.left<o.right&&r.right>o.left&&r.top<o.bottom&&r.bottom>o.top))continue;
  area=size;best=r;
 }
 return{width,height,safe:best,portrait:width<height};
}
export function frameSubject(shot,subject,viewport){
 const center={x:(viewport.safe.left+viewport.safe.right)/2,y:(viewport.safe.top+viewport.safe.bottom)/2};let framed=shot;
 for(let i=0;i<3;i++){const basis=cameraBasis(framed),point=projectPoint(subject,framed,viewport),distance=dot(sub(subject,framed.position),basis.forward),scale=2*distance*Math.tan(framed.fov*Math.PI/360)/viewport.height,offset=add(mul(basis.right,(point.x-center.x)*scale),mul(basis.up,(center.y-point.y)*scale));framed={...framed,target:add(framed.target,offset)};}
 return framed;
}
export function projectedBounds(points,shot,viewport){const p=points.map(point=>projectPoint(point,shot,viewport));if(p.some(q=>q.depth<=0))return null;return{left:Math.min(...p.map(q=>q.x)),right:Math.max(...p.map(q=>q.x)),top:Math.min(...p.map(q=>q.y)),bottom:Math.max(...p.map(q=>q.y))};}
export function boundsSafe(b,viewport){const r=viewport.safe;return !!b&&b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom;}
export function segmentHitsBox(from,to,box){
 let lo=0,hi=1;for(let i=0;i<3;i++){const delta=to[i]-from[i];if(Math.abs(delta)<1e-8){if(from[i]<box.min[i]||from[i]>box.max[i])return false;continue;}let a=(box.min[i]-from[i])/delta,b=(box.max[i]-from[i])/delta;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return false;}return hi>0&&lo<.98;
}
export function cameraClear(shot,subject,boxes=[]){return shot.position[1]>.5&&!boxes.some(b=>segmentHitsBox(shot.position,subject,b));}
export function facePoints(v,carLength=20.9,height=3.3,width=3.2){
 const p=v.cars[0].body,c=Math.cos(p[2]),s=Math.sin(p[2]),x=p[0]+c*carLength/2,z=-p[1]-s*carLength/2,y=p[3]||0;
 return[-1,1].flatMap(side=>[0,height].map(h=>[x+s*side*width/2,y+h,z+c*side*width/2]));
}
export function consistPoints(v,carLength=20.9,height=3.3){return v.cars.flatMap(car=>{const p=car.body,c=Math.cos(p[2]),s=Math.sin(p[2]);return[-1,1].flatMap(end=>[0,height].map(h=>[p[0]+c*end*carLength/2,(p[3]||0)+h,-p[1]-s*end*carLength/2]));});}
export function shiftVisual(v,distance){return{...v,body:[v.body[0]+distance,...v.body.slice(1)],cars:v.cars.map(c=>({...c,body:[c.body[0]+distance,...c.body.slice(1)]}))};}
export function windowCamera(v,mode,profile={},aim=null){
 const p=v.body,c=Math.cos(p[2]),s=Math.sin(p[2]),side=mode==='left'?-1:1,x=profile.passengerX??1.1,y=profile.passengerHeight??2.32,z=side*(profile.passengerSide??.06),world=(a,b,d)=>[p[0]+c*a+s*d,(p[3]||0)+b,-p[1]-s*a+c*d];
 return{position:world(x,y,z),target:aim||world(x+3.7,y,side*20),fov:62};
}
