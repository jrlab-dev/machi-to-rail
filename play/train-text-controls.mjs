import {syncColorButtons} from './color-picker.mjs?v=rail-90';
import {LETTER_FONTS,normalizeLetter,normalizeLettering} from './train-lettering.mjs?v=rail-90';
export function setupTextControls({getDraft,onChange,onView}){
 const $=s=>document.querySelector(s);let target='side',composing=false;
 for(const [k,v] of Object.entries(LETTER_FONTS))$('#letter-font').add(new Option(v,k));
 const current=()=>{const d=getDraft();return normalizeLetter(d?.lettering?.[target]);};
 function change(key,value){const d=getDraft();if(!d)return;d.lettering=normalizeLettering(d.lettering||{});d.lettering[target]=normalizeLetter({...d.lettering[target],[key]:value});onChange();}
 $('#letter-target').onchange=()=>{target=$('#letter-target').value;sync(true);view();};
 const input=$('#letter-text');const commit=()=>{input.value=[...input.value].slice(0,24).join('');change('text',input.value);};input.oncompositionstart=()=>composing=true;input.oncompositionend=()=>{composing=false;commit();};input.oninput=e=>{if(!composing&&!e.isComposing)commit();};
 $('#letter-color').oninput=()=>change('color',$('#letter-color').value);
 $('#letter-font').onchange=()=>change('font',$('#letter-font').value);
 for(const key of ['size','x','y'])$('#letter-'+key).oninput=()=>change(key,Number($('#letter-'+key).value));
 $('#letter-outline').onchange=()=>change('outline',$('#letter-outline').checked);
 $('#letter-remove').onclick=()=>{input.value='';change('text','');};
 let lastDraft=null;
 function sync(force=false){const d=getDraft();if(!d)return;const f=current();if(force||lastDraft!==d||document.activeElement!==input)input.value=f.text;lastDraft=d;
  $('#letter-count').textContent=[...f.text].length+'/24文字';$('#letter-color').value=f.color;$('#letter-font').value=f.font;$('#letter-outline').checked=f.outline;
  for(const key of ['size','x','y']){$('#letter-'+key).value=f[key];$('#letter-'+key+'-value').textContent=f[key]+'%';}syncColorButtons();
 }
 function view(){onView(target==='front'?'paint-face':'paint-left');}
 return {sync,view,get composing(){return composing;}};
}
