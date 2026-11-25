// Use recorded car positions too, so replay and the selected train share one crossing.
export const SUMMIT_CROSSING={x:485,y:723};
// Keep both road approaches available for crossing equipment and pedestrians.
export const SUMMIT_CROSSING_SPACE={minX:473,maxX:497,minY:665,maxY:775};
export function inSummitCrossingSpace(x,y,margin=0){const s=SUMMIT_CROSSING_SPACE;return x>=s.minX-margin&&x<=s.maxX+margin&&y>=s.minY-margin&&y<=s.maxY+margin;}
export function summitCrossingState(visual){
 let distance=Infinity;
 for(const train of [visual,visual?.opposite])for(const car of train?.cars||[]){const p=car.body;if(p&&p[0]>340&&p[1]>700&&p[1]<740)distance=Math.min(distance,Math.abs(p[0]-SUMMIT_CROSSING.x));}
 const close=Math.max(0,Math.min(1,(105-distance)/35));
 return {close,alarm:close>0,distance};
}

export function crossingAlarm(visual,mountain=false){return mountain?summitCrossingState(visual).alarm:!!visual?.gates?.some(g=>g.alarm);}
