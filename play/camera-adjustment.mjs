const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const windowMode=mode=>mode==='left'||mode==='right';
export const insideMode=mode=>windowMode(mode)||mode==='front'||mode==='panorama';
export const adjustableMode=mode=>['panorama','bridge-town','front-exterior','follow','trackside','left','right','front','station','station-doors','crossing','crossing-person','traffic'].includes(mode);
export const neutralAdjustment=()=>({yaw:0,pitch:0,zoom:1});
export function dragAdjustment(state,dx,dy){return {...state,yaw:clamp(state.yaw-dx*.004,-.75,.75),pitch:clamp(state.pitch+dy*.003,-.4,.4)};}
export function zoomAdjustment(state,factor){return {...state,zoom:clamp(state.zoom*factor,.65,1.5)};}
export function passengerView(visual,type,mode){if(type!=='steam'||!windowMode(mode))return visual;const car=visual?.cars?.[1];return car?{...visual,...car}:visual;}
export function hideViewedTrain(type,mode){return insideMode(mode)&&(!['steam','freight'].includes(type)||(type==='steam'&&windowMode(mode)));}
export function adjustedCamera(shot,state,mode){
 if(!adjustableMode(mode)||(state.yaw===0&&state.pitch===0&&state.zoom===1))return shot;
 const inside=insideMode(mode),anchor=inside?shot.position:shot.target,other=inside?shot.target:shot.position,d=other.map((x,i)=>x-anchor[i]),length=Math.hypot(...d),yaw=Math.atan2(d[2],d[0])+state.yaw,pitch=clamp(Math.atan2(d[1],Math.hypot(d[0],d[2]))+state.pitch,-1.45,1.45),r=length*(inside?1:state.zoom),point=[anchor[0]+Math.cos(yaw)*Math.cos(pitch)*r,anchor[1]+Math.sin(pitch)*r,anchor[2]+Math.sin(yaw)*Math.cos(pitch)*r];
 return {...shot,position:inside?shot.position:point,target:inside?point:shot.target,fov:inside?clamp(shot.fov*state.zoom,mode==='bridge-town'?14:38,85):shot.fov};
}
// Rebase after every finger-count change: lifting one finger must not jump or place a part.
export function bindViewGestures(canvas,{drag,pinch,tap,wheel,onStart}){
 const pointers=new Map();let start=null,last=null,lastDistance=null,moved=false;
 const rebase=()=>{last=[...pointers.values()][0]||null;lastDistance=pointers.size===2?Math.hypot(...[...pointers.values()][0].map((v,i)=>v-[...pointers.values()][1][i])):null;};
 function cancel(){
   const ids=[...pointers.keys()];
   pointers.clear();start=null;last=null;lastDistance=null;moved=false;
   for(const id of ids)if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 }
 canvas.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   if(!pointers.size)onStart?.();
   canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);
   if(pointers.size===1){start=[e.clientX,e.clientY];moved=false;}else moved=true;
   rebase();
 });
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const p=[e.clientX,e.clientY];pointers.set(e.pointerId,p);if(pointers.size===2){const[a,b]=[...pointers.values()],distance=Math.hypot(a[0]-b[0],a[1]-b[1]);if(lastDistance>0&&distance>0)pinch(lastDistance/distance);lastDistance=distance;moved=true;return;}if(pointers.size!==1)return;const dx=p[0]-last[0],dy=p[1]-last[1];last=p;if(Math.hypot(p[0]-start[0],p[1]-start[1])>5)moved=true;if(moved)drag(dx,dy);});
 const end=(e,cancel)=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(cancel)moved=true;if(!pointers.size&&!moved&&!cancel)tap(e);if(pointers.size)moved=true;rebase();};
 canvas.addEventListener('pointerup',e=>end(e,false));canvas.addEventListener('pointercancel',e=>end(e,true));canvas.addEventListener('lostpointercapture',e=>end(e,true));canvas.addEventListener('wheel',e=>{e.preventDefault();wheel(Math.exp(clamp(e.deltaY*.001,-.3,.3)));},{passive:false});
 return {cancel};
}
