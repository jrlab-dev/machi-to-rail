import {floorHeight,lane,northing,portal,railSample,rockCuts,suspendedStations} from './suspended-route.mjs?v=rail-90';

// Use the consist midpoint so reversing at a terminus keeps the platform shot continuous.
export function suspendedShot(v,aspect){
  const first=v.cars[0].body,last=v.cars.at(-1).body;
  const x=(first[0]+last[0])/2,z=-(first[1]+last[1])/2,h=(first[3]+last[3])/2;
  const dir=v.service?.dir||Math.sign(Math.cos(first[2]))||1;
  const station=suspendedStations.reduce((a,b)=>Math.abs(x-a.s)<Math.abs(x-b.s)?a:b);
  const progress=(x-station.s)*dir,portrait=aspect<1;
  const shot=(id,mode,position,target,fov)=>({id,mode,pose:position?{position,target,fov}:null});
  const atTunnel=x>=rockCuts[0][0]-8&&x<=rockCuts[1][1]+8;
  if(!atTunnel&&progress>=-95&&progress<=26){
    const side=-Math.sign(lane(station.s,dir)),platformZ=-northing(station.s)+side*8.6;
    // Track a door on the positive-x car through dwell, even when the lead changes ends.
    return shot('platform-'+station.s,'station',[station.s+17.6,floorHeight(station.s)+2.58,platformZ+side*.24],
      [x+12.1,h+2.12,z+side*1.35],portrait?68:48);
  }
  if(atTunnel)return shot(x<portal[0]||x>portal[1]?'cliff-cab':'tunnel-cab','front');
  if(progress>26&&progress<=91)return shot('departure','front-exterior');
  for(const anchor of [395,842]){
    if(Math.abs(x-anchor)<=55){
      const verge=Math.sign(lane(anchor,dir));
      return shot('street-'+anchor,'trackside',[anchor-2.5,floorHeight(anchor)-7.45,-northing(anchor)+verge*14],
        [x,h+1.75,z],portrait?73:56);
    }
  }
  if(x>=1818){
    if(x>=1900){
      const side=dir>0?'left':'right';
      // Stand by the end window nearest the coast on either service.
      const yaw=first[2],along=dir*6.9,out=-dir*1.28;
      return shot('coast-window',side,[first[0]+along*Math.cos(yaw)+out*Math.sin(yaw),first[3]+2.35,-first[1]-along*Math.sin(yaw)+out*Math.cos(yaw)],
        [2188,6,-116],portrait?54:36);
    }
    return shot('coast-wide','trackside',[x-38,h+14,z+42],[x+8,h+3,z-4],portrait?64:40);
  }
  // The footbridge at 1296 is below the suspended line on the stream side.
  // Hold a bank-side overview as both cars pass above the bridge.
  if(Math.abs(x-1296)<=57){
    const bank=railSample(1308,34),bridge=railSample(1296,16);
    const target=[x*.82+bridge[0]*.18,h-1.5,z*.82-bridge[1]*.18];
    return shot('stream-footbridge','trackside',[bank[0],bank[3]+10,-bank[1]-5],target,portrait?70:50);
  }
  if(x>=897&&x<1450)return shot('valley-wide','trackside',[x-18,h+14,z+28],[x+1,h+2,z],portrait?62:41);
  return shot('city-cab','front');
}
