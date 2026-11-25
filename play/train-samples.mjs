const FILES={departure:'departure-bell.mp3',brake:'brake.mp3',door:'door-open.mp3',air:'air-release.mp3',express:'express-running.mp3'};
export async function loadTrainSamples(context){
  const samples={},failures=[];
  await Promise.all(Object.entries(FILES).map(async([key,file])=>{
    try{const response=await fetch(new URL('./assets/audio/'+file,import.meta.url));if(!response.ok)throw new Error(String(response.status));samples[key]=await context.decodeAudioData(await response.arrayBuffer());}
    catch{failures.push(key);}
  }));
  return{samples,failures};
}
// Blend the tail into the head, then begin playback after the blended head.
export function runningLoop(context,original){
  const sr=original.sampleRate,start=Math.floor(Math.min(2,original.duration*.1)*sr),end=Math.floor(Math.min(original.duration-2,22)*sr),overlap=Math.min(Math.floor(sr),Math.floor((end-start)/4));
  if(end-start<sr||overlap<1)return original;
  const length=end-start-overlap,out=context.createBuffer(original.numberOfChannels,length,sr);
  for(let ch=0;ch<original.numberOfChannels;ch++){
    const input=original.getChannelData(ch),output=out.getChannelData(ch);
    output.set(input.subarray(start+overlap,end));
    for(let i=0;i<overlap;i++){const f=i/overlap;output[length-overlap+i]=input[end-overlap+i]*(1-f)+input[start+i]*f;}
  }return out;
}
// Crossfade the recording edges so a prolonged deceleration has no loop click.
export function brakeLoop(context,original){
  const sr=original.sampleRate,start=Math.floor(.2*sr),end=Math.min(original.length,Math.floor(3.8*sr)),overlap=Math.floor(.16*sr),length=end-start-overlap;
  const out=context.createBuffer(original.numberOfChannels,length,sr);
  for(let ch=0;ch<original.numberOfChannels;ch++){
    const input=original.getChannelData(ch),output=out.getChannelData(ch);
    for(let i=0;i<length;i++)output[i]=input[start+overlap+i];
    for(let i=0;i<overlap;i++){const f=i/overlap;output[length-overlap+i]=input[end-overlap+i]*(1-f)+input[start+i]*f;}
  }return out;
}

