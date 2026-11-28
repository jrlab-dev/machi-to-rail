import {createSoundPlayer} from './train-sound-player.mjs?v=rail-90';
import {createSoundEvents} from './train-sound-events.mjs?v=rail-90';
import {hasWorkshopSound} from './train-sound-recipe.mjs?v=rail-90';
import {brakeLoop,runningLoop} from './train-samples.mjs?v=rail-90';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function trainSoundGain(distance,inside=false){
  if(inside)return .95;
  if(!Number.isFinite(distance)||distance>=250)return 0;
  const d=Math.max(0,distance),t=clamp((d-120)/130,0,1),fade=1-t*t*(3-2*t);
  return fade/(1+Math.pow(d/65,1.3));
}

export function soundParameters(speed,acceleration=0,kind='electric',sampledExpress=false,quietCabin=false){
  const actual=clamp(Number.isFinite(speed)?speed:0,0,100),v=Math.min(actual,20),moving=clamp(v/.7,0,1),braking=acceleration<-.15;
  const p={kind,speed:actual,motorHz:52+v*24+(actual-v)*3,carrierHz:260+v*27,
    motor:moving*(acceleration>.12?.082:braking?.060:.023),
    roll:moving*(.07+v*.010),rumble:moving*(.12+v*.010),body:moving*(.06+v*.008),wind:moving*actual*.0018,
    brake:braking?moving*clamp((11-v)/9,0,1)*.045:0,
    squealHz:1550+v*54,rollHz:450+v*35,jointGain:1,chuff:false,expressGain:0};
  if(kind==='monorail'||kind==='suspended-monorail'){
    const suspended=kind==='suspended-monorail';
    p.jointGain=0;p.brake=0;
    p.motorHz=(suspended?61:48)+v*(suspended?10:8);
    p.carrierHz=3.1*p.motorHz;
    p.rollHz=(suspended?410:330)+v*19;
    p.roll=moving*(.13+v*.009);
    p.rumble*=suspended?.44:.60;
    p.body*=.32;
  }
  if(quietCabin&&kind==='electric'){
    const cruise=clamp((actual-10)/20,0,1);
    p.jointGain=.65-.40*cruise;
  }
  if(kind==='tram'){p.motorHz=95+v*30;p.carrierHz=380+v*32;p.motor*=.8;p.roll*=.6;p.rumble*=.35;p.body*=.5;p.wind*=.45;p.brake*=.65;p.jointGain=.45;}
  if(kind==='freight'){p.motorHz=34+v*13;p.carrierHz=150+v*17;p.motor*=1.35;p.roll*=1.1;p.rumble*=1.3;p.body*=1.15;p.wind*=.7;p.jointGain=1.05;}
  if(kind==='steam'){p.motor=0;p.roll*=.5;p.body*=.5;p.chuff=true;}
  if(kind==='express'||kind==='maglev'){
    p.roll=p.rumble=p.body=p.brake=p.jointGain=0;
    p.motor*=kind==='maglev'?.25:.55;
    p.wind*=kind==='maglev'?1.2:sampledExpress?.25:.8;
    if(kind==='maglev'){p.motorHz=85+actual*6;p.carrierHz=320+actual*9;}
    else if(sampledExpress)p.expressGain=Math.min(1,actual/5)*(.12+Math.min(actual,56)/56*.32);
  }
  return p;
}

// Procedural rolling sound with locally bundled licensed event samples.
export function createTrainAudio(context,output,{seed=817,voices=2,samples={}}={}){
  const noise=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=noise.getChannelData(0);
  let random=seed,low=0;
  for(let i=0;i<data.length;i++){random=(Math.imul(random,1664525)+1013904223)>>>0;const white=random/2147483648-1;low=.985*low+.015*white;data[i]=white*.48+low*2.8;}
  const stats={departure:0,air:0,door:0,joints:0,chuffs:0,updates:0,workshop:[]},shots=new Set(),sourceEnds=new WeakMap();
  const smooth=(param,value,t,lag=.065)=>{param.cancelScheduledValues(t);param.setTargetAtTime(value,t,lag);};
  const brakeBuffer=samples.brake?brakeLoop(context,samples.brake):null;
  const expressBuffer=samples.express?runningLoop(context,samples.express):null;
  function voice(index){
    const gain=context.createGain(),pan=context.createStereoPanner();gain.gain.value=0;gain.connect(pan);pan.connect(output);
    const nodes=[gain,pan],sources=[];
    function oscillator(type,f){const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.value=f;g.gain.value=0;o.connect(g);g.connect(gain);o.start();sources.push(o);nodes.push(o,g);return{o,g};}
    function hiss(type,frequency,q){const source=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain();source.buffer=noise;source.loop=true;filter.type=type;filter.frequency.value=frequency;filter.Q.value=q;g.gain.value=0;source.connect(filter);filter.connect(g);g.connect(gain);source.start(0,index*.43);sources.push(source);nodes.push(source,filter,g);return{filter,g};}
    let brakeSample=null;
    let expressSample=null;
    if(expressBuffer){const source=context.createBufferSource(),g=context.createGain();source.buffer=expressBuffer;source.loop=true;g.gain.value=0;source.connect(g);g.connect(gain);source.start();sources.push(source);nodes.push(source,g);expressSample={source,g};}
    if(brakeBuffer){const source=context.createBufferSource(),g=context.createGain();source.buffer=brakeBuffer;source.loop=true;g.gain.value=0;source.connect(g);g.connect(gain);source.start();sources.push(source);nodes.push(source,g);brakeSample={g};}
    return{gain,pan,nodes,sources,brakeSample,expressSample,motor:oscillator('sine',52),harmonic:oscillator('sine',90),carrier:oscillator('sine',260),squeal:oscillator('sine',1800),roll:hiss('lowpass',800,.5),rumble:hiss('bandpass',85,.7),body:hiss('bandpass',400,.85),wind:hiss('bandpass',1200,.4),brake:hiss('bandpass',2700,.7),previous:null,acceleration:0,travel:0,nextJoint:1+index*6.25,index};
  }
  const rows=Array.from({length:voices},(_,i)=>{const row=voice(i);row.soundPlayer=createSoundPlayer(context,row.gain);row.soundEvents=createSoundEvents();return row;});
  function shot(row,kind,t,jointStep=0,level=1){
    const nodes=[],sources=[];
    function tone(f,offset,duration,volume){volume*=level;const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+offset);g.gain.linearRampToValueAtTime(volume,t+offset+.012);g.gain.exponentialRampToValueAtTime(.00001,t+offset+duration);o.connect(g);g.connect(row.gain);o.start(t+offset);o.stop(t+offset+duration+.02);sourceEnds.set(o,t+offset+duration+.02);nodes.push(o,g);sources.push(o);}
    function noiseHit(f,offset,duration,volume,rate=1){volume*=level;const o=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain();o.buffer=noise;o.playbackRate.value=rate;filter.type='bandpass';filter.frequency.value=f;filter.Q.value=.65;g.gain.setValueAtTime(0,t+offset);g.gain.linearRampToValueAtTime(volume,t+offset+.008);g.gain.exponentialRampToValueAtTime(.00001,t+offset+duration);o.connect(filter);filter.connect(g);g.connect(row.gain);o.start(t+offset);o.stop(t+offset+duration+.02);sourceEnds.set(o,t+offset+duration+.02);nodes.push(o,filter,g);sources.push(o);}
    const buffer=samples[kind];
    if(buffer){
      const source=context.createBufferSource(),g=context.createGain(),volume={departure:1.7,air:1.35,door:1.9}[kind]??1;
      source.buffer=buffer;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume*level,t+.012);g.gain.setValueAtTime(volume*level,t+Math.max(.013,buffer.duration-.07));g.gain.linearRampToValueAtTime(0,t+buffer.duration);
      source.connect(g);g.connect(row.gain);source.start(t);nodes.push(source,g);sources.push(source);stats[kind]++;
    }else if(kind==='departure'){[[659,0],[784,.23],[988,.46],[784,.76]].forEach(([f,o])=>{tone(f,o,.55,.21);tone(f*2,o,.3,.04);});stats.departure++;}
    else if(kind==='air'){noiseHit(1800,0,.6,.7);noiseHit(650,.08,.75,.32);stats.air++;}
    else if(kind==='door'){noiseHit(950,0,.65,.35);stats.door++;}
    else if(kind==='chuff'){noiseHit(550,0,.20,.42);noiseHit(1700,.014,.11,.18);stats.chuffs++;}
    else if(kind==='joint'){
      const speed=row.previous?.speed||1,strength=clamp(.60+speed*.04,.62,1.15)*(row.jointGain??1),lowPair=jointStep>=2,accent=jointStep%2?.88:1;
      // A bright two-hit pair followed by a deeper two-hit pair, both doubled a semitone apart.
      for(const pitch of[1,2**(1/12)]){
        noiseHit((lowPair?500:850)*pitch,0,lowPair?.15:.115,(lowPair?1.75:1.65)*strength*accent,pitch);
        noiseHit((lowPair?1450:2300)*pitch,0,.035,(lowPair?.40:.48)*strength*accent,pitch);
        tone((lowPair?88:118)*pitch,0,lowPair?.23:.19,(lowPair?.48:.42)*strength*accent);
        tone((lowPair?220:310)*pitch,0,lowPair?.15:.11,(lowPair?.21:.18)*strength*accent);
      }
      if(jointStep===0)stats.joints++;
    }
    const entry={nodes,sources,kind,row};shots.add(entry);let remaining=sources.length;
    for(const source of sources)source.onended=()=>{if(--remaining===0){nodes.forEach(n=>n.disconnect());shots.delete(entry);}};
  }
  function clearShots(row=null,atTime=null,allKinds=false){for(const entry of shots){if(row&&(entry.row!==row||(!allKinds&&entry.kind!=='joint')))continue;if(atTime!==null){for(const s of entry.sources)if((sourceEnds.get(s)??Infinity)>atTime)try{s.stop(atTime);sourceEnds.set(s,atTime);}catch{}continue;}for(const s of entry.sources){s.onended=null;try{s.stop();}catch{}}entry.nodes.forEach(n=>n.disconnect());shots.delete(entry);}}
  function reset(t=context.currentTime){
    clearShots();for(const r of rows){r.soundPlayer.stop();r.soundEvents.reset();r.previous=null;r.acceleration=0;r.chuffTravel=0;r.travel=0;r.jointStep=0;r.nextJoint=1+r.index*6.25;smooth(r.gain.gain,0,t,.015);for(const key of['motor','harmonic','carrier','squeal','roll','rumble','body','wind','brake','brakeSample','expressSample'])if(r[key])smooth(r[key].g.gain,0,t,.015);}
  }
  function update(trains,{time=context.currentTime,dt=.05,audible=true,events=true}={}){
    stats.updates++;
    for(let i=0;i<rows.length;i++){
      const r=rows[i],state=trains[i];
      if(!audible||!state){r.soundPlayer.stop();r.soundEvents.update(state,{enabled:false});clearShots(r,time,true);smooth(r.gain.gain,0,time,.02);r.previous=null;r.acceleration=0;continue;}
      const speed=clamp(state.speed||0,0,100),kind=state.kind||'electric';
      let previous=r.previous;
      if(previous&&previous.kind!==kind){clearShots(r,time,true);previous=null;r.acceleration=0;r.travel=0;r.nextJoint=1+r.index*6.25;r.jointStep=0;r.chuffTravel=0;}
      const steam=kind==='steam',freight=kind==='freight',workshop=hasWorkshopSound(state.soundProfile);
      const stationEvents=r.soundEvents.update(state,{enabled:audible,events});
      if(!state.playing)r.soundPlayer.stop();
      if(workshop)for(const slot of stationEvents){const setting=state.soundProfile[slot];if(setting.mode==='off'||setting.mode==='legacy'&&slot!=='departure')continue;stats.workshop.push({row:i,slot,time,dwell:state.dwell});if(stats.workshop.length>64)stats.workshop.shift();if(slot==='departure'&&(setting.mode==='legacy'||setting.id==='usual'))shot(r,'departure',time,0,.85/1.7);else if(setting.mode!=='legacy')r.soundPlayer.play(setting,slot,time);}
      if((state.gain??1)<=0){
        r.soundPlayer.stop();clearShots(r,time,true);r.gain.gain.cancelScheduledValues(time);r.gain.gain.setValueAtTime(0,time);
        for(const key of['motor','harmonic','carrier','squeal','roll','rumble','body','wind','brake','brakeSample','expressSample'])if(r[key]){const param=r[key].g.gain;param.cancelScheduledValues(time);param.setValueAtTime(0,time);}
        r.previous={speed,phase:state.phase,dwell:state.dwell,kind};r.acceleration=0;r.travel=0;r.nextJoint=1+r.index*6.25;r.jointStep=0;r.chuffTravel=0;continue;
      }
      const a=previous&&dt>0?(speed-previous.speed)/dt:0;
      r.acceleration+=(clamp(a,-3,2)-r.acceleration)*Math.min(1,dt*5);
      const p=soundParameters(speed,r.acceleration,kind,!!expressBuffer,state.quietCabin),ripple=1+.035*Math.sin(time*2.7+r.index*2.1)+.022*Math.sin(time*7.3);
      r.jointGain=p.jointGain;
      if(r.expressSample){smooth(r.expressSample.g.gain,p.expressGain,time,.2);smooth(r.expressSample.source.playbackRate,.85+Math.min(speed,56)/56*.2,time,.3);}
      smooth(r.gain.gain,clamp(state.gain??1,0,1),time,.09);smooth(r.pan.pan,clamp(state.pan||0,-1,1),time,.09);
      smooth(r.motor.o.frequency,p.motorHz,time);smooth(r.harmonic.o.frequency,p.motorHz*2.003,time);smooth(r.carrier.o.frequency,p.carrierHz,time);
      smooth(r.motor.g.gain,p.motor*ripple,time);smooth(r.harmonic.g.gain,p.motor*.32,time);smooth(r.carrier.g.gain,p.motor*.08,time);
      smooth(r.roll.g.gain,p.roll*ripple,time);smooth(r.roll.filter.frequency,p.rollHz,time);smooth(r.wind.g.gain,p.wind,time);
      smooth(r.rumble.g.gain,p.rumble,time);smooth(r.rumble.filter.frequency,55+speed*4,time);
      smooth(r.body.g.gain,p.body*ripple,time);smooth(r.body.filter.frequency,240+speed*22,time);
      if(r.brakeSample)smooth(r.brakeSample.g.gain,p.brake/0.045*1.65,time,.045);
      smooth(r.brake.g.gain,brakeBuffer?0:p.brake*3,time);smooth(r.squeal.g.gain,brakeBuffer?0:p.brake,time);smooth(r.squeal.o.frequency,p.squealHz,time);
      if(events&&previous){
        if(steam&&speed>.3){r.chuffTravel=(r.chuffTravel||0)+speed*dt;if(r.chuffTravel>=1.5){r.chuffTravel%=1.5;shot(r,'chuff',time);}}else r.chuffTravel=0;
        if(previous.speed>.12&&speed<=.12){clearShots(r,time);shot(r,'air',time);}
        if(!freight&&state.playing&&state.phase==='dwell'&&previous.phase!=='dwell')shot(r,'door',time+.22);
        if(!workshop&&!freight&&state.playing&&state.phase==='dwell'&&previous.phase==='dwell'&&previous.dwell>3&&state.dwell<=3)shot(r,'departure',time);
        if(p.jointGain>0)r.travel+=speed*dt;
        while(r.travel>=r.nextJoint){
          const step=r.jointStep??0;if(speed>.5)shot(r,'joint',time,step);
          r.nextJoint+=step%2?4.15:2.1;r.jointStep=(step+1)%4;
        }
      }
      r.previous={speed,phase:state.phase,dwell:state.dwell,kind};
    }
  }
  return{update,reset,stats,sampleCount:Object.keys(samples).length,dispose(){reset();for(const r of rows){r.sources.forEach(s=>s.stop());r.nodes.forEach(n=>n.disconnect());}},get activeShots(){return shots.size+rows.reduce((count,row)=>count+row.soundPlayer.active,0);}};
}
