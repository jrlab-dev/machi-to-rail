import * as T from 'three';

function paint(width,height,draw,resources){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  draw(canvas.getContext('2d'),width,height);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  resources.push(map);return map;
}
export function shiomiMaterials(resources){
  const materials={};
  function mapped(key,map,options={}){
    const m=new T.MeshStandardMaterial({map,roughness:.88,...options});resources.push(m);materials[key]=m;
  }
  // Bake small architectural details once for the whole neighbourhood.
  for(let variant=0;variant<3;variant++){
    const map=paint(384,256,(g,w,h)=>{
      const rect=(x,y,a,b,c)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
      rect(0,0,w,h,['#eadfcd','#d6d9cf','#e8d1be'][variant]);
      for(let y=0;y<250;y+=5)rect(0,y,w,1,'#c6bdb0');
      rect(0,0,w,12,'#acaa9d');rect(0,237,w,19,'#a69f94');
      function window(x,y,ww,hh,curtain){
        rect(x-4,y-4,ww+8,hh+8,'#ccc6b9');rect(x,y,ww,hh,'#425560');
        const gloss=g.createLinearGradient(0,y,0,y+hh);gloss.addColorStop(0,'#647e8b');gloss.addColorStop(.55,'#abc0bc');gloss.addColorStop(1,'#697e80');
        rect(x+3,y+3,ww-6,hh-6,gloss);
        if(curtain){rect(x+5,y+4,ww*.19,hh-8,'#d5d5c7');rect(x+ww*.74,y+4,ww*.21,hh-8,'#d0caba');}
        rect(x+ww/2,y,3,hh,'#59646a');rect(x-6,y+hh,ww+12,4,'#ece4d9');
      }
      window(27,35,94,59,true);window(164,32,125,68,variant!==1);
      if(variant!==2){rect(153,80,150,27,'#a09f96');for(let x=156;x<301;x+=9)rect(x,78,2,24,'#e0e0d5');rect(151,77,154,4,'#eee8db');}
      window(30,145,119,65,true);rect(177,134,54,103,'#736356');rect(185,142,36,68,'#9b8771');rect(219,192,3,12,'#ddd2b8');
      window(262,145,70,42,false);rect(306,203,44,26,'#d4d1c6');for(let y=207;y<226;y+=3)rect(311,y,32,1,'#9c9e96');
      rect(170,128,69,6,'#97958a');rect(0,117,w,3,'#b5b0a2');
    },resources);mapped('house'+variant,map);
  }
  const rockFace=paint(256,192,(g,w,h)=>{
    const pixels=g.createImageData(w,h);
    let seed=197;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const a=2*Math.PI*x/w,b=2*Math.PI*y/h;
      const seam=Math.sin(7*b+2*Math.sin(a)+.65*Math.sin(3*a+b));
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const grain=(seed/4294967296-.5)*22;
      const v=202+grain+10*Math.cos(a+3*b)+11*seam-30*Math.max(0,1-6*Math.abs(seam));
      const k=4*(x+y*w);
      pixels.data.set([v,v+1,v-3,255],k);
    }
    g.putImageData(pixels,0,0);
  },resources);
  rockFace.wrapS=rockFace.wrapT=T.RepeatWrapping;
  mapped('rockFace',rockFace,{side:T.DoubleSide});
  mapped('estate',paint(384,160,(g,w,h)=>{
    g.fillStyle='#e1dfd0';g.fillRect(0,0,w,h);
    for(let floor=0;floor<5;floor++)for(let flat=0;flat<8;flat++){
      const x=flat*48,y=floor*32;
      g.fillStyle='#9b9d92';g.fillRect(x,y,48,3);
      g.fillStyle='#667a7d';g.fillRect(x+5,y+7,30,21);
      g.fillStyle=(flat+floor)%3?'#a8b8b4':'#d5ceba';
      g.fillRect(x+7,y+9,12,17);g.fillRect(x+21,y+9,12,17);
      g.fillStyle='#b5b5a8';g.fillRect(x+38,y+19,8,6);
    }
  },resources));
  mapped('office',paint(256,256,(g,w,h)=>{
    g.fillStyle='#aebcb9';g.fillRect(0,0,w,h);
    for(let row=0;row<6;row++)for(let col=0;col<5;col++){
      const x=col*52,y=row*43,grad=g.createLinearGradient(x,y,x+35,y+40);
      grad.addColorStop(0,['#64838e','#5e7885','#7e959a'][(row+col*3)%3]);grad.addColorStop(1,'#b6c6c0');
      g.fillStyle=grad;g.fillRect(x+2,y+2,47,35);
      g.fillStyle=(row+col)%4?'#586d76':'#d8ccad';g.fillRect(x+3,y+3,45,(row*col+5)%11);
      g.fillStyle='#c0c9c5';g.fillRect(x+24,y+1,2,37);g.fillStyle='#84928f';g.fillRect(x,y+39,52,3);
    }
  },resources));
  mapped('tile',paint(256,128,g=>{
    g.fillStyle='#77818a';g.fillRect(0,0,256,128);
    for(let y=0;y<128;y+=10){g.fillStyle='#55616b';g.fillRect(0,y,256,2);for(let x=-9;x<256;x+=18){g.fillStyle='#9aa1a1';g.fillRect(x+(y%20?9:0),y+2,1,7);}}
  },resources));
  const grass=paint(256,256,(g,w,h)=>{
    g.fillStyle='#99ac82';g.fillRect(0,0,w,h);
    let seed=41;
    const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    // Wrap broad grass patches at the tile edges so distant verges retain variation.
    for(let i=0;i<26;i++){
      const cx=random()*w,cy=random()*h,radius=17+random()*28;
      for(const dx of [-w,0,w])for(const dy of [-h,0,h]){
        const x=cx+dx,y=cy+dy;
        if(x+radius<0||x-radius>w||y+radius<0||y-radius>h)continue;
        const patch=g.createRadialGradient(x,y,0,x,y,radius);
        patch.addColorStop(0,i%3?'#586f4f55':'#d8c88d70');patch.addColorStop(1,'#88947100');
        g.fillStyle=patch;g.fillRect(x-radius,y-radius,2*radius,2*radius);
      }
    }
    for(let i=0;i<4400;i++){
      g.fillStyle=['#889d794f','#afba8e70','#7d956e42'][i%3];
      g.fillRect(random()*w,random()*h,1+random()*5,1+random()*2);
    }
  },resources);
  grass.wrapS=grass.wrapT=T.RepeatWrapping;mapped('meadow',grass,{side:T.DoubleSide});
  const tactile=paint(128,64,g=>{
    g.fillStyle='#dfb649';g.fillRect(0,0,128,64);
    for(let j=0;j<5;j++)for(let i=0;i<10;i++){
      const x=(i+.5)*12.8,y=(j+.5)*12.8;
      g.fillStyle='#a88735';g.beginPath();g.arc(x+.8,y+1,3.5,0,Math.PI*2);g.fill();
      g.fillStyle='#f2ce6b';g.beginPath();g.arc(x,y,3.1,0,Math.PI*2);g.fill();
    }
    g.fillStyle='#bf9d3d';g.fillRect(0,0,1,64);g.fillRect(64,0,1,64);
  },resources);
  tactile.wrapS=T.RepeatWrapping;tactile.repeat.x=100;mapped('tactile',tactile);
  mapped('paving',paint(1024,128,(g,w,h)=>{
    g.fillStyle='#a9aaa2';g.fillRect(0,0,w,h);
    for(let j=0;j<6;j++)for(let i=-1;i<44;i++){
      const v=184+Math.abs(i*13+j*5)%10;
      g.fillStyle='rgb('+v+','+v+','+(v-6)+')';g.fillRect(i*24+(j%2)*12,j*22,23,21);
    }
    // Roof shade and fine aggregate are painted into the existing platform map.
    const shade=g.createLinearGradient(0,0,0,h);
    shade.addColorStop(0,'#eef0df24');shade.addColorStop(.19,'#4756501a');
    shade.addColorStop(.48,'#46535038');shade.addColorStop(.84,'#4756501a');
    shade.addColorStop(1,'#eef0df24');g.fillStyle=shade;g.fillRect(0,0,w,h);
    for(let i=0;i<2600;i++){
      const x=(i*379+(i>>3)*83)%w,y=(i*53+(i>>4)*17)%h;
      g.fillStyle=i%2?'#f6efcf28':'#4a534d20';g.fillRect(x,y,1,1);
    }
  },resources));
  const stone=paint(256,128,(g,w,h)=>{
    g.fillStyle='#7d817a';g.fillRect(0,0,w,h);
    for(let y=0;y<4;y++)for(let x=-1;x<4;x++){
      const tone=151+Math.abs(x*7-y*11)%18;
      g.fillStyle='rgb('+tone+','+(tone+3)+','+(tone-4)+')';g.fillRect(x*64+(y%2)*32,y*32,63,31);
      g.fillStyle='#c2c3b5';g.fillRect(x*64+(y%2)*32,y*32,63,1);
    }
  },resources);
  stone.wrapS=stone.wrapT=T.RepeatWrapping;mapped('stone',stone,{side:T.DoubleSide});
  const sand=paint(256,256,(g,w,h)=>{
    g.fillStyle='#dccba5';g.fillRect(0,0,w,h);
    for(let i=0;i<2400;i++){
      const x=(i*97+(i>>4)*17)%w,y=(i*13+(i>>3)*73)%h;
      g.fillStyle=i%3?'#b59c7036':'#fff2c87a';g.fillRect(x,y,1+i%4,1);
    }
  },resources);
  sand.wrapS=sand.wrapT=T.RepeatWrapping;mapped('sand',sand,{side:T.DoubleSide});
  const loader=new T.TextureLoader();
  for(const [key,file] of [['forest','forest-canopy-43.webp'],['spray','leaf-branch-43.webp']]){
    const tex=loader.load(new URL('./assets/landscape/'+file,import.meta.url).href);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
    tex.wrapS=tex.wrapT=T.RepeatWrapping;resources.push(tex);
    mapped(key,tex,key==='spray'?{side:T.DoubleSide,alphaTest:.46}:{side:T.DoubleSide});
  }
  const lin=paint(512,256,(g,w,h)=>{
    g.fillStyle='#959e9d';g.fillRect(0,0,w,h);
    let state=912;
    for(let k=0;k<13000;k++){state=(Math.imul(state,1664525)+1013904223)>>>0;const x=state%512,y=(state>>>13)%256;g.fillStyle=k%2?'#899391':'#a6aeaa';g.fillRect(x,y,1+(k%3),1);}
    for(let j=0;j<4;j++){const y=j*64;g.fillStyle='#727d7c';g.fillRect(0,y,w,2);g.fillRect(j%2?128:384,y,2,64);
      for(let i=0;i<4;i++){g.fillStyle='#758180';g.beginPath();g.arc(40+i*128,y+10,2,0,7);g.fill();}}
    const shade=g.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#1827203a');shade.addColorStop(.5,'#fff4ce29');shade.addColorStop(1,'#1827203a');g.fillStyle=shade;g.fillRect(0,0,w,h);
  },resources);lin.wrapS=lin.wrapT=T.RepeatWrapping;mapped('lining',lin,{side:T.DoubleSide});
  return materials;
}

export function shiomiCoast(root,resources){
  const water=new T.MeshStandardMaterial({color:'#458c99',roughness:.52,metalness:.09});
  const clock={value:0};
  water.onBeforeCompile=s=>{
    s.uniforms.shiomiTime=clock;
    s.vertexShader='varying vec3 shoreP;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nshoreP=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='varying vec3 shoreP;uniform float shiomiTime;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=shoreP.xz;float shore=2170.+4.*sin(p.y*.037)+2.*sin(p.y*.11);
      float dist=p.x-shore;float nearShore=1.-smoothstep(0.,85.,dist);
      float phi=p.x*.69+.8*sin(.15*p.y)+.43*sin(.42*p.y)-shiomiTime*.85;
      float ripple=sin(phi)*.5+.5;float detail=1.-smoothstep(80.,590.,distance(cameraPosition,shoreP));
      float deep=smoothstep(65.,470.,dist);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.067,.23,.32),deep*.68);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.24,.57,.48),nearShore*.8);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.33,.48,.55),smoothstep(650.,2100.,dist)*.55);
      diffuseColor.rgb+=vec3(.08,.11,.105)*pow(ripple,7.)*detail;
      float foam=(1.-smoothstep(.32,1.3,abs(mod(dist-shiomiTime*1.3,6.)-3.)))*(1.-smoothstep(0.,23.,dist));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.78,.85,.76),clamp(foam*.82,0.,1.));`);
  };
  const geo=new T.PlaneGeometry(4200,4800);geo.rotateX(-Math.PI/2);
  const m=new T.Mesh(geo,water);m.position.set(4248,-.55,0);root.add(m);resources.push(geo,water);
  return t=>{clock.value=t;};
}
