import {createSuspendedTrain} from './suspended-train.mjs?v=marks-88';
import {islandCarLength} from './island-route.mjs?v=rail-towns-71';
import * as T from 'three';

// Rings taper the panoramic cab. The low skirts flank the single guide beam.
export function createIslandTrain(formation,suspended=false,other=false,design=null){
  if(suspended)return createSuspendedTrain(formation,other,design);
  const stripe=other?'#b75d32':'#008c8e';
  const root=new T.Group(),resources=[],materials=new Map(),cube=new T.BoxGeometry();
  resources.push(cube);
  function material(color){
    if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.44,metalness:.18}));
    const m=materials.get(color);
    m.userData.decorationSurface=['#e5e8dd',stripe,'#e4a553','#bacdcb'].includes(color);
    return m;
  }
  function block(parent,x,h,z,w,height,d,color){
    const m=new T.Mesh(cube,material(color));m.position.set(x,h,z);m.scale.set(w,height,d);parent.add(m);return m;
  }
  function shell(body,cab){
    const rings=[[-7.50,1.18,1.12,3.12],[-7.15,1.43,.92,3.47],[5.35,1.43,.92,3.47],cab?[6.78,1.31,.98,3.21]:[7.15,1.43,.92,3.47],cab?[7.63,1.08,1.15,2.38]:[7.5,1.18,1.12,3.12]];
    const points=[],indices=[],g=new T.BufferGeometry();
    for(const [x,w,b,t] of rings)for(const [y,z] of [[b,-w*.82],[b+.27,-w],[t-.31,-w],[t,-w*.77],[t,w*.77],[t-.31,w],[b+.27,w],[b,w*.82]])points.push(x,y,z);
    for(let j=0;j<4;j++)for(let k=0;k<8;k++){if(j===1&&(k===1||k===5))continue;const a=j*8+k,b=j*8+(k+1)%8;indices.push(a,a+8,b,b,a+8,b+8);}
    for(let k=1;k<7;k++)indices.push(0,k,k+1,32,33+k,32+k);
    g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();resources.push(g);
    const m=new T.Mesh(g,material('#e5e8dd'));m.material.side=T.DoubleSide;body.add(m);
    if(cab){const face=new T.BufferGeometry();
      const rows=[[6.77,3.23,1.00],[7.66,2.39,.86],[7.66,2.07,.89]],v=[];
      for(const [x,y,w] of rows)v.push(x,y,-w,x,y,w);
      face.setAttribute('position',new T.Float32BufferAttribute(v,3));face.setIndex([0,1,2,1,3,2,2,3,4,3,5,4]);face.computeVertexNormals();resources.push(face);
      const glass=material('#153d49');glass.side=T.DoubleSide;body.add(new T.Mesh(face,glass));
      for(const side of [-1,1])block(body,7.65,1.78,side*.73,.08,.15,.49,'#fff2b0');}
  }
  const cars=formation.cars.map((car,i)=>{
    const body=new T.Group(),doors=[];root.add(body);shell(body,car.kind==='cab');
    for(const side of [-1,1]){
      for(const [start,end] of [[-7.15,-5.36],[-3.94,3.81],[5.23,5.35]]){
        block(body,(start+end)/2,2.175,side*1.421,end-start,1.97,.018,'#e5e8dd');
      }
      for(const [start,end] of [[-6.95,-5.36],[-3.94,3.81],[5.23,6.95]]){
        block(body,(start+end)/2,1.63,side*1.436,end-start,.29,.035,stripe);
        block(body,(start+end)/2,1.40,side*1.439,end-start,.085,.04,'#e4a553');
      }
      block(body,-.3,.61,side*.92,13.5,.85,.42,'#43606a');
      for(const x of [-6.35,-2.7,-1.32,.05,1.42,2.79,6.04])block(body,x,2.58,side*1.44,1.19,.94,.044,'#193f4b');
      for(const x of [-4.65,4.52])block(body,x,2.08,side*.34,1.6,2.14,.025,'#34474b');
      for(const x of [-4.65,4.52])for(const half of [-1,1]){
        const leaf=new T.Group(),baseX=x+half*.36,baseZ=side*1.47;
        leaf.position.set(baseX,0,baseZ);leaf.userData={side,half,baseX,baseZ,travel:.68};body.add(leaf);doors.push(leaf);
        block(leaf,0,2.1,0,.69,2.12,.065,'#bacdcb');block(leaf,0,2.57,side*.047,.50,.89,.04,'#193f4b');block(leaf,0,1.63,side*.047,.68,.26,.04,stripe);
      }
    }
    for(const end of car.kind==='cab'?[-1]:[-1,1])block(body,end*7.48,2.04,0,.78,2.1,2.16,'#536365');
    block(body,-1,3.55,0,5,.24,1.3,'#9aa9a8');
    const parts={body};
    for(const [name,x] of [['bogieFront',4.7],['bogieBack',-4.7]]){
      const group=new T.Group();root.add(group);parts[name]=group;
      for(const side of [-1,1])block(group,x,.20,side*.66,1.15,.68,.30,'#27373a');
    }
    return {parts,doors,doorTargets:[],bogieOffsets:[4.7,-4.7],bogieOffset:4.7,tail:i===formation.count-1};
  });
  function apply(d){
    for(const [color,key] of [['#e5e8dd','body'],[stripe,'stripe'],['#e4a553','stripe2'],['#bacdcb','door'],['#9aa9a8','roof']])materials.get(color)?.color.set(d[key]);
  }
  if(design)apply(design);
  return {root,cars,length:islandCarLength,train:'monorail',paint:{apply,dispose(){resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}}};
}
