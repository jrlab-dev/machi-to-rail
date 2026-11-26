// Tokyo's two underground halls share island platforms between the main and inner tracks.
import {tokyoPose,tokyoStations,tokyoTrackSpacing} from './tokyo-route.mjs?v=rail-90';

const halls=tokyoStations.filter(station=>station.underground).map(station=>{
 const [x,y,yaw]=tokyoPose(station.s);
 return {name:station.name,x,y,midY:y+Math.cos(yaw)*tokyoTrackSpacing/2};
});
export function tokyoTourShot(v){
 const [x,y,yaw,h]=v.body,c=Math.cos(yaw),s=Math.sin(yaw);
 const hall=h<1&&halls.find(hall=>Math.abs(x-hall.x)<113&&Math.abs(y-hall.y)<15);
 if(hall){
  const side=Math.sign(hall.midY-y),forward=8;
  return {id:'tokyo-platform-'+hall.name,mode:'station',label:hall.name+'のホーム',pose:{
   position:[x+c*forward,2.83,-y-side*4.4-s*forward],
   target:[x+c*1.2,2.35,-y-s*1.2],fov:64
  }};
 }
 // Stay inside the loading gauge on the approach to either tunnel portal.
 if(h<16)return {id:'tokyo-tunnel',mode:'front',label:'トンネルを進む'};
 if(Math.abs(x)<150&&Math.abs(y)<18)return {id:'tokyo-marunouchi',mode:'station',label:'東京駅・丸の内駅舎'};
 // The glass hall is on the south side of both running lines.
 if(x>505&&x<700&&Math.abs(y)<18)return {id:'tokyo-glass-hall',label:'車窓からガラスのホール',mode:c>0?'right':'left'};
 return {id:'tokyo-viaduct',mode:'front-exterior',label:'高架を走る列車'};
}
