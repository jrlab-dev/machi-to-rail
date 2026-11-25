/* Shared low-cost residential buildings, fitted within two existing lots. */
(function(root){
  'use strict';
  const SPECS=Object.freeze([
    {fixedId:'residential-ring-east-terracotta',cx:209.77845399345506,cz:-6.128043624874998,w:12.256860252469778,d:25.132814940065145,hInput:20.08514293725212,h:20.4,floors:7,front:'-x'},
    {fixedId:'residential-ring-west-terracotta',cx:-229.06271063250486,cz:-25.853068740778046,w:25.018258802592754,d:17.195535019040108,hInput:25.37506958352474,h:25.5,floors:9,front:'+x'}
  ]);
  const CELLS={tile:[0,0,128,128],glass:[128,0,64,64],lit:[192,0,64,64],stone:[128,64,64,64],roof:[192,64,64,64],rail:[0,128,128,64],dark:[128,128,64,64],door:[192,128,64,64],tileSide:[0,192,128,64]};
  function uv(key){const c=CELLS[key],p=1.5;return[[c[0]+p,c[1]+c[3]-p],[c[0]+c[2]-p,c[1]+c[3]-p],[c[0]+c[2]-p,c[1]+p],[c[0]+p,c[1]+p]].map(v=>v.map(n=>n/256));}
  function createGeometry(spec){
    const s=spec,facade={name:'facade-terracotta',vertices:[],indices:[],triangles:0},windows={name:'windows',vertices:[],indices:[],triangles:0},parts={name:'parts',vertices:[],indices:[],triangles:0};
    const half=s.w/2,frontX=s.front==='-x'?s.cx-half:s.cx+half,n=s.front==='-x'?-1:1;
    const length=s.d,tz=n===-1?1:-1,startZ=s.cz-tz*length/2;
    const P=(u,y,depth)=>[frontX+n*depth,y,startZ+tz*u];
    function quad(mesh,a,b,c,d,key){const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]),normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],len=Math.hypot(...normal);if(len<1e-10)throw Error('degenerate apartment face');const k=mesh.vertices.length,tex=uv(key);[a,b,c,d].forEach((p,i)=>mesh.vertices.push({p,n:normal.map(x=>x/len),uv:tex[i]}));mesh.indices.push(k,k+1,k+2,k,k+2,k+3);mesh.triangles+=2;}
    function panel(u0,u1,y0,y1,depth,key='tile',mesh=facade){quad(mesh,P(u0,y0,depth),P(u1,y0,depth),P(u1,y1,depth),P(u0,y1,depth),key);}
    function box(u0,u1,y0,y1,d0,d1,key='tile'){
      const a=P(u0,y0,d1),b=P(u1,y0,d1),c=P(u1,y1,d1),d=P(u0,y1,d1),e=P(u0,y0,d0),f=P(u1,y0,d0),g=P(u1,y1,d0),h=P(u0,y1,d0);
      quad(facade,a,b,c,d,key);quad(facade,f,e,h,g,key);quad(facade,e,a,d,h,key);quad(facade,b,f,g,c,key);quad(facade,d,c,g,h,key);quad(facade,e,f,b,a,key);
    }
    const floorH=s.h/s.floors,depth=1.15,bays=Math.max(3,Math.round((length-1.0)/3.35)),bay=(length-1.0)/bays;
    // Side/rear walls are split by storeys and bays to maintain a stable tile scale.
    const sideLength=s.w-depth;
    for(let floor=0;floor<s.floors;floor++){
      const y0=floor*floorH,y1=(floor+1)*floorH;
      for(let b=0;b<bays;b++){const u0=.5+b*bay,u1=u0+bay;panel(u0,u1,y0,y1,-depth);}
      panel(0,.5,y0,y1,-depth);panel(length-.5,length,y0,y1,-depth);
      for(let k=0;k<Math.ceil(sideLength/3.3);k++){
        const d0=-s.w+k*sideLength/Math.ceil(sideLength/3.3),d1=-s.w+(k+1)*sideLength/Math.ceil(sideLength/3.3);
        quad(facade,P(0,y0,d0),P(0,y0,d1),P(0,y1,d1),P(0,y1,d0),'tile');
        quad(facade,P(length,y0,d1),P(length,y0,d0),P(length,y1,d0),P(length,y1,d1),'tile');
      }
      for(let b=0;b<bays;b++){
        const u0=b*length/bays,u1=(b+1)*length/bays;
        quad(facade,P(u1,y0,-s.w),P(u0,y0,-s.w),P(u0,y1,-s.w),P(u1,y1,-s.w),'tile');
      }
    }
    // Slim end walls, continuous slabs and terracotta parapets stay in the old footprint.
    box(0,.45,0,s.h,-depth,0,'tileSide');box(length-.45,length,0,s.h,-depth,0,'tileSide');
    for(let floor=1;floor<s.floors;floor++){
      const y=floor*floorH;
      box(.45,length-.45,y,y+.15,-depth,0,'stone');
      box(.54,length-.54,y+.15,y+1.04,-.15,-.035,'rail');
      box(.54,length-.54,y+1.04,y+1.10,-.19,0,'stone');
      for(let b=0;b<bays;b++){
        const u0=.5+b*bay,u1=u0+bay;
        // Balcony partitions create real recesses, without individual railing bars.
        if(b>0)box(u0-.035,u0+.035,y+.16,y+floorH-.15,-depth,-.12,'stone');
        const lit=(floor*11+b*7+(n===1?3:0))%5<2,key=lit?'lit':'glass',target=lit?windows:facade;
        panel(u0+.30,u1-.30,y+.18,y+floorH-.35,-depth+.012,key,target);
      }
    }
    // Ground floor: a centered glazed lobby framed by a broad stone portal.
    const mid=length/2,entry=3.4;
    panel(mid-entry/2,mid+entry/2,.05,2.4,-depth+.015,'door');
    box(mid-entry/2-.20,mid-entry/2,0,2.70,-depth,-.38,'stone');box(mid+entry/2,mid+entry/2+.20,0,2.70,-depth,-.38,'stone');
    box(mid-entry/2-.2,mid+entry/2+.2,2.50,2.72,-depth,0,'stone');
    // Roof is solid, with a restrained cornice and no glass or glowing wall faces.
    quad(facade,P(0,s.h,-s.w),P(0,s.h,0),P(length,s.h,0),P(length,s.h,-s.w),'roof');
    box(.45,length-.45,s.h-.18,s.h,-depth,0,'stone');
    // Rooftop stair enclosure and a thin cap reuse the opaque facade atlas.
    const roofU=length*.55,roofD=-3.5;
    box(roofU-1.9,roofU+1.9,s.h,s.h+2.5,roofD-1.6,roofD+1.6,'tile');
    box(roofU-2.05,roofU+2.05,s.h+2.5,s.h+2.68,roofD-1.75,roofD+1.75,'stone');
    return {spec:s,bounds:{x0:s.cx-s.w/2,x1:s.cx+s.w/2,z0:s.cz-s.d/2,z1:s.cz+s.d/2,y0:0,y1:s.h+2.68},meshes:[facade,windows,parts],stats:{vertices:facade.vertices.length+windows.vertices.length,triangles:facade.triangles+windows.triangles,draws:2}};
  }
  function createTextures(doc){
    const color=doc.createElement('canvas'),light=doc.createElement('canvas');color.width=color.height=light.width=light.height=256;
    const g=color.getContext('2d'),l=light.getContext('2d');g.fillStyle='#9c624b';g.fillRect(0,0,256,256);l.clearRect(0,0,256,256);
    function tiled(x,y,w,h,sx=12,sy=6){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle='#b17c60';g.fillRect(x,y,w,h);for(let r=0;r<=h/sy;r++)for(let c=-1;c<=w/sx;c++){const k=(r*17+c*31+83)%7,xx=x+c*sx+(r%2)*sx/2,yy=y+r*sy;g.fillStyle=['#a7684e','#ad7055','#9e6048','#b47759','#a96b50','#995e47','#b07659'][Math.abs(k)];g.fillRect(xx+1,yy+1,sx-1,sy-1);g.fillStyle='rgba(60,36,29,.16)';g.fillRect(xx+1,yy+sy-1,sx-1,1);}g.restore();}
    tiled(0,0,128,128);tiled(0,128,128,64,12,8);tiled(0,192,128,64);
    function glass(ctx,x,y,w,h,lit){const grad=ctx.createLinearGradient(x,y,x,y+h);grad.addColorStop(0,lit?'#b9a477':'#253d49');grad.addColorStop(.55,lit?'#d3b881':'#536976');grad.addColorStop(1,lit?'#aa8756':'#253942');ctx.fillStyle=grad;ctx.fillRect(x+3,y+3,w-6,h-6);ctx.fillStyle=lit?'rgba(78,61,40,.20)':'rgba(169,190,195,.18)';for(let z=12;z<h-8;z+=7)ctx.fillRect(x+6,y+z,w-12,1);ctx.fillStyle='#726d61';ctx.fillRect(x+2,y+2,w-4,2);ctx.fillRect(x+2,y+h-4,w-4,2);ctx.fillRect(x+2,y+2,2,h-4);ctx.fillRect(x+w-4,y+2,2,h-4);ctx.fillRect(x+w/2-1,y+2,2,h-4);}
    glass(g,128,0,64,64,false);glass(g,192,0,64,64,true);glass(l,192,0,64,64,true);
    for(const [key,c] of Object.entries({stone:'#b6a68e',roof:'#6b6860',dark:'#4f514d',door:'#31454d'})){const [x,y,w,h]=CELLS[key];g.fillStyle=c;g.fillRect(x,y,w,h);g.fillStyle='rgba(255,240,205,.1)';g.fillRect(x+2,y+2,w-4,3);}
    g.fillStyle='#b6a991';g.fillRect(223,132,2,55);g.fillRect(199,132,50,2);g.fillRect(199,185,50,2);g.fillRect(198,132,2,55);g.fillRect(249,132,2,55);
    return {color,light};
  }
  const api={SPECS,createGeometry,createTextures};root.TerracottaApartments=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
