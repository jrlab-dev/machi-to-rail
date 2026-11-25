export const islandCarLength=15.3;
const west=-760,east=1360;
const straight=east-west,radius=245,arc=Math.PI*radius;
// World X points east. North is positive route Y and negative scene Z.
const south=x=>x-west,north=x=>straight+arc+east-x;
export const islandStations=[
  {name:'未来島ゲート',s:south(-85),accent:'#197f88'},
  {name:'スポーツパーク',s:south(540),accent:'#b25737'},
  {name:'未来島空港',s:south(1160),accent:'#41617e'},
  {name:'海風マリーナ',s:north(565),accent:'#326a99'},
  {name:'星の温室',s:north(35),accent:'#537f55'},
  {name:'風の発電所',s:north(-560),accent:'#626d9c'},
  {name:'岬の灯台',s:south(-550),accent:'#a54b4e'}
];
export const isIsland=town=>town?.island==='yume-v1';
export const islandTrackSpacing=5.2;
function loopRoute(r){
  const arc=Math.PI*r,length=2*(straight+arc);
  return {length,closed:true,parts:[],sample(distance){
    const d=((distance%length)+length)%length;
    if(d<straight)return [west+d,185-r,0,12,0];
    if(d<straight+arc){const a=(d-straight)/r;return [east+r*Math.sin(a),185-r*Math.cos(a),a,12,0];}
    if(d<2*straight+arc)return [east-(d-straight-arc),185+r,Math.PI,12,0];
    const a=Math.PI+(d-2*straight-arc)/r;
    return [west+r*Math.sin(a),185-r*Math.cos(a),a,12,0];
  }};
}
export const islandRoute=loopRoute(radius);
export const islandOuterRoute=loopRoute(radius+islandTrackSpacing);
export const islandOuterStations=islandStations.map(stop=>({...stop,
  s:stop.s+(stop.s>straight?Math.PI*islandTrackSpacing:0)
}));
export function initialIslandOuter(formation){
  return {s:islandOuterStations[0].s-(formation.count-1)*(islandCarLength+.45)/2,dir:-1,speed:0,playing:false,dwell:3,stationPhase:'dwell',station:0};
}
