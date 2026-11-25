export const TRAIN_TYPES={original:'普通の電車',tram:'路面電車', 'express-short':'新幹線（短い先頭）','express-long':'新幹線（長い先頭）','express-retro':'新幹線（丸い先頭・旧型）','limited-classic':'王道の特急','limited-stream':'流線形の特急','limited-panorama':'展望特急',steam:'蒸気機関車',maglev:'リニアモーターカー',monorail:'跨座式モノレール','suspended-monorail':'懸垂式モノレール',freight:'貨物列車'};
export const limitedExpressTypes=['limited-classic','limited-stream','limited-panorama'];
export const isLimitedExpress=type=>limitedExpressTypes.includes(type);
export const isMonorail=type=>type==='monorail'||type==='suspended-monorail';
export const isLocomotive=type=>type==='steam'||type==='freight';
export const shinkansenTypes=['express-short','express-long','express-retro'];
export const isExpress=type=>shinkansenTypes.includes(type);
export const isHighSpeed=type=>isExpress(type)||type==='maglev';
export const intercityTrainSpeed=type=>type==='maglev'?350/3.6:isExpress(type)?200/3.6:15;
export const hasNamedParts=type=>isExpress(type)||type==='maglev'||isLocomotive(type);
export const soundKind=type=>type==='tram'?'tram':type==='freight'?'freight':type==='steam'?'steam':type==='maglev'?'maglev':isExpress(type)?'express':'electric';
export const trainType=type=>Object.hasOwn(TRAIN_TYPES,type)?type:'original';
export const typeName=type=>TRAIN_TYPES[trainType(type)];
export const designKey=(type,other=false)=>({'limited-classic':other?'oppositeLimitedClassicDesign':'limitedClassicDesign','limited-stream':other?'oppositeLimitedStreamDesign':'limitedStreamDesign','limited-panorama':other?'oppositeLimitedPanoramaDesign':'limitedPanoramaDesign',monorail:other?'oppositeMonorailDesign':'monorailDesign','suspended-monorail':other?'oppositeSuspendedDesign':'suspendedDesign',tram:other?'oppositeTramDesign':'tramDesign','express-short':other?'oppositeExpressShortDesign':'expressShortDesign','express-long':other?'oppositeExpressLongDesign':'expressLongDesign','express-retro':other?'oppositeExpressRetroDesign':'expressRetroDesign',steam:other?'oppositeSteamDesign':'steamDesign',maglev:other?'oppositeMaglevDesign':'maglevDesign',freight:other?'oppositeFreightDesign':'freightDesign'}[type]||(other?'oppositeTrainDesign':'trainDesign'));
export const DESIGN_KEYS=Object.keys(TRAIN_TYPES).flatMap(type=>[designKey(type),designKey(type,true)]);
export const EXPRESS_DESIGNS={
 'limited-classic':{name:'やまなみ',body:'#eee0bb',face:'#efe3c6',stripe:'#a34442',stripe2:'#bc9452',roof:'#646562',door:'#ecdfc6'},
 'limited-stream':{name:'あおしお',body:'#dee9e7',face:'#254b58',stripe:'#147e88',stripe2:'#ccad62',roof:'#4b646a',door:'#d7e2df'},
 'limited-panorama':{name:'あかつき展望号',body:'#b34b3f',face:'#ac4037',stripe:'#f5deb1',stripe2:'#9e8449',roof:'#5e5956',door:'#b34b3f'},
 monorail:{name:'未来島モノレール',body:'#e5e8dd',stripe:'#008c8e',stripe2:'#e4a553',door:'#bacdcb',roof:'#9aa9a8'},
 'suspended-monorail':{name:'潮見モノレール',body:'#f3f0df',stripe:'#174674',stripe2:'#428bb0',door:'#f3f0df',roof:'#a9b7b9'},
 freight:{name:'みなとの貨物便',body:'#245963',roof:'#414e53',face:'#245963',stripe:'#e7d9b8',stripe2:'#b4774f',door:'#245963',pattern:'legacy',doorSeparate:true},
 'express-short':{name:'あかねのつばさ',body:'#f3e7d0',roof:'#a64c3c',face:'#a64c3c',stripe:'#345c50',stripe2:'#345c50',door:'#f3e7d0',pattern:'legacy',doorSeparate:true},
 'express-retro':{name:'あおぞらひかり',body:'#f2ead4',roof:'#d6d2c5',face:'#eee5cb',stripe:'#21538d',stripe2:'#254e81',door:'#f2ead4',pattern:'legacy',doorSeparate:true},
 'express-long':{name:'すみれのかぜ',body:'#e7e8ed',roof:'#66549c',face:'#66549c',stripe:'#c9a45a',stripe2:'#c9a45a',door:'#e7e8ed',pattern:'legacy',doorSeparate:true},
 steam:{name:'森の蒸気号',body:'#21483b',roof:'#252b29',face:'#252b29',stripe:'#b99b55',stripe2:'#b99b55',door:'#21483b',pattern:'legacy',doorSeparate:true},
 maglev:{name:'未来のそよかぜ',body:'#f0ebdf',roof:'#19535a',face:'#19535a',stripe:'#b47e52',stripe2:'#b47e52',door:'#f0ebdf',pattern:'legacy',doorSeparate:true}
};
export const expressLimit=scene=>isHighSpeed(scene.train)||isHighSpeed(scene.oppositeTrain)?8:11;
