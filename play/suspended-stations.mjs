// Platform fit-out is kept outside both vehicle envelopes.
export function dressStation(index,s,h,y,side,{box,post,member,board,put}){
  const z=-y+side*8.6,outer=z+side*2.16;
  const colors=['#416778','#af796d','#74875c','#886843','#538b96'];
  const color=colors[index],names=['SHIOMI CENTRAL','SAKURAGAOKA','MIDORIDANI PARK','YAMANOTE','SHIOMI BEACH'];
  const local=(x,v,up,w,d,height,tint)=>box(s+x,h+up,z+side*v,w,height,d,tint);
  const front=side>0?Math.PI:0;
  for(let x=-27;x<=27;x+=9){
    local(x,.08,5.48,.13,5.09,.16,index===3?'#8b6747':'#889a9a');
    local(x,-.78,5.38,3.2,.15,.065,'#fff1c9');
    if(index>0)member([s+x,h+4.43,outer],[s+x,h+5.47,z-.92*side],.14,.15,index===3?'#876644':'#839591');
    local(x,-2.21,1.12,.035,.34,.018,'#aaa261');
  }
  local(0,-2.6,5.74,59,.15,.36,color);
  for(const dx of [-20,0,20]){
    local(dx,-.48,4.99,.065,.065,1.2,'#5d7477');
    local(dx,-.48,4.38,2.9,.18,.68,'#354955');
    board(index===4?'海岸出口 →':side>0?'1　都心方面':'2　海岸方面',s+dx,h+4.38,z-side*.58,2.86,.62,front,'#334950');
  }
  for(let dx=-24;dx<=-19;dx+=1.05){
    local(dx,.83,1.65,.9,.58,.15,color);local(dx,1.08,1.92,.90,.12,.53,color);
  }
  // Street-facing poster cabinet and an illuminated vending machine beside the stairs.
  local(13,1.97,2.63,3.4,.22,2.28,'#52666a');
  board(index%2?'海辺の散歩道':'緑谷の森へ',s+13,h+2.61,outer-side*.34,3.22,1.99,front,index%2?'#476f81':'#58765e');
  local(23,1.62,2.02,.94,.77,1.86,'#d9e4dc');
  for(let j=0;j<3;j++)for(let k=0;k<5;k++)local(22.66+k*.16,1.22,2.20+j*.18,.112,.04,.135,['#b66a4b','#99ac62','#6994a2'][(j+k)%3]);
  local(23,1.21,1.62,.65,.035,.15,'#4e5e60');
  for(const dx of [-14,16]){
    for(const v of [-.07,.07])local(dx+v,0,4.95,.05,.08,1.2,'#829193');
  }
  for(const edge of [-1,1]){
    const zz=z+edge*1.20;
    member([s+30,h+2.11,zz],[s+44,h-7.7,zz],.085,.085,'#bcc7c0');
    for(let j=0;j<36;j+=5)box(s+30+j*.40,h+1.51-j*.28,zz,.08,1,.08,'#7d9390');
  }
  const sx=s-23,sz=z+side*4.7;
  box(sx,h-2.93,sz,3.5,12.3,3.5,'#6d9399');
  for(const dx of [-1.75,1.75])for(const dz of [-1.75,1.75])box(sx+dx,h-2.93,sz+dz,.18,12.4,.18,'#d5d8ca');
  box(sx,h+3.43,sz,4.1,.48,4.1,color);local(-23,3.25,.72,2.7,2.1,.56,'#b7bdb0');
  if(index===0){
    local(0,3.08,3.08,56,.24,3.72,'#b3c2be');
    for(const x of [-20,-4,13]){local(x,2.88,2.91,5.4,.12,2.36,'#4b676b');board(names[index],s+x,h+3.12,z+side*2.75,4.7,.59,front,'#354d58');}
  }else if(index===1){
    for(const x of [-18,17]){local(x,2.95,2.21,8,.17,2.2,'#c8bdac');local(x,2.68,3.54,8.7,1.8,.19,'#aa7468');}
  }else if(index===2||index===3){
    for(let x=-25;x<=25;x+=10){
      local(x,2.18,3.47,.26,.29,4.65,'#836948');local(x,-1.92,4.35,.17,.16,2.7,'#887557');
      member([s+x,h+5.98,z-side*2.75],[s+x,h+7.01,z],.16,.18,'#7e674a');
      member([s+x,h+7.01,z],[s+x,h+5.98,z+side*2.75],.16,.18,'#7e674a');
    }
    for(const edge of [-1,1])put('box',s,h+6.48,z+edge*1.43,2.96,.22,58,index===3?'#655f59':'#688272',Math.PI/2,edge*.35);
  }else{
    for(const x of [-23,-9,5,19]){
      post(s+x,h+3.61,z+side*1.68,.22,5,.22,'#e3e2d2');
      member([s+x,h+5.80,z+side*2.5],[s+x+3.7,h+7.72,z+side*1.7],.15,.15,'#c7d7ce');
      member([s+x+3.7,h+7.72,z+side*1.7],[s+x+8.3,h+5.81,z-side*2.3],.11,.11,'#bccbc5');
    }
  }
}
