import {FRONT_PATTERNS,normalizeFront} from './train-design.mjs?v=rail-90';

export function setupFaceControls({getDraft,onChange}){
 const $=s=>document.querySelector(s),pattern=$('#face-pattern');
 for(const [value,label] of Object.entries(FRONT_PATTERNS))pattern.add(new Option(label,value));
 const draft=()=>{const d=getDraft();return d.front||(d.front=normalizeFront({primary:d.stripe,secondary:d.stripe2}));};
 const update=()=>{onChange();sync();};
 pattern.onchange=()=>{draft().pattern=pattern.value;update();};
 for(const key of ['primary','secondary','mask']){
  $('#face-'+key).oninput=()=>{draft()[key]=$('#face-'+key).value;$('#face-hex-'+key).setCustomValidity('');update();};
  $('#face-hex-'+key).oninput=()=>{const el=$('#face-hex-'+key),valid=/^#[0-9a-f]{6}$/i.test(el.value);el.setCustomValidity(valid?'':'#と6けたの色コードで入力してください');if(valid){draft()[key]=el.value.toLowerCase();update();}};
 }
 for(const key of ['position','width'])$('#face-'+key).oninput=()=>{draft()[key]=Number($('#face-'+key).value);update();};
 $('#face-photo').onchange=()=>{if(getDraft().wrap){getDraft().wrap.front=$('#face-photo').checked;update();}};
 function sync(){const d=getDraft();if(!d)return;const f=d.front||normalizeFront({primary:d.stripe,secondary:d.stripe2});pattern.value=f.pattern;
  for(const key of ['primary','secondary','mask']){$('#face-'+key).value=f[key];const el=$('#face-hex-'+key);if(document.activeElement!==el){el.value=f[key];el.setCustomValidity('');}}
  for(const key of ['position','width']){$('#face-'+key).value=f[key];$('#face-'+key).disabled=f.pattern==='plain';$('#face-'+key+'-value').textContent=f[key]+'%';}
  $('#face-photo-row').hidden=!d.wrap;$('#face-photo').checked=!!d.wrap?.front;$('#face-photo-note').hidden=!d.wrap?.front;
 }
 return {sync};
}
