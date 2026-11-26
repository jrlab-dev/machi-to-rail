export function decodeRoadVehicle(meta,buffer){
 const d=new DataView(buffer);let offset=4;const grouped=d.getUint32(0,true)===0x3247534b;
 if(meta.version!==2||(!grouped&&d.getUint32(0,true)!==0x32544b53))throw Error('車両素材の形式がちがいます。');
 const specs=grouped?meta.groups:[{vertices:meta.vertices,triangles:meta.triangles,texture:-1}],parts=[];
 for(const spec of specs){const n=d.getUint32(offset,true),count=d.getUint32(offset+4,true),texture=grouped?d.getInt32(offset+8,true):-1;offset+=grouped?12:8;
  if(n!==spec.vertices||count!==spec.triangles*3||texture!==spec.texture)throw Error('車両素材の大きさがちがいます。');
  const v=[],indices=[],scale=meta.positionScale||8192;
  for(let i=0;i<n;i++){const p=offset+i*16;v.push(d.getInt16(p,true)/scale,d.getInt16(p+2,true)/scale,d.getInt16(p+4,true)/scale,d.getInt16(p+6,true)/32767,d.getInt16(p+8,true)/32767,d.getInt16(p+10,true)/32767,d.getUint16(p+12,true)/65535,grouped?d.getUint16(p+14,true)/65535:1-d.getUint16(p+14,true)/65535,0);}
  offset+=n*16;for(let i=0;i<count;i++){const index=d.getUint32(offset+i*4,true);if(index>=n)throw Error('車両素材の頂点が不正です。');indices.push(index);}offset+=count*4;
  parts.push({v,i:indices,n,plain:texture>=0});
 }
 if(offset!==buffer.byteLength)throw Error('車両素材に余分なデータがあります。');return {parts,colors:meta.colors};
}
export async function loadRoadVehicle(id){
 const base=new URL('./assets/road-vehicles/'+id+'/',import.meta.url),read=async name=>{const r=await fetch(new URL(name,base));if(!r.ok)throw Error('車両を読みこめません。');return r;};
 const [meta,bytes]=await Promise.all([read('model.json').then(r=>r.json()),read('mesh.bin.gz').then(r=>r.arrayBuffer())]);
 const buffer=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();return decodeRoadVehicle(meta,buffer);
}
