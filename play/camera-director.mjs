const MIN_CUT=4;
const FRONT={id:'cruise',mode:'front',minimum:4,duration:Infinity};
export function cameraFollowDelta(dt,{blocked=false,replay=false,running=false,speed=0}={}){return !blocked&&(replay?running:running||Math.abs(speed)>.01)?Math.max(0,dt):0;}
export function createDirector(){return{shotId:'off',mode:null,reason:'off',held:0,time:null,lastEvaluation:-Infinity,identity:null,orientation:null,epoch:null,traversalId:0,occupied:false,section:null,used:[],stable:0,candidate:null,side:0,pending:null,cut:0,history:[],rejected:[]};}
function select(state,candidate,reason,exception=false){
 if(state.shotId===candidate.id&&state.candidate===candidate)return state;
 const history=[...state.history,{shotId:candidate.id,reason,time:state.time,held:state.held,exception}].slice(-30);
 return{...state,shotId:candidate.id,mode:candidate.mode,reason,held:0,candidate,side:candidate.side||0,cut:state.cut+1,history,pending:null};
}
function front(state,reason,exception=false){if(state.mode==='front'&&state.shotId==='cruise')return{...state,reason};return select(state,FRONT,reason,exception);}
export function stepDirector(previous,input){
 let state={...previous},reset=false;
 const identity=[input.trainId,input.direction,input.routeId].join('/'),time=Number.isFinite(input.time)?input.time:0,dt=state.time==null?0:Math.max(0,time-state.time);
 if(!input.enabled)return{...createDirector(),time,reason:'off'};
 if(state.identity!==identity||state.epoch!==input.epoch){state={...createDirector(),traversalId:state.traversalId,cut:state.cut,history:state.history,identity,epoch:input.epoch};reset=true;}
 state.time=time;state.identity=identity;state.epoch=input.epoch;
 if(reset)state=front(state,'plan-reset',true);
 if(input.occupied&&!state.occupied){state.traversalId++;state.used=[];state.stable=0;state.section=input.section;}
 state.occupied=!!input.occupied;
 const moving=!!input.running&&Math.abs(input.speed||0)>.01&&!input.loading,elapsed=moving&&!reset?dt:0;
 state.held+=elapsed;state.stable=input.countrySafe?state.stable+elapsed:0;
 const orientationChanged=state.orientation!==null&&state.orientation!==input.orientation;
 state.orientation=input.orientation;
 if(input.invalid||!input.visualAvailable)return front(state,'missing-or-invalid-visual',true);
 if(input.activeUnsafe||(input.exterior&&!input.countrySafe))return front(state,'safety',true);
 if(orientationChanged){
  if(input.reframed){state.candidate=input.reframed;state.reason='orientation-reframe';state.cut++;}
  else if(state.mode!=='front')return front(state,'orientation-unavailable',true);
 }
 if(input.loading)return{...state,reason:'model-loading-hold'};
 // A closing door cannot be interrupted by an ordinary editorial cut.
 if(state.shotId==='station'&&input.doorClosing)return{...state,reason:'door-closing-hold'};
 if(input.stationVisible&&input.servicePhase==='dwell'){
  if(state.shotId!=='station')return select(state,{id:'station',mode:'station-doors',minimum:MIN_CUT,duration:Infinity},'station-service',true);
  return{...state,reason:input.doorClosing?'door-closing-hold':'station-service-hold'};
 }
 if(state.shotId==='station'&&input.servicePhase!=='dwell')return input.departure?select(state,input.departure,'doors-closed-departure',true):front(state,'departure-unavailable',true);
 if(state.shotId==='crossing'&&!input.crossingComplete)return{...state,reason:'last-car-crossing-hold'};
 if(state.shotId==='crossing'&&input.crossingComplete)return input.departure?select(state,input.departure,'last-car-clear',true):front(state,'departure-unavailable',true);
 if(input.crossingActive&&state.shotId!=='crossing'&&(state.held>=MIN_CUT||reset))return select(state,{id:'crossing',mode:'crossing-person',minimum:MIN_CUT,duration:Infinity},'crossing-approach');
 if(!moving)return{...state,reason:input.running?'stationary-hold':'paused-hold'};
 if(state.shotId==='pass'){
  if(input.passComplete){
   state.farewell=(state.farewell||0)+elapsed;
   if(state.farewell<.8||state.held<MIN_CUT)return{...state,reason:'pass-farewell-hold'};
  }else return{...state,farewell:0,reason:'last-car-pass-hold'};
 }
 // Safety is checked above every frame; candidate work is supplied at most 5 Hz.
 if(time-state.lastEvaluation<.2)return state;
 state.lastEvaluation=time;
 state.rejected=input.rejected||[];
 if(!input.countrySafe){
  if(state.shotId==='departure'&&state.held<5&&!input.locked)return state;
  if(input.intercity)return state.mode==='front'?{...state,reason:'tunnel-or-city-cruise'}:front(state,'exterior-boundary',true);
  if(state.shotId==='departure'&&state.held<5)return state;
  if(state.held<MIN_CUT)return state;
  return state.shotId==='cruise'&&state.mode==='front-exterior'?state:input.departure?select(state,{...input.departure,id:'cruise',minimum:input.reducedMotion?8:4,duration:Infinity},'district-cruise'):front(state,'district-exterior-unavailable');
 }
 if(state.stable<.5)return state.mode==='front'?{...state,reason:'exit-stability'}:front(state,'exit-reveal',true);
 if(state.pending){
  if(state.held<4)return{...state,reason:'direction-bridge-hold'};
  const next=(input.landscapes||[]).find(c=>c.id===state.pending.id);
  if(next&&input.remaining>=next.minimum+4){state.used=[...new Set([...state.used,'landscape'])];return select(state,next,'landscape-after-bridge');}
  return front({...state,pending:null},'landscape-expired');
 }
 const minimum=state.candidate?.minimum??MIN_CUT;
 if(state.held<minimum&&!reset)return state;
 if(!state.used.includes('hero')){
  if(input.hero&&input.remaining>=input.hero.minimum+4){state.used=[...state.used,'hero'];return select(state,input.hero,'country-hero');}
  state.used=[...state.used,'hero'];
 }
 if(state.shotId==='hero'&&state.held<(input.reducedMotion?8:5))return state;
 if(!state.used.includes('pass')){
  state.used=[...state.used,'pass'];
  const landscapeReserve=(input.landscapes||[]).length?6+(state.side!==input.landscapes[0].side?4:0):0;
  if(input.pass&&!input.reducedMotion&&input.remaining>=input.pass.duration+4+landscapeReserve)return{...select(state,input.pass,'country-pass'),farewell:0};
 }
 if(!state.used.includes('landscape')){
  const next=(input.landscapes||[]).find(c=>input.remaining>=c.minimum+4+(state.side&&state.side!==c.side?4:0));
  if(next){
   if(state.side&&state.side!==next.side){const bridge=select(state,{...FRONT,id:'bridge',duration:4},'direction-bridge');return{...bridge,pending:next};}
   state.used=[...state.used,'landscape'];return select(state,next,'country-landscape');
  }
  state.used=[...state.used,'landscape'];
 }
 if(state.shotId.startsWith('landscape')&&state.held<state.candidate.duration)return state;
 // A successful hero remains a calm fallback when there is no readable landscape.
 if(state.shotId==='hero'&&input.remaining>=4)return{...state,reason:'hero-no-landscape-hold'};
 return front(state,'sequence-complete');
}

export function createRecordRequest(){return{generation:0,cancelStart:false};}
export function invalidateRecordRequest(state,cancelStart=false){return{generation:state.generation+1,cancelStart:state.cancelStart||cancelStart};}
export function recordRequestResult(request,current){return{start:!current.cancelStart,auto:request.generation===current.generation&&!current.cancelStart};}
