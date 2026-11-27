// Layout coordinates are railway map coordinates. Only the returned lot uses world z.
import {buildingClearance,cityFootprint,overlaps} from './arrival-city-layout.mjs?v=rail-93';
import {departureFootprint} from './departure-city-layout.mjs?v=rail-93';
import {coastalLand} from './coast-data.mjs?v=rail-90';
import {northing,floorHeight} from './suspended-route.mjs?v=rail-90';

function rectangle(x,y,w,d){return {x,y,w,d};}
export function lotEnvelope(lot){
  // Reserve a margin for the ledge, entrance canopy and roof overhang.
  return rectangle(lot.x,-lot.z,lot.w+4,lot.d+4);
}
function townBlock(lots,occupied,x,y,w,d,h,kind,near,seed,base=0){
  const lot={x,z:-y,y:base,w,d,h,kind,near,seed};
  const footprint=lotEnvelope(lot);
  if(occupied.some(other=>overlaps(footprint,other,1.2)))return;
  lots.push(lot);
  occupied.push(footprint);
}
function variation(a,b){
  let n=Math.imul(a+307,73856093)^Math.imul(b+503,19349663);
  n=Math.imul(n^(n>>>16),2246822507);
  return (n^(n>>>13))>>>0;
}

export function tokyoLots(existing){
  const lots=[],occupied=existing.slice();
  occupied.push(
    rectangle(0,-76,470,185),    // Marunouchi facade and southern plaza edge
    rectangle(0,-236,360,320),   // central sightline from the station camera
    rectangle(0,56,480,220),     // every surface platform and its ends
    rectangle(605,-78,238,150),  // glass hall, entrance and neighbouring blocks
    rectangle(160,0,2500,58),    // elevated tracks, ramps and shopfronts
    rectangle(955,137,330,319),  // eastern curve and its cutting
    rectangle(-1235,140,350,320),
    rectangle(0,274,2570,30)     // return alignment and its inner track
  );
  for(const y of [-195,-312,210,315])occupied.push(rectangle(100,y,2050,14));
  for(let x=-850;x<=1070;x+=105)occupied.push(rectangle(x,0,10,980));
  const rows=[-419,-345,-257,-164,-97,-49,62,112,183,237,350,418,-286,142,458,-465];
  for(let block=0;block<17;block++){
    const west=-850+105*block;
    for(const [row,mid] of rows.entries()){
      const seed=variation(block,row),x=west+(row%3===0?39:row%3===1?72:54)+(seed%11)-5;
      const y=mid+(seed>>>8)%13-6,w=19+(seed>>>14)%19,d=15+(seed>>>21)%15;
      const near=Math.abs(y)<122,kind=(seed>>>7)%6;
      const typical=near?16:29;
      const h=typical+(kind===5?29:0)+(seed>>>9)%(near?29:54);
      townBlock(lots,occupied,x,y,w,d,h,kind,near,seed,10.97);
    }
  }
  return lots;
}

export function suspendedLots(groundHeight){
  const lots=[],occupied=[];
  // All lots lie on the first flat terrace. Houses start at x=252.
  // The existing tower row reaches 68 m, the cross street at 175 reaches 62 m.
  for(const side of [-1,1])for(let row=0;row<2;row++){
    for(let i=0;i<9;i++){
      const seed=variation(i+20*side,row),x=-98+i*38+(seed%9)+(row?11:0);
      const offset=(row?131:88)+(seed>>>7)%8;
      const w=15+(seed>>>12)%9,d=14+(seed>>>16)%9;
      const kind=(seed>>>5)%6,h=(row?25:15)+(kind===5?12:0)+(seed>>>10)%23;
      townBlock(lots,occupied,x,northing(x)+side*offset,w,d,h,kind,!row,seed,floorHeight(x)-9.1);
    }
  }
  if(groundHeight)for(const lot of lots){
    // The curved track sweeps the terrain strips sideways. Query the actual
    // terrain under the whole footprint, including edges, on this terrace.
    let lowest=groundHeight(lot.x,lot.z);
    for(const u of [-.5,0,.5])for(const v of [-.5,0,.5]){
      lowest=Math.min(lowest,groundHeight(lot.x+u*lot.w,lot.z+v*lot.d));
    }
    lot.y=lowest-.02;
  }
  return lots;
}

export function suspendedStreets(){
  // Map-space strips following the terrace and the junction at x=175. The
  // narrow approach doglegs behind the original row, then passes between lots.
  const strips=[];
  for(const side of [-1,1]){
    const strip=(x0,x1,v0,v1,kind)=>strips.push({x0,x1,v0:v0*side,v1:v1*side,kind});
    strip(-115,242,76,151,'paving');
    strip(-114,242,108.5,116.5,'walk');
    strip(-114,242,110,115,'street');
    for(const [x0,x1,v0,v1] of [[172.2,177.8,60.5,73],[152,178,70.2,75.8],[152,157.6,73,113]]){
      strip(x0-1,x1+1,v0-.75,v1+.75,'walk');
      strip(x0,x1,v0,v1,'street');
    }
  }
  return strips;
}

// Clip a display-only ground surface around retained models, including user roads.
function trimSurface(tile,blockers){
  let pieces=[tile];
  for(const f of blockers){
    const next=[];
    for(const p of pieces){
      if(!overlaps(p,f)){next.push(p);continue;}
      const l=p.x-p.w/2,r=p.x+p.w/2,b=p.y-p.d/2,t=p.y+p.d/2;
      const x0=Math.max(l,f.x-f.w/2),x1=Math.min(r,f.x+f.w/2);
      const y0=Math.max(b,f.y-f.d/2),y1=Math.min(t,f.y+f.d/2);
      for(const [a,c,u,v] of [[l,x0,b,t],[x1,r,b,t],[x0,x1,b,y0],[x0,x1,y1,t]]){
        if(c-a>.01&&v-u>.01)next.push(rectangle((a+c)/2,(u+v)/2,c-a,v-u));
      }
    }
    pieces=next;
  }
  return pieces;
}

export function departureStreets(plan){
  const roads=[];
  for(const y of [-272,-211,-151])roads.push(rectangle(338,y,676,9));
  for(const x of [50,191,332,473,614])roads.push(rectangle(x,-181,9,182));
  for(const y of [649,743])roads.push(rectangle(338,y,676,8));
  for(const x of [50,300,585])roads.push(rectangle(x,644,8,198));
  const protectedLots=[...plan.reserved,...plan.buildings.map(departureFootprint),...plan.trees];
  return roads.flatMap(r=>trimSurface(r,protectedLots));
}

export function departureGround(plan){
  const pieces=[];
  const level=(rects,height,color)=>{
    for(const r of rects)pieces.push({...r,height,color});
  };
  // Continuous paving replaces the field pattern under these two urban extensions.
  for(const r of [rectangle(338,-181,684,190),rectangle(338,651,684,199),rectangle(338,73,660,55)]){
    level(trimSurface(r,plan.reserved),-.135,'#b2b4a9');
  }
  // Lay the roadway inside a pair of equal-width pavement edges. Segments
  // crossing at junctions share the same asphalt height and colour.
  for(const r of departureStreets(plan)){
    const road={...r};
    if(r.w>r.d)road.d=Math.max(1,r.d-2.6);else road.w=Math.max(1,r.w-2.6);
    level([r],-.105,'#cfcebf');
    level([road],-.072,'#747d7e');
  }
  return pieces;
}

export function intercityLots(arrival,plan,trees=[]){
  const lots=[],sx=arrival?5700:300;
  const existing=plan.buildings.map(arrival?cityFootprint:departureFootprint);
  const occupied=[...existing,...plan.roads,...plan.reserved,...(plan.trees||[]),...trees];
  occupied.push(rectangle(sx,65,182,167));
  if(arrival){
    occupied.push(plan.park,rectangle(sx,80,170,280));
  }else{
    occupied.push(...departureStreets(plan));
    // From either aspect the station overview looks diagonally across this wedge.
    occupied.push(rectangle(460,-112,280,125),rectangle(602,-224,170,120));
  }
  const rows=arrival?[-352,-266,-165,-95,88,248,406,540,701,947,1109]:[-242,-180,-126,67,202,285,625,705];
  const origin=arrival?5246:28,columns=arrival?15:14,spacing=arrival?68:47;
  for(const [row,mid] of rows.entries())for(let col=0;col<columns;col++){
    const seed=variation(col+Number(arrival)*100,row),x=origin+spacing*col+seed%17-8;
    const y=mid+(seed>>>8)%15-7,w=(arrival?21:16)+(seed>>>13)%11,d=(arrival?19:14)+(seed>>>19)%10;
    const f=rectangle(x,y,w+4,d+4);
    if(buildingClearance(f)<34)continue;
    if(![-1,1].every(side=>coastalLand(x+side*f.w/2,-y+f.d/2)))continue;
    const near=buildingClearance(f)<112;
    const kind=(seed>>>6)%6,h=(arrival?27:16)+(kind===5?20:0)+(seed>>>10)%(arrival?56:37);
    townBlock(lots,occupied,x,y,w,d,h,kind,near,seed,.1);
  }
  for(const lot of lots)lot.plinth=true;
  return lots;
}
