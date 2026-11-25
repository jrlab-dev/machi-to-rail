import {sampleItem} from './core.mjs?v=marks-88';
export function elevatedSupportPlan(town,kit){
 const tracks=town.rails.flatMap(it=>kit.pieces[it.piece].routes.flatMap(r=>{const n=Math.ceil(r.length/2);return Array.from({length:n+1},(_,i)=>({uid:it.uid,p:sampleItem(it,r,i/n)}));}));
 const byUid=new Map(),supports=[],deck=[],nodes=[],ends=[];
 for(const it of town.rails){if(!kit.pieces[it.piece].procedural)continue;const r=kit.pieces[it.piece].routes[0],n=Math.max(1,Math.ceil(r.length/24)),rows=[];
  for(let i=0;i<n;i++){const p=sampleItem(it,r,(i+.5)/n);if(p[3]<=1.65)continue;
   const blocked=town.props.some(x=>['road','corner','tee','junction','crossing'].includes(x.type)&&Math.hypot(x.pose[0]-p[0],x.pose[1]-p[1])<15)||tracks.some(x=>x.uid!==it.uid&&(x.p[3]||0)<p[3]-2&&Math.hypot(x.p[0]-p[0],x.p[1]-p[1])<8);
   if(!blocked){rows.push(i);supports.push(p);}
  }
  byUid.set(it.uid,rows);
  const steps=Math.ceil(r.length/4),ts=[...new Set([...Array.from({length:steps+1},(_,i)=>i/steps),...rows.map(i=>(i+.5)/n)])].sort((a,b)=>a-b),ids=[];
  for(const t of ts){const p=sampleItem(it,r,t),id=nodes.length;nodes.push({p,edges:[],distance:rows.some(i=>Math.abs((i+.5)/n-t)<1e-9)?0:Infinity});ids.push(id);if(p[3]>2)deck.push({uid:it.uid,id});}
  for(let i=1;i<ids.length;i++){const a=ids[i-1],b=ids[i],d=(ts[i]-ts[i-1])*r.length;nodes[a].edges.push([b,d]);nodes[b].edges.push([a,d]);}
  ends.push(ids[0],ids.at(-1));
 }
 // Support distance follows connected decks, never a nearby unrelated bridge.
 for(let i=0;i<ends.length;i++)for(let j=i+1;j<ends.length;j++){const a=ends[i],b=ends[j],p=nodes[a].p,q=nodes[b].p;if(Math.hypot(p[0]-q[0],p[1]-q[1],p[3]-q[3])<.001&&Math.abs(Math.cos(p[2]-q[2]))>.99999){nodes[a].edges.push([b,0]);nodes[b].edges.push([a,0]);}}
 const queue=nodes.flatMap((v,i)=>v.distance===0?[i]:[]);for(let i=0;i<queue.length;i++){const v=nodes[queue[i]];for(const [id,d]of v.edges){const next=v.distance+d;if(next<=36&&next<nodes[id].distance){nodes[id].distance=next;queue.push(id);}}}
 const unsupported=new Set(deck.filter(({id})=>nodes[id].distance>36).map(x=>x.uid));
 return {byUid,errors:[...unsupported],supports};
}
