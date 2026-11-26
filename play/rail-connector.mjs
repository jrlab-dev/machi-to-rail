const PREFIX='flex1:';
const canonical=v=>v.toFixed(7).replace(/\.?0+$/,'').replace(/^-0$/,'0')||'0';
function rawPoint(c,t){const u=1-t,[a,b,d,e]=c;const x=u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*d[0]+t*t*t*e[0],y=u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*d[1]+t*t*t*e[1];const dx=3*u*u*(b[0]-a[0])+6*u*t*(d[0]-b[0])+3*t*t*(e[0]-d[0]),dy=3*u*u*(b[1]-a[1])+6*u*t*(d[1]-b[1])+3*t*t*(e[1]-d[1]);return [x,y,Math.atan2(dy,dx),dx,dy];}
export function connectorSpec(key){
 if(typeof key!=='string'||!key.startsWith(PREFIX)||key.length>140)throw Error('接続レールのデータが不正です。');
 const fields=key.slice(PREFIX.length).split(',');if(fields.length!==4||fields.some(v=>!/^[-+]?\d+(?:\.\d+)?$/.test(v)))throw Error('接続レールのデータが不正です。');
 const [x,y,angle,h]=fields.map(Number),distance=Math.hypot(x,y);if(![x,y,angle,h].every(Number.isFinite)||distance<.05||distance>120||Math.abs(angle)>Math.PI||![0,8].includes(h))throw Error('接続レールは同じ高さで、120m以内のはしを選んでください。');
 if(x/distance<.15||(x*Math.cos(angle)+y*Math.sin(angle))/distance<.15)throw Error('はしが背中合わせです。直線や曲線を足して、はしを向かい合わせてください。');
 const handle=distance/3,c=[[0,0],[handle,0],[x-Math.cos(angle)*handle,y-Math.sin(angle)*handle],[x,y]],samples=[{d:0,t:0}],n=256;let length=0,prev=rawPoint(c,0);
 for(let i=0;i<=n;i++){const t=i/n,p=rawPoint(c,t),u=1-t,ddx=6*u*(c[2][0]-2*c[1][0])+6*t*(c[3][0]-2*c[2][0]+c[1][0]),ddy=6*u*(c[2][1]-2*c[1][1])+6*t*(c[3][1]-2*c[2][1]+c[1][1]),speed=Math.hypot(p[3],p[4]),curvature=Math.abs(p[3]*ddy-p[4]*ddx)/speed**3;if(speed<.001||curvature>1/12)throw Error('曲がりが急すぎます。少しはなれたはしや、向きの近いはしを選んでください。');length+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);if(i)samples.push({d:length,t});prev=p;}
 const route={kind:'connector',length,from:'A',to:'B',heightStart:h,heightEnd:h,control:c,samples};
 return {id:key,name:'接続レール',connector:true,procedural:h>0,ports:[{id:'A',position:[0,0,h],outward:Math.PI},{id:'B',position:[x,y,h],outward:angle}],routes:[route]};
}
export function registerConnector(key,kit){if(typeof key==='string'&&key.startsWith(PREFIX)&&!Object.hasOwn(kit.pieces,key))Object.defineProperty(kit.pieces,key,{value:connectorSpec(key),enumerable:false});}
export function connectorPoint(r,t){const d=Math.max(0,Math.min(1,t))*r.length,ss=r.samples;let lo=1,hi=ss.length-1;while(lo<hi){const m=(lo+hi)>>1;if(ss[m].d<d)lo=m+1;else hi=m;}const a=ss[lo-1],b=ss[lo],u=(d-a.d)/(b.d-a.d||1);return rawPoint(r.control,a.t+(b.t-a.t)*u).slice(0,3);}
export function connectRailPorts(a,b,uid,kit){
 if(!a||!b||a.key===b.key)throw Error('別々の開いたはしを2つ選んでください。');if(Math.abs((a.h||0)-(b.h||0))>.001)throw Error('高さがちがいます。上り坂・下り坂で同じ高さにしてください。');
 const dx=b.x-a.x,dy=b.y-a.y,c=Math.cos(a.a),s=Math.sin(a.a),angle=Math.atan2(Math.sin(b.a+Math.PI-a.a),Math.cos(b.a+Math.PI-a.a));const key=PREFIX+[dx*c+dy*s,-dx*s+dy*c,angle,a.h||0].map(canonical).join(',');registerConnector(key,kit);return {uid,piece:key,pose:[a.x,a.y,a.a],branch:'B'};
}
