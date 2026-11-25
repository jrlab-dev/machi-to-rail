const shapes=['star','wing','wave','mountain','circle','diamond','line','text'];
const number=(v,min,max,fallback)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
const color=(v,fallback)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():fallback;
export function normalizeDecorations(raw){
 if(!Array.isArray(raw))return [];
 return raw.slice(0,24).filter(item=>item&&['mark','band'].includes(item.kind)).map(item=>{
  const common={kind:item.kind,surface:item.surface==='front'?'front':'side',
   target:['lead','middle','car'].includes(item.target)?item.target:'all',car:Math.round(number(item.car,1,11,1)),
   x:number(item.x,0,100,50),y:number(item.y,0,100,65),color:color(item.color,'#216779'),
   size:number(item.size,1,100,item.kind==='band'?9:35)};
  if(item.kind==='band'){
   const start=number(item.start,0,100,0),end=number(item.end,0,100,100);
   return {...common,start:Math.min(start,end),end:Math.max(start,end),slope:number(item.slope,-100,100,0)};
  }
  return {...common,shape:shapes.includes(item.shape)?item.shape:'star',base:['circle','shield','square'].includes(item.base)?item.base:'none',
   baseColor:color(item.baseColor,'#245445'),textColor:color(item.textColor,'#ffffff'),
   text:typeof item.text==='string'?[...item.text.replace(/[\x00-\x1f\x7f<>]/g,'').trim()].slice(0,16).join(''):''};
 });
}
export function decorationApplies(item,index,count){
 if(item.target==='car')return item.car===index+1;
 if(item.target==='lead')return index===0;
 if(item.target==='middle')return index>0&&index<count-1;
 return true;
}
function polygon(ctx,points){
 ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
}
function circle(ctx,r){ctx.beginPath();ctx.arc(0,0,r,0,2*Math.PI);ctx.fill();}
export function drawDecoration(ctx,item,w,h){
 ctx.save();ctx.fillStyle=item.color;
 if(item.kind==='band'){
  const a=w*item.start/100,b=w*item.end/100,y=h*item.y/100,z=y-h*item.slope/100,t=h*item.size/200;
  polygon(ctx,[[a,y-t],[b,z-t],[b,z+t],[a,y+t]]);ctx.restore();return;
 }
 ctx.translate(w*item.x/100,h*item.y/100);
 const unit=h*item.size/100;ctx.scale(unit,unit);
 ctx.fillStyle=item.baseColor;
 if(item.base==='circle')circle(ctx,.5);
 if(item.base==='square')ctx.fillRect(-.48,-.48,.96,.96);
 if(item.base==='shield')polygon(ctx,[[-.48,-.48],[.48,-.48],[.44,.13],[.26,.36],[0,.52],[-.26,.36],[-.44,.13]]);
 ctx.save();
 if(item.text&&item.shape!=='text'){ctx.translate(0,-.13);ctx.scale(.66,.66);}
 if(item.base!=='none')ctx.scale(.78,.78);
 ctx.fillStyle=item.color;
 if(item.shape==='circle')circle(ctx,.48);
 if(item.shape==='diamond')polygon(ctx,[[0,-.48],[.48,0],[0,.48],[-.48,0]]);
 if(item.shape==='line')ctx.fillRect(-.5,-.09,1,.18);
 if(item.shape==='star')polygon(ctx,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?.21:.5;return [r*Math.cos(a),r*Math.sin(a)];}));
 if(item.shape==='mountain')polygon(ctx,[[-.52,.35],[-.15,-.35],[.03,-.06],[.19,-.28],[.52,.35]]);
 if(item.shape==='wing')polygon(ctx,[[-.53,-.32],[.52,-.42],[.18,-.12],[-.11,-.06],[.15,-.04],[-.03,.13],[-.26,.17],[-.39,.4]]);
 if(item.shape==='wave'){
  ctx.beginPath();ctx.moveTo(-.5,.08);ctx.bezierCurveTo(-.22,-.56,.04,.34,.5,-.24);ctx.bezierCurveTo(.13,.62,-.1,-.14,-.5,.33);ctx.closePath();ctx.fill();
 }
 ctx.restore();
 if(item.text){
  const solo=item.shape==='text';ctx.fillStyle=item.textColor;ctx.font='bold 100px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const height=solo?.63:.28,limit=item.base==='none'?(solo?3.2:1.4):.87;
  const scale=Math.min(height/100,limit/Math.max(1,ctx.measureText(item.text).width));
  ctx.translate(0,solo?0:.29);ctx.scale(scale,scale);ctx.fillText(item.text,0,0);
 }
 ctx.restore();
}
