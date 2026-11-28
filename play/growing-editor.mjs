import {landAt,landCells,expandLand,LAND_CELL_SIZE as cell} from './growing-land.mjs?v=rail-94';
import {growingStarter,growingStamp,checkGrowingPlacement} from './growing-plans.mjs?v=rail-97';
import {sampleItem} from './core.mjs?v=rail-97';
import {stationGeometry,stationFootprint} from './free-station.mjs?v=rail-97';
export {checkGrowingPlacement};
const names={shop:'商店街',residential:'住宅街',office:'駅前ビル街',starter:'最初の路線'};
const types={shop:[16,5,14],apartment:[16,19,14],hotel:[16,24,14],office:[16,19,14],warehouse:[20,8,16],tree:[5,8,5],road:[20,.25,8]};
const at=id=>document.getElementById(id);
function mapTracks(town,kit,interval){
  const lines=[];
  for(const it of town.rails)for(const r of kit.pieces[it.piece].routes){
    const count=Math.max(1,Math.ceil(r.length/interval));
    lines.push(Array.from({length:count+1},(_,i)=>sampleItem(it,r,i/count)));
  }
  return lines;
}
export function createGrowingEditor(T,kit,{current,position,move,clearTools,commit,say}){
  const ghost=new T.Group(),box=new T.BoxGeometry();
  const material=new T.MeshBasicMaterial({color:'#f8b95e',transparent:true,opacity:.74,depthTest:false,depthWrite:false});
  const lineMaterial=new T.MeshBasicMaterial({color:'#135a62',transparent:true,opacity:.90,depthTest:false,depthWrite:false});
  const pinMaterial=new T.MeshBasicMaterial({color:'#fff5de',depthTest:false,depthWrite:false});
  const pin=new T.CircleGeometry(12,24).rotateX(-Math.PI/2);
  const ring=new T.RingGeometry(7,12,24).rotateX(-Math.PI/2);
  const dialog=at('land-map');
  let pending=null,picked=null,mapOwner=null;
  function clear(){
    pending=null;at('land-preview').hidden=true;ghost.clear();
  }
  function sync(){
    const land=current().land;
    at('land-tools').hidden=!land;
    at('land-starter').disabled=!land||current().rails.length>0||!!current().stations?.length;
  }
  function drawBox(x,y,z,w,h,d,a=0,paint=material){
    const m=new T.Mesh(box,paint);m.position.set(x,y,z);m.scale.set(w,h,d);m.rotation.y=a;m.renderOrder=18;ghost.add(m);
  }
  function preview(){
    ghost.clear();if(!pending)return;
    const {kind,x,y,angle}=pending,town=current();
    pending.add=null;
    try{
      pending.add=kind==='starter'?growingStarter(town,kit):{props:growingStamp(town,kit,kind,x,y,angle)};
      const {rails=[],props=[],stations=[]}=pending.add;
      for(const line of mapTracks({rails},kit,16))for(let i=1;i<line.length;i++){
        const a=line[i-1],b=line[i];drawBox((a[0]+b[0])/2,((a[3]||0)+(b[3]||0))/2+.8,-(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1]),.9,8,Math.atan2(b[1]-a[1],b[0]-a[0]),lineMaterial);
      }
      for(const station of stations){
        const g=stationGeometry(station,rails,kit);if(!g)continue;
        const footprint=stationFootprint(g,station.side);
        for(const r of footprint)drawBox(r.cx,1.8,-r.cy,r.hx*2,3.6,r.hy*2,r.angle);
        const stop=footprint[0];
        for(const [shape,paint,order] of [[pin,pinMaterial,19],[ring,lineMaterial,20]]){
          const marker=new T.Mesh(shape,paint);marker.position.set(stop.cx,5,-stop.cy);marker.renderOrder=order;ghost.add(marker);
        }
      }
      for(const p of props){
        const [w,h,d]=types[p.type]||[18,.3,18];
        drawBox(p.pose[0],h*p.scale/2,-p.pose[1],w,h*p.scale,d,p.pose[2]);
      }
      at('land-plan-note').textContent=kind==='starter'?'丸い印が駅です。ふたつの駅を結ぶ線路を置きます。':names[kind]+'を置きたい場所を、上の景色でタップ。';
    }catch(e){
      drawBox(x,1,-y,12,1.2,12);
      at('land-plan-note').textContent=e.message+'　上の景色で場所をえらんでね。';
    }
    at('land-place').disabled=!pending.add;
    at('land-turn').hidden=kind==='starter';at('land-preview').hidden=false;
  }
  function begin(kind){
    clearTools();const [x,y]=position();
    pending={kind,x:Math.round(x/2)*2,y:Math.round(y/2)*2,angle:0};
    if(kind==='starter')move(0,0,innerWidth<650?1240:1020);
    preview();
  }
  at('land-starter').onclick=()=>begin('starter');
  for(const b of document.querySelectorAll('[data-land-stamp]'))b.onclick=()=>begin(b.dataset.landStamp);
  at('land-turn').onclick=()=>{if(pending){pending.angle=(pending.angle+Math.PI/2)%(2*Math.PI);preview();}};
  at('land-cancel').onclick=clear;
  at('land-place').onclick=()=>{
    if(!pending)return;
    preview();if(!pending.add)return;
    const add=pending.add,kind=pending.kind;clear();
    commit(t=>{for(const [key,rows] of Object.entries(add))t[key]=[...(t[key]||[]),...rows];},names[kind]+'を置きました。');
  };
  function tap(x,y){
    if(!pending)return false;
    if(pending.kind!=='starter'){pending.x=Math.round(x/2)*2;pending.y=Math.round(y/2)*2;preview();}
    return true;
  }
  function showMap(){
    clear();clearTools();const town=current(),land=town.land;
    if(!land)return;
    mapOwner=town;const grid=at('land-grid'),cells=landCells(land),owned=new Set(cells.map(c=>c.join(','))),available=new Map();
    const [x,y]=position(),here=[Math.floor(x/cell+.5),Math.floor(y/cell+.5)];
    for(const [i,j] of cells){
      available.set(i+','+j,[i,j]);
      if(cells.length<81)for(const [di,dj] of [[-1,0],[1,0],[0,-1],[0,1]])available.set((i+di)+','+(j+dj),[i+di,j+dj]);
    }
    const all=[...available.values()],minI=Math.min(...all.map(c=>c[0])),maxI=Math.max(...all.map(c=>c[0])),maxJ=Math.max(...all.map(c=>c[1]));
    const lines=mapTracks(town,kit,12);
    grid.replaceChildren();grid.style.gridTemplateColumns='repeat('+(maxI-minI+1)+',52px)';
    function select(i,j,b){
      picked=[i,j];for(const item of grid.children)item.setAttribute('aria-pressed',String(item===b));
      const own=owned.has(i+','+j);at('land-go').textContent=own?'ここへ移動':'この土地をひろげる';
      at('land-map-selection').textContent=(own?'持っている土地':'となりの土地')+'　東西 '+i+' ／ 南北 '+j+'　（'+cells.length+'区画）';
    }
    let first;
    for(const [i,j] of all){
      const own=owned.has(i+','+j),b=document.createElement('button'),c=document.createElement('canvas'),ctx=c.getContext('2d');
      b.type='button';b.dataset.cell=i+','+j;b.setAttribute('aria-label',(own?'土地':'ひろげる土地')+' '+i+' '+j);
      b.style.gridColumn=String(i-minI+1);b.style.gridRow=String(maxJ-j+1);c.width=c.height=104;b.append(c);
      for(let v=0;v<13;v++)for(let u=0;u<13;u++){
        const state=landAt(land,(i-.5+(u+.5)/13)*cell,(j+.5-(v+.5)/13)*cell);
        ctx.fillStyle=state.water?'#77b3c4':state.buildable?'#a8ba89':'#b9aa86';ctx.fillRect(u*8,v*8,8,8);
      }
      if(!own){ctx.fillStyle='#ffffff8a';ctx.fillRect(0,0,104,104);}
      const px=n=>104*(n/cell-i+.5),py=n=>104*(j+.5-n/cell);
      ctx.strokeStyle='#253e3c';ctx.lineWidth=2;ctx.beginPath();
      for(const line of lines){ctx.moveTo(px(line[0][0]),py(line[0][1]));for(const p of line.slice(1))ctx.lineTo(px(p[0]),py(p[1]));}ctx.stroke();
      for(const p of town.props){ctx.fillStyle=types[p.type]&&p.type!=='road'?'#907964':'#8e9387';ctx.fillRect(px(p.pose[0])-1.5,py(p.pose[1])-1.5,3,3);}
      if(!own){const s=document.createElement('span');s.textContent='＋';b.append(s);}
      if(i===here[0]&&j===here[1]){ctx.beginPath();ctx.arc(px(x),py(y),7,0,Math.PI*2);ctx.fillStyle='#aa4a2d';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='white';ctx.stroke();first=b;}
      b.onclick=()=>select(i,j,b);grid.append(b);
    }
    first??=grid.querySelector('[data-cell="0,0"]');first.click();dialog.showModal();first.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  at('land-map-open').onclick=showMap;
  at('land-map-close').onclick=()=>dialog.close();
  at('land-go').onclick=()=>{
    if(!picked||mapOwner!==current()){dialog.close();return;}
    const [i,j]=picked,land=current().land;
    try{
      if(!landCells(land).some(([a,b])=>a===i&&b===j)){
        const next=expandLand(land,i,j);commit(t=>{t.land=next;},'土地がひろがりました。');
      }
      move(i*cell,j*cell,250);dialog.close();
    }catch(e){say(e.message,true);}
  };
  return {root:ghost,sync,clear,tap,get active(){return !!pending;},leave(){clear();if(dialog.open)dialog.close();}};
}
