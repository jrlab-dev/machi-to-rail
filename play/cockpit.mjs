import * as T from 'three';

const profiles={
  original:['電車',140],tram:['路面電車',80],steam:['蒸気機関車',80],freight:['電気機関車',140],
  'limited-classic':['特急',140],'limited-stream':['特急',140],'limited-panorama':['展望特急',140],
  'express-short':['新幹線',320],'express-long':['新幹線',320],'express-retro':['新幹線',320],maglev:['リニア',500],
  monorail:['跨座式モノレール',100],'suspended-monorail':['懸垂式モノレール',100]
};

function drawInstruments(ctx,profile,speed,night,steam){
  const [name,limit]=profile;
  ctx.fillStyle=night?'#0b1518':'#122027';ctx.fillRect(0,0,640,240);
  function label(str,x,y,size,color,align='center'){
    ctx.textAlign=align;ctx.font='600 '+size+'px sans-serif';ctx.fillStyle=color;ctx.fillText(str,x,y);
  }
  function disc(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function line(x,y,xx,yy,width,color){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  const cx=144,cy=120,tint=steam?'#dccba6':night?'#b2d9c2':'#e3e9df';
  disc(cx,cy,109,steam?'#988157':'#84918d');disc(cx,cy,104,'#192021');disc(cx,cy,96,'#263032');
  const at=f=>Math.PI*(.76+1.48*f);
  const divisions=limit===500?50:limit===140?35:limit===100?25:40;
  for(let i=0;i<=divisions;i++){
    const a=at(i/divisions),c=Math.cos(a),s=Math.sin(a),major=i%5===0;
    line(cx+c*(major?72:82),cy+s*(major?72:82),cx+c*89,cy+s*89,major?3:1.5,tint);
    if(major)label(Math.round(limit*i/divisions),cx+c*60,cy+s*60+5,15,tint);
  }
  label('km/h',cx,cy+52,15,tint);
  const a=at(Math.min(1,speed/limit));line(cx-Math.cos(a)*12,cy-Math.sin(a)*12,cx+Math.cos(a)*78,cy+Math.sin(a)*78,4,'#ff925d');disc(cx,cy,8,'#929b94');
  label(name,310,68,25,'#b8c6c1','left');
  line(310,84,597,84,2,'#445958');
  label(speed,497,177,86,'#f0f1dc','right');label('km/h',512,172,27,'#b5c3ba','left');
}

export function createCockpit(camera){
  const root=new T.Group();root.name='front-cockpit';root.visible=false;camera.add(root);
  const face=new T.PlaneGeometry(1,1);
  function surface(color,z){
    const mesh=new T.Mesh(face,new T.MeshBasicMaterial({color,toneMapped:false}));
    mesh.position.z=z;root.add(mesh);return mesh;
  }
  const desk=surface(0xffffff,-1),screen=surface(0xffffff,-.997);
  let finish;
  const frame=[surface(0x414b47,-1),surface(0x414b47,-1)];
  const seals=[surface(0x222829,-.998),surface(0x222829,-.998)];
  const arm=surface(0x353b39,-1.01),blade=surface(0x252b29,-1.012);
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=240;
  const ctx=canvas.getContext('2d'),map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;screen.material.map=map;
  let oldAspect,oldFov,oldType,oldSpeed,oldNight;
  function update({visible,speed=0,phase='day',type='original',foreground=false}){
    root.visible=visible;if(!visible)return;
    if(!finish){
      finish=new T.TextureLoader().load(new URL('./assets/cab-desk.webp',import.meta.url).href);
      finish.colorSpace=T.SRGBColorSpace;desk.material.map=finish;desk.material.needsUpdate=true;
    }
    root.scale.setScalar(foreground?.35:1);
    if(camera.aspect!==oldAspect||camera.fov!==oldFov){
      oldAspect=camera.aspect;oldFov=camera.fov;
      const v=Math.tan(T.MathUtils.degToRad(camera.fov/2)),w=v*camera.aspect;
      const height=v*.69,width=2*w,base=-v,top=base+height;
      desk.scale.set(width,height,1);desk.position.y=base+height/2;
      // Seat the live display inside the bezel in the desk artwork.
      const h=Math.min(height*.46,width*.55*240/640);
      screen.scale.set(h*640/240,h,1);
      screen.position.set(width*.017,(base+height*.574)*.997,-.997);
      for(let i=0;i<2;i++){
        const side=2*i-1;
        frame[i].scale.set(w*.037,v*2,1);frame[i].position.x=side*w*.986;
        seals[i].scale.set(w*.009,v*2,1);seals[i].position.x=side*w*.965;
      }
      function wiper(part,x1,y1,x2,y2,thickness){
        const dx=x2-x1,dy=y2-y1;part.scale.set(Math.hypot(dx,dy),thickness,1);
        part.rotation.z=Math.atan2(dy,dx);part.position.x=(x1+x2)/2;part.position.y=(y1+y2)/2;
      }
      wiper(arm,w*.93,top,w*.66,top+v*.18,v*.009);
      wiper(blade,w*.51,top+v*.19,w*.84,top+v*.17,v*.014);
    }
    const kmh=Math.round(Math.abs(speed)*3.6),night=phase==='night';
    if(type===oldType&&kmh===oldSpeed&&night===oldNight)return;
    oldType=type;oldSpeed=kmh;oldNight=night;
    desk.material.color.setScalar(night?.38:1);screen.material.color.setScalar(night?.72:1);
    drawInstruments(ctx,profiles[type]||profiles.original,kmh,night,type==='steam');map.needsUpdate=true;
  }
  return {root,update};
}
