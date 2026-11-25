// Reuse the reed waveform and short valve transient within each AudioContext.
const hornTimbres=new WeakMap();
function hornTimbre(context){
  if(hornTimbres.has(context))return hornTimbres.get(context);
  const partials=new Float32Array([0,1,.68,.82,.33,.24,.28,.15,.08,.10]);
  const reed=context.createPeriodicWave(new Float32Array(partials.length),partials);
  const air=context.createBuffer(1,Math.ceil(context.sampleRate*.11),context.sampleRate);
  const data=air.getChannelData(0);
  let seed=367;
  for(let i=0;i<data.length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const t=i/context.sampleRate;
    data[i]=(seed/2147483648-1)*Math.min(1,t/.005)*Math.exp(-t/.023);
  }
  const timbre={reed,air};hornTimbres.set(context,timbre);return timbre;
}

const hornSamples=new WeakMap();
export function loadHornSample(context){
  if(hornSamples.has(context))return hornSamples.get(context);
  const loading=(async()=>{
    const response=await fetch(new URL('./assets/audio/train-horn1.mp3',import.meta.url));
    if(!response.ok)throw Error('horn sample '+response.status);
    const buffer=await context.decodeAudioData(await response.arrayBuffer());
    // Blend the sustained note into itself before the native loop wraps.
    const rate=buffer.sampleRate,loopStart=Math.round(.37*rate),loopEnd=Math.round(.76*rate);
    const blend=Math.round(.045*rate);
    for(let ch=0;ch<buffer.numberOfChannels;ch++){
      const pcm=buffer.getChannelData(ch);
      for(let i=0;i<blend;i++){
        const f=i/(blend-1);
        pcm[loopEnd-blend+i]=pcm[loopEnd-blend+i]*(1-f)+pcm[loopStart-blend+i]*f;
      }
    }
    return {buffer,loopStart:loopStart/rate,loopEnd:loopEnd/rate};
  })().catch(error=>{hornSamples.delete(context);throw error;});
  hornSamples.set(context,loading);return loading;
}

function sampledHorn(context,output,sample){
  function player(){
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=sample.buffer;source.connect(gain);gain.connect(output);
    source.onended=()=>{source.disconnect();gain.disconnect();};
    return {source,gain};
  }
  const {source,gain}=player(),start=context.currentTime,volume=1.5;
  gain.gain.value=volume;source.loop=true;source.loopStart=sample.loopStart;source.loopEnd=sample.loopEnd;
  source.start(start);
  let released=false;
  return ()=>{
    if(released)return;
    released=true;
    const t=context.currentTime,fade=.045;
    gain.gain.setValueAtTime(volume,t);gain.gain.linearRampToValueAtTime(0,t+fade);source.stop(t+fade);
    if(t-start<.10)return;
    const tail=player();tail.gain.gain.setValueAtTime(0,t);tail.gain.gain.linearRampToValueAtTime(volume,t+fade);
    tail.source.start(t,.94);
  };
}

export function startHorn(context,output,type,sample){
  if(sample&&type!=='steam')return sampledHorn(context,output,sample);
  const steam=type==='steam',tram=type==='tram',now=context.currentTime;
  const pitches=steam?[523,658,784]:tram?[415,523]:type==='freight'?[233,294,349]:[311,391];
  const timbre=hornTimbre(context),master=context.createGain(),filter=context.createBiquadFilter();
  filter.type='lowpass';filter.Q.value=.65;
  filter.frequency.setValueAtTime(steam?2100:980,now);
  filter.frequency.setTargetAtTime(steam?2100:tram?1600:2500,now,.036);
  filter.connect(master);master.connect(output);master.gain.value=.40/pitches.length;
  const air=context.createBufferSource(),airGain=context.createGain();
  air.buffer=timbre.air;airGain.gain.value=steam?.23:.14;
  air.connect(airGain);airGain.connect(filter);air.start(now);
  air.onended=()=>{air.disconnect();airGain.disconnect();};
  const voices=pitches.map((hz,i)=>{
    const osc=context.createOscillator(),level=context.createGain(),start=now+i*.014;
    if(steam)osc.type='sine';else osc.setPeriodicWave(timbre.reed);
    osc.frequency.setValueAtTime(hz*(i?.945:.97),start);
    osc.frequency.setTargetAtTime(hz,start,.027+i*.008);
    level.gain.value=0;level.gain.setTargetAtTime(i?.85:1,start,.019+i*.006);
    osc.connect(level);level.connect(filter);osc.start(start);
    return {osc,level,hz};
  });
  let ended=0,released=false;
  for(const {osc,level} of voices)osc.onended=()=>{
    osc.disconnect();level.disconnect();
    if(++ended===voices.length){filter.disconnect();master.disconnect();}
  };
  return ()=>{
    if(released)return;
    released=true;
    const t=context.currentTime;
    master.gain.setTargetAtTime(0,t,.038);
    filter.frequency.setTargetAtTime(880,t,.042);
    for(const {osc,hz} of voices){
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setTargetAtTime(hz*.96,t,.06);osc.stop(t+.20);
    }
  };
}

export function bindHorn(button,prepare,onError){
  let held=null,releaseVoice=null,sequence=0,view=null;
  function release(){
    sequence++;held=null;releaseVoice?.();releaseVoice=null;
    button.setAttribute('aria-pressed','false');
  }
  async function press(key){
    if(held!==null||button.hidden)return;
    held=key;const ticket=++sequence;button.setAttribute('aria-pressed','true');
    try{const play=await prepare();if(ticket===sequence)releaseVoice=play();}
    catch{if(ticket===sequence){release();onError();}}
  }
  button.onpointerdown=e=>{
    if(e.button!==0||held!==null)return;e.preventDefault();button.setPointerCapture(e.pointerId);press(e.pointerId);
  };
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{if(held===e.pointerId)release();});
  button.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)press(e.key);}};
  button.onkeyup=e=>{if(held===e.key){e.preventDefault();release();}};
  button.onclick=e=>{if(e.detail===0&&held===null){press('activate');const ticket=sequence;setTimeout(()=>{if(ticket===sequence)release();},400);}};
  button.onblur=release;window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  return {release,show(key){if(view===key)return;release();view=key;button.hidden=key===null;}};
}
