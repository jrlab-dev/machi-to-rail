import {coastEdge} from './coast-data.mjs?v=fuji-land-31';
export const BOAT_COLORS={white:'#e3e4db',navy:'#203e50',deck:'#a8b0a4',metal:'#788b89',orange:'#e58a35',red:'#b94b37'};
export const BOATS=Object.freeze([
 {id:'ferry',kind:'ferry',x:2900,z:coastEdge(2900)+240,length:61,width:14,height:12,yaw:.04},
 {id:'fishing-a',kind:'fishing',x:2200,z:coastEdge(2200)+90,length:21.6,width:6.48,height:6.3,scale:1.8,verticalScale:1.4,yaw:.18},
 {id:'fishing-b',kind:'fishing',x:2700,z:coastEdge(2700)+95,length:22.4,width:6.4,height:6.5,scale:1.6,verticalScale:1.3,yaw:Math.PI-.08},
 {id:'fishing-c',kind:'fishing',x:3600,z:coastEdge(3600)+130,length:19.8,width:6.12,height:6.3,scale:1.8,verticalScale:1.4,yaw:Math.PI-.25}
].map(Object.freeze));
export function buildBoats(boats=BOATS){
 const batches=Object.fromEntries(Object.keys(BOAT_COLORS).map(k=>[k,{positions:[],normals:[],indices:[]}])),details=[];let current;
 function point(p){const c=Math.cos(current.yaw),s=Math.sin(current.yaw),scale=current.scale||1,vertical=current.verticalScale||1;return[current.x+(p[0]*c+p[2]*s)*scale,.02+(p[1]-.02)*vertical,current.z+(-p[0]*s+p[2]*c)*scale];}
 function tri(color,a,b,c){const out=batches[color],p=point(a),q=point(b),r=point(c),u=q.map((v,i)=>v-p[i]),v=r.map((v,i)=>v-p[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1,start=out.positions.length/3;out.positions.push(...p,...q,...r);for(let i=0;i<3;i++)out.normals.push(...n.map(v=>v/len));out.indices.push(start,start+1,start+2);}
 function quad(color,a,b,c,d){tri(color,a,b,c);tri(color,a,c,d);}
 function box(color,x,y,z,w,h,d){const p=[[x-w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x-w/2,y+h/2,z-d/2],[x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]];for(const f of[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])quad(color,...f.map(i=>p[i]));}
 function ring(length,width,y,scale=1){return[[-.5,-.33],[-.43,-.5],[.27,-.5],[.43,-.32],[.5,0],[.43,.32],[.27,.5],[-.43,.5],[-.5,.33]].map(([x,z])=>[x*length*scale,y,z*width*scale]);}
 function hull(l,w,depth,freeboard){const bottom=ring(l,w,-depth,.8),water=ring(l,w,.02,.94),top=ring(l,w,freeboard);for(let i=0;i<top.length;i++){const j=(i+1)%top.length;quad('navy',bottom[i],bottom[j],water[j],water[i]);quad('white',water[i],water[j],top[j],top[i]);tri('deck',[0,freeboard,0],top[j],top[i]);}}
 function windows(x,y,w,h,z,count){for(const side of[-1,1])for(let i=0;i<count;i++){const a=x-w/2+(i+.12)*w/count,b=x-w/2+(i+.86)*w/count;quad('navy',[a,y-h/2,z*side],[b,y-h/2,z*side],[b,y+h/2,z*side],[a,y+h/2,z*side]);}}
 function rail(x1,x2,y,z,height=.75){box('metal',(x1+x2)/2,y+height,z,x2-x1,.07,.07);const count=Math.ceil((x2-x1)/3);for(let i=0;i<=count;i++)box('metal',x1+(x2-x1)*i/count,y+height/2,z,.07,height,.07);}
 function buoy(x,y,z,size){for(let i=0;i<10;i++){const a=i*Math.PI/5,b=(i+1)*Math.PI/5,outer=size/2,inner=size*.28;quad('red',[x+Math.cos(a)*outer,y+Math.sin(a)*outer,z],[x+Math.cos(b)*outer,y+Math.sin(b)*outer,z],[x+Math.cos(b)*inner,y+Math.sin(b)*inner,z],[x+Math.cos(a)*inner,y+Math.sin(a)*inner,z]);}}
 for(const boat of boats){current=boat;const start=Object.values(batches).reduce((n,b)=>n+b.indices.length/3,0),l=boat.length/(boat.scale||1),w=boat.width/(boat.scale||1),height=boat.height/(boat.verticalScale||1);hull(l,w,boat.kind==='ferry'?1.9:.6,boat.kind==='ferry'?2.5:.8);
  if(boat.kind==='ferry'){
   // Shorter upper decks leave an open stern terrace and a distinct bow.
   box('white',-2,4.15,0,48,3.3,11.8);box('white',1,7.15,0,36,2.7,10.4);box('white',9,9.25,0,17,1.6,8.8);
   box('deck',-2,5.9,0,50,.22,12.5);box('white',1,8.6,0,38,.25,11.2);box('white',9,10.15,0,18,.2,9.5);
   windows(-2,4.5,45,1.55,5.91,15);windows(1,7.3,32,1.45,5.21,11);windows(9,9.35,15,.8,4.41,5);
   quad('navy',[17.51,8.9,-3.8],[17.51,8.9,3.8],[17.51,9.8,3.8],[17.51,9.8,-3.8]);
   for(const side of[-1,1]){box('navy',-1,2.72,side*6.1,49,.34,.08);rail(-25,-17,6.03,side*5.9);rail(-17,18,8.75,side*5.15);buoy(-20,6.5,side*6.13,1.3);}
   box('navy',-9,9.6,0,2.8,2.4,2.6);box('white',-9,10.9,0,3.2,.25,2.9);box('metal',13,11.1,0,.18,1.8,.18);box('metal',13,11.6,0,2,.1,.12);
   box('white',-3,9.15,-3.4,3.5,.7,1.15);box('white',-3,9.15,3.4,3.5,.7,1.15);
  }else{
   const cabinX=l*.13,cabinW=l*.29,cabinZ=w*.66;box('white',cabinX,1.8,0,cabinW,2,cabinZ);box('white',cabinX,2.86,0,cabinW+.5,.18,cabinZ+.4);windows(cabinX,2.08,cabinW*.85,.75,cabinZ/2+.012,2);
   quad('navy',[cabinX+cabinW/2+.012,1.65,-cabinZ*.42],[cabinX+cabinW/2+.012,1.65,cabinZ*.42],[cabinX+cabinW/2+.012,2.48,cabinZ*.42],[cabinX+cabinW/2+.012,2.48,-cabinZ*.42]);
   for(const side of[-1,1]){rail(-l*.43,-l*.05,.8,side*w*.42,.55);box('white',-l*.23,.98,side*w*.43,l*.43,.35,.12);buoy(cabinX,1.6,side*(cabinZ/2+.025),.55);}
   box('metal',cabinX,(height+2.95)/2,0,.06,height-2.95,.06);box('metal',cabinX,height-.3,0,.65,.055,.055);
   // Shallow orange bins have a dark open center and a raised continuous rim.
   for(const [x,z]of[[-l*.32,-w*.22],[-l*.18,-w*.22],[-l*.32,w*.17]]){const bw=l*.12,bd=w*.29;box('orange',x,.86,z,bw,.12,bd);box('deck',x,.935,z,bw*.78,.025,bd*.76);for(const side of[-1,1]){box('orange',x,1.14,z+side*bd*.46,bw,.5,bd*.08);box('orange',x+side*bw*.46,1.14,z,bw*.08,.5,bd);}}
  }
  const end=Object.values(batches).reduce((n,b)=>n+b.indices.length/3,0);details.push({...boat,triangles:end-start,waterline:.02,bottom:.02+((boat.kind==='ferry'?-1.9:-.6)-.02)*(boat.verticalScale||1)});
 }
 const geometry=Object.entries(batches).filter(([,b])=>b.indices.length).map(([color,b])=>({color,positions:new Float32Array(b.positions),normals:new Float32Array(b.normals),indices:new Uint16Array(b.indices)}));
 return{geometry,boats:details,triangles:geometry.reduce((n,b)=>n+b.indices.length/3,0),draws:geometry.length,bytes:geometry.reduce((n,b)=>n+b.positions.byteLength+b.normals.byteLength+b.indices.byteLength,0)};
}
