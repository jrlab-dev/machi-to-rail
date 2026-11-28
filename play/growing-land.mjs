// Map coordinates use east x and north y in metres. Each cell is centred on a
// multiple of CELL_SIZE. The version fixes these equations for existing saves.
export const LAND_CELL_SIZE=320;
export const LAND_CELL_LIMIT=81;
const seeds={plain:1704,river:6194,coast:3251};
const initial=[];
for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)initial.push([i,j]);
const key=(i,j)=>i+','+j;
const cache=new WeakMap();
const neighbours=[[1,0],[-1,0],[0,1],[0,-1]];
const bad=()=>{throw Error('土地の保存データを読みこめません。元のファイルを確認してください。');};
function indexed(land){
  if(!cache.has(land))cache.set(land,new Set([...initial,...land.extra].map(([i,j])=>key(i,j))));
  return cache.get(land);
}
export function createLand(kind){
  if(typeof kind!=='string'||!Object.hasOwn(seeds,kind))bad();
  return {v:1,kind,seed:seeds[kind],extra:[]};
}
export function normalizeLand(raw){
  if(!raw||raw.v!==1||typeof raw.kind!=='string'||!Object.hasOwn(seeds,raw.kind)||!Number.isSafeInteger(raw.seed)||raw.seed<0||raw.seed>0xffffffff||
    !Array.isArray(raw.extra)||raw.extra.length>LAND_CELL_LIMIT-9)bad();
  const seen=new Set(initial.map(([i,j])=>key(i,j))),extra=[];
  for(const pair of raw.extra){
    if(!Array.isArray(pair)||pair.length!==2||!pair.every(v=>Number.isSafeInteger(v)&&Math.abs(v)<=LAND_CELL_LIMIT))bad();
    const [i,j]=pair,id=key(i,j);
    if(seen.has(id))bad();
    seen.add(id);extra.push([i,j]);
  }
  const connected=new Set(['0,0']),queue=[[0,0]];
  for(let k=0;k<queue.length;k++){
    const [i,j]=queue[k];
    for(const [di,dj] of neighbours){
      const a=i+di,b=j+dj,id=key(a,b);
      if(seen.has(id)&&!connected.has(id)){connected.add(id);queue.push([a,b]);}
    }
  }
  if(connected.size!==seen.size)bad();
  extra.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
  const land={v:1,kind:raw.kind,seed:raw.seed,extra};
  cache.set(land,seen);
  return land;
}
export function landCells(land){return [...initial,...land.extra].map(([i,j])=>[i,j]);}
export function expandLand(land,i,j){
  if(!Number.isInteger(i)||!Number.isInteger(j))bad();
  const cells=indexed(land);
  if(cells.has(key(i,j)))throw Error('ここは もう じぶんの土地です。');
  if(cells.size>=LAND_CELL_LIMIT)throw Error('土地は81くかくまでです。');
  if(!neighbours.some(([di,dj])=>cells.has(key(i+di,j+dj))))throw Error('いまの土地と となりあう場所を えらんでください。');
  return normalizeLand({...land,extra:[...land.extra,[i,j]]});
}

const smooth=x=>{const v=Math.min(1,Math.max(0,x));return v*v*(3-2*v);};
function phase(land){return (land.seed%1024)*.006;}
function fluvial(land,y){
  const p=phase(land);
  return 65+82*Math.sin(y/320)+26*(Math.sin(y/176+p)-Math.sin(p));
}
function riverHalfWidth(land,y){return 23+3.4*(Math.sin(y/270+phase(land))-Math.sin(phase(land)));}
function shoreline(land,x){return 225+56*Math.sin(x/380)+31*Math.sin(x/241+phase(land));}
export function landSection(land,longitudinal){
  if(land.kind==='river'){
    const x=fluvial(land,longitudinal),w=riverHalfWidth(land,longitudinal);
    return [x-w-11,x-w-5,x-w,x-w+3,x-w*.65,x,x+w*.65,x+w-3,x+w,x+w+5,x+w+11];
  }
  if(land.kind==='coast'){
    const y=shoreline(land,longitudinal);
    return [y-24,y-13,y-5,y,y+4,y+15,y+38,y+85];
  }
  return [];
}
function meadow(land,x,y){
  const p=phase(land);
  const contour=.49*Math.cos(x/137+p)+.35*Math.sin(y/99-x/270)+.16*Math.cos(x/54+y/81);
  const hill=18*smooth((Math.abs(y)-172)/117)*smooth((contour-.27)/.55);
  const tone=Math.sin(x/87+y/114+p)+.63*Math.cos(x/156-y/56);
  return {height:hill-.5,water:false,buildable:hill===0,color:hill>2?'#879967':tone>.7?'#b8c992':tone<-.8?'#a9c58a':'#b1c98e'};
}
export function landSurfaceAt(land,x,y){
  // Dry margin is measured horizontally from the waterline, in map metres.
  let margin=Infinity;
  const coast=land.kind==='coast';
  if(coast)margin=shoreline(land,x)-y;
  else if(land.kind==='river')margin=Math.abs(x-fluvial(land,y))-riverHalfWidth(land,y);
  const edge=coast?24:11;
  if(margin>=edge){
    const field=meadow(land,x,y);
    if(margin<edge+20){
      field.height=-.5+(field.height+.5)*smooth((margin-edge)/20);
      field.buildable=field.height===-.5;
    }
    return field;
  }
  const waterHeight=coast?-1.65:-2.1;
  if(margin<0){
    const depth=(coast?7:4)*smooth(-margin/(coast?49:15));
    return {buildable:false,water:true,waterHeight,height:waterHeight-depth,color:depth>2?'#478f99':'#82b6ac'};
  }
  const height=waterHeight+(-.5-waterHeight)*smooth(margin/edge);
  return {buildable:false,water:false,height,color:coast?'#dfcda2':margin<4?'#b8b69a':'#a8bb84'};
}

// A smooth analytic hillside starts rising between samples. The drawn surface
// interpolates its vertices: reserve its full supporting cell for the hillside.
// This bound covers both LODs and the moving cuts along the two banks.
function cosMaximum(a,b){
  return Math.ceil(a/(2*Math.PI))*2*Math.PI<=b?1:Math.max(Math.cos(a),Math.cos(b));
}
function levelFootprint(land,x,y){
  const coast=land.kind==='coast',plain=land.kind==='plain';
  const x0=coast?Math.floor(x/40)*40:plain?Math.floor(x/80)*80:x-55;
  const x1=x0+(coast?40:plain?80:110);
  const y0=coast?y-55:Math.floor(y/40)*40,y1=y0+(coast?110:40);
  if(Math.max(Math.abs(y0),Math.abs(y1))<=172)return true;
  const p=phase(land);
  const max=.49*cosMaximum(x0/137+p,x1/137+p)
    +.35*cosMaximum(y0/99-x1/270-Math.PI/2,y1/99-x0/270-Math.PI/2)
    +.16*cosMaximum(x0/54+y0/81,x1/54+y1/81);
  return max<=.27;
}
export function landAt(land,x,y){
  const value=landSurfaceAt(land,x,y);
  const owned=indexed(land).has(key(Math.floor(x/LAND_CELL_SIZE+.5),Math.floor(y/LAND_CELL_SIZE+.5)));
  const shoreClear=land.kind==='river'?Math.abs(x-fluvial(land,y))-riverHalfWidth(land,y)>=15:
    land.kind==='coast'?shoreline(land,x)-y>=28:true;
  return {...value,owned,buildable:owned&&value.buildable&&shoreClear&&levelFootprint(land,x,y)};
}
