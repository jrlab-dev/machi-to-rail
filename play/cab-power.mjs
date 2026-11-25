// Speeds are in metres per second. Route signals and station braking apply separately.
export const fullPowerLimit=cruiseLimit=>cruiseLimit*1.2;
export const tractionAcceleration=(fullPower,intercityMaglev)=>fullPower&&intercityMaglev?3.2:2;

export function leverTarget(speed,notch,limit,dt,acceleration){
  if(notch===null)return limit;
  const rate=notch===4?acceleration:notch>0?notch*.48:notch<0?notch*.8:-.035;
  return Math.min(limit,Math.max(0,speed+rate*dt));
}
