// Only loaded while the player is in a growing land. Terrain, water and plants
// are derived from the save's coordinates; none of their meshes enter a save.
import {LAND_CELL_SIZE as SIZE,landSurfaceAt,landCells,landSection} from './growing-land.mjs?v=rail-94';
import {sampleItem} from './core.mjs?v=rail-97';
import {stationGeometry,stationFootprint} from './free-station.mjs?v=rail-97';

const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const tileOf=x=>Math.floor(x/SIZE+.5);
const chunkOf=x=>Math.floor((x+1)/3);
const distance=(x,y,i,j)=>Math.max(Math.abs(x-i),Math.abs(y-j));
const STEPS=16;
function point(land,u,v,height){
  return land.kind==='coast'?[v,height,-u]:[u,height,-v];
}
function paintBucket(){return {positions:[],colors:[],indices:[]};}
function append(buf,p,c){
  const index=buf.positions.length/3;buf.positions.push(...p);buf.colors.push(c.r,c.g,c.b);return index;
}
function waterTint(T,depth,x,y,coast){
  const sod=new T.Color(coast?'#a6d6c9':'#9bcbc0'),deep=new T.Color(coast?'#539daa':'#589caa');
  return sod.lerp(deep,Math.min(1,.24+depth)).multiplyScalar(1+.032*Math.sin(x*.014-y*.021));
}
function terrainCell(T,land,i,j,coarse,ground,water){
  const coast=land.kind==='coast',ci=coast?j:i,cj=coast?i:j;
  const lo=(ci-.5)*SIZE,hi=lo+SIZE,start=(cj-.5)*SIZE,rows=[],flow=[];
  for(let row=0;row<=STEPS;row++){
    const v=start+SIZE*row/STEPS,section=landSection(land,v),cuts=[lo,hi];
    for(let k=1;k<8;k++)cuts.push(lo+SIZE*k/8);
    for(const b of section)cuts.push(clamp(b,lo,hi));
    cuts.sort((a,b)=>a-b);
    const ids=[];
    for(const u of cuts){
      const [x,,z]=point(land,u,v,0),value=landSurfaceAt(land,x,-z);
      const c=new T.Color(value.color);
      if(!value.water)c.multiplyScalar(.99+.013*Math.cos(x*.023+z*.019));
      ids.push(append(ground,[x,value.height,z],c));
    }
    rows.push(ids);
    if(!section.length)continue;
    const a=clamp(coast?section[3]:section[2],lo,hi),b=coast?hi:clamp(section[8],lo,hi),idsWater=[];
    for(const fraction of [0,.12,.5,.88,1]){
      // The offshore end and both riverbanks are continuous across cell edges.
      const u=a+(b-a)*fraction,[x,,z]=point(land,u,v,0),value=landSurfaceAt(land,x,-z);
      const depth=Math.max(0,((coast?-1.65:-2.1)-value.height)/(coast?5.5:4));
      idsWater.push(append(water,[x,coast?-1.665:-2.115,z],waterTint(T,depth,x,-z,coast)));
    }
    flow.push({a,b,ids:idsWater});
  }
  const triangle=(bucket,a,b,c)=>coast?bucket.indices.push(a,c,b):bucket.indices.push(a,b,c);
  const quad=(bucket,a,b,c,d)=>{triangle(bucket,a,b,c);triangle(bucket,a,c,d);};
  const last=rows[0].length-1;
  for(let r=0;r<STEPS;){
    const dr=coarse?2:1;
    for(let c=0;c<last;){
      const dc=coarse&&land.kind==='plain'?Math.min(2,last-c):1;
      const a=rows[r][c],b=rows[r][c+dc],d=rows[r+dr][c],e=rows[r+dr][c+dc];
      if(coarse&&((c===0||c+dc===last||r===0||r+dr===STEPS))){
        // Keep every boundary vertex, even where the adjacent tile uses full detail.
        const ring=[a];
        if(r===0&&dc===2)ring.push(rows[r][c+1]);ring.push(b);
        if(c+dc===last)ring.push(rows[r+1][c+dc]);ring.push(e);
        if(r+dr===STEPS&&dc===2)ring.push(rows[r+dr][c+1]);ring.push(d);
        if(c===0)ring.push(rows[r+1][c]);
        const center=dc===2?rows[r+1][c+1]:append(ground,
          [0,1,2].map(axis=>(ground.positions[3*a+axis]+ground.positions[3*e+axis])*.5),
          new T.Color().fromArray(ground.colors,3*a));
        for(let k=0;k<ring.length;k++)triangle(ground,ring[k],ring[(k+1)%ring.length],center);
      }else quad(ground,a,b,e,d);
      c+=dc;
    }
    r+=dr;
  }
  for(let row=1;row<flow.length;row++){
    const a=flow[row-1],b=flow[row];
    if(a.a===a.b&&b.a===b.b)continue;
    for(let col=0;col<4;col++)quad(water,a.ids[col],a.ids[col+1],b.ids[col+1],b.ids[col]);
  }
}

function grassTexture(T){
  const c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d');
  p.fillStyle='#f4f5ef';p.fillRect(0,0,128,128);
  for(let i=0;i<1600;i++){
    const x=(i*31.79+i*i*.011)%128,y=(i*75.17+i*i*.019)%128;
    p.fillStyle=i%5?'rgba(121,142,99,.16)':'rgba(255,254,222,.58)';
    p.fillRect(x,y,i%5?1.2:2.2,1+i%4);
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;
}
function meshFrom(T,bucket,material,textured){
  if(!bucket.indices.length)return null;
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(bucket.positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(bucket.colors,3));
  if(textured){
    const uv=[];
    for(let k=0;k<bucket.positions.length;k+=3)uv.push(bucket.positions[k]/21,-bucket.positions[k+2]/21);
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  }
  geometry.setIndex(bucket.indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,material);mesh.receiveShadow=true;return mesh;
}

// Interpolate the triangle actually displayed. The sampled hills differ slightly
// from their analytic surface between vertices, especially in the distant LOD.
function surfaceSampler(geometry){
  const coords=geometry.attributes.position.array,ids=geometry.index.array,bins=new Map();
  for(let k=0;k<ids.length;k+=3){
    const a=3*ids[k],b=3*ids[k+1],c=3*ids[k+2];
    const ax=coords[a],az=coords[a+2],bx=coords[b],bz=coords[b+2],cx=coords[c],cz=coords[c+2];
    const det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(det)<1e-7)continue;
    const tri=[a,b,c,det];
    for(let x=Math.floor(Math.min(ax,bx,cx)/40);x<=Math.floor(Math.max(ax,bx,cx)/40);x++)
      for(let z=Math.floor(Math.min(az,bz,cz)/40);z<=Math.floor(Math.max(az,bz,cz)/40);z++){
        const key=x+','+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(tri);
      }
  }
  return (x,z)=>{
    const nearby=bins.get(Math.floor(x/40)+','+Math.floor(z/40))||[];
    for(const [a,b,c,det] of nearby){
      const dx=x-coords[c],dz=z-coords[c+2];
      const u=((coords[b+2]-coords[c+2])*dx+(coords[c]-coords[b])*dz)/det;
      const v=((coords[c+2]-coords[a+2])*dx+(coords[a]-coords[c])*dz)/det;
      if(u>=-1e-6&&v>=-1e-6&&u+v<1.000001)
        return coords[c+1]+u*(coords[a+1]-coords[c+1])+v*(coords[b+1]-coords[c+1]);
    }
    return null;
  };
}
function randomFor(seed,i,j){
  let state=seed^Math.imul(i,73856093)^Math.imul(j,19349663);
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
}
function treesIn(land,i,j,avoid,sample){
  const random=randomFor(land.seed,i,j),trees=[];
  for(let g=0;g<5;g++){
    const cx=(i-.42+.84*random())*SIZE,cy=(j-.42+.84*random())*SIZE;
    for(let n=0;n<7;n++){
      const x=cx+(random()-.5)*37,y=cy+(random()-.5)*37,h=3.8+random()*5.4,type=random();
      const v=landSurfaceAt(land,x,y);
      if(v.water||v.height<-.6||avoid(x,y,h*.47+1))continue;
      const height=sample(x,-y);
      if(height!==null)trees.push({x,y,height:height-.045,h,type});
    }
  }
  return trees;
}
function obstacles(town,kit){
  const bins=new Map();
  function add(x,y,rx,ry){
    const b={x,y,rx:rx+6,ry:ry+6};
    for(let i=Math.floor((x-b.rx)/32);i<=Math.floor((x+b.rx)/32);i++)for(let j=Math.floor((y-b.ry)/32);j<=Math.floor((y+b.ry)/32);j++){
      const id=i+','+j;if(!bins.has(id))bins.set(id,[]);bins.get(id).push(b);
    }
  }
  for(const p of town.props||[]){const w=p.type==='tree'?4:18;add(p.pose[0],p.pose[1],w,w);}
  for(const it of town.rails||[]){
    if(!kit?.pieces[it.piece]){add(it.pose[0],it.pose[1],20,20);continue;}
    for(const r of kit.pieces[it.piece].routes){
      const n=Math.ceil(r.length/8);
      for(let k=0;k<=n;k++){const p=sampleItem(it,r,k/n);add(p[0],p[1],8,8);}
    }
  }
  if(kit)for(const station of town.stations||[]){
    const g=stationGeometry(station,town.rails,kit);
    if(g)for(const r of stationFootprint(g,station.side)){
      const c=Math.abs(Math.cos(r.angle)),s=Math.abs(Math.sin(r.angle));
      add(r.cx,r.cy,r.hx*c+r.hy*s,r.hx*s+r.hy*c);
    }
  }
  return (x,y)=>bins.get(Math.floor(x/32)+','+Math.floor(y/32))?.some(b=>Math.abs(b.x-x)<=b.rx&&Math.abs(b.y-y)<=b.ry);
}

export function createLandRenderer(T,kit){
  const root=new T.Group();root.name='growing-land';
  const texture=grassTexture(T),groundMat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:texture,roughness:.97});
  const waterMat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.37,metalness:.12});
  const treesMat=new T.MeshStandardMaterial({color:0xffffff,roughness:.9});
  const trunk=new T.CylinderGeometry(.38,.5,1,5),crown=new T.IcosahedronGeometry(1,0);
  const chunks=new Map(),dummy=new T.Object3D(),direction=new T.Vector3();
  let lastLand=null,lastTown=null,lastCamera='',lastCounts='';
  function remove(group){
    group.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.isMesh)o.geometry.dispose();});
    group.removeFromParent();
  }
  function addTrees(parent,rows,coarse){
    if(!rows.length)return;
    const leaves=new T.InstancedMesh(crown,treesMat,rows.length*(coarse?1:3));
    const stems=coarse?null:new T.InstancedMesh(trunk,treesMat,rows.length);
    const color=new T.Color();
    function put(mesh,i,x,h,z,w,hh,d,angle,tone){
      dummy.position.set(x,h,z);dummy.scale.set(w,hh,d);dummy.rotation.y=angle;dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.set(tone));
    }
    rows.forEach(({x,y,height,h,type},i)=>{
      if(stems)put(stems,i,x,height+h*.26,-y,h*.09,h*.52,h*.09,type*5,'#817256');
      const palette=type<.37?['#759561','#83a067','#709365']:type<.73?['#688e68','#709766','#598566']:['#8caa69','#92ae72','#74976a'];
      if(coarse)put(leaves,i,x,height+h*.62,-y,h*.41,h*.43,h*.41,type*6,palette[0]);
      else for(let n=0;n<3;n++){
        const a=type*6+n*2.094;
        put(leaves,3*i+n,x+h*.16*Math.cos(a),height+h*(.56+.085*n),-y+h*.16*Math.sin(a),h*.31,h*.33,h*.28,a,palette[n]);
      }
    });
    parent.add(leaves);if(stems)parent.add(stems);
  }
  function update(town,camera,force=false){
    if(!town?.land)return;
    const land=town.land,pos=camera?.position;
    let cx=pos?.x||0,cy=-(pos?.z||0);
    if(camera?.getWorldDirection&&pos.y>35){
      camera.getWorldDirection(direction);
      if(direction.y<-.15){const ahead=-pos.y/direction.y;cx+=direction.x*ahead;cy-=direction.z*ahead;}
    }
    const ci=tileOf(cx),cj=tileOf(cy),view=ci+','+cj;
    const counts=[town.props?.length,town.rails?.length,town.stations?.length].join('/');
    if(!force&&land===lastLand&&town===lastTown&&view===lastCamera&&counts===lastCounts)return;
    const vegetationChanged=force||town!==lastTown||counts!==lastCounts;
    const differentBase=!lastLand||lastLand.seed!==land.seed||lastLand.kind!==land.kind;
    lastLand=land;lastTown=town;lastCounts=counts;lastCamera=view;
    const planned=new Map(),owned=landCells(land);
    const visible=new Map();
    for(const [i,j] of owned)for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){
      // A one-cell landscape apron continues the terrain past the editable edge.
      if(distance(ci,cj,a,b)<=8)visible.set(a+','+b,[a,b]);
    }
    for(const [i,j] of visible.values()){
      const id=chunkOf(i)+','+chunkOf(j);
      if(!planned.has(id))planned.set(id,[]);
      planned.get(id).push([i,j]);
    }
    let avoid;
    for(const [id,cells] of planned){
      const coarse=cells.every(([i,j])=>distance(ci,cj,i,j)>1);
      const sig=cells.map(p=>p.join(',')).sort().join('/')+coarse;
      let existing=chunks.get(id);
      if(!existing||differentBase||existing.sig!==sig){
        if(existing)remove(existing.group);
        const group=new T.Group(),terrain=paintBucket(),water=paintBucket();
        for(const [i,j] of cells)terrainCell(T,land,i,j,coarse,terrain,water);
        const surface=meshFrom(T,terrain,groundMat,true),stream=meshFrom(T,water,waterMat,false);
        if(surface){surface.name='land-ground';group.add(surface);}
        if(stream){stream.name='land-water';group.add(stream);}
        root.add(group);existing={group,sig,plants:null,sample:surfaceSampler(surface.geometry)};chunks.set(id,existing);
      }else if(!vegetationChanged)continue;
      if(existing.plants)remove(existing.plants);
      avoid??=obstacles(town,kit);
      const plants=new T.Group(),rows=cells.flatMap(([i,j])=>treesIn(land,i,j,avoid,existing.sample));
      plants.name='land-trees';addTrees(plants,rows,coarse);existing.group.add(plants);existing.plants=plants;
    }
    for(const [id,item] of chunks)if(!planned.has(id)){remove(item.group);chunks.delete(id);}
  }
  return {root,update,dispose(){
    for(const {group} of chunks.values())remove(group);chunks.clear();root.removeFromParent();
    texture.dispose();groundMat.dispose();waterMat.dispose();treesMat.dispose();trunk.dispose();crown.dispose();
  }};
}
