import * as T from 'three';
import {suspendedStations} from './suspended-route.mjs?v=rail-90';

export function stationSigns(root,resources){
  const cache=new Map(),plane=new T.PlaneGeometry();
  const english=['SHIOMI CENTRAL','SAKURAGAOKA','MIDORIDANI PARK','YAMANOTE','SHIOMI BEACH'];
  resources.push(plane);
  const groups=new Map(),pose=new T.Object3D();
  function board(text,x,h,z,w,height,angle=0,bg='#253e4b'){
    const key=bg+'|'+text;
    if(!cache.has(key)){
      const station=suspendedStations.findIndex(s=>s.name===text);
      const poster=text==='海辺の散歩道'||text==='緑谷の森へ';
      const c=document.createElement('canvas');c.width=poster?384:640;c.height=poster?240:144;
      const ctx=c.getContext('2d'),cw=c.width,ch=c.height;
      const fill=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
      const label=(s,x,y,size,color,limit=cw-20)=>{ctx.font='bold '+size+'px sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s,x,y,limit);};
      fill(0,0,cw,ch,bg);
      if(station>=0){
        fill(0,0,cw,ch,'#e6ebe3');fill(0,85,cw,9,'#538b89');fill(13,13,67,59,bg);
        label('S0'+(station+1),46,52,26,'#fff');label(text,352,51,46,'#253e48');label(english[station],350,75,19,'#476267');
        label(suspendedStations[station-1]?.name||'起点',132,126,27,'#314e53');
        label(suspendedStations[station+1]?.name||'終点',500,126,27,'#314e53');
      }else if(poster){
        const sea=text==='海辺の散歩道';fill(0,0,cw,ch,sea?'#97c4c7':'#b4c4a0');
        ctx.fillStyle='#f0d6a0';ctx.beginPath();ctx.arc(300,53,27,0,2*Math.PI);ctx.fill();
        for(let k=0;k<3;k++){
          ctx.beginPath();ctx.moveTo(0,ch);
          for(let i=0;i<=cw;i+=4)ctx.lineTo(i,94+k*26+(sea?9:24)*Math.sin(i/(57-k*7)+k));
          ctx.lineTo(cw,ch);ctx.fillStyle=(sea?['#708d9a','#517f88','#e0c795']:['#99a688','#718d77','#4e7565'])[k];ctx.fill();
        }
        fill(0,181,cw,59,bg);label(text,192,222,32,'#fff4df');
      }else{
        fill(0,122,cw,7,'#deb377');label(text,cw/2,94,67,'#fff');
      }
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
      const m=new T.MeshBasicMaterial({map});cache.set(key,m);resources.push(map,m);
    }
    const id=key+'|'+Math.floor(x/300);
    if(!groups.has(id))groups.set(id,{material:cache.get(key),poses:[]});
    pose.position.set(x,h,z);pose.scale.set(w,height,1);pose.rotation.y=angle;pose.updateMatrix();
    groups.get(id).poses.push(pose.matrix.clone());
  }
  function finish(){
    for(const {material,poses} of groups.values()){
      const mesh=new T.InstancedMesh(plane,material,poses.length);
      poses.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();root.add(mesh);
    }
    groups.clear();
  }
  return {board,finish};
}
