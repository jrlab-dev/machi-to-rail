import {townSaveLabel} from './town-save-format.mjs?v=rail-90';
import {LIBRARY_KEY,normalizeLibrary} from './train-library.mjs?v=rail-90';
import {commitStorage} from './train-storage.mjs?v=rail-90';

export const TOWN_STORE_KEY='rail-town-slots-v1',CURRENT_TOWN_KEY='rail-town-v2';
export const TOWN_CHOICES=[
 {id:'suspended',name:'潮見けんすい線',image:'towns/shiomi.webp',description:'ビルの中から住宅街と山のトンネルをぬけて海へ。上下線の列車がすれちがう5駅。'},
 {id:'island',name:'未来島モノレール',image:'towns/island.webp',description:'ななめのケーブルでつる橋をわたり、空港や灯台のある7つの島を結ぶ海上モノレール。'},
 {id:'tokyo',name:'東京地下かんじょう線',image:'towns/tokyo.webp',description:'地下から東京駅へ。丸の内と有楽町をめぐる4駅のかんじょう線。'},
 {id:'mountain',name:'登山鉄道',image:'towns/mountain.png?v=summit-45',description:'4つの駅を結ぶ登山鉄道。森の美術館前の複線で、2両の列車が待ち合わせます。'},
 {id:'mine',name:'わたしの街',image:null,description:'これまでつくった街・読みこんだ街'},
 {id:'district',name:'駅のある街',image:'towns/district.webp',description:'駅とふみきり、街並みを走る'},
 {id:'intercity',name:'都市間のこうか',image:'towns/intercity.webp',description:'海と富士山、2つの都市を結ぶ'},
 {id:'elevated',name:'小さなこうか',image:'towns/elevated.webp',description:'こうかと坂のあるコンパクトな街'},
 {id:'large',name:'広い街',image:'towns/large.webp',description:'長い線路と広い街並み'},
 {id:'small',name:'小さな街',image:'towns/small.webp',description:'小さな一周線路から楽しむ'},
 {id:'branch',name:'分岐の街',image:'towns/branch.webp',description:'線路の分かれ道をつくる'},
 {id:'empty',name:'空の土地',image:null,description:'線路も建物も自由につくる'}
];
export const visibleTownChoices=state=>TOWN_CHOICES.filter(t=>['mine','district','intercity','mountain','tokyo','island','suspended'].includes(t.id)||state.saved.includes(t.id)||t.id===state.active).sort((a,b)=>{const rank=id=>({district:0,intercity:1,mountain:2,tokyo:3,island:4,suspended:5,mine:6}[id]??4);return rank(a.id)-rank(b.id);});
const ids=new Set(TOWN_CHOICES.map(t=>t.id)),copy=v=>JSON.parse(JSON.stringify(v));
function townSnapshot(scene,validate){const next=validate(copy(scene));delete next.trainLibrary;return next;}
export function readTownStore(storage,validate){
 const raw=storage.getItem(TOWN_STORE_KEY);
 if(raw===null)return {raw:null,active:'mine',slots:{}};
 try{
  const data=JSON.parse(raw);
  if(data?.version!==1||!ids.has(data.active)||!data.slots||typeof data.slots!=='object'||Array.isArray(data.slots)||Object.keys(data.slots).some(id=>!ids.has(id))||!Object.hasOwn(data.slots,data.active))throw Error();
  const slots={};for(const [id,scene]of Object.entries(data.slots))slots[id]=townSnapshot(scene,validate);
  return {raw,active:data.active,slots};
 }catch(error){throw Error('保存した街の一覧を読みこめません。元のデータを守るため切りかえを止めています。今の街をファイルに保存してください。',{cause:error});}
}
export function commitTownStore(storage,store,id,scene,validate,{expectedLive,libraryItems,extraWrites=[],expected=[]}={}){
 if(!ids.has(id))throw Error('この街は選べません。');
 const current=readTownStore(storage,validate);
 if(current.raw!==store.raw||(expectedLive!==undefined&&storage.getItem(CURRENT_TOWN_KEY)!==expectedLive))throw Error('街は別の画面で変えられています。今の街をファイルに保存してから、ページを開き直してください。');
 const town=townSnapshot(scene,validate),slots={...current.slots,[id]:town},raw=JSON.stringify({version:1,active:id,slots}),live=JSON.stringify(town);
 const writes=[[TOWN_STORE_KEY,raw],[CURRENT_TOWN_KEY,live]];
 if(libraryItems!==undefined)writes.push([LIBRARY_KEY,JSON.stringify({version:2,items:normalizeLibrary(libraryItems)})]);
 const saved=commitStorage(storage,[...writes,...extraWrites],{expected});
 const result={raw,live,active:id,slots};
 return saved?saved.then(()=>result):result;
}

export function setupTownChooser({current,select,edit,blocked}){
 const dialog=document.querySelector('#town-chooser'),cards=document.querySelector('#town-cards'),status=document.querySelector('#town-status');
 const tabs=[...dialog.querySelectorAll('[data-town-tab]')];
 function tab(name){for(const b of tabs){const active=b.dataset.townTab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}for(const p of dialog.querySelectorAll('[data-town-panel]'))p.hidden=p.dataset.townPanel!==name;}
 function refresh(){
  const state=current();document.querySelector('#town-current').textContent='今の街：'+(TOWN_CHOICES.find(t=>t.id===state.active)?.name||'わたしの街');status.textContent=state.error||'見本はそのまま遊べます。電車や街を変えると、続きから遊べます。';cards.replaceChildren();
for(const choice of visibleTownChoices(state)){const b=document.createElement('button'),img=document.createElement(choice.image?'img':'div'),text=document.createElement('span'),name=document.createElement('strong'),description=document.createElement('small'),saved=document.createElement('em');b.type='button';b.className='town-card';b.dataset.townId=choice.id;b.setAttribute('aria-current',String(choice.id===state.active));if(choice.image){img.src='./assets/'+choice.image;img.alt='';img.loading='lazy';img.width=360;img.height=200;}else{img.className=choice.id==='mine'?'town-mine-art':'town-empty-art';img.textContent=choice.id==='mine'?'⌂ MY TOWN':choice.id==='mountain'?'▲ 登山鉄道':'＋';img.setAttribute('aria-hidden','true');}name.textContent=choice.name;description.textContent=choice.description;saved.textContent=choice.id===state.active?'いま開いています':townSaveLabel(choice.id,state.slots?.[choice.id]);text.append(name,description,saved);b.append(img,text);b.disabled=false;b.onclick=()=>run(()=>select(choice.id,false));cards.append(b);}
  document.querySelector('#town-empty').disabled=false;
 }
 function blockedMessage(){const reason=blocked();if(!reason)return false;status.textContent=typeof reason==='string'?reason:'準備中です。少し待ってから、もう一度街を選んでください。';return true;}
 async function run(action){if(blockedMessage())return;const buttons=[...dialog.querySelectorAll('button:not(#town-close)')];buttons.forEach(b=>b.disabled=true);status.textContent='今の街を保存し、選んだ街を準備しています…';try{if(await action()!==false)dialog.close();else if(!blockedMessage())status.textContent='街を切りかえられませんでした。もう一度選んでください。';}catch(error){status.textContent=error?.message||'街を切りかえられませんでした。もう一度選んでください。';}finally{buttons.forEach(b=>b.disabled=false);if(dialog.open){const message=status.textContent;refresh();status.textContent=message;}}}
 function close(){if(blocked())select(null);dialog.close();}
 document.querySelector('#town-close').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 tabs.forEach((b,i)=>{b.onclick=()=>tab(b.dataset.townTab);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tab(tabs[next].dataset.townTab);tabs[next].focus();};});
 document.querySelector('#town-edit-current').onclick=()=>{if(blocked())return;dialog.close();edit();};
 document.querySelector('#town-empty').onclick=()=>run(()=>select('empty',true));
 return {open(name='choose'){refresh();blockedMessage();tab(name);if(!dialog.open)dialog.showModal();document.querySelector('#town-close').focus();},refresh};
}
