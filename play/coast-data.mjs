export function coastEdge(x){const end=Math.max(0,Math.abs(x-3000)-1400);return Math.min(6500,72+12*Math.sin(x*.003)+7*Math.sin(x*.008)+end*end*.0025);}
export function coastalLand(x,z){return z<=coastEdge(x)-12;}
export function coastalWater(x,z){return z>coastEdge(x)+11;}
