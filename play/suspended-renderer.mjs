import {stationSigns} from './suspended-signs.mjs?v=rail-90';
import * as T from 'three';
import {shiomiMaterials,shiomiCoast} from './suspended-art.mjs?v=rail-90';
import {dressStation} from './suspended-stations.mjs?v=rail-90';
import {railSample,northing,floorHeight,suspendedStations,portal,lane,rockCuts,cutProfile} from './suspended-route.mjs?v=rail-90';

export function createSuspendedTown(){
  const root=new T.Group(),rows=new Map(),resources=[],dummy=new T.Object3D();
  const shapes={box:new T.BoxGeometry(),tree:new T.IcosahedronGeometry(.5,1),post:new T.CylinderGeometry(.5,.55,1,10),hill:new T.SphereGeometry(.5,20,10,0,Math.PI*2,0,Math.PI/2)};
  // Both gable ends share a single two-triangle template; the roof covers the sides.
  const gable=new T.BufferGeometry();
  gable.setAttribute('position',new T.Float32BufferAttribute([
    -.5,0,.5,.5,0,.5,0,1,.5, .5,0,-.5,-.5,0,-.5,0,1,-.5
  ],3));gable.computeVertexNormals();shapes.gable=gable;
  const mat=new T.MeshStandardMaterial({roughness:.87});resources.push(mat,...Object.values(shapes));
  const skins=shiomiMaterials(resources),updateSea=shiomiCoast(root,resources);
  const leafPlane=new T.PlaneGeometry(),shadowDisc=new T.CircleGeometry(.5,12).rotateX(-Math.PI/2);resources.push(leafPlane,shadowDisc);
  const models={...shapes,house0:shapes.box,house1:shapes.box,house2:shapes.box,paving:shapes.box,tactile:shapes.box,estate:shapes.box,office:shapes.box,tile:shapes.box,spray:leafPlane,shade:shadowDisc};
  function put(shape,x,h,z,w,height,d,color,yaw=0,tilt=0){
    dummy.position.set(x,h,z);dummy.rotation.set(0,yaw,tilt,'YXZ');dummy.scale.set(w,height,d);dummy.updateMatrix();
    const key=shape+Math.floor(x/300);
    if(!rows.has(key))rows.set(key,{shape,list:[]});
    rows.get(key).list.push([dummy.matrix.clone(),color]);
  }
  const box=(...a)=>put('box',...a),post=(...a)=>put('post',...a);
  let seed=5203;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  function member(a,b,w,h,color){
    const dx=b[0]-a[0],dz=b[2]-a[2],dh=b[1]-a[1];
    box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,Math.hypot(dx,dz,dh)+.025,h,w,color,Math.atan2(-dz,dx),Math.atan2(dh,Math.hypot(dx,dz)));
  }
  function point(x,v,above=0){const p=railSample(x,v);return [p[0],p[3]+above,-p[1]];}
  function tree(x,h,z,size){
    const turn=rand()*Math.PI*2;
    post(x,h+size*.28,z,.075*size,size*.58,.073*size,'#776c55');
    for(let i=0;i<3;i++){
      const a=turn+i*2.09,r=size*.2;
      const bx=x+r*Math.cos(a),bz=z+r*Math.sin(a);
      member([x,h+size*.39,z],[bx,h+size*.62,bz],.12,.14,'#695d4b');
      put('tree',bx,h+size*(.63+.07*i),bz,size*.51,size*.52,size*.47,['#487452','#5d8058','#768c58'][i],a);
      put('spray',bx,h+size*(.63+.07*i),bz,size*.92,size*.81,1,'#eaf0c9',a);
    }
    put('shade',x,h+.06,z,size*.64,.025,size*.49,'#7e936c',turn);
  }
  const {board:textBoard,finish:finishSigns}=stationSigns(root,resources);
  // Longitudinal strips use the actual track gradient, leaving an open railway cut.
  const turf=[],cliffs=[],stream=[],streamColors=[],gravel=[];
  const streamCenter=x=>15.5+3.3*Math.sin((x-900)*.033)+1.4*Math.sin(x*.079);
  function streamWidth(x){
    const taper=Math.min(1,(x-940)/30,(1480-x)/30);
    return Math.max(0,taper)*(2.8+.72*Math.sin(x*.042));
  }
  function strip(list,a,b,c,d){list.push(...a,...b,...c,...a,...c,...d);}
  // Index existing terrain triangles once. A camera samples only its current 32 m cell.
  const groundCells=new Map();
  function indexGround(points,roof=false){
    for(let i=0;i<points.length;i+=9){
      const [ax,ay,az,bx,by,bz,cx,cy,cz]=points.subarray(i,i+9);
      const det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);
      if(Math.abs(det)<1e-6)continue;
      const triangle={points,i,det,roof};
      for(let x=Math.floor(Math.min(ax,bx,cx)/32);x<=Math.floor(Math.max(ax,bx,cx)/32);x++){
        for(let z=Math.floor(Math.min(az,bz,cz)/32);z<=Math.floor(Math.max(az,bz,cz)/32);z++){
          const key=x+','+z;
          if(!groundCells.has(key))groundCells.set(key,[]);
          groundCells.get(key).push(triangle);
        }
      }
    }
  }
  function groundHeight(x,z,inBore){
    let height=-1.25;
    const cell=groundCells.get(Math.floor(x/32)+','+Math.floor(z/32));
    if(!cell)return height;
    for(const {points:p,i,det,roof} of cell){
      if(inBore && roof && Math.abs(z+northing(x))<11)continue;
      const dx=x-p[i+6],dz=z-p[i+8];
      const a=((p[i+5]-p[i+8])*dx+(p[i+6]-p[i+3])*dz)/det;
      const b=((p[i+8]-p[i+2])*dx+(p[i]-p[i+6])*dz)/det;
      if(a>=-1e-6 && b>=-1e-6 && a+b<=1.000001)
        height=Math.max(height,p[i+7]+a*(p[i+1]-p[i+7])+b*(p[i+4]-p[i+7]));
    }
    return height;
  }
  function surface(vertices,color,skin=null,colors=null,groundType=null){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();
    if(groundType)indexGround(g.attributes.position.array,groundType==='roof');
    const uv=[];
    for(let i=0;i<vertices.length;i+=3){
      const x=vertices[i],h=vertices[i+1],z=vertices[i+2];
      if(skin==='rockFace'){uv.push(x/8,(h+.14*x)/5);continue;}
      if(skin==='stone'){uv.push(z/7,h/4);continue;}
      uv.push(skin==='lining'?x/9:x/43,skin==='lining'?(h+.31*z)/7:z/43);
    }
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    const m=skin?skins[skin]:new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:1});
    if(colors){g.setAttribute('color',new T.Float32BufferAttribute(colors,3));m.vertexColors=true;}
    if(skin==='lining'||skin==='sand'){
      const colors=[];
      for(let i=0;i<vertices.length;i+=3){
        const [x,y,z]=vertices.slice(i,i+3);
        if(skin==='sand'){
          const wet=T.MathUtils.smoothstep(.58-y,0,1.16);
          colors.push(1-.37*wet,1-.31*wet,1-.24*wet);
        }else{
          const lampPhase=x+(z< -northing(x)?5:0);
          const nearLamp=(1+Math.cos(lampPhase*Math.PI*2/15))*.5;
          const glow=nearLamp*Math.exp(-Math.abs(y-floorHeight(x)-1.85)*.12);
          colors.push(.58+.42*glow,.62+.36*glow,.65+.24*glow);
        }
      }
      g.setAttribute('color',new T.Float32BufferAttribute(colors,3));m.vertexColors=true;
    }
    if(skin==='forest'){
      // Shared world-space tints keep the relief continuous across triangle edges.
      const tint=new Uint8Array(vertices.length);
      for(let i=0;i<vertices.length;i+=3){
        const x=vertices[i],height=vertices[i+1],z=vertices[i+2];
        const ridge=T.MathUtils.clamp((height-floorHeight(x)+10)/70,0,1);
        const grove=.5+.25*Math.sin(x*.032+z*.049)+.25*Math.sin(x*.056-z*.026);
        tint[i]=170+40*ridge+24*grove;
        tint[i+1]=185+41*ridge+15*grove;
        tint[i+2]=189+21*ridge+12*grove;
      }
      g.setAttribute('color',new T.Uint8BufferAttribute(tint,3,true));m.vertexColors=true;
    }
    root.add(new T.Mesh(g,m));resources.push(g);if(!skin)resources.push(m);
  }
  box(880,-3,0,3400,3.5,3600,'#86a276');
  for(let x=-120;x<2120;x+=10){
    const next=x+10;
    if(x>=940&&x<1480){
      const bank=u=>{
        const c=streamCenter(u),w=streamWidth(u);
        return [point(u,0,-9.1),point(u,c-1.5*w,-9.1),point(u,c-w,-9.50),
          point(u,c+.18*w,-9.50),point(u,c+w,-9.50),point(u,c+1.5*w,-9.1),point(u,25,-9.1)];
      };
      const a=bank(x),b=bank(next);
      for(const [i,material] of [turf,gravel,stream,stream,gravel,turf].entries()){
        strip(material,a[i],b[i],b[i+1],a[i+1]);
        if(material===stream){
          const tone=(u,deep)=>new T.Color(deep?'#558988':'#96aaa0').multiplyScalar(.95+.05*Math.sin(u*.17));
          const a0=tone(x,i===3),a1=tone(x,i===2),b0=tone(next,i===3),b1=tone(next,i===2);
          for(const c of [a0,b0,b1,a0,b1,a1])streamColors.push(c.r,c.g,c.b);
        }
      }
    }
    for(const [v,u] of [[-160,-25],[-25,0],[0,25],[25,160]]){
      if(v===0&&x>=940&&x<1480)continue;
      strip(turf,point(x,v,-9.1),point(next,v,-9.1),point(next,u,-9.1),point(x,u,-9.1));
    }
    for(const side of [-1,1]){
      strip(cliffs,point(x,side*160,-9.1),point(next,side*160,-9.1),[next,-1,-northing(next)-side*235],[x,-1,-northing(x)-side*235]);
    }
    if(x<1300){
      member(point(x,0,-9.08),point(next,0,-9.08),12,.16,'#68747a');
      if(x%20===0)member(point(x,0,-8.97),point(x+4,0,-8.97),.16,.06,'#e8dcc2');
    }
  }
  surface(turf,'#97ad7e','meadow',null,'ground');surface(cliffs,'#7c956f',null,null,'ground');
  surface(stream,'#ffffff',null,streamColors,'ground');surface(gravel,'#b6af93',null,null,'ground');
  for(let x=961;x<1470;x+=23){
    const side=x%2?1:-1,q=point(x,streamCenter(x)+side*streamWidth(x),-9.43);
    put('tree',q[0],q[1],q[2],2.3,.74,1.5,'#959682',x*.31);
  }
  const rushes=[];
  for(let x=970;x<1470;x+=17){
    const side=Math.sin(x*.19)>0?1:-1;
    const [u,y,z]=point(x,streamCenter(x)+side*streamWidth(x)*1.32,-9.20);
    for(let n=0;n<7;n++){
      const a=n*2.4+x,dx=.48*Math.cos(a),dz=.48*Math.sin(a);
      rushes.push(u+dx-.13,y,z+dz,u+dx+.14,y,z+dz,u+1.65*dx,y+.7+n*.07,z+1.8*dz);
    }
  }
  surface(rushes,'#809154');
  // Low footbridge spanning the full gravel bed.
  const bridgeX=1296,bankOffset=streamCenter(bridgeX);
  for(let j=-9;j<=9;j++){
    const q=point(bridgeX,bankOffset+j*.56,-8.54);
    box(q[0],q[1],q[2],2.15,.18,.55,'#a58b69',railSample(bridgeX,0)[2]);
  }
  for(const end of [-1,1]){
    const x=bridgeX+end*.94;
    for(const d of [-5,0,5]){
      const q=point(x,bankOffset+d,-8.12);post(q[0],q[1],q[2],.14,1.1,.14,'#746954');
    }
    member(point(x,bankOffset-5,-7.60),point(x,bankOffset+5,-7.60),.12,.15,'#897359');
  }
  // Pavement, shopfronts and short feeder streets connect the houses to the avenue.
  for(let x=-40;x<900;x+=10)for(const side of [-1,1]){
    member(point(x,side*6.38,-8.92),point(x+10,side*6.38,-8.92),.32,.35,'#b7b8ab');
    member(point(x,side*8.2,-8.90),point(x+10,side*8.2,-8.90),3.4,.32,'#c4bfaf');
    if(x%70===0){
      const q=point(x,side*8.6,-9.05);
      post(q[0],q[1]+3.05,q[2],.18,6.1,.18,'#687b7a');
      member([q[0],q[1]+6,q[2]],[q[0],q[1]+6.22,q[2]+side*1.48],.13,.13,'#84938b');
      box(q[0],q[1]+6.18,q[2]+side*1.5,.43,.19,.67,'#d8decc');
    }
  }
  for(const x of [175,395,635,842]){
    const q=point(x,0,-9.01);
    box(q[0],q[1],q[2],6.4,.18,123,'#717878');
    for(let j=-3;j<=3;j++)member(point(x+8,j*1.48-0.46,-8.82),point(x+8,j*1.48+.46,-8.82),2.55,.04,'#e6e1ce');
  }
  function parkedCar(x,h,z,color,across=false){
    const part=(dx,dy,dz,w,height,d,tint)=>box(x+(across?dz:dx),h+dy,z+(across?-dx:dz),
      across?d:w,height,across?w:d,tint);
    part(0,.66,0,3.8,.80,1.63,color);part(-.14,1.25,0,2.17,.69,1.47,'#58717a');
    part(-.14,1.62,0,2.19,.12,1.51,color);
    for(const end of [-1,1])for(const side of [-1,1])part(end*1.18,.4,side*.79,.58,.54,.16,'#465051');
    for(const side of [-1,1])part(1.92,.75,side*.53,.06,.19,.32,'#eee4c3');
  }
  for(let i=0;i<24;i++){
    const x=275+i*26,h=floorHeight(x)-9.1,side=i%2?1:-1;
    parkedCar(x,h,-northing(x)+side*(15+i%3*9),['#ac6559','#ddd7c5','#7b9ba7','#77877d'][i%4]);
  }
  const shopNames=['潮見書店','きっさ はとば','桜ヶ丘商店','街角ベーカリー'];
  shopNames.forEach((name,i)=>{
    const x=[122,202,475,568][i],h=floorHeight(x)-9.1,z=-northing(x)-18.5;
    box(x,h+2.16,z,12.8,4.32,6.9,'#ddcfb9');
    box(x,h+1.55,z+3.48,11.2,2.65,.12,'#54767b');
    for(let j=-5;j<=5;j+=2)box(x+j,h+1.62,z+3.56,.12,2.67,.10,'#d9daca');
    box(x,h+3.08,z+4.12,12.2,.21,1.95,i%2?'#aa7764':'#718d82');
    for(let j=0;j<12;j++){
      const tint=j%2?'#ece5cb':i%2?'#ab705e':'#66897f';
      box(x-5.6+j*1.02,h+3,z+5.05,1.02,.30,.12,tint);
    }
    // Merchandise shelves and a pavement sign under the striped valance.
    for(let j=0;j<7;j++)box(x-4.6+j*1.4,h+1.07,z+3.58,.85,.47,.10,['#b8aa83','#c1896d','#879e8d'][j%3]);
    box(x+4.8,h+.63,z+5.42,.8,1.2,.10,'#6f746d');
    textBoard(name,x,h+3.76,z+3.57,7.6,1.02,0,i%2?'#76574b':'#526a5b');
  });
  // Box girders have two lower lips and a centre slot for the suspension links.
  function beam(x,end,offsetA,offsetB){
    for(const side of [-1,1]){
      member(point(x,offsetA+side*.66,5.32),point(end,offsetB+side*.66,5.32),.15,1.17,'#798c94');
      member(point(x,offsetA+side*.45,4.79),point(end,offsetB+side*.45,4.79),.49,.13,'#98acb1');
    }
    member(point(x,offsetA,5.93),point(end,offsetB,5.93),1.47,.15,'#a6b9bc');
  }
  // Join straight lengths only when every original joint is within 2 cm of the chord.
  for(let x=30;x<2100;x+=30)for(const off of [-4.5,4.5]){
    const a=new T.Vector3(...point(x,off)),b=new T.Vector3(...point(x+30,off));
    const straight=[5,10,15,20,25].every(d=>a.clone().lerp(b,d/30).distanceTo(new T.Vector3(...point(x+d,off)))<.02);
    if(straight)beam(x,x+30,off,off);
    else for(let d=0;d<30;d+=5)beam(x+d,x+d+5,off,off);
  }
  for(let x=30;x<2100;x+=5){
    if(x>=145&&x<230)beam(x,x+5,lane(x,-1),lane(x+5,-1));
    if(x>=1895&&x<1980)beam(x,x+5,lane(x,1),lane(x+5,1));
    if((x-30)%30===0){
      for(const off of [-4.5,4.5])for(const side of [-1,1]){
        const start=point(x-.23,off+side*.76,5.30),end=point(x+.23,off+side*.76,5.30);
        member(start,end,.09,.91,'#5c747e');
      }
      const [u,h,z]=point(x,0);
      if(x<portal[0]||x>portal[1]){
        if((x>=140&&x<=240)||(x>=1885&&x<=1990)){
          for(const edge of [-1,1]){const q=point(x,edge*9.2);post(q[0],h-1.3,q[2],1.05,15.8,1.05,'#acb7b3');}
          member(point(x,-9.6,6.45),point(x,9.6,6.45),1,.9,'#b3c2c0');
        }else post(u,h-1.3,z,1.05,15.8,1.05,'#acb7b3');
      }
      member(point(x,-5.45,6.45),point(x,5.45,6.45),.7,.83,'#bbc4bf');
    }
  }
  for(const x of [30,2100])for(const off of [-4.5,4.5]){
    const [u,h,z]=point(x,off);
    box(u,h+5.34,z,.38,1.58,1.72,'#a85e4a');
    box(u,h+4.28,z,.27,.48,1.28,'#716c62');
  }
  // Built-up centre: track and platforms pass through an open floor of the station building.
  const city=floorHeight(70)-9.1;
  function tower(x,z,w,d,height){
    put('office',x,city+height/2,z,w,height,d,'#dde3e0');
    for(let h=2;h<height;h+=3.5)box(x,city+h,z,w+.6,.48,d+.6,'#c4cbc2');
    for(const side of [-1,1])box(x+side*(w/2-.4),city+height/2,z,1.1,height,d+.42,'#c6cabe');
    box(x,city+height+.36,z,w+1,.7,d+1,'#e0dcc9');box(x,city+height+1.2,z,w*.63,1.3,d*.65,'#91a5a6');
  }
  for(let x=-40;x<350;x+=35)for(const side of [-1,1]){
    const z=-northing(x)+side*(37+rand()*18);tower(x,z,17+rand()*10,17+rand()*8,13+rand()*33);
  }
  box(70,7,0,86,8,28,'#b4b9ae');
  for(const z of [-14.7,14.7])for(let x=32;x<112;x+=13)box(x,16.7,z,1,11,1,'#c5ceca');
  box(70,24,0,88,6,32,'#64838c');
  for(let x=34;x<=106;x+=12)put('office',x,33,0,12,12,29,'#dee5e1');
  for(let j=0;j<=4;j++)box(70,27+j*3,0,85,.32,29.7,'#d1d0bd');
  for(let x=34;x<110;x+=8){
    for(const z of [-9,9]){
      box(x,20.75,z,5,.14,.42,'#fff1c9');
      box(x,10.81,z*1.63,5.9,4,.16,'#50808f');
    }
  }
  textBoard('潮見中央　STATION',114.1,24,0,20,2.6,Math.PI/2);
  for(const side of [-1,1]){
    const z=side*14.08;
    for(let x=34;x<111;x+=8){
      box(x,7.4,z,6.7,4.8,.16,'#587c84');box(x,7.5,z,.15,4.85,.28,'#bec6c1');
      box(x,9.9,z+side*.62,7.6,.19,1.45,'#e2dbc7');
    }
  }
  // Clear portal span for both hanging cars; trusswork sits above their swept paths.
  for(const x of [25,115]){
    for(const side of [-1,1]){
      box(x,14.0,side*14.5,1.05,14.0,.86,'#5c737c');
      member([x,18.2,side*14.5],[x,19.55,side*10.2],.39,.34,'#ced6cf');
    }
    box(x,19.50,0,1.1,.35,29.7,'#637a81');box(x,21.04,0,1.1,.35,29.7,'#637a81');
    for(let j=0;j<10;j++)member([x,19.60+(j%2)*1.34,-14.5+j*2.9],[x,19.60+((j+1)%2)*1.34,-14.5+(j+1)*2.9],.20,.19,'#dee2d6');
  }
  const roofs=['#647785','#986a5c','#627d79','#7d7978'];
  function home(x,z,h){
    const w=6+rand()*4,d=6+rand()*3,wall=4+rand()*2,roof=roofs[Math.floor(rand()*roofs.length)];
    put('house'+Math.floor(rand()*3),x,h+wall/2,z,w,wall,d,'#fffbee');
    const roofRise=w*.5*Math.tan(.34);
    put('gable',x,h+wall,z,w,roofRise,d,'#d7cdb9');
    for(const side of [-1,1]){
      // Ridge runs across the depth of the building.
      put('tile',x+side*w*.25,h+wall+roofRise*.5+.08,z,w*.58,.28,d+1,roof,0,-side*.34);

    }
    box(x+w*.26,h+wall+1.02,z+.6,.12,1.7,.12,'#777e7a');
    box(x+w*.26,h+wall+1.83,z+.6,.95,.06,.07,'#777e7a');
    const face=Math.sign(-northing(x)-z)||1;
    if(Math.abs(z+northing(x))<59){
      // Ground each frontage with a planted plot and a paved strip beside the house.
      box(x,h+.04,z,w+2.2,.12,d+2.3,'#a5ac88');
      box(x-w*.48,h+.12,z,w*.19,.15,d+3.2,'#c9c1ad');
      const front=z+face*(d/2+.58),bx=x+w*.12,bw=w*.52;
      box(bx,h+wall*.56,front,bw,.20,1.3,'#c3bdac');
      box(bx,h+wall*.56+.53,front+face*.6,bw,.90,.10,'#98a6a1');
      box(bx,h+wall*.56+1.02,front+face*.6,bw+.08,.08,.14,'#e1dfcf');
      for(const end of [-1,1])box(bx+end*bw*.49,h+wall*.56+.50,front,.10,.88,1.16,'#a7afa5');
      box(bx,h+wall*.88,front,bw+.35,.16,1.65,roof);
    }
    if(x>320&&x<610&&Math.abs(z+northing(x))<59&&Math.floor(x/16)%3===1){
      // A narrow parking bay on the side of the lot, open towards the lane.
      const bay=x+w*.5+1.65;
      box(bay,h+.08,z,3.25,.15,5.5,'#b5b3a7');
      for(const dz of [-2,2])post(bay+1.34,h+1.16,z+dz,.10,2.32,.10,'#737e7c');
      box(bay,h+2.38,z,3.27,.13,5.36,'#8fa9ae',0,-.045);
      for(const dz of [-2.45,0,2.45])box(bay,h+2.46,z+dz,3.24,.08,.075,'#ccd3ce',0,-.045);
      parkedCar(bay,h+.16,z,'#7a929a',true);
    }
    box(x,h+.51,z+d*.5+1,w+1,.92,.28,'#abb4a8');
    box(x+w*.39,h+.08,z+d*.59,w*.31,.14,2.4,'#c9c4b2');
    if(rand()<.65){box(x-w*.26,h+.83,z+d*.54+1.1,w*.46,.91,.75,'#6f8667');}

  }
  for(let x=252;x<920;x+=16)for(const side of [-1,1]){
    const ground=floorHeight(x)-9.1;
    for(const off of [50,78,105]){
      if(side<0&&x>=400&&x<=585)continue;
      home(x+rand()*4,-northing(x)+side*(off+rand()*5),ground);
    }
    if(rand()<.51)tree(x,ground,-northing(x)+side*35,5);
  }
  // The estate stands across the green verge and the local street from the tracks.
  for(const [index,[x,setback]] of [[435,67],[492,94],[552,68]].entries()){
    const z=-northing(x)-setback,h=floorHeight(x)-9.1,w=37,d=11,front=z+d/2;
    box(x,h+.02,z,w+7,.46,d+7,'#bbbdad');
    put('estate',x,h+7.6,z,w,15,d,'#fff9ed');
    for(let floor=0;floor<5;floor++){
      const y=h+.28+3*floor;
      box(x,y,front+.71,w-.45,.23,1.6,'#d7d5c4');
      box(x,y+.62,front+1.45,w-.65,1.02,.14,'#b9c8c4');
      box(x,y+1.19,front+1.45,w-.62,.08,.17,'#ece8da');
    }
    box(x,h+15.18,z,w+.65,.32,d+.7,'#dbd7c7');
    box(x-10,h+16.04,z-2,4.3,1.65,3,'#b9c0b9');
    box(x+w/2-.9,h+7.75,front+.15,1.8,14.7,.5,['#9a8074','#899d94','#8f9ea7'][index]);
    textBoard(String(index+1),x+w/2-.9,h+13,front+.42,1.45,1.25,0,'#566c72');
    for(const dx of [-12,12]){
      tree(x+dx,h,front+9,4.2);
      box(x+dx,h+.46,front+6,4.2,.8,1.1,'#899978');
    }
    box(x,h+.16,(front-northing(x)-40)/2,2.8,.12,-northing(x)-40-front,'#c7bdac');
  }
  // Local streets run through the gaps between the first and second rows of homes.
  for(const side of [-1,1])for(let x=320;x<592;x+=8){
    const street=(u,d)=>[u,floorHeight(u)-8.91,-northing(u)+side*d];
    member(street(x,38),street(x+8,38),4.6,.15,'#85867e');
    member(street(x,40.35),street(x+8,40.35),.28,.18,'#c5c0ae');
  }
  for(let x=360;x<830;x+=36){
    const q=point(x,14,-9.1),r=point(x+36,14,-9.1);
    post(q[0],q[1]+3.8,q[2],.25,7.6,.25,'#877c6e');
    box(q[0],q[1]+7.25,q[2],.24,.2,2.4,'#776e5c');
    for(const n of [-.85,.85])member([q[0],q[1]+7.35,q[2]+n],[r[0],r[1]+7.35,r[2]+n],.055,.055,'#4e5960');
  }
  // Continuous ridgelines rise away from the cut. Their shoulders overlap the verge.
  const ridges=[];
  function ridgePoint(x,d,side){
    const rise=Math.min(1,Math.max(0,(x-770)/270))*Math.min(1,Math.max(0,(2070-x)/265));
    const band=Math.max(0,Math.sin(Math.PI*(d-85)/560));
    const relief=rise*band*(79+27*Math.sin(x*.009+side)+15*Math.cos(x*.024+d*.019)+24*Math.sin(d*.027+x*.006));
    return [x,floorHeight(x)-11+relief,-northing(x)+side*d];
  }
  for(const side of [-1,1])for(let x=750;x<2080;x+=20)for(let d=85;d<640;d+=16){
    strip(ridges,ridgePoint(x,d,side),ridgePoint(x+20,d,side),ridgePoint(x+20,d+16,side),ridgePoint(x,d+16,side));
  }
  surface(ridges,'#75966c','forest',null,'ground');
  // Cooler rear slopes appear through saddles of the near ridge.
  const distantSlopes=[];
  for(const side of [-1,1]){
    const skyline=u=>{
      const edge=T.MathUtils.smoothstep(u,620,1080)*(1-T.MathUtils.smoothstep(u,1640,2090));
      const crest=150+43*Math.sin(u*.008+side)+29*Math.cos(u*.019);
      return [u,edge*crest,-northing(u)+side*(810+39*Math.sin(u*.017))];
    };
    for(let x=620;x<2100;x+=32)
      strip(distantSlopes,[x,-2,-northing(x)+side*625],skyline(x),skyline(x+32),[x+32,-2,-northing(x+32)+side*625]);
  }
  surface(distantSlopes,'#809691',null,null,'ground');
  for(let i=0;i<700;i++){
    const x=820+rand()*1180,v=(i%2?1:-1)*(20+rand()*118);
    const dryOffset=streamWidth(x)>0&&Math.abs(v-streamCenter(x))<streamWidth(x)*1.5+2?streamCenter(x)+streamWidth(x)*1.5+3:v;
    const q=point(x,dryOffset,-9.1);tree(q[0],q[1],q[2],4+rand()*7);
  }
  // Faceted rock at wheelhouse height, with a continuous grassy shoulder.
  const rock=[],cap=[],rockColors=[];
  for(const [start,end] of rockCuts)for(const side of [-1,1]){
    const section=x=>cutProfile(x,side).map(([v,h])=>point(x,side*v,h));
    for(let x=start;x<end;x+=2){
      const a=section(x),b=section(Math.min(end,x+2));
      for(let i=0;i<a.length-1;i++){
        strip(i<2?rock:cap,a[i],b[i],b[i+1],a[i+1]);
        if(i<2){
          const tone=new T.Color(i?'#a49d88':'#827e71').multiplyScalar(.9+.1*Math.sin(x*.46+side));
          for(let k=0;k<6;k++)rockColors.push(tone.r,tone.g,tone.b);
        }
      }
    }
  }
  surface(rock,'#ffffff','rockFace',rockColors,'ground');surface(cap,'#83916d','meadow',null,'ground');
  // Arch and earth above it share the same curved alignment, including the two open mouths.
  const bore=[],ridge=[];
  for(let x=portal[0];x<portal[1];x+=5){
    member(point(x,0,-8.86),point(x+5,0,-8.86),22,.22,'#737878');
    for(const side of [-1,1]){
      member(point(x,side*9.3,-7.96),point(x+5,side*9.3,-7.96),1.85,.42,'#93958a');
      member(point(x,side*10.44,-1.6),point(x+5,side*10.44,-1.6),.18,.18,'#727d7f');
      member(point(x,side*10.2,.68),point(x+5,side*10.2,.68),.12,.16,'#5e6461');
      if(x%10===0){
        const q=point(x,side*10.14,.38);
        box(q[0],q[1],q[2],.17,.93,.31,'#a3a99d');
        box(q[0],q[1]-.37,q[2]+side*.18,.55,.14,.08,'#ebc780');
      }
      if(x%20===0){const q=point(x,side*10.1,-.1);box(q[0],q[1],q[2],.78,1.05,.42,'#a2aba4');}
    }
    const arch=(u,k)=>{const a=k*Math.PI/12;return point(u,11*Math.cos(a),-3+13*Math.sin(a));};
    for(let k=0;k<12;k++)strip(bore,arch(x,k),arch(x+5,k),arch(x+5,k+1),arch(x,k+1));
    for(const side of [-1,1]){
      strip(bore,point(x,side*11,-9),point(x+5,side*11,-9),point(x+5,side*11,-3),point(x,side*11,-3));
      const top=u=>15+16*Math.sin(Math.PI*(u-portal[0])/(portal[1]-portal[0]));
      strip(ridge,point(x,0,top(x)),point(x+5,0,top(x+5)),point(x+5,side*12,top(x+5)-3),point(x,side*12,top(x)-3));
      strip(ridge,point(x,side*12,top(x)-3),point(x+5,side*12,top(x+5)-3),point(x+5,side*48,-9),point(x,side*48,-9));
      if((x+(side>0?5:0))%15===0){
        const q=point(x,side*9.6,1.85);
        box(q[0],q[1]+.08,q[2],2.65,.53,.27,'#536465');
        box(q[0],q[1],q[2]+side*.17,2.25,.25,.12,'#fff4c4');
        if(x%30===0)textBoard('出口 →',q[0],q[1]-1.3,q[2]+side*.23,1.38,.46,side>0?0:Math.PI,'#38776b');
      }
    }
    if(x===portal[0]||x+5===portal[1]||x%25===0){
      const u=x+5===portal[1]?x+5:x;
      for(let k=0;k<12;k++)member(arch(u,k),arch(u,k+1),.65,.5,'#89918a');
      if(u===portal[0]||u===portal[1]){
        const face=[];
        for(let k=0;k<12;k++){const a=arch(u,k),b=arch(u,k+1);
          strip(face,a,b,[b[0],floorHeight(u)+15,b[2]],[a[0],floorHeight(u)+15,a[2]]);}
        for(const side of [-1,1]){
          const outer=point(u,side*48,-9),inner=point(u,side*11,-9),shoulder=point(u,side*12,12);
          face.push(...outer,...inner,...shoulder,...inner,...point(u,side*11,15),...shoulder);
        }
        surface(face,'#9ba397','stone');
        const dir=u===portal[0]?-1:1,q=point(u,0,12.1);
        box(q[0]+dir*.15,q[1],q[2],.28,1.65,6.6,'#bcc1b4');
        textBoard('緑谷トンネル',q[0]+dir*.31,q[1],q[2],6.2,1.35,dir*Math.PI/2,'#46565a');
      }
    }
  }
  surface(bore,'#586168','lining');surface(ridge,'#82946c','forest',null,'roof');
  // Shoreline runs across the terminal approach, leaving water in the windscreen.
  const beach=[];
  for(let z=-1000;z<1000;z+=5){
    const shore=v=>2170+4*Math.sin(v*.037)+2*Math.sin(v*.11);
    strip(beach,[2109,.62,z],[2109,.62,z+5],[shore(z+5),-.58,z+5],[shore(z),-.58,z]);
  }
  surface(beach,'#d5c39e','sand',null,'ground');
  // Three low-poly coastal profiles share one mesh. The nearest shore has a rock shelf.
  const islandVertices=[],islandColors=[];
  function headland(cx,cz,width,depth,height,phase,palette){
    const rings=[],segments=30;
    for(const [level,radius] of [[-.02,1],[.065,.92],[.25,.78],[.58,.53],[.84,.27],[1,.035]]){
      const ring=[];
      for(let j=0;j<segments;j++){
        const a=2*Math.PI*j/segments,edge=1+.13*Math.sin(3*a+phase)+.08*Math.cos(5*a-phase);
        const spine=1+.18*Math.cos(2*a+phase)+.09*Math.sin(5*a);
        ring.push([cx+width*(radius*edge*Math.cos(a)+.28*level),height*level*spine,
          cz+depth*(radius*edge*Math.sin(a)-.23*level)]);
      }
      rings.push(ring);
    }
    if(phase!==5){
      // Sparse wind-shaped crowns follow the actual ridgeline of the two near islands.
      for(let j=0;j<segments;j+=2){
        const [x,h,z]=rings[4][j];
        put('tree',x,h+1.6,z,11+(j%4),5.8,9.2,'#566f60',j*.65);
      }
      for(let j=0;j<segments;j+=3){
        const [x,h,z]=rings[1][j];put('tree',x,h,z,10,4.1,7.5,'#929084',j);
      }
    }
    for(let i=1;i<rings.length;i++)for(let j=0;j<segments;j++){
      const k=(j+1)%segments;
      strip(islandVertices,rings[i-1][j],rings[i][j],rings[i][k],rings[i-1][k]);
      const tint=new T.Color(palette[i-1]).multiplyScalar(.95+.05*Math.cos(j*.65+phase));
      for(let v=0;v<6;v++)islandColors.push(tint.r,tint.g,tint.b);
    }
    for(let j=1;j<segments-1;j++){
      const top=rings.at(-1);
      islandVertices.push(...top[0],...top[j],...top[j+1]);
      const tint=new T.Color(palette.at(-1));for(let v=0;v<3;v++)islandColors.push(tint.r,tint.g,tint.b);
    }
  }
  headland(2440,420,108,158,57,1,['#b6ab91','#8d9382','#75896e','#667f69','#819278']);
  headland(2560,-260,92,184,40,3,['#b0ae97','#8c9a8c','#789182','#728c80','#85998a']);
  headland(3100,-580,175,350,74,5,['#a4b0a5','#9aada7','#90a8a0','#8da49e','#95aaa2']);
  const islands=new T.BufferGeometry();
  islands.setAttribute('position',new T.Float32BufferAttribute(islandVertices,3));indexGround(islands.attributes.position.array);
  islands.setAttribute('color',new T.Float32BufferAttribute(islandColors,3));
  islands.computeVertexNormals();
  const islandSkin=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});
  root.add(new T.Mesh(islands,islandSkin));resources.push(islands,islandSkin);
  box(2175,1.1,78,119,2.5,4,'#a8afa4');post(2233,6.7,78,2.6,9,2.6,'#bd6554');post(2233,11.6,78,3,.9,3,'#ede2cb');
  // Lantern room and gallery give the breakwater light a readable silhouette from the terminus.
  post(2233,2.58,78,4.3,.55,4.3,'#888f88');
  post(2233,9.10,78,2.72,.85,2.72,'#e5ded0');
  post(2233,12.54,78,2.18,1.32,2.18,'#799398');
  post(2233,13.31,78,2.9,.27,2.9,'#934e44');
  put('hill',2233,13.41,78,2.85,1.48,2.85,'#a35949');
  for(let j=0;j<8;j++){
    const a=j*Math.PI/4,b=a+Math.PI/4;
    const px=2233+1.55*Math.cos(a),pz=78+1.55*Math.sin(a);
    post(px,12.2,pz,.08,.85,.08,'#d4d8c9');
    member([px,12.60,pz],[2233+1.55*Math.cos(b),12.60,78+1.55*Math.sin(b)],.07,.07,'#d4d8c9');
  }
  for(let k=0;k<16;k++){const x=2140+rand()*80,z=-75-rand()*140;put('tree',x,.18,z,4.5,2.8,6,'#9da69c',rand()*3);}
  for(let x=1974;x<=2102;x+=17)for(const side of [-1,1]){
    const z=-northing(x)+side*(36+rand()*9),h=floorHeight(x)-9.1;home(x,z,h);
  }
  box(2110,.80,0,4,.32,285,'#cfbf9f');
  for(let z=-124;z<132;z+=12){
    post(2112,1.65,z,.18,1.7,.18,'#7c8f89');box(2112,2.45,z+6,.10,.1,12,'#a7b3a8');
    if(z%24===-4){box(2107,1.7,z,1,.38,3.1,'#a4805b');}
  }
  for(let k=0;k<4;k++){
    const x=2180+k*14,z=-96-k*8;
    put('tree',x,.18,z,6,1.6,2.1,'#f0e5ca');post(x,3.05,z,.09,5.6,.09,'#bfc6b9');
  }
  // Beach club and timber access boardwalk face the water; sails break up the horizon.
  const shoreZ=-northing(2060);
  for(let j=0;j<18;j++)box(2111+j*2.36,.76-j*.033,shoreZ+18,2.31,.21,4.4,'#bdac8c');
  // At the seaward end of the boardwalk, a ridged shade sail frames the water.
  const deckX=2154,deckZ=shoreZ+18;
  box(deckX,.38,deckZ,9,.26,9.4,'#aa9171');
  for(let i=0;i<18;i++)box(deckX-4.25+i*.50,.53,deckZ,.485,.07,9.4,i%4?'#c6ae89':'#bda483');
  const canopy=[];
  for(const side of [-1,1]){
    const edgeZ=deckZ+side*4.25;
    for(const dx of [-4,4]){
      post(deckX+dx,2.35,edgeZ,.17,4,.17,'#899b98');
      member([deckX+dx,4.30,edgeZ],[deckX+dx,5.77,deckZ],.10,.12,'#a2aaa1');
    }
    strip(canopy,[deckX-4.2,4.29,edgeZ],[deckX+4.2,4.29,edgeZ],
      [deckX+4.2,5.78,deckZ],[deckX-4.2,5.78,deckZ]);
    for(const dx of [-4,-2,0,2,4])post(deckX+dx,1.0,edgeZ,.09,1.05,.09,'#879791');
    member([deckX-4,1.53,edgeZ],[deckX+4,1.53,edgeZ],.10,.11,'#a1aba0');
  }
  surface(canopy,'#eee9d6');
  for(let j=0;j<11;j++){
    const z=shoreZ-68+j*11,x=2146+4*Math.sin(j*1.8);
    post(x,.97,z,.08,2.55,.08,'#93856b');
    put('hill',x,2.28,z,3.6,.98,3.6,j%2?'#cfa46d':'#78a3a6');
    box(x+1,.26,z+.82,.62,.19,1.9,'#c3d2bf');
  }
  const mainsails=[],jibs=[];
  for(const [x,z] of [[2190,35],[2210,-14],[2252,8],[2290,-72]]){
    put('tree',x,-.19,z,2.55,1.20,7.65,'#e8e4d5');post(x,3.21,z,.11,6.6,.11,'#899592');
    mainsails.push(x,6.63,z,x,.96,z,x,.96,z+3.0);
    jibs.push(x,5.48,z-.13,x,1.04,z-.2,x,1.04,z-2.12);
  }
  surface(mainsails,'#e8e5d1');surface(jibs,'#bc755c');
  for(const x of [2086,2099]){
    const z=shoreZ-27;
    box(x,2.85,z,10,5.4,7,'#c4d2c7');box(x,5.67,z,11,.34,8,'#647f86');
    box(x,2.43,z+3.55,8,3.2,.13,'#506e78');
    box(x,4.22,z+4.55,10,.26,2.8,'#e8d8b5');
  }
  textBoard('海岸通り　COFFEE',2086,4.85,shoreZ-23.43,8,.9,0,'#46737a');
  suspendedStations.forEach(({name,s},i)=>{
    const y=northing(s),h=floorHeight(s);
    for(const side of [-1,1]){
      const z=-y+side*8.6;
      dressStation(i,s,h,y,side,{box,post,member,board:textBoard,put});
      put('paving',s,h+.62,z,61,.86,5.4,'#ffffff');put('tactile',s,h+1.08,z-side*2.23,60,.06,.32,'#ffffff');
      for(const dx of [-22,0,22]){
        box(s+dx,h-4.4,z,1.15,9.1,1.45,'#b8c1b7');
        box(s+dx,h+3.34,z+side*1.83,.22,4.6,.22,'#7d9894');
      }
      box(s,h+5.77,z,60,.32,5.3,i===4?'#719fa2':'#a8b5aa');
      for(const dx of [-16,8]){box(s+dx,h+1.69,z,3.6,.28,.65,'#a78460');box(s+dx,h+1.37,z,1.8,.5,.34,'#838e88');}
      for(const end of [-1,1]){
        const u=s+end*26;
        box(u,h+4.02,z,.14,.88,3.28,'#455963');
        for(const v of [-1.12,1.12])box(u,h+5.02,z+v,.07,1.17,.07,'#86938b');
        textBoard(name,u+end*.083,h+4.02,z,3.18,.79,end*Math.PI/2);
      }
      for(const dx of [-10,17])textBoard(name,s+dx,h+4.28,z,5.1,1.05,side>0?Math.PI:0);
      for(let dx=-28;dx<28;dx+=4){
        box(s+dx,h+1.77,z+side*2.52,.10,1.34,.10,'#7c9692');
        box(s+dx+2,h+2.42,z+side*2.52,4.05,.09,.11,'#9bb0a6');
      }
      box(s+20,h+1.94,z+side*1.52,.84,1.68,.61,'#e0d4ae');
      box(s+20,h+2.19,z+side*1.52-side*.32,.64,.71,.04,'#547581');
      for(let j=0;j<36;j++)box(s+30+j*.40,h+1-j*.28-.15,z,.42,.32,2.35,'#abae9f');
    }
  });
  finishSigns();
  for(const {shape,list} of rows.values()){
    const mesh=new T.InstancedMesh(models[shape],skins[shape]||mat,list.length);
    list.forEach(([m,c],i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,new T.Color(c));});root.add(mesh);
  }
  return {root,groundHeight,update:updateSea,dispose(){root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});resources.forEach(r=>r.dispose());}};
}
