import {SOUND_SLOTS,INSTRUMENTS,presetFor} from './train-sound-presets.mjs?v=rail-90';
export const copySound=value=>JSON.parse(JSON.stringify(value));
export const legacyProfile=()=>({version:1,departure:{mode:'legacy'},signal:{mode:'legacy'},close:{mode:'legacy'}});
const fail=()=>{throw Error('音のデータが正しくありません。元の作品を残して読みこみを止めました。');};
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validateRecipe(raw,slot){
 if(!raw||!Array.isArray(raw.tracks)||raw.tracks.length<1||raw.tracks.length>3)fail();
 let count=0;const events=[];
 const tracks=raw.tracks.map(t=>{
  if(!t||!Object.hasOwn(INSTRUMENTS,t.instrument)||!finite(t.volume,0,1)||typeof t.mute!=='boolean'||!Array.isArray(t.notes))fail();
  const notes=t.notes.map(n=>{if(!n||!Number.isInteger(n.pitch)||!finite(n.pitch,48,84)||!Number.isInteger(n.start)||!finite(n.start,0,SOUND_SLOTS[slot].ms)||!Number.isInteger(n.duration)||n.duration<30||n.start+n.duration+80>SOUND_SLOTS[slot].ms||!finite(n.velocity,0,1))fail();count++;events.push([n.start,1],[n.start+n.duration+80,-1]);return{pitch:n.pitch,start:n.start,duration:n.duration,velocity:n.velocity};});
  return{instrument:t.instrument,volume:t.volume,mute:t.mute,notes};
 });
 if(count>128)fail();let voices=0;for(const [,delta]of events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]))if((voices+=delta)>6)throw Error('一度に鳴らせるのは6音までです。');
 return{tracks};
}
export function normalizeSoundProfile(raw){
 if(raw===undefined)return legacyProfile();if(!raw||raw.version!==1)fail();
 const result={version:1};for(const slot of Object.keys(SOUND_SLOTS)){const s=raw[slot];if(!s||!['legacy','preset','custom','off'].includes(s.mode))fail();result[slot]={mode:s.mode};if(s.mode==='preset'){if(s.version!==1||!presetFor(slot,s.id,s.version))fail();Object.assign(result[slot],{id:s.id,version:s.version});}if(s.mode==='custom')result[slot].recipe=validateRecipe(s.recipe,slot);}
 if(new TextEncoder().encode(JSON.stringify(result)).length>16384)throw Error('音のデータは電車1台につき16KBまでです。');return result;
}
export const soundFor=(scene,other=false)=>normalizeSoundProfile(scene[other?'oppositeSoundProfile':'soundProfile']);
export const hasWorkshopSound=profile=>profile&&Object.keys(SOUND_SLOTS).some(k=>profile[k]?.mode!=='legacy');
export const emptyRecipe=()=>({tracks:[{instrument:'piano',volume:.8,mute:false,notes:[]}]});
export function recipeFor(profile,slot){const s=profile[slot];return copySound(s.mode==='custom'?s.recipe:presetFor(slot,s.id,s.version)?.recipe||emptyRecipe());}
export class SoundHistory{
 constructor(profile){this.value=normalizeSoundProfile(profile);this.past=[];this.future=[];}
 set(next){next=normalizeSoundProfile(next);this.past.push(copySound(this.value));if(this.past.length>20)this.past.shift();this.value=next;this.future=[];}
 undo(){if(!this.past.length)return;this.future.push(this.value);this.value=this.past.pop();}
 redo(){if(!this.future.length)return;this.past.push(this.value);this.value=this.future.pop();}
}
export function soundHint(recipe,slot){
 const notes=recipe.tracks.flatMap((t,track)=>t.notes.map((n,index)=>({...n,track,index}))).sort((a,b)=>a.start-b.start),last=notes.at(-1);
 if(!last)return null;
 const n=notes.length===1?notes[0]:last;
 if(notes.some(o=>o!==n&&o.start===n.start))return recipe.tracks.length>1&&new Set(recipe.tracks.map(t=>t.instrument)).size===1?{type:'timbre',text:'片方をもっきんにしたら、どんな音？'}:null;
 const candidates=[4,7].filter(delta=>{if(n.pitch+delta>84)return false;try{const r=copySound(recipe);r.tracks[n.track].notes.push({...n,pitch:n.pitch+delta});validateRecipe(r,slot);return true;}catch{return false;}});
 return candidates.length?{type:'chord',text:notes.length===1?'同じタイミングに、もう一音足してみる？':'最後の音だけ、ふたつにしてみる？',note:n,candidates}:recipe.tracks.length>1&&new Set(recipe.tracks.map(t=>t.instrument)).size===1?{type:'timbre',text:'片方をもっきんにしたら、どんな音？'}:null;
}
export function applySoundHint(recipe,hint,delta=4){const r=copySound(recipe);if(hint.type==='timbre')r.tracks[1].instrument='xylophone';else{const n=hint.note;r.tracks[n.track].notes.push({pitch:n.pitch+delta,start:n.start,duration:n.duration,velocity:n.velocity});}return r;}
