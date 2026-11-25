export const mountainElevation=h=>20+1.8*h;
// Cubic curves are sampled by distance. Shared end tracks are exact straight lines.
export function routeFrom(curves, railway=false, gentle=false){
 curves=curves.map(c=>c.map(p=>[p[0],p[1],railway?20+p[2]+.018*p[2]*p[2]:mountainElevation(p[2])]));
 const points=[],climbs=[];
 for(const c of curves){const start=Math.max(0,points.length-1);for(let i=points.length?1:0;i<=120;i++){const t=i/120,u=1-t;points.push([0,1,2].map(k=>u*u*u*c[0][k]+3*u*u*t*c[1][k]+3*u*t*t*c[2][k]+t*t*t*c[3][k]));}
  if(gentle&&c[0][2]!==c[3][2]){const previous=climbs.at(-1),sign=Math.sign(c[3][2]-c[0][2]);if(gentle!=='separate'&&previous&&previous.end===start&&previous.sign===sign){previous.end=points.length-1;previous.high=c[3][2];}else climbs.push({start,end:points.length-1,low:c[0][2],high:c[3][2],sign});}
 }
 for(const climb of climbs){const {start,end,low,high}=climb,ds=[0];for(let j=start+1;j<=end;j++)ds.push(ds.at(-1)+Math.hypot(points[j][0]-points[j-1][0],points[j][1]-points[j-1][1]));const span=ds.at(-1),r=gentle==='wide'?.4:.25,progress=t=>t<r?(t-r/Math.PI*Math.sin(Math.PI*t/r))/(2*(1-r)):t>1-r?1-progress(1-t):(t-r/2)/(1-r);for(let j=start;j<=end;j++)points[j][2]=low+(high-low)*progress(ds[j-start]/span);}
 let length=0;const samples=points.map((p,i)=>{if(i)length+=Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1]);return {d:length,p};});
 const linear=d=>{d=Math.max(0,Math.min(length,d));let lo=1,hi=samples.length-1;while(lo<hi){const m=(lo+hi)>>1;if(samples[m].d<d)lo=m+1;else hi=m;}const a=samples[lo-1],b=samples[lo],t=(d-a.d)/(b.d-a.d||1);return [a.p[0]+(b.p[0]-a.p[0])*t,a.p[1]+(b.p[1]-a.p[1])*t,Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0]),a.p[2]+(b.p[2]-a.p[2])*t,Math.atan2(b.p[2]-a.p[2],b.d-a.d)];};
 const sample=d=>{const p=linear(d),a=linear(d-1.5),b=linear(d+1.5);p[2]=Math.atan2(b[1]-a[1],b[0]-a[0]);p[4]=Math.atan2(b[3]-a[3],Math.hypot(b[0]-a[0],b[1]-a[1]));return p;};
 return {parts:[],length,closed:false,samples,sample};
}
export const line=(a,b)=>[a,a.map((v,i)=>v+(b[i]-v)/3),a.map((v,i)=>v+2*(b[i]-v)/3),b];

export const LOWER_CURVES=[line([258,100,4],[168,100,4]),[[168,100,4],[55,100,4],[-70,110,7],[-170,110,10]],[[-170,110,10],[-211.421,110,12],[-245,143.579,14],[-245,185,16]],[[-245,185,16],[-245,226.421,18],[-211.421,260,20],[-170,260,22]],line([-170,260,22],[20,260,24]),line([20,260,24],[100,260,24])];

const a=[20,260,24],ae=[100,260,24],b=[-300,380,35],be=[-380,380,35],c=[80,600,39.7],ce=[160,600,39.7];
export const FIRST_CLIMB_CURVES=[line(ae,a),[a,[-80,260,24],[-180,380,35],b],line(b,be)];
export const MUSEUM_CLIMB_CURVES=[line(be,b),[b,[-200,380,35],[-95,385,39],[-60,420,39]],line([-60,420,39],[40,520,39]),[[40,520,39],[65,550,39],[45,600,39.7],c],line(c,ce)];
