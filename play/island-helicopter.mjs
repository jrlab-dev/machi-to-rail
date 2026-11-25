import {helicopterPose} from './island-air-traffic.mjs?v=rail-towns-71';
import * as T from 'three';

// The cabin, main rotor and tail rotor each use a single vertex-coloured mesh.
export function createHelicopter(root,box,round,resources){
  const padX=1111,padZ=27,deck=5.58;
  // A low operations building lifts the parked aircraft into the passenger sightline.
  box(padX,3.30,padZ,23,4,23,'#b9c8c3');
  box(padX,3.64,padZ+11.53,17,1.12,.10,'#516d78');
  for(const x of [-7,-3.5,0,3.5,7])box(padX+x,3.62,padZ+11.61,.14,1.14,.12,'#dbe2d6');
  box(padX,5.31,padZ,24,.20,24,'#aab9b3');
  round(padX,deck-.18,padZ,23,.26,23,'#899493');
  round(padX,deck-.03,padZ,19,.04,19,'#efdfb5');
  round(padX,deck-.006,padZ,18.45,.012,18.45,'#527674');
  for(const x of [-1.65,1.65])box(padX+x,deck+.016,padZ,.77,.026,5.7,'#f7eed6');
  box(padX,deck+.016,padZ,3.3,.026,.76,'#f7eed6');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;round(padX+10.4*Math.cos(a),deck+.07,padZ+10.4*Math.sin(a),.37,.23,.37,'#eac474');}

  const aircraft=new T.Group();aircraft.name='未来島・島内連絡ヘリ';root.add(aircraft);
  const cube=new T.BoxGeometry(),ball=new T.SphereGeometry(1,18,10),tube=new T.CylinderGeometry(1,1,1,12);
  const transform=new T.Object3D(),point=new T.Vector3(),normal=new T.Vector3(),nm=new T.Matrix3();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.1,side:T.DoubleSide});
  resources.push(material);
  let vertices=[],normals=[],colors=[];
  function add(g,x,y,z,sx,sy,sz,color,rx=0,ry=0,rz=0){
    transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz,'YXZ');transform.updateMatrix();
    const {position,normal:n}=g.attributes,index=g.index,c=new T.Color(color);nm.getNormalMatrix(transform.matrix);
    for(let j=0;j<(index?.count??position.count);j++){
      const i=index?index.getX(j):j;point.fromBufferAttribute(position,i).applyMatrix4(transform.matrix);
      normal.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();
      vertices.push(point.x,point.y,point.z);normals.push(normal.x,normal.y,normal.z);colors.push(c.r,c.g,c.b);
    }
  }
  function finish(parent){
    const g=new T.BufferGeometry();
    for(const [key,a] of [['position',vertices],['normal',normals],['color',colors]])g.setAttribute(key,new T.Float32BufferAttribute(a,3));
    const m=new T.Mesh(g,material);parent.add(m);resources.push(g);vertices=[];normals=[];colors=[];return m;
  }
  function strut(a,b,r,color){
    const d=new T.Vector3(...b).sub(new T.Vector3(...a)),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());
    const e=new T.Euler().setFromQuaternion(q,'YXZ');
    add(tube,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,d.length(),r,color,e.x,e.y,e.z);
  }
  const orange='#e96c33',ivory='#f3eddd',glass='#214b60',metal='#455b61';
  add(ball,.38,2.23,0,3.75,1.56,1.55,ivory);
  add(ball,2.30,2.54,0,1.96,1.16,1.48,glass,0,0,-.18);
  for(let j=0;j<9;j++){
    const a=-.35+j*.17,b=a+.17;
    function windshield(t){const x=1.97*Math.cos(t),y=1.18*Math.sin(t);return [2.30+x*Math.cos(.18)+y*Math.sin(.18),2.54-x*Math.sin(.18)+y*Math.cos(.18),0];}
    strut(windshield(a),windshield(b),.043,metal);
  }
  add(ball,.25,1.63,0,3.5,.60,1.52,orange);
  add(ball,-.8,3.65,0,1.97,.57,.91,orange);
  for(const side of [-1,1]){
    for(const x of [-1.12,.08,1.13])add(ball,x,2.63,side*(x<-.8?1.32:1.46),.49,.56,.18,glass);
    add(cube,-.52,2.03,side*1.52,.27,.06,.055,metal);
    add(ball,-1.92,3.75,side*.68,.83,.24,.24,'#56636a');
    strut([-2.38,.18,side*1.38],[2.46,.18,side*1.38],.12,metal);
    strut([2.46,.18,side*1.38],[2.98,.46,side*1.38],.115,metal);
    for(const x of [-1.32,1.42])strut([x,1.29,side*.76],[x-.17,.22,side*1.38],.10,metal);
  }
  const boom=new T.CylinderGeometry(.23,.66,1,16);
  add(boom,-5,2.72,0,1,5.3,1,orange,0,0,1.43);
  add(ball,-7.50,3.65,0,.58,1.24,.14,orange,0,0,-.32);
  add(cube,-6.5,2.98,0,1.08,.13,3.2,ivory,0,.12);
  add(tube,-.22,4.35,0,.12,.92,.12,metal);
  add(ball,3.65,1.97,0,.28,.21,.38,'#f8dd98');
  finish(aircraft);
  add(ball,0,0,0,.41,.17,.41,metal);
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    add(cube,3.36*Math.cos(a),0,-3.36*Math.sin(a),6.12,.085,.31,'#3c4b50',0,a);
    add(cube,6.53*Math.cos(a),0,-6.53*Math.sin(a),.32,.09,.31,'#ffc954',0,a);
  }
  const rotor=finish(aircraft);rotor.position.set(-.22,4.82,0);
  add(ball,0,0,0,.17,.17,.12,metal);
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3;
    add(cube,.57*Math.cos(a),.57*Math.sin(a),0,1.02,.15,.07,'#42545a',0,0,a);
    add(cube,1.09*Math.cos(a),1.09*Math.sin(a),0,.18,.15,.075,ivory,0,0,a);
  }
  const tail=finish(aircraft);tail.position.set(-7.64,3.85,.22);
  for(const g of [cube,ball,tube,boom])g.dispose();
  function update(time,body){
    const pose=helicopterPose(time,body,padX,padZ,deck-.06);
    aircraft.position.set(pose.x,pose.y,pose.z);aircraft.rotation.y=pose.yaw;
    rotor.rotation.y=time*25;tail.rotation.z=time*38;
  }
  update(0);return update;
}
