import {createAirport} from './island-airport.mjs?v=rail-towns-71';
import * as T from 'three';
import {createSeascape} from './island-seascape.mjs?v=island-82';
import {islandRoute,islandStations,islandOuterRoute,islandOuterStations,islandTrackSpacing} from './island-route.mjs?v=rail-towns-71';

// Static scenery uses one instanced draw per shape, with colours on each instance.
export function createIsland(){
  const root=new T.Group(),poses=new Map(),dummy=new T.Object3D(),labels=[];
  const shapes={box:new T.BoxGeometry(),round:new T.CylinderGeometry(.5,.5,1,24),leaf:new T.IcosahedronGeometry(.5,1),dome:new T.SphereGeometry(.5,24,12,0,2*Math.PI,0,Math.PI/2),ball:new T.SphereGeometry(.5,12,8)};
  // A single double-faced triangle shared by every sail.
  shapes.sail=new T.BufferGeometry();
  shapes.sail.setAttribute('position',new T.Float32BufferAttribute([
    0,0,0, 1,.12,0, 0,1,0, 0,1,0, 1,.12,0, 0,0,0
  ],3));
  shapes.sail.computeVertexNormals();
  let originX=0,originZ=0;
  function put(shape,x,h,z,w,height,depth,color,yaw=0,roll=0){
    dummy.position.set(x+originX,h,z+originZ);dummy.rotation.set(0,yaw,roll,'YXZ');dummy.scale.set(w,height,depth);dummy.updateMatrix();
    if(!poses.has(shape))poses.set(shape,[]);poses.get(shape).push([dummy.matrix.clone(),color]);
  }
  const box=(...args)=>put('box',...args),round=(...args)=>put('round',...args);
  let seed=9274;const rand=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
  function tree(x,z,size){
    round(x,2,z,.55,4,.55,'#79624a');put('leaf',x,4.5,z,size,size*1.25,size,['#477856','#628c53','#3c7964'][Math.floor(rand()*3)],rand()*3);
  }
  box(0,-.15,6,446,2.4,175,'#899997');box(0,1.12,6,443,.22,173,'#8caa72');
  originX=555;originZ=-448;
  // Northern basin with parallel fingers, hulls, cabins and masts.
  box(0,1.42,-58,165,.3,6,'#dccdb1');
  for(let x=-65;x<=70;x+=22){
    box(x,-.45,-90,2.1,.8,64,'#b9ac92');
    for(let j=0;j<5;j++)for(const side of [-1,1]){
      const z=-68-10*j,u=x+side*6;
      box(x+side*4,.06,z+3.8,7,.45,.9,'#cabb9a');
      put('ball',u,-.72,z,8.7,2.0,3.3,'#ece7d7');box(u,.30,z,4.4,1.2,2.6,'#436675');
      if(j%2===0){
        round(u+1,4.55,z,.12,8,.12,'#e4ded0');
        if((x+65)/22%3===j/2 && side===1){
          put('sail',u+1,.96,z,3.1,7.4,1,'#fff0d5',Math.PI);
          put('sail',u+1,.99,z,2.8,5.8,1,['#be6255','#579aa5','#dcae61'][j/2]);
        }
      }
    }
  }
  // Cafe terrace at the head of the pontoons, linked to the station path.
  box(10,1.48,-46,35,.36,17,'#bb9e7c');
  box(10,1.45,-35.8,4,.30,6,'#c8b493');
  for(const x of [-2,10,22]){
    box(x,3.1,-46,.18,3.1,.18,'#726f61');
    put('dome',x,4.52,-46,6.7,2.2,6.7,x===10?'#6d9ea0':'#eee2bc');
    box(x,2.4,-46,2.7,.2,1.4,'#88725c');
    for(const side of [-1,1])box(x,1.98,-46+side*1.2,2.5,.38,.55,'#956c53');
  }
  originX=116;originZ=-441;
  // Water garden. Meridians and glazing bands describe each of the three domes.
  for(const [x,z,w,h] of [[-105,-29,34,23],[-76,-29,29,19],[-51,-29,23,15]]){
    round(x,2.6,z,w+1,2.8,w+1,'#e5e1ca');put('dome',x,4,z,w,h*2,w,'#72b9b3');
    for(let k=0;k<16;k++){
      const a=k*Math.PI/8;for(let j=0;j<8;j++){
        const t=(j+.5)*Math.PI/16,r=w/2*Math.cos(t);
        put('ball',x+r*Math.cos(a),4+h*Math.sin(t),z-r*Math.sin(a),.48,h*.23,.48,'#ddeddb',a,Math.atan2(w/2*Math.sin(t),h*Math.cos(t)));
      }
    }
    for(const t of [.28,.65,1.02])round(x,4+h*Math.sin(t),z,w*Math.cos(t)+.35,.35,w*Math.cos(t)+.35,'#d3e4d6');
  }
  originX=465;originZ=0;
  // Stadium track built from nested ovals with parallel lane lines.
  for(const [w,d,c,h] of [[89,48,'#e0d7bb',1.4],[86,45,'#ad6349',1.51],[81,41,'#e7c5ac',1.56],[80.4,40.4,'#ad6349',1.61],[76,37,'#e7c5ac',1.67],[75.4,36.4,'#ad6349',1.72],[70,32,'#74a46d',1.77]])round(72,h,20,w,.09,d,c);
  box(72,1.84,20,.20,.05,24,'#e4e3ca');
  for(let i=0;i<5;i++)box(72,1.8+i*.62,-6-i*1.35,66,.8,1.7,i%2?'#e0d7c3':'#587586');
  // The roof opens towards the field and the passing monorail.
  for(const x of [45,64,83,100]){
    box(x,6.5,-11.9,.45,10.3,.48,'#566e78');
    box(x,11.65,-7,.38,.34,10.5,'#82979a');
  }
  for(const [x,color] of [[50,'#d1e1d9'],[72,'#ece9d7'],[94,'#d1e1d9']]){
    box(x,11.98,-7,21.9,.45,11.5,color);
    box(x,11.65,-1.3,21.9,.55,.22,'#436b78');
  }
  for(const side of [-1,1]){
    box(72,1.85,20+side*9.5,46,.05,.22,'#ede8d5');
    box(72+side*23,1.85,20,.22,.05,19,'#ede8d5');
    for(const dz of [-2.2,2.2])box(72+side*23,2.84,20+dz,.16,2,.16,'#f3efe2');
    box(72+side*23,3.84,20,.16,.16,4.55,'#f3efe2');
  }
  originX=0;originZ=0;
  // Terrace towers in the gateway quarter and a distant waterfront skyline.
  function tower(x,z,w,d,h){
    box(x,1.7,z,w+4,1,d+4,'#d2cbbb');box(x,2+h/2,z,w,h,d,'#467b87');
    for(let bay=1;bay<5;bay++){
      const paneX=x+w*(bay/5-.5);
      box(paneX,2+h/2,z,1.9,h,d+.12,bay%2?'#67929a':'#598894');
      box(paneX-1,2+h/2,z,.16,h,d+.3,'#a8c1be');
    }
    for(let v=4;v<h+2;v+=3.8)box(x,v,z,w+1,.6,d+1,'#d1dfd9');
    for(const side of [-1,1])box(x+side*(w/2-.6),2+h/2,z,1.15,h,d+.7,'#e1dfcb');
    box(x,h+2.3,z,w+1.4,.8,d+1.4,'#dfebdc');box(x,h+3.1,z,w*.68,.9,d*.63,'#538c93');
  }
  for(const [x,z,w,d,h] of [[-147,22,17,16,34],[-121,33,21,14,22],[-163,-10,17,15,51],[-135,-3,13,16,30],[13,-16,20,15,18],[144,5,16,16,29],[165,20,15,13,20]])tower(x,z,w,d,h);
  // The shops face the station approach, leaving the promenade open.
  box(-145,1.36,36,66,.2,8,'#d4c6ae');
  for(const [x,z,width,accent] of [[-163,27,17,'#b8674d'],[-146,32,15,'#377e81'],[-123,41,18,'#b68c48']]){
    box(x,3.45,z,width,4.2,5.2,'#dfd9bd');
    box(x,3.18,z+2.65,width-.9,2.8,.14,'#355963');
    for(const fraction of [-.42,-.14,.14,.42])box(x+width*fraction,3.2,z+2.78,.23,3,.18,'#c8c5ae');
    box(x,4.95,z+3.4,width+.6,.32,2.8,accent);
    box(x,4.7,z+4.75,width+.6,.48,.14,accent);
  }
  box(0,1.29,47,427,.12,4,'#d6caaf');box(0,1.29,-49,427,.12,4,'#d6caaf');
  for(const z of [-72,42,73])for(let x=-206;x<=206;x+=9)tree(x+rand()*1.5,z,4+rand()*2.7);
  for(let i=0;i<90;i++){const x=-36+rand()*63,z=-39+rand()*74;if(Math.abs(x-13)>14||Math.abs(z+16)>14)tree(x,z,3+rand()*3);}
  // A continuous waterfront walk connects the gateway bridge to the marina.
  box(0,1.34,84,437,.21,6.6,'#cab998');
  for(let x=-213;x<=215;x+=8){
    box(x,1.99,87,.13,1.25,.13,'#587579');
    box(x+3.95,2.54,87,8,.09,.12,'#94aeaa');
    if((x+213)%32===0){
      round(x,3.9,82,.21,5.1,.21,'#6f8580');
      box(x,6.4,82,1.15,.19,.5,'#f7e6bd');
      box(x+3,1.87,82,2.3,.36,.75,'#94755b');
    }
  }
  for(const [x,z,d] of [[-39,61,42],[27,-60,32],[126,62,40],[-156,-60,30]]){
    box(x,1.3,z,3.6,.12,d,'#d6caaf');
  }
  // Cable-stayed pedestrian bridge arrives from across the southern channel.
  box(-190,2.1,152,6.8,1.2,124,'#bbc9c4');
  box(-190,0,235,110,2.5,49,'#89a17d');
  for(const z of [128,177]){
    for(const side of [-1,1]){
      const x=-190+side*3.35;
      box(x,13.4,z,.85,25,.9,'#e7e5d6');
      for(const offset of [-18,-11,11,18]){
        const hi=offset%2===0?23:18,dy=hi-3;
        box(x,(hi+3)/2,z+offset/2,Math.hypot(offset,dy),.14,.14,'#a2b9b7',Math.PI/2,Math.atan2(dy,offset));
      }
    }
    box(-190,25.3,z,7.2,.75,.85,'#dee4d7');
  }
  for(const side of [-1,1])box(-190+side*3.28,3.2,152,.15,1,124,'#8ba9a7');
  // Round solar shades on the harbour terrace, with a stepped observation tower.
  for(const x of [28,46,64]){
    round(x,1.45,-68,13,.35,9,'#ded4b9');round(x,4,-68,.55,5,.55,'#718880');
    round(x,6.63,-68,10,.42,8,'#568993');round(x,6.91,-68,8.4,.18,6.6,'#376979');
  }
  for(const [w,h,base,c] of [[11,4,1.25,'#d9ded1'],[5,24,5.25,'#72939a'],[16,1.15,29.25,'#e1dfca'],[13.8,3,30.4,'#467987'],[17,.9,33.4,'#e3e2ce'],[.42,7,34.3,'#c4d8ce']])round(180,base+h/2,-37,w,h,w,c);
  for(const x of [-426,-298]){
    const mid=60+islandTrackSpacing/2;
    round(x,4.05,mid,2.5,12.4,2.5,'#bbc5bc');
    box(x,9.99,mid,2.7,.75,7.2+islandTrackSpacing,'#a1aba6');
  }
  const updateAirport=createAirport(root,box,round,labels);
  const updateSea=createSeascape(root,box,round,put,tree,labels);
  // Segment endpoints follow the same sampler as the moving train.
  for(const route of [islandRoute,islandOuterRoute]){
    const segments=Math.ceil(route.length/3);
    let straightStart;
    for(let i=0;i<segments;i++){
      const a=route.sample(i*route.length/segments),b=route.sample((i+1)*route.length/segments);
      const x=(a[0]+b[0])/2,z=-(a[1]+b[1])/2,angle=Math.atan2(b[1]-a[1],b[0]-a[0]),l=Math.hypot(b[1]-a[1],b[0]-a[0]);
      if(a[1]===b[1] && a[2]===b[2]){
        straightStart??=a;
      }else{
        if(straightStart){
          box((straightStart[0]+a[0])/2,11.27,-a[1],Math.abs(a[0]-straightStart[0])+.025,1.46,.90,'#aab3af');
          straightStart=undefined;
        }
        box(x,11.27,z,l+.025,1.46,.90,'#aab3af',angle);
      }
      if(route!==islandRoute||i%8!==0)continue;
      const bridgeSpan=Math.abs(z-60)<.25&&((x>230&&x<397)||(x>-426&&x<-298));
      if(!bridgeSpan){
        const midX=x+Math.sin(angle)*islandTrackSpacing/2,midZ=z+Math.cos(angle)*islandTrackSpacing/2;
        round(midX,4.1,midZ,1.85,12.3,1.85,'#d1d6cf');
        box(midX,10.22,midZ,2.7,.82,islandTrackSpacing+1.65,'#9aa8a5',angle);
      }
    }
  }
  function platform({name,s,accent},i,outer){
    const [x,y,a]=(outer?islandOuterRoute:islandRoute).sample(s);
    const side=Math.round(Math.cos(a))*(outer?-1:1),z=-y-side*4.55;
    for(const dx of [-22,0,22]){
      box(x+dx,6.65,z,1.05,10.8,1.8,'#c0c8bf');
      box(x+dx,11.70,z,1.4,.65,5.5,'#9cacaa');
    }
    box(x,12.44,z,58,1.1,6,'#b9bdb5');box(x,13.03,z+side*2.5,57,.07,.34,'#f3cf60');
    box(x,17.35,z,55,.50,6.6,'#e5e5d6');box(x,17.57,z,52,.12,5,accent);box(x,17.31,z+side*3.27,55,.39,.18,accent);
    for(let dx=-24;dx<=24;dx+=8){box(x+dx,15.05,z-side*1.6,.18,4.3,.18,'#48676b');box(x+dx,16.95,z,.23,.22,5.8,'#788f88');}
    for(const dx of [-15,0,15]){box(x+dx,13.55,z,3.25,.26,.7,'#b68b60');box(x+dx,13.26,z,2,.5,.31,'#697978');}
    const liftX=x-side*21,liftZ=z-side*4.4;
    box(liftX,7.49,liftZ,3.1,12.4,3.0,'#669298');box(liftX,13.92,liftZ,3.5,.5,3.4,accent);
    for(const dx of [-1.55,1.55])for(const dz of [-1.48,1.48])box(liftX+dx,7.6,liftZ+dz,.16,12.7,.16,'#e2dfcd');
    box(liftX,12.51,z-side*3.15,3.4,1.0,1.7,'#babcb0');
    for(const dx of [-18,-6,6,18]){
      if(outer||name!=='未来島空港'||dx!==18){
        box(x+dx,14.15,z-side*2.65,7,.95,.09,'#91acaa');box(x+dx,14.68,z-side*2.65,7.2,.09,.12,'#c8d5c8');
      }
      box(x+dx,17.02,z,3.9,.06,.19,'#fff1bd');
    }
    const tex=document.createElement('canvas');tex.width=640;tex.height=128;const c=tex.getContext('2d');
    c.fillStyle='#133d48';c.fillRect(0,0,640,128);c.fillStyle=accent;c.fillRect(0,0,16,128);c.font='bold 53px sans-serif';c.fillStyle='white';c.textAlign='center';c.fillText('0'+(i+1)+'　'+name+'　'+(outer?'外回り':'内回り'),324,84,602);
    const map=new T.CanvasTexture(tex);map.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map});labels.push(map,mat);
    for(const dx of [-14,14]){const g=new T.PlaneGeometry(7,1.4),m=new T.Mesh(g,mat);labels.push(g);m.position.set(x+dx,15.96,z);m.rotation.y=side>0?0:Math.PI;root.add(m);}
    const end=x+side*27;
    for(const edge of [-1,1]){
      for(let j=0;j<42;j+=5)box(end+side*j*.41,13.42-j*.28,z+edge*1.38,.075,.97,.075,'#778d88');
      box(end+side*8.405,8.18,z+edge*1.38,Math.hypot(16.81,11.48),.085,.085,'#a0b6aa',0,-side*Math.atan2(11.48,16.81));
    }
    for(let j=0;j<42;j++)box(end+side*j*.41,12.94-j*.28-.15,z, .43,.31,2.8,'#bdb9a7');
    if(outer){
      // The new stair landing crosses below the guideways to the island-side entrance.
      const width=islandTrackSpacing+9.1;
      box(end+side*44*.41,1.36,z+side*width/2,3.6,.18,width+3.6,'#d7ccb4');
      box(x,1.36,z+side*width,92,.18,3.6,'#d7ccb4');
    }
  }
  islandStations.forEach((stop,i)=>platform(stop,i,false));
  islandOuterStations.forEach((stop,i)=>platform(stop,i,true));
  const mat=new T.MeshStandardMaterial({roughness:.78});
  for(const [shape,rows] of poses){
    const mesh=new T.InstancedMesh(shapes[shape],mat,rows.length);
    rows.forEach(([matrix,color],i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(color));});mesh.receiveShadow=true;root.add(mesh);
  }
  return {root,update(t,body){updateSea(t);updateAirport(t,body);},dispose(){Object.values(shapes).forEach(g=>g.dispose());mat.dispose();labels.forEach(a=>a.dispose());}};
}
