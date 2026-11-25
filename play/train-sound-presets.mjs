export const SOUND_SLOTS={departure:{name:'発車メロディー',ms:4000,step:125},signal:{name:'ドアが閉まる合図',ms:600,step:50},close:{name:'ドアが動く音',ms:1700,step:50}};
export const INSTRUMENTS={piano:'ピアノ',musicbox:'オルゴール',xylophone:'木琴',chime:'チャイム'};
const melody=(instrument,pitches,spacing,length)=>({tracks:[{instrument,volume:.8,mute:false,notes:pitches.map((pitch,i)=>({pitch,start:i*spacing,duration:length,velocity:.8}))}]});
const phrase=(instrument,steps,unit)=>{let start=0;return{tracks:[{instrument,volume:.8,mute:false,notes:steps.map(([pitch,beats])=>{const n={pitch,start,duration:Math.round(beats*unit)-45,velocity:.8};start+=Math.round(beats*unit);return n;})}]};};
const classical=(id,name,recipe)=>({id,name,group:'クラシック',recipe});
const household=(id,name,recipe)=>({id,name,group:'くらしのチャイム',recipe});
export const SOUND_PRESETS={
 departure:[{id:'usual',name:'いつもの合図',legacy:true},{id:'sparkle',name:'きらきら',recipe:melody('musicbox',[72,76,79,84,79,76],450,350)},{id:'leisure',name:'のんびり',recipe:melody('piano',[60,64,67,64],800,640)},{id:'excited',name:'わくわく',recipe:melody('xylophone',[60,67,64,72,67,76,72],375,250)},
  classical('dolls-dream','人形の夢と目覚め',phrase('musicbox',[[64,1],[67,.5],[72,.5],[71,1],[67,.5],[74,.5],[72,1],[76,2]],450)),
  classical('fur-elise','エリーゼのために',phrase('musicbox',[[76,1],[75,1],[76,1],[75,1],[76,1],[71,1],[74,1],[72,1],[69,3]],260)),
  classical('ode-to-joy','歓喜の歌',phrase('chime',[[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2]],240)),
  classical('minuet-g','メヌエット',phrase('piano',[[74,2],[67,1],[69,1],[71,1],[72,1],[74,2],[67,2],[67,2]],300)),
  household('laundry-done','洗濯できた',phrase('xylophone',[[72,1],[76,1],[79,2],[76,1],[72,1],[79,1],[84,2]],300)),
  household('microwave-ready','レンジのお知らせ',phrase('chime',[[79,1],[79,1],[79,1],[72,3]],350)),
  household('rice-ready','ごはんが炊けた',phrase('musicbox',[[67,1],[72,1],[74,1],[76,2],[72,2]],400)),
  household('home-chime','おうちのチャイム',phrase('chime',[[76,1],[72,2],[74,1],[67,2]],550))],
 signal:[{id:'dingdong',name:'ピンポン',recipe:melody('chime',[76,72],240,200)},{id:'softbell',name:'やさしい鈴',recipe:melody('musicbox',[79,76],220,220)},{id:'future',name:'未来のチャイム',recipe:{tracks:[{instrument:'chime',volume:.65,mute:false,notes:[72,76,79].map(pitch=>({pitch,start:0,duration:470,velocity:.7}))}]}}],
 close:[{id:'slide',name:'スライド',effect:'slide'},{id:'airdoor',name:'空気のドア',effect:'airdoor'},{id:'futuredoor',name:'未来のドア',effect:'futuredoor'}]
};
export const presetFor=(slot,id,version=1)=>version===1?SOUND_PRESETS[slot]?.find(p=>p.id===id):null;
