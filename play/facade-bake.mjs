// Bake coplanar window overlays into their existing walls. Projecting structures stay intact.
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const length=a=>Math.hypot(...a);
const power2=n=>2**Math.ceil(Math.log2(n));

function facesFrom(meshes){
  const faces=[];
  for(const mesh of meshes){
    for(let i=0;i<mesh.indices.length;){
      const k=mesh.indices[i];
      const quad=mesh.indices.slice(i,i+6).every((v,j)=>v===k+[0,1,2,0,2,3][j])&&i+6<=mesh.indices.length;
      faces.push({vertices:mesh.vertices.slice(k,k+(quad?4:3)).map(v=>({p:[...v.p],n:[...v.n],uv:[...v.uv]}))});
      i+=quad?6:3;
    }
  }
  return faces;
}
function frame(face){
  const a=face.vertices[0].p,u=sub(face.vertices[1].p,a),v=sub(face.vertices[3].p,a);
  const w=length(u),h=length(v);
  return {a,u:u.map(x=>x/w),v:v.map(x=>x/h),w,h,n:face.vertices[0].n};
}
function project(f,p){const d=sub(p,f.a);return [dot(d,f.u)/f.w,dot(d,f.v)/f.h];}
function kind(face,apartment){
  if(face.vertices.length!==4)return null;
  const u=face.vertices.reduce((s,v)=>s+v.uv[0],0)/4*256;
  const v=face.vertices.reduce((s,p)=>s+p.uv[1],0)/4*256;
  if(apartment)return v<64&&u>=128?(u<192?'glass':'lit'):null;
  return v>=64&&v<128&&u<128?(u<64?'glass':'lit'):null;
}

export function planFacade(data,apartment=false){
  const faces=facesFrom(data.meshes),windows=faces.filter(f=>kind(f,apartment));
  const walls=faces.filter(f=>f.vertices.length===4&&!kind(f,apartment)&&Math.abs(f.vertices[0].n[1])<.1);
  for(const wall of walls)wall.frame=frame(wall);
  for(const window of windows){
    const candidates=walls.filter(w=>dot(w.frame.n,window.vertices[0].n)>.999&&
      window.vertices.every(v=>Math.abs(dot(sub(v.p,w.frame.a),w.frame.n))<=.035&&
        project(w.frame,v.p).every(t=>t>=-1e-6&&t<=1.000001)));
    candidates.sort((a,b)=>a.frame.w*a.frame.h-b.frame.w*b.frame.h);
    const wall=candidates[0];
    if(!wall)throw Error('A window has no containing wall');
    (wall.overlays??=[]).push(window);window.removed=true;
  }
  const hosts=walls.filter(w=>w.overlays);
  // Keep the reusable detail atlas in the top-left corner, with a padded boundary.
  let atlasWidth=512,atlasHeight,placements;
  for(;;){
    let x=0,y=272,row=0;placements=[];
    for(const wall of hosts){
      const w=Math.max(32,Math.min(480,Math.ceil(wall.frame.w*20)));
      const h=Math.max(32,Math.min(480,Math.ceil(wall.frame.h*20)));
      if(x+w+8>atlasWidth){x=0;y+=row;row=0;}
      placements.push({wall,x:x+4,y:y+4,w,h});x+=w+8;row=Math.max(row,h+8);
    }
    atlasHeight=power2(y+row);
    if(atlasHeight<=1024||atlasWidth===1024)break;
    atlasWidth=1024;
  }
  if(atlasHeight>2048)throw Error('Facade texture budget exceeded');
  return {faces,placements,width:atlasWidth,height:atlasHeight,windows:windows.length,
    trianglesBefore:faces.reduce((s,f)=>s+f.vertices.length-2,0),
    trianglesAfter:faces.filter(f=>!f.removed).reduce((s,f)=>s+f.vertices.length-2,0)};
}

export function bakeFacade(data,source,apartment=false,doc=document){
  const plan=planFacade(data,apartment),color=doc.createElement('canvas'),light=doc.createElement('canvas');
  color.width=light.width=plan.width;color.height=light.height=plan.height;
  const g=color.getContext('2d'),l=light.getContext('2d');
  g.fillStyle='#333333';g.fillRect(0,0,plan.width,plan.height);
  l.fillStyle='#000000';l.fillRect(0,0,plan.width,plan.height);
  g.drawImage(source.color,0,0); // Non-window structures remain non-emissive.
  function paint(ctx,image,face,x,y,w,h){
    const us=face.vertices.map(v=>v.uv[0]*256),vs=face.vertices.map(v=>v.uv[1]*256);
    ctx.drawImage(image,Math.min(...us),Math.min(...vs),Math.max(...us)-Math.min(...us),Math.max(...vs)-Math.min(...vs),x,y,w,h);
  }
  for(const {wall,x,y,w,h}of plan.placements){
    paint(g,source.color,wall,x-4,y-4,w+8,h+8);
    paint(g,source.color,wall,x,y,w,h);
    for(const overlay of wall.overlays){
      const points=overlay.vertices.map(v=>project(wall.frame,v.p));
      const left=Math.min(...points.map(p=>p[0])),right=Math.max(...points.map(p=>p[0]));
      const bottom=Math.min(...points.map(p=>p[1])),top=Math.max(...points.map(p=>p[1]));
      const rect=[x+left*w,y+(1-top)*h,(right-left)*w,(top-bottom)*h];
      paint(g,source.color,overlay,...rect);
      if(kind(overlay,apartment)==='lit')paint(l,source.light,overlay,...rect);
    }
    wall.bakedUV=[[x,y+h],[x+w,y+h],[x+w,y],[x,y]].map(p=>[p[0]/plan.width,p[1]/plan.height]);
  }
  const mesh={vertices:[],indices:[]};
  for(const face of plan.faces.filter(f=>!f.removed)){
    const start=mesh.vertices.length;
    face.vertices.forEach((v,i)=>mesh.vertices.push({...v,uv:face.bakedUV?.[i]||[v.uv[0]*256/plan.width,v.uv[1]*256/plan.height]}));
    mesh.indices.push(start,start+1,start+2);if(face.vertices.length===4)mesh.indices.push(start,start+2,start+3);
  }
  return {meshes:[mesh],color,light,stats:{windows:plan.windows,trianglesBefore:plan.trianglesBefore,trianglesAfter:plan.trianglesAfter,width:plan.width,height:plan.height}};
}
