import * as T from 'three';

// Ship-shaped envelope, with the outer ribs standing clear of the dark glazing.
export function glassHall(root,materials,beam){
  const points=[],colors=[],tone=new T.Color(),n=28;
  function quad(a,b,c,d,color){
    tone.set(color);
    for(const p of [a,b,c,a,c,d]){points.push(...p);colors.push(tone.r,tone.g,tone.b);}
  }
  function section(i){
    const swell=Math.sin(Math.PI*i/n);
    return {x:513+6*i,r:2+16*swell,edge:38+1.8*swell,keel:39+7*swell};
  }
  for(let i=0;i<n;i++){
    const a=section(i),b=section(i+1);
    for(const side of [-1,1]){
      const za=53+side*a.r,zb=53+side*b.r;
      for(let row=0;row<8;row++){
        const bottom=11+(a.edge-11)*row/8,top=11+(a.edge-11)*(row+1)/8;
        const low=11+(b.edge-11)*row/8,high=11+(b.edge-11)*(row+1)/8;
        quad([a.x,bottom,za],[b.x,low,zb],[b.x,high,zb],[a.x,top,za],
          ['#537681','#5d818c','#698b96','#7597a1','#81a1aa','#90aeb7','#9db8bf','#a9c1c8'][Math.min(7,Math.max(0,row+(i%7===2?1:i%7===5?-1:0)))]);
        quad([a.x,top-.10,za+side*.03],[b.x,high-.10,zb+side*.03],[b.x,high,zb+side*.03],[a.x,top,za+side*.03],'#455e65');
      }
      quad([a.x,a.edge,za],[b.x,b.edge,zb],[b.x,b.keel,53],[a.x,a.keel,53],'#98b0b8');
      const midx=(a.x+b.x)/2,midz=(za+zb)/2+side*.045;
      quad([midx-.047,11,midz],[midx+.047,11,midz],[midx+.047,(a.edge+b.edge)/2,midz],[midx-.047,(a.edge+b.edge)/2,midz],'#526d77');
      const outer=za+side*1.05;
      beam([a.x,12,outer],[a.x,a.edge+.2,outer],.24,.30);
      beam([a.x,a.edge+.2,outer],[a.x,a.keel+.3,53],.32,.42);
      beam([a.x,a.edge+.2,outer],[b.x,b.edge+.2,zb+side*1.05],.35,.35);
      if(i%2===0){
        beam([a.x,23,outer],[b.x,b.edge-.3,zb+side*1.05],.19,.22);
      }else{
        beam([a.x,a.edge-.3,outer],[b.x,23,zb+side*1.05],.19,.22);
      }
    }
  }
  for(const i of [0,n]){
    const {x,r,edge,keel}=section(i);
    quad([x,11,53-r],[x,11,53+r],[x,edge,53+r],[x,edge,53-r],'#64858f');
    quad([x,edge,53-r],[x,edge,53+r],[x,keel,53],[x,keel,53],'#98b0b8');
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.56});
  materials.set('hall-glass',mat);const shell=new T.Mesh(geo,mat);shell.userData.landmarkGeometry=true;root.add(shell);
}

export function plazaCrowns(root,materials,trees){
  const geo=new T.SphereGeometry(1,7,4),mat=new T.MeshStandardMaterial({roughness:1,flatShading:true});
  const mesh=new T.InstancedMesh(geo,mat,trees.length*5),pose=new T.Object3D(),color=new T.Color();
  let i=0;
  for(const [x,y,z,scale] of trees){
    for(let j=0;j<5;j++){
      const a=x*1.73+j*2.4,top=j===4,r=top?.22:1.22;
      pose.position.set(x+Math.cos(a)*r*scale,z+(top?1.2:.26*Math.sin(a))*scale,-y+Math.sin(a)*r*scale);
      pose.rotation.set(.21*Math.cos(a),a,.15*Math.sin(a));
      pose.scale.set(1.24*scale,(top?1.38:1.04)*scale,1.04*scale);pose.updateMatrix();
      mesh.setMatrixAt(i,pose.matrix);mesh.setColorAt(i++,color.set(['#657f54','#789061','#57764e','#668456','#82966a'][j]));
    }
  }
  mesh.computeBoundingSphere();mesh.userData.landmarkGeometry=true;materials.set('plaza-leaves',mat);root.add(mesh);
}
