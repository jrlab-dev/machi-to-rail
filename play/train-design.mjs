import {normalizeDecorations} from './train-decorations.mjs?v=rail-90';
import {designKey,EXPRESS_DESIGNS} from './train-types.mjs?v=rail-90';
import {normalizeLettering} from './train-lettering.mjs?v=rail-90';
export const PAINT_PARTS={body:'車体',stripe:'帯1',stripe2:'帯2',door:'ドア',face:'前面',roof:'屋根'};
export const PATTERNS={legacy:'従来の上下帯',plain:'無地',single:'一本帯',double:'二本帯',edges:'上下に帯',windows:'窓まわり',twoTone:'ツートン',diagonal:'ななめ帯',gradient:'二色のぼかし帯'};
export const FRONT_PATTERNS={plain:'無地',single:'横帯',double:'二本帯',lower:'下半分',frame:'囲みわく',round:'丸いパネル',chevron:'V字',gradient:'二色ぼかし'};
const defaults={stripe2:'#f4c95d',pattern:'legacy',bandPosition:28,bandWidth:14,doorSeparate:true,wrap:null,front:null,lettering:null};
export const DESIGN_PRESETS=[
 {name:'あかつき',body:'#eee6d4',stripe:'#e87638',door:'#263e51',face:'#e87638',roof:'#5c6873'},
 {name:'しおかぜ',body:'#263e51',stripe:'#61d1c1',door:'#e6eee8',face:'#61d1c1',roof:'#647580'},
 {name:'すみれ',body:'#f4eef9',stripe:'#8861bc',door:'#b899d4',face:'#8861bc',roof:'#686779'},
 {name:'銀と青',body:'#bcc8d0',stripe:'#168acf',stripe2:'#203f77',door:'#bcc8d0',face:'#168acf',roof:'#63717b',pattern:'double',doorSeparate:false},
 {name:'銀と緑',body:'#c4cdd0',stripe:'#72b741',stripe2:'#e6cf45',door:'#c4cdd0',face:'#72b741',roof:'#63717b',pattern:'single',doorSeparate:false},
 {name:'クリームとしゅ色',body:'#f1d8ac',stripe:'#bb4039',stripe2:'#d6b57e',door:'#bb4039',face:'#bb4039',roof:'#6b655f',pattern:'twoTone',doorSeparate:false},
 {name:'深紅',body:'#86293e',stripe:'#e4cda7',stripe2:'#b77965',door:'#86293e',face:'#86293e',roof:'#56555a',pattern:'single',bandWidth:5,doorSeparate:false},
 {name:'白とこん色',body:'#f1f2ec',stripe:'#263d68',stripe2:'#dca747',door:'#263d68',face:'#263d68',roof:'#727b83',pattern:'windows',doorSeparate:false},
 {name:'ひまわり',body:'#f2c83e',stripe:'#ea7838',stripe2:'#fff0ad',door:'#f2c83e',face:'#f2c83e',roof:'#62676d',pattern:'plain',doorSeparate:false}
].map(d=>({...defaults,...d}));
const clamp=(v,min,max,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
export function normalizeWrap(value){
 if(!value||typeof value!=='object'||typeof value.image!=='string'||value.image.length>450000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value.image))return null;
 return {image:value.image,mode:value.mode==='repeat'?'repeat':'cover',repeat:Math.round(clamp(value.repeat,1,8,4)),scale:clamp(value.scale,.5,2,1),y:clamp(value.y,-50,50,0),front:value.front!==false};
}
export function normalizeDesign(raw,index=0){
 const base=DESIGN_PRESETS[index===1?1:0],value=raw&&typeof raw==='object'?raw:{};
 const name=typeof value.name==='string'?[...value.name.replace(/[\u0000-\u001f\u007f<>]/g,'').trim()].slice(0,20).join(''):'';
 const decorations=normalizeDecorations(value.decorations);
 return {...(decorations.length?{decorations}:{}),name:name||base.name,...Object.fromEntries(Object.keys(PAINT_PARTS).map(key=>[key,/^#[0-9a-f]{6}$/i.test(value[key]||'')?value[key].toLowerCase():base[key]])),pattern:Object.hasOwn(PATTERNS,value.pattern)?value.pattern:'legacy',bandPosition:clamp(value.bandPosition,5,85,28),bandWidth:clamp(value.bandWidth,3,45,14),doorSeparate:value.doorSeparate!==false,wrap:normalizeWrap(value.wrap),lettering:normalizeLettering(value.lettering),front:value.front&&typeof value.front==='object'?normalizeFront(value.front):null};
}
export function normalizeFront(value={}){return {pattern:Object.hasOwn(FRONT_PATTERNS,value.pattern)?value.pattern:'plain',...Object.fromEntries(Object.entries({primary:'#168acf',secondary:'#f4c95d',mask:'#17252e'}).map(([k,v])=>[k,/^#[0-9a-f]{6}$/i.test(value[k]||'')?value[k].toLowerCase():v])),position:clamp(value.position,8,45,26),width:clamp(value.width,4,30,14)};}
export const TRAM_DESIGN={name:'こもれび',body:'#185a46',stripe:'#e7d8ad',stripe2:'#c5a766',door:'#185a46',face:'#185a46',roof:'#6b7476'};
// Examples use only the same editable values as any user-created train.
export const TRAIN_EXAMPLES=[
 {id:'saved-example-sky',type:'original',design:normalizeDesign({name:'みずいろ',body:'#c2cbd1',stripe:'#36b5d2',stripe2:'#36b5d2',door:'#c2cbd1',face:'#d7e1e4',roof:'#68747c',pattern:'edges',bandPosition:24,bandWidth:13,doorSeparate:false,front:{pattern:'single',primary:'#36b5d2',secondary:'#d7e1e4',mask:'#172a33',position:25,width:14}})},
 {id:'saved-example-leaf',type:'original',design:normalizeDesign({name:'わかば',body:'#cbd2d0',stripe:'#81b953',stripe2:'#b1d77a',door:'#81b953',face:'#cbd2d0',roof:'#69746e',pattern:'edges',bandPosition:18,bandWidth:5,doorSeparate:true,front:{pattern:'frame',primary:'#81b953',secondary:'#b1d77a',mask:'#20302b',position:22,width:16}})},
 {id:'saved-example-bay',type:'original',design:normalizeDesign({name:'うみかぜ',body:'#c3ced4',stripe:'#2869ac',stripe2:'#58d3c7',door:'#c3ced4',face:'#e3e9e6',roof:'#657680',pattern:'gradient',bandPosition:27,bandWidth:22,doorSeparate:false,front:{pattern:'gradient',primary:'#2869ac',secondary:'#58d3c7',mask:'#173344',position:24,width:16}})}
];
export function designField(town,other=false){return designKey(other?(town.oppositeTrain||town.train):town.train,other);}
export function designFor(town,other=false){const type=other?(town.oppositeTrain||town.train):town.train;return normalizeDesign(town[designField(town,other)]||(type==='tram'?TRAM_DESIGN:EXPRESS_DESIGNS[type]),other?1:0);}
