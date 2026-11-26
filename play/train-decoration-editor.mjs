import {normalizeDecorations,drawDecoration,decorationApplies} from './train-decorations.mjs?v=rail-90';
import {syncColorButtons} from './color-picker.mjs?v=rail-90';

const STAMPS='rail-workshop-marks-v1';
const shapes={star:'星',wing:'つばさ',wave:'波',mountain:'山',circle:'丸',diamond:'ひし形',line:'線',text:'文字だけ'};
const shapeSymbols={star:'★',wing:'🪽',wave:'〰',mountain:'▲',circle:'●',diamond:'◆',line:'━',text:'あ'};
const shapeOptions=Object.fromEntries(Object.entries(shapes).map(([key,name])=>[key,shapeSymbols[key]+' '+name]));
const surfaces={side:'側面（左右共通）',front:'前面'};
const targets={all:'全車両',lead:'先頭の1両',middle:'中間車',car:'号車を指定'};
const bases={none:'なし',circle:'丸',square:'四角',shield:'たて'};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const options=map=>Object.entries(map).map(([val,name])=>'<option value="'+val+'">'+name+'</option>').join('');
const stampName=item=>[shapes[item.shape],item.text].filter(Boolean).join('・');
const targetName=item=>item.target==='car'?item.car+'号車':targets[item.target];

function controls(kind){
 const mark=kind==='mark',name=mark?'マーク':'帯',id=key=>'deco-'+kind+'-'+key;
 const button=(key,title)=>'<button type="button" id="'+id(key)+'">'+title+'</button>';
 const select=(key,label,values)=>'<label>'+label+'<select id="'+id(key)+'">'+options(values)+'</select></label>';
 const range=(key,label,min,max)=>'<label>'+label+' <output></output><input type="range" min="'+min+'" max="'+max+'" id="'+id(key)+'"></label>';
 const color=(key,label)=>'<label>'+label+'<input type="color" id="'+id(key)+'" aria-label="'+label+'"></label>';
 return '<div class="deco-actions">'+button('add',name+'を追加')+button('undo','ひとつもどす')+'</div>'+
 '<div id="'+id('placed')+'">'+select('items','付けた'+name,{})+'<canvas id="'+id('placed-preview')+'" aria-label="付けた帯やマークをタップして編集"></canvas><div class="deco-actions">'+button('edit','編集')+button('copy','複製')+button('remove','外す')+'</div></div>'+
 (mark?'<details><summary>保存したマークを使う</summary>'+select('library','マーク帳',{})+'<div class="deco-actions">'+button('load-stamp','このマークを使う')+button('remove-stamp','帳面から外す')+'</div></details>':'')+
 '<fieldset id="'+id('form')+'" hidden><legend>'+name+'をデザイン</legend><div class="deco-grid">'+select('surface','付ける面',surfaces)+
 (mark?select('shape','印の形',shapeOptions)+'<label>入れる文字<input id="'+id('text')+'" type="text" maxlength="32" autocomplete="off" placeholder="例：うみかぜ"></label>':'')+
 color('color',mark?'印の色':'帯の色')+'</div><canvas id="'+id('preview')+'" width="720" height="160" aria-label="'+name+'の配置見本"></canvas><p class="deco-legend">見本をタップして位置を決めます。</p>'+
 '<details><summary>細かく調整する</summary><div class="deco-grid">'+select('target','付ける車両',targets)+select('car','号車',{})+
 (mark?select('base','台紙の形',bases)+color('baseColor','台紙の色')+color('textColor','文字の色')+range('x','左右',0,100):range('start','始まり',0,100)+range('end','終わり',0,100)+range('slope','右上がり',-100,100))+
 range('y','上下',0,100)+range('size',mark?'大きさ':'帯の太さ',1,100)+'</div></details><div class="deco-actions">'+button('apply',name+'を付ける')+button('cancel','やめる')+'</div>'+
 (mark?button('save-stamp','このデザインをマーク帳に保存'):'')+'</fieldset><p class="deco-status" role="status"></p>';
}

function drawGuide(canvas,design,surface,layers,car,count){
 const front=surface==='front',w=front?320:720,h=front?300:160;
 canvas.classList.toggle('front',front);
 if(canvas.width!==w)canvas.width=w;
 if(canvas.height!==h)canvas.height=h;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle=design.body||'#eee9d7';ctx.fillRect(0,0,w,h);
 ctx.fillStyle=design.stripe||'#417896';ctx.fillRect(0,h*.65,w,h*.065);
 ctx.fillStyle='#617c89';
 if(front)ctx.fillRect(w*.13,h*.14,w*.74,h*.30);
 else for(let i=0;i<9;i++)ctx.fillRect(w*(.023+i*.11),h*.20,w*.081,h*.27);
 ctx.strokeStyle='#90a09e';ctx.lineWidth=2;
 if(!front)for(const x of [.12,.78])ctx.strokeRect(w*x,h*.1,w*.098,h*.82);
 ctx.fillStyle=design.roof||'#919b9b';ctx.fillRect(0,0,w,h*.07);
 layers.filter(item=>item.surface===surface&&decorationApplies(item,car-1,count)).forEach(item=>drawDecoration(ctx,item,w,h));
}

export function setupDecorationEditor({getDesign,onChange,getType=()=>'',getFormationCount=()=>1}){
 let history=[],designRef,typeRef;
 const panels=[];
 const designItems=()=>normalizeDecorations(getDesign()?.decorations);
 const carCount=()=>clamp(Math.round(Number(getFormationCount())||1),1,11);
 function refresh(){
  const design=getDesign(),type=getType();
  if(design!==designRef||type!==typeRef){
   designRef=design;typeRef=type;history=[];
   panels.forEach(p=>p.reset());
  }
  panels.forEach(p=>p.render());
 }
 function replace(items){
  history.push(designItems());if(history.length>24)history.shift();
  panels.forEach(p=>p.reset());onChange(items);refresh();
 }
 for(const kind of ['band','mark']){
  const mark=kind==='mark',name=mark?'マーク':'帯';
  const root=document.getElementById('decoration-'+kind);
  root.innerHTML=controls(kind);
  const el=key=>document.getElementById('deco-'+kind+'-'+key);
  const status=root.querySelector('[role=status]'),form=el('form'),list=el('items');
  const keys=mark?['surface','target','car','x','y','size','color','shape','base','baseColor','text','textColor']:
   ['surface','target','car','start','end','slope','y','size','color'];
  let draft=null,index=-1,stamps=[];
  const reset=()=>{draft=null;index=-1;status.textContent='';};
  function canvas(){
   if(!draft)return;
   const items=designItems(),current=normalizeDecorations([draft])[0];
   if(index<0)items.push(current);else items[index]=current;
   const sample=current.target==='car'?current.car:current.target==='middle'?2:1;
   drawGuide(el('preview'),getDesign()||{},current.surface,items,sample,carCount());
  }
  function sync(){
   form.hidden=!draft;
   if(!draft)return;
   const count=carCount(),front=draft.surface==='front';
   const numberCount=Math.max(count,draft.target==='car'?draft.car:1);
   const car=el('car');
   if(car.options.length!==numberCount)car.replaceChildren(...Array.from({length:numberCount},(_,i)=>new Option(i+1+'号車',i+1)));
   const cabAtEnd=!['steam','freight'].includes(getType());
   for(const option of car.options){
    const n=Number(option.value);option.disabled=front&&n!==1&&!(cabAtEnd&&n===count);
   }
   car.closest('label').hidden=draft.target!=='car';
   [...el('target').options].find(o=>o.value==='middle').disabled=front||count<3;
   for(const key of keys){
    const input=el(key);input.value=draft[key];
    if(input.type==='range')input.previousElementSibling.textContent=draft[key]+'%';
   }
   el('apply').textContent=index<0?name+'を付ける':'これに変える';
   if(mark)syncMarkColors();
   syncColorButtons();canvas();
  }
  function syncMarkColors(){
   const solo=draft.shape==='text';
   const textColor=el('textColor').closest('label');
   const row=solo?form.querySelector('.deco-grid'):form.querySelector('details .deco-grid');
   if(row!==textColor.parentElement)row.append(textColor);
   el('color').closest('label').hidden=solo;
   el('baseColor').closest('label').hidden=draft.base==='none';
  }
  function drawPlaced(){
   const items=designItems(),item=items[Number(list.value)];
   if(!item||!list.options.length)return;
   const car=item.target==='car'?item.car:item.target==='middle'?2:1;
   drawGuide(el('placed-preview'),getDesign()||{},item.surface,items,car,carCount());
  }
  list.onchange=drawPlaced;
  el('placed-preview').onclick=event=>{
   const items=designItems(),current=items[Number(list.value)];
   if(!current||draft)return;
   const car=current.target==='car'?current.car:current.target==='middle'?2:1;
   const canvas=event.currentTarget,rect=canvas.getBoundingClientRect();
   const hit=document.createElement('canvas');hit.width=canvas.width;hit.height=canvas.height;
   const ctx=hit.getContext('2d',{willReadFrequently:true});
   const x=clamp(Math.floor((event.clientX-rect.left)*hit.width/rect.width),0,hit.width-1);
   const y=clamp(Math.floor((event.clientY-rect.top)*hit.height/rect.height),0,hit.height-1);
   for(let i=items.length-1;i>=0;i--){
    if(items[i].surface!==current.surface||!decorationApplies(items[i],car-1,carCount()))continue;
    ctx.clearRect(0,0,hit.width,hit.height);drawDecoration(ctx,items[i],hit.width,hit.height);
    if(ctx.getImageData(x,y,1,1).data[3]){select(i);return;}
   }
  };
  function render(){
   const selected=list.value,items=designItems();list.replaceChildren();
   items.forEach((item,i)=>{if(item.kind===kind)list.add(new Option((mark?stampName(item):name)+'・'+(item.surface==='front'?'前面':'側面')+'・'+targetName(item),i));});
   if([...list.options].some(o=>o.value===selected))list.value=selected;
   el('placed').hidden=!list.options.length||!!draft;
   if(!draft)drawPlaced();
   el('add').disabled=items.length>=24||!!draft;
   el('undo').disabled=!history.length||!!draft;
   for(const key of ['edit','copy','remove'])el(key).disabled=!!draft||(key==='copy'&&items.length>=24);
   sync();
  }
  function open(item,idx=-1){
   if(!commitPending())return;panels.forEach(p=>p.reset());index=idx;draft={...item};status.textContent='';panels.forEach(p=>p.render());
   form.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  el('add').onclick=()=>open(normalizeDecorations([{kind,size:mark?30:8,y:mark?72:66,base:mark?'circle':'none',color:mark?'#f9d348':'#1b6290'}])[0]);
  el('edit').onclick=()=>open(designItems()[Number(list.value)],Number(list.value));
  el('copy').onclick=()=>open(designItems()[Number(list.value)]);
  el('remove').onclick=()=>{const items=designItems();items.splice(Number(list.value),1);replace(items);status.textContent=name+'を外しました。';};
  el('undo').onclick=()=>{const items=history.pop();if(items){panels.forEach(p=>p.reset());onChange(items);refresh();status.textContent='ひとつもどしました。';}};
  el('cancel').onclick=()=>{reset();render();};
  function apply(){
   if(!draft)return true;
   if(mark&&draft.shape==='text'&&!normalizeDecorations([draft])[0].text){status.textContent='入れたい文字を書いてね。';el('text').focus();return false;}
   if(!mark&&draft.start===draft.end){status.textContent='帯の始まりと終わりを少しはなしてね。';return false;}
   const items=designItems(),idx=index<0?items.length:index;
   if(idx>=24){status.textContent='付けられる帯とマークは合わせて24個です。';return false;}
   items[idx]=normalizeDecorations([draft])[0];reset();replace(items);list.value=String(idx);drawPlaced();status.textContent=name+'を付けました。';return true;
  }
  el('apply').onclick=apply;
  form.addEventListener('input',event=>{
   if(!draft)return;
   const key=keys.find(k=>el(k)===event.target);if(!key)return;
   draft[key]=event.target.type==='range'||key==='car'?Number(event.target.value):event.target.value;
   if(event.target.type==='range')event.target.previousElementSibling.textContent=draft[key]+'%';
   if(mark&&(key==='shape'||key==='base'))syncMarkColors();
   if(key==='surface'||key==='target'){
    if(draft.surface==='front'&&draft.target==='middle')draft.target='lead';
    if(draft.surface==='front'&&draft.target==='car'&&draft.car!==1&&
       (draft.car!==carCount()||['steam','freight'].includes(getType())))draft.car=1;
    sync();return;
   }
   canvas();
  });
  form.addEventListener('change',event=>{
   if(draft&&event.target.tagName==='SELECT')event.target.dispatchEvent(new Event('input',{bubbles:true}));
  });
  el('preview').onclick=event=>{
   if(!draft)return;
   const rect=event.currentTarget.getBoundingClientRect(),x=Math.round(clamp(100*(event.clientX-rect.left)/rect.width,0,100));
   draft.y=Math.round(clamp(100*(event.clientY-rect.top)/rect.height,0,100));
   if(mark)draft.x=x;
   else{const width=Math.abs(draft.end-draft.start);draft.start=clamp(x-Math.round(width/2),0,100-width);draft.end=draft.start+width;}
   sync();
  };
  if(mark){
   const library=el('library');
   function readLibrary(){
    try{stamps=normalizeDecorations(JSON.parse(localStorage.getItem(STAMPS)||'[]')).filter(item=>item.kind==='mark');}
    catch{stamps=[];}
    library.replaceChildren(...stamps.map((item,i)=>new Option(stampName(item),String(i))));
    if(!stamps.length)library.add(new Option('まだ保存されていません',''));
    library.disabled=!stamps.length;
    el('load-stamp').disabled=el('remove-stamp').disabled=!stamps.length;
   }
   function saveLibrary(next){
    try{localStorage.setItem(STAMPS,JSON.stringify(next));readLibrary();return true;}
    catch{status.textContent='このスマホ・パソコンのマーク帳に保存できませんでした。';return false;}
   }
   el('save-stamp').onclick=()=>{
    if(!draft)return;
    const item=normalizeDecorations([{...draft,target:'all',car:1,surface:'side',x:50,y:70}])[0];
    if(item.shape==='text'&&!item.text){status.textContent='保存する文字を入れてね。';return;}
    readLibrary();
    const existing=stamps.findIndex(s=>JSON.stringify(s)===JSON.stringify(item));
    if(existing>=0){library.value=String(existing);status.textContent='このデザインはマーク帳に入っています。';return;}
    if(stamps.length>=24){status.textContent='マーク帳は24個までです。使わないマークを外すと追加できます。';return;}
    if(saveLibrary([...stamps,item])){library.value=String(stamps.length-1);status.textContent='マーク帳に保存しました。別の電車でも使えます。';}
   };
   el('load-stamp').onclick=()=>{
    if(draft){status.textContent='編集中のマークを付けるか「やめる」をおしてね。';return;}
    if(designItems().length>=24){status.textContent='帯かマークを外すと追加できます。';return;}
    if(library.value!=='')open(stamps[Number(library.value)]);
   };
   el('remove-stamp').onclick=()=>{
    const selected=JSON.stringify(stamps[Number(library.value)]);readLibrary();
    if(saveLibrary(stamps.filter(item=>JSON.stringify(item)!==selected)))status.textContent='マーク帳から外しました。';
   };
   readLibrary();
  }
  panels.push({kind,reset,render,open,apply,pending:()=>!!draft});
 }
 function select(index){
  if(!commitPending())return false;
  const item=designItems()[index];if(!item)return false;
  const panel=panels.find(p=>p.kind===item.kind);
  document.querySelector('[data-paint-tab="'+(item.kind==='band'?'pattern':'mark')+'"]').click();
  panel.open(item,index);return true;
 }
 for(const tab of document.querySelectorAll('[data-paint-tab]')){
  tab.addEventListener('click',event=>{
   if(getDesign()!==designRef||getType()!==typeRef){refresh();return;}
   const p=panels.find(panel=>panel.pending());
   if(p&&tab.dataset.paintTab!==(p.kind==='band'?'pattern':'mark')&&!p.apply()){
    event.preventDefault();event.stopImmediatePropagation();
   }
  },true);
 }
 refresh();
 function commitPending(){
  const panel=panels.find(p=>p.pending());
  return !panel||panel.apply();
 }
 return {refresh,select,commitPending};
}
