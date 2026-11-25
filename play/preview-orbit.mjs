// Pointer and keyboard controls shared by the train preview; no storage writes.
export function setupPreviewOrbit(canvas,{read,write,manual}){
 let pointer=null,last=null;
 const move=(dx,dy)=>{const state=read();manual();write({yaw:state.yaw+dx*.012,pitch:Math.max(-.25,Math.min(1.05,state.pitch+dy*.008))});};
 const down=e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;pointer=e.pointerId;last=[e.clientX,e.clientY];canvas.setPointerCapture(pointer);canvas.focus({preventScroll:true});canvas.classList.add('dragging');};
 const drag=e=>{if(e.pointerId!==pointer)return;const dx=e.clientX-last[0],dy=e.clientY-last[1];last=[e.clientX,e.clientY];if(dx||dy)move(dx,dy);};
 const end=e=>{if(e.pointerId!==pointer)return;const id=pointer;pointer=null;last=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);};
 const key=e=>{const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,12],ArrowDown:[0,-12]}[e.key];if(!delta)return;e.preventDefault();move(...delta);};
 for(const [name,fn]of [['pointerdown',down],['pointermove',drag],['pointerup',end],['pointercancel',end],['lostpointercapture',end],['keydown',key]])canvas.addEventListener(name,fn);
 return {cancel(){if(pointer!==null)end({pointerId:pointer});}};
}
