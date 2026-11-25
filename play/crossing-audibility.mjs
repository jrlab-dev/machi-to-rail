// Audio follows the listener, while warning lights still follow every train.
export function crossingAudibility(listener,sources){
 if(!listener?.every(Number.isFinite))return 0;let loudest=0;
 for(const source of sources||[]){if(!source?.every(Number.isFinite))continue;const d=Math.hypot(...listener.map((v,i)=>v-source[i]));if(d>=150)continue;const t=Math.max(0,Math.min(1,(d-20)/130)),gain=(1-t*t*(3-2*t))**2;loudest=Math.max(loudest,gain);}
 return loudest;
}
