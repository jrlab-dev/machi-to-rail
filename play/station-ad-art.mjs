export const AD_SLOTS=[
 {id:'fuwapoko',title:'ふわポコ',tag:'ちいさな ともだち',copy:'声をかけて、いっしょに遊ぼう。',footer:'声まね・お世話・ふたりの毎日',bg:'#efe6fb',ink:'#49366c',accent:'#af87d4'},
 {id:'kanjimon',title:'かんじもん',tag:'漢字が、冒険になる。',copy:'あそんで おぼえる かんじゲーム',footer:'かんじモンRPG',bg:'#e0efe8',ink:'#184d44',accent:'#e8ad45'},
 {id:'pigs',title:'3匹のコブタ',tag:'同じお話、ちがう結末。',copy:'性格次第でストーリーが変わる',footer:'新しい物語のゲーム、制作中',bg:'#fff0df',ink:'#794433',accent:'#da8068'},
 {id:'bigfive',title:'ビッグファイブ診断',tag:'あなたらしさを、見つけよう。',copy:'5つの性格特性から、自分を知る。',footer:'自分を知る、新しいきっかけに。',bg:'#e3edf9',ink:'#253c64',accent:'#608cc8'},
 {id:'recruit',title:'広告募集',tag:'この駅に、あなたの広告を。',copy:'まちとレール 駅広告スペース',footer:'ゲーム・サービス・作品のご紹介に',bg:'#143e39',ink:'#fff9e8',accent:'#e6c87c'}
];
const art=new Map();
const artFiles={pigs:'pigs.webp',fuwapoko:'fuwapoko.png',kanjimon:'kanjimon.webp',bigfive:'bigfive-character.webp',logo:'bigfive-logo.webp'};
function loadArt(){return Promise.all(Object.entries(artFiles).map(([key,file])=>art.has(key)?true:new Promise(resolve=>{const img=new Image();let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);img.onload=img.onerror=null;if(ok)art.set(key,img);resolve(ok);};const timer=setTimeout(()=>finish(false),10000);img.onload=()=>finish(true);img.onerror=()=>finish(false);img.src=new URL('./assets/station-ads/'+file,import.meta.url).href;})));}
export let adArtReady=loadArt();
export function retryAdArt(){return adArtReady=loadArt();}
export function missingAdArt(){return Object.keys(artFiles).filter(key=>!art.has(key));}
export function defaultAdCanvas(slot){
 const c=document.createElement('canvas');c.width=1536;c.height=512;const x=c.getContext('2d');
 const text=(s,size,px,py,color=slot.ink)=>{x.fillStyle=color;x.font=`700 ${size}px "Hiragino Kaku Gothic ProN",sans-serif`;x.fillText(s,px,py);};
 const rect=(a,b,w,h,r,color)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 x.fillStyle=slot.bg;x.fillRect(0,0,1536,512);x.fillStyle=slot.accent;x.fillRect(0,0,18,512);
 x.globalAlpha=.12;x.fillStyle=slot.accent;x.beginPath();x.arc(1340,250,320,0,Math.PI*2);x.fill();x.globalAlpha=1;
 const original=art.get(slot.id);
 if(slot.id in artFiles&&!original){text('画像を読み込めませんでした',24,945,250);text('駅の広告メニューで再読み込み',21,945,290);}
 if(original){
  if(slot.id==='kanjimon')x.drawImage(original,768,0,768,512);
  if(slot.id==='pigs')x.drawImage(original,800,0,720,512);
  if(slot.id==='fuwapoko')x.drawImage(original,790,40,720,418);
  if(slot.id==='bigfive'){x.drawImage(original,1090,24,246,464);const logo=art.get('logo');if(logo)x.drawImage(logo,858,125,218,218);}
 }
 text(slot.tag,32,64,85);text(slot.title,slot.id==='bigfive'?64:slot.id==='kanjimon'?90:96,60,211);text(slot.copy,slot.id==='kanjimon'?31:36,64,295);
 x.fillStyle=slot.accent;x.fillRect(64,343,80,6);text(slot.footer,27,64,409);text('まちとレール  /  STATION GALLERY',19,64,470);
 if(slot.id==='recruit'){x.strokeStyle=slot.accent;x.lineWidth=6;x.setLineDash([18,14]);x.strokeRect(1090,100,350,290);x.setLineDash([]);text('YOUR',58,1160,215);text('AD HERE',46,1136,287);text('3 : 1',25,1226,350);}
 return c;
}
