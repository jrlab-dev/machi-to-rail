import * as T from 'three';
import {coastEdge} from './coast-data.mjs?v=fuji-land-31';
import {createBoats} from './boats-renderer.mjs?v=fuji-land-31';
export function createCoast(){
 const root=new T.Group();root.name='coast';const materials=[];
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,512,512);
 for(let i=0;i<90;i++){const x=(i*137)%512,y=(i*83)%512;ctx.strokeStyle=i%3?'#d7eeee':'#ecfafa';ctx.lineWidth=i%3?1:2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+12,y-2,x+27,y);ctx.stroke();}
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 function band(name,inner,outer,color,height,waves=false,sides=[1]){const positions=[],uv=[],indices=[];for(const side of sides){const start=positions.length/3;for(let i=0;i<=440;i++){const x=-8000+i*50,edge=coastEdge(x);for(const offset of[inner,outer]){const z=(side===1?0:-800)+side*(edge+offset);positions.push(x,height,z);uv.push(x/90,z/90);}}for(let i=0;i<440;i++){const a=start+i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();const material=new T.MeshStandardMaterial({color,roughness:waves?.48:.95,metalness:0,side:T.DoubleSide,map:waves?texture:null});materials.push({material,color});const mesh=new T.Mesh(geometry,material);mesh.name=name;root.add(mesh);
 }
 band('beach',-12,8,'#d9c79b',.045);band('wash',8,11,'#c4e2d6',.04);band('shallow-water',11,45,'#60b8b7',.03,true);band('coastal-water',45,155,'#358f9e',.025,true);band('open-sea',155,14000,'#28768e',.02,true);
 band('inland-ground',-12,14000,'#72836c',-.49,false,[-1]);
 const boats=createBoats();root.add(boats.root);
 return{root,update(phase){boats.update(phase);const tint=phase==='night'?'#31465e':phase==='sunset'?'#e7b39d':'#ffffff';for(const {material,color}of materials)material.color.set(color).multiply(new T.Color(tint));texture.offset.x=(performance.now()*.000002)%1;},dispose(){boats.dispose();root.traverse(o=>o.geometry?.dispose());for(const {material}of materials)material.dispose();texture.dispose();}};
}
