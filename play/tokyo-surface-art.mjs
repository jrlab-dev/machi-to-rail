import * as T from 'three';

// Each tile spans this many metres along its two axes.
const metres={ballast:[2.48,5],standardBallast:[2.48,5],tactile:[.60,.30],coping:[1.2,.30],soffit:[3,1.2],granite:[4,4],glass:[6.4,7.2],stone:[5.6,7.2],shop:[7,3.65]};
// A five-metre-wide track bed. Both gauges use the same deterministic stone mix.
function trackBed(c,g,gauge){
  c.width=128;c.height=256;
  let seed=195;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  g.fillStyle='#68635c';g.fillRect(0,0,c.width,c.height);
  const gravel=['#77736d','#898680','#55534f','#6c6761','#96928b','#605e59'];
  for(let i=0;i<8200;i++){
    const x=random()*128,y=random()*256,r=1+random()*2.3;
    g.fillStyle=gravel[Math.floor(random()*gravel.length)];
    g.beginPath();g.moveTo(x-r,y);g.lineTo(x,y-r*.8);g.lineTo(x+r,y+.5);g.lineTo(x+.2,y+r);g.fill();
  }
  const halfTie=gauge>1.2?65:57;
  for(let x=16;x<128;x+=32){
    g.fillStyle='#514e488f';g.fillRect(x-6,128-halfTie+2,14,halfTie*2);
    g.fillStyle='#a49e91';g.fillRect(x-6,128-halfTie,11,halfTie*2);
    g.fillStyle='#c2bbac';g.fillRect(x-6,128-halfTie,2,halfTie*2);
    for(const sign of [-1,1]){
      const rail=128+sign*gauge*256/10;
      g.fillStyle='#665646';g.fillRect(x-5,rail-7,10,14);
      g.fillStyle='#444541';g.fillRect(x-4,rail-7,6,3);g.fillRect(x-3,rail+4,6,3);
    }
  }
}
export function createSurfaceArt(kind,textures){
  if(!metres[kind])return null;
  const c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d');
  const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
  const circle=(x,y,r,color)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
  const track=kind==='ballast'||kind==='standardBallast';
  if(track){
    trackBed(c,g,kind==='ballast'?1.13:1.435);
  }else if(kind==='tactile'){
    rect(0,0,128,128,'#deb44a');
    for(let j=0;j<5;j++)for(let i=0;i<10;i++){
      const x=(i+.5)*12.8,y=(j+.5)*25.6;
      g.save();g.translate(x,y);g.scale(1,2);circle(.6,.7,3.2,'#ae822d');circle(0,0,2.9,'#ebc354');circle(-.65,-.65,1.7,'#f8d878');g.restore();
    }
    for(const x of [0,64])rect(x,0,1,128,'#a78847');
  }else if(kind==='coping'){
    rect(0,0,128,128,'#d7d5ca');
    for(let x=3;x<128;x+=6)rect(x,10,1.4,105,'#aaa99e');
    rect(0,0,2,128,'#797c77');
  }else if(kind==='soffit'){
    rect(0,0,128,128,'#c3c9c3');
    for(let y=0;y<128;y+=16){rect(0,y,128,3,'#86938e');rect(0,y+3,128,2,'#e1e2d8');}
    rect(0,0,2,128,'#808983');
  }else if(kind==='granite'){
    rect(0,0,128,128,'#a59f93');
    const tones=['#d1c8b6','#d8cfbc','#c9c2b4','#d5ccbb','#d3cbbc'];
    for(let j=0;j<8;j++)for(let i=-1;i<4;i++){
      const x=i*32+(j%2)*16;
      rect(x+1,j*16+1,31,15,tones[((i+4)%4*7+j*3)%5]);
    }
    rect(0,0,3,128,'#b9afa0');
  }else if(kind==='shop'){
    rect(0,0,128,128,'#263c42');
    for(let i=0;i<4;i++){
      rect(32*i+2,7,28,101,i%2?'#698389':'#82989a');
      rect(32*i+4,57,24,32,i%2?'#a69579':'#87968b');
      rect(32*i+3,96,26,13,'#35494b');
    }
    rect(0,28,128,3,'#36494a');rect(0,114,128,14,'#67716c');
  }else{
    const stone=kind==='stone';
    rect(0,0,128,128,stone?'#cec6b8':'#889ca2');
    for(let j=0;j<2;j++)for(let i=0;i<4;i++){
      const x=i*32+(stone?5:1),y=j*64+(stone?7:2),w=stone?22:30,h=stone?40:58;
      const glaze=g.createLinearGradient(x,y,x+w*.35,y+h);
      glaze.addColorStop(0,'#a0b5bd');glaze.addColorStop(.54,'#76919c');glaze.addColorStop(1,(i+j)%3?'#566f7b':'#9aa8a9');
      rect(x,y,w,h,glaze);rect(x,y,w,2,'#51656b');rect(x+w-2,y,2,h,'#bcc8c5');
      if(stone)rect(x-2,y+h,w+4,3,'#a49f93');
    }
  }
  const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;
  map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;textures.push(map);
  const mat=new T.MeshStandardMaterial({map,roughness:.86});
  const [u,v]=metres[kind];
  // Use the instance's metre dimensions instead of stretching one tile across a building.
  mat.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
      vec3 size=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
      vec2 span=abs(normal.y)>.5 ? size.xz : abs(normal.x)>.5 ? size.zy : size.xy;
      vMapUv=uv*span/vec2(${u.toFixed(3)},${v.toFixed(3)});
      ${track ? 'vMapUv=normal.y>.5 ? vec2(uv.x*floor(size.x/.62+.5)/4.,(uv.y-.5)*size.z/5.+.5) : vec2(vMapUv.x,.07+fract(vMapUv.y)*.10);' : ''}`);
  };
  mat.customProgramCacheKey=()=>kind;
  return mat;
}
