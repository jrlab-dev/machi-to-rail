export function initialLoop(formation,carLength,stations){
  return {s:stations[0].s+(formation.count-1)*(carLength+.45)/2,dir:1,speed:0,playing:false,dwell:3,stationPhase:'dwell',station:0};
}
export function stepLoop(state,dt,limit,formation,carLength,stations,length){
  const wrap=d=>(d%length+length)%length;
  const next={...state},dir=state.dir;
  if(state.stationPhase==='dwell'){
    if(state.playing)next.dwell=Math.max(0,state.dwell-dt);
    if(next.dwell===0)next.stationPhase='running';
    return next;
  }
  const nextIndex=(state.station+dir+stations.length)%stations.length;
  const target=stations[nextIndex].s+dir*(formation.count-1)*(carLength+.45)/2;
  const gap=wrap((target-state.s)*dir);
  const speedGoal=state.playing?Math.min(limit,Math.sqrt(3.4*gap)):0;
  next.speed=Math.max(0,state.speed+Math.min(1.6*dt,Math.max(-2.4*dt,speedGoal-state.speed)));
  if(state.playing&&gap<=next.speed*dt+.025){
    return {...next,s:wrap(target),speed:0,dwell:5,station:nextIndex,stationPhase:'dwell'};
  }
  next.s=wrap(state.s+dir*next.speed*dt);
  return next;
}
