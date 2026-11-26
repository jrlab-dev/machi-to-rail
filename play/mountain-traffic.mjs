import {MOUNTAIN_ROUTES,MOUNTAIN_MIDDLE,MOUNTAIN_MUSEUM_DISTANCE,initialMountainState,advanceMountain} from './mountain-data.mjs?v=rail-90';
export const MOUNTAIN_LOWER_GATE=MOUNTAIN_ROUTES[0].length-170;
export const MOUNTAIN_UPPER_GATE=MOUNTAIN_MIDDLE;
export function initialMountainOpponent(carLength=20.9){return {...initialMountainState(carLength),leg:3,s:MOUNTAIN_ROUTES[3].length-carLength-.225,trip:-1,dir:-1,facing:-1,label:'見晴らし'};}
const museum=MOUNTAIN_MUSEUM_DISTANCE;
const exited=(s,block)=>block===0?(s.trip>0&&(s.leg>2||(s.leg===2&&s.s>=museum)))||(s.leg===0&&s.trip<0&&s.s<=MOUNTAIN_LOWER_GATE-60):(s.trip<0&&(s.leg<2||(s.leg===2&&s.s<=museum)))||(s.leg===3&&s.trip>0&&s.s>=MOUNTAIN_UPPER_GATE+60);
const inside=(s,block)=>block===0?(s.leg===0&&s.s>MOUNTAIN_LOWER_GATE+(s.trip>0?.01:-60))||s.leg===1||(s.leg===2&&s.s<museum-(s.trip<0?.01:0)):(s.leg===2&&s.s>museum+(s.trip>0?.01:0))||(s.leg===3&&s.s<MOUNTAIN_UPPER_GATE+(s.trip<0?-.01:60));
const entry=(s,block)=>block===0?(s.leg===0&&s.trip>0?MOUNTAIN_LOWER_GATE:s.leg===2&&s.trip<0?museum:null):(s.leg===2&&s.trip>0?museum:s.leg===3&&s.trip<0?MOUNTAIN_UPPER_GATE:null);
export function advanceMountainPair(main,other,control={},dt,requested,lengths=[20.9,20.9],otherRequested=requested){
 let trains=[main,other].map(s=>({...s})),owners=[...(control.owners||[null,null])],turns=[...(control.turns||[1,1])];
 const result=()=>({main:trains[0],other:trains[1],control:{owners,turns,owner:owners[0],turn:turns[0]}});
 if(!main.playing){trains=trains.map((s,i)=>({...s,playing:i===0?s.playing:false,speed:0}));return result();}
 trains.forEach(s=>s.playing=true);
 for(let block=0;block<2;block++){
  if(owners[block]!==null&&exited(trains[owners[block]],block)){turns[block]=1-owners[block];owners[block]=null;}
  if(owners[block]===null){const occupied=trains.findIndex(s=>inside(s,block));if(occupied>=0)owners[block]=occupied;}
  if(owners[block]===null){const ready=[turns[block],1-turns[block]].filter(i=>{const s=trains[i],gate=entry(s,block);return gate!==null&&Math.abs(gate-s.s)<.2&&s.dwell<=0;});if(ready.length)owners[block]=ready[0];}
 }
 trains=trains.map((s,i)=>{
  let limit=null;
  for(let block=0;block<2;block++){const gate=entry(s,block);if(owners[block]!==i&&gate!==null&&(gate-s.s)*s.trip>=-.2)limit=gate;}
  const peer=trains[1-i];if(s.leg===0&&s.trip<0&&peer.leg===0&&peer.s<115&&s.s>135)limit=Math.max(limit??-Infinity,140);
  if(s.leg===3&&s.trip>0&&peer.leg===3&&peer.s>MOUNTAIN_ROUTES[3].length-115&&s.s<MOUNTAIN_ROUTES[3].length-135)limit=Math.min(limit??Infinity,MOUNTAIN_ROUTES[3].length-140);
  const remaining=limit===null?Infinity:Math.max(0,(limit-s.s)*s.trip);
  if(remaining<.02&&s.dwell<=0)return {...s,s:limit,speed:0,waiting:true,stationPhase:'wait',stopKind:'meet',label:s.leg===0?'第1折返し手前':s.leg===2?'森の美術館前':'山腹'};
  const clean=s.waiting?{...s,waiting:false,stationPhase:'run',stopKind:null}:s;
  let next=advanceMountain(clean,dt,Math.min(i===0?requested:otherRequested,Math.sqrt(2*1.2*remaining)),lengths[i]);
  if(limit!==null&&next.leg===s.leg&&(next.s-limit)*s.trip>0)next={...next,s:limit,speed:0};
  return next;
 });
 return result();
}
