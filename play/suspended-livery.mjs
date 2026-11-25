import * as T from 'three';

// The graphics follow the metal panels, including the curved nose and separate sliding leaves.
export function suspendedLivery(other,resources,design=null){
  const redraw=[];
  let ink=other?'#983d36':'#174674',accent=other?'#df7653':'#428bb0',gold='#e3bd77';
  function skin(w,h,draw){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d');
    const rect=(x,y,a,b,color)=>{g.fillStyle=color;g.fillRect(x,y,a,b);};
    const round=(x,y,a,b,r,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,a,b,r);g.fill();};
    const grad=(y,end,colors)=>{const v=g.createLinearGradient(0,y,0,end);colors.forEach(([n,c])=>v.addColorStop(n,c));return v;};
    const text=(value,x,y,size,color)=>{g.fillStyle=color;g.font='600 '+size+'px sans-serif';g.textAlign='center';g.fillText(value,x,y);};
    const render=()=>{c.decorationExclusions=[];draw({g,rect,round,grad,text});};render();
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    const m=new T.MeshStandardMaterial({map,roughness:.40,metalness:.14,side:T.DoubleSide});resources.push(map,m);redraw.push(()=>{render();map.needsUpdate=true;});return m;
  }
  const metal=[[0,'#9cabb2'],[.13,'#f3f0df'],[.53,'#f9f5e6'],[.69,'#d6dfdc'],[.92,'#d0d7d5'],[1,'#83939a']];
  function glazing(p,x,y,w,h,cab=false){
    const {g,round,rect,grad}=p;
    g.canvas.decorationExclusions.push([x-3,y-3,w+6,h+6]);
    round(x-3,y-3,w+6,h+6,11,'#b1bcb9');round(x,y,w,h,10,'#28383d');
    g.save();g.beginPath();g.roundRect(x+4,y+4,w-8,h-8,7);g.clip();
    rect(x,y,w,h,grad(y,y+h,[[0,'#344f61'],[.36,'#798e92'],[.57,'#889c9a'],[1,'#304951']]));
    if(!cab){
      rect(x+6,y+9,w-12,6,'#c8c5aa');rect(x+9,y+h*.64,w-18,h*.20,'#5c777a');
      for(let k=16;k<w-10;k+=29){rect(x+k,y+11,1,13,'#ced0bf');g.strokeStyle='#e5dfca';g.lineWidth=2;g.beginPath();g.ellipse(x+k,y+26,4,5,0,0,7);g.stroke();}
      rect(x+w*.72,y+9,2,h*.83,'#cad1c4');
    }
    g.fillStyle='#d9eeef38';g.beginPath();g.moveTo(x+w*.21,y);g.lineTo(x+w*.57,y);g.lineTo(x+w*.18,y+h);g.lineTo(x-w*.18,y+h);g.fill();
    g.restore();
  }
  const side=skin(2048,384,p=>{
    const {rect,round,grad}=p;rect(0,0,2048,384,design?.body||grad(0,384,metal));rect(0,30,2048,6,accent);
    rect(0,228,2048,44,ink);rect(0,260,2048,10,accent);rect(0,277,2048,4,gold);
    for(const y of [301,308,315,322,329]){rect(0,y,2048,2,'#aab8b8');rect(0,y+2,2048,1,'#ecede2');}
    const uv=x=>(x+7.28)/14.56*2048;
    for(const [x,w] of [[-6.05,1.64],[-2.46,1.56],[-.80,1.53],[.86,1.55],[2.49,1.53],[5.69,.72],[6.57,.83]]){
      glazing(p,uv(x-w/2),53,w*140,145,x>5);
    }
    for(const x of [-4.25,4.25]){round(uv(x)-14,23,28,11,5,'#475459');rect(uv(x)-10,26,20,5,'#dfa557');}
  });
  const leaf=skin(128,384,p=>{const {rect,grad}=p;rect(0,0,128,384,design?.door||grad(0,384,metal));glazing(p,17,41,94,151);
    rect(0,217,128,49,ink);rect(0,254,128,12,accent);rect(0,270,128,4,gold);rect(0,0,3,384,'#58666a');rect(124,0,4,384,'#6a797a');rect(7,376,113,4,'#819295');
    for(const x of [14,106]){rect(x,316,7,39,'#9ba9aa');rect(x+2,320,3,29,'#d8dfd8');}
    rect(14,171,100,8,'#ddbf65');rect(87,290,21,14,'#657c85');rect(91,294,13,2,'#edf0e4');});
  function cabFace(tail){return skin(768,768,p=>{
    const {g,rect,round,grad,text}=p;rect(0,0,768,768,design?.body||grad(0,768,metal));
    g.canvas.decorationExclusions.push([190,57,388,56],[45,489,159,51],[564,489,159,51]);
    round(19,49,730,437,83,'#233740');glazing(p,40,114,688,322,true);
    round(190,57,388,56,9,'#131e22');
    g.save();g.beginPath();g.roundRect(44,120,680,310,16);g.clip();
    rect(64,131,636,25,'#31485185');round(149,163,152,153,9,'#405455a9');
    round(161,171,128,111,5,'#82979599');rect(164,256,123,8,'#536d72');
    round(459,268,77,85,14,'#3b5159b8');round(471,251,51,37,9,'#405660b0');
    g.fillStyle='#364d57ca';g.beginPath();g.moveTo(44,363);g.quadraticCurveTo(342,336,487,351);g.lineTo(586,329);g.lineTo(721,348);g.lineTo(721,409);g.lineTo(44,409);g.fill();
    rect(511,340,52,7,'#819e9b');rect(573,344,32,5,'#a6bab0');g.restore();
    rect(379,119,10,308,'#304249');
    for(const [y,h,c] of [[467,91,ink],[536,22,accent],[568,7,gold]]){
      g.fillStyle=c;g.beginPath();g.moveTo(0,y-27);g.quadraticCurveTo(384,y+27,768,y-27);g.lineTo(768,y+h-27);g.quadraticCurveTo(384,y+h+27,0,y+h-27);g.fill();}
    for(const x of [45,564]){round(x,489,159,51,20,'#233642');for(let i=0;i<4;i++)round(x+13+i*34,502,27,19,6,tail?'#ff574c':'#fff6d0');}
    text('SHIOMI',384,532,26,'#fff3dd');round(269,651,230,49,14,'#829195');for(let j=0;j<4;j++)rect(283,658+j*9,202,4,'#56676d');
  });}
  const destinations=['潮見中央','潮見海岸'].map(name=>skin(384,70,({rect,text})=>{rect(0,0,384,70,'#172326');text('各停　'+name,192,52,47,'#ffd582');}));
  destinations.forEach((m,i)=>{m.name=i?'潮見海岸':'潮見中央ビル';});
  const badge=skin(384,92,({rect,text})=>{rect(0,0,384,92,ink);text(design?.name||'潮見モノレール',192,51,36,'#fff8df');text('S H I O M I    M O N O R A I L',192,79,16,'#e7d6b8');});
  const apply=d=>{design=d;ink=d.stripe;accent=d.stripe2;redraw.forEach(draw=>draw());};
  if(design){ink=design.stripe;accent=design.stripe2;redraw.forEach(draw=>draw());}
  const faces=[cabFace(false),cabFace(true)];
  for(const m of [side,leaf,badge,...faces])m.userData.decorationSurface=true;
  return {apply,faces,destinations,side,leaf,badge};
}
