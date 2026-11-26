export function setupStoragePanel({read,erase,exportReplay,blocked}){
 const button=document.createElement('button');button.id='storage-open';button.textContent='保存データを確認';document.querySelector('#file-menu .menu-grid').append(button);
 const dialog=document.createElement('dialog');dialog.id='storage-panel';dialog.setAttribute('aria-labelledby','storage-title');
 dialog.innerHTML='<h2 id="storage-title">保存データ</h2><p class="storage-policy">つくった電車や街は、自動では消しません。</p><p>走行記録は手動で開始します。新しい記録はブラウザへ自動保存しません。以前の自動記録が残っている場合は、ここで消せます。</p><dl><dt>このブラウザに保存している量（目安）</dt><dd data-storage="total"></dd><dt>うち、以前保存した走行記録</dt><dd data-storage="replay"></dd></dl><p class="help">パソコン全体の空き容量ではありません。ファイルに保存した作品・動画はふくみません。</p><div class="storage-actions"><button data-storage="export">走行記録をファイルに保存</button><button data-storage="delete">走行記録を消す</button></div><section data-storage="confirm" hidden><h3>走行記録を消しますか？</h3><p>このブラウザの走行記録と、今の画面の走行記録を消します。電車・街・写真・音・書き出したファイルは残ります。</p><div class="storage-actions"><button data-storage="cancel">やめる</button><button data-storage="erase">走行記録だけを消す</button></div></section><p data-storage="status" role="status" aria-live="polite"></p><button data-storage="close">閉じる</button>';
 document.body.append(dialog);const q=name=>dialog.querySelector('[data-storage="'+name+'"]');let snapshot=null,busy=false;
 const size=n=>n<1024?`${n} B`:`${(n/1024/1024).toFixed(2)} MB`;
 function refresh(){snapshot=read();q('total').textContent=size(snapshot.total);q('replay').textContent=size(snapshot.replay);q('export').disabled=!snapshot.canExport;q('delete').disabled=!snapshot.canDelete;}
 button.onclick=()=>{if(blocked())return;try{refresh();q('confirm').hidden=true;q('status').textContent='';document.querySelector('#file-menu').hidden=true;document.querySelector('#menu').setAttribute('aria-expanded','false');dialog.showModal();q('close').focus();}catch{dialog.showModal();q('status').textContent='保存データを確認できませんでした。作品は変えていません。';q('export').disabled=true;q('delete').disabled=true;}};
 q('export').onclick=()=>{if(!blocked())exportReplay();};
 q('delete').onclick=()=>{if(blocked()||busy)return;q('confirm').hidden=false;q('cancel').focus();};
 q('cancel').onclick=()=>{q('confirm').hidden=true;q('delete').focus();};
 q('erase').onclick=async()=>{if(blocked()||busy)return;busy=true;q('erase').disabled=true;try{await erase(snapshot.raw);refresh();q('confirm').hidden=true;q('status').textContent='走行記録を消しました。電車や街は残っています。';}catch(e){q('status').textContent=e.message;}finally{busy=false;q('erase').disabled=false;}};
 q('close').onclick=()=>{if(!busy)dialog.close();};dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 return {dialog};
}
