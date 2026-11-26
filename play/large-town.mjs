import {normalizeDesign} from './train-design.mjs?v=rail-90';
import {defaultFormation,transform,point} from './core.mjs?v=rail-90';
// Larger example; existing saved towns remain untouched.
export function largeTown(kit){
  const rails=[];let pose=[0,0,0];
  const rail=piece=>{rails.push({uid:rails.length+1,piece,pose:[...pose],branch:'B'});const r=kit.pieces[piece].routes[0];pose=transform(point(r,1),pose);};
  rail('crossing');rail('straight_short');for(let i=0;i<19;i++)rail('straight_long');
  for(let side=0;side<3;side++){for(let i=0;i<3;i++)rail('curve_left');for(let i=0;i<(side===1?20:10);i++)rail('straight_long');}
  for(let i=0;i<3;i++)rail('curve_left');
  const props=[],add=(type,x,y,a=0,scale=1,tint='#ffffff')=>{const p={uid:props.length+1,type,pose:[x,y,a],scale,tint};props.push(p);return p;};
  // A connected three-street, three-avenue network inside the railway.
  for(const y of [40,140,240])for(let x=5;x<=385;x+=20){
    let type='road',a=0;
    if(x===5){type=y===240?'corner':'tee';a=-Math.PI/2;}
    else if(x===385){type=y===140?'tee':'corner';a=y===240?Math.PI:Math.PI/2;}
    else if(x===205){type=y===140?'junction':'tee';a=y===240?Math.PI:0;}
    add(type,x,y,a);
  }
  for(const x of[5,205,385])for(let y=60;y<240;y+=20)if(y!==140)add('road',x,y,Math.PI/2);
  add('road',5,20,Math.PI/2);add('crossing',5,0,Math.PI/2);add('road',5,-20,Math.PI/2);
  // The road outside the crossing is a closed block, not a dangling stub.
  for(const y of[-40,-80])for(let x=5;x<=85;x+=20){let t='road',a=0;if(x===5){t=y===-40?'tee':'corner';a=y===-40?-Math.PI/2:0;}else if(x===85){t='corner';a=y===-40?Math.PI:Math.PI/2;}add(t,x,y,a);}
  add('road',5,-60,Math.PI/2);add('road',85,-60,Math.PI/2);
  // All buildings sit 20 m from the track centre: scenery is for the train view.
  // Keep a clear strip beside the railway and the crossing road at x=5.
  let buildingIndex=0;
  const frontage=(x,y,a)=>{const i=buildingIndex++,urban=x>205;
    const type=urban?['office','hotel','apartment','office','shop'][i%5]:['apartment','office','shop','hotel','apartment','office'][i%6];
    const height=type==='shop'?1:urban?[1.05,1.35,1.6][i%3]:[.8,1.05,1.2,.9][i%4];
    // The reused models have their entrance on local -X.
    add(type,x,y,a+Math.PI,height,['#ffffff','#edf3f5','#f6ecdf'][i%3]);
  };
  for(let i=0;i<14;i++){frontage(20+i*28,20,-Math.PI/2);frontage(20+i*28,260,Math.PI/2);}
  for(let i=0;i<7;i++){frontage(-20,55+i*28,Math.PI);frontage(420,55+i*28,0);}
  for(let i=0;i<8;i++){frontage(55+i*42,-20,Math.PI/2);frontage(55+i*42,300,-Math.PI/2);}
  // Trees soften the four bends without hiding the near-track buildings.
  for(const [cx,cy,start]of [[400,40,-Math.PI/2],[400,240,0],[0,240,Math.PI/2],[0,40,Math.PI]])
    for(let i=0;i<6;i++){const a=start+(i+.5)*Math.PI/12;add('tree',cx+20*Math.cos(a),cy+20*Math.sin(a),0,.9);}
  return{format:'rail-town',version:3,rails,props,train:'original',oppositeTrain:'original',trainDesign:normalizeDesign(),oppositeTrainDesign:normalizeDesign(undefined,1),formation:defaultFormation(6)};
}
