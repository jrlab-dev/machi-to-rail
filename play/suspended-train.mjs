import * as T from 'three';
import {islandCarLength} from './island-route.mjs?v=rail-90';
import {suspendedLivery} from './suspended-livery.mjs?v=rail-90';

export function createSuspendedTrain(formation,other,design=null){
  const root=new T.Group(),resources=[],colors=new Map(),cube=new T.BoxGeometry(),wheel=new T.CylinderGeometry(1,1,1,16);
  resources.push(cube,wheel);
  const skin=suspendedLivery(other,resources,design);
  function metal(color){
    if(!colors.has(color)){const m=new T.MeshStandardMaterial({color,metalness:.28,roughness:.48,side:T.DoubleSide});colors.set(color,m);resources.push(m);}
    return colors.get(color);
  }
  function box(parent,x,y,z,l,h,w,color){
    const m=new T.Mesh(cube,metal(color));m.scale.set(l,h,w);m.position.set(x,y,z);parent.add(m);return m;
  }
  function axle(parent,x,y,z,r,width,color){
    const m=new T.Mesh(wheel,metal(color));m.scale.set(r,width,r);m.rotation.x=Math.PI/2;m.position.set(x,y,z);parent.add(m);
  }
  function brace(parent,from,to,w,d,color){
    const a=new T.Vector3(...from),b=new T.Vector3(...to),v=b.clone().sub(a);
    const m=box(parent,...a.clone().lerp(b,.5).toArray(),w,v.length(),d,color);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
  }
  // Moving door leaves and sign panels stay independent. Fastenings move together
  // with their car body or their individual bogie on curves.
  function batchHardware(parent){
    for(const geometry of [cube,wheel]){
      const fittings=parent.children.filter(m=>m.geometry===geometry);
      if(!fittings.length)continue;
      const batch=new T.InstancedMesh(geometry,metal('#ffffff'),fittings.length);
      fittings.forEach((m,i)=>{
        m.updateMatrix();batch.setMatrixAt(i,m.matrix);batch.setColorAt(i,m.material.color);parent.remove(m);
      });
      parent.add(batch);resources.push(batch);
    }
    return parent;
  }
  function surface(parent,material,build){
    const pos=[],uv=[],indices=[];
    function quad(a,b,c,d){
      const i=pos.length/3;
      for(const v of [a,b,c,d]){pos.push(...v.slice(0,3));uv.push(...v.slice(3));}
      indices.push(i,i+1,i+2,i,i+2,i+3);
    }
    build(quad);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    parent.add(new T.Mesh(g,material));resources.push(g);
  }
  // Belt, shoulder and roof profiles in metres. The nose leans back above the waist.
  const profile=[[.85,1.11,7.10],[.99,1.32,7.36],[1.22,1.43,7.52],[1.90,1.46,7.55],[2.32,1.46,7.49],[3.18,1.42,7.10],[3.39,1.35,6.96],[3.53,1.14,6.80],[3.58,.97,6.74]];
  const doorXs=[-4.25,4.25],stations=[-7.28,-5.03,-3.47,3.47,5.03,5.94];
  function shell(body,tail){
    for(const sign of [-1,1]){
      surface(body,skin.side,quad=>{
        for(let j=1;j<profile.length;j++){
          const vertex=(i,k)=>{const [y,z,nose]=profile[i],x=k===stations.length?nose-.29:stations[k];return [x,y,sign*z,(x+7.28)/14.56,(y-.85)/2.73];};
          for(let k=0;k<stations.length;k++){
            if((k===1||k===3)&&j>=2&&j<=5)continue;
            const verts=[vertex(j-1,k),vertex(j-1,k+1),vertex(j,k+1),vertex(j,k)];quad(...(sign>0?verts:verts.reverse()));
          }
        }
      });
    }
    surface(body,skin.faces[Number(tail)],quad=>{
      const fractions=[-1,-.92,-.74,-.45,0,.45,.74,.92,1];
      const vertex=(j,k)=>{const [y,z,nose]=profile[j],t=fractions[k];return [nose-.29*t**4,y,z*t,(1-t)/2,(y-.85)/2.73];};
      for(let j=1;j<profile.length;j++)for(let k=1;k<fractions.length;k++)quad(vertex(j-1,k),vertex(j-1,k-1),vertex(j,k-1),vertex(j,k));
    });
    box(body,-.28,3.55,0,14.04,.07,1.95,'#bdc9c7');
    box(body,-.1,.88,0,14.35,.11,2.18,'#76868a');
    box(body,-7.23,2.16,0,.1,2.49,2.47,'#b1bdbc');
  }
  function bogie(x){
    const group=new T.Group();root.add(group);
    box(group,x,5.22,0,2.05,.38,.38,'#374954');
    for(const dx of [-.70,.70])for(const sign of [-1,1])axle(group,x+dx,5.10,sign*.41,.23,.24,'#273239');
    box(group,x,4.53,0,.39,1.18,.26,'#495d67');
    box(group,x,3.85,0,2.03,.22,1.62,'#627883');
    for(const sign of [-1,1]){
      brace(group,[x-.77,3.69,sign*.63],[x-.17,4.46,sign*.09],.12,.14,'#8d9da1');
      brace(group,[x+.77,3.69,sign*.63],[x+.17,4.46,sign*.09],.12,.14,'#8d9da1');
      axle(group,x,4.37,sign*.16,.17,.11,'#a1afb0');
    }
    // Rubber-metal secondary springs and their bolted caps sit above the roof beam.
    for(const sign of [-1,1])for(const dx of [-.66,.66]){
      for(let j=0;j<3;j++)box(group,x+dx,3.67+j*.052,sign*.61,.34,.038,.26,j===1?'#374548':'#95a3a2');
    }
    return batchHardware(group);
  }
  const cars=formation.cars.map((_,i)=>{
    const body=new T.Group(),doors=[];root.add(body);shell(body,formation.count>1&&i===formation.count-1);
    const signPanel=new T.PlaneGeometry(1.21,.19);resources.push(signPanel);
    const sign=new T.Mesh(signPanel,skin.destinations[1]);sign.name='destination';body.add(sign);
    sign.position.set(7.12,3.27,0);
    // The panel leans back with the glazing; its local up axis points toward the roof.
    sign.rotation.set(0,Math.PI/2,0);sign.rotateX(-.48);
    for(const z of [-.70,.70]){
      brace(body,[7.47,2.30,z+.17],[7.43,2.43,z-.12],.022,.023,'#29393e');
      brace(body,[7.43,2.43,z-.29],[7.43,2.43,z+.055],.027,.025,'#253337');
    }
    box(body,0,.99,0,14.35,.12,2.75,'#818687');
    box(body,0,3.17,0,13.39,.07,2.76,'#e4dfc6');
    for(const x of doorXs){
      // Short vestibule screens leave a passage to the passenger seats.
      for(const offset of [-.86,.86])for(const side of [-1,1])box(body,x+offset,1.65,side*1.12,.09,1.17,.44,'#d6d5bf');
      for(const sign of [-1,1]){
        box(body,x,1.03,sign*1.38,1.56,.07,.19,'#b9ad76');
        for(const half of [-1,1]){
          const baseX=x+half*.39,baseZ=sign*1.462,leaf=new T.Group();
          leaf.position.set(baseX,0,baseZ);leaf.userData={side:sign,half,baseX,baseZ,travel:.78};body.add(leaf);doors.push(leaf);
          surface(leaf,skin.leaf,quad=>{const v=(u,y)=>[(u-.5)*.777,.99+y*2.19,0,u,y];quad(v(0,0),v(1,0),v(1,1),v(0,1));});
        }
      }
    }
    for(const sign of [-1,1]){
      const plate=new T.PlaneGeometry(1.22,.27);resources.push(plate);const badge=new T.Mesh(plate,skin.badge);body.add(badge);
      badge.position.set(1.72,1.70,sign*1.467);badge.rotation.y=sign>0?0:Math.PI;
      for(const x of [-2.7,0,2.7])box(body,x,.84,sign*1.08,2.1,.09,.20,'#92a1a2');
    }
    for(const x of [-1.9,1.6]){
      box(body,x,3.66,0,2.40,.27,1.39,'#a9b7b9');
      for(let j=0;j<8;j++)box(body,x-.88+j*.25,3.804,0,.13,.025,.99,'#66777d');
      box(body,x,.75,0,1.91,.27,1.42,'#5e7179');
    }
    batchHardware(body);
    return {setDestination(seaward){sign.material=skin.destinations[Number(seaward)];},parts:{body,bogieFront:bogie(4.7),bogieBack:bogie(-4.7)},doors,doorTargets:[],bogieOffsets:[4.7,-4.7],bogieOffset:4.7,tail:i===formation.count-1};
  });
  if(cars.length===2){
    const lead=cars[0].parts.body,tail=cars[1].parts.body;
    // Corresponding corners of the two inward-facing end walls share each ring.
    const rings=11,corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
    const pos=new T.BufferAttribute(new Float32Array(rings*4*3),3).setUsage(T.DynamicDrawUsage);
    const indices=[];
    for(let i=0;i<rings-1;i++)for(let j=0;j<4;j++){
      const a=i*4+j,b=i*4+(j+1)%4;indices.push(a,b,b+4,a,b+4,a+4);
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',pos);geometry.setIndex(indices);
    const rubber=new T.MeshStandardMaterial({color:'#445059',roughness:.95,side:T.DoubleSide,flatShading:true});
    const bellows=new T.Mesh(geometry,rubber);bellows.name='連結幌';bellows.frustumCulled=false;
    lead.add(bellows);resources.push(geometry,rubber);
    const relative=new T.Matrix4(),a=new T.Vector3(),b=new T.Vector3();
    cars[0].updateGangway=()=>{
      lead.updateMatrix();tail.updateMatrix();relative.copy(lead.matrix).invert().multiply(tail.matrix);
      for(let i=0;i<rings;i++)for(let j=0;j<4;j++){
        const [vertical,lateral]=corners[j],rib=i%2*.075;
        a.set(-7.19,2.13+vertical*(1.02+rib),lateral*(.81+rib));
        b.set(-7.19,a.y,-a.z).applyMatrix4(relative);
        a.lerp(b,i/(rings-1));pos.setXYZ(i*4+j,a.x,a.y,a.z);
      }
      pos.needsUpdate=true;
    };
  }
  return {root,cars,length:islandCarLength,train:'suspended-monorail',paint:{apply:skin.apply,dispose(){resources.forEach(r=>r.dispose());}}};
}
