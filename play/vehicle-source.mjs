// Shared vehicle geometry, isolated from the original driving scene.
const TAU=Math.PI*2, RETRO={plate:70,reflex:800};
const studioDraftFor=()=>null;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};


class Mesh {
  constructor(){ this.v = []; this.i = []; this.n = 0; this.g = 0; }
  /* いまから積む面の反射シートの等級。RETRO 表の値を入れる。
     grade(0) に戻し忘れると、後から積んだ物まで光る。 */
  grade(v){ this.g = v; return this; }
  // 4点（時計回り）＋法線＋UV
  quad(a,b,c,d, nx,ny,nz, u0,v0,u1,v1){
    const s = this.n;
    const g = this.g;
    const push = (p,u,v) => this.v.push(p[0],p[1],p[2], nx,ny,nz, u,v, g);
    push(a,u0,v0); push(b,u1,v0); push(c,u1,v1); push(d,u0,v1);
    this.i.push(s,s+1,s+2, s,s+2,s+3);
    this.n += 4;
  }
  /* 3点（三角形）。各頂点に別々のUVを配れる（信号機のレンズなど円形で特殊なケース） */
  tri(a,b,c, nx,ny,nz, u0,v0,u1,v1,u2,v2){
    const s = this.n;
    const g = this.g;
    const push = (p,u,v) => this.v.push(p[0],p[1],p[2], nx,ny,nz, u,v, g);
    push(a,u0,v0); push(b,u1,v1); push(c,u2,v2);
    this.i.push(s,s+1,s+2);
    this.n += 3;
  }
}

function carTex(){
  

  const S = 1024, M = 128;
  const c = cv(S, S), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  



  const at = (col, row, fn) => {
    g.save(); g.translate(col*M, row*M);
    g.beginPath(); g.rect(0, 0, M, M); g.clip();
    fn(g); g.restore();
  };

  
  const body = (col, row, dark, light) => at(col, row, g2 => {
    const gr = g2.createLinearGradient(0, 0, 0, M);
    gr.addColorStop(0.00, light);
    gr.addColorStop(0.45, dark);
    gr.addColorStop(1.00, dark);
    g2.fillStyle = gr; g2.fillRect(0, 0, M, M);
  });
  



  body(0, 0, '#33383e', '#4a5158');   
  body(1, 0, '#1d2a22', '#2e4034');   
  body(2, 0, '#15181d', '#282e35');   
  body(3, 0, '#1b2539', '#2c3a52');   
  body(0, 1, '#3f1a19', '#5d2725');   
  



  body(4, 1, '#e3d800', '#f6f04e');   
  body(6, 4, '#8f171b', '#c52a2f');   

  
  at(0,5,g2=>{g2.fillStyle='#101317';g2.fillRect(0,0,M,M);g2.strokeStyle='#343b40';g2.lineWidth=1.4;for(let y=0;y<M;y+=8)for(let x=(y/8%2)*4;x<M;x+=8){g2.strokeRect(x,y,5,3);}});
  at(1,5,g2=>{g2.fillStyle='#30383d';g2.fillRect(0,0,M,M);g2.fillStyle='#d6dfe4';g2.font='bold 25px Arial';g2.textAlign='center';g2.textBaseline='middle';g2.fillText('CANIAS',64,64,117);});
  at(2,5,g2=>{g2.fillStyle='#e3d800';g2.fillRect(0,0,M,M);g2.fillStyle='#293037';g2.font='bold 32px Arial';g2.textAlign='center';g2.textBaseline='middle';g2.fillText('770 S',64,64,115);});
  at(3,5,g2=>{g2.fillStyle='#252c30';g2.fillRect(0,0,M,M);g2.fillStyle='#647077';for(let y=4;y<M;y+=12)for(let x=4;x<M;x+=10)g2.fillRect(x,y,5,3);});
  at(4,5,g2=>{g2.fillStyle='#3f1a19';g2.fillRect(0,0,M,M);g2.fillStyle='#d6dfe4';g2.font='bold 32px Arial';g2.textAlign='center';g2.textBaseline='middle';g2.fillText('770 S',64,64,115);});

  
  body(0, 4, '#64707b', '#adb5bd'); 
  body(3, 4, '#e3d800', '#f6f04e'); 
  body(4, 4, '#101317', '#262c32'); 
  body(5, 4, '#ced3d5', '#f1f2f0'); 
  body(7, 4, '#dfff00', '#f1ff70');
  at(2, 4, g2 => {
    const gr=g2.createLinearGradient(0,0,0,M);
    gr.addColorStop(0,'#1d2733'); gr.addColorStop(1,'#080c11');
    g2.fillStyle=gr; g2.fillRect(0,0,M,M);
  });
  at(1, 4, g2 => {
    const gr=g2.createLinearGradient(0,0,0,M);
    gr.addColorStop(0,'#dbe3e7'); gr.addColorStop(.46,'#b8c4cc');
    gr.addColorStop(.52,'#53616c'); gr.addColorStop(1,'#96a5b0');
    g2.fillStyle=gr; g2.fillRect(0,0,M,M);
  });

  
  at(1, 1, g2 => {
    const gr = g2.createLinearGradient(0, 0, 0, M);
    gr.addColorStop(0, '#1d2733'); gr.addColorStop(1, '#080c11');
    g2.fillStyle = gr; g2.fillRect(0, 0, M, M);
  });
  
  at(2, 1, g2 => { g2.fillStyle = '#090a0c'; g2.fillRect(0, 0, M, M); });
  
  at(1, 2, g2 => {
    g2.fillStyle = '#5e1210'; g2.fillRect(0, 0, M, M);
    g2.fillStyle = 'rgba(255,90,70,.30)';
    for(let i = 0; i < 4; i++) g2.fillRect(0, i*M/4 + 4, M, M/8);
  });
  
  at(3, 1, g2 => {
    g2.fillStyle = '#aeb8c2'; g2.fillRect(0, 0, M, M);
    g2.strokeStyle = 'rgba(255,255,255,.55)'; g2.lineWidth = 3;
    for(let i = 1; i < 5; i++){ g2.beginPath(); g2.moveTo(i*M/5, 6); g2.lineTo(i*M/5, M-6); g2.stroke(); }
  });

  
  const glow = (col, row, r, gg, b, p) => at(col, row, g2 => {
    const gr = g2.createRadialGradient(M/2, M/2, 0, M/2, M/2, M/2);
    for(let i = 0; i <= 12; i++){
      const t = i/12, k = Math.pow(1 - t, p);
      gr.addColorStop(t, 'rgb(' + Math.round(r*k) + ',' + Math.round(gg*k) + ',' + Math.round(b*k) + ')');
    }
    g2.fillStyle = gr; g2.fillRect(0, 0, M, M);
  });
  glow(2, 2, 255, 250, 232, 1.9);   
  glow(3, 2, 255, 246, 214, 2.7);   
  glow(0, 3, 255,  46,  28, 2.2);   
  glow(2, 3, 150, 152, 158, 1.4);   
  glow(7, 0, 255, 150,  22, 2.2);   

  



  at(3, 3, g2 => {
    g2.save(); g2.scale(1, 2);              
    g2.fillStyle = '#eceee9'; g2.fillRect(0, 0, M, M/2);
    g2.strokeStyle = '#0f6b3a'; g2.lineWidth = 3;
    g2.strokeRect(3, 3, M-6, M/2-6);
    g2.fillStyle = '#0f6b3a';
    g2.fillRect(24, 11, M-48, 5);           
    g2.font = 'bold 30px sans-serif';
    g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.fillText('9000', M/2, M/2*0.68);     
    g2.restore();
  });
  


  
  at(4, 0, g2 => {
    


    g2.fillStyle = '#000'; g2.fillRect(0, 0, M, M);
    
    g2.fillStyle = '#f2c21a';
    g2.beginPath();
    

    g2.moveTo(M*0.12, M*0.50); g2.lineTo(M*0.48, M*0.16); g2.lineTo(M*0.48, M*0.36);
    g2.lineTo(M*0.90, M*0.36); g2.lineTo(M*0.90, M*0.64); g2.lineTo(M*0.48, M*0.64);
    g2.lineTo(M*0.48, M*0.84); g2.closePath(); g2.fill();
  });
  
  at(5, 0, g2 => {
    g2.fillStyle = '#e8e8e4'; g2.fillRect(0, 0, M, M);
    g2.fillStyle = '#cc1a12';
    g2.save(); g2.translate(0, 0);
    for(let i = -M; i < M*2; i += 34){
      g2.beginPath();
      g2.moveTo(i, 0); g2.lineTo(i + 17, 0); g2.lineTo(i + 17 + M, M); g2.lineTo(i + M, M);
      g2.closePath(); g2.fill();
    }
    g2.restore();
  });
  
  at(6, 0, g2 => {
    const gr = g2.createLinearGradient(0, 0, 0, M);
    gr.addColorStop(0, '#ffb43a'); gr.addColorStop(1, '#c96a06');
    g2.fillStyle = gr; g2.fillRect(0, 0, M, M);
    g2.strokeStyle = 'rgba(255,255,255,.35)'; g2.lineWidth = 3;
    for(let i = 1; i < 4; i++){ g2.beginPath(); g2.moveTo(0, i*M/4); g2.lineTo(M, i*M/4); g2.stroke(); }
  });

  
  at(1, 3, g2 => {
    g2.fillStyle = '#c2170f'; g2.fillRect(0, 0, M, M);
    g2.fillStyle = 'rgba(255,120,100,.45)';
    for(let y = 0; y < M; y += 16)
      for(let x = ((y/16) % 2) * 8; x < M; x += 16) g2.fillRect(x, y, 8, 8);
    g2.strokeStyle = 'rgba(0,0,0,.45)'; g2.lineWidth = 4;
    g2.strokeRect(2, 2, M-4, M-4);
  });

  return c;
}


function CUV(col, row){
  const e = 0.007;                      
  return [col/8 + e, row/8 + e, (col+1)/8 - e, (row+1)/8 - e];
}

const CARKIND = {
  
  sedan: {
    W: 0.8725,                    
    L: 2.2475,                    
    yU: 0.130,                    
    yB: -0.1875,                  
    yT: 1.435,                    
    yC: 1.435,                    
    axleF: 1.605,                 
    axleB: -1.035,                
    tireR: 0.3175,                
    belt: 1.035,                  
                                  
    sill: 0.36,                   
                                  
    treadF: 0.755,                
    treadR: 0.760,                
    cabF: 0.611,                  
    cabB: -1.528,                 
    cabF2: 0.059,                 
    cabB2: -1.222,                
    hoodB: -0.20,                 
    trunkF: 2.00,                 
    lampY: [0.62, 0.86],          
    lampX: [0.26, 0.76],          
  },
  
  van: {
    W: 0.8475,                    
    L: 2.3425,                    
    yU: 0.155,                    
    yB: -0.1815,                  
    yT: 1.98,     
    yC: 1.96,     
    axleF: 1.300,                 
    axleB: -1.300,
    tireR: 0.3365,                
    sill: 0.60,                   
    treadF: 0.6975,               
    treadR: 0.620,                
    cabF: 2.3425, 
    cabB: 0.88,   
    boxF: 0.88,   
    boxB: -2.3425,                
    boxY0: 0.86,  
    boxY1: 2.62,  
    lampY: [0.66, 0.92],          
    lampX: [0.30, 0.86],          
  },
  

  kei: {
    W: 0.7375,                    
    L: 1.6975,                    
    yU: 0.145,                    
    yB: -0.14,
    yT: 1.79, yC: 1.79,           
    axleF: 1.2575,                
    axleB: -1.2625,               
    tireR: 0.2865,
    belt: 1.16,                   
    sill: 0.33,
    treadF: 0.650, treadR: 0.645,
    cabF: 1.02,  cabB: -1.60,     
    cabF2: 0.74, cabB2: -1.58,    
    lampY: [0.74, 1.00],
    lampX: [0.20, 0.58],
  },
};


 CARKIND.work = Object.assign({}, CARKIND.van, {
  deckY : 0.86,
  gateY : 1.24,          
  frameY: [0.62, 0.86],  
  beacon: [1.98, 2.10],  
  boardY: [1.36, 2.00],  
  boardW: 0.65,          
});
CARKIND.unic = Object.assign({}, CARKIND.work, {
  W:.90,L:2.895,yT:2.735,yC:2.735,axleF:1.780,axleB:-1.560,
  treadF:.75,treadR:.67,deckY:.93,gateY:1.35,beacon:[2.18,2.41],
  lampY:[.70,.98],lampX:[.50,.82]
});

const UNIC3T_SPEC=Object.freeze({W:.90,L:2.3425,cabF:2.3425,cabB:.88,boxF:.10,boxB:-3.30,axleF:1.300,axleB:-2.04,treadF:.75,treadR:.67,deckY:.93,gateY:1.35});





const TRUCK_CAB_SPEC=Object.freeze({
  version:'20260905-photo-cab-1',
  halfWidth:.855,
  beltHalfWidth:.842,
  shoulderHalfWidth:.812,
  roofHalfWidth:.785,
  roofY:2.13,
  beaconMountY:2.145,
  windshieldBottomY:1.275,
  windshieldTopY:2.005,
  frontPanelTopY:1.235,
  mirrorOuterHalfWidth:1.18,
  nearDistance:90,
  farDistance:160
});

function pushNBoxBody(mb, c, K, P){
  const S=Math.sin(c.head), C=Math.cos(c.head);
  
  const N=c._roadNormalTransform||((x,y,z)=>[-x*C+z*S,y,x*S+z*C]);
  
  
  const B=c.nboxPaint==='dark-gray'?CUV(0,0):CUV(3,4), GLASS=CUV(2,4), DARK=CUV(2,1);
  const LENS=CUV(3,1), TAIL=CUV(1,2), PLATE=CUV(3,3), REFLEX=CUV(1,3);
  const RIM=CUV(0,4), CHROME=CUV(1,4); 
  const W=K.W, L=K.L, sill=K.sill, belt=K.belt, roof=K.yC;
  const draft=studioDraftFor(c);
  
  const roofColor=(draft&&draft.roofColor)||c.roofColor||'black';
  const ROOF=CUV(roofColor==='white'?5:4,4);
  const noseChamfer=Math.max(0, draft ? draft.noseChamfer : 0.28);
  
  const noseZ=L-Math.min(.120,noseChamfer*(.120/.280));
  const hoodZ=K.cabF+.060, hoodY=1.075+Math.min(.025,noseChamfer*.075);
  const uvCenter=(uv,p=0.18)=>[uv[0]+(uv[2]-uv[0])*p,uv[1]+(uv[3]-uv[1])*p,
                                uv[2]-(uv[2]-uv[0])*p,uv[3]-(uv[3]-uv[1])*p];
  const quad=(uv,n,a,b,d,e,small=false)=>{
    const nl=Math.hypot(n[0],n[1],n[2])||1;
    const nn=N(n[0]/nl,n[1]/nl,n[2]/nl), u=small?uvCenter(uv):uv;
    mb.quad(P(...a),P(...b),P(...d),P(...e),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
  };
  

  const smoothQuad=(uv,a,b,d,e,na,nb,nd,ne,small=false)=>{
    const u=small?uvCenter(uv):uv, s=mb.n, g=mb.g;
    const put=(p,n,uu,vv)=>{
      const nl=Math.hypot(n[0],n[1],n[2])||1;
      const nn=N(n[0]/nl,n[1]/nl,n[2]/nl), q=P(...p);
      mb.v.push(q[0],q[1],q[2],nn[0],nn[1],nn[2],uu,vv,g);
    };
    put(a,na,u[0],u[3]); put(b,nb,u[2],u[3]);
    put(d,nd,u[2],u[1]); put(e,ne,u[0],u[1]);
    mb.i.push(s,s+1,s+2,s,s+2,s+3); mb.n+=4;
  };
  const tri=(uv,n,a,b,d,small=true)=>{
    const nl=Math.hypot(n[0],n[1],n[2])||1;
    const nn=N(n[0]/nl,n[1]/nl,n[2]/nl), u=small?uvCenter(uv):uv;
    mb.tri(P(...a),P(...b),P(...d),nn[0],nn[1],nn[2],
      (u[0]+u[2])/2,(u[1]+u[3])/2,u[0],u[3],u[2],u[3]);
  };
  
  const sidePaintUV=(p)=>{
    const clamp=v=>Math.max(0,Math.min(1,v));
    const tu=clamp((p[2]+L)/(2*L)), tv=clamp((p[1]-sill)/(roof-sill));
    return [B[0]+(B[2]-B[0])*tu,B[3]-(B[3]-B[1])*tv];
  };
  const sidePaintQuad=(n,a,b,d,e)=>{
    const nl=Math.hypot(n[0],n[1],n[2])||1, nn=N(n[0]/nl,n[1]/nl,n[2]/nl);
    const s=mb.n,g=mb.g;
    const put=(p)=>{
      const q=P(...p), u=sidePaintUV(p);
      mb.v.push(q[0],q[1],q[2],nn[0],nn[1],nn[2],u[0],u[1],g);
    };
    put(a); put(b); put(d); put(e);
    mb.i.push(s,s+1,s+2,s,s+2,s+3); mb.n+=4;
  };
  const sidePaintSmoothQuad=(a,b,d,e,na,nb,nd,ne)=>{
    const s=mb.n,g=mb.g;
    const put=(p,n)=>{
      const nl=Math.hypot(n[0],n[1],n[2])||1, nn=N(n[0]/nl,n[1]/nl,n[2]/nl);
      const q=P(...p),u=sidePaintUV(p);
      mb.v.push(q[0],q[1],q[2],nn[0],nn[1],nn[2],u[0],u[1],g);
    };
    put(a,na); put(b,nb); put(d,nd); put(e,ne);
    mb.i.push(s,s+1,s+2,s,s+2,s+3); mb.n+=4;
  };
  const side=(sg,uv,y0,y1,z0,z1,small=false)=>
    quad(uv,[sg,0,0],[sg*W,y0,z0],[sg*W,y0,z1],[sg*W,y1,z1],[sg*W,y1,z0],small);
  const slab=(x0,x1,y0,y1,z0,z1,uv)=>{
    quad(uv,[0,0,1],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);
    quad(uv,[0,0,-1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]);
    quad(uv,[-1,0,0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]);
    quad(uv,[1,0,0],[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]);
    quad(uv,[0,1,0],[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]);
    quad(uv,[0,-1,0],[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1]);
  };
  mb.grade(0);

  
  const wheel=(ax,tr)=>{
    
    const sg=tr<0?-1:1, out=sg*(Math.abs(tr)+0.0775), inside=sg*(Math.abs(tr)-0.0775);
    const cy=K.tireR, r=K.tireR, sides=24, rimR=0.168;
    const nSide=[sg,0,0], tireUV=uvCenter(DARK), rimUV=uvCenter(DARK), chromeUV=uvCenter(CHROME);
    
    const shoulderW=.028, sideDrop=.010;
    for(let i=0;i<sides;i++){
      const a0=i*Math.PI*2/sides,a1=(i+1)*Math.PI*2/sides;
      const radial=(rr,a,x)=>[x,cy+rr*Math.sin(a),ax+rr*Math.cos(a)];
      const p0=radial(r-sideDrop,a0,out), p1=radial(r-sideDrop,a1,out);
      const q0=radial(r-sideDrop,a0,inside), q1=radial(r-sideDrop,a1,inside);
      const s0=radial(r,a0,out-sg*shoulderW), s1=radial(r,a1,out-sg*shoulderW);
      const t0=radial(r,a0,inside+sg*shoulderW), t1=radial(r,a1,inside+sg*shoulderW);
      const h0=[out,cy+rimR*Math.sin(a0),ax+rimR*Math.cos(a0)], h1=[out,cy+rimR*Math.sin(a1),ax+rimR*Math.cos(a1)];
      const nn=N(...nSide);
      
      const u=tireUV;
      if(sg>0) mb.quad(P(...h0),P(...h1),P(...p1),P(...p0),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
      else     mb.quad(P(...p0),P(...p1),P(...h1),P(...h0),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
      const mid=(a0+a1)/2, sy=Math.sin(mid), sz=Math.cos(mid);
      
      smoothQuad(DARK,p0,p1,s1,s0,[sg*.92,sy*.32,sz*.32],[sg*.92,sy*.32,sz*.32],
                 [sg*.33,sy*.94,sz*.94],[sg*.33,sy*.94,sz*.94],true);
      quad(DARK,[0,sy,sz],s0,s1,t1,t0,true);
      smoothQuad(DARK,t0,t1,q1,q0,[-sg*.33,sy*.94,sz*.94],[-sg*.33,sy*.94,sz*.94],
                 [-sg*.92,sy*.32,sz*.32],[-sg*.92,sy*.32,sz*.32],true);
    }
    
    const fx=out+sg*0.003;
    for(let i=0;i<sides;i++){
      const a0=i*Math.PI*2/sides,a1=(i+1)*Math.PI*2/sides;
      const p0=[fx,cy+rimR*Math.sin(a0),ax+rimR*Math.cos(a0)],p1=[fx,cy+rimR*Math.sin(a1),ax+rimR*Math.cos(a1)];
      const nn=N(...nSide);
      const cu=(rimUV[0]+rimUV[2])/2,cv=(rimUV[1]+rimUV[3])/2;
      if(sg>0) mb.tri(P(fx,cy,ax),P(...p1),P(...p0),nn[0],nn[1],nn[2],cu,cv,rimUV[0],rimUV[3],rimUV[2],rimUV[3]);
      else     mb.tri(P(fx,cy,ax),P(...p0),P(...p1),nn[0],nn[1],nn[2],cu,cv,rimUV[0],rimUV[3],rimUV[2],rimUV[3]);
    }
    
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5, da=0.085, r0=0.040, r1=0.150;
      const pt=(rr,aa)=>[fx+sg*0.002,cy+rr*Math.sin(aa),ax+rr*Math.cos(aa)];
      const nn=N(...nSide), u=chromeUV;
      const a0=pt(r0,a-da),a1=pt(r1,a-da),a2=pt(r1,a+da),a3=pt(r0,a+da);
      if(sg>0) mb.quad(P(...a0),P(...a1),P(...a2),P(...a3),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
      else     mb.quad(P(...a3),P(...a2),P(...a1),P(...a0),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
    }
    
    const hubR=.047, hubX=fx+sg*.003, nn=N(...nSide), u=chromeUV;
    for(let i=0;i<12;i++){
      const a0=i*Math.PI/6,a1=(i+1)*Math.PI/6;
      const p0=[hubX,cy+hubR*Math.sin(a0),ax+hubR*Math.cos(a0)];
      const p1=[hubX,cy+hubR*Math.sin(a1),ax+hubR*Math.cos(a1)];
      if(sg>0) mb.tri(P(hubX,cy,ax),P(...p1),P(...p0),nn[0],nn[1],nn[2],u[0],u[1],u[0],u[3],u[2],u[3]);
      else     mb.tri(P(hubX,cy,ax),P(...p0),P(...p1),nn[0],nn[1],nn[2],u[0],u[1],u[0],u[3],u[2],u[3]);
    }
  };
  wheel(K.axleF,K.treadF); wheel(K.axleF,-K.treadF); wheel(K.axleB,K.treadR); wheel(K.axleB,-K.treadR);

  
  const faceTop=1.045, corner=0.12;
  const hoodMidZ=(L+noseZ)/2, hoodMidY=faceTop+.012;
  const hoodSlopeZ=(noseZ+hoodZ)/2, hoodSlopeY=(faceTop+hoodY)/2+.008;
  const hoodOuterMidY=(faceTop+hoodY-.018)/2+.008;
  
  const sideTopYAtZ=(z)=>{
    const lerp=(z0,y0,z1,y1)=>y0+(y1-y0)*Math.max(0,Math.min(1,(z-z0)/(z1-z0)));
    if(z<=K.cabF) return belt;
    if(z<=hoodZ) return lerp(K.cabF,belt,hoodZ,hoodY-.018);
    if(z<=hoodSlopeZ) return lerp(hoodZ,hoodY-.018,hoodSlopeZ,hoodOuterMidY);
    if(z<=noseZ) return lerp(hoodSlopeZ,hoodOuterMidY,noseZ,faceTop);
    return faceTop;
  };
  quad(B,[0,0,1],[-.58,sill,L],[.58,sill,L],[.58,faceTop,L],[-.58,faceTop,L]);
  quad(B,[0,0,-1],[.58,sill,-L],[-.58,sill,-L],[-.58,1.18,-L],[.58,1.18,-L]);
  for(const sg of [-1,1]){
    
    for(let i=0;i<4;i++){
      const a0=i*Math.PI/8,a1=(i+1)*Math.PI/8;
      const p=(a)=>[sg*(.58+(W-.58)*Math.sin(a)),L-corner*(1-Math.cos(a))];
      const n=(a)=>[sg*Math.sin(a),0,Math.cos(a)];
      const p0=p(a0),p1=p(a1),n0=n(a0),n1=n(a1);
      sidePaintSmoothQuad([p0[0],sill,p0[1]],[p1[0],sill,p1[1]],
                          [p1[0],faceTop,p1[1]],[p0[0],faceTop,p0[1]],n0,n1,n1,n0);
    }
    for(let i=0;i<4;i++){
      const a0=i*Math.PI/8,a1=(i+1)*Math.PI/8;
      const p=(a)=>[sg*(.58+(W-.58)*Math.cos(a)),-L+corner*(1-Math.sin(a))];
      const n=(a)=>[sg*Math.cos(a),0,-Math.sin(a)];
      const p0=p(a0),p1=p(a1),n0=n(a0),n1=n(a1);
      sidePaintSmoothQuad([p0[0],sill,p0[1]],[p1[0],sill,p1[1]],
                          [p1[0],1.18,p1[1]],[p0[0],1.18,p0[1]],n0,n1,n1,n0);
    }
    
    const archR=.320, fill=(z0,z1,y0=sill,y1=sill)=>{
      
      if(Math.abs(z1-z0)<1e-9) return;
      const cuts=[z0,...[K.cabF,hoodZ,hoodSlopeZ,noseZ]
        .filter(z=>z>z0+1e-9&&z<z1-1e-9),z1];
      for(let j=0;j<cuts.length-1;j++){
        const a=cuts[j],b=cuts[j+1];
        const ya=y0+(y1-y0)*(a-z0)/(z1-z0), yb=y0+(y1-y0)*(b-z0)/(z1-z0);
        sidePaintQuad([sg,0,0],[sg*W,ya,a],[sg*W,yb,b],
                      [sg*W,sideTopYAtZ(b),b],[sg*W,sideTopYAtZ(a),a]);
      }
    };
    fill(-L+corner,K.axleB-archR);
    for(let i=0;i<8;i++){
      const a0=Math.PI-i*Math.PI/8,a1=Math.PI-(i+1)*Math.PI/8;
      fill(K.axleB+archR*Math.cos(a0),K.axleB+archR*Math.cos(a1),sill+archR*Math.sin(a0),sill+archR*Math.sin(a1));
    }
    fill(K.axleB+archR,K.axleF-archR);
    for(let i=0;i<8;i++){
      const a0=Math.PI-i*Math.PI/8,a1=Math.PI-(i+1)*Math.PI/8;
      fill(K.axleF+archR*Math.cos(a0),K.axleF+archR*Math.cos(a1),sill+archR*Math.sin(a0),sill+archR*Math.sin(a1));
    }
    fill(K.axleF+archR,L-corner);

    
    for(const ax of [K.axleB,K.axleF]){
      const ro=.334,ri=.307;
      for(let i=0;i<12;i++){
        const a0=Math.PI-i*Math.PI/12,a1=Math.PI-(i+1)*Math.PI/12;
        const p=(r,a)=>[sg*(W+.005),sill+r*Math.sin(a),ax+r*Math.cos(a)];
        quad(B,[sg,.16*Math.sin((a0+a1)/2),.16*Math.cos((a0+a1)/2)],
             p(ro,a0),p(ro,a1),p(ri,a1),p(ri,a0),true);
      }
    }
    
    sidePaintQuad([sg,.28,0],[sg*(W+.004),belt-.17,-L+corner],
                  [sg*(W+.004),belt-.17,hoodZ],
                  [sg*(W-.010),belt-.09,hoodZ],[sg*(W-.010),belt-.09,-L+corner]);
    quad(DARK,[sg,-.18,0],[sg*(W+.003),sill+.035,-.72],[sg*(W+.003),sill+.035,.72],
         [sg*(W-.006),sill+.095,.72],[sg*(W-.006),sill+.095,-.72],true);
  }
  
  smoothQuad(B,[-.58,faceTop,L],[.58,faceTop,L],[.58,hoodMidY,hoodMidZ],[-.58,hoodMidY,hoodMidZ],
             [0,.90,.44],[0,.90,.44],[0,.98,.20],[0,.98,.20]);
  smoothQuad(B,[-.58,hoodMidY,hoodMidZ],[.58,hoodMidY,hoodMidZ],[.58,faceTop,noseZ],[-.58,faceTop,noseZ],
             [0,.98,.20],[0,.98,.20],[0,1,.03],[0,1,.03]);
  smoothQuad(B,[-.58,faceTop,noseZ],[.58,faceTop,noseZ],[.61,hoodSlopeY,hoodSlopeZ],[-.61,hoodSlopeY,hoodSlopeZ],
             [0,1,.03],[0,1,.03],[0,.96,.28],[0,.96,.28]);
  smoothQuad(B,[-.61,hoodSlopeY,hoodSlopeZ],[.61,hoodSlopeY,hoodSlopeZ],[.64,hoodY,hoodZ],[-.64,hoodY,hoodZ],
             [0,.96,.28],[0,.96,.28],[0,.88,.48],[0,.88,.48]);
  
  smoothQuad(B,[-W,faceTop,noseZ],[-.58,faceTop,noseZ],[-.61,hoodSlopeY,hoodSlopeZ],[-W,hoodOuterMidY,hoodSlopeZ],
             [-1,.22,.04],[0,1,.03],[0,.96,.28],[-1,.28,.12]);
  smoothQuad(B,[-W,hoodOuterMidY,hoodSlopeZ],[-.61,hoodSlopeY,hoodSlopeZ],[-.64,hoodY,hoodZ],[-W,hoodY-.018,hoodZ],
             [-1,.28,.12],[0,.96,.28],[0,.88,.48],[-1,.24,.10]);
  smoothQuad(B,[W,faceTop,noseZ],[W,hoodOuterMidY,hoodSlopeZ],[.61,hoodSlopeY,hoodSlopeZ],[.58,faceTop,noseZ],
             [1,.22,.04],[1,.28,.12],[0,.96,.28],[0,1,.03]);
  smoothQuad(B,[W,hoodOuterMidY,hoodSlopeZ],[W,hoodY-.018,hoodZ],[.64,hoodY,hoodZ],[.61,hoodSlopeY,hoodSlopeZ],
             [1,.28,.12],[1,.24,.10],[0,.88,.48],[0,.96,.28]);
  
  quad(DARK,[0,0,1],[-.42,.675,L+.016],[.42,.675,L+.016],[.42,.800,L+.016],[-.42,.800,L+.016],true);
  quad(CHROME,[0,0,1],[-.46,.842,L+.018],[.46,.842,L+.018],[.46,.874,L+.018],[-.46,.874,L+.018],true);
  quad(DARK,[0,0,1],[-.50,.430,L+.017],[.50,.430,L+.017],[.50,.555,L+.017],[-.50,.555,L+.017],true);

  
  const rw=.640, winY0=belt+.010, winY1=roof-.075;
  const frontBase=K.cabF, roofFront=K.cabF2;
  const rearBase=-L+.055, roofRear=-L+.110;
  
  const frontZAtY=(y)=>{
    const t=Math.max(0,Math.min(1,(y-winY0)/(winY1-winY0)));
    return frontBase+(roofFront-frontBase)*t;
  };
  const cabinX=(sg,y)=>{
    const t=Math.max(0,Math.min(1,(y-winY0)/(winY1-winY0)));
    return sg*((W-.012)+(rw-(W-.012))*t);
  };
  const cp=(sg,y,z,offset=0)=>[cabinX(sg,y)+sg*offset,y,z];
  
  const bp=(sg,y,z,offset=.003)=>[sg*(W+offset),y,z];

  
  quad(B,[0,.54,.84],[-.64,hoodY,hoodZ],[.64,hoodY,hoodZ],
       [cabinX(1,winY0),winY0,frontBase],[cabinX(-1,winY0),winY0,frontBase]);
  
  quad(B,[0,.46,-.89],[.58,1.18,-L],[-.58,1.18,-L],
       [cabinX(-1,winY0),winY0,rearBase],[cabinX(1,winY0),winY0,rearBase]);

  
  quad(DARK,[0,.46,.89],[cabinX(-1,winY0),winY0,frontBase],[cabinX(1,winY0),winY0,frontBase],
       [cabinX(1,winY1),winY1,roofFront],[cabinX(-1,winY1),winY1,roofFront]);
  quad(B,[0,.10,-.995],[cabinX(1,winY0),winY0,rearBase],[cabinX(-1,winY0),winY0,rearBase],
       [cabinX(-1,winY1),winY1,roofRear],[cabinX(1,winY1),winY1,roofRear]);
  const frontGlassY0=winY0+.030, frontGlassY1=winY1-.025, frontGlassOffset=.003;
  quad(GLASS,[0,.46,.89],[-.535,frontGlassY0,frontZAtY(frontGlassY0)+frontGlassOffset],
       [.535,frontGlassY0,frontZAtY(frontGlassY0)+frontGlassOffset],
       [.535,frontGlassY1,frontZAtY(frontGlassY1)+frontGlassOffset],
       [-.535,frontGlassY1,frontZAtY(frontGlassY1)+frontGlassOffset],true);
  quad(GLASS,[0,.10,-.995],[.535,winY0+.050,rearBase-.006],[-.535,winY0+.050,rearBase-.006],
       [-.535,winY1-.035,roofRear-.006],[.535,winY1-.035,roofRear-.006],true);

  
  const topW=rw-.045, topF=roofFront-.055, topB=roofRear-.045;
  const roofRows=[
    {x:cabinX(1,winY1),y:winY1,n:[.970,.243,0]},
    {x:.628,y:1.744,n:[.820,.572,0]},
    {x:.608,y:1.775,n:[.450,.893,0]},
    {x:topW,y:roof,n:[0,1,0]}
  ];
  
  
  const frontZ=[roofFront,roofFront-.015,roofFront-.033,topF];
  const roofRearZ=[roofRear,roofRear-.017,roofRear-.033,topB];
  const endNormal=(sg,i,back=false)=>{
    const nx=[.55,.40,.18,0][i];
    
    const ny=(back?[.20,.58,.88,1]:[.46,.48,.71,1])[i];
    const nz=(back?[.81,.71,.47,0]:[.89,.87,.71,0])[i];
    return [sg*nx,ny,back?-nz:nz];
  };
  for(const sg of [-1,1]){
    
    for(let i=0;i<roofRows.length-1;i++){
      const a=roofRows[i],b=roofRows[i+1];
      smoothQuad(ROOF,[sg*a.x,a.y,roofRearZ[i]],[sg*a.x,a.y,frontZ[i]],
                 [sg*b.x,b.y,frontZ[i+1]],[sg*b.x,b.y,roofRearZ[i+1]],
                 endNormal(sg,i,true),endNormal(sg,i),endNormal(sg,i+1),endNormal(sg,i+1,true));
    }
  }
  
  for(const sg of [-1,1]){
    for(let i=0;i<4;i++){
      const a0=i*Math.PI/8,a1=(i+1)*Math.PI/8;
      const p=(a)=>[sg*(.58+(W-.58)*Math.sin(a)),
                    L-corner*(1-Math.cos(a))+.006*Math.cos(a)];
      const n=(a)=>[sg*Math.sin(a),.18,Math.cos(a)];
      const p0=p(a0),p1=p(a1),n0=n(a0),n1=n(a1);
      smoothQuad(B,[p0[0],.350,p0[1]],[p1[0],.350,p1[1]],[p1[0],.480,p1[1]],[p0[0],.480,p0[1]],n0,n1,n1,n0,true);
    }
  }
  for(let i=0;i<roofRows.length-1;i++){
    const a=roofRows[i],b=roofRows[i+1];
    smoothQuad(ROOF,[-a.x,a.y,frontZ[i]],[a.x,a.y,frontZ[i]],[b.x,b.y,frontZ[i+1]],[-b.x,b.y,frontZ[i+1]],
               endNormal(-1,i),endNormal(1,i),endNormal(1,i+1),endNormal(-1,i+1));
    smoothQuad(ROOF,[a.x,a.y,roofRearZ[i]],[-a.x,a.y,roofRearZ[i]],[-b.x,b.y,roofRearZ[i+1]],[b.x,b.y,roofRearZ[i+1]],
               endNormal(1,i,true),endNormal(-1,i,true),endNormal(-1,i+1,true),endNormal(1,i+1,true));
  }
  quad(ROOF,[0,1,0],[-topW,roof,topB],[-topW,roof,topF],[topW,roof,topF],[topW,roof,topB]);

  for(const sg of [-1,1]){
    const n=[sg,0,0], go=.004, trim=.007;
    
    sidePaintQuad([sg,.12,-.10],[sg*W,belt,-L+corner],[sg*W,belt,rearBase],
                  cp(sg,winY0,rearBase),[sg*W,1.18,-L+corner]);
    
    sidePaintQuad(n,cp(sg,winY0,rearBase),cp(sg,winY0,frontBase),
                  cp(sg,winY1,roofFront),cp(sg,winY1,roofRear));
    sidePaintQuad([sg,.22,0],[sg*W,belt,rearBase],[sg*W,belt,frontBase],
                  cp(sg,winY0,frontBase),cp(sg,winY0,rearBase));
    
    sidePaintQuad([sg,.34,.18],[sg*W,belt,frontBase],[sg*W,hoodY-.018,hoodZ],
                  [sg*.64,hoodY,hoodZ],cp(sg,winY0,frontBase));

    const fBot=.195, fTop=.080, rBot=.105, rTop=.010;
    const sideGlassY0=winY0+.018, sideGlassY1=winY1-.035, sideFrontInset=.035;
    quad(GLASS,n,cp(sg,sideGlassY0,frontZAtY(sideGlassY0)-sideFrontInset,go),cp(sg,sideGlassY0,fBot,go),
         cp(sg,sideGlassY1,fTop,go),cp(sg,sideGlassY1,frontZAtY(sideGlassY1)-sideFrontInset,go));
    quad(GLASS,n,cp(sg,winY0+.018,rBot,go),cp(sg,winY0+.018,rearBase+.080,go),
         cp(sg,winY1-.035,roofRear+.075,go),cp(sg,winY1-.035,rTop,go));
    
    
    const aPillarY0=winY0+.010, aPillarY1=winY1-.026;
    quad(DARK,n,cp(sg,aPillarY0,frontZAtY(aPillarY0)-.020,trim),cp(sg,aPillarY0,frontZAtY(aPillarY0)-.075,trim),
         cp(sg,aPillarY1,frontZAtY(aPillarY1)-.075,trim),cp(sg,aPillarY1,frontZAtY(aPillarY1)-.020,trim),true);
    quad(DARK,n,cp(sg,winY0+.010,rBot-.010,trim),cp(sg,winY0+.010,fBot+.010,trim),
         cp(sg,winY1-.026,fTop+.010,trim),cp(sg,winY1-.026,rTop-.010,trim),true);
    
    quad(DARK,n,cp(sg,winY0+.012,-.980,trim),cp(sg,winY0+.012,-1.030,trim),
         cp(sg,winY1-.030,-1.030,trim),cp(sg,winY1-.030,-.980,trim),true);
    
    quad(B,n,cp(sg,winY0+.010,rearBase+.070,trim),cp(sg,winY0+.010,rearBase+.120,trim),
         cp(sg,winY1-.026,roofRear+.115,trim),cp(sg,winY1-.026,roofRear+.065,trim),true);
    
    tri(B,n,cp(sg,winY0+.020,rearBase+.082,trim+.002),
        cp(sg,winY0+.020,rearBase+.245,trim+.002),
        cp(sg,winY0+.175,rearBase+.082,trim+.002));
    
    const visorY0=winY1-.042, visorY1=winY1+.010;
    quad(DARK,n,cp(sg,visorY0,roofRear+.065,trim),cp(sg,visorY0,frontZAtY(visorY0)-.020,trim),
         cp(sg,visorY1,frontZAtY(visorY1)-.020,trim),cp(sg,visorY1,roofRear+.065,trim),true);

    const lineVisible=!draft || draft.windowLineVisible;
    if(lineVisible){
      const ly=belt+(draft?draft.windowLineOffset:0), th=draft?draft.windowLineThickness:.032;
      quad(DARK,n,bp(sg,ly-th/2,rearBase+.055,.005),bp(sg,ly-th/2,frontBase-.030,.005),
           bp(sg,ly+th/2,frontBase-.030,.005),bp(sg,ly+th/2,rearBase+.055,.005),true);
    }
    
    quad(DARK,n,bp(sg,belt-.56,-1.065),bp(sg,belt-.56,-1.060),
         bp(sg,belt-.012,-1.060),bp(sg,belt-.012,-1.065),true);
    
    quad(DARK,n,bp(sg,sill+.025,.0775,.006),bp(sg,sill+.025,.0825,.006),
         bp(sg,belt-.010,.0825,.006),bp(sg,belt-.010,.0775,.006),true);
    
    const railY=.820, railHalf=.005;
    quad(DARK,n,bp(sg,railY-railHalf,-1.580,.006),bp(sg,railY-railHalf,-1.050,.006),
         bp(sg,railY+railHalf,-1.050,.006),bp(sg,railY+railHalf,-1.580,.006),true);
    
    quad(DARK,n,bp(sg,belt-.143,-.117,.004),bp(sg,belt-.143,.057,.004),
         bp(sg,belt-.102,.057,.004),bp(sg,belt-.102,-.117,.004),true);
    quad(B,n,bp(sg,belt-.140,-.115,.009),bp(sg,belt-.140,.055,.009),
         bp(sg,belt-.105,.055,.009),bp(sg,belt-.105,-.115,.009),true);
    quad(DARK,n,bp(sg,belt-.143,.103,.004),bp(sg,belt-.143,.277,.004),
         bp(sg,belt-.102,.277,.004),bp(sg,belt-.102,.103,.004),true);
    quad(B,n,bp(sg,belt-.140,.105,.009),bp(sg,belt-.140,.275,.009),
         bp(sg,belt-.105,.275,.009),bp(sg,belt-.105,.105,.009),true);
    
    if(sg>0){
      const fuelZ=-1.370, fuelY=1.000, fuelR=.095;
      for(let i=0;i<8;i++){
        const a0=i*Math.PI/4,a1=(i+1)*Math.PI/4;
        tri(B,n,bp(sg,fuelY,fuelZ,.006),
            bp(sg,fuelY+fuelR*Math.sin(a0),fuelZ+fuelR*Math.cos(a0),.006),
            bp(sg,fuelY+fuelR*Math.sin(a1),fuelZ+fuelR*Math.cos(a1),.006));
      }
    }

    
    const xIn=sg*(W+.018), xOut=sg*(W+.145), my=1.325, mz=.555;
    slab(Math.min(xIn,sg*(W+.050)),Math.max(xIn,sg*(W+.050)),1.285,1.345,.535,.585,B);
    for(let i=0;i<8;i++){
      const a0=i*Math.PI/4,a1=(i+1)*Math.PI/4;
      const p=(x,a)=>[x,my+.064*Math.sin(a),mz+.105*Math.cos(a)];
      quad(B,[0,Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)],p(xIn,a0),p(xIn,a1),p(xOut,a1),p(xOut,a0),true);
    }
    quad(B,[sg,0,0],[xOut,my-.045,mz-.075],[xOut,my-.045,mz+.075],
         [xOut,my+.045,mz+.075],[xOut,my+.045,mz-.075],true);
    const xa=sg*(W+.040), xb=sg*(W+.135), x0=Math.min(xa,xb),x1=Math.max(xa,xb);
    quad(DARK,[0,0,-1],[x1,my-.044,mz-.108],[x0,my-.044,mz-.108],
         [x0,my+.044,mz-.108],[x1,my+.044,mz-.108],true);
  }

  
  const roundedLamp=(cx,cy,hw,hh,rr,uv,zOff=0)=>{
    const z=L+.014+zOff, nn=N(0,0,1), u=uvCenter(uv,.12);
    const pts=[[-hw+rr,-hh], [hw-rr,-hh], [hw,-hh+rr], [hw,hh-rr],
               [hw-rr,hh], [-hw+rr,hh], [-hw,hh-rr], [-hw,-hh+rr]];
    for(let i=0;i<pts.length;i++){
      const a=pts[i],b=pts[(i+1)%pts.length];
      mb.tri(P(cx,cy,z),P(cx+a[0],cy+a[1],z),P(cx+b[0],cy+b[1],z),nn[0],nn[1],nn[2],
        (u[0]+u[2])/2,(u[1]+u[3])/2,u[0],u[3],u[2],u[3]);
    }
  };
  
  roundedLamp(-.405,.855,.150,.190,.042,DARK,-.004); roundedLamp(.405,.855,.150,.190,.042,DARK,-.004);
  roundedLamp(-.405,.855,.122,.162,.036,CHROME,-.001); roundedLamp(.405,.855,.122,.162,.036,CHROME,-.001);
  roundedLamp(-.405,.855,.096,.136,.030,LENS,.002); roundedLamp(.405,.855,.096,.136,.030,LENS,.002);
  
  mb.grade(RETRO.plate);
  quad(PLATE,[0,0,1],[.165,.39,L+.018],[-.165,.39,L+.018],[-.165,.555,L+.018],[.165,.555,L+.018]);
  
  quad(PLATE,[0,0,-1],[-.165,.57,-L-.014],[.165,.57,-L-.014],[.165,.735,-L-.014],[-.165,.735,-L-.014]);
  mb.grade(0);

  
  quad(B,[0,0,-1],[.58,.39,-L-.002],[-.58,.39,-L-.002],[-.58,1.18,-L-.002],[.58,1.18,-L-.002]);
  
  quad(DARK,[0,-.12,-.99],[.56,.335,-L-.010],[-.56,.335,-L-.010],
       [-.62,.455,-L-.004],[.62,.455,-L-.004],true);
  const rearZ=(y)=>{
    const t=Math.max(0,Math.min(1,(y-winY0)/(winY1-winY0)));
    return rearBase+(roofRear-rearBase)*t;
  };
  for(const sg of [-1,1]){
    
    const xa=sg*.495,xb=sg*.570,x0=Math.min(xa,xb),x1=Math.max(xa,xb);
    const y0=.61,ym=1.165,ys=winY0+.020,y1=1.43;
    quad(TAIL,[0,0,-1],[x1,y0,-L-.009],[x0,y0,-L-.009],
         [x0,ym,-L-.009],[x1,ym,-L-.009],true);
    
    quad(TAIL,[0,.72,-.69],[x1,ym,-L-.009],[x0,ym,-L-.009],
         [x0,ys,rearZ(ys)-.009],[x1,ys,rearZ(ys)-.009],true);
    
    quad(TAIL,[0,.10,-.995],[x1,ys,rearZ(ys)-.009],[x0,ys,rearZ(ys)-.009],
         [x0,y1,rearZ(y1)-.009],[x1,y1,rearZ(y1)-.009],true);
  }
  mb.grade(RETRO.reflex);
  for(const sg of [-1,1]){
    const x0=sg<0?-W+.10:W-.20,x1=sg<0?-W+.20:W-.10;
    quad(REFLEX,[0,0,-1],[x1,.42,-L-.019],[x0,.42,-L-.019],[x0,.52,-L-.019],[x1,.52,-L-.019],true);
  }
  mb.grade(0);
}

function buildScaniaBody(mb, c, poses, dist){
  mb.grade(0);
  if(!poses || !poses.tractor || !poses.trailer || dist > 200) return;

  const near = dist < 80;
  const roadRed=c.scaniaPaint==='dark-red',PAINT=roadRed?CUV(0,1):CUV(3,4), GLASS=CUV(2,4), CHROME=CUV(1,4), SILVER=CUV(0,4);
  const WHITE=CUV(5,4), DARK=CUV(2,1), LENS=CUV(3,1), TAIL=CUV(1,2);
  const PLATE=CUV(3,3), REFLEX=CUV(1,3);
  const GRILLE=CUV(0,5), SCANIA=CUV(1,5), BADGE=roadRed?CUV(4,5):CUV(2,5), STEP=CUV(3,5);
  
  const SCANIA_READ=[SCANIA[2],SCANIA[1],SCANIA[0],SCANIA[3]];
  const BADGE_READ=[BADGE[2],BADGE[1],BADGE[0],BADGE[3]];

  const unit=(v)=>{
    const d=Math.hypot(v[0],v[1],v[2])||1;
    return [v[0]/d,v[1]/d,v[2]/d];
  };
  const uvInset=(uv,p=.16)=>[
    uv[0]+(uv[2]-uv[0])*p,uv[1]+(uv[3]-uv[1])*p,
    uv[2]-(uv[2]-uv[0])*p,uv[3]-(uv[3]-uv[1])*p
  ];
  const context=(pose)=>{
    const P=pose.P, N0=pose.N,part=pose===poses.trailer?1:0;
    const wn=(n)=>unit(N0(...unit(n)));
    const put=(p,n,u,v)=>{
      const q=P(...p),nn=wn(n);
      mb.v.push(q[0],q[1],q[2],nn[0],nn[1],nn[2],u,v,mb.g);
    };
    const add=(p,n,u=.5,v=.5)=>{
      const s=mb.n,q=P(...p),nn=wn(n);
      mb.v.push(q[0],q[1],q[2],nn[0],nn[1],nn[2],u,v,mb.g); mb.n++;
      if(mb.scParts)mb.scParts.push(part);
      return s;
    };
    const q=(uv,n,a,b,d,e,small=false)=>{
      const u=small?uvInset(uv):uv,s=mb.n,nn=wn(n);
      mb.quad(P(...a),P(...b),P(...d),P(...e),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
      if(mb.scParts)mb.scParts.push(part,part,part,part);
    };
    const sq=(uv,a,b,d,e,na,nb,nd,ne,small=false)=>{
      const u=small?uvInset(uv):uv,s=mb.n;
      put(a,na,u[0],u[3]); put(b,nb,u[2],u[3]);
      put(d,nd,u[2],u[1]); put(e,ne,u[0],u[1]);
      mb.i.push(s,s+1,s+2,s,s+2,s+3); mb.n+=4;
      if(mb.scParts)mb.scParts.push(part,part,part,part);
    };
    const tri=(uv,n,a,b,d,small=true)=>{
      const u=small?uvInset(uv):uv,nn=wn(n);
      mb.tri(P(...a),P(...b),P(...d),nn[0],nn[1],nn[2],
        (u[0]+u[2])/2,(u[1]+u[3])/2,u[0],u[3],u[2],u[3]);
      if(mb.scParts)mb.scParts.push(part,part,part);
    };
    const box=(x0,x1,y0,y1,z0,z1,uv)=>{
      q(uv,[0,0,1],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);
      q(uv,[0,0,-1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]);
      q(uv,[-1,0,0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]);
      q(uv,[1,0,0],[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]);
      q(uv,[0,1,0],[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]);
      q(uv,[0,-1,0],[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1]);
    };
    const trapZ=(xb0,xb1,y0,xt0,xt1,y1,z0,z1,uv)=>{
      q(uv,[0,0,1],[xb0,y0,z1],[xb1,y0,z1],[xt1,y1,z1],[xt0,y1,z1]);
      q(uv,[0,0,-1],[xb1,y0,z0],[xb0,y0,z0],[xt0,y1,z0],[xt1,y1,z0]);
      q(uv,[-1,.08,0],[xb0,y0,z0],[xb0,y0,z1],[xt0,y1,z1],[xt0,y1,z0],true);
      q(uv,[1,.08,0],[xb1,y0,z1],[xb1,y0,z0],[xt1,y1,z0],[xt1,y1,z1],true);
      q(uv,[0,1,0],[xt0,y1,z1],[xt1,y1,z1],[xt1,y1,z0],[xt0,y1,z0],true);
      q(uv,[0,-1,0],[xb0,y0,z0],[xb1,y0,z0],[xb1,y0,z1],[xb0,y0,z1],true);
    };
    const panel=(pts,n,depth,uv,small=false)=>{
      const nn=unit(n),back=pts.map(p=>[p[0]-nn[0]*depth,p[1]-nn[1]*depth,p[2]-nn[2]*depth]);
      q(uv,nn,pts[0],pts[1],pts[2],pts[3],small);
      q(uv,[-nn[0],-nn[1],-nn[2]],back[1],back[0],back[3],back[2],small);
      for(let i=0;i<4;i++){
        const j=(i+1)%4,a=pts[i],b=pts[j],bb=back[j],ba=back[i];
        const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2];
        q(uv,unit([ey*nn[2]-ez*nn[1],ez*nn[0]-ex*nn[2],ex*nn[1]-ey*nn[0]]),a,b,bb,ba,true);
      }
    };
    const polyPanel=(pts,n,depth,uv)=>{
      const nn=unit(n),back=pts.map(p=>[p[0]-nn[0]*depth,p[1]-nn[1]*depth,p[2]-nn[2]*depth]);
      for(let i=1;i<pts.length-1;i++) tri(uv,nn,pts[0],pts[i],pts[i+1]);
      for(let i=1;i<back.length-1;i++) tri(uv,[-nn[0],-nn[1],-nn[2]],back[0],back[i+1],back[i]);
      for(let i=0;i<pts.length;i++){
        const j=(i+1)%pts.length,a=pts[i],b=pts[j],bb=back[j],ba=back[i];
        const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2];
        q(uv,unit([ey*nn[2]-ez*nn[1],ez*nn[0]-ex*nn[2],ex*nn[1]-ey*nn[0]]),a,b,bb,ba,true);
      }
    };
    const cyl=(a,b,r,sides,uv,caps=true)=>{
      const axis=unit([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
      const seed=Math.abs(axis[1])<.85?[0,1,0]:[1,0,0];
      const u=unit([axis[1]*seed[2]-axis[2]*seed[1],axis[2]*seed[0]-axis[0]*seed[2],axis[0]*seed[1]-axis[1]*seed[0]]);
      const v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]];
      const ring=(p,t)=>[p[0]+r*(u[0]*Math.cos(t)+v[0]*Math.sin(t)),p[1]+r*(u[1]*Math.cos(t)+v[1]*Math.sin(t)),p[2]+r*(u[2]*Math.cos(t)+v[2]*Math.sin(t))];
      const tile=uvInset(uv),ar=[],br=[];
      for(let i=0;i<sides;i++){
        const t=i*Math.PI*2/sides,n=unit([u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)]);
        ar.push(add(ring(a,t),n,tile[0],tile[1])); br.push(add(ring(b,t),n,tile[2],tile[3]));
      }
      for(let i=0;i<sides;i++){ const j=(i+1)%sides; mb.i.push(ar[i],ar[j],br[j],ar[i],br[j],br[i]); }
      if(caps){
        const ca=add(a,[-axis[0],-axis[1],-axis[2]]),cb=add(b,axis),ra=[],rb=[];
        for(let i=0;i<sides;i++){
          const t=i*Math.PI*2/sides;
          ra.push(add(ring(a,t),[-axis[0],-axis[1],-axis[2]])); rb.push(add(ring(b,t),axis));
        }
        for(let i=0;i<sides;i++){ const j=(i+1)%sides; mb.i.push(ca,ra[j],ra[i],cb,rb[i],rb[j]); }
      }
    };
    return {P,wn,add,q,sq,tri,box,trapZ,panel,polyPanel,cyl};
  };

  const T=context(poses.tractor), R=context(poses.trailer);

  
  const wheel=(H,axle,xCenter,width,outerSign,detailed=true)=>{
    const sides=24,r=.50,rim=.305,hub=.105;
    const x0=xCenter-width/2,x1=xCenter+width/2,du=uvInset(DARK),su=uvInset(SILVER);
    
    const treadBase=near?r-.008:r;
    const profile=near?[[x0,r*.94],[x0+width*.13,treadBase],[x1-width*.13,treadBase],[x1,r*.94]]:[[x0,r],[x1,r]];
    const treadRings=[];
    for(let k=0;k<profile.length;k++){
      const [x,rad]=profile[k],prev=profile[Math.max(0,k-1)],next=profile[Math.min(profile.length-1,k+1)];
      const slope=(next[1]-prev[1])/Math.max(.001,next[0]-prev[0]),ring=[];
      for(let i=0;i<sides;i++){
        const a=i*Math.PI*2/sides,n=unit([-slope,Math.sin(a),Math.cos(a)]);
        ring.push(H.add([x,r+rad*Math.sin(a),axle+rad*Math.cos(a)],n,i?du[2]:du[0],du[1]));
      }
      treadRings.push(ring);
    }
    for(let k=0;k<treadRings.length-1;k++) for(let i=0;i<sides;i++){
      const j=(i+1)%sides,a=treadRings[k],b=treadRings[k+1];
      mb.i.push(a[i],a[j],b[j],a[i],b[j],b[i]);
    }
    
    const sideR=near?r*.94:r;
    for(const [xf,sg] of [[x0,-1],[x1,1]]){
      const outer=[],inner=[];
      for(let i=0;i<sides;i++){
        const a=i*Math.PI*2/sides;
        outer.push(H.add([xf,r+sideR*Math.sin(a),axle+sideR*Math.cos(a)],unit([sg*.45,Math.sin(a),Math.cos(a)]),du[0],du[1]));
        inner.push(H.add([xf,r+rim*Math.sin(a),axle+rim*Math.cos(a)],[sg,0,0],du[2],du[3]));
      }
      for(let i=0;i<sides;i++){ const j=(i+1)%sides; if(sg>0) mb.i.push(inner[i],inner[j],outer[j],inner[i],outer[j],outer[i]); else mb.i.push(inner[i],outer[i],outer[j],inner[i],outer[j],inner[j]); }
      const center=H.add([xf,r,axle],[sg,0,0],du[0],du[1]),ring=[];
      for(let i=0;i<sides;i++){ const a=i*Math.PI*2/sides; ring.push(H.add([xf,r+rim*Math.sin(a),axle+rim*Math.cos(a)],[sg,0,0],du[2],du[3])); }
      for(let i=0;i<sides;i++){ const j=(i+1)%sides; if(sg>0) mb.i.push(center,ring[i],ring[j]); else mb.i.push(center,ring[j],ring[i]); }
    }
    const xo=outerSign>0?x1+.004:x0-.004,n=[outerSign,0,0];
    const rc=H.add([xo,.50,axle],n,su[0],su[1]),rr=[];
    for(let i=0;i<sides;i++){ const a=i*Math.PI*2/sides; rr.push(H.add([xo,.50+rim*Math.sin(a),axle+rim*Math.cos(a)],n,su[2],su[3])); }
    for(let i=0;i<sides;i++){ const j=(i+1)%sides; if(outerSign>0) mb.i.push(rc,rr[i],rr[j]); else mb.i.push(rc,rr[j],rr[i]); }
    if(!detailed) return;
    if(near){
      
      const ringFace=(rad0,rad1,offset)=>{
        const a0=[],a1=[],xf=xo+outerSign*offset;
        for(let i=0;i<sides;i++){
          const a=i*Math.PI*2/sides;
          a0.push(H.add([xf,r+rad0*Math.sin(a),axle+rad0*Math.cos(a)],n,du[0],du[1]));
          a1.push(H.add([xf,r+rad1*Math.sin(a),axle+rad1*Math.cos(a)],n,du[2],du[3]));
        }
        for(let i=0;i<sides;i++){
          const j=(i+1)%sides;
          if(outerSign>0) mb.i.push(a0[i],a1[i],a1[j],a0[i],a1[j],a0[j]);
          else mb.i.push(a0[i],a0[j],a1[j],a0[i],a1[j],a1[i]);
        }
      };
      ringFace(.405,.448,.006);
      for(let i=0;i<sides;i+=2){
        const a0=i*Math.PI*2/sides,a1=(i+.72)*Math.PI*2/sides,rad=r;
        const p=(x,a)=>[x,r+rad*Math.sin(a),axle+rad*Math.cos(a)];
        H.q(DARK,[0,Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)],
          p(x0+width*.18,a0),p(x0+width*.18,a1),p(x1-width*.18,a1),p(x1-width*.18,a0),true);
      }
    }
    
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3,cy=.50+.215*Math.sin(a),cz=axle+.215*Math.cos(a);
      H.cyl([xo+outerSign*.0015,cy,cz],[xo+outerSign*.007,cy,cz],.046,4,DARK,true);
    }
    H.cyl([xo+outerSign*.008,.50,axle],[xo+outerSign*.030,.50,axle],hub,8,CHROME,true);
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3,cy=.50+.075*Math.sin(a),cz=axle+.075*Math.cos(a);
      H.cyl([xo+outerSign*.031,cy,cz],[xo+outerSign*.046,cy,cz],.013,4,CHROME,true);
    }
  };
  const axlePair=(H,z,dual,detailed)=>{
    if(dual){
      wheel(H,z,-1.095,.205,-1,detailed); wheel(H,z,-.855,.205,-1,false);
      wheel(H,z,.855,.205,1,false); wheel(H,z,1.095,.205,1,detailed);
    }else{
      wheel(H,z,-1.065,.245,-1,detailed); wheel(H,z,1.065,.245,1,detailed);
    }
  };

  
  axlePair(T,1.85,false,near);
  axlePair(T,-1.65,true,near);
  axlePair(T,-2.95,true,near);
  T.box(-.48,.48,.43,.78,-3.35,2.70,DARK);              
  T.box(-.93,-.76,.55,.82,-3.22,.54,DARK);
  T.box(.76,.93,.55,.82,-3.22,.54,DARK);
  T.cyl([-.94,.76,-1.18],[-.94,.76,.30],.285,near?24:16,SILVER,true);
  T.cyl([.94,.76,.30],[.94,.76,-1.18],.285,near?24:16,SILVER,true);
  
  T.cyl([0,1.10,-1.65],[0,1.17,-1.65],.56,near?24:16,DARK,true);
  T.cyl([0,1.17,-1.65],[0,1.29,-1.65],.070,16,CHROME,true);

  
  const cab=[
    {y:.52,w:1.25,f:3.18,r:.65,ny:-.30},
    {y:1.15,w:1.25,f:3.30,r:.65,ny:-.05},
    {y:1.48,w:1.25,f:3.27,r:.65,ny:0},
    {y:2.18,w:1.23,f:3.20,r:.65,ny:0},
    {y:3.46,w:1.18,f:3.03,r:.67,ny:.06},
    {y:3.80,w:1.07,f:2.88,r:.72,ny:.58},
    {y:3.95,w:.80,f:2.70,r:.84,ny:.94}
  ];
  const xs=near?[-1,-.92,-.80,-.66,-.48,-.25,0,.25,.48,.66,.80,.92,1]:[-1,-.84,-.58,-.28,0,.28,.58,.84,1];
  const frontPoint=(row,t)=>{
    const corner=Math.max(0,(Math.abs(t)-.64)/.36);
    const setback=(near?.15:.085)*Math.pow(corner,1.65);
    return [row.w*t,row.y,row.f-setback];
  };
  for(let j=0;j<cab.length-1;j++){
    const a=cab[j],b=cab[j+1];
    for(let i=0;i<xs.length-1;i++){
      const x0=xs[i],x1=xs[i+1],p00=frontPoint(a,x0),p01=frontPoint(a,x1),p11=frontPoint(b,x1),p10=frontPoint(b,x0);
      const norm=(row,t)=>unit([t*.34,row.ny,1]);
      T.sq(PAINT,p00,p01,p11,p10,norm(a,x0),norm(a,x1),norm(b,x1),norm(b,x0));
    }
    for(const sg of [-1,1]){
      const n0=unit([sg,.10*(b.w-a.w),0]),n1=unit([sg,.10*(b.w-a.w),0]);
      if(j===0){
        
        const az=1.85,ar=.58,zL=az-ar,zR=az+ar,front=frontPoint(a,sg)[2];
        const sideX=sg*a.w;
        T.q(PAINT,[sg,0,0],[sideX,a.y,a.r],[sideX,a.y,zL],[sideX,b.y,zL],[sideX,b.y,b.r]);
        T.q(PAINT,[sg,0,0],[sideX,a.y,zR],[sideX,a.y,front],[sideX,b.y,frontPoint(b,sg)[2]],[sideX,b.y,zR]);
        const steps=near?12:8;
        for(let k=0;k<steps;k++){
          const t0=Math.PI-k*Math.PI/steps,t1=Math.PI-(k+1)*Math.PI/steps;
          const y0=a.y+ar*Math.sin(t0),y1=a.y+ar*Math.sin(t1);
          const z0=az+ar*Math.cos(t0),z1=az+ar*Math.cos(t1);
          T.q(PAINT,[sg,0,0],[sideX,y0,z0],[sideX,y1,z1],[sideX,b.y,z1],[sideX,b.y,z0]);
          
          T.q(DARK,[0,-Math.sin((t0+t1)/2),-Math.cos((t0+t1)/2)],
            [sideX,y0,z0],[sideX,y1,z1],[sg*1.10,y1,z1],[sg*1.10,y0,z0],true);
        }
      }else{
        T.sq(PAINT,[sg*a.w,a.y,a.r],[sg*a.w,a.y,frontPoint(a,sg)[2]],[sg*b.w,b.y,frontPoint(b,sg)[2]],[sg*b.w,b.y,b.r],n0,n0,n1,n1);
      }
    }
    T.q(PAINT,[0,0,-1],[a.w,a.y,a.r],[-a.w,a.y,a.r],[-b.w,b.y,b.r],[b.w,b.y,b.r]);
  }
  T.q(PAINT,[0,-1,0],[-cab[0].w,cab[0].y,cab[0].r],[cab[0].w,cab[0].y,cab[0].r],[cab[0].w,cab[0].y,cab[0].f],[-cab[0].w,cab[0].y,cab[0].f]);
  T.q(PAINT,[0,1,0],[-cab[6].w,cab[6].y,cab[6].r],[-cab[6].w,cab[6].y,cab[6].f],[cab[6].w,cab[6].y,cab[6].f],[cab[6].w,cab[6].y,cab[6].r]);

  
  T.panel([[-1.075,2.16,3.235],[1.075,2.16,3.235],[1.015,3.52,3.040],[-1.015,3.52,3.040]],
    [0,.153,.988],.028,DARK);
  T.panel([[-.995,2.25,3.248],[.995,2.25,3.248],[.945,3.43,3.064],[-.945,3.43,3.064]],
    [0,.153,.988],.012,GLASS,true);
  if(near){
    T.box(-1.01,1.01,2.18,2.225,3.248,3.278,DARK);      
    T.cyl([-.82,2.245,3.258],[-.08,2.53,3.213],.018,10,DARK,true);
    T.cyl([.82,2.245,3.258],[.08,2.53,3.213],.018,10,DARK,true);
  }

  
  T.trapZ(-1.01,1.01,1.39,-.89,.89,2.13,3.259,3.290,GRILLE);
  T.trapZ(-.94,.94,1.49,-.82,.82,1.74,3.286,3.304,GRILLE);
  T.trapZ(-.88,.88,1.13,-.96,.96,1.37,3.304,3.312,GRILLE);
  T.trapZ(-.91,.91,.84,-1.01,1.01,1.08,3.251,3.284,GRILLE);
  T.trapZ(-.96,.96,.59,-1.04,1.04,.80,3.218,3.253,GRILLE);
  T.trapZ(-.73,.73,1.86,-.67,.67,2.10,3.306,3.312,SCANIA_READ); 
  if(near){
    
    const mouths=[
      [-.79,.79,1.51,1.72,3.306],[-.88,.88,1.17,1.34,3.313],
      [-.93,.93,.88,1.04,3.286],[-.98,.98,.62,.77,3.255]
    ];
    for(const [x0,x1,y0,y1,z] of mouths){
      T.box(x0,x1,y0,y1,z-.018,z,DARK);
      for(const t of [.27,.63]){
        const y=y0+(y1-y0)*t;
        T.box(x0+.035,x1-.035,y,y+.022,z,z+.004,STEP);
      }
    }
  }

  
  for(const sg of [-1,1]){
    const xa=sg<0?-1.16:.65,xb=sg<0?-.65:1.16;
    T.panel([[xa,1.92,3.289],[xb,1.92,3.289],[xb*.97,2.075,3.276],[xa*.97,2.075,3.276]],[0,.08,.997],.020,DARK,true);
    T.panel([[xa*.985,1.955,3.300],[xb*.985,1.955,3.300],[xb*.95,2.035,3.290],[xa*.95,2.035,3.290]],[0,.08,.997],.010,LENS,true);
    const lx0=sg<0?-1.13:.70,lx1=sg<0?-.70:1.13;
    T.box(lx0,lx1,.92,1.24,3.302,3.314,DARK);
    if(near){
      
      const ux0=Math.min(xa,xb)*.985,ux1=Math.max(xa,xb)*.985,uw=(ux1-ux0)/5;
      for(let k=0;k<5;k++) T.box(ux0+k*uw+.012,ux0+(k+1)*uw-.012,1.976,2.018,3.309,3.318,k===4?CHROME:LENS);
      const centers=[lx0+(lx1-lx0)*.34,lx0+(lx1-lx0)*.70];
      for(let k=0;k<centers.length;k++){
        const rr=k===0?.062:.048,cx=centers[k];
        T.cyl([cx,1.080,3.315],[cx,1.080,3.318],rr,12,CHROME,true);
        T.cyl([cx,1.080,3.318],[cx,1.080,3.320],rr*.62,12,LENS,true);
      }
    }else T.box(lx0+.035,lx1-.035,.975,1.185,3.316,3.320,LENS);
  }
  T.box(-1.17,1.17,.48,.66,3.15,3.30,PAINT);            
  T.box(-.58,.58,.53,.65,3.285,3.30,DARK);

  
  for(const sg of [-1,1]){
    const x=sg*1.239,n=[sg,0,0];
    const outer=[[x,2.13,1.15],[x,2.13,2.72],[x,2.29,3.08],[x,3.35,2.91],[x,3.52,2.69],[x,3.52,1.17],[x,3.34,.91],[x,2.34,.91]];
    const inner=[[x+sg*.010,2.23,1.21],[x+sg*.010,2.23,2.65],[x+sg*.010,2.36,2.93],[x+sg*.010,3.25,2.80],[x+sg*.010,3.40,2.61],[x+sg*.010,3.40,1.25],[x+sg*.010,3.27,1.04],[x+sg*.010,2.39,1.04]];
    T.polyPanel(outer,n,.022,DARK);
    T.polyPanel(inner,n,.010,GLASS);
    
    T.box(sg<0?-1.250:1.239,sg<0?-1.239:1.250,.77,2.14,.88,.905,DARK);
    T.box(sg<0?-1.250:1.239,sg<0?-1.239:1.250,1.73,1.82,1.08,1.43,DARK);
    const bx0=sg<0?-1.250:1.238,bx1=sg<0?-1.238:1.250;
    T.box(Math.min(bx0,bx1),Math.max(bx0,bx1),1.47,1.67,2.02,2.48,BADGE_READ);
    
    for(let k=0;k<3;k++){
      const y=.47+k*.22,z0=2.32-k*.05,z1=2.92-k*.04;
      T.box(sg<0?-1.253:1.155,sg<0?-1.155:1.253,y,y+.075,z0,z1,STEP);
    }
    
    T.box(sg<0?-1.253:1.220,sg<0?-1.220:1.253,.46,1.14,-1.03,.38,PAINT);
    
    const mx=sg*1.49;
    T.cyl([sg*1.19,2.42,2.82],[mx,2.63,2.83],.024,10,DARK,true);
    T.cyl([sg*1.20,3.20,2.73],[mx,3.03,2.74],.024,10,DARK,true);
    T.cyl([mx,2.43,2.78],[mx,3.19,2.78],.022,10,DARK,true);
    T.box(sg<0?mx-.055:mx-.015,sg<0?mx+.015:mx+.055,2.70,3.18,2.67,2.88,DARK);
    T.box(sg<0?mx-.050:mx-.012,sg<0?mx+.012:mx+.050,2.40,2.65,2.69,2.88,DARK);
    const mirrorX=sg<0?mx-.058:mx+.058;
    T.box(Math.min(mirrorX,mirrorX+sg*.012),Math.max(mirrorX,mirrorX+sg*.012),2.75,3.13,2.70,2.85,CHROME);
  }

  
  for(const sg of [-1,1]){
    const archSides=near?16:10;
    for(let i=0;i<archSides;i++){
      const a0=Math.PI-i*Math.PI/archSides,a1=Math.PI-(i+1)*Math.PI/archSides,ro=.585,ri=.535;
      const p=(r,a)=>[sg*1.255,.50+r*Math.sin(a),1.85+r*Math.cos(a)];
      T.q(DARK,[sg,.12*Math.sin((a0+a1)/2),.12*Math.cos((a0+a1)/2)],p(ro,a0),p(ro,a1),p(ri,a1),p(ri,a0),true);
    }
  }

  
  const defTop=(t)=>4.045+.055*Math.cos((t-.5)*Math.PI);
  for(let i=0;i<6;i++){
    const t0=i/6,t1=(i+1)/6,x0=-.98+1.96*t0,x1=-.98+1.96*t1;
    const y0=defTop(t0),y1=defTop(t1);
    T.sq(PAINT,[x0,y0,.82],[x1,y1,.82],[x1,y1,2.55],[x0,y0,2.55],
      [0,1,0],[0,1,0],[0,1,0],[0,1,0]);
    T.q(PAINT,[0,0,1],[x0,3.965,2.55],[x1,3.965,2.55],[x1,y1,2.55],[x0,y0,2.55]);
    T.q(PAINT,[0,0,-1],[x1,3.965,.82],[x0,3.965,.82],[x0,y0,.82],[x1,y1,.82]);
  }
  T.q(PAINT,[0,-1,0],[-.98,3.965,.82],[-.98,3.965,2.55],[.98,3.965,2.55],[.98,3.965,.82]);
  T.q(PAINT,[-1,0,0],[-.98,3.965,.82],[-.98,defTop(0),.82],[-.98,defTop(0),2.55],[-.98,3.965,2.55]);
  T.q(PAINT,[1,0,0],[.98,3.965,2.55],[.98,defTop(1),2.55],[.98,defTop(1),.82],[.98,3.965,.82]);

  
  mb.grade(RETRO.plate);
  T.box(-.25,.25,.50,.73,3.305,3.320,PLATE);
  mb.grade(0);

  
  if(c.scaniaTrailer===false){ mb.grade(0); return; }

  
  axlePair(R,-8.0,true,near);
  axlePair(R,-9.3,true,near);
  axlePair(R,-10.6,true,near);
  R.box(-.46,.46,.48,1.26,-11.43,1.12,DARK);
  
  R.box(-1.245,1.245,1.26,4.10,-11.49,1.25,WHITE);
  
  if(near){
    for(const sg of [-1,1]){
      for(let z=-10.7;z<=.45;z+=1.55){
        const xa=sg<0?-1.250:1.245,xb=sg<0?-1.245:1.250;
        R.box(Math.min(xa,xb),Math.max(xa,xb),1.32,4.04,z,z+.028,SILVER);
      }
      R.box(sg<0?-1.250:1.245,sg<0?-1.245:1.250,1.34,1.39,-11.42,1.12,SILVER);
      R.box(sg<0?-1.250:1.245,sg<0?-1.245:1.250,3.96,4.03,-11.42,1.12,SILVER);
    }
  }
  
  R.cyl([-.72,.18,-1.18],[-.72,1.27,-1.18],.075,12,DARK,true);
  R.cyl([.72,.18,-1.18],[.72,1.27,-1.18],.075,12,DARK,true);
  R.box(-.92,.92,.16,.26,-1.28,-1.08,DARK);
  R.cyl([0,1.17,0],[0,1.31,0],.060,16,CHROME,true);

  
  R.box(-1.205,-.025,1.32,4.04,-11.53,-11.51,WHITE);
  R.box(.025,1.205,1.32,4.04,-11.53,-11.51,WHITE);
  R.box(-.026,.026,1.31,4.05,-11.548,-11.534,SILVER);
  for(const x of [-.48,.48]){
    R.cyl([x,1.47,-11.524],[x,3.90,-11.524],.026,10,CHROME,true);
    for(const y of [1.55,2.28,3.00,3.73]) R.box(x-.16,x+.16,y-.035,y+.035,-11.555,-11.532,CHROME);
  }
  R.box(-1.25,1.25,.66,.91,-11.55,-11.37,DARK);
  for(const sg of [-1,1]){
    const x0=sg<0?-1.17:.76,x1=sg<0?-.76:1.17;
    R.box(x0,x1,.73,1.03,-11.560,-11.535,TAIL);
  }

  
  mb.grade(RETRO.reflex);
  for(const sg of [-1,1]){
    for(const z of [-.55,-2.65,-4.75,-6.85,-8.95,-11.05]){
      const xa=sg<0?-1.250:1.245,xb=sg<0?-1.245:1.250;
      R.box(Math.min(xa,xb),Math.max(xa,xb),1.43,1.53,z-.085,z+.085,REFLEX);
    }
    const x0=sg<0?-1.13:.93,x1=sg<0?-.93:1.13;
    R.box(x0,x1,.74,.88,-11.560,-11.555,REFLEX);
  }
  mb.grade(0);

  
  mb.grade(RETRO.plate);
  R.box(-.25,.25,.91,1.14,-11.560,-11.552,PLATE);
  mb.grade(0);
}

function buildTruckCabRaw(mb,c,K,P,dist){
  if(dist>TRUCK_CAB_SPEC.farDistance)return TRUCK_CAB_SPEC;
  const D=TRUCK_CAB_SPEC, near=dist<=D.nearDistance;
  const L=K.L, rear=K.cabB, axle=K.axleF, tireR=K.tireR;
  const sill=Math.max(.285,Number.isFinite(K.sill)?K.sill:.30);
  const S=Math.sin(c.head||0), C=Math.cos(c.head||0);
  const N=(x,y,z)=>{
    const d=Math.hypot(x,y,z)||1, lx=x/d,ly=y/d,lz=z/d;
    const nx=-lx*C+lz*S,nz=lx*S+lz*C;
    const q=Math.hypot(nx,ly,nz)||1;
    return[nx/q,ly/q,nz/q];
  };
  const B=CUV(c.col[0],c.col[1]);
  const GLASS=CUV(1,1),DARK=CUV(2,1),LENS=CUV(3,1),AMBER=CUV(6,0);
  const SILVER=CUV(0,4),HILITE=CUV(1,4);
  const uvInset=(uv,p=.12)=>[uv[0]+(uv[2]-uv[0])*p,uv[1]+(uv[3]-uv[1])*p,
    uv[2]-(uv[2]-uv[0])*p,uv[3]-(uv[3]-uv[1])*p];
  const q=(uv,n,a,b,d,e,small=false)=>{
    const nn=N(...n),u=small?uvInset(uv):uv;
    mb.quad(P(...a),P(...b),P(...d),P(...e),nn[0],nn[1],nn[2],u[0],u[3],u[2],u[1]);
  };
  const tri=(uv,n,a,b,d,small=true)=>{
    const nn=N(...n),u=small?uvInset(uv):uv;
    mb.tri(P(...a),P(...b),P(...d),nn[0],nn[1],nn[2],
      (u[0]+u[2])/2,(u[1]+u[3])/2,u[0],u[3],u[2],u[3]);
  };
  const smoothQ=(uv,a,b,d,e,na,nb,nd,ne,small=false)=>{
    const u=small?uvInset(uv):uv,base=mb.n,g=mb.g;
    const put=(p,n,uu,vv)=>{const nn=N(...n),w=P(...p);mb.v.push(w[0],w[1],w[2],nn[0],nn[1],nn[2],uu,vv,g);};
    put(a,na,u[0],u[3]);put(b,nb,u[2],u[3]);put(d,nd,u[2],u[1]);put(e,ne,u[0],u[1]);
    mb.i.push(base,base+1,base+2,base,base+2,base+3);mb.n+=4;
  };
  const poly=(uv,n,pts,small=true)=>{
    if(pts.length<3)return;
    const center=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length,a[2]+p[2]/pts.length],[0,0,0]);
    for(let i=0;i<pts.length;i++)tri(uv,n,center,pts[i],pts[(i+1)%pts.length],small);
  };
  const slab=(uv,x0,x1,y0,y1,z0,z1)=>{
    q(uv,[0,0,1],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],true);
    q(uv,[0,0,-1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],true);
    q(uv,[-1,0,0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],true);
    q(uv,[1,0,0],[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],true);
    q(uv,[0,1,0],[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],true);
    q(uv,[0,-1,0],[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],true);
  };
  const cylinder=(uv,a,b,r,segments=near?10:7)=>{
    const axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis);if(!len)return;
    const d=axis.map(v=>v/len),seed=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
    const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    let e=cross(d,seed),el=Math.hypot(...e);e=e.map(v=>v/el);const f=cross(d,e);
    const pt=(p,t)=>p.map((v,i)=>v+r*(e[i]*Math.cos(t)+f[i]*Math.sin(t)));
    for(let i=0;i<segments;i++){
      const a0=i*TAU/segments,a1=(i+1)*TAU/segments,am=(a0+a1)/2;
      const n=e.map((v,j)=>v*Math.cos(am)+f[j]*Math.sin(am));
      q(uv,n,pt(a,a0),pt(a,a1),pt(b,a1),pt(b,a0),true);
    }
  };
  const roundedRectXY=(uv,cx,cy,w,h,r,z,n=[0,0,1],segments=near?3:1)=>{
    const pts=[];
    for(const [ox,oy,a0] of [[w/2-r,h/2-r,0],[-w/2+r,h/2-r,Math.PI/2],[-w/2+r,-h/2+r,Math.PI],[w/2-r,-h/2+r,Math.PI*1.5]])
      for(let i=0;i<=segments;i++){const a=a0+i*Math.PI*.5/segments;pts.push([cx+ox+r*Math.cos(a),cy+oy+r*Math.sin(a),z]);}
    poly(uv,n,pts,true);
  };
  const roundedRectYZ=(uv,x,cy,cz,h,w,r,n,segments=near?3:1)=>{
    const pts=[];
    for(const [oy,oz,a0] of [[h/2-r,w/2-r,0],[h/2-r,-w/2+r,Math.PI/2],[-h/2+r,-w/2+r,Math.PI],[-h/2+r,w/2-r,Math.PI*1.5]])
      for(let i=0;i<=segments;i++){const a=a0+i*Math.PI*.5/segments;pts.push([x,cy+oy+r*Math.sin(a),cz+oz+r*Math.cos(a)]);}
    poly(uv,n,pts,true);
  };
  const faceZ=y=>L+.012-(y-D.windshieldBottomY)*.178/(D.windshieldTopY-D.windshieldBottomY);
  mb.grade(0);

  
  const bands=[
    {y:.535,w:D.halfWidth,flat:.675,z:L+.002,depth:.074},
    {y:.820,w:D.halfWidth,flat:.680,z:L+.001,depth:.078},
    {y:D.frontPanelTopY,w:D.beltHalfWidth,flat:.690,z:L-.006,depth:.090},
    {y:D.windshieldBottomY,w:D.beltHalfWidth,flat:.705,z:L-.010,depth:.096}
  ];
  const cornerSteps=near?4:2;
  for(let row=0;row<bands.length-1;row++){
    const a=bands[row],b=bands[row+1];
    q(B,[0,.02,1],[-a.flat,a.y,a.z],[a.flat,a.y,a.z],[b.flat,b.y,b.z],[-b.flat,b.y,b.z]);
    for(const sg of[-1,1])for(let i=0;i<cornerSteps;i++){
      const t0=i/cornerSteps,t1=(i+1)/cornerSteps;
      const curve=t=>Math.sin(t*Math.PI/2),back=t=>1-Math.cos(t*Math.PI/2);
      const pa=(t,yrow)=>[sg*(yrow.flat+(yrow.w-yrow.flat)*curve(t)),yrow.y,yrow.z-yrow.depth*back(t)];
      const p0=pa(t0,a),p1=pa(t1,a),p2=pa(t1,b),p3=pa(t0,b);
      const n0=[sg*Math.sin(t0*Math.PI/2),.02,Math.cos(t0*Math.PI/2)];
      const n1=[sg*Math.sin(t1*Math.PI/2),.02,Math.cos(t1*Math.PI/2)];
      smoothQ(B,p0,p1,p2,p3,n0,n1,n1,n0);
    }
  }

  
  q(B,[0,0,-1],[D.halfWidth,sill,rear],[-D.halfWidth,sill,rear],[-D.roofHalfWidth,D.roofY,rear+.045],[D.roofHalfWidth,D.roofY,rear+.045]);
  q(B,[0,1,0],[-D.roofHalfWidth,D.roofY,rear+.045],[-D.roofHalfWidth,D.roofY,L-.185],
    [D.roofHalfWidth,D.roofY,L-.185],[D.roofHalfWidth,D.roofY,rear+.045]);
  q(B,[0,.78,.63],[-D.shoulderHalfWidth,1.985,L-.118],[D.shoulderHalfWidth,1.985,L-.118],
    [D.roofHalfWidth,D.roofY,L-.185],[-D.roofHalfWidth,D.roofY,L-.185]);
  for(const sg of[-1,1]){
    smoothQ(B,[sg*D.beltHalfWidth,D.windshieldBottomY,L-.106],[sg*D.shoulderHalfWidth,1.985,L-.118],
      [sg*D.roofHalfWidth,D.roofY,L-.185],[sg*D.halfWidth,sill,L-.086],
      [sg,.05,.12],[sg,.35,.18],[sg,.75,.12],[sg,.03,.10]);
  }

  

  const archR=tireR+.055,archRear=axle-archR,archFront=axle+archR,sideTop=D.windshieldBottomY;
  for(const sg of[-1,1]){
    const x=sg*D.halfWidth;
    q(B,[sg,0,0],[x,sill,rear],[x,sill,archRear],[x,sideTop,archRear],[x,sideTop,rear]);
    if(archFront<L-.022){
      const frontSill=Math.min(sill,tireR);
      q(B,[sg,0,0],[x,frontSill,archFront],[x,frontSill,L-.022],[x,sideTop,L-.022],[x,sideTop,archFront]);
    }
    const maxZ=L-.022,aStart=Math.acos(Math.max(-1,Math.min(1,(maxZ-axle)/archR))),seg=near?12:7;
    for(let i=0;i<seg;i++){
      const a0=aStart+(Math.PI-aStart)*i/seg,a1=aStart+(Math.PI-aStart)*(i+1)/seg;
      const z0=axle+Math.cos(a0)*archR,z1=axle+Math.cos(a1)*archR;
      const y0=tireR+Math.sin(a0)*archR,y1=tireR+Math.sin(a1)*archR;
      q(B,[sg,.02,0],[x,y0,z0],[x,y1,z1],[x,sideTop,z1],[x,sideTop,z0]);
    }
    
    const inner=archR-.030,xe=sg*(D.halfWidth+.004);
    for(let i=0;i<seg;i++){
      const a0=aStart+(Math.PI-aStart)*i/seg,a1=aStart+(Math.PI-aStart)*(i+1)/seg;
      q(DARK,[sg,0,0],
        [xe,tireR+Math.sin(a0)*archR,axle+Math.cos(a0)*archR],
        [xe,tireR+Math.sin(a1)*archR,axle+Math.cos(a1)*archR],
        [xe,tireR+Math.sin(a1)*inner,axle+Math.cos(a1)*inner],
        [xe,tireR+Math.sin(a0)*inner,axle+Math.cos(a0)*inner],true);
    }

    
    const xs=sg*(D.beltHalfWidth+.001);
    q(B,[sg,.05,0],[xs,sideTop,rear],[xs,sideTop,L-.10],[sg*D.shoulderHalfWidth,1.985,L-.15],[sg*D.shoulderHalfWidth,1.985,rear+.035]);
    const out=sg*(D.beltHalfWidth+.007);
    const outer=[
      [out,1.285,L-.112],[out,1.265,L-.205],[out,1.295,L-.275],
      [out,1.470,rear+.105],[out,1.530,rear+.055],[out,1.875,rear+.055],
      [out,1.960,rear+.120],[out,1.985,L-.225],[out,1.925,L-.150]
    ];
    poly(DARK,[sg,.02,0],sg>0?outer:outer.slice().reverse());
    const glass=[
      [out+sg*.004,1.305,L-.132],[out+sg*.004,1.295,L-.215],[out+sg*.004,1.325,L-.252],
      [out+sg*.004,1.490,rear+.135],[out+sg*.004,1.550,rear+.085],[out+sg*.004,1.850,rear+.085],
      [out+sg*.004,1.925,rear+.145],[out+sg*.004,1.948,L-.215],[out+sg*.004,1.900,L-.168]
    ];
    poly(GLASS,[sg,.02,0],sg>0?glass:glass.slice().reverse());

    if(near){
      
      q(DARK,[sg,.1,0],[out+sg*.008,1.925,rear+.16],[out+sg*.008,1.925,L-.19],
        [out+sg*.008,1.958,L-.22],[out+sg*.008,1.958,rear+.13],true);
      q(DARK,[sg,0,0],[out+sg*.006,sill+.04,rear+.115],[out+sg*.006,sill+.04,rear+.135],
        [out+sg*.006,1.34,rear+.135],[out+sg*.006,1.34,rear+.115],true);
      q(DARK,[sg,0,0],[out+sg*.006,1.055,rear+.19],[out+sg*.006,1.055,L-.31],
        [out+sg*.006,1.073,L-.31],[out+sg*.006,1.073,rear+.19],true);
      const hz=rear+.29;
      roundedRectYZ(DARK,sg*(D.beltHalfWidth+.014),1.205,hz,.065,.18,.025,[sg,0,0],2);
    }
  }

  
  const wind=(inset=0,zadd=0)=>{
    const lo=D.windshieldBottomY+inset*.55,hi=D.windshieldTopY-inset*.70;
    const bw=.710-inset*.35,tw=.660-inset*.30,side=.790-inset*.28;
    return [
      [-bw,lo,faceZ(lo)+zadd],[bw,lo,faceZ(lo)+zadd],
      [side,lo+.072,faceZ(lo+.072)+zadd],[side,hi-.145,faceZ(hi-.145)+zadd],
      [tw+.055,hi-.045,faceZ(hi-.045)+zadd],[tw,hi,faceZ(hi)+zadd],
      [-tw,hi,faceZ(hi)+zadd],[-tw-.055,hi-.045,faceZ(hi-.045)+zadd],
      [-side,hi-.145,faceZ(hi-.145)+zadd],[-side,lo+.072,faceZ(lo+.072)+zadd]
    ];
  };
  const glassNormal=[0,.20,1];
  poly(B,glassNormal,[
    [-D.beltHalfWidth,D.windshieldBottomY-.025,faceZ(D.windshieldBottomY-.025)-.004],
    [ D.beltHalfWidth,D.windshieldBottomY-.025,faceZ(D.windshieldBottomY-.025)-.004],
    [ D.shoulderHalfWidth,1.985,faceZ(1.985)-.004],[ D.roofHalfWidth,2.080,L-.180],
    [-D.roofHalfWidth,2.080,L-.180],[-D.shoulderHalfWidth,1.985,faceZ(1.985)-.004]
  ],false);
  poly(DARK,glassNormal,wind(0,.005),false);
  poly(GLASS,glassNormal,wind(.055,.010),false);

  
  poly(DARK,[0,0,1],[[-.490,.840,L+.015],[.490,.840,L+.015],[.550,1.000,L+.015],[-.550,1.000,L+.015]],false);
  if(near)q(SILVER,[0,0,1],[-.455,.908,L+.018],[.455,.908,L+.018],
    [.445,.923,L+.018],[-.445,.923,L+.018],true);
  for(const sg of[-1,1]){
    const cx=sg*.690,x0=cx-.150,x1=cx+.150;
    roundedRectXY(DARK,cx,.880,.300,.390,.035,L+.010,[0,0,1],near?3:1);
    roundedRectXY(LENS,cx,.997,.270,.145,.025,L+.019,[0,0,1],near?3:1);
    const ax=sg<0?x0+.044:x1-.044;
    roundedRectXY(AMBER,ax,.997,.052,.112,.012,L+.022,[0,0,1],near?2:1);
    roundedRectXY(LENS,cx,.790,.270,.175,.020,L+.020,[0,0,1],near?3:1);
  }

  
  for(const sg of[-1,1]){
    const x0=sg<0?-.855:.535,x1=sg<0?-.535:.855;
    slab(SILVER,x0,x1,.285,.535,L-.070,L+.002);
    roundedRectXY(DARK,(x0+x1)/2,.385,.215,.095,.030,L+.010,[0,0,1],near?3:1);
    if(near)for(let i=0;i<3;i++)q(SILVER,[0,0,1],[x0+.055,.356+i*.024,L+.013],[x1-.055,.356+i*.024,L+.013],
      [x1-.055,.364+i*.024,L+.013],[x0+.055,.364+i*.024,L+.013],true);
  }
  slab(B,-.535,-.455,.285,.535,L-.040,L+.008);
  slab(B,.455,.535,.285,.535,L-.040,L+.008);
  slab(B,-.455,.455,.285,.355,L-.040,L+.008);
  roundedRectXY(DARK,0,.410,.790,.105,.025,L+.012,[0,0,1],near?3:1);

  
  if(near){
    const wz=y=>faceZ(y)+.020;
    cylinder(DARK,[-.600,1.295,wz(1.295)],[-.145,1.430,wz(1.430)],.011,7);
    cylinder(DARK,[ .600,1.295,wz(1.295)],[ .145,1.430,wz(1.430)],.011,7);
    cylinder(DARK,[-.630,1.285,wz(1.285)],[-.600,1.295,wz(1.295)],.018,7);
    cylinder(DARK,[ .630,1.285,wz(1.285)],[ .600,1.295,wz(1.295)],.018,7);
  }

  
  for(const sg of[-1,1]){
    const mx=sg*1.075,mz=L-.245;
    const mirrorPts=[
      [mx-.085,1.315,mz],[mx+.085,1.315,mz],[mx+.105,1.350,mz],
      [mx+.105,1.605,mz],[mx+.075,1.655,mz],[mx-.075,1.655,mz],
      [mx-.105,1.605,mz],[mx-.105,1.350,mz]
    ];
    
    poly(DARK,[0,0,1],mirrorPts,false);
    const back=mirrorPts.map(p=>[p[0],p[1],p[2]-.085]);
    poly(DARK,[0,0,-1],back.slice().reverse(),false);
    for(let i=0;i<mirrorPts.length;i++)q(DARK,
      [Math.sign(mirrorPts[i][0]-mx),Math.sign(mirrorPts[i][1]-1.485),0],
      mirrorPts[i],mirrorPts[(i+1)%mirrorPts.length],back[(i+1)%back.length],back[i],true);
    if(near){
      const rootX=sg*(D.beltHalfWidth+.015),outerX=sg*.985;
      cylinder(DARK,[rootX,1.230,L-.115],[outerX,1.230,mz-.030],.016,8);
      cylinder(DARK,[outerX,1.230,mz-.030],[outerX,1.570,mz-.030],.016,8);
      cylinder(DARK,[outerX,1.570,mz-.030],[sg*.990,1.570,mz-.030],.016,8);
    }
  }
  mb.grade(0);
  return D;
}



function buildUnic3tBodyRaw(mb, c, K, P, dist){
  K={...K,...UNIC3T_SPEC};
  const originalP=P; P=(x,y,z)=>originalP(x,y,z+.48);
  if(c.kind !== 'unic' || dist > 160) return;

  const S=Math.sin(c.head), C=Math.cos(c.head);
  
  const N=(x,y,z)=>{
    const nx=-x*C+z*S, ny=y, nz=x*S+z*C, d=Math.hypot(nx,ny,nz)||1;
    return [nx/d,ny/d,nz/d];
  };
  const B=CUV(c.col[0],c.col[1]);       
  const GLASS=CUV(1,1), DARK=CUV(2,1), LENS=CUV(3,1), TAIL=CUV(1,2);
  
  const METAL=CUV(2,1), RIM=CUV(0,4), CHROME=CUV(1,4), PLATE=CUV(3,3), RED=CUV(1,3), BEACON=CUV(6,0);
  const q=(uv,n,a,b,d,e)=>mb.quad(a,b,d,e,n[0],n[1],n[2],uv[0],uv[3],uv[2],uv[1]);
  const side=(uv,sg,y0,y1,z0,z1,offset=0)=>{
    const x=sg*(K.W+offset);
    q(uv,N(sg,0,0),P(x,y0,z0),P(x,y0,z1),P(x,y1,z1),P(x,y1,z0));
  };
  const front=(uv,y0,y1,x0,x1,z,normal=1)=>
    q(uv,N(0,0,normal),P(x0,y0,z),P(x1,y0,z),P(x1,y1,z),P(x0,y1,z));
  const tri=(uv,n,a,b,d)=>mb.tri(a,b,d,n[0],n[1],n[2],uv[0],uv[3],uv[2],uv[1],uv[2],uv[3]);
  const box=(uv,x0,x1,y0,y1,z0,z1)=>{
    front(uv,y0,y1,x0,x1,z1,1);front(uv,y0,y1,x0,x1,z0,-1);
    for(const [x,sg] of [[x0,-1],[x1,1]])q(uv,N(sg,0,0),P(x,y0,z0),P(x,y0,z1),P(x,y1,z1),P(x,y1,z0));
    q(uv,N(0,1,0),P(x0,y1,z0),P(x0,y1,z1),P(x1,y1,z1),P(x1,y1,z0));
    q(uv,N(0,-1,0),P(x0,y0,z1),P(x0,y0,z0),P(x1,y0,z0),P(x1,y0,z1));
  };

  const W=K.W, L=K.L, cabRear=K.cabB, axleF=K.axleF, axleR=K.axleB;
  const deckY=K.deckY, gateY=K.gateY, bodyBottom=K.sill;
  const cabRoof=TRUCK_CAB_SPEC.roofY, cabWindowBottom=1.12, near=dist<=90;
  const cargoFront=K.boxF, cargoRear=K.boxB, cargoW=W+0.022;

  

  const tireR=K.tireR, tireHalf=0.095, tireSides=near?24:12;
  const wheels=[
    [axleF,-K.treadF,-1],[axleF,K.treadF,1],
    [axleR,-(K.treadR+0.105),-1],[axleR,-(K.treadR-0.115),-1],
    [axleR, K.treadR+0.105,1],[axleR, K.treadR-0.115,1]
  ];
  const wheel=(az,x,sx)=>{
    
    const flat=(uv)=>{const u=(uv[0]+uv[2])/2,v=(uv[1]+uv[3])/2;return[u,v,u,v];};
    const DARK=flat(CUV(2,1)),RIM=flat(CUV(0,4)),CHROME=flat(CUV(1,4));
    const outer=x+sx*tireHalf, inner=x-sx*tireHalf, cy=tireR;
    const no=N(sx,0,0), ni=N(-sx,0,0);
    for(let i=0;i<tireSides;i++){
      const a0=i*TAU/tireSides, a1=(i+1)*TAU/tireSides;
      const z0=az+Math.cos(a0)*tireR, y0=cy+Math.sin(a0)*tireR;
      const z1=az+Math.cos(a1)*tireR, y1=cy+Math.sin(a1)*tireR;
      
      mb.tri(P(outer,cy,az),P(outer,y0,z0),P(outer,y1,z1),no[0],no[1],no[2],
        DARK[0],DARK[3],DARK[2],DARK[1],DARK[2],DARK[3]);
      mb.tri(P(inner,cy,az),P(inner,y1,z1),P(inner,y0,z0),ni[0],ni[1],ni[2],
        DARK[0],DARK[3],DARK[2],DARK[1],DARK[2],DARK[3]);
      q(DARK,N(0,Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)),
        P(outer,y0,z0),P(outer,y1,z1),P(inner,y1,z1),P(inner,y0,z0));
    }
    
    if(near && (az===axleF || Math.abs(x)>K.treadR)){
      const rim=tireR*.60, hub=tireR*.20, faceX=outer+sx*.005;
      for(let i=0;i<tireSides;i++){
        const a0=i*TAU/tireSides, a1=(i+1)*TAU/tireSides;
        mb.tri(P(faceX,cy,az),P(faceX,cy+Math.sin(a1)*rim,az+Math.cos(a1)*rim),
          P(faceX,cy+Math.sin(a0)*rim,az+Math.cos(a0)*rim),no[0],no[1],no[2],
          RIM[0],RIM[3],RIM[2],RIM[1],RIM[2],RIM[3]);
        mb.tri(P(faceX+sx*.002,cy,az),P(faceX+sx*.002,cy+Math.sin(a0)*hub,az+Math.cos(a0)*hub),
          P(faceX+sx*.002,cy+Math.sin(a1)*hub,az+Math.cos(a1)*hub),no[0],no[1],no[2],
          CHROME[0],CHROME[3],CHROME[2],CHROME[1],CHROME[2],CHROME[3]);
      }
      for(let bolt=0;bolt<6;bolt++){
        const a=bolt*TAU/6, bz=az+Math.cos(a)*rim*.36, by=cy+Math.sin(a)*rim*.36, br=.035;
        for(let j=0;j<6;j++){
          const b0=j*TAU/6,b1=(j+1)*TAU/6;
          mb.tri(P(faceX+sx*.004,by,bz),P(faceX+sx*.004,by+Math.sin(b1)*br,bz+Math.cos(b1)*br),
            P(faceX+sx*.004,by+Math.sin(b0)*br,bz+Math.cos(b0)*br),no[0],no[1],no[2],
            CHROME[0],CHROME[3],CHROME[2],CHROME[1],CHROME[2],CHROME[3]);
        }
      }
    }
  };
  for(const [az,x,sx] of wheels) wheel(az,x,sx);


  buildTruckCabRaw(mb,c,K,P,dist);
  
  for(const sg of [-1,1]){
    const x0=sg<0?-K.lampX[1]:K.lampX[0], x1=sg<0?-K.lampX[0]:K.lampX[1];
    q(TAIL,N(0,0,-1),P(x1,K.lampY[0],cargoRear-.018),P(x0,K.lampY[0],cargoRear-.018),P(x0,K.lampY[1],cargoRear-.018),P(x1,K.lampY[1],cargoRear-.018));
  }
  
  
  const flat=(uv)=>{const u=uv[0]+(uv[2]-uv[0])*.37,v=uv[1]+(uv[3]-uv[1])*.43;return[u,v,u,v];};
  const CR=flat(RED), BK=flat(DARK), SIL=flat(RIM), CH=flat(CHROME), AM=flat(BEACON);
  const cyl=(uv,a,b,r,segments=near?12:8)=>{
    const v=b.map((n,i)=>n-a[i]),len=Math.hypot(...v),d=v.map(n=>n/len);
    const seed=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    let e=cross(d,seed),el=Math.hypot(...e);e=e.map(n=>n/el);const f=cross(d,e);
    const point=(p,t)=>p.map((n,i)=>n+r*(e[i]*Math.cos(t)+f[i]*Math.sin(t)));
    for(let j=0;j<segments;j++){
      const t=j*TAU/segments,u=(j+1)*TAU/segments,m=(t+u)/2,n=e.map((v,i)=>v*Math.cos(m)+f[i]*Math.sin(m));
      q(uv,N(...n),P(...point(a,t)),P(...point(a,u)),P(...point(b,u)),P(...point(b,t)));
      tri(uv,N(...d.map(v=>-v)),P(...a),P(...point(a,u)),P(...point(a,t)));
      tri(uv,N(...d),P(...b),P(...point(b,t)),P(...point(b,u)));
    }
  };
  
  for(const sg of[-1,1]){
    box(BK,sg*.44-.055,sg*.44+.055,.43,.63,cargoRear+.09,cabRear+.10);
    box(BK,sg*(W+.045)-.035,sg*(W+.045)+.035,.43,.49,axleR+.46,cargoFront-.17);
    for(const z of[cargoFront-.30,axleR+.59])box(BK,sg*(W+.02)-.025,sg*(W+.02)+.025,.48,.78,z-.025,z+.025);
    
    box(B,sg*W-.025,sg*W+.025,deckY,gateY,cargoRear,cargoFront);
    box(SIL,sg*W-.029,sg*W+.029,gateY-.026,gateY+.015,cargoRear,cargoFront);
    if(near)for(let z=cargoRear+.22;z<cargoFront-.08;z+=.67){
      box(B,sg*(W+.029)-.018,sg*(W+.029)+.018,deckY,gateY-.04,z-.018,z+.018);
      box(SIL,sg*(W+.034)-.025,sg*(W+.034)+.025,deckY+.018,deckY+.063,z-.075,z+.075);
    }
    
    box(BK,sg*.70-.20,sg*.70+.20,.73,.77,axleR-.43,axleR+.43);
    box(BK,sg*.70-.20,sg*.70+.20,.18,.70,axleR-.45,axleR-.415);
  }
  box(SIL,-W,W,deckY-.09,deckY-.015,cargoRear,cargoFront);
  box(BK,-W+.06,W-.06,deckY-.015,deckY,cargoRear+.03,cargoFront-.03);
  if(near)for(let z=cargoRear+.16;z<cargoFront-.04;z+=.22)box(SIL,-W+.07,W-.07,deckY+.001,deckY+.004,z,z+.008);
  box(B,-W,W,deckY,gateY,cargoRear-.035,cargoRear+.015);
  box(SIL,-W,W,gateY-.025,gateY+.015,cargoRear-.038,cargoRear+.018);
  box(SIL,-W+.10,W-.10,.38,.48,cargoRear-.10,cargoRear-.01);
  if(near)for(const x of[-.63,0,.63])box(SIL,x-.06,x+.06,deckY+.025,deckY+.075,cargoRear-.047,cargoRear-.035);
  
  for(const x of[-W+.045,W-.045])box(B,x-.035,x+.035,deckY,2.22,cargoFront-.045,cargoFront+.045);
  box(B,-W,W,2.15,2.22,cargoFront-.045,cargoFront+.045);
  box(B,-W+.045,W-.045,deckY,1.28,cargoFront-.035,cargoFront+.025);
  for(const [x0,x1] of[[-W+.08,-.05],[.02,W-.08]]){
    box(B,x0,x1,1.40,2.10,cargoFront-.21,cargoFront-.045);
    if(near){box(SIL,x1-.08,x1-.04,1.69,1.78,cargoFront-.224,cargoFront-.209);}
  }
  
  const cz=.48,cx=.23;
  box(CR,-.72,.72,.71,.99,.23,.73);
  cyl(BK,[cx,.99,cz],[cx,1.10,cz],.30);
  cyl(CR,[cx,1.10,cz],[cx,1.30,cz],.255);
  box(CR,cx-.19,cx+.19,1.23,2.26,cz-.18,cz+.17);
  
  cyl(CR,[cx-.25,2.23,cz],[cx+.25,2.23,cz],.225);
  cyl(SIL,[cx-.265,2.23,cz],[cx+.265,2.23,cz],.075);
  cyl(CR,[cx,1.25,cz-.13],[cx,1.87,cz-.67],.082);
  cyl(CH,[cx,1.79,cz-.60],[cx,2.26,cz-1.03],.043);
  
  box(CR,cx-.205,cx+.205,2.24,2.64,-1.34,.64);
  box(CR,cx-.17,cx+.17,2.275,2.60,-2.12,-1.28);
  box(CR,cx-.135,cx+.135,2.305,2.565,-2.60,-2.07);
  for(const z of[-1.32,-2.10])box(BK,cx-.215,cx+.215,2.23,2.645,z-.026,z+.026);
  box(CR,cx-.18,cx+.18,2.13,2.59,-2.67,-2.56);
  cyl(BK,[cx-.19,2.22,-2.615],[cx+.19,2.22,-2.615],.105);
  
  cyl(BK,[cx,2.18,-2.62],[cx,1.94,-2.62],.011,6);
  cyl(CR,[cx-.065,1.96,-2.62],[cx+.065,1.96,-2.62],.070,10);
  if(near){
    const center=[cx,1.78,-2.62],rr=.105;
    for(let i=0;i<9;i++){const a=(-.25+i*.175)*Math.PI,b=(-.25+(i+1)*.175)*Math.PI;cyl(BK,[center[0]+Math.cos(a)*rr,center[1]+Math.sin(a)*rr,center[2]],[center[0]+Math.cos(b)*rr,center[1]+Math.sin(b)*rr,center[2]],.023,6);}
    
    for(const x of[cx-.12,cx-.07,cx-.02])cyl(BK,[x,1.2,.29],[x,2.22,.29],.011,6);
    box(BK,cx+.208,cx+.214,2.33,2.48,-.72,-.23);
    cyl(CR,[cx-.10,2.64,.32],[cx-.10,2.71,.32],.025,8);
    cyl(CR,[cx+.10,2.64,.32],[cx+.10,2.71,.32],.025,8);
    cyl(CR,[cx-.10,2.71,.32],[cx+.10,2.71,.32],.025,8);
  }
  
  for(const sg of[-1,1]){
    box(CR,Math.min(0,sg*(W+.04)),Math.max(0,sg*(W+.04)),.73,.89,.24,.52);
    const x=sg*(W+.045);
    cyl(CR,[x,.36,.37],[x,1.13,.37],.085);
    cyl(CH,[x,.265,.37],[x,.42,.37],.042);
    cyl(CR,[x,.245,.37],[x,.275,.37],.125);
  }
  
  for(const sg of[-1,1]){
    const x=sg*(W-.01);box(BK,x-.025,x+.025,1.01,1.50,.21,.67);
    if(near)for(let i=0;i<5;i++){const z=.25+i*.075;cyl(CR,[x,1.09,z],[x+sg*.14,1.19,z],.014,6);cyl(BK,[x+sg*.14,1.19,z-.018],[x+sg*.14,1.19,z+.018],.030,8);}
  }
  
  box(BK,-.45,.45,cabRoof+.015,cabRoof+.05,L-.83,L-.50);
  box(AM,-.41,.41,cabRoof+.05,cabRoof+.23,L-.80,L-.53);
  if(near)for(const x of[-.27,.27])cyl(AM,[x,cabRoof+.13,L-.516],[x,cabRoof+.13,L-.529],.080,12);
  
  box(SIL,-.17,.17,.36,.51,L+.017,L+.027);
  box(SIL,-.17,.17,.61,.76,cargoRear-.037,cargoRear-.025);
  mb.grade(0);
}
function pushSedanBody(mb,c,K,P){
  const S=Math.sin(c.head), C=Math.cos(c.head);
  const unit=n=>{ const d=Math.hypot(n[0],n[1],n[2])||1; return [n[0]/d,n[1]/d,n[2]/d]; };

  const N=c._roadNormalTransform||((x,y,z)=>[-x*C+z*S,y,x*S+z*C]);
  const B=CUV(c.col[0],c.col[1]), GLASS=CUV(1,1), DARK=CUV(2,1), TIRE=CUV(2,1), RIM=CUV(0,4);
  const q=(uv,n,a,b,d,e)=>{
    const nn=N(...unit(n));
    mb.quad(P(...a),P(...b),P(...d),P(...e),nn[0],nn[1],nn[2],uv[0],uv[3],uv[2],uv[1]);
  };
  const tri=(uv,n,a,b,d)=>{
    const nn=N(...unit(n)), u=(uv[0]+uv[2])/2, v=(uv[1]+uv[3])/2;
    mb.tri(P(...a),P(...b),P(...d),nn[0],nn[1],nn[2],u,v,uv[0],uv[3],uv[2],uv[3]);
  };
  const W=K.W, L=K.L, belt=K.belt, roof=K.yC;
  const sill=K.sill, tireR=K.tireR;
  const cabinFront=K.cabF, cabinBack=K.cabB;



  const axleF=L-.935, axleB=axleF-2.640;


  const wheel=(axle,halfTrack)=>{
    for(const sg of [-1,1]){
      const outer=sg*(halfTrack+.100), inner=sg*(halfTrack-.100), cy=tireR;
      for(let i=0;i<8;i++){

        const a0=-Math.PI/2+i*TAU/8,a1=-Math.PI/2+(i+1)*TAU/8, m=(a0+a1)/2;
        const p0=[outer,cy+Math.sin(a0)*tireR,axle+Math.cos(a0)*tireR];
        const p1=[outer,cy+Math.sin(a1)*tireR,axle+Math.cos(a1)*tireR];
        tri(TIRE,[sg,0,0],[outer,cy,axle],p0,p1);
        q(TIRE,[sg*.55,Math.sin(m),Math.cos(m)],p0,p1,
          [inner,cy+Math.sin(a1)*tireR,axle+Math.cos(a1)*tireR],
          [inner,cy+Math.sin(a0)*tireR,axle+Math.cos(a0)*tireR]);
      }


      const rimR=.1905, rimX=outer+sg*.003, nn=N(sg,0,0);
      const rimPoint=a=>[rimX,cy+Math.sin(a)*rimR,axle+Math.cos(a)*rimR];
      const rimUV=a=>[(RIM[0]+RIM[2])/2+Math.cos(a)*(RIM[2]-RIM[0])/2,
        (RIM[1]+RIM[3])/2-Math.sin(a)*(RIM[3]-RIM[1])/2];
      for(let i=0;i<8;i++){
        const a=-Math.PI/2+i*TAU/8,b=a+TAU/8,uvA=rimUV(a),uvB=rimUV(b);
        mb.tri(P(rimX,cy,axle),P(...rimPoint(a)),P(...rimPoint(b)),...nn,
          (RIM[0]+RIM[2])/2,(RIM[1]+RIM[3])/2,...uvA,...uvB);
      }
    }
  };
  wheel(axleF,K.treadF); wheel(axleB,K.treadR);


  for(const sg of [-1,1]){
    const x=sg*W, n=[sg,0,0];
    for(const [z0,z1] of [[-L,-1.66],[-1.00,.98],[1.64,L]])
      q(B,n,[x,sill,z0],[x,sill,z1],[x,.64,z1],[x,.64,z0]);

    q(B,n,[x,.64,cabinBack],[x,.64,cabinFront],[x,belt,cabinFront],[x,belt,cabinBack]);

    q(B,n,[x,.64,cabinFront],[x,.64,.56],[x,.99,.56],[x,belt,cabinFront]);
    q(B,n,[x,.64,.56],[x,.64,L],[x,.90,L],[x,.99,.56]);

    q(B,n,[x,.64,-L],[x,.64,-1.48],[x,.96,-1.48],[x,.90,-L]);
    q(B,n,[x,.64,-1.48],[x,.64,cabinBack],[x,belt,cabinBack],[x,.96,-1.48]);
  }

  q(B,[0,0,1],[-.72,sill,L],[.72,sill,L],[.72,.90,L],[-.72,.90,L]);
  q(B,[0,0,-1],[.72,sill,-L],[-.72,sill,-L],[-.72,.90,-L],[.72,.90,-L]);
  for(const sg of [-1,1]){
    q(B,[sg,0,.45],[sg*.72,sill,L],[sg*W,sill,L-.18],[sg*W,.80,L-.18],[sg*.72,.90,L]);
    q(B,[sg,0,-.45],[sg*W,sill,-L+.16],[sg*.72,sill,-L],[sg*.72,.90,-L],[sg*W,.90,-L+.16]);
  }

  q(B,[0,1,.12],[-.66,.99,.56],[.66,.99,.56],[.72,.90,L],[-.72,.90,L]);
  q(B,[0,1,-.12],[.70,.96,-1.48],[-.70,.96,-1.48],[-.72,.90,-L],[.72,.90,-L]);


  const roofW=W-.145, cabF=cabinFront, cabB=cabinBack, roofF=K.cabF2, roofB=K.cabB2;
  q(B,[-1,.24,0],[-W,belt,cabB],[-W,belt,cabF],[-roofW,roof,roofF],[-roofW,roof,roofB]);
  q(B,[1,.24,0],[W,belt,cabF],[W,belt,cabB],[roofW,roof,roofB],[roofW,roof,roofF]);
  q(B,[0,.55,.84],[-W,belt,cabF],[W,belt,cabF],[roofW,roof,roofF],[-roofW,roof,roofF]);
  q(B,[0,.55,-.84],[W,belt,cabB],[-W,belt,cabB],[-roofW,roof,roofB],[roofW,roof,roofB]);
  q(B,[0,1,0],[-roofW,roof,roofB],[-roofW,roof,roofF],[roofW,roof,roofF],[roofW,roof,roofB]);


  const sideX=(sg,y)=>sg*(W-(W-roofW)*(y-belt)/(roof-belt)+.006);
  const screenX=(sg,y)=>sg*(W-(W-roofW)*(y-belt)/(roof-belt)-.040);
  const frontZ=y=>cabF+(roofF-cabF)*(y-belt)/(roof-belt)+.006;
  const rearZ=y=>cabB+(roofB-cabB)*(y-belt)/(roof-belt)-.006;
  const sideGlass=(sg,z0,z1,t0,t1)=>q(GLASS,[sg,.20,0],
    [sideX(sg,belt+.045),belt+.045,z0],[sideX(sg,belt+.045),belt+.045,z1],
    [sideX(sg,roof-.055),roof-.055,t1],[sideX(sg,roof-.055),roof-.055,t0]);
  for(const sg of [-1,1]){
    sideGlass(sg,.53,-.34,.00,-.48);
    sideGlass(sg,-.48,-1.42,-.60,-1.14);
  }
  const glassY0=belt+.045, glassY1=roof-.055;
  q(GLASS,[0,.55,.84],[screenX(-1,glassY0),glassY0,frontZ(glassY0)],[screenX(1,glassY0),glassY0,frontZ(glassY0)],
    [roofW-.04,glassY1,frontZ(glassY1)],[-roofW+.04,glassY1,frontZ(glassY1)]);
  q(GLASS,[0,.55,-.84],[roofW-.04,glassY1,rearZ(glassY1)],[-roofW+.04,glassY1,rearZ(glassY1)],
    [screenX(-1,glassY0),glassY0,rearZ(glassY0)],[screenX(1,glassY0),glassY0,rearZ(glassY0)]);



  const [ly0,ly1]=K.lampY, [lx0,lx1]=K.lampX, LENS=CUV(3,1), TAIL=CUV(1,2);
  for(const sg of [-1,1]){
    const a=sg<0?-lx1:lx0, b=sg<0?-lx0:lx1;
    q(LENS,[0,0,1],[a,ly0,L+.012],[b,ly0,L+.012],[b,ly1,L+.012],[a,ly1,L+.012]);
    q(TAIL,[0,0,-1],[b,ly0,-L-.012],[a,ly0,-L-.012],[a,ly1,-L-.012],[b,ly1,-L-.012]);
  }
  const mirrorY=belt+.10, mirrorZ=cabF+.05;
  for(const sg of [-1,1]){
    const x0=sg*(W+.02), x1=sg*(W+.19);
    q(B,[0,1,0],[x0,mirrorY+.09,mirrorZ+.06],[x1,mirrorY+.09,mirrorZ+.06],
      [x1,mirrorY+.09,mirrorZ-.06],[x0,mirrorY+.09,mirrorZ-.06]);
    q(B,[sg,0,0],[x1,mirrorY,mirrorZ-.06],[x1,mirrorY,mirrorZ+.06],
      [x1,mirrorY+.09,mirrorZ+.06],[x1,mirrorY+.09,mirrorZ-.06]);
  }
  const PLATE=CUV(3,3), REFLEX=CUV(1,3), plateW=.165, plateH=.165;

  const PLATE_FRONT=[PLATE[2],PLATE[1],PLATE[0],PLATE[3]];
  mb.grade(RETRO.plate);
  q(PLATE_FRONT,[0,0,1],[-plateW,.34,L+.01],[plateW,.34,L+.01],
    [plateW,.34+plateH,L+.01],[-plateW,.34+plateH,L+.01]);
  q(PLATE,[0,0,-1],[-plateW,.34,-L-.01],[plateW,.34,-L-.01],
    [plateW,.34+plateH,-L-.01],[-plateW,.34+plateH,-L-.01]);
  mb.grade(RETRO.reflex);
  for(const sg of [-1,1]){
    const a=sg*(W-.21), b=sg*(W-.07), x0=Math.min(a,b), x1=Math.max(a,b);
    q(REFLEX,[0,0,-1],[x1,.42,-L-.014],[x0,.42,-L-.014],[x0,.52,-L-.014],[x1,.52,-L-.014]);
  }
  mb.grade(0);
}
const AERIAL_SPEC=Object.freeze({W:.90,L:2.3425,cabF:2.3425,cabB:.88,boxF:.10,boxB:-3.30,axleF:1.300,axleB:-2.04,treadF:.75,treadR:.67,deckY:.93,gateY:1.35});
function buildAerialBodyRaw(mb, c, K, P, dist){
  K={...K,...AERIAL_SPEC};
  const originalP=P; P=(x,y,z)=>originalP(x,y,z+.48);
  if(c.kind !== 'aerial' || dist > 160) return;

  const S=Math.sin(c.head), C=Math.cos(c.head);

  const N=(x,y,z)=>{
    const nx=-x*C+z*S, ny=y, nz=x*S+z*C, d=Math.hypot(nx,ny,nz)||1;
    return [nx/d,ny/d,nz/d];
  };
  const B=CUV(c.col[0],c.col[1]);
  const GLASS=CUV(1,1), DARK=CUV(2,1), LENS=CUV(3,1), TAIL=CUV(1,2);

  const METAL=CUV(2,1), RIM=CUV(0,4), CHROME=CUV(1,4), PLATE=CUV(3,3), RED=CUV(1,3), BEACON=CUV(6,0);
  const q=(uv,n,a,b,d,e)=>mb.quad(a,b,d,e,n[0],n[1],n[2],uv[0],uv[3],uv[2],uv[1]);
  const side=(uv,sg,y0,y1,z0,z1,offset=0)=>{
    const x=sg*(K.W+offset);
    q(uv,N(sg,0,0),P(x,y0,z0),P(x,y0,z1),P(x,y1,z1),P(x,y1,z0));
  };
  const front=(uv,y0,y1,x0,x1,z,normal=1)=>
    q(uv,N(0,0,normal),P(x0,y0,z),P(x1,y0,z),P(x1,y1,z),P(x0,y1,z));
  const tri=(uv,n,a,b,d)=>mb.tri(a,b,d,n[0],n[1],n[2],uv[0],uv[3],uv[2],uv[1],uv[2],uv[3]);
  const box=(uv,x0,x1,y0,y1,z0,z1)=>{
    front(uv,y0,y1,x0,x1,z1,1);front(uv,y0,y1,x0,x1,z0,-1);
    for(const [x,sg] of [[x0,-1],[x1,1]])q(uv,N(sg,0,0),P(x,y0,z0),P(x,y0,z1),P(x,y1,z1),P(x,y1,z0));
    q(uv,N(0,1,0),P(x0,y1,z0),P(x0,y1,z1),P(x1,y1,z1),P(x1,y1,z0));
    q(uv,N(0,-1,0),P(x0,y0,z1),P(x0,y0,z0),P(x1,y0,z0),P(x1,y0,z1));
  };

  const W=K.W, L=K.L, cabRear=K.cabB, axleF=K.axleF, axleR=K.axleB;
  const deckY=K.deckY, gateY=K.gateY, bodyBottom=K.sill;
  const cabRoof=TRUCK_CAB_SPEC.roofY, cabWindowBottom=1.12, near=dist<=90;
  const cargoFront=K.boxF, cargoRear=K.boxB, cargoW=W+0.022;



  const tireR=K.tireR, tireHalf=0.095, tireSides=near?24:12;
  const wheels=[
    [axleF,-K.treadF,-1],[axleF,K.treadF,1],
    [axleR,-(K.treadR+0.105),-1],[axleR,-(K.treadR-0.115),-1],
    [axleR, K.treadR+0.105,1],[axleR, K.treadR-0.115,1]
  ];
  const wheel=(az,x,sx)=>{

    const flat=(uv)=>{const u=(uv[0]+uv[2])/2,v=(uv[1]+uv[3])/2;return[u,v,u,v];};
    const DARK=flat(CUV(2,1)),RIM=flat(CUV(0,4)),CHROME=flat(CUV(1,4));
    const outer=x+sx*tireHalf, inner=x-sx*tireHalf, cy=tireR;
    const no=N(sx,0,0), ni=N(-sx,0,0);
    for(let i=0;i<tireSides;i++){
      const a0=i*TAU/tireSides, a1=(i+1)*TAU/tireSides;
      const z0=az+Math.cos(a0)*tireR, y0=cy+Math.sin(a0)*tireR;
      const z1=az+Math.cos(a1)*tireR, y1=cy+Math.sin(a1)*tireR;

      mb.tri(P(outer,cy,az),P(outer,y0,z0),P(outer,y1,z1),no[0],no[1],no[2],
        DARK[0],DARK[3],DARK[2],DARK[1],DARK[2],DARK[3]);
      mb.tri(P(inner,cy,az),P(inner,y1,z1),P(inner,y0,z0),ni[0],ni[1],ni[2],
        DARK[0],DARK[3],DARK[2],DARK[1],DARK[2],DARK[3]);
      q(DARK,N(0,Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)),
        P(outer,y0,z0),P(outer,y1,z1),P(inner,y1,z1),P(inner,y0,z0));
    }

    if(near && (az===axleF || Math.abs(x)>K.treadR)){
      const rim=tireR*.60, hub=tireR*.20, faceX=outer+sx*.005;
      for(let i=0;i<tireSides;i++){
        const a0=i*TAU/tireSides, a1=(i+1)*TAU/tireSides;
        mb.tri(P(faceX,cy,az),P(faceX,cy+Math.sin(a1)*rim,az+Math.cos(a1)*rim),
          P(faceX,cy+Math.sin(a0)*rim,az+Math.cos(a0)*rim),no[0],no[1],no[2],
          RIM[0],RIM[3],RIM[2],RIM[1],RIM[2],RIM[3]);
        mb.tri(P(faceX+sx*.002,cy,az),P(faceX+sx*.002,cy+Math.sin(a0)*hub,az+Math.cos(a0)*hub),
          P(faceX+sx*.002,cy+Math.sin(a1)*hub,az+Math.cos(a1)*hub),no[0],no[1],no[2],
          CHROME[0],CHROME[3],CHROME[2],CHROME[1],CHROME[2],CHROME[3]);
      }
      for(let bolt=0;bolt<6;bolt++){
        const a=bolt*TAU/6, bz=az+Math.cos(a)*rim*.36, by=cy+Math.sin(a)*rim*.36, br=.035;
        for(let j=0;j<6;j++){
          const b0=j*TAU/6,b1=(j+1)*TAU/6;
          mb.tri(P(faceX+sx*.004,by,bz),P(faceX+sx*.004,by+Math.sin(b1)*br,bz+Math.cos(b1)*br),
            P(faceX+sx*.004,by+Math.sin(b0)*br,bz+Math.cos(b0)*br),no[0],no[1],no[2],
            CHROME[0],CHROME[3],CHROME[2],CHROME[1],CHROME[2],CHROME[3]);
        }
      }
    }
  };
  for(const [az,x,sx] of wheels) wheel(az,x,sx);


  buildTruckCabRaw(mb,c,K,P,dist);

  for(const sg of [-1,1]){
    const x0=sg<0?-K.lampX[1]:K.lampX[0], x1=sg<0?-K.lampX[0]:K.lampX[1];
    q(TAIL,N(0,0,-1),P(x1,K.lampY[0],cargoRear-.018),P(x0,K.lampY[0],cargoRear-.018),P(x0,K.lampY[1],cargoRear-.018),P(x1,K.lampY[1],cargoRear-.018));
  }


  const aeFlat=(uv)=>{const u=uv[0]+(uv[2]-uv[0])*.37,v=uv[1]+(uv[3]-uv[1])*.43;return[u,v,u,v];};
  const aeBody=aeFlat(B),aeBasket=aeFlat(c.aerialPaint==='white-red'?CUV(6,4):B);
  const aeBlack=aeFlat(DARK),aeMetal=aeFlat(RIM),aeChrome=aeFlat(CHROME);
  const aeCyl=(uv,a,b,r,segments=near?10:6)=>{
    const axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis);
    if(!Number.isFinite(len)||len<1e-5)return;
    const d=axis.map(v=>v/len),seed=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
    const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    let e=cross(d,seed),el=Math.hypot(...e);
    if(el<1e-5)return;
    e=e.map(v=>v/el);const f=cross(d,e);
    const pt=(p,t)=>p.map((v,i)=>v+r*(e[i]*Math.cos(t)+f[i]*Math.sin(t)));
    for(let i=0;i<segments;i++){
      const a0=i*TAU/segments,a1=(i+1)*TAU/segments,am=(a0+a1)/2;
      const n=e.map((v,j)=>v*Math.cos(am)+f[j]*Math.sin(am));
      q(uv,N(...n),P(...pt(a,a0)),P(...pt(a,a1)),P(...pt(b,a1)),P(...pt(b,a0)));
      tri(uv,N(...d.map(v=>-v)),P(...a),P(...pt(a,a1)),P(...pt(a,a0)));
      tri(uv,N(...d),P(...b),P(...pt(b,a0)),P(...pt(b,a1)));
    }
  };

  box(aeBlack,-.73,.73,.56,.72,cargoRear+.10,cargoFront-.04);

  for(const aeS of[-1,1])box(aeBlack,aeS*.44-.050,aeS*.44+.050,.45,.62,cargoRear+.10,cabRear+.15);



  box(aeBlack,-.72,.72,.62,.65,.10,.855);
  box(aeBody,-.64,.10,.65,.76,.14,.845);
  box(aeBody,-.64,.10,.76,1.26,.20,.82);
  box(aeBlack,-.67,-.62,.80,1.19,.25,.77);
  box(aeMetal,-.645,.075,1.245,1.275,.18,.84);

  box(aeBlack,-.695,-.645,.82,1.15,.31,.72);
  for(const aeZ of[.36,.48,.60,.72])aeCyl(aeBlack,[-.71,.84,aeZ],[-.80,.98,aeZ],.013,near?6:5);
  for(const aeZ of[.40,.56,.70]){
    aeCyl(aeBody,[-.73,1.16,aeZ],[-.83,1.25,aeZ],.018,near?7:5);
    aeCyl(aeBlack,[-.84,1.25,aeZ-.020],[-.84,1.25,aeZ+.020],.033,near?8:6);
  }

  const aeSteps=[[.35,.43,.64,1.00,.18,.56],[.52,.60,.64,.94,.28,.67],[.69,.77,.64,.87,.38,.78]];
  for(const [aeY0,aeY1,aeX0,aeX1,aeZ0,aeZ1] of aeSteps){
    box(aeBody,aeX0,aeX1,aeY0,aeY1,aeZ0,aeZ1);
    box(aeMetal,aeX0+.018,aeX1-.018,aeY1,aeY1+.014,aeZ0+.020,aeZ1-.020);
  }

  aeCyl(aeBody,[.98,.42,.60],[.98,.88,.60],.022);
  aeCyl(aeBody,[.98,.88,.60],[.78,.88,.60],.022);
  aeCyl(aeBody,[.78,.88,.60],[.78,.80,.60],.022);

  box(aeMetal,-.79,.79,.72,.79,cargoRear+.06,cargoFront+.03);
  box(aeBody,-.73,.73,.79,.90,cargoRear+.03,cargoFront+.02);
  for(const aeS of[-1,1]){
    const aeX=aeS*(W-.035);

    box(aeBody,aeX-.030,aeX+.030,.83,1.34,-1.48,cargoFront-.02);
    box(aeBody,aeX-.030,aeX+.030,.83,1.24,cargoRear+.10,-2.57);
    box(aeMetal,aeX-.038,aeX+.038,1.29,1.34,-1.45,cargoFront-.05);
    box(aeMetal,aeX-.038,aeX+.038,1.19,1.24,cargoRear+.12,-2.55);

    box(aeBlack,aeS*.70-.21,aeS*.70+.21,.78,.83,axleR-.48,axleR+.48);
    box(aeBlack,aeS*.70-.21,aeS*.70+.21,.35,.78,axleR-.50,axleR-.46);
  }
  if(near){
    for(const aeZ of[-1.27,-.96,-.65,-3.03,-2.78])box(aeMetal,-.66,.66,.905,.915,aeZ,aeZ+.018);
    for(const aeS of[-1,1])for(const aeZ of[-1.25,-.82,-3.05,-2.72]){
      const aeX=aeS*(W+.012);box(aeBlack,aeX-.014,aeX+.014,.90,1.22,aeZ,aeZ+.018);
    }
  }


  box(aeBody,-.61,.61,.82,1.02,-2.78,-2.02);
  aeCyl(aeBlack,[0,1.02,-2.39],[0,1.16,-2.39],.43);
  aeCyl(aeBody,[0,1.14,-2.39],[0,1.31,-2.39],.36);
  box(aeBody,-.31,.31,1.27,2.10,-2.57,-2.20);
  aeCyl(aeBody,[-.38,2.06,-2.38],[.38,2.06,-2.38],.20);
  aeCyl(aeMetal,[-.43,2.06,-2.38],[.43,2.06,-2.38],.060);

  box(aeBody,-.215,.215,2.08,2.42,-2.43,-.80);
  box(aeBody,-.180,.180,2.125,2.385,-.84,.56);
  box(aeBody,-.145,.145,2.165,2.350,.52,1.72);
  for(const aeZ of[-.82,.54])box(aeBlack,-.225,.225,2.07,2.43,aeZ-.024,aeZ+.024);

  aeCyl(aeBody,[0,1.27,-2.31],[0,1.92,-1.88],.085);
  aeCyl(aeChrome,[0,1.90,-1.89],[0,2.18,-1.72],.046);
  aeCyl(aeBody,[0,1.31,-2.52],[0,1.91,-2.10],.072);
  aeCyl(aeChrome,[0,1.90,-2.11],[0,2.12,-1.96],.040);
  if(near)for(const aeX of[-.105,-.065,.065,.105])aeCyl(aeBlack,[aeX,1.25,-2.55],[aeX,2.08,-1.88],.012,6);


  for(const aeZ of[-2.93,.48])for(const aeS of[-1,1]){
    const aeOuter=aeS*(W+.18),aeInner=aeS*.18;
    box(aeBody,Math.min(aeInner,aeOuter),Math.max(aeInner,aeOuter),.70,.84,aeZ-.09,aeZ+.09);
    const aeX=aeS*(W+.15);
    aeCyl(aeBody,[aeX,.77,aeZ],[aeX,1.16,aeZ],.075);
    aeCyl(aeChrome,[aeX,.74,aeZ],[aeX,.88,aeZ],.043);
    aeCyl(aeBody,[aeX,.72,aeZ],[aeX,.745,aeZ],.125,near?10:6);
  }


  const aeZ0=1.60,aeZ1=2.55,aeX0=-.50,aeX1=.50,aeFloor=2.24,aeSkirtTop=2.76,aeRailTop=3.38;
  box(aeBasket,aeX0,aeX1,aeFloor,aeFloor+.075,aeZ0,aeZ1);
  box(aeBlack,aeX0+.05,aeX1-.05,aeFloor-.025,aeFloor,aeZ0+.05,aeZ1-.05);


  const aeSlitRows=[[2.315,2.370],[2.412,2.492],[2.534,2.614],[2.656,aeSkirtTop]];
  for(const aeZ of[aeZ0,aeZ1]){
    for(const [aeY0,aeY1] of aeSlitRows)box(aeBasket,aeX0,aeX1,aeY0,aeY1,aeZ-.015,aeZ+.015);
    for(const aeX of[-.50,-.105,.105,.50])box(aeBasket,aeX-.025,aeX+.025,2.370,2.656,aeZ-.015,aeZ+.015);
  }
  for(const aeS of[-1,1]){
    const aeX=aeS*.51;
    for(const [aeY0,aeY1] of aeSlitRows)box(aeBasket,aeX-.015,aeX+.015,aeY0,aeY1,aeZ0,aeZ1);

    for(const aeZ of[aeZ0,2.12,aeZ1])aeCyl(aeBasket,[aeX,aeSkirtTop,aeZ],[aeX,aeRailTop,aeZ],.026);
    aeCyl(aeBasket,[aeX,aeRailTop,aeZ0],[aeX,aeRailTop,aeZ1],.030);
  }
  for(const aeZ of[aeZ0,aeZ1])aeCyl(aeBasket,[aeX0,aeRailTop,aeZ],[aeX1,aeRailTop,aeZ],.030);

  box(aeBlack,.51,.88,2.70,3.24,2.08,2.47);
  box(aeBlack,.19,.44,2.16,2.34,1.53,1.77);
  aeCyl(aeBlack,[.43,2.23,1.65],[.43,2.58,1.65],.080);
  aeCyl(aeChrome,[.35,2.23,1.65],[.49,2.23,1.65],.045);
  aeCyl(aeBlack,[0,2.22,1.68],[0,2.26,1.68],.19);
  if(near){

    for(const aeY of[2.81,2.94,3.07])aeCyl(aeMetal,[.887,aeY,2.30],[.897,aeY,2.30],.026,8);
    aeCyl(aeBlack,[-.30,2.16,1.67],[-.10,2.16,1.67],.040);
    aeCyl(aeBlack,[.10,2.16,1.67],[.30,2.16,1.67],.040);
    for(const aeZ of[1.72,2.42])aeCyl(aeBasket,[.48,aeFloor+.08,aeZ],[.48,aeSkirtTop-.05,aeZ],.018,6);
  }
  mb.grade(0);

}
const AERIAL_BODY_CACHE=new WeakMap();
export {carTex};
export function vehicleRaw(kind){
 const mb=new Mesh(),P=(x,y,z)=>[-x,y,z];
 if(kind==='nbox')pushNBoxBody(mb,{head:0,nboxPaint:'dark-gray'},CARKIND.kei,P);
 else if(kind==='sedan')pushSedanBody(mb,{head:0,col:[0,0]},CARKIND.sedan,P);
 else if(kind==='aerial')buildAerialBodyRaw(mb,{kind:'aerial',head:0,col:[7,4]},CARKIND.unic,P,0);
 else if(kind==='unic')buildUnic3tBodyRaw(mb,{kind:'unic',head:0,col:[5,4]},CARKIND.unic,P,0);
 else {mb.scParts=[];const pose=()=>({P,N:P});buildScaniaBody(mb,{scaniaPaint:'dark-red',scaniaTrailer:true},{tractor:pose(),trailer:pose()},0);}
 return mb;
}
