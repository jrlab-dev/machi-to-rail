import * as T from 'three';

const stairX=-48,stairLength=13,stairWidth=2.8;
// Leave the same opening through the platform paving and the viaduct below it.
export function platformSlab(box,y,z,length,width,height,color){
  const lo=stairX-stairLength/2,hi=stairX+stairLength/2;
  for(const [a,b] of [[-length/2,lo],[hi,length/2]])box((a+b)/2,y,z,b-a,width,height,color);
  for(const side of [-1,1])box(stairX,y+side*(width+stairWidth)/4,z,stairLength,(width-stairWidth)/2,height,color);
}
const lineColors={1:'#d97235',3:'#589cba',4:'#739b40',5:'#739b40',6:'#589cba',7:'#b39855',9:'#b39855',14:'#42688e',16:'#42688e',18:'#42688e',20:'#388176',22:'#388176'};
function signArt(type,a,b){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
  const g=canvas.getContext('2d');
  function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
  function label(s,x,y,size,color,align='left'){
    g.textAlign=align;g.fillStyle=color;g.font='600 '+size+'px system-ui';g.fillText(s,x,y);
  }
  if(type==='name'){
    rect(0,0,768,192,'#f5f4eb');label('東 京',384,79,77,'#263036','center');
    label('とうきょう　 Tokyo',384,119,34,'#324445','center');
    rect(0,134,768,17,'#6e993d');label('神田',17,181,27,'#27363b');label('有楽町  →',750,181,27,'#27363b','right');
  }else if(type==='exit'){
    rect(0,0,768,192,'#ffd25c');label('↓  出口',24,135,86,'#252527');
    label('丸の内・八重洲',385,90,46,'#252527');label('Marunouchi / Yaesu',388,144,28,'#333');
  }else{
    rect(0,0,768,192,'#1d292d');
    for(const [i,n] of [a,b].entries()){
      const x=i*384;rect(x+10,15,84,124,lineColors[n]||lineColors[n-1]||'#42688e');
      label(String(n),x+52,107,69,'#fff','center');
      const names={1:'中央線',2:'中央線',3:'京浜東北線',4:'山手線',5:'山手線',6:'京浜東北線',7:'上野東京ライン',8:'上野東京ライン',9:'東海道線',10:'東海道線'};
      label(names[n]||'新幹線',x+105,87,36,'#fbf9ee');
      const dirs={1:'高尾方面',2:'高尾方面',3:'大宮方面',4:'上野方面',5:'品川方面',6:'大船方面',7:'宇都宮・高崎方面',8:'宇都宮・高崎方面',9:'熱海方面',10:'熱海方面'};
      label(dirs[n]||(n<20?'東海道・山陽':'東北・上越・北陸'),x+106,139,25,'#d2dcd6');
    }
  }
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function createSurfaceDetails(root,box,materials,textures){
  const layouts=new Map(),dummy=new T.Object3D();
  function panel(type,a,b,x,y,z,width,height,angle){
    const key=type==='numbers'?type+a:type;
    if(!layouts.has(key)){
      const map=signArt(type,a,b);textures.push(map);
      const mat=new T.MeshBasicMaterial({map});materials.set('surface-sign-'+key,mat);layouts.set(key,{mat,poses:[]});
    }
    dummy.position.set(x,z,-y);dummy.rotation.set(0,angle,0);dummy.scale.set(width,height,1);dummy.updateMatrix();
    layouts.get(key).poses.push(dummy.matrix.clone());
  }
  function platform(a,b,y,z,length,width){
    const close=a===5, steel='#788985',pale='#b4c1b9',edge='#707c7d';
    function part(x,v,h,l,w,t,color,roll=0){box(x,y+v,z+h,l,w,t,color,0,0,'plain',roll);}
    for(const side of [-1,1]){
      if(close)box(0,y+side*(width/2-.17),z+1.181,length,.3,.028,'#ffffff',0,0,'coping');
      else part(0,side*(width/2-.17),1.181,length,.3,.028,'#e0ded1');
      part(0,side*(width/2-.20),5.55,length-12,.12,.32,edge);
      part(0,side*1.65,5.19,length-15,.15,.19,steel);
      for(let x=-length/2+12;x<length/2-9;x+=15){
        part(x,side*1.05,4.78,.14,2.45,.14,steel,side*.50);
        if(close)part(x,side*1.65,5.07,7.2,.15,.07,'#fff3cc');
      }
    }
    for(const x of [-length*.30,length*.30]){
      for(const off of [-1,1])part(x,off*1.30,4.95,.06,.06,.78,steel);
      part(x,0,4.14,.14,3.55,.95,'#364142');
      for(const side of [-1,1])panel('numbers',side<0?b:a,side<0?a:b,x+side*.082,y,z+4.14,3.49,.87,side*Math.PI/2);
    }
    if(!close)return;
    // Paving joints, tactile strip and boarding queue markers stay below foot level.
    for(let x=-120;x<=120;x+=2.4){
      for(const side of [-1,1]){
        part(x,side*3.02,1.174,.024,2.96,.007,'#a8a79f');
        if(Math.round((x+120)/2.4)%4===0){
          part(x,side*3.30,1.19,.19,.70,.025,'#719c6b');part(x+.62,side*3.30,1.19,.19,.70,.025,'#719c6b');
        }
      }
    }
    for(const x of [-87,-14,32,94]){
      // Station-name lightbox, readable on both faces.
      for(const dx of [-1.68,1.68])part(x+dx,0,4.47,.065,.065,1.55,steel);
      part(x,0,3.42,4.15,.16,1.16,edge);
      for(const side of [-1,1])panel('name',a,b,x,y+side*.092,z+3.42,4.06,1.04,side<0?0:Math.PI);
      for(let i=0;i<4;i++){
        const u=x-1.05+i*.70;
        part(u,.10,1.68,.62,.56,.12,'#a27e59');
        part(u,.37,1.95,.62,.09,.55,'#ae8969',-.10);
        part(u-.31,.10,1.87,.045,.32,.06,steel);
      }
      for(const dx of [-1,1]){part(x+dx,.12,1.43,.13,.18,.48,steel);part(x+dx,.12,1.21,.37,.49,.065,edge);}
      part(x,.14,1.57,2.9,.14,.11,steel);
    }
    const top=1.17,steps=32,rise=.232,run=stairLength/steps;
    for(let i=0;i<steps;i++){
      const u=stairX-stairLength/2+(i+.5)*run,h=top-i*rise;
      part(u,0,h-.15,run+.008,stairWidth,.3,'#9c9b91');
      part(u-run*.38,0,h+.012,.07,stairWidth,.021,'#d9c899');
    }
    for(const side of [-1,1]){
      part(stairX,side*(stairWidth/2+.06),-1.88,stairLength,.13,8.35,'#b2b3aa');
      part(stairX,side*(stairWidth/2+.06),2.34,stairLength,.15,.09,pale);
    }
    part(stairX+stairLength/2,0,1.75,.13,stairWidth,1.15,'#b2b3aa');
    const u=stairX-stairLength/2;
    for(const v of [-1.1,1.1])part(u,v,4.8,.06,.06,1.05,steel);
    part(u,0,3.88,.17,2.8,.77,edge);
    for(const side of [-1,1])panel('exit',a,b,u+side*.10,y,z+3.88,2.73,.69,side*Math.PI/2);
  }
  function finish(){
    for(const {mat,poses} of layouts.values()){
      const mesh=new T.InstancedMesh(new T.PlaneGeometry(),mat,poses.length);
      poses.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();root.add(mesh);
    }
  }
  return {platform,finish};
}
