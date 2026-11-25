import * as T from 'three';

// Each row traces the cab from skirt to roof: height, nose X, half-width, finish.
const noses={
  'limited-classic':[
    [.67,9.68,1.13,'skirt'],[.94,10.02,1.29,'body'],[1.42,10.08,1.38,'stripe2'],
    [1.49,10.09,1.40,'stripe'],[1.83,10.09,1.43,'face'],[2.22,9.94,1.45,'windshield'],
    [3.17,9.53,1.38,'face'],[3.42,9.31,1.29,'roof'],[3.59,9.1,1.10]
  ],
  'limited-stream':[
    [.64,9.60,1.05,'skirt'],[.89,10.08,1.19,'body'],[1.19,10.14,1.32,'stripe2'],
    [1.26,10.14,1.35,'stripe'],[1.61,10.05,1.40,'face'],[1.94,9.61,1.41,'windshield'],
    [2.51,8.94,1.41,'windshield'],[3.15,7.91,1.37,'windshield'],[3.36,7.30,1.31,'roof'],[3.58,6.57,1.14]
  ],
  'limited-panorama':[
    [.72,9.67,1.18,'skirt'],[.95,10.02,1.36,'body'],[1.38,10.09,1.42,'stripe'],
    [1.69,10.06,1.45,'stripe2'],[1.78,10.04,1.46,'observationGlass'],[2.79,9.65,1.43,'observationGlass'],
    [3.07,9.28,1.34,'roof'],[3.19,9.04,1.24,'face'],[3.25,7.20,1.21,'stripe'],
    [3.47,7.13,1.18,'windshield'],[4.22,6.48,1.12,'roof'],[4.45,6.12,.94]
  ]
};

function canvasSkin(width,height){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  return {ctx:canvas.getContext('2d'),map};
}

function drawWindow(ctx,x,y,w,h){
  (ctx.canvas.decorationExclusions ||= []).push([x-2,y-2,w+4,h+4]);
  const frame=(dx,dy,width,height,radius,color)=>{
    ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(dx,dy,width,height,radius);ctx.fill();
  };
  frame(x-2,y-2,w+4,h+4,9,'#b4c1c0');frame(x,y,w,h,8,'#23333b');
  const g=ctx.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#244554');g.addColorStop(.45,'#53717b');g.addColorStop(.56,'#628188');g.addColorStop(1,'#2d4954');
  frame(x+4,y+4,w-8,h-8,5,g);
  ctx.save();ctx.beginPath();ctx.roundRect(x+4,y+4,w-8,h-8,5);ctx.clip();
  for(let i=x+11;i<x+w-7;i+=29){
    frame(i,y+h-25,18,26,4,'#38525e');frame(i+2,y+h-25,13,5,2,'#b1b4a2');
  }
  ctx.fillStyle='#dce8de31';ctx.beginPath();ctx.moveTo(x+w*.37,y);ctx.lineTo(x+w*.65,y);
  ctx.lineTo(x+w*.24,y+h);ctx.lineTo(x-w*.05,y+h);ctx.fill();
  ctx.fillStyle='#d2d7ca';ctx.fillRect(x+6,y+6,w-12,2);ctx.restore();
}

function paintSide(ctx,d){
  ctx.canvas.decorationExclusions=[];
  const w=ctx.canvas.width,h=ctx.canvas.height,toX=x=>(x+10)/20*w;
  ctx.fillStyle=d.body;ctx.fillRect(0,0,w,h);
  const light=ctx.createLinearGradient(0,0,0,h);
  for(const [p,c] of [[0,'#263a4422'],[.11,'#ffffff33'],[.32,'#ffffff0b'],[.73,'#ffffff00'],[1,'#23344050']])light.addColorStop(p,c);
  ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=d.stripe;ctx.fillRect(0,h*.664,w,h*.13);
  ctx.fillStyle=d.stripe2;ctx.fillRect(0,h*.809,w,h*.025);
  for(let i=0;i<3;i++){ctx.fillStyle='#ffffff40';ctx.fillRect(0,h*.90+i*4,w,1);ctx.fillStyle='#25363a27';ctx.fillRect(0,h*.9+i*4+1,w,1);}
  for(const [x,span] of [[-9.17,.85],[-5.99,1.30],[-4.28,1.60],[-2.48,1.60],[-.68,1.60],[1.12,1.60],[2.82,1.35],[5.78,1.30],[7.56,1.60],[9.11,1.0]])
    drawWindow(ctx,toX(x-span/2),h*.17,span*w/20,h*.435);
  ctx.fillStyle='#202f35';ctx.fillRect(toX(2.3),h*.058,w*.049,h*.087);
  ctx.fillStyle='#f5c883';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 13px sans-serif';
  ctx.fillText('特 急',toX(2.79),h*.102,w*.045);
}

function paintDoor(ctx,d){
  ctx.canvas.decorationExclusions=[];
  ctx.fillStyle=d.door;ctx.fillRect(0,0,128,256);
  drawWindow(ctx,19,20,90,87);
  ctx.fillStyle=d.stripe;ctx.fillRect(0,172,128,34);
  ctx.fillStyle=d.stripe2;ctx.fillRect(0,210,128,7);
  ctx.fillStyle='#505c60';ctx.fillRect(0,0,3,256);ctx.fillRect(125,0,3,256);
  ctx.fillStyle='#a3aba5';ctx.fillRect(14,221,10,21);
}
function paintWindshield(ctx){
  const g=ctx.createLinearGradient(0,0,0,256);
  for(const [stop,color] of [[0,'#344b5c'],[.18,'#597685'],[.57,'#45606c'],[.73,'#668087'],[1,'#263d49']])g.addColorStop(stop,color);
  ctx.fillStyle=g;ctx.fillRect(0,0,512,256);
  for(const [x,w] of [[100,64],[315,34],[354,12]]){
    ctx.fillStyle='#d2e9ec1d';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w,0);
    ctx.lineTo(x+w-82,256);ctx.lineTo(x-82,256);ctx.fill();
  }
  ctx.fillStyle='#1b2e39';ctx.fillRect(0,0,512,8);ctx.fillRect(0,246,512,10);
  for(const x of [182,325]){
    ctx.strokeStyle='#20313b';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,241);
    ctx.lineTo(x+40,192);ctx.moveTo(x+14,190);ctx.lineTo(x+67,188);ctx.stroke();
  }
}

function paintSign(ctx,name,mark,stripe){
  const {width:w,height:h}=ctx.canvas;
  ctx.fillStyle=mark?'#e6d8ac':'#233b46';ctx.fillRect(0,0,w,h);
  ctx.fillStyle=mark?'#284852':'#bacac9';ctx.fillRect(5,5,w-10,h-10);
  ctx.fillStyle=mark?'#f3e6c1':'#223843';ctx.fillRect(9,9,w-18,h-18);
  if(mark){
    ctx.fillStyle=stripe;ctx.beginPath();ctx.moveTo(12,h*.48);ctx.quadraticCurveTo(w*.3,h*.4,w*.6,h*.54);ctx.quadraticCurveTo(w*.8,h*.59,w-12,h*.48);ctx.lineTo(w-12,h*.54);ctx.quadraticCurveTo(w*.77,h*.66,w*.57,h*.59);ctx.quadraticCurveTo(w*.28,h*.45,12,h*.54);ctx.fill();
  }
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=mark?'#314955':'#d9e6dc';
  ctx.font='600 '+Math.round(h*.15)+'px sans-serif';ctx.fillText('L I M I T E D   E X P R E S S',w/2,h*.25,w*.85);
  ctx.font='bold '+Math.round(h*.3)+'px sans-serif';ctx.fillText(name,w/2,h*.75,w*.85);
}

// Static panels, fittings and seats use one mesh per material per moving group.
// Geometry templates are shared across the entire consist, including moving door leaves.
class Panels{
  constructor(materials,resources){this.materials=materials;this.resources=resources;this.rows=new Map();}
  quad(key,a,b,c,d,u0=0,v0=0,u1=1,v1=1){
    if(!this.rows.has(key))this.rows.set(key,{p:[],uv:[],i:[]});
    const row=this.rows.get(key),n=row.p.length/3;
    row.p.push(...a,...b,...c,...d);row.uv.push(u0,v0,u1,v0,u1,v1,u0,v1);
    row.i.push(n,n+1,n+2,n,n+2,n+3);
  }
  box(key,x,y,z,w,h,d){
    const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2;
    this.quad(key,[a,c,g],[b,c,g],[b,e,g],[a,e,g]);
    this.quad(key,[b,c,f],[a,c,f],[a,e,f],[b,e,f]);
    this.quad(key,[b,c,g],[b,c,f],[b,e,f],[b,e,g]);
    this.quad(key,[a,c,f],[a,c,g],[a,e,g],[a,e,f]);
    this.quad(key,[a,e,g],[b,e,g],[b,e,f],[a,e,f]);
    this.quad(key,[a,c,f],[b,c,f],[b,c,g],[a,c,g]);
  }
  finish(){
    const group=new T.Group();
    for(const [key,row] of this.rows){
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(row.p,3));
      g.setAttribute('uv',new T.Float32BufferAttribute(row.uv,2));g.setIndex(row.i);g.computeVertexNormals();
      this.resources.push(g);group.add(new T.Mesh(g,this.materials[key]));
    }
    return group;
  }
}

export function createLimitedExpress(type,formation,design){
  const profile=noses[type];if(!profile)throw Error('特急模型の形式を確認してください。');
  const resources=[],materials={},root=new T.Group(),templates=new Map();
  const doorSkin=canvasSkin(128,256),glassSkin=canvasSkin(512,256);paintWindshield(glassSkin.ctx);
  const side=canvasSkin(1536,192),badge=canvasSkin(384,128),headmark=canvasSkin(384,224);
  const palette={body:'#dddcca',stripe:'#a2524b',stripe2:'#bd9854',roof:'#777d7b',door:'#dbd9c7',face:'#dddcca',
    skirt:'#49565b',hardware:'#334047',wheel:'#263136',rim:'#839393',vent:'#697878',window:'#395b68',sill:'#b7c1bc',
    lounge:'#85604a',cushion:'#9f6954',linen:'#e9d9ad',lamp:'#fff2c5',red:'#bb3d30',observationGlass:'#7fa6b1'};
  for(const [key,color] of Object.entries(palette)){
    const m=new T.MeshStandardMaterial({color,roughness:key==='windshield'?.24:.61,metalness:.11,side:T.DoubleSide});
    if(key==='observationGlass'){m.transparent=true;m.opacity=.19;m.depthWrite=false;}
    if(key==='lamp'||key==='red'){m.emissive.set(color);m.emissiveIntensity=.35;}
    if(['body','face','stripe','stripe2'].includes(key))m.userData.decorationSurface=true;
    resources.push(m);materials[key]=m;
  }
  for(const [key,skin] of [['side',side],['doorSkin',doorSkin],['windshield',glassSkin],['badge',badge],['headmark',headmark]]){
    const m=new T.MeshStandardMaterial({map:skin.map,side:T.DoubleSide,roughness:.52});m.userData.decorationSurface=['side','doorSkin','badge','headmark'].includes(key);materials[key]=m;resources.push(m,skin.map);
  }
  function apply(d){
    for(const key of ['body','stripe','stripe2','door','roof','face'])materials[key].color.set(d[key]);
    paintSide(side.ctx,d);paintDoor(doorSkin.ctx,d);paintSign(badge.ctx,d.name,false,d.stripe);paintSign(headmark.ctx,d.name,true,d.stripe);
    for(const skin of [side,doorSkin,badge,headmark])skin.map.needsUpdate=true;
  }
  apply(design);
  const template=(key,build)=>{
    if(!templates.has(key)){const p=new Panels(materials,resources);build(p);templates.set(key,p.finish());}
    return templates.get(key).clone();
  };
  const classic=type==='limited-classic',panorama=type==='limited-panorama';
  const cabJoint=classic?6.76:panorama?5.15:5.29;
  function nose(p,tail){
    // Octagonal plan with a broad centre face and wrapped corner glazing.
    const ring=([y,x,w])=>[[cabJoint,y,w],[x-.52,y,w],[x-.17,y,w*.88],[x,y,w*.67],[x,y,-w*.67],[x-.17,y,-w*.88],[x-.52,y,-w],[cabJoint,y,-w]];
    const glassU=[0,.13,.18,.23,.77,.82,.87,1];
    for(let j=0;j<profile.length-1;j++){
      const a=ring(profile[j]),b=ring(profile[j+1]),finish=profile[j][3];
      for(let i=0;i<a.length-1;i++){
        if(finish==='windshield'){
          const start=classic?2.22:panorama?3.47:1.94,end=classic?3.17:panorama?4.22:3.36;
          p.quad(finish,a[i],a[i+1],b[i+1],b[i],glassU[i],(a[i][1]-start)/(end-start),glassU[i+1],(b[i][1]-start)/(end-start));
        }else p.quad(finish,a[i],a[i+1],b[i+1],b[i]);
        if(finish==='windshield' && (i===0||i===6)){
          const s=i===0?1:-1,lo=a[i===0?0:7],hi=b[i===0?0:7];
          const point=(row,dx,dz)=>[cabJoint+dx,row[1],row[2]+s*dz];
          const width=panorama?.70:classic?.83:1.15;
          // Separate the side cab light from the panoramic windscreen with a painted post.
          p.quad('body',point(lo,.02,.012),point(lo,.12,.012),point(hi,.12,.012),point(hi,.02,.012));
          p.quad('window',point(lo,.12,.016),point(lo,width,.016),point(hi,width-.2,.016),point(hi,.12,.016));
          p.quad('sill',point(lo,width,.022),point(lo,width+.078,.022),point(hi,width-.12,.022),point(hi,width-.2,.022));
        }
        if(finish==='windshield'||finish==='observationGlass'){
          if(i===2||i===4){
            const lo=a[i+1],hi=b[i+1],z=lo[2]>0?.025:-.025;
            p.quad('hardware',[lo[0]+.025,lo[1],lo[2]-z],[lo[0]+.025,lo[1],lo[2]+z],[hi[0]+.025,hi[1],hi[2]+z],[hi[0]+.025,hi[1],hi[2]-z]);
          }
          if(i===3&&classic)p.quad('face',[a[3][0]+.025,a[3][1],.056],[a[4][0]+.025,a[4][1],-.056],[b[4][0]+.025,b[4][1],-.066],[b[3][0]+.025,b[3][1],.066]);
        }
      }
    }
    const roof=ring(profile.at(-1));
    for(let i=1;i<roof.length-1;i++)p.quad('roof',roof[0],roof[i],roof[i+1],roof[i+1]);
    const lights=tail?'red':'lamp';
    for(const sign of [-1,1]){
      const y=classic?2.07:panorama?1.50:1.56;
      const upper=profile.findIndex(r=>r[0]>=y),lo=profile[upper-1],hi=profile[upper];
      const x=lo[1]+(hi[1]-lo[1])*(y-lo[0])/(hi[0]-lo[0]);
      p.box('hardware',x,y,sign*.75,.07,.245,.49);p.box(lights,x+.042,y,sign*.75,.045,.139,.365);
      p.box('hardware',9.78,.86,sign*.88,.12,.15,.49);
    }
    p.box('hardware',9.82,.70,0,.49,.27,.48);
    if(classic){
      p.quad('headmark',[10.101,1.32,.59],[10.101,1.32,-.59],[10.105,2.00,-.59],[10.105,2.00,.59]);
      p.box('roof',8.27,3.57,0,1.18,.27,.81);
      for(const z of [-.20,.20])p.box('lamp',8.87,3.59,z,.05,.15,.23);
    }
    if(panorama){
      // The raised driver's cabin extends aft above the saloon with a sloping fairing.
      for(const sign of [-1,1]){
        p.quad('face',[2.35,3.62,sign*1.13],[5.15,3.58,sign*1.18],[5.15,4.38,sign*.96],[3.68,4.20,sign*.96]);
        p.quad('roof',[2.35,3.62,0],[2.35,3.62,sign*1.13],[3.68,4.20,sign*.96],[3.68,4.20,0]);
        p.quad('roof',[3.68,4.20,0],[3.68,4.20,sign*.96],[5.15,4.45,sign*.94],[5.15,4.45,0]);
        p.quad('window',[3.47,3.72,sign*1.11],[4.95,3.72,sign*1.15],[4.95,4.19,sign*1.031],[3.79,4.07,sign*1.01]);
      }
      p.box('lounge',7.66,1.17,0,4.9,.20,2.62);
      for(const x of [5.55,6.68,7.80])for(const z of [-.75,.75]){
        p.box('cushion',x,1.57,z,.64,.18,.78);p.box('cushion',x-.29,1.86,z,.16,.69,.79);
        p.box('linen',x-.19,2.11,z,.038,.17,.49);p.box('hardware',x,1.36,z,.20,.36,.25);
      }
      p.box('hardware',9.46,1.66,0,.24,.10,2.45);
    }
  }
  function shell(p,cab,tail){
    const end=cab?cabJoint:9.84,start=-9.84;
    for(const s of [-1,1]){
      for(const [a,b] of [[start,-8.01],[-6.75,3.58],[4.84,end]]){
        if(b<=a)continue;
        const z=s*1.47;
        const uv=x=>(x+10)/20;
        p.quad('side',[a,1.02,z],[b,1.02,z],[b,3.4,z],[a,3.4,z],uv(a),0,uv(b),1);
      }
      p.box('sill',(end+start)/2,.98,s*1.405,end-start,.115,.105);
      p.box('body',(end+start)/2,3.47,s*1.39,end-start,.16,.16);
      p.box('roof',(end+start)/2,3.56,s*1.30,end-start,.11,.15);
      // Name boards are laid on the car side, outside the opening door travel.
      const x=-3.25,z=s*1.483,dir=s*1.15;
      p.quad('badge',[x-dir,1.50,z],[x+dir,1.50,z],[x+dir,1.95,z],[x-dir,1.95,z]);
    }
    p.box('roof',(start+end)/2,3.59,0,end-start,.13,2.52);
    p.box('skirt',(start+end)/2,.89,0,end-start,.20,2.62);
    p.box('body',-9.81,2.21,0,.08,2.36,2.74);
    if(!cab)p.box('body',9.8,2.21,0,.08,2.36,2.74);
    for(const x of cab?[-9.89]:[-9.89,9.89]){
      p.box('hardware',x,2.16,0,.34,2.21,1.23);
      p.box('window',x*1.018,2.55,0,.026,.65,.73);
    }
    for(const x of [-5.75,.30]){
      p.box('vent',x,3.78,0,2.62,.27,1.35);
      for(let i=-1.03;i<1.10;i+=.27)p.box('hardware',x+i,3.92,0,.125,.025,1.04);
    }
    p.box('hardware',-.15,.64,0,5.1,.52,1.68);
    for(const x of [-3.6,3.47])p.box('vent',x,.56,0,1.27,.83,1.53);
    if(cab)nose(p,tail);
  }
  function bogie(p,cx){
    p.box('hardware',cx,.53,0,2.56,.46,1.84);
    for(const x of [cx-.91,cx+.91])for(const s of [-1,1]){
      // Wheel discs run on a common axle. Faces are polygon fans in the X/Y plane.
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,b=(i+1)*Math.PI/6,point=(t,z)=>[x+.40*Math.cos(t),.40+.40*Math.sin(t),s*z];
        p.quad('wheel',point(a,.93),point(b,.93),point(b,1.14),point(a,1.14));
        p.quad('rim',[x,.40,s*1.14],point(a,1.14),point(b,1.14),point(b,1.14));
      }
      p.box('hardware',x,.42,s*1.17,.43,.31,.12);
    }
    for(const s of [-1,1]){p.box('skirt',cx,.56,s*1.16,2.64,.21,.16);p.box('vent',cx,.63,s*1.22,.52,.35,.13);}
  }
  const cars=formation.cars.map((car,index)=>{
    const tail=formation.count>1&&index===formation.count-1,cab=car.kind==='cab';
    const body=template(cab?'cab-'+tail:'middle',p=>shell(p,cab,tail)),doors=[];
    for(const side of [-1,1])for(const x of [-7.38,4.21])for(const half of [-1,1]){
      const leaf=template('door-'+side,p=>{
        const z=side*.04;
        p.quad('doorSkin',[-.31,1.035,z],[.31,1.035,z],[.31,3.325,z],[-.31,3.325,z]);
      });
      const baseX=x+half*.314,baseZ=side*1.475;
      leaf.position.set(baseX,0,baseZ);leaf.userData={side,half,baseX,baseZ,travel:.65};
      body.add(leaf);doors.push(leaf);
    }
    const parts={body,bogieFront:template('bogieFront',p=>bogie(p,6.8)),bogieBack:template('bogieBack',p=>bogie(p,-6.8))};
    root.add(...Object.values(parts));return {parts,doors,doorTargets:[],bogieOffsets:[6.8,-6.8],bogieOffset:6.8,tail};
  });
  return {root,cars,length:20.4,train:type,paint:{apply,dispose(){for(const r of resources)r.dispose();}}};
}
