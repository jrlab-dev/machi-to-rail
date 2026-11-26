import {syncColorButtons} from './color-picker.mjs?v=rail-90';
import {setupTextControls} from './train-text-controls.mjs?v=rail-90';
import {setupFaceControls} from './train-face-controls.mjs?v=rail-90';
import {PATTERNS,DESIGN_PRESETS} from './train-design.mjs?v=rail-90';
import {drawLivery,readWrapFile} from './train-livery.mjs?v=rail-90';

export function setupPaintControls({getDraft,onChange,onPreset,onView}){
 const $=s=>document.querySelector(s);
 const letters=setupTextControls({getDraft,onChange,onView});
 const face=setupFaceControls({getDraft,onChange});
 let image=null,source='',ticket=0,busy=false;
 const pattern=$('#paint-pattern'),preset=$('#paint-palette');
 for(const [value,label] of Object.entries(PATTERNS)){const option=new Option(label,value);pattern.add(option);}
 DESIGN_PRESETS.forEach((d,i)=>preset.add(new Option(d.name,String(i))));
 preset.onchange=()=>{if(preset.value!==''){onPreset(Number(preset.value));preset.value='';}};
 document.querySelectorAll('[data-paint-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-paint-tab]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',String(t===b));});
  document.querySelectorAll('[data-paint-page]').forEach(p=>p.hidden=p.dataset.paintPage!==b.dataset.paintTab);
  $('#paint-help').hidden=b.dataset.paintTab==='text';
  $('#paint-preview').hidden=['face','text'].includes(b.dataset.paintTab);
  if(b.dataset.paintTab==='text')letters.view();
  if(b.dataset.paintTab==='face')onView('paint-face');
 });
 document.querySelectorAll('[data-paint-view]').forEach(b=>b.onclick=()=>onView(b.dataset.paintView));
 const update=()=>{onChange();sync();};
 pattern.onchange=()=>{getDraft().pattern=pattern.value;update();};
 for(const [id,key] of [['band-position','bandPosition'],['band-width','bandWidth']])$('#'+id).oninput=()=>{getDraft()[key]=Number($('#'+id).value);update();};
 $('#door-separate').onchange=()=>{getDraft().doorSeparate=$('#door-separate').checked;update();};
 for(const [id,key] of [['wrap-scale','scale'],['wrap-y','y'],['wrap-repeat','repeat']])$('#'+id).oninput=()=>{if(getDraft()?.wrap){getDraft().wrap[key]=Number($('#'+id).value);update();}};
 $('#wrap-mode').onchange=()=>{getDraft().wrap.mode=$('#wrap-mode').value;update();};
 $('#wrap-front').onchange=()=>{getDraft().wrap.front=$('#wrap-front').checked;update();};
 $('#wrap-remove').onclick=()=>{ticket++;busy=false;$('#paint-save').disabled=false;getDraft().wrap=null;$('#wrap-status').textContent='写真を外しました。';update();};
 for(const id of ['wrap-file','wrap-camera'])$('#'+id).onchange=async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  const draft=getDraft(),id=++ticket;busy=true;$('#paint-save').disabled=true;$('#wrap-status').textContent='写真を整えています…';
  try{const image=await readWrapFile(file);if(id!==ticket||getDraft()!==draft)return;draft.wrap={image,mode:'repeat',repeat:4,scale:1,y:0,front:true};$('#wrap-status').textContent='写真をはりました。位置や大きさを調整できます。';update();}
  catch(error){if(id===ticket&&getDraft()===draft)$('#wrap-status').textContent=error.message;}
  finally{if(id===ticket){busy=false;$('#paint-save').disabled=false;}}
 };
 function preview(){const d=getDraft();if(!d)return;const c=$('#paint-preview').getContext('2d');drawLivery(c,d,image);
  const w=c.canvas.width,h=c.canvas.height;c.fillStyle='#23404b';
  for(let i=0;i<9;i++)c.fillRect(w*(.055+i*.105),h*.23,w*.061,h*.27);
  c.strokeStyle='#465c61';c.lineWidth=1;
  for(const x of [.15,.38,.61,.84]){c.strokeRect(w*x,h*.12,w*.065,h*.83);c.beginPath();c.moveTo(w*(x+.0325),h*.12);c.lineTo(w*(x+.0325),h*.95);c.stroke();}
 }
 function sync(){
  const d=getDraft();if(!d)return;
  letters.sync();face.sync();$('#paint-face').value=d.face;$('#hex-face').value=d.face;pattern.value=d.pattern;$('#band-position').value=d.bandPosition;$('#band-width').value=d.bandWidth;$('#band-position-value').textContent=d.bandPosition+'%';$('#band-width-value').textContent=d.bandWidth+'%';$('#door-separate').checked=d.doorSeparate;
  for(const id of ['band-position','band-width'])$('#'+id).disabled=['legacy','plain'].includes(d.pattern);
  $('#wrap-options').hidden=!d.wrap;$('#wrap-empty').hidden=!!d.wrap;
  if(d.wrap){$('#wrap-mode').value=d.wrap.mode;$('#wrap-scale').value=d.wrap.scale;$('#wrap-y').value=d.wrap.y;$('#wrap-repeat').value=d.wrap.repeat;$('#wrap-front').checked=d.wrap.front;$('#wrap-repeat-row').hidden=d.wrap.mode!=='repeat';$('#wrap-scale-value').textContent=Math.round(d.wrap.scale*100)+'%';$('#wrap-repeat-value').textContent=d.wrap.repeat+'個';}
  const next=d.wrap?.image||'';
  if(next!==source){source=next;image=null;if(next){const im=new Image();im.onload=()=>{if(source===next){image=im;preview();}};im.src=next;}}
  preview();syncColorButtons();
 }
 return {sync,get busy(){return busy||letters.composing;},cancel(){ticket++;busy=false;source='';image=null;$('#wrap-status').textContent='写真はこのスマホ・パソコンの中で処理します。';}};
}
