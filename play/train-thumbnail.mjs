import {drawDecoration,decorationApplies} from './train-decorations.mjs?v=rail-90';
import {drawLivery} from './train-livery.mjs?v=rail-90';
import {drawLetter} from './train-lettering.mjs?v=rail-90';

// Small side illustrations share the actual livery, without another 3D renderer.
function drawSideDecorations(ctx,design,x,y,w,h){
 if(!design.decorations?.length)return;
 ctx.save();ctx.translate(x,y);
 for(const item of design.decorations)if(item.surface==='side'&&decorationApplies(item,0,1))drawDecoration(ctx,item,w,h);
 ctx.restore();
}
export function drawTrainThumbnail(canvas,type,d,image=null){
 canvas.width=240;canvas.height=100;const c=canvas.getContext('2d');
 c.fillStyle='#edf3ef';c.fillRect(0,0,240,100);
 c.fillStyle='#cedbd3';c.beginPath();c.ellipse(120,83,105,5,0,0,Math.PI*2);c.fill();
 if(type.startsWith('limited-')){
  const raised=type==='limited-panorama',sloped=type==='limited-stream';
  c.save();c.beginPath();c.moveTo(14,72);c.lineTo(14,34);c.quadraticCurveTo(16,28,24,28);
  if(raised){c.lineTo(158,28);c.lineTo(166,18);c.lineTo(179,18);c.lineTo(190,34);c.lineTo(208,39);c.lineTo(225,56);}
  else if(sloped){c.lineTo(171,28);c.bezierCurveTo(188,28,213,48,226,60);}
  else{c.lineTo(207,28);c.quadraticCurveTo(222,28,224,41);}
  c.lineTo(226,70);c.lineTo(217,73);c.closePath();c.clip();
  c.fillStyle=d.body;c.fillRect(10,16,218,60);c.fillStyle=d.roof;c.fillRect(10,15,217,16);
  c.fillStyle=d.stripe;c.fillRect(12,56,214,8);c.fillStyle=d.stripe2;c.fillRect(12,65,214,3);
  c.fillStyle=d.door;c.fillRect(27,34,11,37);c.fillStyle='#213e4c';c.fillRect(29,38,7,12);
  drawSideDecorations(c,d,14,28,212,45);
  for(let x=44;x<163;x+=20)c.fillRect(x,37,16,13);
  c.beginPath();c.moveTo(raised?179:sloped?171:208,34);c.lineTo(228,34);c.lineTo(228,sloped?58:51);c.lineTo(raised?179:sloped?192:208,49);c.fill();
  if(raised)c.fillRect(166,22,16,7);
  if(!raised&&!sloped){c.fillStyle=d.stripe;c.fillRect(216,53,8,7);}
  c.restore();c.fillStyle='#465054';c.fillRect(17,73,196,3);
  for(const x of [36,49,182,195]){c.beginPath();c.arc(x,77,5,0,2*Math.PI);c.fill();}
  canvas.dataset.type=type;canvas.dataset.wrap='none';return;
 }
 const roundNose=type==='express-retro';
 const tram=type==='tram',steam=type==='steam',freight=type==='freight',fast=type.startsWith('express')||type==='maglev';
 const x=tram?42:12,w=tram?156:216,y=30,h=42;
 const skin=document.createElement('canvas');skin.width=432;skin.height=100;drawLivery(skin.getContext('2d'),d,image);
 c.save();c.beginPath();
 if(roundNose){
  c.moveTo(x,72);c.lineTo(x,y);c.lineTo(168,y);
  c.bezierCurveTo(181,30,190,37,199,45);c.quadraticCurveTo(205,50,211,51);
  c.bezierCurveTo(231,51,233,68,218,71);c.lineTo(205,72);c.closePath();
 }
 else if(fast){const nose=type==='express-short'?177:type==='maglev'?138:155;c.moveTo(x,y);c.lineTo(nose,y);c.bezierCurveTo(nose+20,y,196,48,228,66);c.lineTo(228,72);c.lineTo(x,72);c.closePath();}
 else if(steam){c.rect(15,43,149,29);c.rect(164,28,57,44);}
 else if(freight){c.roundRect(12,37,134,35,3);c.roundRect(146,23,70,49,4);}
 else c.roundRect(x,y,w,h,7);
 c.clip();c.fillStyle=d.body;c.fillRect(0,0,240,100);
 if(roundNose&&d.pattern==='legacy'&&!d.wrap){
  c.fillStyle=d.stripe;c.fillRect(x,37,154,17);
  c.fillStyle=d.stripe2;c.fillRect(x,66,w,4);
 }else c.drawImage(skin,x,y,w,h);
 if(steam||freight){c.fillStyle=d.roof;c.fillRect(steam?164:146,steam?28:23,steam?57:70,5);}
 c.fillStyle=d.roof;c.fillRect(x,y,w,5);
 drawSideDecorations(c,d,x,y,w,h);
 c.fillStyle='#1a3543';
 if(steam)c.fillRect(177,35,28,18);
 else if(freight){c.fillRect(157,30,43,18);for(let n=0;n<6;n++)c.fillRect(25+n*18,47,9,17);}
 else if(roundNose){
  c.fillStyle='#244356';
  for(let wx=24;wx<=143;wx+=20){c.beginPath();c.roundRect(wx,39,14,11,3);c.fill();}
  c.beginPath();c.moveTo(172,34);c.quadraticCurveTo(182,34,194,46);c.lineTo(185,46);c.lineTo(174,38);c.closePath();c.fill();
  c.fillStyle=d.face;c.beginPath();c.ellipse(225,62,9,11,-.18,0,Math.PI*2);c.fill();
  c.fillStyle='#fff0b9';c.beginPath();c.arc(207,52,3,0,Math.PI*2);c.fill();
 }
 else if(fast){c.beginPath();for(let n=0;n<6;n++)c.roundRect(23+n*20,41,13,10,3);c.fill();c.beginPath();c.moveTo(163,36);c.lineTo(183,45);c.lineTo(195,53);c.lineTo(174,48);c.closePath();c.fill();}
 else{for(let n=0;n<(tram?5:8);n++)c.fillRect(x+10+n*(tram?28:25),42,17,14);
  for(const at of [.23,.7]){const dx=x+w*at;if(d.doorSeparate&&!d.wrap){c.fillStyle=d.door;c.fillRect(dx,35,20,35);}c.strokeStyle='#526872';c.lineWidth=.7;c.strokeRect(dx,35,20,35);c.fillStyle='#1a3543';c.fillRect(dx+3,40,14,13);}
 }
 if(d.lettering?.side){const letters=document.createElement('canvas');letters.width=432;letters.height=100;drawLetter(letters.getContext('2d'),d.lettering.side);c.drawImage(letters,x,y,w,h);}
 c.restore();c.fillStyle='#33474e';c.fillRect(x+4,72,w-8,4);
 if(type==='monorail'||type==='suspended-monorail'){
  const suspended=type==='suspended-monorail';c.fillStyle='#78918f';c.fillRect(4,suspended?12:77,232,6);
  for(const x of [48,180])c.fillRect(x,suspended?17:73,8,suspended?14:7);
  canvas.dataset.type=type;return;
 }
 for(const wx of type==='maglev'?[]:steam?[37,65,93,121,187,204]:[x+28,x+43,x+w-43,x+w-28]){c.beginPath();c.arc(wx,78,steam&&wx<140?8:5,0,Math.PI*2);c.fill();c.fillStyle='#8b9b9d';c.beginPath();c.arc(wx,78,2,0,Math.PI*2);c.fill();c.fillStyle='#33474e';}
 if(steam){c.fillStyle=d.roof;c.fillRect(25,25,12,21);c.fillRect(22,23,18,5);c.fillRect(65,34,15,10);}
 else if(!fast&&!freight){c.strokeStyle='#52616a';c.lineWidth=2;c.beginPath();c.moveTo(95,28);c.lineTo(110,16);c.lineTo(126,28);c.moveTo(103,16);c.lineTo(118,16);c.stroke();}
 canvas.dataset.type=type;canvas.dataset.wrap=image?'ready':d.wrap?'pending':'none';
}

export function observeTrainThumbnails(container,items){
 let disposed=false;const jobs=new Map();
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const job=jobs.get(entry.target);if(!job)continue;observer.unobserve(entry.target);jobs.delete(entry.target);const image=new Image();image.onload=()=>{if(!disposed)drawTrainThumbnail(entry.target,job.type,job.design,image);};image.onerror=()=>{if(!disposed)entry.target.dataset.wrap='failed';};image.src=job.design.wrap.image;}},{root:container,rootMargin:'80px'});
 for(const item of items){drawTrainThumbnail(item.canvas,item.type,item.design);if(item.design.wrap){jobs.set(item.canvas,item);observer.observe(item.canvas);}}
 return()=>{disposed=true;observer.disconnect();jobs.clear();};
}
