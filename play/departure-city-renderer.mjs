import * as T from 'three';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
import {departurePlan,departureFootprint} from './departure-city-layout.mjs?v=rail-90';
export function createDepartureCity(blockers=[]){const root=new T.Group(),details=new T.Group();root.name='akatsuki-city';root.add(details);const materials=[],textures=[],buckets=new Map(),detailBuckets=new Map(),plan=departurePlan(blockers);
 const mat=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.85,...extra});materials.push(m);return m;};
 const paving=mat('#c6c5b9'),road=mat('#687778'),line=mat('#e5e2cb'),roof=mat('#6c7778'),garden=mat('#97a47c'),base=mat('#dbd7c7'),shopGlass=mat('#3f636d',{emissive:'#d9c7a0',emissiveIntensity:0,roughness:.3}),accents=['#5c807c','#84705c','#7b8170'].map(color=>mat(color));
 const facades=[];for(const color of['#a6bcc0','#a9ac9f','#c8bdad']){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,128,128);ctx.fillStyle='#4e707b';ctx.fillRect(16,18,96,78);ctx.fillStyle='#adc8ca';ctx.fillRect(20,21,88,5);ctx.fillStyle='#ced1c8';ctx.fillRect(61,18,5,78);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;textures.push(t);const glow=document.createElement("canvas");glow.width=glow.height=128;const gc=glow.getContext("2d");gc.fillStyle="#000000";gc.fillRect(0,0,128,128);gc.fillStyle="#ffffff";gc.fillRect(16,18,45,78);gc.fillRect(66,18,46,78);const light=new T.CanvasTexture(glow);light.wrapS=light.wrapT=T.RepeatWrapping;textures.push(light);facades.push(mat('#ffffff',{map:t,emissiveMap:light,emissive:'#b79c62',emissiveIntensity:0}));}
 function keep(g,m,detail=false){if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}const pool=detail?detailBuckets:buckets;if(!pool.has(m))pool.set(m,[]);pool.get(m).push(g);}
 function box(x,y,z,w,h,d,m,windows=false,detail=false){const g=new T.BoxGeometry(w,h,d);if(windows){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const side=Math.floor(i/4);uv.setXY(i,uv.getX(i)*(side<2?d:w)/3.6,uv.getY(i)*(side===2||side===3?d:h)/3.2);}}g.translate(x,y,-z);keep(g,m,detail);}
 box(310,-.13,225,570,.14,270,paving);
 for(const p of plan.paving)box(p.x,-.12,p.y,p.w,.1,p.d,paving);
 for(const r of plan.roads){if(r.added)box(r.x,-.03,r.y,r.w,.08,r.d,paving);box(r.x,r.added?.015:-.02,r.y,r.added&&!r.horizontal?r.w-2:r.w,.04,r.added&&r.horizontal?r.d-3:r.d,road);if(r.horizontal)box(r.x,.045,r.y,Math.min(4,r.w*.5),.02,.2,line);else box(r.x,.045,r.y,.2,.02,Math.min(4,r.d*.5),line);}
 for(const b of plan.buildings){const house=b.kind==='house'||b.kind==='rural',f=departureFootprint(b);box(b.x,-.07,b.y,f.w,.15,f.d,house?garden:paving);box(b.x,b.h/2,b.y,b.w,b.h,b.d,facades[b.id%3],true);
  if(house){const shape=new T.Shape();shape.moveTo(-b.w/2-.6,0);shape.lineTo(0,2.5);shape.lineTo(b.w/2+.6,0);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:b.d+1.2,bevelEnabled:false});g.translate(b.x,b.h,-b.y-b.d/2-.6);keep(g,roof);box(b.x,1.1,b.y-b.d/2-.03,1.2,2.2,.12,base);}
  else{
   const commercial=b.kind==='commercial';
   box(b.x,b.h+.25,b.y,b.w+.3,.5,b.d+.3,roof);box(b.x+2,b.h+1.15,b.y,4,1.6,3,base);
   if(commercial){box(b.x-b.w*.22,b.h+1.5,b.y+2,b.w*.38,2.5,b.d*.48,accents[b.id%3]);box(b.x,4.9,b.y,b.w,9.8,b.d,base);}
   const h=commercial?8.6:3.2,top=commercial?9.7:3.7;
   for(const side of[-1,1]){
    const y=b.y+side*(b.d/2+.1),bays=Math.max(3,Math.floor(b.w/5)),bw=(b.w-2)/bays;
    for(let i=0;i<bays;i++){
     const x=b.x-b.w/2+1+(i+.5)*bw;
     box(x,h/2+.3,y,bw-.25,h,.16,shopGlass,false,true);
     box(x-bw/2,h/2+.3,y+side*.12,.15,h+.2,.25,base,false,true);
     if(commercial)box(x,6.6,y+side*.12,bw-.2,.14,.25,base,false,true);
    }
    box(b.x,top-.2,y+side*.15,b.w-.6,.65,.4,accents[b.id%3],false,true);
    box(b.x,top-.7,y+side*(commercial?1:.35),b.w+.6,.25,commercial?2.6:1,base,false,true);
    box(b.x,2.5,y+side*.18,.12,4.8,.22,base,false,true);
    box(b.x+.65,2.7,y+side*.3,.07,.6,.15,base,false,true);
    if(commercial){
     for(const edge of[-1,1])box(b.x+edge*2.15,4.9,y+side*1.2,.5,9.1,.4,base,false,true);
     box(b.x,9.45,y+side*1.2,4.8,.55,.4,base,false,true);
     box(b.x,9.75,y+side,5.6,.3,2,base,false,true);
    }
   }
  }
 }
 // A small static line of crowns shares merged materials; no tree has an update loop.
 for(const t of plan.trees){box(t.x,1.7,t.y,.35,3.4,.35,roof,false,true);const g=new T.IcosahedronGeometry(1,0);g.scale(t.w/2,2.5,t.d/2);g.translate(t.x,4.5,-t.y);keep(g,garden,true);box(t.x,.06,t.y,2,.12,2,paving,false,true);}
 // Pedestrian route connects the station forecourt to the central avenue.
 box(300,.045,92,12,.04,18,paving);
 for(const [pool,parent]of[[buckets,root],[detailBuckets,details]])for(const [m,list]of pool){const g=mergeGeometries(list,false);list.forEach(a=>a.dispose());const mesh=new T.Mesh(g,m);mesh.receiveShadow=true;mesh.castShadow=true;parent.add(mesh);}
 let lighting='';
 return{root,update(body,phase,camera,light=false){root.visible=(body?.[0]||0)<1800;const x=camera?.position.x??body?.[0]??0,y=-(camera?.position.z??-(body?.[1]??0));details.visible=!light&&Math.hypot(x-340,y-80)<1000;if(lighting!==phase){lighting=phase;for(const m of facades)m.emissiveIntensity=phase==='night'?.22:phase==='sunset'?.06:0;shopGlass.emissiveIntensity=phase==='night'?.6:phase==='sunset'?.18:0;}},dispose(){root.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
