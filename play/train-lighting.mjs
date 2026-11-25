const original=new WeakMap();
export function isTrainWindow(material){
  return material?.userData?.cab_material==='TintGlass'||/^(TintGlass|GlassLook)(\.\d+)?$/.test(material?.name||'');
}
export function setTrainWindowLights(root,night){
  const seen=new Set();let windows=0;
  root.traverse(object=>{
    if(!object.isMesh)return;
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      if(!isTrainWindow(material)||seen.has(material))continue;
      seen.add(material);windows++;
      if(!original.has(material))original.set(material,{color:material.emissive.clone(),intensity:material.emissiveIntensity});
      const saved=original.get(material);
      if(night){material.emissive.set('#ffe6b3');material.emissiveIntensity=.85;}
      else{material.emissive.copy(saved.color);material.emissiveIntensity=saved.intensity;}
    }
  });
  return windows;
}
