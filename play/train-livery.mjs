// Shared canvas drawing for the 3D skin and side preview.
export function drawLivery(ctx,d,image,front=false){
 const w=ctx.canvas.width,h=ctx.canvas.height;
 ctx.clearRect(0,0,w,h);ctx.fillStyle=front?d.face:d.body;ctx.fillRect(0,0,w,h);
 const band=(bottom,width,color)=>{ctx.fillStyle=color;ctx.fillRect(0,h*(1-bottom-width/2),w,h*width);};
 const p=d.bandPosition/100,b=d.bandWidth/100;
 if(!front){switch(d.pattern){
 case 'legacy':band(.21,.14,d.stripe);band(.815,.047,d.stripe);break;
 case 'single':band(p,b,d.stripe);break;
 case 'double':band(p,b,d.stripe);band(p+b*.85,b*.55,d.stripe2);break;
 case 'edges':band(p,b,d.stripe);band(.815,b*.5,d.stripe2);break;
 case 'gradient':{const y=h*(1-p-b/2),g=ctx.createLinearGradient(0,y,0,y+h*b);g.addColorStop(0,d.stripe2);g.addColorStop(1,d.stripe);ctx.fillStyle=g;ctx.fillRect(0,y,w,h*b);break;}
 case 'windows':band(.57,.43,d.stripe);band(p,b*.45,d.stripe2);break;
 case 'twoTone':ctx.fillStyle=d.stripe;ctx.fillRect(0,h*(1-p-b),w,h*(p+b));band(p+b,.025,d.stripe2);break;
 case 'diagonal':ctx.fillStyle=d.stripe;ctx.beginPath();ctx.moveTo(0,h*(1-p));ctx.lineTo(w,h*(1-p-.28));ctx.lineTo(w,h*(1-p-.28-b));ctx.lineTo(0,h*(1-p-b));ctx.fill();ctx.fillStyle=d.stripe2;ctx.beginPath();ctx.moveTo(0,h*(1-p+.035));ctx.lineTo(w,h*(1-p-.245));ctx.lineTo(w,h*(1-p-.275));ctx.lineTo(0,h*(1-p+.005));ctx.fill();break;
 }}
 if(front&&d.front){drawFrontPattern(ctx,d.front);ctx.fillStyle=d.front.mask;ctx.beginPath();ctx.roundRect(w*.055,h*.145,w*.89,h*.44,w*.045);ctx.fill();}
 if(!image||!d.wrap||(front&&!d.wrap.front))return;
 const wrap=d.wrap,physicalAspect=front?3/2.75:20/2.75;
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
 if(wrap.mode==='repeat'){
  const count=front?1:wrap.repeat,cell=w/count;
  const aspect=(image.width/image.height)/physicalAspect*(w/h);
  const ih=Math.min(h*.92,cell*.94/aspect)*wrap.scale,iw=ih*aspect;
  for(let i=0;i<count;i++)ctx.drawImage(image,cell*(i+.5)-iw/2,(h-ih)/2-h*wrap.y/100,iw,ih);
 }else{
  const physicalWidth=h*physicalAspect,factor=Math.max(physicalWidth/image.width,h/image.height)*wrap.scale,iw=image.width*factor*w/physicalWidth,ih=image.height*factor;
  ctx.drawImage(image,(w-iw)/2,(h-ih)/2-h*wrap.y/100,iw,ih);
 }
 ctx.restore();
}
export function drawFrontPattern(ctx,f){
 const w=ctx.canvas.width,h=ctx.canvas.height,p=f.position/100,b=f.width/100;
 const band=(y,t,color)=>{ctx.fillStyle=color;ctx.fillRect(0,h*(1-y-t/2),w,h*t);};
 ctx.fillStyle=f.primary;
 switch(f.pattern){
 case 'single':band(p,b,f.primary);break;
 case 'double':band(p,b,f.primary);band(p+b*.85,b*.55,f.secondary);break;
 case 'lower':ctx.fillRect(0,h*(1-p-b/2),w,h*(p+b/2));band(p+b/2,.025,f.secondary);break;
 case 'frame':{const t=b*.65;ctx.fillRect(0,0,w*t,h);ctx.fillRect(w*(1-t),0,w*t,h);ctx.fillRect(0,0,w,h*t);band(p,b,f.primary);band(p-b*.6,.025,f.secondary);break;}
 case 'round':ctx.beginPath();ctx.moveTo(w*.08,h*(1-p-b));ctx.lineTo(w*.92,h*(1-p-b));ctx.bezierCurveTo(w*.9,h*(1-p+b),w*.1,h*(1-p+b),w*.08,h*(1-p-b));ctx.fill();break;
 case 'chevron':ctx.beginPath();ctx.moveTo(0,h*(1-p-b));ctx.lineTo(w*.5,h*(1-p));ctx.lineTo(w,h*(1-p-b));ctx.lineTo(w,h*(1-p));ctx.lineTo(w*.5,h*(1-p+b));ctx.lineTo(0,h*(1-p));ctx.closePath();ctx.fill();break;
 case 'gradient':{const y=h*(1-p-b),g=ctx.createLinearGradient(0,y,0,y+h*b*2);g.addColorStop(0,f.secondary);g.addColorStop(1,f.primary);ctx.fillStyle=g;ctx.fillRect(0,y,w,h*b*2);break;}
 }
}
export async function readWrapFile(file){
 if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw Error('JPEG・PNG・WebPの写真を選んでください。');
 if(file.size>25*1024*1024)throw Error('写真は25MB以下にしてください。');
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;await image.decode();
  const canvas=document.createElement('canvas'),scale=Math.min(1,1536/Math.max(image.naturalWidth,image.naturalHeight));
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  let result=canvas.toDataURL('image/webp',.86);
  for(const quality of [.72,.55,.38]){if(result.length<=450000)break;result=canvas.toDataURL('image/webp',quality);}
  if(result.length>450000){const small=document.createElement('canvas');small.width=Math.ceil(canvas.width/2);small.height=Math.ceil(canvas.height/2);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);result=small.toDataURL('image/webp',.65);}
  if(result.length>450000)throw Error('写真を小さくして、もう一度選んでください。');
  return result;
 }catch(error){if(error.message?.includes('写真'))throw error;throw Error('この写真を読めませんでした。JPEG・PNG・WebPで選び直してください。');}
 finally{URL.revokeObjectURL(url);}
}
