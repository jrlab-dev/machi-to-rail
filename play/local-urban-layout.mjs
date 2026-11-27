import {largeTown} from './large-town.mjs?v=rail-90';
import {elevatedTown} from './elevated-town.mjs?v=rail-90';
import {ROAD_TYPES,makeRoute,sampleRoute} from './core.mjs?v=rail-90';
import {parallelRoute} from './district.mjs?v=rail-90';
import {roadRects,stationGeometry,stationFootprint} from './free-station.mjs?v=rail-90';

// Each row follows an existing neighbourhood. World +Z points south.
const streets={
  district:[
    [-24,45,4,0,1], [75,120,5,0,1], [-12,164,5,0,2], [323,129,4,0,1],
    [-92,-55,6,1,1], [-147,-80,5,1,2], [519,-48,7,1,1], [572,-85,5,1,2],
    [7,-319,4,0,0], [268,-319,4,0,0], [357,46,3,0,0]
  ],
  large:[
    [35,-72,5,0,0], [35,-109,4,0,1], [235,-70,5,0,0], [237,-110,4,0,1],
    [33,-173,5,0,0], [43,-209,4,0,1], [236,-174,5,0,0], [242,-211,4,0,1],
    [122,64,5,0,1], [153,116,5,0,2], [503,-66,6,1,1], [-103,-82,4,1,1]
  ],
  elevated:[
    [37,47,6,0,0], [292,48,6,0,0], [74,99,6,0,1], [303,97,6,0,1], [158,150,5,0,2],
    [21,-132,6,0,0], [292,-131,6,0,0], [54,-179,6,0,1], [308,-184,5,0,1]
  ]
};

const kinds=[[3,1,4,2,3,1],[1,2,0,3,1,2,5],[5,0,1,5,2,0]];
function candidates(id){
  const lots=[];
  streets[id].forEach(([x0,z0,count,alongZ,tier],row)=>{
    let x=x0,z=z0,priorWidth=0;
    for(let bay=0;bay<count;bay++){
      const seed=101*(row+1)+19*bay,kind=kinds[tier][(row*3+bay)%kinds[tier].length];
      const riverfront=id==='district'&&z0===-319;
      const w=14+seed%9+tier*4,d=riverfront?10+seed%3:13+(seed*3)%7+tier*3;
      const span=alongZ?d:w,gap=4+(seed%5)+(bay===3?7:0);
      if(bay){const shift=(priorWidth+span)/2+gap;if(alongZ)z-=shift;else x+=shift;}
      priorWidth=span;
      const offset=riverfront?seed%3-1:((seed*7)%9)-4;
      const h=[27,20,15,11,9,41][kind]+tier*(8+seed%6)+(seed%6)*2.8;
      lots.push({x:x+(alongZ?offset:0),z:z+(alongZ?0:offset),w,d,h,y:-.5,
        rotation:0,kind,near:tier===0,seed,street:row,alongZ,
        frontage:riverfront?-306:(alongZ?x0:z0)+((row%2?-1:1)*(tier===2?28:23))});
    }
  });
  return lots;
}

function bounds(x,z,hw,hd,angle=0){
  const c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
  return {x,z,hw:c*hw+s*hd,hd:s*hw+c*hd};
}
function occupiedAreas(town,kit,roadMargin=1.6){
  const areas=[];
  for(const p of town.props){
    if(ROAD_TYPES.includes(p.type)){
      for(const r of roadRects(p))areas.push(bounds(r.cx,-r.cy,r.hx+roadMargin,r.hy+roadMargin,r.angle));
    }else if(p.type==='tree')areas.push(bounds(p.pose[0],-p.pose[1],4*p.scale,4*p.scale));
    else areas.push(bounds(p.pose[0],-p.pose[1],p.type==='warehouse'?12:10,9,p.pose[2]));
  }
  for(const station of town.stations||[]){
    const g=stationGeometry(station,town.rails,kit);
    if(g)for(const r of stationFootprint(g,station.side))areas.push(bounds(r.cx,-r.cy,r.hx,r.hy,r.angle));
  }
  return areas;
}
const expectedRails=new WeakMap();
function matchesRails(id,town,kit){
  if(!expectedRails.has(kit))expectedRails.set(kit,{large:largeTown(kit).rails,elevated:elevatedTown(kit).rails});
  const expected=expectedRails.get(kit)[id];
  return town.rails.length===expected.length&&expected.every((r,i)=>{
    const actual=town.rails[i];return actual.piece===r.piece&&r.pose.every((v,j)=>Math.abs(actual.pose[j]-v)<1e-5);
  });
}

export function localUrbanLots(town,kit,activeDistrict){
  const id=activeDistrict?'district':town.rails[0]?.piece==='ramp_up'?'elevated':'large';
  if(!activeDistrict&&!matchesRails(id,town,kit))return [];
  const occupied=occupiedAreas(town,kit);
  if(activeDistrict){
    // Preserve the station approach and both elevated views across the station square.
    occupied.push(bounds(247,60,53,74),bounds(185,-303,32,30));
  }
  const lots=[];
  for(const lot of candidates(id)){
    const footprint=bounds(lot.x,lot.z,lot.w/2+1.6,lot.d/2+1.6);
    if(occupied.some(r=>Math.abs(r.x-lot.x)<r.hw+footprint.hw&&Math.abs(r.z-lot.z)<r.hd+footprint.hd))continue;
    lots.push(lot);occupied.push(footprint);
  }
  return lots;
}

// Sidewalks occupy the gap from each doorway to its local street. Longer
// strips stop at the existing infrastructure; edited props always take priority.
export function localUrbanGround(town,kit,lots,district){
  if(!lots.length)return [];
  const blocked=occupiedAreas(town,kit,0);
  const route=makeRoute(town.rails,kit);
  for(const r of district?[route,parallelRoute(route)]:[route]){
    for(let s=0;s<r.length;s+=5){
      const [x,y]=sampleRoute(r,s);
      blocked.push(bounds(x,-y,6,6));
    }
  }
  if(district)blocked.push(bounds(101,-190,73,28),bounds(295,-90,74,28),bounds(185,-284,8,44),
    bounds(200,-365,1800,37),bounds(210,-20,130,14),bounds(210,5,122,5));
  const roads=town.props.filter(p=>ROAD_TYPES.includes(p.type)).flatMap(p=>roadRects(p).map(r=>bounds(r.cx,-r.cy,r.hx,r.hy,r.angle)));
  const ground=[],streets=new Map();
  function slab(x,z,w,d,tone){ground.push({x,z,w,d,tone});}
  function strip(alongZ,start,end,across,width,tone){
    const cuts=[];
    for(const r of blocked){
      const center=alongZ?r.z:r.x,half=alongZ?r.hd:r.hw;
      if(center+half<=start||center-half>=end)continue;
      if(Math.abs(across-(alongZ?r.x:r.z))<(alongZ?r.hw:r.hd)+width/2)
        cuts.push([center-half,center+half]);
    }
    cuts.sort((a,b)=>a[0]-b[0]);
    function emit(from,to){
      if(to-from<.05)return;
      const middle=(from+to)/2,span=to-from;
      slab(alongZ?across:middle,alongZ?middle:across,alongZ?width:span,alongZ?span:width,tone);
    }
    let from=start;
    for(const [a,b] of cuts){emit(from,Math.min(a,end));from=Math.max(from,b);}
    emit(from,end);
  }
  for(const l of lots){
    if(!streets.has(l.street))streets.set(l.street,[]);
    streets.get(l.street).push(l);
    slab(l.x,l.z,l.w+2,l.d+2,'paving');
    blocked.push(bounds(l.x,l.z,l.w/2+.2,l.d/2+.2));
  }
  for(const row of streets.values()){
    const {alongZ,frontage}=row[0],along=l=>alongZ?l.z:l.x,across=l=>alongZ?l.x:l.z;
    row.sort((a,b)=>along(a)-along(b));
    for(const [i,l] of row.entries()){
      const middle=along(l),half=(alongZ?l.d:l.w)/2+1,prev=row[i-1],next=row[i+1];
      const start=prev&&middle-along(prev)<44?(middle+along(prev))/2:middle-half;
      const end=next&&along(next)-middle<44?(middle+along(next))/2:middle+half;
      const side=Math.sign(across(l)-frontage);
      strip(alongZ,start,end,frontage,4.3,'street');
      strip(alongZ,start,end,frontage+side*3.1,1.9,'walk');
      const door=across(l)-side*((alongZ?l.w:l.d)/2+.3),walk=frontage+side*3;
      strip(!alongZ,Math.min(door,walk),Math.max(door,walk),middle,4.3,'walk');
    }
    // Join the nearest existing road edge along the street wherever reachable.
    for(const endLot of [row[0],row.at(-1)]){
      const dir=endLot===row[0]?-1:1;
      const end=along(endLot)+dir*((alongZ?endLot.d:endLot.w)/2+1);
      let distance=Infinity;
      for(const r of roads){
        if(Math.abs(frontage-(alongZ?r.x:r.z))>(alongZ?r.hw:r.hd))continue;
        const to=dir*((alongZ?r.z:r.x)-end)-(alongZ?r.hd:r.hw);
        if(to>=0&&to<distance)distance=to;
      }
      if(distance<50){
        const edge=end+dir*distance;
        strip(alongZ,Math.min(end,edge),Math.max(end,edge),frontage,4.3,'street');
      }
    }
  }
  return ground;
}

export function drawLocalUrbanGround(T,anchor,slabs){
  if(!slabs.length)return;
  const geometry=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
  const material=new T.MeshStandardMaterial({roughness:.96});
  const mesh=new T.InstancedMesh(geometry,material,slabs.length);
  const colors={paving:'#babbb2',walk:'#cfc9ba',street:'#828585'};
  const heights={paving:-.408,walk:-.402,street:-.416};
  const dummy=new T.Object3D(),color=new T.Color();
  for(const [index,p] of slabs.entries()){
    dummy.position.set(p.x,heights[p.tone],p.z);
    dummy.scale.set(p.w,1,p.d);dummy.updateMatrix();
    mesh.setMatrixAt(index,dummy.matrix);mesh.setColorAt(index,color.set(colors[p.tone]));
  }
  mesh.userData.ownedGeometry=true;mesh.userData.ownedMaterial=true;
  mesh.name='urban-local-streets';mesh.receiveShadow=true;mesh.computeBoundingSphere();
  anchor.add(mesh);
}
