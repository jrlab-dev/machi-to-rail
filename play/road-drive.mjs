// One route clock per manually driven vehicle. Unselected traffic keeps its own timetable.
export function createRoadDrive(){
 const cars=new Map();
 let driver=null;
 function release(){driver=null;}
 function start(id,time){
  if(!cars.has(id))cars.set(id,{time,rate:1,lane:0});
  driver={id,target:cars.get(id).rate,lane:cars.get(id).lane};
 }
 function tick(dt,advance){
  for(const [id,car] of cars){
   const active=driver?.id===id;
   const target=active?driver.target:1;
   car.rate+=Math.sign(target-car.rate)*Math.min(Math.abs(target-car.rate),dt*(target<car.rate?1.6:.7));
   car.time=advance(car.time,dt*car.rate);
   const lane=active?driver.lane:0;
   car.lane+=Math.sign(lane-car.lane)*Math.min(Math.abs(lane-car.lane),dt*.9*car.rate);
  }
 }
 function frame(base,sample){
  return base.map(f=>{
   const car=cars.get(f.id);
   if(!car)return f;
   const pose=sample(car.time).find(row=>row.id===f.id);
   if(!pose)return f;
   const shift=p=>[p[0]+Math.sin(p[2])*car.lane,p[1]-Math.cos(p[2])*car.lane,...p.slice(2)];
   return {...pose,body:shift(pose.body),trailer:shift(pose.trailer)};
  });
 }
 return {start,release,tick,frame,reset(){cars.clear();release();},get driver(){return driver;},
  pedal(amount){if(driver)driver.target=Math.max(0,Math.min(2,driver.target+amount));},
  steer(amount){if(driver)driver.lane=Math.max(-.75,Math.min(.75,driver.lane+amount));}};
}
