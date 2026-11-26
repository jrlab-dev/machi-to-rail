// Scene coordinates of the landmarks beside the seven monorail stations.
const landmarks=[
 {id:'gate',label:'未来島ゲートの港',x:-85,z:60,subject:[-122,20,22]},
 {id:'stadium',label:'スポーツパークの競技場',x:540,z:60,subject:[537,3,17]},
 {id:'airport',label:'空港のターミナルと旅客機',x:1160,z:60,subject:[1142,8,-15]},
 {id:'marina',label:'海風マリーナの桟橋',x:565,z:-430,subject:[558,4,-504]},
 {id:'garden',label:'星の温室のガラスドーム',x:35,z:-430,subject:[35,14,-470]},
 {id:'wind',label:'海辺の風車',x:-560,z:-430,subject:[-558,30,-503]},
 {id:'light',label:'みさきの灯台',x:-550,z:60,subject:[-590,23,12]}
];

export function islandTourShot(v,aspect){
 const lead=v.cars[0].body,tail=v.cars.at(-1).body;
 const x=(lead[0]+tail[0])/2,z=-(lead[1]+tail[1])/2;
 const portrait=aspect<1;
 const shot=(id,label,mode,position,target,fov)=>({id:'island-'+id,label,mode,pose:position?{position,target,fov}:null});
 const place=landmarks.find(p=>Math.abs(p.x-x)<100&&Math.abs(p.z-z)<12);
 if(place){
  const [sx,sy,sz]=place.subject,wide=place.id==='airport'||place.id==='marina';
  // Look from above the outer platform so the roof cannot cover the island behind it.
  if(place.id==='stadium'){
   // Across the running track, with the grandstand below and the train beyond it.
   return shot(place.id,place.label,'station',[x+33,29,portrait?-52:-33],
    [x*.57+sx*.43,9,37],portrait?63:53);
  }
  if(place.id==='marina'){
   // Look over the yacht masts towards the station from the end of the pontoons.
   return shot(place.id,place.label,'station',[x-36,23,portrait?-589:-574],
    [x*.72+sx*.28,8,-475],portrait?55:46);
  }
  if(place.id==='light'){
   return shot(place.id,place.label,'station',[x+46,22,z+(portrait?82:58)],
    [x*.52+sx*.48,19,32],portrait?58:49);
  }
  const distance=(wide?90:66)*(portrait?1.28:1);
  const position=[x+36,wide?61:48,z+distance];
  const target=[x*.58+sx*.42,8+sy*.33,z*.56+sz*.44];
  return shot(place.id,place.label,'station',position,target,portrait?58:49);
 }
 if(z>40&&((x>212&&x<444)||(x> -454&&x< -279))){
  const cable=x>0;
  return shot(cable?'cable':'truss',cable?'斜張橋を渡る':'赤いトラス橋を渡る','trackside',
   [x+37,cable?29:21,z-(portrait?74:54)],[x,cable?19:14,z],portrait?59:49);
 }
 if(x>1360||x< -760){
  const east=x>0,depth=portrait?58:40;
  if(z< -265)return shot(east?'east-cab':'west-cab','海上カーブの運転席','front');
  if(east&&z> -70){
   return shot('runway','空港島の滑走路','trackside',[x+62,44,z+40],
    [x*.65+1415*.35,10,z*.65-125*.35],portrait?57:49);
  }
  const dx=Math.cos(lead[2]),dz=-Math.sin(lead[2]);
  return shot(east?'east-curve':'west-curve',east?'空港沖のカーブ':'岬を回るモノレール','follow',
   [x-dx*29+(east?depth:-depth),34,z-dz*29+14],[x+dx*8,13,z+dz*8],portrait?61:52);
 }
 if(z>40&&x>931&&x<1064){
  return shot('apron','駐機場の旅客機','trackside',[x+17,32,z+28],[1070,5,2],portrait?55:46);
 }
 if(z< -400&&x>840&&x<1190){
  // From offshore the opposite coast is visible behind the passing train.
  return shot('north-channel','海峡越しの空港島','trackside',[x+28,26,z-(portrait?81:58)],
   [x-8,12,z+10],portrait?60:49);
 }
 return shot('cab','海上を走る運転席','front');
}
