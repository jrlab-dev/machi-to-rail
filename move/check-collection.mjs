import {validateScene,validateReplay} from '../play/core.mjs';
import {readTownStore} from '../play/town-switcher.mjs';
import {readLibrary} from '../play/train-library.mjs';
import {readPending} from '../play/train-retention.mjs';
import {readUsage} from '../play/train-ranking.mjs';
export async function checkCollection({values}){
 const storage={getItem:key=>values[key]??null};
 const response=await fetch('../play/assets/rail-kit.json');
 if(!response.ok)throw Error('線路の資料を取得できません。接続を確認してください。');
 const kit=await response.json();
 const scene=value=>validateScene(value,kit);
 if(values['rail-town-v2'])scene(JSON.parse(values['rail-town-v2']));
 readTownStore(storage,scene);readLibrary(storage);readPending(storage);readUsage(storage);
 if(values['rail-town-replay'])validateReplay(JSON.parse(values['rail-town-replay']),kit);
 if(values['rail.stationAds.v1']){
  const posters=JSON.parse(values['rail.stationAds.v1']);
  if(!posters||typeof posters!=='object'||Array.isArray(posters)||Object.values(posters).some(v=>typeof v!=='string'||v.length>300000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)))throw Error('駅広告の画像を読み込めません。');
 }
}
