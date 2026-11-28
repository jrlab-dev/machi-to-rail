import {isUnmodifiedPreset} from './town-save-format.mjs?v=rail-90';
import {readTownStore,TOWN_STORE_KEY,CURRENT_TOWN_KEY,TOWN_CHOICES} from './town-switcher.mjs?v=rail-97';
import {commitStorage} from './train-storage.mjs?v=rail-90';
export function deleteTown(storage,snapshot,id,validate,empty){
 const current=readTownStore(storage,validate);
 if(current.raw!==snapshot.raw||storage.getItem(CURRENT_TOWN_KEY)!==snapshot.live)throw Error('確認中に街が変わりました。一覧を開き直してください。');
 if(!Object.hasOwn(current.slots,id))throw Error('この街の保存データはありません。');
 const slots={...current.slots};delete slots[id];let active=current.active;
 if(active===id){active=Object.keys(slots)[0]||'empty';if(!Object.hasOwn(slots,active))slots[active]=validate(empty);}
 const raw=JSON.stringify({version:1,active,slots}),live=active===current.active&&id!==current.active?snapshot.live:JSON.stringify(slots[active]);
 const saved=commitStorage(storage,[[TOWN_STORE_KEY,raw],[CURRENT_TOWN_KEY,live]]);
 const result={raw,live,active,slots};
 return saved?saved.then(()=>result):result;
}
export function setupTownDeletion({snapshot,erase,blocked}){
 const launch=document.createElement('button');launch.type='button';launch.textContent='保存した街を消す';launch.id='town-delete-open';document.querySelector('#town-choose-panel').append(launch);
 const d=document.createElement('dialog');d.id='town-delete-dialog';d.setAttribute('aria-labelledby','town-delete-title');
 d.innerHTML='<h2 id="town-delete-title">保存した街を消す</h2><div data-delete="list"></div><section data-delete="confirm" hidden><h3 data-delete="title"></h3><p data-delete="detail"></p><div class="town-delete-final-zone"><button type="button" data-delete="final" hidden>この街を消す</button></div><div class="town-delete-bottom"><button type="button" data-delete="cancel">やめる</button><button type="button" data-delete="next">消す前の さいごの確認へ</button></div></section><p data-delete="status" role="status"></p><button type="button" data-delete="close">閉じる</button>';
 document.body.append(d);const q=n=>d.querySelector('[data-delete="'+n+'"]');let saved,id,targetName,stage=0,busy=false,armed=0;
 const reason=()=>{const r=blocked();if(r)q('status').textContent=typeof r==='string'?r:'準備が終わってから操作してください。';return !!r;};
 function reset(){stage=0;id=null;q('confirm').hidden=true;q('list').hidden=false;q('final').hidden=true;q('next').hidden=false;}
 function refresh(){saved=snapshot();reset();q('list').replaceChildren();const edited=Object.keys(saved.slots).filter(key=>!isUnmodifiedPreset(key,saved.slots[key]));for(const key of edited){const b=document.createElement('button');b.type='button';const name=TOWN_CHOICES.find(t=>t.id===key)?.name||key;b.textContent=name+'を消す';b.onclick=()=>{if(busy||reason())return;id=key;targetName=name;stage=1;q('list').hidden=true;q('confirm').hidden=false;q('title').textContent='「'+name+'」を消しますか？';q('detail').textContent='このスマホ・パソコンに保存した街を消します。保存庫の電車は残ります。見本の街は、あとから初期状態で開けます。';q('cancel').focus();};q('list').append(b);}if(!edited.length)q('status').textContent='保存した街はありません。';}
 launch.onclick=()=>{q('status').textContent='';try{refresh();d.showModal();q('close').focus();}catch(e){q('status').textContent=e.message;d.showModal();}};
 q('next').onclick=()=>{if(stage!==1||busy||reason())return;stage=2;armed=performance.now()+800;q('next').hidden=true;q('final').hidden=false;q('title').textContent='「'+targetName+'」を本当に消しますか？';q('detail').textContent='消した街の編集内容は元にもどせません。今開いている街を消す場合は、別の保存した街（なければ空の土地）へ移ります。';q('cancel').focus();};
 q('cancel').onclick=()=>{if(!busy){reset();q('status').textContent='消すのを取り消しました。';}};
 q('final').onclick=async()=>{if(stage!==2||performance.now()<armed||busy||reason())return;busy=true;for(const b of d.querySelectorAll('button'))b.disabled=true;try{await erase(saved,id);refresh();q('status').textContent='街を消しました。保存庫の電車は残っています。';}catch(e){reset();q('status').textContent=e.message;}finally{busy=false;for(const b of d.querySelectorAll('button'))b.disabled=false;}};
 q('close').onclick=()=>{if(!busy)d.close();};d.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
}
