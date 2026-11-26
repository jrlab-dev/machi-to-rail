import * as T from 'three';
import {glassHall,plazaCrowns} from './tokyo-landmarks.mjs?v=rail-90';
import {createSurfaceArt} from './tokyo-surface-art.mjs?v=rail-90';
import {createSurfaceDetails,platformSlab} from './tokyo-surface-platform.mjs?v=rail-90';
import {createPlatformInteriors} from './tokyo-platform-interior.mjs?v=rail-90';
import {tokyoStations,tokyoLength,tokyoTrackSpacing,tokyoInnerDistance,tokyoPose} from './tokyo-route.mjs?v=rail-90';

function facadeTexture(){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
  const g=canvas.getContext('2d');g.fillStyle='#b8c1c0';g.fillRect(0,0,256,512);
  for(let row=0;row<32;row++)for(let col=0;col<16;col++){
    const tone=(col*17+row*13+Math.floor(row/5)*7)%13;
    g.fillStyle=tone<3?'#bacdd1':tone>9?'#718a98':'#8da7b3';
    g.fillRect(col*16+1,row*16+1,14,11);
    g.fillStyle='#d3dcda';g.fillRect(col*16,row*16+13,16,2);
  }
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
// One lining segment seen broadside through a passenger window (about 6 m square).
function tunnelLining(lit){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const g=canvas.getContext('2d'),base=g.createLinearGradient(0,0,0,256);
  base.addColorStop(0,'#41474a');base.addColorStop(.45,'#656a69');base.addColorStop(1,'#343e40');
  g.fillStyle=base;g.fillRect(0,0,256,256);
  let seed=842;
  for(let i=0;i<2800;i++){
    seed=(1664525*seed+1013904223)>>>0;g.fillStyle=i%2?'#b8bab31d':'#18242826';
    g.fillRect(seed%256,(seed>>>12)%256,1+(seed>>>24)%3,2);
  }
  if(lit){
    const glow=g.createRadialGradient(128,147,5,128,147,130);
    glow.addColorStop(0,'#fff1cbce');glow.addColorStop(.34,'#efdbac80');glow.addColorStop(1,'#eed8a100');
    g.fillStyle=glow;g.fillRect(0,0,256,256);
  }
  for(const x of [1,128,254]){
    g.fillStyle='#2c373c88';g.fillRect(x,0,2,256);
    for(const y of [58,105,205]){g.fillStyle='#404947';g.fillRect(x<128?x+4:x-6,y,3,3);}
  }
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
function signTexture(station){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=176;
  const g=canvas.getContext('2d');g.fillStyle='#f3f2e9';g.fillRect(0,0,768,176);
  g.fillStyle='#057e7c';g.fillRect(0,130,768,22);g.fillStyle='#1b3437';
  g.font='bold 83px system-ui';g.textAlign='center';g.fillText(station,384,102);
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
export function createTokyoRenderer(loader,onError){
  const root=new T.Group(),surface=new T.Group(),sections=[];
  root.add(surface);
  const cube=new T.BoxGeometry(),dummy=new T.Object3D(),materials=new Map(),textures=[];
  const facade=facadeTexture();textures.push(facade);
  for(const lit of [false,true]){
    const image=tunnelLining(lit);textures.push(image);
    materials.set((lit?'lit-wall':'wall')+'/#ffffff',new T.MeshBasicMaterial({map:image}));
  }
  const batches=new Map(),instanceTints=new Map();
  let group=root,disposed=false,landmark=null;
  function material(color,kind='plain'){
    if(materials.has(kind))return materials.get(kind);
    const key=kind+'/'+color;
    if(!materials.has(key)){
      const art=createSurfaceArt(kind,textures);
      const m=art|| (kind==='lamp'?new T.MeshBasicMaterial({color}):new T.MeshStandardMaterial({color,roughness:.83,map:kind==='windows'?facade:null}));
      if(art){materials.set(kind,m);instanceTints.set(m,[]);}
      else materials.set(key,m);
      return m;
    }
    return materials.get(key);
  }
  function box(x,y,z,length,width,height,color,angle=0,pitch=0,kind='plain',roll=0){
    const m=material(color,kind);
    if(!batches.has(m))batches.set(m,[]);
    dummy.position.set(x,z,-y);dummy.rotation.set(roll,angle,pitch,'YXZ');dummy.scale.set(length,height,width);dummy.updateMatrix();
    batches.get(m).push(dummy.matrix.clone());
    instanceTints.get(m)?.push(color);
  }
  function flush(){
    for(const [m,list] of batches){
      const mesh=new T.InstancedMesh(cube,m,list.length);
      const tints=instanceTints.get(m);
      if(tints){const tint=new T.Color();tints.forEach((color,i)=>mesh.setColorAt(i,tint.set(color)));tints.length=0;}
      list.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.computeBoundingSphere();group.add(mesh);
    }
    batches.clear();
  }
  function at(s,offset,z,length,width,height,color,kind){
    const [x,y,a,h,p]=tokyoPose(s);
    box(x-offset*Math.sin(a),y+offset*Math.cos(a),h+z,length,width,height,color,a,p,kind);
  }
  function tunnelWall(i,s,side,wall,top,stride){
    // Offset opposite walls by one segment so the two windows see different landmarks.
    const bay=i+(side>0?0:1),lit=bay%2===0,niche=bay%19===5;
    const inner=wall-.175,depth=niche?.95:0;
    at(s,side*(wall+depth),top/2-.17,stride+.18,.35,top+.34,'#ffffff',lit?'lit-wall':'wall');
    if(niche){
      for(const end of [-1,1])at(s+end*(stride/2-.1),side*(inner+depth/2),top/2-.17,.22,depth+.15,top+.34,'#565f61');
      at(s,side*(inner+depth/2),top-.09,stride,depth+.35,.28,'#545e60');
      at(s,side*(inner+depth/2),.12,stride,depth+.65,.36,'#778080');
      at(s,side*(inner+depth-.05),2.18,1.15,.10,1.8,'#505d60');
      at(s,side*(inner+depth-.12),2.60,.58,.06,.25,'#a6c4ae');
    }
    const face=inner+depth;
    if(lit){
      at(s,side*(face-.085),2.65,1.65,.20,.33,'#454e52');
      at(s,side*(face-.21),2.65,1.40,.10,.18,'#ffebbe','lamp');
    }else if(bay%7===3&&!niche){
      at(s,side*(face-.1),2.0,1.06,.21,1.32,'#808c8a');
      at(s,side*(face-.23),2.2,.45,.05,.17,'#c4b78a');
    }
    for(const z of [1.1,1.33])at(s,side*(inner-.09),z,stride+.16,.085,.075,'#323e42');
    at(s-1.85,side*(inner-.16),1.22,.12,.22,.42,'#7e8988');
  }
  // Keep each stretch bounded so a cab in the tunnel only draws nearby construction.
  const steps=Math.ceil(tokyoLength/6),stride=tokyoLength/steps;
  for(let i=0;i<steps;i++){
    if(i%28===0){group=new T.Group();root.add(group);sections.push(group);group.userData.center=tokyoPose(Math.min(tokyoLength,(i+14)*stride));}
    const s=(i+.5)*stride,[x,y,heading,h,grade]=tokyoPose(s);
    const station=tokyoStations.find(t=>t.underground&&Math.abs(t.s-s)<132);
    const mid=tokyoTrackSpacing/2,wall=station?10:mid+3.55;
    for(const offset of [0,tokyoTrackSpacing]){
      const span=offset?tokyoInnerDistance(s+stride/2)-tokyoInnerDistance(s-stride/2):stride;
      if(h>=12)at(s,offset,-.39,span+.08,5,.58,'#ffffff','ballast');
      else at(s,offset,-.42,span+.08,5,.58,'#595755');
      for(const v of [-.565,.565])at(s,offset+v,-.065,span+.055,.10,.13,'#b5bec1');
      if(h<12)for(let k=-2;k<=2;k++)at(s+k*stride/5,offset,-.15,.22,2.25,.14,'#93928a');
    }
    if(h<12){
      const ceiling=h<5.8;
      const top=ceiling?6.45:Math.max(.35,11.55-h);
      for(const side of [-1,1]){
        if(ceiling&&!station)tunnelWall(i,s,side,wall+side*mid,top,stride);
        else at(s,mid+side*wall,top/2-.17,stride+.18,.35,top+.34,station?'#b3c0ba':'#687178');
      }
      at(s,mid,-.63,stride+.24,2*wall+.55,.35,'#545956');
      if(ceiling){
        if(!station){
          at(s,mid,.12,stride+.20,1.3,.48,'#777e7d');
          if(i%4===0)at(s,mid,3.38,.55,.65,6.2,'#778080');
        }
        if(station){
          at(s,mid-wall+.22,1.1,stride+.14,.12,.23,'#718d8b');
          if(i%2===0)at(s,mid-wall+.22,3.1,.12,.17,6.2,'#96a19a');
        }
        at(s,mid,6.54,stride+.2,wall*2+.5,.35,station?'#859491':'#515d63');
        if(station&&i%2===0)at(s,4,4.6,2.6,.14,.13,'#fff1c4','lamp');
        if(station)at(s,mid-wall+.2,2.65,stride+.12,.10,.14,'#078688');
      }
    }else{
      for(const v of [0,tokyoTrackSpacing])at(s,v,-.95,stride+.14,5.7,.8,'#aaa69b');
      if(i%4===0)for(const v of [0,tokyoTrackSpacing])at(s,v,-3.7,1.45,2.8,5,'#aaa69b');
      if(i%6===0){
        at(s,tokyoTrackSpacing+2.7,3.2,.12,.15,6.4,'#566667');at(s,tokyoTrackSpacing+1.35,6,.13,2.9,.13,'#566667');
        at(s,-2.7,3.2,.12,.15,6.4,'#566667');at(s,-1.35,6,.13,2.9,.13,'#566667');
      }
      // The support is centred on every sixth segment. Short spans follow the curve.
      const sag=u=>6.06+.42*((u-3)/3)**2;
      const phase=i%6,start=sag((phase+5.5)%6),end=sag((phase+.5)%6);
      for(const v of [0,tokyoTrackSpacing]){
        const run=v?tokyoInnerDistance(s+stride/2)-tokyoInnerDistance(s-stride/2):stride;
        at(s,v,5.75,run+.035,.04,.05,'#485050');
        box(x-v*Math.sin(heading),y+v*Math.cos(heading),h+(start+end)/2,
          run+.04,.042,.042,'#485050',heading,grade+Math.atan2(end-start,run));
        const rise=(start+end)/2-5.75;
        at(s,v,5.75+rise/2,.034,.034,rise,'#485050');
        if(phase===0)at(s,v,6.23,.10,.12,.51,'#566667');
      }
    }
    if(i%28===27||i===steps-1)flush();
  }
  function stationPlatform(x,y,z,length,width,name,angle=0,underground=false,roof='#79918d',tokyoIsland=false){
    function part(u,v,h,l,w,b,color,kind){box(x+u*Math.cos(angle)-v*Math.sin(angle),y+u*Math.sin(angle)+v*Math.cos(angle),z+h,l,w,b,color,angle,0,kind);}
    if(tokyoIsland){
      platformSlab(box,y,z+.43,length,width,1.2,'#aaa9a1');
      platformSlab(box,y,z+1.09,length,width,.16,'#c1c0b5');
    }else{
      part(0,0,.43,length,width,1.20,'#aaa9a1');part(0,0,1.09,length,width,.16,'#c1c0b5');
    }
    for(const side of [-1,1])part(0,side*(width/2-.45),1.18,length,.31,.035,tokyoIsland?'#ffffff':'#f1c444',tokyoIsland?'tactile':'plain');
    if(!underground)part(0,0,5.55,length-12,width-.4,.25,roof);
    if(tokyoIsland)part(0,0,5.412,length-12,width-.42,.025,'#ffffff','soffit');
    if(underground)return;
    for(let u=-length/2+9;u<length/2-6;u+=15){
      if(tokyoIsland&&Math.abs(u+48)<7.2)continue;
      part(u,0,3.28,.26,.27,4.3,'#61817d');part(u,0,5.33,.24,width-.55,.20,'#b9c7c3');
      if(!tokyoIsland&&Math.round((u+length/2-9)/15)%3===0){
        part(u,1,1.66,3.2,.57,.22,'#96755d');part(u,1.30,2.0,3.2,.12,.68,'#a28367');
      }
    }
    if(name==='有楽町'){
      const key='yurakucho-sign';
      if(!materials.has(key)){
        const t=signTexture(name);textures.push(t);materials.set(key,new T.MeshBasicMaterial({map:t}));
      }
      const boards=[];
      for(const u of [-108,-48,42,108]){
        part(u,0,4.32,.15,3.56,.83,'#364142');
        for(const side of [-1,1]){
          part(u,side*1.18,5.03,.07,.07,.68,'#788985');
          dummy.position.set(x+u+side*.085,z+4.32,-y);dummy.rotation.set(0,side*Math.PI/2,0);
          dummy.scale.set(3.48,.77,1);dummy.updateMatrix();boards.push(dummy.matrix.clone());
        }
      }
      for(const u of [-72,0,72]){
        part(u,0,3.56,4.1,.15,1.02,'#364142');
        for(const side of [-1,1]){
          part(u+side*1.5,0,4.75,.07,.07,1.33,'#788985');
          dummy.position.set(x+u,z+3.56,-y+side*.085);dummy.rotation.set(0,side>0?0:Math.PI,0);
          dummy.scale.set(4,.96,1);dummy.updateMatrix();boards.push(dummy.matrix.clone());
        }
      }
      for(let u=-108;u<=108;u+=18)for(const side of [-1,1])part(u,side*1.86,5.18,4.8,.15,.08,'#fff3cc');
      const signs=new T.InstancedMesh(new T.PlaneGeometry(),materials.get(key),boards.length);
      boards.forEach((m,i)=>signs.setMatrixAt(i,m));signs.computeBoundingSphere();group.add(signs);
      return;
    }
    if(!name)return;
    const t=signTexture(name);textures.push(t);
    const m=new T.MeshBasicMaterial({map:t,side:T.DoubleSide});materials.set('sign-'+name+'-'+x,m);
    for(const u of [-length*.34,0,length*.34]){
      const sign=new T.Mesh(new T.PlaneGeometry(4.6,1.1),m);
      sign.position.set(x+u*Math.cos(angle),z+3.2,-y-u*Math.sin(angle));sign.rotation.y=angle+(Math.cos(angle)>0?0:Math.PI);
      group.add(sign);
    }
  }
  group=root;
  for(const station of tokyoStations.filter(t=>t.underground)){
    const [x,y,a,z]=tokyoPose(station.s);
    const mid=tokyoTrackSpacing/2;
    stationPlatform(x-mid*Math.sin(a),y+mid*Math.cos(a),z,245,9,station.name,a,true);
  }
  flush();
  const interior=createPlatformInteriors(box,flush,value=>{group=value;});root.add(interior.root);
  function tokyoPlatforms(){
    const fittings=createSurfaceDetails(surface,box,materials,textures);
    const groups=[[1,2],[3,4],[5,6],[7,8],[9,10],[20,21],[22,23],[14,15],[16,17],[18,19]];
    groups.forEach(([a,b],i)=>{
      const y=6.1+(i-2)*18.8,z=a===1?25:18,length=a>=14?410:a===1?250:a<7?245:320;
      const width=a>=14?10:9;
      stationPlatform(0,y,z,length,width,'',0,false,i<5?'#879a94':'#babfc1',a===5);
      fittings.platform(a,b,y,z,length,width);
      for(const side of [-1,1]){
        if(a===5)continue;
        const v=y+side*(width/2+(a>=14?1.72:1.6)),gauge=a>=14?1.435:1.067;
        box(0,v,z-.43,length+32,3,.65,'#ffffff',0,0,a>=14?'standardBallast':'ballast');
        for(const r of [-1,1])box(0,v+gauge*r/2,z-.035,length+32,.095,.12,'#bcc4c4');
      }
      if(a===5)platformSlab(box,y,z-1.35,length+35,18.65,1.4,'#a49f94');
      else box(0,y,z-1.35,length+35,18.65,1.4,'#a49f94');
    });
    fittings.finish();
    // Continue the adjacent commuter lines beyond Tokyo's platform ends to Yurakucho.
    for(const y of [-18.8,-6.6]){
      const edge=245/2+16;
      for(const [from,to] of [[-330,-edge],[edge,925]]){
        const x=(from+to)/2,l=to-from;
        box(x,y,16.8,l,4.4,1.55,'#98958d');
        box(x,y,17.68,l,3.1,.45,'#ffffff',0,0,'ballast');
        for(const side of [-1,1])box(x,y+side*.565,17.96,l,.09,.12,'#bac4c6');
        for(let u=from+8;u<to;u+=24)box(u,y,13.5,1.75,2.45,5.7,'#9f9b90');
      }
    }
    stationPlatform(760,-12.7,18,245,9,'有楽町',0,false,'#909b92');
    stationPlatform(760,6.1,18,245,9,'有楽町',0,false,'#7d9689');
  }
  function building(x,y,w,d,height,body,base=11){
    const finish=(Math.round(x)+Math.round(y))%3===0?'stone':'glass';
    box(x,y,base+height/2,w,d,height,body,0,0,finish);
    box(x,y,base+height+.21,w+.25,d+.25,.55,'#a4afb0');
    box(x-w*.13,y,base+height+1.6,w*.35,d*.38,2.7,'#849397');
  }
  function beam(a,b,width,height,color){
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz);
    box((a[0]+b[0])/2,-(a[2]+b[2])/2,(a[1]+b[1])/2,length,width,height,color,
      Math.atan2(-dz,dx),Math.asin(dy/length));
  }
  const trees=[];
  function tree(x,y,z,scale){
    trees.push([x,y,z,scale]);
    for(const side of [-1,1])beam([x,z-2.1*scale,-y],[x+side*1.15*scale,z,-y+side*.55*scale],.16*scale,.20*scale,'#82715a');
  }
  function stationSquare(){
    // GSI orthophoto: the central plaza opens west, with the avenue between two towers.
    box(0,-139,11.11,292,115,.23,'#ffffff',0,0,'granite');
    box(0,-280,11.15,33,220,.23,'#ffffff',0,0,'granite');
    for(const side of [-1,1]){
      box(side*67,-146,11.33,65.8,52.8,.22,'#bcb7a7');
      box(side*67,-146,11.34,65,52,.24,'#91a377');
      if(!materials.has('tree-shadow')){
        const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');
        const shade=ctx.createRadialGradient(32,32,2,32,32,30);
        shade.addColorStop(0,'rgba(45,49,36,.41)');shade.addColorStop(.52,'rgba(54,55,42,.22)');shade.addColorStop(1,'rgba(54,55,42,0)');
        ctx.fillStyle=shade;ctx.fillRect(0,0,64,64);
        const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.repeat.x=8;textures.push(map);
        materials.set('tree-shadow',new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));
      }
      const shade=new T.Mesh(new T.PlaneGeometry(88,8),materials.get('tree-shadow'));
      shade.rotation.x=-Math.PI/2;shade.position.set(side*68.5+.7,11.24,181.5);surface.add(shade);
      for(let j=0;j<8;j++){
        const x=side*(30+j*11);
        tree(x,-181,15.1,1.13+.09*Math.sin(x));
        box(x,-181,12.2,.52,.52,2.3,'#82715a');
      }
    }
    building(68,-248,80,55,120,'#ddd8ca');building(68,-248,66,43,34,'#c1ccd0',131);
    building(-67,-250,84,53,115,'#c0c6c4');building(-67,-250,69,47,53,'#c9c9c0',126);
    glassHall(surface,materials,(a,b,w,h)=>beam(a,b,w,h,'#dae0da'));
    for(let i=0;i<4;i++)building(520+i*47,-108,40,42,36+i%2*8,'#c2c5be');
  }
  function streetGrid(){
    const bounds=[-1550,1330,-650,680];
    const outline=new T.Shape();
    outline.moveTo(bounds[0],bounds[2]);outline.lineTo(bounds[1],bounds[2]);outline.lineTo(bounds[1],bounds[3]);outline.lineTo(bounds[0],bounds[3]);outline.closePath();
    for(const [start,end] of [[625,1030],[2160,2615]]){
      const left=[],right=[];
      for(let d=start;d<=end;d+=5){const [x,y,a]=tokyoPose(d);
        left.push(new T.Vector2(x-(tokyoTrackSpacing+4.1)*Math.sin(a),y+(tokyoTrackSpacing+4.1)*Math.cos(a)));
        right.push(new T.Vector2(x+4.1*Math.sin(a),y-4.1*Math.cos(a)));
      }
      outline.holes.push(new T.Path([...left,...right.reverse()]));
    }
    const geo=new T.ShapeGeometry(outline),uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)-bounds[0])/2880,(uv.getY(i)-bounds[2])/1330);
    geo.rotateX(-Math.PI/2);
    const map=new T.TextureLoader().load(new URL('./assets/tokyo-aerial.webp',import.meta.url).href);
    map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;textures.push(map);
    const groundMat=new T.MeshBasicMaterial({map,color:'#e6e9e4'});materials.set('aerial',groundMat);
    const terrain=new T.Mesh(geo,groundMat);terrain.position.y=10.97;terrain.userData.terrain=true;group.add(terrain);
    for(const y of [-195,-312,210,315]){
      box(100,y,11.05,2050,13,.11,'#727b7e');
      for(let x=-880;x<1100;x+=18)box(x,y,11.13,6,.20,.035,'#e2ded0');
    }
    for(let x=-850;x<=1070;x+=105){
      for(const side of [-1,1])box(x,side*250,11.06,10,479,.11,'#7c8382');
      for(const y of [-377,-255,-135,-55,165,257,375]){
        if((Math.abs(x)<205&&y<0&&y>-315)||(x>465&&x<735&&y<0&&y>-155)||(Math.abs(x)<260&&y>0&&y<180))continue;
        const i=Math.round((x+850)/105),j=Math.round((y+380)/55);
        if(x>870&&y>0)continue;
        building(x+37,y,40+(i*7+j)%21,31+(i+j*3)%17,18+((i*53+j*19)%90),['#e6dfcf','#c6d3d5','#dadbd4'][(i+j)%3]);
      }
    }
    // Shopfronts and street furniture make the interval to Yurakucho legible from a window.
    for(let x=260;x<920;x+=24){
      const i=Math.round((x-260)/24),side=i%2?1:-1;
      if(side<0 && x>500&&x<710)continue;
      box(x,side*20,14.1,17,11,6.2,['#c3b3a3','#c5c1b2','#b3b9b5'][i%3]);
      box(x,side*14.4,13.3,14,.25,3.65,'#ffffff',0,0,'shop');
      box(x,side*13.9,15.57,16,1.25,.43,['#4f897e','#ae6d51','#8b805d'][i%3]);
      box(x+5,side*12.5,13.8,.18,.18,5.45,'#566266');
      box(x+5,side*12.2,16.45,.92,1,.15,'#ecedcc');
    }
    for(let x=-290;x<830;x+=32){
      box(x,-201,14.2,.47,.5,6.0,'#7b6756');tree(x,-201,18.1,1.22+.13*Math.cos(x));
    }
    plazaCrowns(surface,materials,trees);
    for(let x=250;x<900;x+=22){
      box(x,-5.8,14.4,1.6,2.4,6.55,'#aca69d');
      box(x,-2.6,16.6,2.0,8.3,.65,'#9e9990');
    }
  }
  const stages=[tokyoPlatforms,stationSquare,streetGrid];
  let stage=0;
  async function loadStation(){
    try{
      const r=await fetch(new URL('./assets/tokyo-marunouchi.glb.gz',import.meta.url));
      if(!r.ok)throw Error('駅舎を読みこめませんでした');
      const buffer=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if(disposed)return;
      const {scene}=await loader.parseAsync(buffer,'');
      landmark=scene;
      if(disposed){releaseLandmark();return;}
      scene.position.set(0,11,89);surface.add(scene);
    }catch(e){if(!disposed)onError('東京駅舎の読みこみに失敗しました。'+e.message);}
  }
  function releaseLandmark(){landmark?.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material))m.dispose();});}
  loadStation();
  return {root,update(body,mode,hidden){
    root.visible=!hidden;if(hidden)return;interior.update(body);
    if(stage<stages.length){group=surface;stages[stage++]();flush();}
    const overview=mode==='orbit'||mode==='station';
    surface.visible=overview||(body?.[3]??0)>2.8;
    for(const section of sections){const [x,y]=section.userData.center;section.visible=overview||!body||Math.hypot(x-body[0],y-body[1])<600;}
  },dispose(){
    disposed=true;root.remove(interior.root);interior.dispose();releaseLandmark();cube.dispose();for(const m of materials.values())m.dispose();textures.forEach(t=>t.dispose());
    root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.landmarkGeometry||o.userData.terrain||o.geometry?.type==='PlaneGeometry')o.geometry.dispose();});
  }};
}
