const HUES=[['あか',0],['だいだい',20],['やまぶき',40],['きいろ',60],['きみどり',80],['みどり',110],['あおみどり',150],['みずいろ',180],['あお',210],['あいいろ',240],['むらさき',280],['ももいろ',320]];
function hslHex(h,s,l){
 const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');};
 return '#'+f(0)+f(8)+f(4);
}
export const PALETTE_COLORS=Object.freeze([
 ...[.94,.86,.76,.65,.52,.42,.32,.22].flatMap((l,row)=>HUES.map(([name,h])=>Object.freeze({hex:hslHex(h,.92,l),name:`${name}・明るさ${8-row}`}))),
 ...Array.from({length:12},(_,i)=>{const channel=Math.round(255*(1-i/11)).toString(16).padStart(2,'0');return Object.freeze({hex:'#'+channel.repeat(3),name:i===0?'しろ':i===11?'くろ':`はいいろ・明るさ${12-i}`});})
]);
export function readableInk(hex){
 const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#000000':'#ffffff';
}
const controls=new Map();
export function syncColorButtons(){
 for(const [input,button] of controls){button.style.setProperty('--picked-color',input.value);button.disabled=input.disabled;}
}
export function setupColorPicker(){
 if(controls.size)return;
 const inputs=[...document.querySelectorAll('input[type="color"]')];
 const dialog=document.createElement('dialog');dialog.id='color-picker';dialog.setAttribute('aria-labelledby','color-picker-title');
 dialog.innerHTML='<header class="color-heading"><div><h2 id="color-picker-title">色を選ぶ</h2><p>108色から、すきな色を押してね</p></div><button type="button" class="color-close" aria-label="色選びを閉じる">×</button></header><div class="color-scroll"><div class="color-current"><span class="color-current-chip" aria-hidden="true"></span><span>いまの色</span></div><div class="color-grid" role="group" aria-label="いろいろな色"></div><div class="color-grid color-grays" role="group" aria-label="白・灰色・黒"></div><details class="color-fine"><summary>こまかく選ぶ</summary><p>色を調整して「この色にする」を押してね。</p><div class="color-fine-fields"><label>色の調整<input type="color" id="color-fine-native"></label><label>色コード<input type="text" id="color-fine-hex" maxlength="7" spellcheck="false" autocomplete="off" aria-describedby="color-fine-error"></label></div><p id="color-fine-error" role="status"></p><button type="button" class="color-apply primary">この色にする</button></details></div><footer class="color-footer"><button type="button" class="color-cancel">やめる</button></footer>';
 document.body.append(dialog);
 const native=dialog.querySelector('#color-fine-native'),hex=dialog.querySelector('#color-fine-hex'),error=dialog.querySelector('#color-fine-error'),apply=dialog.querySelector('.color-apply'),grids=[...dialog.querySelectorAll('.color-grid')];
 let target=null,opener=null;
 function finish(value){
  if(!target)return;
  target.value=value;
  target.dispatchEvent(new Event('input',{bubbles:true}));
  target.dispatchEvent(new Event('change',{bubbles:true}));
  syncColorButtons();dialog.close();
 }
 PALETTE_COLORS.forEach((color,index)=>{
  const b=document.createElement('button'),tile=document.createElement('span'),offset=index<96?index:index-96;
  b.type='button';b.className='color-tile';b.dataset.color=color.hex;b.setAttribute('aria-label',color.name);b.setAttribute('aria-pressed','false');b.title=color.name;
  b.classList.toggle('shift-wide',Math.floor(offset/12)%2===1);b.classList.toggle('shift-narrow',Math.floor(offset/6)%2===1);
  tile.setAttribute('aria-hidden','true');tile.style.background=color.hex;tile.style.color=readableInk(color.hex);b.append(tile);b.onclick=()=>finish(color.hex);grids[index<96?0:1].append(b);
 });
 const buttons=[...dialog.querySelectorAll('.color-tile')];
 function focusColor(button){for(const b of buttons)b.tabIndex=b===button?0:-1;button.focus({preventScroll:true});button.scrollIntoView({block:'nearest',inline:'nearest'});}
 for(const b of buttons)b.addEventListener('focus',()=>{for(const tile of buttons)tile.tabIndex=tile===b?0:-1;});
 dialog.querySelector('.color-scroll').addEventListener('keydown',e=>{
  const index=buttons.indexOf(document.activeElement);if(index<0)return;
  const columns=getComputedStyle(grids[0]).gridTemplateColumns.split(' ').length;
  const next={ArrowLeft:index-1,ArrowRight:index+1,ArrowUp:index-columns,ArrowDown:index+columns,Home:0,End:buttons.length-1}[e.key];
  if(next===undefined)return;e.preventDefault();focusColor(buttons[Math.max(0,Math.min(buttons.length-1,next))]);
 });
 function open(input,button,name){
  target=input;opener=button;syncColorButtons();dialog.querySelector('#color-picker-title').textContent=name;
  native.value=input.value;hex.value=input.value;hex.setAttribute('aria-invalid','false');apply.disabled=false;error.textContent='';dialog.querySelector('details').open=false;
  dialog.querySelector('.color-current-chip').style.background=input.value;
  for(const b of buttons){const selected=b.dataset.color===input.value.toLowerCase();b.setAttribute('aria-pressed',String(selected));b.firstChild.textContent=selected?'✓':'';}
  dialog.showModal();dialog.querySelector('.color-scroll').scrollTop=0;
  focusColor(buttons.find(b=>b.getAttribute('aria-pressed')==='true')||buttons[0]);
 }
 for(const input of inputs){
  const name=input.getAttribute('aria-label')||input.labels?.[0]?.textContent.trim()||'色を選ぶ',button=document.createElement('button');
  button.type='button';button.className='color-picker-open';button.setAttribute('aria-label',name+'を選ぶ');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);
  button.innerHTML='<span aria-hidden="true"></span><span>色を選ぶ</span>';input.before(button);input.hidden=true;
  const oldHex=input.closest('.paint-color')?.querySelector('.paint-hex');if(oldHex)oldHex.hidden=true;
  if(input.labels?.[0]?.htmlFor===input.id){button.id=input.id+'-palette';input.labels[0].htmlFor=button.id;}
  controls.set(input,button);button.onclick=()=>open(input,button,name);
  input.addEventListener('input',syncColorButtons);input.addEventListener('change',syncColorButtons);
 }
 native.oninput=()=>{hex.value=native.value;hex.setAttribute('aria-invalid','false');error.textContent='';apply.disabled=false;};
 hex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(hex.value);hex.setAttribute('aria-invalid',String(!valid));apply.disabled=!valid;error.textContent=valid?'':'#と6けたの色コードを入れてね（例：#ff8800）';if(valid)native.value=hex.value;};
 apply.onclick=()=>{if(!apply.disabled)finish(native.value);};
 dialog.querySelector('.color-close').onclick=dialog.querySelector('.color-cancel').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{target=null;if(opener?.isConnected&&!opener.disabled)opener.focus({preventScroll:true});});
 syncColorButtons();
}
