// Heights are rail-top heights; the original ground layout remains zero.
export const VIADUCT_HEIGHT=8;
export const CLEARANCE=8;
export function railHeight(r,t){const a=r.heightStart||0,b=r.heightEnd??a;return a+(b-a)*t*t*(3-2*t);}
export function railPitch(r,t){return Math.atan(((r.heightEnd??r.heightStart??0)-(r.heightStart||0))*6*t*(1-t)/r.length);}
export const isElevatedPiece=p=>!!p?.procedural;
export const validRailPose=p=>Array.isArray(p)&&[3,5].includes(p.length)&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<=100000)&&(p.length===3||(p[3]>=-.1&&p[3]<=8.1&&Math.abs(p[4])<=.1));
