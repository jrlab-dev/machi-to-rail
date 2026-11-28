import {point,sampleItem,transform,ROAD_TYPES,propLimit} from './core.mjs?v=rail-94';
import {landAt} from './growing-land.mjs?v=rail-94';
import {rectsOverlap,roadRects,stationGeometry,stationFootprint} from './free-station.mjs?v=rail-94';

const outside='土地の 外だよ。地図で 土地を ふやしてね。';
const shore='水や 岸には おけないよ。川を わたる ところは 高架に しよう。';
const occupied='ここには 線路や 建物が あるよ。すこし はなして おいてね。';

function propRects(p){
  if(ROAD_TYPES.includes(p.type))return roadRects(p).map(r=>({...r,hy:r.hy+1.2}));
  // Buildings scale vertically in the editor. Include the pavement around the wall.
  const tree=p.type==='tree',warehouse=p.type==='warehouse';
  const hx=tree?4*p.scale:warehouse?11.5:9.5,hy=tree?4*p.scale:warehouse?9.5:8.5;
  return [{cx:p.pose[0],cy:p.pose[1],angle:p.pose[2],hx,hy}];
}

function groundPoint(land,x,y,bridge){
  const ground=landAt(land,x,y);
  if(!ground.owned)return outside;
  if(ground.buildable||bridge&&ground.height<=-.5)return null;
  return ground.height>-.5?'平らな ところを えらんでね。':shore;
}

function groundRect(land,r){
  const nx=Math.max(1,Math.ceil(r.hx*2/3)),ny=Math.max(1,Math.ceil(r.hy*2/3));
  const c=Math.cos(r.angle),s=Math.sin(r.angle);
  for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){
    const x=(2*i/nx-1)*r.hx,y=(2*j/ny-1)*r.hy;
    const error=groundPoint(land,r.cx+c*x-s*y,r.cy+s*x+c*y,false);
    if(error)return error;
  }
  return null;
}

function railSections(rail,kit,visit){
  for(const path of kit.pieces[rail.piece].routes){
    const count=Math.max(1,Math.ceil(path.length/3));
    let a=sampleItem(rail,path,0);
    for(let i=1;i<=count;i++){
      const b=sampleItem(rail,path,i/count),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
      const error=visit({cx:(b[0]+a[0])/2,cy:(b[1]+a[1])/2,hx:length/2,hy:2.5,angle:Math.atan2(dy,dx)},a,b);
      if(error)return error;
      a=b;
    }
  }
  return null;
}

export function checkGrowingPlacement(town,kit,{rails=[],props=[],stations=[]}={}){
  if(!town.land)return null;
  for(const rail of rails){
    const bridge=rail.piece.startsWith('viaduct_');
    const error=railSections(rail,kit,(section,a,b)=>{
      const sx=Math.sin(section.angle)*section.hy,sy=-Math.cos(section.angle)*section.hy;
      for(const p of [a,b])for(const side of [-1,0,1]){
        const msg=groundPoint(town.land,p[0]+sx*side,p[1]+sy*side,bridge);
        if(msg)return msg;
      }
    });
    if(error)return error;
  }
  for(const p of props)for(const r of propRects(p)){
    const error=groundRect(town.land,r);if(error)return error;
  }
  if(stations.length){
    const joined=new Map(town.rails.map(r=>[r.uid,r]));
    for(const r of rails)joined.set(r.uid,r);
    const all=[...joined.values()];
    for(const station of stations){
      const geometry=stationGeometry(station,all,kit);
      if(!geometry)return '駅の 線路を たしかめてね。';
      for(const r of stationFootprint(geometry)){
        const error=groundRect(town.land,r);if(error)return error;
      }
    }
  }
  return null;
}

function overlapsAny(a,rectangles){
  // Most terrain is empty. Reject distant candidates before the oriented test.
  return rectangles.some(b=>Math.abs(a.cx-b.cx)<=a.hx+a.hy+b.hx+b.hy&&
    Math.abs(a.cy-b.cy)<=a.hx+a.hy+b.hx+b.hy&&rectsOverlap(a,b));
}

export function growingStarter(town,kit){
  if(!town.land||town.rails.length||town.stations?.length)throw Error('線路が まだ ない 土地で はじめてね。');
  const river=town.land.kind==='river',rails=[];
  let pose=[river?-455:-240,0,0];
  const lay=(piece,n)=>{
    for(let i=0;i<n;i++){
      rails.push({uid:rails.length+1,piece,pose,branch:'B'});
      pose=transform(point(kit.pieces[piece].routes[0],1),pose);
    }
  };
  if(river){
    lay('straight_long',11);lay('ramp_up',1);lay('viaduct_straight',6);
    lay('ramp_down',1);lay('straight_long',5);
  }else lay('straight_long',24);
  const stations=[
    {id:'st-1',name:river?'かわにし':town.land.kind==='coast'?'しおかぜ':'わかば',rails:rails.slice(1,4).map(r=>r.uid),side:'left'},
    {id:'st-2',name:river?'かわひがし':town.land.kind==='coast'?'なぎさ':'ひだまり',rails:rails.slice(-4,-1).map(r=>r.uid),side:'right'}
  ];
  const error=checkGrowingPlacement(town,kit,{rails,stations});
  if(error)throw Error(error);
  const existing=town.props.flatMap(propRects);
  if(existing.length){
    for(const r of rails)if(railSections(r,kit,rect=>overlapsAny(rect,existing)))throw Error(occupied);
    for(const st of stations)if(stationFootprint(stationGeometry(st,rails,kit)).some(r=>overlapsAny(r,existing)))throw Error(occupied);
  }
  return {rails,stations};
}

const blocks={
  shop:[['shop',-22,16,1],['shop',0,17,.8],['shop',22,16,1.1],['tree',-18,-11,.8],['shop',7,-18,.9]],
  residential:[['apartment',-21,19,.8],['apartment',10,20,1.2],['tree',28,14,.8],['tree',-26,-12,.8],['apartment',0,-19,.7]],
  office:[['office',-20,19,1.65],['hotel',7,20,1.25],['tree',25,13,.8],['shop',-22,-18,1],['office',5,-20,1.5]]
};
export function growingStamp(town,kit,kind,x,y,angle=0){
  if(!town.land||!Object.hasOwn(blocks,kind)||![x,y,angle].every(Number.isFinite))throw Error('土地の 中を えらんでね。');
  const rows=[...[-20,0,20].map(dx=>['road',dx,0,1]),...blocks[kind]];
  if(town.props.length+rows.length>propLimit(town))throw Error('この土地に おける 数を こえるよ。');
  let uid=town.props.reduce((n,p)=>Math.max(n,p.uid),0);
  const props=rows.map(([type,dx,dy,scale])=>({uid:++uid,type,pose:transform([dx,dy,0],[x,y,angle]),scale,tint:'#ffffff'}));
  const error=checkGrowingPlacement(town,kit,{props});
  if(error)throw Error(error);
  const rects=props.flatMap(propRects);
  const existing=town.props.flatMap(propRects);
  for(const st of town.stations||[]){const g=stationGeometry(st,town.rails,kit);if(g)existing.push(...stationFootprint(g));}
  if(rects.some(r=>overlapsAny(r,existing)))throw Error(occupied);
  for(const rail of town.rails)if(railSections(rail,kit,r=>overlapsAny(r,rects)))throw Error(occupied);
  return props;
}
