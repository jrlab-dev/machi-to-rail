/* Six existing ring-road lots; one shared opaque atlas and one window atlas. */
(function(root){
  'use strict';
  const SPECS=Object.freeze([
    {fixedId:'ring-market-east',type:'shop',cx:166.95584523572268,cz:132.488002625792,w:17.13682359829545,d:16.61370699107647,hInput:7.1050292995527045},
    {fixedId:'ring-market-west',type:'shop',cx:-203.39653979809228,cz:60.167323446945396,w:19.53259326517582,d:22.287764221429825,hInput:5.997340471353623},
    {fixedId:'ring-warehouse-south',type:'warehouse',cx:-36.380447190153006,cz:-227.73969087162652,w:21.933294143527746,d:25.91618525609374,hInput:7.648494469018364},
    {fixedId:'ring-warehouse-west',type:'warehouse',cx:-187.2491815991615,cz:-131.5389518985115,w:16.178846403956413,d:19.590014044195414,hInput:6.799492556959653},
    {fixedId:'ring-hotel-south',type:'hotel',cx:132.93573420942135,cz:-177.95417178418037,w:16.997687742114067,d:15.836136378347874,hInput:18.028811259212326},
    {fixedId:'ring-office-west',type:'office',cx:-197.40943972200907,cz:104.69084404386787,w:21.96283097192645,d:11.883493732661009,hInput:14.582618418749533}
  ]);
  const KEYS=['cream','white','metal','roof','glass','lit','shop','hotel','office','warehouse','shutter','teal','brick','awning','stone','dark'];
  const cell=key=>{const i=KEYS.indexOf(key);if(i<0)throw Error(key);return[i%4*64,Math.floor(i/4)*64];};
  function uv(key){const [x,y]=cell(key),a=2,b=62;return[[x+a,y+b],[x+b,y+b],[x+b,y+a],[x+a,y+a]].map(p=>p.map(v=>v/256));}
  function createGeometry(s){
    const h=Math.max(2,Math.round(s.hInput/2.55))*2.55;
    const nx=Math.abs(s.cx)>Math.abs(s.cz)?-Math.sign(s.cx):0,nz=nx?0:-Math.sign(s.cz);
    const L=nx?s.d:s.w,D=nx?s.w:s.d;
    const P=(u,y,v)=>[s.cx+nx*(D/2+v)+nz*(u-L/2),y,s.cz+nz*(D/2+v)-nx*(u-L/2)];
    const facade={name:'facade-variety',vertices:[],indices:[],triangles:0},windows={name:'windows',vertices:[],indices:[],triangles:0},parts={name:'parts',vertices:[],indices:[],triangles:0};
    function face(mesh,points,key){const [a,b,c]=points,ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]),n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],len=Math.hypot(...n);if(len<1e-9)throw Error('Degenerate variety face');const k=mesh.vertices.length,tex=uv(key);points.forEach((p,i)=>mesh.vertices.push({p,n:n.map(v=>v/len),uv:tex[i]}));mesh.indices.push(k,k+1,k+2);if(points.length===4)mesh.indices.push(k,k+2,k+3);mesh.triangles+=points.length-2;}
    const q=(a,b,c,d,key,mesh=facade)=>face(mesh,[a,b,c,d],key);
    function panel(u0,u1,y0,y1,v,key,mesh=facade){q(P(u0,y0,v),P(u1,y0,v),P(u1,y1,v),P(u0,y1,v),key,mesh);}
    function box(u0,u1,y0,y1,v0,v1,key){
      const a=P(u0,y0,v1),b=P(u1,y0,v1),c=P(u1,y1,v1),d=P(u0,y1,v1),e=P(u0,y0,v0),f=P(u1,y0,v0),g=P(u1,y1,v0),j=P(u0,y1,v0);
      q(a,b,c,d,key);q(f,e,j,g,key);q(e,a,d,j,key);q(b,f,g,c,key);q(d,c,g,j,key);q(e,f,b,a,key);
    }
    // Every visible window lies slightly outside its wall, within the old lot.
    function window(u0,u1,y0,y1,v,lit=false){panel(u0,u1,y0,y1,v,lit?'lit':'glass',lit?windows:facade);}
    function sideWindows(u,v0,v1,y0,y1,right,lit){const a=P(u,y0,right?v1:v0),b=P(u,y0,right?v0:v1),c=P(u,y1,right?v0:v1),d=P(u,y1,right?v1:v0);q(a,b,c,d,lit?'lit':'glass',lit?windows:facade);}
    const inset=.22;
    if(s.type==='shop'){
      // Storefront recessed behind a projecting striped canopy; flat roof parapet.
      box(inset,L-inset,0,h-.28,-D+.2,-1.1,'cream');
      box(.16,L-.16,h-.28,h,-D+.14,-.85,'stone');
      const signY=Math.min(3.3,h-1.2),bays=Math.max(3,Math.floor((L-1.8)/3.4)),bw=(L-1.8)/bays;
      for(let b=0;b<bays;b++){
        window(.9+b*bw,.9+(b+1)*bw-.10,.12,signY-.27,-1.085,b%3!==1);
        box(.82+b*bw,.91+b*bw,0,signY-.2,-1.10,-.99,'stone');
      }
      box(.45,L-.45,signY-.24,signY,-1.15,-.06,'awning');
      box(.5,L-.5,signY+.05,signY+.85,-1.13,-.84,'teal');
      panel(L*.27,L*.73,signY+.12,signY+.76,-.825,'shop');
      if(h>6){for(let b=0;b<4;b++)window(1+b*(L-2)/4,1+(b+1)*(L-2)/4-.4,4.7,h-.75,-1.085,b%3===0);}
      for(let b=0;b<3;b++){const v=-D+1+b*(D-3)/3,v1=v+(D-3)/3-.24;for(const right of [false,true]){sideWindows(right?L-inset+.012:inset-.012,v,v1,.75,signY-.4,right,b===1);if(h>6)sideWindows(right?L-inset+.012:inset-.012,v,v1,4.7,h-.75,right,b===0);}}
      box(L*.15,L*.15+1.8,h-.23,h-.05,-D+1,-D+2.8,'roof');
    }else if(s.type==='warehouse'){
      const eave=h-1.75,u0=.2,u1=L-.2,v0=-D+.2,v1=-.6,mid=L/2;
      box(u0,u1,0,eave,v0,v1,'metal');
      face(facade,[P(u0,eave,v1),P(u1,eave,v1),P(mid,h,v1)],'metal');
      face(facade,[P(u1,eave,v0),P(u0,eave,v0),P(mid,h,v0)],'metal');
      q(P(u0,eave,v0),P(u0,eave,v1),P(mid,h,v1),P(mid,h,v0),'roof');
      q(P(mid,h,v0),P(mid,h,v1),P(u1,eave,v1),P(u1,eave,v0),'roof');
      for(let b=0;b<2;b++){
        const u=.9+b*(L/2),end=Math.min(u+L*.34,L-.8);
        panel(u,end,.06,eave-.9,v1+.018,'shutter');
        box(u-.1,end+.1,eave-.88,eave-.68,v1-.2,-.05,'dark');
      }
      panel(L*.34,L*.66,eave-.56,eave-.08,v1+.021,'warehouse');
      for(let b=0;b<3;b++){const a=-D+.8+b*(D-1.8)/3,c=a+(D-1.8)/3-.35;sideWindows(u0-.012,a,c,eave-1.1,eave-.4,false,b===1);sideWindows(u1+.012,a,c,eave-1.1,eave-.4,true,false);}
    }else if(s.type==='hotel'){
      box(.22,L-.22,0,h-.38,-D+.22,-.9,'cream');
      box(.12,L-.12,h-.38,h,-D+.12,-.8,'white');
      const floors=Math.round(h/2.55),bay=(L-2.4)/4;
      for(let f=1;f<floors;f++){
        const y=f*2.55;
        for(let b=0;b<4;b++)window(1.2+b*bay,1.2+b*bay+bay*.58,y+.42,y+1.92,-.883,(b+f*3)%5<2);
        box(.18,L-.18,y-.10,y+.04,-D+.18,-.86,'white');
        for(let b=0;b<4;b++){const v=-D+1+b*(D-2)/4;sideWindows(.208,v,v+(D-2)/4*.55,y+.42,y+1.92,false,(b+f)%4===0);sideWindows(L-.208,v,v+(D-2)/4*.55,y+.42,y+1.92,true,(b+f)%4===1);}
      }
      box(.30,1.1,3.1,h-1,-1.0,-.51,'teal');
      // Vertical hotel name: one atlas label stretched over a slim sign, not extra letters.
      panel(.32,1.08,3.4,h-1.3,-.495,'hotel');
      window(L*.39,L*.61,.08,2.15,-.88,true);
      box(L*.30,L*.70,2.25,2.48,-1.05,-.05,'dark');
      box(L*.30,L*.30+.12,0,2.25,-.18,-.06,'stone');box(L*.70-.12,L*.70,0,2.25,-.18,-.06,'stone');
    }else if(s.type==='office'){
      const step=2.55*3;
      box(.25,L-.25,0,step,-D+.25,-.85,'dark');
      box(1.1,L-1.1,step,h-.22,-D+1.1,-1.7,'dark');
      box(1.02,L-1.02,h-.22,h,-D+1.02,-1.62,'white');
      for(let f=0;f<Math.round(h/2.55);f++){
        const top=f>=3,u=top?1.1:.25,v=top?-1.7:-.85,back=top?-D+1.1:-D+.25,y=f*2.55;
        for(let b=0;b<3;b++){const bw=(L-2*u-.6)/3;window(u+.3+b*bw,u+.3+(b+1)*bw-.13,y+.22,Math.min(y+2.25,h-.35),v+.016,(b+f)%4===0);}
        for(const right of [false,true])sideWindows(right?L-u+.012:u-.012,back+.3,v-.3,y+.22,Math.min(y+2.25,h-.35),right,f%3===1);
        box(u-.035,L-u+.035,y+.03,y+.15,back-.03,v+.05,'white');
      }
      panel(L*.32,L*.68,2.60,3.15,-.80,'office');
      box(L*.28,L*.72,2.30,2.48,-1.0,-.07,'white');
    }else throw Error('Unknown variety '+s.type);
    return{spec:s,meshes:[facade,windows,parts],bounds:{x0:s.cx-s.w/2,x1:s.cx+s.w/2,z0:s.cz-s.d/2,z1:s.cz+s.d/2,y0:0,y1:h},stats:{vertices:facade.vertices.length+windows.vertices.length,triangles:facade.triangles+windows.triangles,draws:2}};
  }
  function createTextures(doc){
    const color=doc.createElement('canvas'),light=doc.createElement('canvas');color.width=color.height=light.width=light.height=256;
    const g=color.getContext('2d'),l=light.getContext('2d');l.clearRect(0,0,256,256);
    const colors=['#bfb7a5','#d3d5cc','#879a9c','#516770','#2b4c5c','#cebb8b','#2f665e','#31585f','#38545b','#46606a','#7e8b8d','#366e62','#a58167','#d4d6bd','#aaa896','#46535a'];
    KEYS.forEach((key,i)=>{const [x,y]=cell(key);g.fillStyle=colors[i];g.fillRect(x,y,64,64);});
    for(const key of ['cream','white','stone','brick']){const[x,y]=cell(key);g.fillStyle='rgba(45,55,50,.10)';for(let k=8;k<64;k+=12)g.fillRect(x,y+k,64,1);g.fillRect(x+32,y,1,64);}
    for(const key of ['metal','roof','shutter']){const[x,y]=cell(key);for(let k=3;k<62;k+=5){g.fillStyle='rgba(25,44,48,.24)';if(key==='shutter')g.fillRect(x+2,y+k,60,1);else g.fillRect(x+k,y+2,1,60);g.fillStyle='rgba(224,236,233,.16)';if(key==='shutter')g.fillRect(x+2,y+k+1,60,1);else g.fillRect(x+k+1,y+2,1,60);}}
    for(const key of ['glass','lit']){const[x,y]=cell(key),lit=key==='lit';for(const ctx of lit?[g,l]:[g]){const grad=ctx.createLinearGradient(x,y,x,y+64);grad.addColorStop(0,lit?'#ad976e':'#294856');grad.addColorStop(.55,lit?'#d4c193':'#68868d');grad.addColorStop(1,lit?'#b49a6d':'#36505d');ctx.fillStyle=grad;ctx.fillRect(x+2,y+2,60,60);ctx.fillStyle='#829393';ctx.fillRect(x+2,y+2,60,2);ctx.fillRect(x+2,y+60,60,2);ctx.fillRect(x+2,y+2,2,60);ctx.fillRect(x+60,y+2,2,60);ctx.fillRect(x+31,y+2,2,60);ctx.fillStyle='rgba(32,40,43,.18)';for(let j=12;j<59;j+=8)ctx.fillRect(x+4,y+j,56,1);}}
    for(const[key,label]of [['shop','MARKET'],['office','OFFICE'],['warehouse','DEPOT']]){const[x,y]=cell(key);g.fillStyle='#e8e8cf';g.font='bold 11px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(label,x+32,y+32,56);}
    {const[x,y]=cell('hotel');g.fillStyle='#ede7ce';g.font='bold 12px sans-serif';g.textAlign='center';g.textBaseline='middle';[...'HOTEL'].forEach((c,i)=>g.fillText(c,x+32,y+9+i*11));}
    {const[x,y]=cell('awning');g.fillStyle='#40776a';for(let i=0;i<64;i+=16)g.fillRect(x+i,y,8,64);}
    return{color,light};
  }
  const api={SPECS,createGeometry,createTextures};root.RingBuildingVariety=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
