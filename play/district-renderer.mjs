import * as T from 'three';
import {sampleRoute,ROAD_TYPES} from './core.mjs?v=rail-90';
import {STATION} from './district.mjs?v=rail-90';
import {CROSSING,mountainHeight} from './district-landscape.mjs?v=rail-90';

export function createDistrictRenderer(){
  const cube=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),cone=new T.ConeGeometry(1,1,6),disc=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),dummy=new T.Object3D();
  const mats=new Map(),emissive=[],textures=[];let phase='day';
  function mat(key,color,extra={}){const m=new T.MeshStandardMaterial({color,roughness:.85,...extra});mats.set(key,m);if(extra.emissive)emissive.push(m);return m}
  mat('concrete','#bfc3bc');mat('platform','#8e9694');mat('paving','#d2d0c4');mat('edge','#eee9d8');mat('yellow','#d5b553');
  mat('steel','#657676',{metalness:.45,roughness:.65});mat('roof','#3b5556',{metalness:.3});mat('dark','#323f42');mat('wood','#947150');mat('trunk','#645140');
  mat('leaf','#4e7150');mat('leafLight','#719159');mat('leafDark','#365f50');mat('grass','#83906c');mat('water','#547f8c',{metalness:.4,roughness:.25});mat('hill','#8daba4');mat('hillFar','#a4bab3');
  mat('ballast','#7c7d76');mat('sleeper','#6f6a5c');mat('rail','#bec6c4',{metalness:.8,roughness:.32});mat('white','#e6e7df');mat('asphalt','#646968');mat('rubber','#444a49');
  mat('lamp','#f0e1b3',{emissive:'#ffdda1',emissiveIntensity:0});mat('blue','#3f737e');
  function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;textures.push(t);return t}
  const glow=canvasTexture(64,64,(c)=>{const g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,'rgba(255,221,157,.42)');g.addColorStop(.4,'rgba(255,221,157,.23)');g.addColorStop(1,'rgba(255,221,157,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
  mats.set('pool',new T.MeshBasicMaterial({map:glow,transparent:true,depthWrite:false,opacity:0}));
  const forest=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#c0c7be';c.fillRect(0,0,w,h);let seed=927;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<6500;i++){const x=random()*w,y=random()*h,r=.6+random()*2,v=Math.floor(137+random()*90);c.fillStyle=`rgb(${v},${v+4},${v})`;c.beginPath();c.ellipse(x,y,r,r*.7,0,0,Math.PI*2);c.fill();}});forest.wrapS=forest.wrapT=T.RepeatWrapping;
  for(const [key,base]of[['grass',[133,148,115]],['ballast',[133,129,117]],['paving',[191,192,181]]]){
    const map=canvasTexture(512,512,(c,w,h)=>{const pixels=c.createImageData(w,h);let seed=713;for(let i=0;i<w*h;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=(seed/4294967296-.5)*(key==='ballast'?65:13);for(let j=0;j<3;j++)pixels.data[i*4+j]=base[j]+n;pixels.data[i*4+3]=255;}c.putImageData(pixels,0,0);if(key==='paving'){c.strokeStyle='#aeb3a5';c.lineWidth=.4;for(let i=0;i<512;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i,512);c.moveTo(0,i);c.lineTo(512,i);c.stroke();}}});mats.get(key).map=map;mats.get(key).color.set('#ffffff');
  }
  for(let variant=0;variant<7;variant++){
    const colors=['#b6bbb7','#b8b1a4','#889da5','#bfc4c1','#aeb6b5','#d0c4b0','#8eabae'];
    const paint=(ctx,w,h,lights)=>{
      ctx.fillStyle=lights?'#000':colors[variant];ctx.fillRect(0,0,w,h);
      const cols=variant===6?8:5,rows=variant===5?3:10,cw=w/cols,rh=h/rows;
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const lit=(x*13+y*7+variant*11)%9<4,px=x*cw+cw*.16,py=y*rh+rh*.15,ww=cw*.7,hh=rh*.67;
        if(lights){ctx.fillStyle=lit?'#f6d799':'#000';ctx.fillRect(px,py,ww,hh);continue;}
        ctx.fillStyle='#606e71';ctx.fillRect(px-2,py-2,ww+4,hh+4);
        const g=ctx.createLinearGradient(0,py,0,py+hh);g.addColorStop(0,'#4a687b');g.addColorStop(.55,'#81989b');g.addColorStop(1,'#4e646d');ctx.fillStyle=g;ctx.fillRect(px,py,ww,hh);
        ctx.fillStyle='#b0bfbb';ctx.fillRect(px+ww*.49,py,1,hh);
        if((x+y+variant)%4===0){ctx.fillStyle='#b8b5a5';ctx.fillRect(px,py,ww,hh*.3);}
      }
      if(!lights){ctx.fillStyle='rgba(30,40,40,.2)';for(let y=0;y<rows;y++)ctx.fillRect(0,y*rh-2,w,3);}
    };
    mat('facade'+variant,'#ffffff',{map:canvasTexture(256,512,(c,w,h)=>paint(c,w,h,false)),emissiveMap:canvasTexture(256,512,(c,w,h)=>paint(c,w,h,true)),emissive:'#ffffff',emissiveIntensity:0,roughness:variant===2||variant===6?.4:.88});
  }
  const signCache=new Map();
  function sign(text,sub='MIDORI CENTRAL',color='#276452'){
    const key=text+'|'+sub;if(signCache.has(key))return signCache.get(key);
    const map=canvasTexture(1024,256,(c,w,h)=>{c.fillStyle='#f3f0e5';c.fillRect(0,0,w,h);c.fillStyle=color;c.fillRect(0,h*.68,w,h*.17);c.fillStyle='#213c39';c.font='bold 82px sans-serif';c.textAlign='center';c.fillText(text,w/2,112);c.font='28px sans-serif';c.fillText(sub,w/2,157);});
    const name='sign'+signCache.size;mat(name,'#ffffff',{map,emissiveMap:map,emissive:'#ffffff',emissiveIntensity:0});signCache.set(key,name);return name;
  }
  const stationSign=sign(STATION.name),cafeSign=sign('COFFEE','ROASTERY & CAFE','#926547'),marketSign=sign('MARKET','FRESH & LOCAL','#486957');
  function build(town,route,opposite){
    const group=new T.Group(),buckets=new Map();group.name='station-district';
    function shape(key,w,h,d,x,y,z,angle=0,kind='box',color=null,tilt=0){
      const id=key+'/'+kind;if(!buckets.has(id))buckets.set(id,{key,kind,items:[]});buckets.get(id).items.push({w,h,d,x,y,z,angle,color,tilt});
    }
    const box=(key,w,h,d,x,y,z,a=0)=>shape(key,w,h,d,x,y,z,a);
    const tree=(x,z,scale=1)=>{box('trunk',.35,3*scale,.35,x,1.0*scale,z);shape('leaf',2.4*scale,2.7*scale,2.4*scale,x,3.4*scale,z,0,'sphere');shape('leafLight',1.8*scale,2*scale,1.8*scale,x+scale,3*scale,z+.5,0,'sphere');};
    // Pavement and park islands form a coherent ground plane inside the loop.
    box('grass',650,.02,520,200,-.49,-140);
    box('paving',406,.02,262,197,-.455,-140);
    box('paving',246,.02,60,205,-.455,65);
    box('grass',146,.09,55,101,-.28,-190);box('grass',148,.09,55,295,-.28,-90);
    for(const [x,z]of [[30,-182],[55,-190],[80,-178],[100,-201],[131,-181],[161,-199],[243,-88],[279,-89],[310,-98],[350,-88]])tree(x,z,1.6);
    // Station forecourt connects to the existing east-west street.
    box('paving',260,.12,28,210,-.27,-20);
    for(const x of[96,126,286,316]){box('concrete',8,.6,4,x,.05,-23);box('grass',7.6,.12,3.6,x,.4,-23);tree(x,-23,1.2);}
    for(const p of town.props.filter(p=>!ROAD_TYPES.includes(p.type))){
      const [x,y,a]=p.pose,z=-y;if(p.type==='tree'){tree(x,z,p.scale);continue;}
      const small=p.type==='shop',h=(small?5.2:p.type==='hotel'?31:p.type==='office'?23:17)*p.scale,w=small?15:16,d=small?13:14;
      const variant=small?5:p.type==='office'?p.uid%2===0?2:6:p.type==='hotel'?3:p.uid%2;
      const local=(dx,dz)=>[x+dx*Math.cos(a)+dz*Math.sin(a),z-dx*Math.sin(a)+dz*Math.cos(a)];
      box('paving',w+3,.14,d+3,x,-.22,z,a);shape('facade'+variant,w,h,d,x,h/2-.18,z,a,'box',p.tint);
      box('roof',w+.4,.25,d+.4,x,h,z,a);const [rx,rz]=local(0,-d/2);box('edge',w+.2,.5,.2,rx,h+.2,rz,a);
      // A recessed ground floor, entrance canopy, rooftop plant and parapet.
      const [ex,ez]=local(-w/2-.25,0);box('dark',.2,2.6,small?8:4,ex,1.2,ez,a);
      box(small?(p.uid%3===0?'wood':p.uid%3===1?'blue':'roof'):'concrete',2.2,.16,small?d:5,ex,2.7,ez,a);
      if(small){const [sx,sz]=local(-w/2-1.3,0);box(p.uid%2?cafeSign:marketSign,.12,.9,7,sx,3.5,sz,a);}
      else{box('concrete',3.2,1.3,3,x+2,h+.8,z,a);box('steel',2,.4,2,x-4,h+.5,z+3,a);for(const side of[-1,1]){const [px,pz]=local(side*(w/2-.15),0);box('concrete',.3,.65,d,px,h+.2,pz,a);}}
      if(p.type==='apartment')for(let floor=1;floor<h/3;floor++){const[px,pz]=local(-8.3,0);box('edge',1.1,.12,13.5,px,floor*3,pz,a);}
    }
    // Island platform: 2 m from each track centre, leaving the rolling stock clear.
    box('concrete',240,1.22,6,210,.29,5);box('platform',240,.10,6,210,.95,5);
    for(const z of[2.28,7.72])box('yellow',238,.035,.32,210,1.025,z);
    for(const z of[2.05,7.95])box('edge',240,.05,.1,210,1.03,z);
    box('roof',178,.22,5.8,210,4.35,5);box('edge',178,.12,.28,210,4.16,2.12);box('edge',178,.12,.28,210,4.16,7.88);
    for(let x=126;x<=294;x+=14){box('steel',.2,3.2,.2,x,2.65,5);box('steel',.16,.22,5.7,x,4.15,5);box('lamp',4,.05,.22,x,4.16,3.5);shape('pool',18,1,6,x,1.055,5,0,'disc');}
    for(const x of[117,158,257,304]){box(stationSign,5.5,1.05,.1,x,2.5,5);for(const dx of[-2.4,2.4])box('steel',.06,1.5,.06,x+dx,1.72,5);box('wood',3.5,.13,.7,x,1.47,4);box('steel',.12,.5,.5,x-1.2,1.21,4);box('steel',.12,.5,.5,x+1.2,1.21,4);}
    // Glazed footbridge clears both overhead wires, with stairs onto the island.
    box('concrete',10,.6,36,210,7.8,-5);box('facade2',10,3,36,210,9.6,-5);box('roof',11,.3,37,210,11.2,-5);
    for(const x of[206,214])for(const z of[13,-23])box('concrete',.6,8,.6,x,3.6,z);
    for(const z of[5,-21]){for(let i=0;i<34;i++){box('concrete',.52,.2*(i+1),2.8,187+i*.52,1+.1*(i+1),z);if(i%4===0)for(const side of[-1,1])box('steel',.05,1,.05,187+i*.52,1.5+.2*(i+1),z+side*1.45);}for(const side of[-1,1])shape('steel',18.45,.09,.09,195.6,5.5,z+side*1.45,0,'box',null,Math.atan2(6.6,17.16));}
    box('concrete',20,1,18,210,.1,-23);box(stationSign,12,2,.15,210,5.5,-32);box('roof',21,.22,20,210,6.8,-23);
    for(const x of[202,218])for(const z of[-15,-31])box('steel',.25,6,.25,x,3.2,z);
    // Decorative rail corridor is derived from the actual routes, never a picture.
    // A single continuous gravel ribbon covers both tracks and their separation.
    const bedPositions=[],bedUV=[],bedIndices=[];
    const bedSteps=Math.ceil(route.length/2);
    for(let i=0;i<=bedSteps;i++){
      const s=route.length*i/bedSteps,p=sampleRoute(route,s),a=p[2];
      for(const l of[-6,16]){bedPositions.push(p[0]+Math.sin(a)*l,-.285,-p[1]+Math.cos(a)*l);bedUV.push(s/6,(l+6)/6);}
      if(i<bedSteps){const n=i*2;bedIndices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    const bedGeometry=new T.BufferGeometry();bedGeometry.setAttribute('position',new T.Float32BufferAttribute(bedPositions,3));bedGeometry.setAttribute('uv',new T.Float32BufferAttribute(bedUV,2));bedGeometry.setIndex(bedIndices);bedGeometry.computeVertexNormals();
    const bedMat=mats.get('ballast').clone(),bedMap=mats.get('ballast').map.clone();bedMap.wrapS=bedMap.wrapT=T.RepeatWrapping;bedMat.map=bedMap;bedMat.side=T.DoubleSide;bedMat.color.set('#d6d8d7');
    const bed=new T.Mesh(bedGeometry,bedMat);bed.name='continuous-gravel-corridor';bed.receiveShadow=true;bed.userData.ownedGeometry=true;bed.userData.ownedMaterial=true;bedMat.addEventListener('dispose',()=>bedMap.dispose());group.add(bed);
    for(const r of[route,opposite]){
      if(r===opposite)for(let s=0;s<r.length;s+=.75){const p=sampleRoute(r,s);box('sleeper',.2,.12,2.35,p[0],-.19,-p[1],p[2]);}
      for(let s=0;s<r.length;s+=3){const a=sampleRoute(r,s),b=sampleRoute(r,Math.min(s+3,r.length)),dx=b[0]-a[0],dy=b[1]-a[1],angle=Math.atan2(dy,dx),len=Math.hypot(dx,dy),x=(a[0]+b[0])/2,z=-(a[1]+b[1])/2;
        box('ballast',len+.035,.16,3.2,x,-.35,z,angle);
        if(r===opposite)for(const side of[-1,1])box('rail',len+.01,.13,.065,x+Math.sin(angle)*.5685*side,-.015,z+Math.cos(angle)*.5685*side,angle);
      }
    }
    const wires=[];
    for(let s=0;s<route.length;s+=25){const p=sampleRoute(route,s);if(Math.abs(p[0]-CROSSING.x)<7&&p[1]>270)continue;const a=p[2],pos=(l,h)=>[p[0]+Math.sin(a)*l,h,-p[1]+Math.cos(a)*l];
      for(const l of[-4.5,14.5])box('steel',.23,7.3,.23,...pos(l,3.2));box('steel',.18,.2,19,...pos(5,6.75),a);
      for(const l of[0,10]){const[x,h,z]=pos(l,6.15);box('steel',.12,.6,.12,x,h+.25,z);}
    }
    for(const r of[route,opposite])for(let s=0;s<r.length;s+=5){const a=sampleRoute(r,s),b=sampleRoute(r,Math.min(s+5,r.length));wires.push(a[0],6.12,-a[1],b[0],6.12,-b[1]);}
    const wireGeometry=new T.BufferGeometry();wireGeometry.setAttribute('position',new T.Float32BufferAttribute(wires,3));
    const lines=new T.LineSegments(wireGeometry,new T.LineBasicMaterial({color:'#546467',transparent:true,opacity:.65}));lines.userData.ownedGeometry=true;lines.userData.ownedMaterial=true;group.add(lines);
    for(let s=0;s<route.length;s+=4){const p=sampleRoute(route,s),a=p[2];if(p[1]<1&&p[0]>80&&p[0]<340||p[1]>270&&Math.abs(p[0]-CROSSING.x)<7)continue;const x=p[0]-Math.sin(a)*4,z=-p[1]-Math.cos(a)*4;box('steel',.07,1.25,.07,x,.25,z);box('steel',4,.06,.06,x,.8,z,a);box('steel',4,.06,.06,x,.2,z,a);}
    // Road crosses both lines through flangeways; warning equipment stays outside.
    const cx=CROSSING.x;
    box('asphalt',6,.14,87,cx,-.21,-283.5);
    box('asphalt',14,.14,10,cx,-.21,-322);
    for(const side of[-1,1])for(const [cy,length]of[[256,24],[311,29]])box('white',.10,.02,length,cx+side*2.7,-.125,-cy);
    for(const y of[272,298])box('white',5.3,.025,.35,cx,-.115,-y);
    for(const y of[280,290]){
      box('rubber',6,.12,.94,cx,-.07,-y);
      for(const side of[-1,1])box('rubber',6,.12,1.12,cx,-.07,-y+side*1.22);
    }
    const gates=[],lamps=[];
    const piece=(w,h,d,x,y,z,material,parent)=>{const mesh=new T.Mesh(cube,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;};
    for(const [x,y,dir]of[[cx-3.6,274,1],[cx+3.6,296,-1]]){
      box('yellow',.18,3.4,.18,x,1.4,-y);box('dark',.75,.95,.6,x,.25,-y);
      for(let k=0;k<6;k++)box('dark',.19,.23,.19,x,.4+k*.46,-y);
      for(const tilt of[-.68,.68])shape('yellow',1.15,.17,.12,x,3.0,-y,0,'box',null,tilt);
      for(const dx of[-.3,.3]){box('dark',.46,.44,.28,x+dx,2.45,-y);const material=new T.MeshBasicMaterial({color:'#461c15'}),lamp=new T.Mesh(sphere,material);lamp.scale.set(.17,.17,.18);lamp.position.set(x+dx,2.45,-y);lamp.userData.ownedMaterial=true;group.add(lamp);lamps.push(lamp);}
      const pivot=new T.Group();pivot.position.set(x,.8,-y);pivot.rotation.order='YXZ';pivot.rotation.y=dir*Math.PI/2;group.add(pivot);
      piece(.12,.12,7.2,0,0,3.6,mats.get('yellow'),pivot);
      for(let j=0;j<12;j++)piece(.125,.125,.25,0,0,.3+j*.6,mats.get('dark'),pivot);
      gates.push({obj:pivot,s:-1});
    }
    group.userData.crossing={uid:CROSSING.uid,gates,lamps,angle:1,alarm:false,clear:0,district:true};
    // River and distant terrain give the horizon depth without hiding the line.
    box('water',3600,.02,66,200,-.465,-365);for(const z of[-330,-400])box('concrete',3600,.45,3,200,-.2,z);
    for(let layer=2;layer>=0;layer--){
      const nx=240,nz=30,positions=[],colors=[],uv=[],indices=[],base=new T.Color(['#526b5c','#708679','#8a9c94'][layer]);
      for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
        const x=-2300+i/nx*5000,t=j/nz,h=mountainHeight(x,t,layer);
        positions.push(x,h*.65-.45,-480-layer*340-t*680);
        uv.push(x/130,t*680/130);
        const shade=.86+.12*Math.sin(x*.017+t*31)+.06*Math.sin(x*.051-t*23),c=base.clone().multiplyScalar(shade);colors.push(c.r,c.g,c.b);
        if(i<nx&&j<nz){const n=j*(nx+1)+i;indices.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);}
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
      const material=new T.MeshStandardMaterial({vertexColors:true,map:forest,bumpMap:forest,bumpScale:.8,roughness:1,side:T.DoubleSide}),terrain=new T.Mesh(geometry,material);terrain.name='mountain-ridge-'+layer;terrain.userData.ownedGeometry=true;terrain.userData.ownedMaterial=true;group.add(terrain);
    }
    for(let x=35;x<=375;x+=28){box('steel',.13,6,.13,x,2.7,-34);box('steel',2,.12,.12,x+.9,5.7,-34);box('lamp',.9,.13,.45,x+1.3,5.6,-34);shape('pool',18,1,18,x+1.3,-.16,-34,0,'disc');}
    for(const {key,kind,items}of buckets.values()){
      const mesh=new T.InstancedMesh(kind==='sphere'?sphere:kind==='cone'?cone:kind==='disc'?disc:cube,mats.get(key),items.length);
      items.forEach((o,i)=>{dummy.position.set(o.x,o.y,o.z);dummy.rotation.set(0,o.angle,o.tilt);dummy.scale.set(o.w,o.h,o.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(o.color)mesh.setColorAt(i,new T.Color(o.color));});
      mesh.castShadow=!['water','grass','paving','platform','ballast','sleeper','rail','lamp','pool'].includes(key);mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);
    }
    setPhase(phase);return group;
  }
  function setPhase(next){phase=next;for(const m of emissive)m.emissiveIntensity=phase==='night'?1.35:phase==='sunset'?.35:0;mats.get('pool').opacity=phase==='night'?.8:phase==='sunset'?.2:0;}
  return{build,setPhase};
}
