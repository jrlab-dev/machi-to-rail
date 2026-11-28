import * as T from 'three';
import {stations,length,services,sample,clock,clockText} from './san-kai-route.mjs?v=rail-97';
import {landscape,track,region} from './san-kai-landscape.mjs?v=rail-97';
import {createLimitedExpress} from './limited-express-model.mjs';
const el=id=>document.getElementById(id);
const renderer=new T.WebGLRenderer({canvas:el('view'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new T.Scene(),camera=new T.PerspectiveCamera(58,1,.25,1100);
scene.fog=new T.Fog(0xffffff,190,900);
const sky=new T.HemisphereLight(0xfff5e1,0x77745c,2.2),sun=new T.DirectionalLight(0xffedce,2);
sun.position.set(-200,210,-140);scene.add(sky,sun);
const updateLand=landscape(scene);
const starPositions=[];
for(let i=0;i<380;i++){
 const angle=i*2.39996,height=45+(i*137%300),rad=Math.sqrt(530**2-height**2);
 starPositions.push(Math.cos(angle)*rad,height,Math.sin(angle)*rad);
}
const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(starPositions,3));
const stars=new T.Points(starGeo,new T.PointsMaterial({color:0xffefcb,size:1.4,fog:false,transparent:true}));scene.add(stars);
const sunDisk=new T.Mesh(new T.SphereGeometry(12,20,12),new T.MeshBasicMaterial({color:0xffdb9a,fog:false}));scene.add(sunDisk);
function express(){
 const design={body:'#eee5cb',stripe:'#a13939',stripe2:'#d6a85b',door:'#e8ddc8',roof:'#6c7778',face:'#e9dfc5',name:'山海'};
 const model=createLimitedExpress('limited-classic',{count:3,cars:[{kind:'cab'},{kind:'middle'},{kind:'cab'}]},design);
 return model.cars.map(car=>{const pivot=new T.Group();for(const p of Object.values(car.parts))pivot.add(p);scene.add(pivot);return pivot});
}
function local(){
 const geo=new T.BoxGeometry(1,1,1),materials=new Map();
 return Array.from({length:3},()=>{
  const car=new T.Group();
  function box(x,y,z,w,h,d,c){
   if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c}));
   const part=new T.Mesh(geo,materials.get(c));part.position.set(x,y,z);part.scale.set(w,h,d);car.add(part);
  }
  box(0,1.9,0,19.5,2.9,2.76,'#dfdbce');box(0,3.43,0,19.6,.25,2.83,'#868e8b');box(0,.55,0,16,.8,2,'#3a4545');
  for(const side of [-1,1]){
   box(0,1.45,1.39*side,19.4,.35,.045,'#418981');
   for(let x=-8;x<=8;x+=2)box(x,2.47,1.39*side,1.42,.91,.04,'#364b56');
   box(9.78*side,2.5,0,.06,1,2.3,'#3e5960');box(9.8*side,1.6,0,.05,.35,2.74,'#418981');
  }
  scene.add(car);return car;
 });
}
const fast=express(),slow=local();
function pose(cars,m,lane,dir){
 cars.forEach((car,i)=>{
  const s=m-i*20.4*dir;car.position.copy(track(s,lane,1.29));
  const tangent=track(s+1).sub(track(s));car.rotation.y=Math.atan2(-tangent.z,tangent.x)+(dir<0?Math.PI:0);
 });
}
const palette=[[0,'#1d2948',.31],[4.5,'#263653',.37],[6,'#f5b18c',1.2],[8,'#afd6e4',2.15],[15,'#abd7e8',2.3],[17,'#f7c48e',1.75],[18.5,'#ce858a',.94],[20,'#26334f',.37],[24,'#1d2948',.31]];
function light(t){
 const {hour,minute}=clock(t),h=hour+minute/60,i=palette.findIndex(p=>p[0]>h);
 const [a,ca,la]=palette[i-1],[b,cb,lb]=palette[i],f=(h-a)/(b-a);
 const color=new T.Color(ca).lerp(new T.Color(cb),f);scene.background=color;scene.fog.color.copy(color);
 sky.intensity=la+(lb-la)*f;sun.intensity=sky.intensity*.81;
 stars.material.opacity=T.MathUtils.clamp((1.1-sky.intensity)*1.3,0,1);
 const angle=(h-6)*Math.PI/12;
 sunDisk.position.copy(camera.position).add(new T.Vector3(Math.cos(angle)*435,Math.sin(angle)*410,-120));
 sunDisk.visible=h>=6&&h<18;
 stars.position.copy(camera.position);
}
let service='express',time=0,running=false,last=0;
function info(){
 const plan=services[service],s=sample(plan,time),ended=time>=plan.duration;
 const next=plan.arrivals.find(a=>a.at>time)?.station;
 el('next').textContent=ended?'終着　山海温泉港':s.station?s.station.name+'　停車中':time===0?'都央　始発':('次は '+next?.name);
 el('clock').textContent=clockText(time);el('speed').textContent=Math.round(s.v*3.6)+' km/h';
 const nearby=stations.find(st=>!st.express&&Math.abs(s.m-st.m)<95);
 el('area').textContent=region(s.m)+(service==='express'&&nearby?'　'+nearby.name+' 通過':'');
 el('schedule').textContent='都央 15:00発　→　山海温泉港 '+clockText(plan.duration)+'着';
 el('progress').value=s.m/length;el('go').textContent=ended?'もう一度乗る':running?'一時停止':time?'旅を続ける':'出発する';
}
el('go').onclick=()=>{if(time>=services[service].duration)time=0;running=!running;info()};
el('service').onchange=e=>{service=e.target.value;running=false;time=0;lastUi=-1;info()};
document.addEventListener('visibilitychange',()=>{last=0});
el('list').onclick=()=>{
 const plan=services[service];
 el('times-list').replaceChildren(...stations.map(station=>{
  const item=document.createElement('li'),value=document.createElement('span');
  const arrival=plan.arrivals.find(row=>row.station===station);
  item.append(station.name);value.textContent=arrival?clockText(arrival.at):'通過';item.append(value);return item;
 }));
 el('times').showModal();
};
el('close-times').onclick=()=>el('times').close();
let lastUi=-1,previousView='';
function frame(now){
 const plan=services[service];
 if(running&&!document.hidden&&last){time=Math.min(plan.duration,time+Math.min(.25,(now-last)/1000)*Number(el('rate').value));if(time>=plan.duration)running=false}
 last=now;
 const canvas=renderer.domElement,w=canvas.clientWidth,h=canvas.clientHeight,view=el('camera').value;
 const resized=canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio());
 if(!running&&lastUi===Math.floor(time*8)&&previousView===view&&!resized){requestAnimationFrame(frame);return}
 previousView=view;
 const s=sample(plan,time),m=s.m;
 updateLand(m);const opposite=service==='express'?services.local:services.express;
 const other=sample(opposite,opposite.duration-((time+opposite.duration*.29)%opposite.duration));
 pose(service==='express'?fast:slow,m,-2.2,1);pose(service==='express'?slow:fast,other.m,2.2,-1);
 if(view==='cab'||(m>=15368&&m<=15728)){camera.position.copy(track(m+10.4,-2.2,4.25));camera.lookAt(track(m+90,-2.2,3.4))}
 else if(view==='side'){const side=m>=15750?1:-1;camera.position.copy(track(m+1,-2.2+side*1.65,3.85));camera.lookAt(track(m+27,side*90,9))}
 else{camera.position.copy(track(m+36,-21,13));camera.lookAt(track(m-13,-2.2,2.6))}
 if(resized){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 if(lastUi!==Math.floor(time*8)){lastUi=Math.floor(time*8);info()}light(time);
 renderer.render(scene,camera);requestAnimationFrame(frame);
}
info();requestAnimationFrame(frame);
