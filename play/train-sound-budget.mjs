// One melodic budget per audio clock, shared by the editor and all formations.
export const NOTE_LEVEL=.32,MELODIC_CEILING=.65;
const budgets=new WeakMap();
export function soundBudget(context){
 if(budgets.has(context))return budgets.get(context);
 const reservations=new Set(),buses=new Set();
 const countAt=time=>[...reservations].filter(row=>row.start<=time&&row.end>time).length;
 const target=count=>count?Math.min(1,MELODIC_CEILING/(NOTE_LEVEL*count)):1;
 function refresh(){
  const now=context.currentTime;for(const row of reservations)if(row.end<=now)reservations.delete(row);
  const events=new Map();for(const row of reservations){if(row.start>now)events.set(row.start,(events.get(row.start)||0)+1);if(row.end>now)events.set(row.end,(events.get(row.end)||0)-1);}
  let count=countAt(now),level=target(count),lastTime=now;const plan=[[now,level,.002]];
  for(const [at,delta]of [...events].sort((a,b)=>a[0]-b[0])){count+=delta;const next=target(count);if(next===level)continue;const start=Math.max(now,lastTime,next<level?at-.008:at);plan.push([start,next,next<level?.002:.01]);lastTime=start;level=next;}
  for(const gain of buses){const param=gain.gain;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{param.cancelScheduledValues(now);param.setValueAtTime(target(countAt(now)),now);}for(const [at,value,constant]of plan)param.setTargetAtTime(value,at,constant);}
 }
 const budget={attach(output){const gain=context.createGain();gain.gain.value=1;gain.connect(output);buses.add(gain);refresh();return gain;},reserve(start,end){const row={start,end};reservations.add(row);refresh();let released=false;return()=>{if(released)return;released=true;reservations.delete(row);refresh();};},activeAt:countAt,targetAt:time=>target(countAt(time))};
 budgets.set(context,budget);return budget;
}
