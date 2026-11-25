export function prepareSteamMotion(body){
 const wheels=[],rods=[],mainRods=[],pistons=[];
 body.traverse(o=>{if(o.name.startsWith('wheel_driver_'))wheels.push({node:o,base:o.rotation.z});
  if(o.name==='rod_left'||o.name==='rod_right')rods.push({node:o,x:o.position.x,y:o.position.y,phase:o.name==='rod_left'?0:Math.PI/2});
  for(const [prefix,list] of [['main_rod_',mainRods],['piston_',pistons]])if(o.name===prefix+'left'||o.name===prefix+'right')list.push({node:o,x:o.position.x,y:o.position.y,rotation:o.rotation.z,phase:o.name.endsWith('left')?0:Math.PI/2});});
 return wheels.length?{wheels,rods,mainRods,pistons,previous:null,angle:0}:null;
}
export function steamKinematics(angle,phase=0){
 const x=1.7+.26*Math.cos(phase-angle),y=.9+.26*Math.sin(phase-angle),dy=1.16-y,dx=Math.sqrt(3.8**2-dy**2);
 return{x,y,slider:x+dx,angle:Math.atan2(dy,dx)};
}
export function animateSteamMotion(motion,pose){
 if(!motion||!pose)return;
 if(motion.previous){const p=motion.previous,dx=pose[0]-p[0],dy=pose[1]-p[1];if(Math.hypot(dx,dy)<5)motion.angle=(motion.angle+(dx*Math.cos(pose[2])+dy*Math.sin(pose[2]))/.9)%(Math.PI*2);}
 motion.previous=[...pose];
 for(const w of motion.wheels)w.node.rotation.z=w.base-motion.angle;
 for(const r of motion.rods){r.node.position.x=r.x+.26*(Math.cos(r.phase-motion.angle)-Math.cos(r.phase));r.node.position.y=r.y+.26*(Math.sin(r.phase-motion.angle)-Math.sin(r.phase));}
 for(const r of motion.mainRods){const p=steamKinematics(motion.angle,r.phase),initial=steamKinematics(0,r.phase);r.node.position.x=r.x+p.x-initial.x;r.node.position.y=r.y+p.y-initial.y;r.node.rotation.z=r.rotation+p.angle-initial.angle;}
 for(const r of motion.pistons){r.node.position.x=r.x+steamKinematics(motion.angle,r.phase).slider-steamKinematics(0,r.phase).slider;}
}
