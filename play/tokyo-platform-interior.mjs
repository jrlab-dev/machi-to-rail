import * as T from 'three';
import {tokyoPose,tokyoTrackSpacing,tokyoStations} from './tokyo-route.mjs?v=rail-90';
import {createStationAds} from './station-ads.mjs?v=rail-94';

function painted(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
function tiled(dark,cool,floor){
  return painted(256,256,(g,w,h)=>{
    const rows=floor?4:8,cols=floor?4:2;
    g.fillStyle=dark?'#556365':'#97988e';g.fillRect(0,0,w,h);
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const b=(dark?98:cool?182:203)+(i*7+j*3)%13;
      g.fillStyle='rgb('+[b+(cool?-8:8),b+(cool?5:1),b+(cool?6:-13)].join(',')+')';
      g.fillRect(i*w/cols+1,j*h/rows+1,w/cols-2,h/rows-2);
      g.fillStyle='rgba(255,255,255,.24)';g.fillRect(i*w/cols+1,j*h/rows+1,w/cols-2,1);
    }
    let seed=705;for(let i=0;i<4000;i++){seed=(seed*1664525+1013904223)>>>0;g.fillStyle=i%2?'#ffffff13':'#282c3012';g.fillRect(seed%256,(seed>>>12)%256,1.6,1);}
  });
}
function information(station,cool,kind){
  return painted(1024,256,(g,w,h)=>{
    const accent=cool?'#22627c':'#9c5b38',code=cool?'04':'01';
    const text=(s,x,y,size,color,weight=600)=>{g.fillStyle=color;g.font=weight+' '+size+'px system-ui';g.fillText(s,x,y);};
    if(kind==='exit'){
      g.fillStyle='#232c31';g.fillRect(0,0,w,h);g.fillStyle='#ffcf4d';g.fillRect(16,22,310,209);
      text('↑  出口',40,154,82,'#1d2426');text(cool?'八重洲方面':'丸の内方面',365,128,70,'#fff');
      text(cool?'Yaesu  /  Exit B':'Marunouchi  /  Exit A',371,200,38,'#d9e2e3');return;
    }
    g.fillStyle='#f6f5ec';g.fillRect(0,0,w,h);g.fillStyle=accent;g.fillRect(0,184,w,14);
    g.strokeStyle=accent;g.lineWidth=13;g.beginPath();g.arc(102,98,66,0,Math.PI*2);g.stroke();
    g.textAlign='center';text(code,102,120,59,'#233642');g.textAlign='left';
    text(station,211,113,86,'#27363a');text(cool?'Yaesu Chika':'Marunouchi Chika',216,166,39,'#4e5857');
    text(cool?'有楽町':'八重洲地下',26,239,32,'#384740');g.textAlign='right';text(cool?'丸の内地下  →':'東京  →',998,239,32,'#384740');
  });
}
function ceilingPanel(){
  return painted(256,128,(g,w,h)=>{
    g.fillStyle='#777c79';g.fillRect(0,0,w,h);
    for(let i=0;i<4;i++){
      g.fillStyle=i%2?'#a6aba4':'#9da49e';g.fillRect(i*64+2,2,60,h-4);
      for(let k=0;k<8;k++){g.fillStyle='#7b827b';g.fillRect(i*64+7+k*7,12,2,103);}
    }
  });
}
function departures(cool){
  return painted(768,224,(g,w,h)=>{
    g.fillStyle='#25343a';g.fillRect(0,0,w,h);
    g.fillStyle='#f1f2e6';g.font='bold 30px system-ui';g.fillText('1  のりば　　発車案内',22,39);
    g.fillStyle='#0d191a';g.fillRect(9,56,750,158);
    const stops=cool?['丸の内地下','東 京']:['東 京','有楽町'];
    for(let i=0;i<2;i++){const y=111+i*74;g.fillStyle=i?'#b7c7ac':'#89dca8';g.font='bold 36px system-ui';g.fillText(i?'その次':'次の駅',28,y);g.fillStyle='#ffd577';g.fillText(stops[i],203,y);}
    g.fillStyle='#dae3dc';g.font='25px system-ui';g.fillText('かんじょう線',622,111);
  });
}
function tactilePaving(){
  return painted(64,64,(g,w,h)=>{
    g.fillStyle='#c89f45';g.fillRect(0,0,w,h);g.fillStyle='#e7bc48';g.fillRect(1,1,62,62);
    for(let x=8;x<64;x+=16)for(let y=8;y<64;y+=16){
      g.fillStyle='#b78835';g.beginPath();g.arc(x+1,y+1,4,0,Math.PI*2);g.fill();
      g.fillStyle='#faD566';g.beginPath();g.arc(x,y,3.5,0,Math.PI*2);g.fill();
    }
  });
}
function softShadow(){
  return painted(128,64,(g)=>{
    g.scale(64,32);g.translate(1,1);const shade=g.createRadialGradient(0,0,0,0,0,1);
    shade.addColorStop(0,'rgba(32,34,33,.55)');shade.addColorStop(.65,'rgba(28,32,32,.27)');shade.addColorStop(1,'rgba(25,29,28,0)');
    g.fillStyle=shade;g.fillRect(-1,-1,2,2);
  });
}
function vendingFront(){
  return painted(320,512,(g)=>{
    g.fillStyle='#e7edef';g.fillRect(0,0,320,512);
    g.fillStyle='#185b70';g.fillRect(9,9,302,49);g.fillStyle='#fff';g.font='bold 25px system-ui';g.fillText('DRINK STAND',23,43);
    g.fillStyle='#26434c';g.fillRect(12,68,244,283);
    const colors=['#a5cfa1','#80c3e0','#eea264','#d1c598','#cc7771','#83b1a3'];
    for(let r=0;r<3;r++)for(let i=0;i<6;i++){
      const x=21+i*39,y=84+r*92;g.fillStyle='#cbd8cd';g.fillRect(x+7,y,12,7);g.fillStyle=colors[(i+r*2)%6];g.fillRect(x+3,y+7,22,42);g.fillStyle='#fff4cd';g.fillRect(x+3,y+27,22,9);
      g.fillStyle='#c4d4d5';g.fillRect(x-2,y+51,38,5);g.fillStyle='#9fe1e4';g.fillRect(x+4,y+58,21,5);
    }
    g.fillStyle='#2d434a';g.fillRect(264,202,43,91);g.fillStyle='#a7e6db';g.fillRect(270,212,31,19);
    g.fillStyle='#6c797a';g.fillRect(29,395,210,61);g.fillStyle='#273334';g.fillRect(38,402,192,43);
  });
}
export function undergroundStationAt(body){
  if(!body||body[3]>1)return null;
  return tokyoStations.find(s=>{if(!s.underground)return false;const p=tokyoPose(s.s);return Math.hypot(p[0]-body[0],p[1]-body[1])<134;});
}
export function createPlatformInteriors(box,flush,setGroup){
  const root=new T.Group(),rows=[],owned=[],materials=[],textures=[],halls=[];
  const plane=new T.PlaneGeometry(1,1);owned.push(plane);
  function panelMat(t,repeat){
    textures.push(t);if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);}
    const m=new T.MeshBasicMaterial({map:t});materials.push(m);return m;
  }
  // One continuous moulded shell, with a rounded front lip and a reclined back.
  const profile=new T.Shape();
  profile.moveTo(-.27,.01);profile.quadraticCurveTo(-.32,.10,-.23,.11);
  profile.quadraticCurveTo(.01,.065,.15,.09);profile.quadraticCurveTo(.20,.09,.205,.18);
  profile.lineTo(.275,.64);profile.quadraticCurveTo(.29,.71,.34,.68);
  profile.lineTo(.267,.15);profile.quadraticCurveTo(.25,.032,.16,.025);
  profile.lineTo(-.24,-.01);profile.closePath();
  const shell=new T.ExtrudeGeometry(profile,{depth:.49,bevelEnabled:true,bevelSegments:3,bevelSize:.021,bevelThickness:.024,curveSegments:8});
  shell.translate(0,0,-.245);shell.rotateY(Math.PI/2);owned.push(shell);
  const dispenser=panelMat(vendingFront());
  const overhead=panelMat(ceilingPanel(),[66,9]),tactile=panelMat(tactilePaving(),[790,1]),shade=panelMat(softShadow());
  shade.transparent=true;shade.depthWrite=false;
  for(const station of tokyoStations.filter(s=>s.underground)){
    const [x,y,a]=tokyoPose(station.s),c=Math.cos(a),cool=station.name==='八重洲地下';
    const hall=new T.Group();hall.name=station.name+'・ホーム内装';root.add(hall);halls.push([hall,x,y]);setGroup(hall);
    const accent=cool?'#386b80':'#9d624a',seat=cool?'#3b8490':'#a5664e',metal='#6e787b',ivory='#e7e3d6';
    function part(u,v,h,l,w,b,col,kind){box(x+c*u,y+c*v,h,l,w,b,col,a,0,kind);}
    const panels=new Map(),seats=[],dummy=new T.Object3D();
    function face(mat,u,v,h,w,b,rot=0,floor=false){
      const o=dummy;o.rotation.set(0,0,0);o.position.set(x+c*u,h,-y-c*v);o.rotation.order='YXZ';o.rotation.y=a+rot;
      if(floor)o.rotation.x=-Math.PI/2;o.scale.set(w,b,1);o.updateMatrix();if(!panels.has(mat))panels.set(mat,[]);panels.get(mat).push(o.matrix.clone());
    }
    const mid=tokyoTrackSpacing/2;
    const wall=panelMat(tiled(false,cool,false),[62,1.3]),floor=panelMat(tiled(true,cool,true),[92,2.65]);
    for(const side of [-1,1])face(wall,0,mid+side*9.77,3.09,246,6.35,side>0?0:Math.PI);
    face(floor,0,mid,1.178,245,9,0,true);
    for(const edge of [-1,1])face(tactile,0,mid+edge*4.0,1.201,245,.32,0,true);
    // A plane viewed from below needs its normal facing down.
    const ceiling=new T.Mesh(plane,overhead);ceiling.position.set(x,6.345,-y-c*mid);
    ceiling.rotation.order='YXZ';ceiling.rotation.set(Math.PI/2,a,0,'YXZ');ceiling.scale.set(245,19.58,1);hall.add(ceiling);
    const led=panelMat(departures(cool));
    for(const side of [-1,1]){
      part(0,mid+side*9.70,1.82,245,.055,.13,accent);part(0,mid+side*9.70,5.42,245,.065,.31,accent);
      part(0,mid+side*9.65,.81,245,.14,.32,metal);
    }
    // Back-lit posters alternate with station-name panels on both sides of the train.
    const name=panelMat(information(station.name,cool,'name')),exit=panelMat(information(station.name,cool,'exit'));
    for(let bay=-4;bay<=4;bay++){
      const u=bay*26;
      for(const side of [-1,1]){
        const pos=u+(side>0?5:-4);
        rows.push({i:(bay+9+(cool?2:0)+(side<0?1:0))%5,x:x+c*pos,z:-y-c*(mid+side*9.54),height:3.27,wall:true});
        part(pos,mid+side*9.65,3.27,4.60,.18,1.79,'#bac1bc');
        if(bay%2===0||side>0)face(name,u-3,mid+side*9.55,3.32,4.85,1.22,side>0?0:Math.PI);
      }
      face(shade,u-1.65,6.65,1.184,3.65,1.20,0,true);
      // Individual seats and armrests allow daylight to show beneath the bench.
      for(let k=0;k<4;k++){
        const p=u-2.6+k*.64;
        dummy.position.set(x+c*p,1.62,-y-c*6.62);dummy.rotation.set(0,a,0);dummy.scale.setScalar(1);dummy.updateMatrix();seats.push(dummy.matrix.clone());
        part(p,6.59,1.59,.50,.46,.08,metal);
        part(p-.305,6.63,1.92,.044,.37,.055,metal);part(p-.305,6.75,1.8,.044,.048,.23,metal);
      }
      part(u-1.66,6.67,1.50,2.55,.12,.12,metal);
      for(const delta of [-2.4,-.92]){
        part(u+delta,6.67,1.34,.12,.12,.35,metal);part(u+delta,6.67,1.2,.35,.47,.05,metal);
      }
      // Cover fluorescent fittings with paired strips and add a transverse ceiling beam.
      part(u,mid,6.24,.34,19.5,.32,'#9a9e99');
      for(const v of [.4,3.6,8.6,11.8]){
        part(u,v,6.15,24.6,.28,.23,metal);part(u,v,6.01,23.9,.19,.065,'#fff0ce','lamp');
      }
      part(u+9,5.5,3.78,.75,.68,5.2,ivory);part(u+9,5.5,1.55,.81,.74,.75,metal);
      part(u+9,5.5,3.61,.77,.70,.32,accent);
      if((bay+2)%3===0){
        for(const v of [2.55,5.35])part(u+11,v,5.73,.045,.045,1.04,metal);
        part(u+11,3.95,4.66,.19,3.15,1.12,'#465352');
        face(led,u+10.89,3.95,4.66,3.09,1.06,-Math.PI/2);
        face(led,u+11.11,3.95,4.66,3.09,1.06,Math.PI/2);
      }
      if(bay%3===0){
        for(const v of [2.4,5.4])part(u+2,v,5.55,.045,.045,1.3,metal);
        part(u+2,3.9,4.79,.17,3.55,.92,'#26343a');
        face(exit,u+1.90,3.9,4.79,3.50,.87,-Math.PI/2);
        face(exit,u+2.10,3.9,4.79,3.50,.87,Math.PI/2);
        part(u+7,8.3,2.28,1.24,.87,2.2,'#c7d0d1');
        face(dispenser,u+7,7.85,2.28,1.20,2.08);
      }
    }
    const enamel=new T.MeshStandardMaterial({color:seat,roughness:.40,metalness:.05});materials.push(enamel);
    const benchSeats=new T.InstancedMesh(shell,enamel,seats.length);
    seats.forEach((pose,i)=>benchSeats.setMatrixAt(i,pose));benchSeats.computeBoundingSphere();hall.add(benchSeats);
    for(const [mat,poses] of panels){
      const mesh=new T.InstancedMesh(plane,mat,poses.length);
      poses.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();hall.add(mesh);
    }
    flush();
  }
  const ads=createStationAds(rows);root.add(ads.root);
  return {root,update(body){
    for(const [hall,x,y] of halls)hall.visible=!!body&&Math.hypot(body[0]-x,body[1]-y)<300;
    ads.root.visible=halls.some(([hall])=>hall.visible);
  },dispose(){ads.dispose();for(const [hall] of halls)hall.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const item of [...owned,...materials,...textures])item.dispose();}};
}
