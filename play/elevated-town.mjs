import {transform,defaultFormation} from './core.mjs?v=marks-88';
export function elevatedTown(kit){
 const rails=[];let pose=[0,0,0];
 const add=piece=>{const spec=kit.pieces[piece];rails.push({uid:rails.length+1,piece,pose:[...pose],branch:'B'});const p=spec.ports[1];pose=transform([p.position[0],p.position[1],p.outward],pose);};
 add('ramp_up');for(let i=0;i<14;i++)add('viaduct_straight');for(let i=0;i<6;i++)add('viaduct_left');for(let i=0;i<14;i++)add('viaduct_straight');add('ramp_down');for(let i=0;i<6;i++)add('curve_left');
 const props=[];const prop=(type,x,y,scale=1,angle=0)=>props.push({uid:props.length+1,type,pose:[x,y,angle],scale,tint:'#ffffff'});
 for(let x=40;x<500;x+=28)prop(x%3===0?'office':x%5===0?'apartment':'shop',x,40,.7,Math.PI/2);
 for(let x=25;x<510;x+=40){prop('tree',x,22,.9);prop('tree',x,58,.9);}
 for(let y=-20;y<=100;y+=20)prop('road',400,y,1,Math.PI/2);
 return {format:'rail-town',version:3,rails,props,train:'express-long',oppositeTrain:'original',formation:defaultFormation(8)};
}
