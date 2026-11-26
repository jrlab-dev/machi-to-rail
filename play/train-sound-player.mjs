import {presetFor} from './train-sound-presets.mjs?v=rail-90';
import {validateRecipe} from './train-sound-recipe.mjs?v=rail-90';
import {soundBudget,NOTE_LEVEL} from './train-sound-budget.mjs?v=rail-90';
// The partial ratios follow the shared lightweight keyboard instruments.
const partials={piano:[[1,.78,1.8],[2,.16,.5],[3,.06,.2]],musicbox:[[1,.76,3.8],[2,.17,1.4],[3,.05,.55],[4,.02,.25]],xylophone:[[1,.84,1.35],[4,.14,.22],[10,.02,.08]],chime:[[1,.7,2],[2,.2,.65],[3,.1,.3]]};
export function createSoundPlayer(context,output){
 const active=new Set(),budget=soundBudget(context),melodicOutput=budget.attach(output);
 function note(instrument,pitch,at,duration,volume=.8){
  if(volume===0)return{stop(){},end:at+duration+.08};
  const gain=context.createGain(),sources=[],parts=[],hz=440*2**((pitch-69)/12),end=at+duration;
  const releaseBudget=budget.reserve(at,end+.08);
  gain.connect(melodicOutput);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume*NOTE_LEVEL,at+.008);gain.gain.setValueAtTime(volume*NOTE_LEVEL,Math.max(at+.009,end));gain.gain.linearRampToValueAtTime(0,end+.08);
  for(const [ratio,amp,decay]of partials[instrument]||partials.piano){if(hz*ratio>context.sampleRate*.45)continue;const o=context.createOscillator(),g=context.createGain();o.frequency.value=hz*ratio;g.gain.setValueAtTime(amp,at);g.gain.exponentialRampToValueAtTime(Math.max(.00001,amp*Math.exp(-duration/decay)),end);o.connect(g);g.connect(gain);o.start(at);o.stop(end+.081);sources.push(o);parts.push(g);}
  const entry={stop(t=context.currentTime){gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(0,t);releaseBudget();for(const o of sources)try{o.stop(t);}catch{}},end:end+.081};active.add(entry);let remaining=sources.length;for(const o of sources)o.onended=()=>{o.disconnect();if(--remaining===0){releaseBudget();parts.forEach(g=>g.disconnect());gain.disconnect();active.delete(entry);}};return entry;
 }
 function effect(kind,at){
  const duration=1.62,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);let seed=777,previous=0;
  for(let i=0;i<data.length;i++){const t=i/context.sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;previous=.82*previous+.18*(seed/2147483648-1);const swish=Math.sin(Math.min(1,t/1.4)*Math.PI)*.025;const contact=Math.exp(-Math.max(0,t-1.48)*70)*(t>1.48?.032:0);data[i]=previous*(swish+contact)*(kind==='airdoor'?1.3:.9)+(kind==='futuredoor'?Math.sin(2*Math.PI*(420-t*120)*t)*swish*.22:0);}
  const source=context.createBufferSource();source.buffer=buffer;source.connect(output);source.start(at);const entry={stop(t=context.currentTime){try{source.stop(t);}catch{}},end:at+duration};active.add(entry);source.onended=()=>{source.disconnect();active.delete(entry);};return entry;
 }
 return{context,note,effect,play(setting,slot,at=context.currentTime){if(!setting||setting.mode==='off'||setting.mode==='legacy')return;const preset=setting.mode==='preset'?presetFor(slot,setting.id,setting.version):null;if(preset?.legacy)return{legacy:true};if(preset?.effect)return effect(preset.effect,at);const recipe=validateRecipe(setting.mode==='custom'?setting.recipe:preset?.recipe,slot);for(const track of recipe.tracks)if(!track.mute)for(const n of track.notes)note(track.instrument,n.pitch,at+n.start/1000,n.duration/1000,track.volume*n.velocity);},stop(){for(const entry of [...active])entry.stop();},get active(){return active.size;}};
}
