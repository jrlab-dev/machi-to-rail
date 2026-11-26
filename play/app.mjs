import {hitDecorationIndex} from './train-decoration-3d.mjs?v=rail-90';
import {decoratePaint} from './train-decorated-paint.mjs?v=rail-90';
import {setupDecorationEditor} from './train-decoration-editor.mjs?v=rail-90';
import {getCollection,collectionStorage} from './collection-store.mjs?v=rail-90';
import {tokyoTourShot} from './tokyo-auto-camera.mjs?v=rail-92';
import {islandTourShot} from './island-camera.mjs?v=rail-92';
import {suspendedShot} from './suspended-camera.mjs?v=rail-92';
import {startHorn,bindHorn,loadHornSample} from './cab-horn.mjs?v=rail-90';
import {attachHiddenRiders} from './hidden-riders.mjs?v=rail-90';
import {isSuspended,suspendedStations,startSuspended,advanceSuspended,lineFor,platformCenter as suspendedPlatform,portal as suspendedPortal} from './suspended-route.mjs?v=rail-90';
import {createSuspendedTown} from './suspended-renderer.mjs?v=rail-90';
import {openRailDatabase} from './rail-database.mjs?v=rail-90';
import {isIsland,islandRoute,islandStations,islandOuterRoute,islandOuterStations,initialIslandOuter,islandCarLength} from './island-route.mjs?v=rail-90';
import {initialLoop,stepLoop} from './station-loop.mjs?v=rail-90';
import {createIsland} from './island-renderer.mjs?v=rail-90';
import {createIslandTrain} from './island-train.mjs?v=rail-90';
import {tokyoRoute,tokyoStations,tokyoInnerRoute,tokyoInnerStations,initialTokyoInner,isTokyo} from './tokyo-route.mjs?v=rail-90';
import {undergroundStationAt} from './tokyo-platform-interior.mjs?v=rail-92';
import {createTokyoRenderer} from './tokyo-renderer.mjs?v=rail-92';
import {stepMountainDirector} from './mountain-auto-camera.mjs?v=rail-92';
import {crossingAudibility} from './crossing-audibility.mjs?v=rail-90';
import {windowMode,adjustableMode,neutralAdjustment,dragAdjustment,zoomAdjustment,passengerView,hideViewedTrain,adjustedCamera,bindViewGestures} from './camera-adjustment.mjs?v=rail-90';
import {connectRailPorts} from './rail-connector.mjs?v=rail-90';
import {deleteTown,setupTownDeletion} from './town-delete.mjs?v=rail-90';
import {MOUNTAIN_BUS_ID,MOUNTAIN_MINIBUS_ID,mountainRoadFrame,advanceMountainRoadTime} from './mountain-road.mjs?v=rail-90';
import {summitCrossingState,crossingAlarm} from './mountain-crossing.mjs?v=rail-90';
import {setupColorPicker,syncColorButtons} from './color-picker.mjs?v=rail-90';
import {withStorageLock,recoverStorage,commitStorage,isQuotaError,JOURNAL_KEY,REPLAY_KEY,onReplayCleanup,setReplayCleanupGuard} from './train-storage.mjs?v=rail-90';
import {storageUsage,createReplayEpoch} from './replay-storage.mjs?v=rail-90';
import {setupStoragePanel} from './storage-panel.mjs?v=rail-90';
import {soundFor,normalizeSoundProfile,copySound,hasWorkshopSound} from './train-sound-recipe.mjs?v=rail-90';
import {setupSoundEditor} from './train-sound-editor.mjs?v=rail-90';
import {usePosterStorage,setupStationAdControls} from "./station-ads.mjs?v=rail-92";
import {readTownStore,commitTownStore,TOWN_CHOICES,setupTownChooser} from './town-switcher.mjs?v=rail-90';
import {isDepartureTemplateProp} from './departure-city-layout.mjs?v=rail-90';
import {countryAvailable,countryAnchor,countryCamera,countryGeometry,countryExtent,countryRemaining,countryObstacles,heroCandidate,passCandidate,countryShotPose,countryShotSafe} from './country-camera.mjs?v=rail-90';
import {localSceneryWindow,createDirector,stepDirector,createRecordRequest,invalidateRecordRequest,recordRequestResult,cameraFollowDelta} from './camera-director.mjs?v=rail-92';
import {safeViewport} from './camera-composition.mjs?v=rail-90';
import {pairDoorLeaves,platformDoorShot,mountainDoorShot} from './door-camera.mjs?v=rail-90';
import {freightPlatformView} from './freight-view.mjs?v=rail-92';
import {prepareSteamMotion,animateSteamMotion} from './steam-motion.mjs?v=rail-90';
import {mountainExteriorCamera,clearMountainTerrain,smoothMountainCamera,mountainSceneryCamera} from './mountain-camera.mjs?v=rail-90';
import {isMountain,mountainTown,mountainTypeAllowed,mountainRoute,initialMountainState,advanceMountain,mountainPoses,mountainLead,mountainPlatformCenter,mountainHeight,mountainSurfaceHeight} from './mountain-data.mjs?v=rail-90';
import {initialMountainOpponent,advanceMountainPair} from './mountain-traffic.mjs?v=rail-90';
import {createMountainRenderer} from './mountain-renderer.mjs?v=rail-90';
import {STATIONS,stationAt,platformZ,stationCamera,initialIntercityService,advanceIntercityService,reverseIntercityService} from './intercity-stations.mjs?v=rail-92';
import {createIntercityTraffic} from './intercity-traffic.mjs?v=rail-92';
import {createTrainPreview} from './train-preview.mjs?v=rail-90';
import {intercityTown,isIntercity,intercityZone,intercitySpeedLimit,intercityObstructs} from './intercity-data.mjs?v=rail-90';
import {createIntercityRenderer} from './intercity-renderer.mjs?v=rail-92';
import {isArrivalTemplateProp} from './arrival-city-layout.mjs?v=rail-90';
import {elevatedSupportPlan} from './elevated-supports.mjs?v=rail-90';
import {STATION_TEXT,planStation,chooseSide,stationGeometry,stationFootprint,townStationConflicts,stationsAfterRailRemoval,nextStationName,validStationName,activeStations,STATION_NAME_MAX,stopsOnRoute,advanceFreeService,initialFreeService,reverseFreeService,freeDoorSide,nextFreeStop,freeStationOf,formationOverhangs,freeServiceText,freeStationView,toLocal} from './free-station.mjs?v=rail-90';
import {createFreeStationRenderer} from './free-station-renderer.mjs?v=rail-90';
import {buildElevatedRails} from './elevated-renderer.mjs?v=rail-90';
import {elevatedTown} from './elevated-town.mjs?v=rail-90';
import {prepareDoors,animateDoors} from './train-doors.mjs?v=rail-90';
import {doorOpening,trainView,movingView} from './service-presentation.mjs?v=rail-90';
import {selectedVehicles,VEHICLE_IDS} from './traffic-selection.mjs?v=rail-90';
import {pedestrianCrossingView,platformDoorView,landscapeCandidates,landscapePose,landscapeSafe,serviceExteriorCandidate,serviceExteriorPose,serviceExteriorSafe} from './scenic-cameras.mjs?v=rail-92';
import {PENDING_KEY,readPending,saveUniqueTrain,planRetention,restorePending,mergeRetainedScene} from './train-retention.mjs?v=rail-90';
import {USAGE_KEY,normalizeUsage,readUsage,markCreated,markUsed,rankTrains} from './train-ranking.mjs?v=rail-90';
import {readLibrary,mergeSceneLibrary,saveTrain,removeTrain,commitLibrary,applySavedTrain,applyBaseTrain,selectedTrainId,LIBRARY_KEY,LEGACY_LIBRARY_KEY} from './train-library.mjs?v=rail-90';
import {createCockpit} from './cockpit.mjs?v=rail-90';
import {setupPaintControls} from './train-paint-controls.mjs?v=rail-90';
import {designFor,designField,normalizeDesign,DESIGN_PRESETS,PAINT_PARTS,TRAM_DESIGN,TRAIN_EXAMPLES} from './train-design.mjs?v=rail-90';
import {preparePaint} from './train-paint.mjs?v=rail-90';
import {createTrafficRenderer} from './traffic-renderer.mjs?v=rail-91';
import {createRoadDrive} from './road-drive.mjs?v=rail-91';
import {trafficFrame,hasTrafficRoads,TRAFFIC_CORNERS} from './traffic-route.mjs?v=rail-90';
import {loadTrainSamples} from './train-samples.mjs?v=rail-90';
import * as T from 'three';
import {createTrainAudio,trainSoundGain} from './train-audio.mjs?v=rail-90';
import {observeTrainThumbnails} from './train-thumbnail.mjs?v=rail-90';
import {largeTown} from './large-town.mjs?v=rail-90';
import {districtTown,isDistrict,parallelRoute,initialService,advanceService,reverseService,trainPoses,STATION} from './district.mjs?v=rail-90';
import {createDistrictRenderer} from './district-renderer.mjs?v=rail-90';
import {CROSSING,crossingDistance,advanceCrossing} from './district-landscape.mjs?v=rail-90';
import {createSky} from './sky.mjs?v=rail-90';
import {createNatureSky} from './sky-panorama.mjs?v=rail-90';
import {setTrainWindowLights} from './train-lighting.mjs?v=rail-90';
import {bakeFacade} from './facade-bake.mjs?v=rail-90';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
import {fullPowerLimit,tractionAcceleration,leverTarget} from './cab-power.mjs?v=rail-90';
import {TRAIN_TYPES,shinkansenTypes,limitedExpressTypes,isMonorail,isLimitedExpress,typeName,isExpress,isHighSpeed,intercityTrainSpeed,hasNamedParts,isLocomotive,soundKind,DESIGN_KEYS,EXPRESS_DESIGNS,expressLimit} from './train-types.mjs?v=rail-90';
import {clone,point,transform,openPorts,makeRoute,sampleRoute,sampleItem,distanceOnRoute,advance,validateScene,defaultTown,overlapsRail,railIntersections,validateReplay,BUILDING_TYPES,ROAD_TYPES,defaultFormation,formationLength,formationFitsRoute,formationDistances,formationOccupiesDistance,formationAdvance,effectiveFormation,LEGACY_CAR_LENGTH} from './core.mjs?v=rail-90';
import {ROAD_CATALOG,roadPorts,snapRoad,validateRoadNetwork,buildExampleRoads} from './road-network.mjs?v=rail-90';
import {createRoadRenderer} from './road-renderer.mjs?v=rail-90';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let toastTimer=0;
// 案内は7秒で薄く消す（読み上げ用に文字は残す）。stay=true の注意は次の案内まで残す。
function say(s,stay=false){const t=$('#toast');t.textContent=s;t.classList.remove('toast-away');clearTimeout(toastTimer);if(!stay)toastTimer=setTimeout(()=>t.classList.add('toast-away'),7000);return s;}
let collection;
try{collection=await getCollection(new URLSearchParams(location.search).get('collection'));}
catch(error){document.querySelector('#load-detail').textContent=error.message;throw error;}
const persistentStorage=collectionStorage(collection,window.localStorage);
usePosterStorage(persistentStorage);
const localStorage=await openRailDatabase(persistentStorage,collection?'machi-rail-works-'+collection.id:'machi-rail-works');
const KIT=await fetch('./assets/rail-kit.json').then(r=>{if(!r.ok)throw Error('線路データを取得できません');return r.json()});
const CONSIST=await fetch('./assets/consist-models.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
const cloneData=clone,loader=new GLTFLoader(),canvas=$('#world'),scene=new T.Scene();scene.background=createSky();scene.fog=new T.Fog('#d8e8f0',800,2400);
let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});}catch(e){$('#load-detail').textContent='3D表示を開始できません。Safari・Chromeの新しいタブで開いてください。';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const camera=new T.PerspectiveCamera(48,1,.08,3000),sun=new T.DirectionalLight('#fff4d9',3.0),ambient=new T.HemisphereLight('#f4fbff','#a4af80',2.7);sun.position.set(-60,130,30);scene.add(sun,ambient);sun.intensity=2.6;ambient.intensity=1.5;sun.position.set(-140,240,110);sun.target.position.set(200,0,-140);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-380,right:380,top:320,bottom:-320,near:1,far:950});sun.shadow.bias=-.00025;sun.shadow.normalBias=.16;
scene.add(camera);
const cockpit=createCockpit(camera);
let scenicLook=null,scenicTime=performance.now(),autoCamera=false,autoElapsed=0,autoPhase=null,recordStarting=false,viewTrain=0;
let simulationTime=0,director=createDirector(),directorEpoch=0,directorPose=null,directorCut=-1,directorCandidates=null,directorCandidateTime=-Infinity,directorViewport=null,directorViewportKey='',directorObstacles=[],recordRequest=createRecordRequest(),cameraFrameDelta=0,directorFollow=null;
const cameraWorkSamples=[];
let autoRenderedPose=null;
let stationDoorCache=null;
const reducedCameraMotion=matchMedia('(prefers-reduced-motion: reduce)');
function invalidateAutoRecord(cancelStart=false){recordRequest=invalidateRecordRequest(recordRequest,cancelStart);}
function resetDirector(){directorEpoch++;directorCandidates=null;directorCandidateTime=-Infinity;directorFollow=null;autoRenderedPose=null;}
$('#seek').addEventListener('input',()=>{scenicLook=null;});
const material=(color)=>new T.MeshStandardMaterial({color,roughness:.9});
const ground=new T.Mesh(new T.PlaneGeometry(3000,3000),material('#72836c'));ground.rotation.x=-Math.PI/2;ground.position.y=-.5;ground.receiveShadow=true;scene.add(ground);
const townRoot=new T.Group(),railRoot=new T.Group(),markers=new T.Group(),trainRoot=new T.Group(),cabin=new T.Group();scene.add(townRoot,railRoot,markers,trainRoot,cabin);
const skyMat=material('#cad6c1');const distant=new T.InstancedMesh(new T.BoxGeometry(1,1,1),skyMat,38),dummy=new T.Object3D();for(let i=0;i<38;i++){const a=i/38*Math.PI*2,h=14+(i*17%29);dummy.position.set(200+Math.cos(a)*900,h/2-.5,-140+Math.sin(a)*900);dummy.scale.set(18+i%5*4,h,18);dummy.updateMatrix();distant.setMatrixAt(i,dummy.matrix)}scene.add(distant);
let paintDraft=null,paintDrafts=null,paintTouched=new Set(),paintTarget='main',mainPaint=null,otherPaint=null;
let trainLibrary=[],libraryError='',libraryWritable=true,paintBaseTown=null,paintType='original',paintEditId=null,typeDrafts={},savingTrain=false,choicesKey='',paintOriginalEntry=null,nameComposing=false;
let countryShotKey=null,countryReplayTime=null;
const isStationLoop=t=>isIsland(t)||isTokyo(t)||isSuspended(t);
const loopStations=t=>isSuspended(t)?suspendedStations:isIsland(t)?islandStations:tokyoStations;
const loopName=t=>isSuspended(t)?'潮見けんすい線':isIsland(t)?'未来島モノレール':'東京地下かんじょう線';
let suspendedRenderer=null;
let islandRenderer=null;
let tokyoRenderer=null;
let mountainRenderer=null,mountainControl={owner:null,turn:1};
let intercityRenderer=null,intercityLocked=false,returnCamera=null,intercityFleet=null,returnModels=[];
const hasSecondTrain=()=>isIsland(town)||isTokyo(town)||isSuspended(town)||activeDistrict||isIntercity(town)||isMountain(town);
let town,route,mode='watch',camMode='orbit',category='rails',railLayer='ground',tool=null,selected=null,selectedPort=null,selectedRoadPort=null,history=[],future=[],trainState={s:14,speed:0,dir:1,playing:false},orbit={x:20,y:40,yaw:-.55,pitch:.88,distance:190},light=false,model=null,carParts=[],carLength=LEGACY_CAR_LENGTH,loadingModel=false,loadTicket=0,ports=[],warnings=0,gateRows=[],buildingBatches=[],lastVisual=null,frameCount=0,fps=0,lastStats=performance.now(),dirty=false;
let troubleSpots=[],troubleText='',orbitGoal=null,lastEditDrag=-1e9,bootFrames=-1;
const QUICK_DWELL=3.2;
let recording=null,recordStart=0,recordTimer=null,videoURL=null,audioContext=null,audioGain=null,audioDestination=null,audioEnabled=false,nextBell=0,soundscape=null,lastAudioTime=0,audioLoadPromise=null;
let journeyCapturing=false,journey=null,replay=null,replayTime=0,replayPlaying=false,liveBackup=null,captureElapsed=0,nextCapture=0;
let soundStationPreview=null;
let townStore={raw:null,active:'mine',slots:{}},townStoreError='',townWritable=true,liveTownText=null,townSwitchBusy=false,townImportBusy=false,sceneReading=false;
let activeDistrict=false,oppositeRoute=null,oppositeState=null,oppositeParts=[],oppositeCarLength=LEGACY_CAR_LENGTH,lightingPhase='day';
const districtRenderer=createDistrictRenderer(),districtRoot=new T.Group(),oppositeRoot=new T.Group();scene.add(districtRoot,oppositeRoot);
const templates=new Map(),railTemplates=new Map(),modelCache=new Map(),crossTemplate=null;
const freeStationRenderer=createFreeStationRenderer();
// 自由編集の駅：stationTool＝「えき」を選んでいる、stationMode＝かたがわ('one')／りょうがわ('both')、placeSpots＝置けなかった場所の赤い丸（次の操作まで）。
let stationTool=false,stationMode='one',placeSpots=[],stationNaming=false,stationRestNotice=false;
// 段階3・4：freeStops＝今の経路で止まる駅（stopsOnRoute）、freeStopGeometries＝その駅の座標系。updateRoute で作り直す。
let freeStops=[],freeStopGeometries=[],freeShortNotice=false;
const traffic=createTrafficRenderer();scene.add(traffic.root);let trafficTime=0,trafficEnabled=false,trafficVehicle=1,trafficLoad=Promise.resolve(),trafficSelecting=false,sceneLoadTicket=0;
const roadDrive=createRoadDrive();
let roadTownKey=null;
const roadControls=$('#road-controls'),roadLook=$('#road-look');
const selectedCar=()=>isMountain(town)?mountainTrafficVehicle:VEHICLE_IDS[trafficVehicle];
function releaseRoad(){roadDrive.release();$('#road-drive').textContent='運転する';$('#road-pedals').hidden=true;}
function resetRoadView(){releaseRoad();roadLook.value='outside';}
$('#road-drive').onclick=()=>{
 if(roadDrive.driver){releaseRoad();return;}
 roadDrive.start(selectedCar(),trafficTime);roadLook.value='front';
 $('#road-drive').textContent='自動に戻す';$('#road-pedals').hidden=false;
};
for(const button of roadControls.querySelectorAll('[data-pedal]'))button.onclick=()=>roadDrive.pedal(Number(button.dataset.pedal));
for(const button of roadControls.querySelectorAll('[data-steer]'))button.onclick=()=>roadDrive.steer(Number(button.dataset.steer));
function roadFrame(time){
 const sample=isMountain(town)?mountainRoadFrame:t=>trafficFrame(t,selectedVehicles(town.trafficVehicles));
 const base=sample(time);
 return replay?base:roadDrive.frame(base,sample);
}
let mountainTrafficVehicle=MOUNTAIN_BUS_ID;
const roadRenderer=createRoadRenderer({roadSurface:window.RoadSurface});
const buildingSpecs={shop:{type:'shop',w:16,d:14,hInput:6},warehouse:{type:'warehouse',w:20,d:16,hInput:8},hotel:{type:'hotel',w:16,d:14,hInput:25},office:{type:'office',w:16,d:14,hInput:19},apartment:{w:16,d:14,h:20.4,floors:7,hInput:20.4,front:'-x'}};
function texture(c){const t=new T.CanvasTexture(c);t.flipY=false;t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t}
function geometryFromParts(parts){const pos=[],norm=[],uv=[];for(const m of parts)for(const i of m.indices){pos.push(...m.vertices[i].p);norm.push(...m.vertices[i].n);uv.push(...m.vertices[i].uv)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingSphere();return g}
const buildingSource=window.RingBuildingVariety.createTextures(document),apartmentSource=window.TerracottaApartments.createTextures(document);
const facadeStats={};
for(const[type,s]of Object.entries(buildingSpecs)){const isApartment=type==='apartment',api=isApartment?window.TerracottaApartments:window.RingBuildingVariety;const data=api.createGeometry({...s,cx:1,cz:0,fixedId:'rail-town-'+type});const baked=bakeFacade(data,isApartment?apartmentSource:buildingSource,isApartment);const g=geometryFromParts(baked.meshes);g.translate(-1,0,0);facadeStats[type]=baked.stats;templates.set(type,{g,m:new T.MeshStandardMaterial({map:texture(baked.color),emissiveMap:texture(baked.light),emissive:'#ffffff',emissiveIntensity:0,roughness:.85}),height:data.bounds.y1,w:s.w,d:s.d});}
canvas.dataset.facades=JSON.stringify(facadeStats);
const natureSky=createNatureSky(renderer);
const daySky=scene.background,nightSky=createSky(true),sunsetSky=createSky('sunset');let night=false;
const timeButton=document.createElement('button');timeButton.id='time-of-day';timeButton.textContent='昼 → 夕';timeButton.setAttribute('aria-label','夕景に切りかえる');$('#camera-scroll').prepend(timeButton);
const cameraScroll=$('#camera-scroll');
let cameraMeasurePending=false;
function updateCameraArrows(){
 cameraMeasurePending=false;
 const overflow=cameraScroll.scrollWidth>cameraScroll.clientWidth+1;
 $('#camera-prev').hidden=$('#camera-next').hidden=!overflow;
 $('#camera-prev').disabled=cameraScroll.scrollLeft<=1;
 $('#camera-next').disabled=cameraScroll.scrollLeft+cameraScroll.clientWidth>=cameraScroll.scrollWidth-1;
}
function scheduleCameraMeasure(){if(!cameraMeasurePending){cameraMeasurePending=true;requestAnimationFrame(updateCameraArrows);}}
function scrollCameras(direction){cameraScroll.scrollBy({left:direction*cameraScroll.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#camera-prev').onclick=()=>scrollCameras(-1);$('#camera-next').onclick=()=>scrollCameras(1);
cameraScroll.addEventListener('scroll',scheduleCameraMeasure,{passive:true});
cameraScroll.addEventListener('focusin',e=>{const r=e.target.getBoundingClientRect(),v=cameraScroll.getBoundingClientRect();if(r.left<v.left)cameraScroll.scrollLeft+=r.left-v.left;else if(r.right>v.right)cameraScroll.scrollLeft+=r.right-v.right;});
new ResizeObserver(scheduleCameraMeasure).observe(cameraScroll);
new MutationObserver(scheduleCameraMeasure).observe(cameraScroll,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
const panoramaOption=new Option('前面展望席','panorama');
function syncPanoramaOption(){
 const available=(viewTrain===1?town.oppositeTrain:town.train)==='limited-panorama';
 if(available&&!panoramaOption.parentNode)$('#window-view').add(panoramaOption);
 else if(!available&&panoramaOption.parentNode)panoramaOption.remove();
 document.body.classList.toggle('has-panorama',available);
 return available;
}
$('#window-view').onchange=()=>{if($('#window-view').value)setCamera($('#window-view').value);};
scheduleCameraMeasure();
function setLighting(phase){
  lightingPhase=phase;night=phase==='night';const dusk=phase==='sunset';
  setTrainWindowLights(trainRoot,night||dusk);setTrainWindowLights(oppositeRoot,night||dusk);for(const m of returnModels)setTrainWindowLights(m.root,night||dusk);
  document.body.classList.toggle('night',night);scene.background=night?nightSky:dusk?sunsetSky:daySky;
  scene.fog.color.set(night?'#17283e':dusk?'#eac4a3':'#d8e8f0');
  sun.intensity=night?.35:dusk?2.3:2.6;sun.color.set(night?'#adc9ff':dusk?'#ffb469':'#fff4dc');
  sun.position.set(dusk?-100:-140,dusk?75:240,dusk?180:110);sun.shadow.needsUpdate=true;
  ambient.intensity=night?.5:dusk?1.05:1.5;ambient.color.set(night?'#889ec0':dusk?'#c6c6de':'#d7ecff');ambient.groundColor.set(night?'#283647':'#8a927d');
  renderer.toneMappingExposure=night?.85:1.05;
  for(const t of templates.values())t.m.emissiveIntensity=night?1.5:dusk?.3:0;districtRenderer.setPhase(phase);freeStationRenderer.setPhase(phase);traffic.phase(phase);
  timeButton.textContent=night?'夜 → 昼':dusk?'夕 → 夜':'昼 → 夕';timeButton.setAttribute('aria-label',night?'昼景に切りかえる':dusk?'夜景に切りかえる':'夕景に切りかえる');
  $('#period-label').textContent=night?'NIGHT / 夜':dusk?'GOLDEN HOUR / 夕方':'DAYLIGHT / 昼';
}
timeButton.onclick=()=>setLighting(lightingPhase==='day'?'sunset':lightingPhase==='sunset'?'night':'day');
const roadCanvas=window.RoadSurface.roadTex(8,20,128,256,1);const roadTexture=texture(roadCanvas);const roadMat=new T.MeshStandardMaterial({map:roadTexture,roughness:1}),walkMat=material('#c2c5b4');
function box(w,h,d,x,y,z,m,parent){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.userData.ownedGeometry=true;o.position.set(x,y,z);parent.add(o);return o}
const treeTemplate=new T.Group();box(.55,3,.55,0,1,0,material('#7b6b48'),treeTemplate);for(const[x,y,z,s]of [[0,3.5,0,2.4],[-1.3,3.1,0,1.9],[1.2,3.1,.5,1.8]]){const o=new T.Mesh(new T.IcosahedronGeometry(s,0),material('#608957'));o.position.set(x,y,z);treeTemplate.add(o)}
function collect(group){const buckets=new Map();group.updateMatrixWorld(true);group.traverse(o=>{if(!o.isMesh)return;const mat=o.material;const key=[mat.map?.uuid||'',mat.color?.getHex(),mat.roughness,mat.metalness,mat.emissive?.getHex()].join('/');let g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index)g=g.toNonIndexed();for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!buckets.has(key))buckets.set(key,{m:mat,gs:[]});buckets.get(key).gs.push(g)});return[...buckets.values()].map(b=>{const g=mergeGeometries(b.gs,false);b.gs.forEach(g=>g.dispose());return{g,m:b.m}})}
const treeMeshes=collect(treeTemplate);
function cleanGroup(group){for(const o of [...group.children]){group.remove(o);o.traverse(c=>{if(c.userData.ownedGeometry)c.geometry?.dispose();if(c.userData.ownedMaterial)c.material?.dispose();if(c.isInstancedMesh)c.dispose();});}}
function addInstances(parent,g,m,items,configure){if(!items.length)return;const mesh=new T.InstancedMesh(g,m,items.length);items.forEach((it,i)=>{dummy.position.set(it.pose[0],-.45,-it.pose[1]);dummy.rotation.set(0,it.pose[2],0);dummy.scale.set(1,BUILDING_TYPES.includes(it.type)?it.scale:it.scale,1);configure?.(dummy,it);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(it.tint)mesh.setColorAt(i,new T.Color(it.tint));});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();parent.add(mesh);return mesh}
const nearMat=material('#dddcc7'),crossYellow=material('#e8b730'),crossBlack=material('#33392f'),lampGeometry=new T.SphereGeometry(.14,8,6);
// Shared paved forecourts: one instanced draw per building type, independent of height.
const pavementCanvas=document.createElement('canvas');pavementCanvas.width=pavementCanvas.height=128;
const pavementCtx=pavementCanvas.getContext('2d');pavementCtx.fillStyle='#b9bec0';pavementCtx.fillRect(0,0,128,128);
pavementCtx.strokeStyle='#929c9e';pavementCtx.lineWidth=1;
for(let i=0;i<=128;i+=16){pavementCtx.beginPath();pavementCtx.moveTo(i,0);pavementCtx.lineTo(i,128);pavementCtx.moveTo(0,i);pavementCtx.lineTo(128,i);pavementCtx.stroke();}
pavementCtx.strokeStyle='#e0dfd6';pavementCtx.lineWidth=5;pavementCtx.strokeRect(2.5,2.5,123,123);
const pavementMat=new T.MeshStandardMaterial({map:texture(pavementCanvas),roughness:1});
const pavementTemplates=new Map([...templates].map(([type,t])=>{const g=new T.BoxGeometry(t.w+3,.16,t.d+3);g.translate(0,.02,0);return[type,g]}));
function selectTownTraffic(value){return traffic.select(value.trafficVehicles,{mountain:isMountain(value)});}
function visibleTownProps(){return isIntercity(town)&&town.intercityStations===1?town.props.filter(p=>!isArrivalTemplateProp(p)&&!isDepartureTemplateProp(p)):town.props;}
function rebuildTown(){if(suspendedRenderer){scene.remove(suspendedRenderer.root);suspendedRenderer.dispose();suspendedRenderer=null;}if(islandRenderer){scene.remove(islandRenderer.root);islandRenderer.dispose();islandRenderer=null;}$('.scene-label h1').textContent=isStationLoop(town)?loopName(town):'街の息づかい、レールの先へ。';$('#tokyo-attribution').hidden=!isTokyo(town);if(tokyoRenderer){scene.remove(tokyoRenderer.root);tokyoRenderer.dispose();tokyoRenderer=null;}$('#bridge-town-view').hidden=!isMountain(town);if(!isMountain(town)&&camMode==='bridge-town')setCamera('orbit');if(mountainRenderer){scene.remove(mountainRenderer.root);mountainRenderer.dispose();mountainRenderer=null;}if(isIntercity(town)&&!replay)town.intercityStations=1;if(intercityLocked&&returnCamera){intercityLocked=false;setCamera(returnCamera,true);}if(intercityRenderer){scene.remove(intercityRenderer.root);intercityRenderer.dispose();intercityRenderer=null;}intercityLocked=false;returnCamera=null;cleanGroup(townRoot);cleanGroup(districtRoot);buildingBatches=[];activeDistrict=isDistrict(town,KIT);if(!hasSecondTrain())viewTrain=0;$('#view-train').value=String(viewTrain);$('#view-train').hidden=!hasSecondTrain();trafficEnabled=isMountain(town)||(activeDistrict&&hasTrafficRoads(town,KIT));trafficLoad=selectTownTraffic(town);trafficLoad.then(syncTrafficChoice).catch(e=>say(e.message,true));traffic.root.visible=trafficEnabled;$('#traffic-view').hidden=!trafficEnabled;$('#traffic-vehicle').hidden=!trafficEnabled;if(!trafficEnabled&&camMode==='traffic')setCamera('orbit');distant.visible=!activeDistrict;if(!activeDistrict&&(['crossing','crossing-person'].includes(camMode)||!freeStationTown()&&['station','station-doors'].includes(camMode)))setCamera('orbit');$('#station-view').hidden=!activeDistrict&&!(isIntercity(town)&&town.intercityStations===1);$('#crossing-view').hidden=!activeDistrict;$('#crossing-person-view').hidden=!activeDistrict;$('#station-doors-view').hidden=!activeDistrict&&!(isIntercity(town)&&town.intercityStations===1);$('#service-info').hidden=!activeDistrict&&!(isIntercity(town)&&town.intercityStations===1);document.body.classList.toggle('district',activeDistrict);
  if(isSuspended(town)){distant.visible=false;suspendedRenderer=createSuspendedTown();scene.add(suspendedRenderer.root);$('#station-view').hidden=false;$('#service-info').hidden=false;return;}
  if(isIsland(town)){distant.visible=false;islandRenderer=createIsland();scene.add(islandRenderer.root);$('#station-view').hidden=false;$('#service-info').hidden=false;return;}
  if(isTokyo(town)){distant.visible=false;tokyoRenderer=createTokyoRenderer(loader,say);scene.add(tokyoRenderer.root);$('#station-view').hidden=false;$('#service-info').hidden=false;return;}
  if(isMountain(town)){distant.visible=false;mountainRenderer=createMountainRenderer();scene.add(mountainRenderer.root);$('#service-info').hidden=false;return;}
  if(activeDistrict){const r=makeRoute(town.rails,KIT);districtRoot.add(districtRenderer.build(town,r,parallelRoute(r)));townRoot.add(roadRenderer.build(town.props.filter(p=>ROAD_TYPES.includes(p.type)),town.rails,KIT,trafficEnabled?TRAFFIC_CORNERS:[]));return;}
  const visibleProps=visibleTownProps();
  for(const[type,g]of pavementTemplates)addInstances(townRoot,g,pavementMat,visibleProps.filter(p=>p.type===type).map(p=>({...p,tint:'#ffffff'})),o=>o.scale.set(1,1,1));
  for(const[type,t]of templates){const items=visibleProps.filter(p=>p.type===type);const mesh=addInstances(townRoot,t.g,t.m,items);if(!mesh)continue;const lodGeo=new T.BoxGeometry(t.w,t.height,t.d);lodGeo.translate(0,t.height/2,0);const far=addInstances(townRoot,lodGeo,nearMat,items);far.userData.ownedGeometry=true;buildingBatches.push({mesh,far,items});}
  for(const part of treeMeshes)addInstances(townRoot,part.g,part.m,visibleProps.filter(p=>p.type==='tree'));
  const customRoads=roadRenderer.build(visibleProps.filter(p=>ROAD_TYPES.includes(p.type)),town.rails,KIT);if(isIntercity(town)&&town.intercityStations===1)for(const road of customRoads.children)if(road.position.x<1000)road.position.y+=.52;townRoot.add(customRoads);
}
function buildCabin(){const wall=material('#e0e5d8'),seat=material('#578777'),floor=material('#939f98'),frame=material('#929e9e');for(const m of[wall,seat,floor,frame]){m.emissive.copy(m.color);m.emissiveIntensity=.24;}box(19,.1,2.8,0,1.08,0,floor,cabin);box(19,.12,2.9,0,3.35,0,wall,cabin);
  for(const s of[-1,1]){box(19,.53,.06,0,1.43,s*1.43,wall,cabin);box(19,.23,.06,0,3.14,s*1.43,wall,cabin);for(const x of[-9,-6,-3,0,3,6,9])box(.11,1.35,.08,x,2.36,s*1.43,frame,cabin);box(16,.4,.45,-.2,1.36,s*1.15,seat,cabin);box(16,.48,.08,-.2,1.75,s*1.38,seat,cabin)}
  const grip=new T.MeshStandardMaterial({color:'#f1eee2',emissive:'#f1eee2',emissiveIntensity:.3,roughness:.7});
  const metal=new T.MeshStandardMaterial({color:'#a7b2b5',emissive:'#a7b2b5',emissiveIntensity:.18,roughness:.32,metalness:.35});
  for(const side of[-1,1]){
    box(19,.07,.16,0,1.98,side*1.36,metal,cabin);
    box(17,.055,.055,0,3.02,side*.79,metal,cabin);
    for(const x of[-6,-4.5,-3,-1.5,0,1.5,3,4.5,6]){
      box(.035,.29,.035,x,2.86,side*.79,grip,cabin);
      const ring=new T.Mesh(new T.TorusGeometry(.095,.014,6,16),grip);ring.position.set(x,2.635,side*.79);cabin.add(ring);
      box(.032,.025,.43,x,1.572,side*1.15,frame,cabin);
    }
  }
  box(.08,.75,2.9,9.6,1.65,0,frame,cabin);cabin.visible=false;
}buildCabin();
function addMarker(x,y,color,r=.9,h=0){const m=new T.Mesh(new T.SphereGeometry(r,8,6),new T.MeshBasicMaterial({color}));m.position.set(x,h+.65,-y);markers.add(m)}
function updateMarkers(){for(const o of [...markers.children]){o.geometry?.dispose();o.material?.dispose();markers.remove(o)}if(mode!=='build')return;markSelectedStation();for(const s of [...troubleSpots,...placeSpots])for(const[g,o]of[[new T.CircleGeometry(s.r,28),.4],[new T.RingGeometry(s.r,s.r+1.6,28),.95]]){const m=new T.Mesh(g,new T.MeshBasicMaterial({color:'#e8352b',transparent:true,opacity:o,depthTest:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(s.x,s.h+.9,-s.y);m.renderOrder=20;m.userData.trouble=o;markers.add(m);}for(const p of ports)addMarker(p.x,p.y,p.key===selectedPort?'#efac46':'#39bac4',p.key===selectedPort?1.35:.9,p.h||0);if(selected?.kind==='prop'){const p=town.props.find(p=>p.uid===selected.uid);if(p){const ring=new T.Mesh(new T.RingGeometry(9,9.4,32),new T.MeshBasicMaterial({color:'#eaa43b',side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p.pose[0],-.22,-p.pose[1]);markers.add(ring)}}}
function rebuildRails(){freeStationRenderer.clear();cleanGroup(railRoot);gateRows=[];if(isMountain(town)||isStationLoop(town)){ports=[];updateMarkers();return;}if(isIntercity(town)){intercityRenderer=createIntercityRenderer(makeRoute(town.rails,KIT),town.intercityStations===1,visibleTownProps());scene.add(intercityRenderer.root);ports=[];updateMarkers();return;}railRoot.add(buildElevatedRails(town,KIT));
  if(activeDistrict){const crossing=districtRoot.children[0]?.userData.crossing;if(crossing)gateRows.push(crossing);}
  for(const[type,parts]of railTemplates){const items=town.rails.filter(it=>it.piece===type);for(const p of parts)addInstances(railRoot,p.g,p.m,items,(o)=>{o.position.y=0;o.scale.set(1,1,1)})}
  for(const it of town.rails.filter(r=>r.piece==='crossing')){const base=railTemplates.get('straight_short');for(const p of base||[])addInstances(railRoot,p.g,p.m,[it],o=>{o.position.y=0;o.scale.set(1,1,1)});const group=new T.Group();group.position.set(it.pose[0],0,-it.pose[1]);group.rotation.y=it.pose[2];railRoot.add(group);const gates=[],lamps=[],yellow=crossYellow,black=crossBlack;box(6,.1,18,5,-.10,0,roadMat,group);
    for(const x of[1.12,8.88])for(const s of[-1,1]){const z=s*3.25;box(.16,3,.16,x,1.5,z,yellow,group);for(let k=0;k<5;k++)box(.17,.25,.17,x,.35+k*.55,z,black,group);for(const a of[-.62,.62]){const c=box(.12,.16,1.2,x,2.85,z,yellow,group);c.rotation.x=a}for(const dz of[-.3,.3]){const lamp=new T.Mesh(lampGeometry,new T.MeshBasicMaterial({color:'#3c1714'}));lamp.userData.ownedMaterial=true;lamp.position.set(x,2.5,z+dz);group.add(lamp);lamps.push(lamp)}
      const gate=new T.Group();gate.position.set(x,.75,z);const length=3.3;box(.14,.14,length,x*0,0,-s*length/2,yellow,gate);for(let j=0;j<5;j++)box(.145,.145,.28,0,0,-s*(.3+j*.6),black,gate);group.add(gate);gates.push({obj:gate,s});}
    gateRows.push({uid:it.uid,group,gates,lamps,angle:1,alarm:false,clear:0});
  }
  railRoot.add(freeStationRenderer.build(freeStationGeometries()));
  ports=openPorts(town.rails,KIT);if(!ports.some(p=>p.key===selectedPort))selectedPort=ports.at(-1)?.key||null;updateMarkers();
}
function remember(){history.push(clone(town));if(history.length>60)history.shift();future=[];}
let trainUsage=normalizeUsage(),usageMemoryOnly=false;
try{trainUsage=readUsage(localStorage);}catch{usageMemoryOnly=true;}
function sortedTrainLibrary(){return rankTrains(trainLibrary,trainUsage);}
async function recordTrainUsage(kind,ids){
 const savedIds=ids.filter(id=>trainLibrary.some(e=>e.id===id));if(!savedIds.length)return;
 const now=Date.now(),update=usage=>kind==='created'?savedIds.reduce((next,id)=>markCreated(next,id,now),usage):markUsed(usage,savedIds,now);
 if(usageMemoryOnly){trainUsage=update(trainUsage);choicesKey='';return;}
 try{await withStorageLock(async()=>{const before=localStorage.getItem(USAGE_KEY);trainUsage=update(readUsage(localStorage));try{await commitStorage(localStorage,[[USAGE_KEY,JSON.stringify(trainUsage)]],{expected:[[USAGE_KEY,before]]});}catch{usageMemoryOnly=true;}});}
 catch{trainUsage=update(trainUsage);usageMemoryOnly=true;}
 choicesKey='';
}
function readCurrentLibrary(){return localStorage.getItem(LIBRARY_KEY)===null&&localStorage.getItem(LEGACY_LIBRARY_KEY)===null?clone(trainLibrary):readLibrary(localStorage);}
async function commitTrainLibrary(items,scene,expectedLibrary,settings={}){
 return withStorageLock(async()=>{
  if(!townWritable||townSwitchBusy||townImportBusy)throw Error('街の保存を待ってください。');
  const previous=readCurrentLibrary(),pendingText=localStorage.getItem(PENDING_KEY),usageText=localStorage.getItem(USAGE_KEY),usage=usageMemoryOnly?trainUsage:readUsage(localStorage);let pending=readPending(localStorage);
  if(settings.restoreId){const row=pending.items.find(r=>r.entry.id===settings.restoreId);if(JSON.stringify(row)!==settings.restoreSnapshot)throw Error('保管中の電車が変えられています。一覧を開き直してください。');const restored=restorePending(previous,scene,pending,settings.restoreId);items=restored.items;pending=restored.pending;}
  const plan=planRetention(previous,items,scene,usage,pending,settings);
  await commitLibrary(localStorage,plan.items,plan.scene,{extraWrites:plan.extraWrites,expected:[['rail-town-v2',liveTownText],['rail-town-slots-v1',townStore.raw],[PENDING_KEY,pendingText],[USAGE_KEY,usageText],...(expectedLibrary!==undefined?[[LIBRARY_KEY,expectedLibrary]]:[])]});
  liveTownText=localStorage.getItem('rail-town-v2');townStore=readTownStore(localStorage,s=>validateScene(s,KIT));trainUsage=plan.usage;choicesKey='';return plan;
 });
}
function showPendingTrains(){
 const list=$('#pending-trains');list.replaceChildren();$('#pending-empty').textContent='保管中の電車はありません。';
 try{const rows=readPending(localStorage).items;
  $('#pending-empty').hidden=rows.length>0;
  for(const row of rows){const line=document.createElement('p'),label=document.createElement('span'),button=document.createElement('button');label.textContent=row.entry.design.name+' · '+typeName(row.entry.type);button.type='button';button.textContent='もどす';button.onclick=()=>restoreTrainFromPending(row);line.append(label,button);list.append(line);}
 }catch(e){$('#pending-empty').hidden=false;$('#pending-empty').textContent=e.message;}
}
async function restoreTrainFromPending(row){
 if(savingTrain||townSwitchBusy||townImportBusy||loadingModel||paintDraft||recording||replay)return;
 savingTrain=true;
 try{
  const expected=localStorage.getItem(LIBRARY_KEY);
  const plan=await commitTrainLibrary(readCurrentLibrary(),town,expected,{restoreId:row.entry.id,restoreSnapshot:JSON.stringify(row)});
  trainLibrary=plan.items;town=plan.scene;if(paintBaseTown)paintBaseTown=clone(town);ui();refreshWorkshopSaved(row.entry.id);showPendingTrains();$('#pending-status').textContent='電車を保存一覧にもどしました。';
 }catch(e){$('#pending-status').textContent=e.message;}finally{savingTrain=false;}
}
$('#pending-open').onclick=async()=>{if(savingTrain||townSwitchBusy||townImportBusy||loadingModel||paintDraft||recording||replay)return;$('#pending-status').textContent='';showPendingTrains();$('#pending-dialog').showModal();};
$('#pending-close').onclick=()=>$('#pending-dialog').close();

async function persist(){if(replay||soundStationPreview)return false;if(townSwitchBusy)return true;const snapshot=clone(paintBaseTown||town);try{if(!townWritable)throw Error(townStore.temporary?libraryError:'以前の保存データを保護しています。');return await withStorageLock(async()=>{const result=await commitTownStore(localStorage,townStore,townStore.active,snapshot,s=>validateScene(s,KIT),{expectedLive:liveTownText});townStore=result;liveTownText=result.live;$('#save-status').textContent='このスマホ・パソコンに保存済み';return true;});}catch(e){$('#save-status').textContent='このスマホ・パソコンに保存できません。街をファイル保存してください。';say(e.message,true);return false;}}
function updateRoute(keep=false){soundscape?.reset();freeStops=[];freeStopGeometries=[];
  if(isSuspended(town)){
    const retain=keep&&route===lineFor(trainState)&&oppositeState;
    trainState=retain?{...trainState,playing:false,speed:0}:startSuspended();
    oppositeState=retain?{...oppositeState,playing:false,speed:0}:startSuspended(true);
    route=lineFor(trainState);oppositeRoute=lineFor(oppositeState);intercityFleet=null;return;
  }
  if(isTokyo(town)){
    route=tokyoRoute;oppositeRoute=tokyoInnerRoute;intercityFleet=null;
    trainState=keep&&Number.isInteger(trainState.station)?{...trainState,playing:false,speed:0}:initialLoop(effectiveFormation(town),carLength,tokyoStations);
    oppositeState=keep&&Number.isInteger(oppositeState?.station)?{...oppositeState,playing:false,speed:0}:initialTokyoInner(effectiveFormation(town,true),oppositeCarLength);
    return;
  }
  if(isIsland(town)){
    const retain=keep&&route===islandRoute;
    route=islandRoute;oppositeRoute=islandOuterRoute;intercityFleet=null;
    trainState=retain&&Number.isInteger(trainState.station)?{...trainState,playing:false,speed:0}:initialLoop(effectiveFormation(town),islandCarLength,islandStations);
    oppositeState=retain&&Number.isInteger(oppositeState?.station)?{...oppositeState,playing:false,speed:0}:initialIslandOuter(effectiveFormation(town,true));
    return;
  }
  if(isMountain(town)){trainState=keep&&Number.isInteger(trainState.leg)?{...trainState,playing:false,speed:0}:initialMountainState(carLength);route=mountainRoute(trainState);trainState.s=Math.max(carLength+.225,Math.min(route.length-carLength-.225,trainState.s));intercityFleet=null;oppositeState=keep&&Number.isInteger(oppositeState?.leg)?{...oppositeState,playing:false,speed:0}:initialMountainOpponent(oppositeCarLength);oppositeRoute=mountainRoute(oppositeState);oppositeState.s=Math.max(oppositeCarLength+.225,Math.min(oppositeRoute.length-oppositeCarLength-.225,oppositeState.s));if(!keep)mountainControl={owner:null,turn:1};return;}const old=lastVisual?.body,uid=selected?.kind==='rail'?selected.uid:route?.parts[0]?.it.uid;route=makeRoute(town.rails,KIT,activeDistrict?undefined:uid);trainState.playing=false;trainState.speed=0;const half=formationLength(effectiveFormation(town),carLength)/2;
  if(isIntercity(town)){trainState.s=200;orbit.x=100;orbit.y=350;orbit.distance=1000;}
  if(keep&&old&&route.length){let best=Infinity,at=half;for(let d=half;d<route.length-half;d+=.5){const p=sampleRoute(route,d),dist=Math.hypot(p[0]-old[0],p[1]-old[1]);if(dist<best){best=dist;at=d}}trainState.s=at;}else trainState.s=isIntercity(town)?200:route.closed?half:Math.min(Math.max(half,route.length/2),Math.max(0,route.length-half));if(activeDistrict){trainState=initialService(route,effectiveFormation(town),trainState.dir,carLength);oppositeRoute=parallelRoute(route);oppositeState=initialService(oppositeRoute,effectiveFormation(town,true),-trainState.dir,oppositeCarLength);}else if(isIntercity(town)){if(town.intercityStations===1)trainState=initialIntercityService(effectiveFormation(town),trainState.dir,carLength);intercityFleet=createIntercityTraffic(route,trainState,effectiveFormation(town),carLength,effectiveFormation(town,true),oppositeCarLength,isHighSpeed(town.train),town.intercityStations===1,intercityTrainSpeed(town.train),{main:town.train,other:town.oppositeTrain||town.train});oppositeRoute=intercityFleet.routes[0];oppositeState=intercityFleet.states[0];}else{intercityFleet=null;oppositeRoute=null;oppositeState=null;oppositeRoot.visible=false;startFreeService();} }
// 自由な街：止まれる駅があれば一番近い駅で停車中から始める。無ければ前の街の停車の値（stationPhase:'dwell' など）を消す。
function startFreeService(){
 const stations=activeStations(town,activeDistrict);freeStops=stations.length?stopsOnRoute(route,stations):[];
 const start=freeStops.length?initialFreeService(route,effectiveFormation(town),carLength,freeStops,trainState.s,trainState.dir):null;
 if(start){trainState=start;freeStopGeometries=freeStops.map(stop=>stationGeometry(stations[stop.index],town.rails,KIT)).filter(Boolean);}
 else{freeStops=[];for(const k of ['stationPhase','dwell','dwellDuration','station','departed'])delete trainState[k];}
 syncFreeStationViews();
}
function syncFreeStationViews(){
 const on=freeStops.length>0;for(const id of ['#station-view','#station-doors-view','#service-info'])$(id).hidden=!on;
 if(!on&&['station','station-doors'].includes(camMode))setCamera('orbit',true);
}
// 列車がいる駅（無ければ、走っているときは次の駅、再生中は一番近い駅）。
function freeViewStation(v){
 if(!freeStops.length)return null;const here=freeStationOf(v?.cars,freeStopGeometries);
 // 停車中は今の駅、走っているときは次の駅（設計§6）。再生中は列車のいる駅か一番近い駅。
 if(here&&(replay||trainState.stationPhase==='dwell'))return here;
 if(!replay&&viewTrain===0){const next=nextFreeStop(route,trainState,effectiveFormation(town),carLength,freeStops);if(next)return freeStopGeometries.find(g=>g.id===freeStops[next.k].id)||freeStopGeometries[0];}
 const b=v?.body||[0,0];return freeStopGeometries.reduce((a,g)=>Math.hypot(g.cx-b[0],g.cy-b[1])<Math.hypot(a.cx-b[0],a.cy-b[1])?g:a,freeStopGeometries[0]);
}
function advanceFreeTrain(dt,limit){
 const formation=effectiveFormation(town);
 trainState=advanceFreeService(route,trainState,formation,dt,limit,carLength,freeStops,cabAcceleration(0));
 // 初めて「ホームより長い編成でドアが開く」とき1回だけ（始まりの駅で発車を押したときも含む）。
 if(trainState.playing&&trainState.stationPhase==='dwell'&&!freeShortNotice&&formationOverhangs(freeStops.find(s=>s.index===trainState.station),formation,carLength)){freeShortNotice=true;say(STATION_TEXT.shortPlatform);}
 const next=trainState.stationPhase==='dwell'?null:nextFreeStop(route,trainState,formation,carLength,freeStops);
 $('#service-info').textContent=freeServiceText(trainState,freeStops,town.stations,next);
}
// 自由な駅のある街か（固定コース・見本の駅が動く街は除く）。止まれるかは updateRoute の後に決まる。
function freeStationTown(){return !isMountain(town)&&!isStationLoop(town)&&!isIntercity(town)&&activeStations(town,isDistrict(town,KIT)).length>0;}
function freeDoorPlatform(v){const g=freeStationOf(v?.cars,freeStopGeometries);return g?car=>freeDoorSide(car,g):{side:0};}

function changed(message='街を保存しました。',keep=false){placeSpots=[];rebuildTown();rebuildRails();updateRoute(keep);const roadCheck=validateRoadNetwork(town.props.filter(p=>ROAD_TYPES.includes(p.type)),town.rails,KIT);const trouble=findTrouble(roadCheck);warnings=trouble.count;troubleSpots=trouble.spots;troubleText=trouble.text;updateMarkers();persist();ui();palette();if(mode==='build')keepEditInView();if(warnings)say(troubleText,true);else if(roadCheck.warnings.length)say('つながっていない道路のはしがあります。意図した行き止まり以外はつないでください。');else say(town.district&&!activeDistrict?'線路を変えたため、駅と専用対向線を休止しました。もどすと復帰します。':restingNotice()||message)}
// 見本の駅が戻ったとき、自分の駅はデータに残して休ませる。案内は1回だけ。
function restingNotice(){if(!activeDistrict){stationRestNotice=false;return null;}if(!town.stations?.length||stationRestNotice)return null;stationRestNotice=true;return STATION_TEXT.resting;}
// 発車できない原因を、場所（赤い印）と子どもが読める文にする。warnings の数え方は以前と同じ。
function findTrouble(roadCheck){
 const spots=[],prop=uid=>{const p=town.props.find(p=>p.uid===uid);if(p)spots.push({x:p.pose[0],y:p.pose[1],h:0,r:11});};
 const fix=history.length?'あかい ところを 「↶ もどす」で なおしてね。':'あかい ところの ぶひんを えらんで 「消す」を おしてね。';
 if(isIntercity(town)){const blocked=town.props.filter(intercityObstructs);blocked.forEach(p=>prop(p.uid));return {count:blocked.length,spots,text:'たてものが せんろに ぶつかっているよ。'+fix};}
 const stationHits=townStationConflicts({...town,stations:activeStations(town,activeDistrict)},KIT);
 const support=elevatedSupportPlan(town,KIT).errors,crossCount=railIntersections(town.rails,KIT),hitProps=town.props.filter(p=>overlapsRail(p,town.rails,KIT)),count=support.length+crossCount+hitProps.length+roadCheck.errors.length+stationHits.length;
 if(!count)return {count:0,spots,text:''};
 const middle=it=>{const r=KIT.pieces[it.piece].routes[0],p=sampleItem(it,r,.5);return {x:p[0],y:p[1],h:p[3]||0,r:Math.max(6,Math.min(12,r.length/4))};};
 if(crossCount){const box=town.rails.map(it=>{const m=middle(it);return {x:m.x,y:m.y,reach:Math.max(...KIT.pieces[it.piece].routes.map(r=>r.length))};});
  for(let j=1;j<town.rails.length;j++)for(let i=0;i<j;i++)if(Math.hypot(box[i].x-box[j].x,box[i].y-box[j].y)<box[i].reach+box[j].reach+2&&railIntersections([town.rails[i],town.rails[j]],KIT)){spots.push(middle(town.rails[j]));break;}}
 for(const uid of support){const it=town.rails.find(r=>r.uid===uid);if(it)spots.push(middle(it));}
 hitProps.forEach(p=>prop(p.uid));
 for(const e of roadCheck.errors){for(const uid of [e.roadUid,e.uid,...(e.uids||[])])if(uid!=null)prop(uid);if(e.at)spots.push({x:e.at.x,y:e.at.y,h:0,r:7});}
 for(const h of stationHits)spots.push({x:h.x,y:h.y,h:h.h||0,r:h.r});
 const roadCross=roadCheck.errors.some(e=>e.code==='rail_crossing_without_module'||e.code==='invalid_crossing_module');
 const text=crossCount?'せんろが かさなっているよ。'+fix:hitProps.length?'たてものが せんろに ぶつかっているよ。'+fix:roadCross?'どうろが せんろを よこぎっているよ。「ふみきり道路」を つかうか、'+fix:roadCheck.errors.length?'どうろが かさなっているよ。'+fix:support.length?'たかい せんろの はしらを たてられないよ。あかい ところの したの どうろや せんろを どかしてね。':STATION_TEXT.trouble[stationHits[0].kind]+fix;
 return {count,spots,text};
}
// 編集中のカメラ：ほぼ真上から見るので、地面の上で計算する。パネルやボタンの裏を除いた範囲に収める。
function editSafeArea(){
 const c=canvas.getBoundingClientRect(),e=$('#editor').getBoundingClientRect();let left=c.left,right=c.right,top=c.top,bottom=c.bottom;
 if(!$('#editor').hidden&&e.width&&e.top<c.bottom-8&&e.bottom>c.top+8&&e.left<c.left+c.width*.25&&e.right<c.right-120)left=Math.max(left,e.right);
 const mx=Math.min(58,(right-left)*.14),my=Math.min(54,(bottom-top)*.16);left+=Math.min(22,mx);right-=mx;top+=my*.8;bottom-=my;
 const nx=x=>(x-c.left)/c.width*2-1,ny=y=>1-(y-c.top)/c.height*2;return {x0:nx(left),x1:nx(right),y0:ny(bottom),y1:ny(top),aspect:c.width/Math.max(1,c.height)};
}
function editAxes(){const yaw=orbit.yaw;return {r:[Math.sin(yaw),-Math.cos(yaw)],u:[-Math.cos(yaw),-Math.sin(yaw)]};}
function editPoints(){const ps=town.rails.flatMap(it=>KIT.pieces[it.piece].routes.flatMap(r=>[0,.25,.5,.75,1].map(t=>sampleItem(it,r,t))));for(const p of ports)ps.push([p.x,p.y]);for(const p of visibleTownProps())ps.push([p.pose[0]-9,p.pose[1]-9],[p.pose[0]+9,p.pose[1]+9],[p.pose[0]-9,p.pose[1]+9],[p.pose[0]+9,p.pose[1]-9]);return ps;}
function editGoal(){
 const ps=editPoints();if(!ps.length)return {x:0,y:0,distance:130};
 const {r,u}=editAxes(),safe=editSafeArea(),tan=Math.tan(24*Math.PI/180);let a0=Infinity,a1=-Infinity,b0=Infinity,b1=-Infinity;
 for(const p of ps){const a=p[0]*r[0]-p[1]*r[1],b=p[0]*u[0]-p[1]*u[1];a0=Math.min(a0,a);a1=Math.max(a1,a);b0=Math.min(b0,b);b1=Math.max(b1,b);}
 const halfH=Math.max((a1-a0+16)/Math.max(.2,safe.x1-safe.x0)/safe.aspect,(b1-b0+16)/Math.max(.2,safe.y1-safe.y0),90*tan),halfW=halfH*safe.aspect;
 const a=(a0+a1)/2-(safe.x0+safe.x1)/2*halfW,b=(b0+b1)/2-(safe.y0+safe.y1)/2*halfH,X=a*r[0]+b*u[0],Z=a*r[1]+b*u[1];
 return {x:X,y:-Z,distance:Math.min(1800,halfH/tan)};
}
function fitEdit(){orbitGoal=editGoal();}
// 新しく置いた部品や次の接続端が見える範囲の外へ出たら、全体が入るようにカメラを引く。指で動かした直後は邪魔しない。
function keepEditInView(){
 if(isIntercity(town)||performance.now()-lastEditDrag<1500)return;
 const focus=[],port=ports.find(p=>p.key===selectedPort);if(port)focus.push([port.x,port.y]);
 if(selected?.kind==='rail'){const it=town.rails.find(r=>r.uid===selected.uid);if(it)for(const r of KIT.pieces[it.piece].routes)for(const t of[0,.5,1])focus.push(sampleItem(it,r,t));}
 if(selected?.kind==='prop'){const p=town.props.find(p=>p.uid===selected.uid);if(p)focus.push(p.pose);}
 if(!focus.length)return;
 const now=orbitGoal||orbit,{r,u}=editAxes(),safe=editSafeArea(),halfH=now.distance*Math.tan(24*Math.PI/180),halfW=halfH*safe.aspect;
 const out=focus.some(p=>{const dx=p[0]-now.x,dz=-p[1]+now.y,x=(dx*r[0]+dz*r[1])/halfW,y=(dx*u[0]+dz*u[1])/halfH;return x<safe.x0||x>safe.x1||y<safe.y0||y>safe.y1;});
 if(out)fitEdit();
}
function routeModel(scene){return isIsland(scene)?'monorail':isSuspended(scene)?'suspended-monorail':null;}
function selectableModel(scene,type){
 const special=routeModel(scene);
 return special?type===special:!isMonorail(type)&&(!isMountain(scene)||mountainTypeAllowed(type));
}
function pickerValue(other){
 const value=selectedTrainId(town,trainLibrary,other);
 return routeModel(town)&&!selectableModel(town,trainLibrary.find(e=>e.id===value)?.type||value)?routeModel(town):value;
}
function syncTrainChoices(){
 const ordered=sortedTrainLibrary(),key=String(routeModel(town))+String(isMountain(town))+JSON.stringify(ordered.map(e=>[e.id,e.type,e.design.name]));if(key===choicesKey)return;choicesKey=key;
 for(const id of ['train','opposite-train']){const select=$('#'+id);select.replaceChildren();
  if(trainLibrary.length){const group=document.createElement('optgroup');group.label='保存した電車';ordered.filter(e=>selectableModel(town,e.type)).forEach(entry=>group.append(new Option(entry.design.name+' · '+typeName(entry.type),entry.id)));select.append(group);}
  const group=document.createElement('optgroup');group.label='基本の車両';for(const [value,name] of Object.entries(TRAIN_TYPES).filter(([type])=>selectableModel(town,type)).map(([id,name])=>[id,name+'（基本）']))group.append(new Option(name,value));select.append(group);
  if(isMountain(town))for(const option of select.options){const type=trainLibrary.find(e=>e.id===option.value)?.type||option.value;option.disabled=!mountainTypeAllowed(type);}
 }
}
function ui(){if(!syncPanoramaOption()&&camMode==='panorama')setCamera('front',true);syncColorButtons();$('#window-view').disabled=!!paintDraft||loadingModel||townSwitchBusy||townImportBusy;syncTrafficChoice();const highSpeed=isIntercity(town)&&isHighSpeed(town.train);const nextMax=normalTopSpeed(town.train),previousMax=Number($('#speed').max);otherSpeedBarLimit=normalTopSpeed(town.oppositeTrain||town.train);$('#speed').step=highSpeed?'any':'1';$('#speed').max=String(nextMax);if(highSpeed&&Math.abs(nextMax-previousMax)>.001)$('#speed').value=String(nextMax);if(Number($('#speed').value)>Number($('#speed').max))$('#speed').value=$('#speed').max;updateSpeedBar();$('#view-train').disabled=!!paintDraft||loadingModel;const noTourRoute=!replay&&!route?.length;if(noTourRoute&&autoCamera)setAutoCamera(false);$('#auto-camera').disabled=!!paintDraft||loadingModel||noTourRoute;$('#auto-record').disabled=noTourRoute||!mime||!!recording||recordStarting||!!paintDraft||loadingModel||trafficSelecting;syncTrainChoices();const allTrams=!isMountain(town)&&town.train==='tram'&&(!hasSecondTrain()||town.oppositeTrain==='tram');$('#formation').hidden=allTrams;
 const playing=replay?replayPlaying:trainState.playing;$('#play').textContent=playing?'Ⅱ 停止':'▶ 発車';$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;$('#train').value=pickerValue(false);$('#opposite-train').value=pickerValue(true);for(const [id,other]of [['train',false],['opposite-train',true]]){const type=other?(town.oppositeTrain||town.train):town.train,opt=[...$('#'+id).options].find(o=>o.value===type);if(opt)opt.textContent=town[other?'oppositeTrainId':'trainId']&&selectedTrainId(town,trainLibrary,other)===type?'この街の電車（変えたもの）':typeName(type)+'（基本）';}$('#opposite-picker').hidden=!hasSecondTrain();document.body.classList.toggle('dual-trains',hasSecondTrain());$('#opposite-picker small').textContent=isIntercity(town)?(isHighSpeed(town.oppositeTrain||town.train)?'列車2（内側・高速線）':'列車2（外側・ふつう線）'):'列車2（反対側）';$('#opposite-train').disabled=!!replay||loadingModel||!!recording;$('#opposite-dot').style.background=designFor(town,true).stripe;$('.formation-picker small').textContent=isMountain(town)?'登山鉄道は2両固定':allTrams?'路面電車は1両':(expressLimit(town)===8?'車両の数（高速型は8両まで）':'車両の数');$('#formation').value=String(Math.min(town.formation.count,expressLimit(town)));for(const option of $('#formation').options)option.disabled=Number(option.value)>expressLimit(town)||Number(option.value)<2;$('#formation').disabled=isMountain(town)||(town.train==='tram'&&(!hasSecondTrain()||town.oppositeTrain==='tram'))||!!replay||loadingModel||!!recording||trainState.playing||trainState.speed>.1;$('#train-dot').style.background=designFor(town).stripe;$('#selection').textContent=selected?.kind==='station'?`えき「${town.stations?.find(s=>s.id===selected.id)?.name||''}」を選んでいます`:selected?`${selected.kind==='prop'?'建物・道路':'線路'} ${selected.uid} を選んでいます`:'何も選んでいません';$('#replay').disabled=journeyCapturing||!journey||journey.frames.length<2;$('#export-replay').disabled=journeyCapturing||!journey||journey.frames.length<2;$('#reverse').disabled=isStationLoop(town)||isMountain(town)||trainState.speed>.1||!!replay;$('#train').disabled=!!replay||loadingModel||!!recording;$('#journey-start').disabled=journeyCapturing||townBlocked();$('#journey-stop').hidden=!journeyCapturing;$('#import-replay').disabled=journeyCapturing;$('#replay-info').textContent=journeyCapturing?'記録中 · '+Math.floor(captureElapsed)+'秒（最大10分）':journey?.frames.length?`${Math.floor(journey.frames.at(-1).t)}秒の走行記録・${journey.scene.rails.length}個の線路`:'まだ走行記録がありません';for(const id of ['paint-save','paint-cancel','paint-type-change'])$('#'+id).disabled=loadingModel||savingTrain;$('#paint-open').disabled=!!paintDraft||!!replay||!!recording||loadingModel;for(const id of ['play','train','opposite-train','formation','reverse','menu','mode-build','mode-memories'])if(paintDraft)$('#'+id).disabled=true;else if(['play','menu','mode-build','mode-memories'].includes(id))$('#'+id).disabled=false;$$('[data-camera]').forEach(b=>b.disabled=!!paintDraft);$('#mode-build').disabled=false;if(townSwitchBusy||townImportBusy)for(const id of ['play','train','opposite-train','formation','reverse','paint-open','mode-memories'])$('#'+id).disabled=true;if(isSuspended(town)){$('#formation').disabled=true;$('.formation-picker small').textContent='けんすいしきは2両固定';}if(isIsland(town)){$('#formation').disabled=true;$('.formation-picker small').textContent='モノレールは3両固定';}syncChooserButtons();if(isMountain(town))for(const option of $('#train').options)option.disabled=!mountainTypeAllowed(trainLibrary.find(e=>e.id===option.value)?.type||option.value);}
function readDoorTargets(body,leaves){
 body.updateMatrixWorld(true);const inverse=body.matrixWorld.clone().invert(),rows=[];
 for(const leaf of leaves){const box=new T.Box3().setFromObject(leaf);if(box.isEmpty())continue;const local=new T.Box3();
  for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z])local.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(inverse));
  rows.push({min:local.min.toArray(),max:local.max.toArray(),side:leaf.userData.side,half:leaf.userData.half,travel:leaf.userData.travel||.69});
 }
 return pairDoorLeaves(rows);
}
async function loadTrain(key){const skyPreparation=isIntercity(town)&&!light&&lightingPhase==='day'?natureSky.prepare():Promise.resolve();soundscape?.reset();const ticket=++loadTicket;loadingModel=true;ui();say('電車を準備しています…');try{
  
  const loadAsset=asset=>{if(!modelCache.has(asset)){const pending=loader.loadAsync('./assets/'+asset+'?v='+encodeURIComponent(CONSIST?.assetVersion||'1')).catch(error=>{modelCache.delete(asset);throw error});modelCache.set(asset,pending)}return modelCache.get(asset)};
  async function prepare(train,other=false){
    if(routeModel(town)){
      const design=paintDrafts?.[other?'other':'main']||(isMonorail(train)?designFor(town,other):null);
      return decoratePaint(createIslandTrain(effectiveFormation(town,other),isSuspended(town),other,design),design);
    }
    const preview=paintDrafts?.[other?'other':'main'];const design=preview||designFor(town,other);
    const spec=CONSIST?.trains?.[train],formation=effectiveFormation({...town,train:other?town.train:train,oppositeTrain:other?train:town.oppositeTrain},other);
    if(isLimitedExpress(train)){
      const {createLimitedExpress}=await import('./limited-express-model.mjs?v=rail-90');
      const model=createLimitedExpress(train,formation,design);
      for(const car of model.cars)car.doorTargets=readDoorTargets(car.parts.body,car.doors);
      return decoratePaint(model,design);
    }
    if(formation.count>1&&!spec&&!(isMountain(town)&&train==='tram'))throw Error('中間車模型を準備中です。');
    const length=isMountain(town)&&train==='tram'?12.9:spec?.cab?.couplerAnchors?Math.abs(spec.cab.couplerAnchors.front[0]-spec.cab.couplerAnchors.rear[0]):LEGACY_CAR_LENGTH;
    const assets=await Promise.all(formation.cars.map(car=>{
      if(!spec)return loadAsset(train+'.glb');
      const row=car.kind==='cab'?spec.cab:(car.roofVariant==='pantograph'?spec.middlePantograph:spec.middle);
      if(!row?.asset)throw Error('必要な中間車模型がありません。');return loadAsset(row.asset);
    }));
    const root=new T.Group(),cars=assets.map((gltf,i)=>{
      const parts={};gltf.scene.updateMatrixWorld(true);
      for(const name of['body','bogieFront','bogieBack']){
        const group=new T.Group();
        if(hasNamedParts(train)){const source=gltf.scene.getObjectByName(name);if(!source)throw Error('模型の部品がありません。');group.add(source.clone(true));group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.add(group);parts[name]=group;continue;}
        gltf.scene.traverse(o=>{if(o.isMesh&&(o.name===name||o.name.startsWith(name+'_'))){const m=new T.Mesh(o.geometry,o.material);m.applyMatrix4(o.matrixWorld);group.add(m)}});
        if(!group.children.length){const source=gltf.scene.getObjectByName(name);if(source)group.add(source.clone(true))}
        root.add(group);parts[name]=group;
      }const carSpec=formation.cars[i].kind==='cab'?spec?.cab:spec?.middle;const doors=prepareDoors(parts.body,hasNamedParts(train)?{type:train,kind:formation.cars[i].kind}:train==='tram'?'tram':formation.cars[i].kind==='cab'?'cab':'middle');return{parts,doors,doorTargets:readDoorTargets(parts.body,doors),motion:train==='steam'?prepareSteamMotion(parts.body):null,bodyAnchor:carSpec?.bodyAnchor,bogieOffsets:carSpec?.bogieOffsets||(isMountain(town)&&train==='tram'?[3.55,-3.55]:[6.9,-6.9]),bogieOffset:Math.abs(carSpec?.bogieOffsets?.[0]??6.9),tail:!isLocomotive(train)&&formation.count>1&&i===formation.cars.length-1};
    });
    const paint=preparePaint(root,cars,design,spec?.paintProfile);
    if(isLocomotive(train))root.traverse(o=>{if(o.isMesh)for(const material of Array.isArray(o.material)?o.material:[o.material])if(material.name.startsWith('CabGlass')){material.transparent=true;material.opacity=.15;material.depthWrite=false;}});
    return decoratePaint({root,cars,length,train,paint},design);
  }
  const [main,other,...returns]=await Promise.all([prepare(key),hasSecondTrain()?prepare(town.oppositeTrain||key,true):Promise.resolve(null),...(isIntercity(town)?[prepare(key),prepare(town.oppositeTrain||'original',true)]:[])]);
  await skyPreparation;natureSky.authorize();
  if(ticket!==loadTicket){main.paint?.dispose();other?.paint?.dispose();returns.forEach(m=>m.paint?.dispose());return;}
  for(const model of [main,other,...returns])if(model)attachHiddenRiders(model,readDoorTargets);
  for(const m of returnModels){scene.remove(m.root);m.paint?.dispose();}returnModels=returns;for(const m of returnModels)scene.add(m.root);
  mainPaint?.dispose();otherPaint?.dispose();mainPaint=main.paint;otherPaint=other?.paint||null;
  trainRoot.clear();trainRoot.add(...[...main.root.children]);carParts=main.cars;carLength=main.length;
  oppositeRoot.clear();oppositeParts=other?.cars||[];oppositeCarLength=other?.length||main.length;
  if(other)oppositeRoot.add(...[...other.root.children]);
  trainRoot.userData.train=main.train;oppositeRoot.userData.train=other?.train||null;
  setTrainWindowLights(trainRoot,lightingPhase!=='day');setTrainWindowLights(oppositeRoot,lightingPhase!=='day');for(const m of returnModels)setTrainWindowLights(m.root,lightingPhase!=='day');
  model=trainRoot;loadingModel=false;updateRoute(true);ui();say('編成の準備ができました。発車できます。');
}catch(e){if(ticket===loadTicket){loadingModel=false;say(e.message||'電車の読みこみに失敗しました。');ui();}throw e}}

let viewAdjustment=neutralAdjustment(),lastCameraDrag=0;
const previousOrientation=new T.Quaternion();
let lastShotTime=null;
let mountainCameraPose=null,mountainCameraKey=null;
let connectorMode=false,connectorStart=null;
function setMode(next){orbitGoal=null;if(next!=='build'){connectorMode=false;connectorStart=null;stationTool=false;}if(next==='build'&&isStationLoop(town)){say(loopName(town)+'は'+loopStations(town).length+'駅をめぐる専用コースです。');return;}if(next==='build'&&isMountain(town)){say('登山鉄道は地形に合わせた固定コースです。電車の色や音を変えて楽しめます。');return;}if(recording&&next==='build'){say('録画を終えてから編集してください。');return}if(next!==mode)viewGestures.cancel();if(replay&&next==='build')exitReplay();if(mode==='build'&&next!=='build')orbit.pitch=.88;mode=next;$('#editor').hidden=next!=='build';$('#memories').hidden=next!=='memories';document.body.classList.toggle('editing',next==='build');for(const b of $$('header nav button'))b.classList.toggle('active',b.id==='mode-'+next);if(next==='build'){invalidateAutoRecord(true);intercityFleet?.stop();if(isIntercity(town))fit();setAutoCamera(false);trainState.playing=false;trainState.speed=0;camMode='orbit';$('#window-view').value='';orbit.pitch=1.47;$$('[data-camera]').forEach(b=>b.classList.toggle('active',b.dataset.camera==='orbit'));$('#view-name').textContent='街全体';finishJourney();ui();}updateMarkers();}
function setCamera(name,automatic=false){if(name==='traffic'||camMode==='traffic')resetRoadView();if(!syncPanoramaOption()&&name==='panorama')name='front';lastShotTime=null;viewGestures.cancel();viewAdjustment=neutralAdjustment();mountainCameraPose=null;mountainCameraKey=null;countryShotKey=countryKey();countryReplayTime=replay?replayTime:null;if(intercityLocked&&!countryViewAllowed(name))name='front';if(!automatic)setAutoCamera(false);scenicLook=null;camMode=name;$('#window-view').value=['left','right','panorama'].includes(name)?name:'';if(mode==='build')setMode('watch');if(name==='orbit'){orbit.pitch=.88;orbit.distance=Math.max(orbit.distance,120)}if(name==='trackside'&&lastVisual){const p=trainView(lastVisual,viewTrain===1).body;trackside.set(p[0]+10,(p[3]||0)+2.5,-p[1]+16);if(isMountain(town)){const view=trainView(lastVisual,viewTrain===1),shot=mountainExteriorCamera(view,'trackside',{carLength:viewTrain===1?oppositeCarLength:carLength,aspect:camera.aspect,height:mountainSurfaceHeight});trackside.fromArray(shot.position);}if(isIntercity(town)&&countryAvailable(movingView(trainView(lastVisual,viewTrain===1))))trackside.fromArray(countryAnchor(movingView(trainView(lastVisual,viewTrain===1)),camera.aspect<1))}$$('[data-camera]').forEach(b=>b.classList.toggle('active',b.dataset.camera===name));$('#view-name').textContent=$(`[data-camera="${name}"]`)?.textContent||($('#window-view').value?$('#window-view').selectedOptions[0].textContent:'色ぬりを確認');}
function setAutoCamera(on){if(on&&!replay&&!route?.length){say('線路をつなぐとオート視点で走れます。');return;}invalidateAutoRecord(false);autoCamera=on;autoElapsed=0;resetDirector();directorPose=null;director=createDirector();directorCut=-1;$('#auto-camera').setAttribute('aria-pressed',String(on));$('#auto-camera').classList.toggle('active',on);$('#auto-camera').textContent=on?'オート視点 ON':'オート視点';if(on){if(mode==='build')setMode('watch');updateAutoCamera();}}
$('#auto-camera').onclick=()=>setAutoCamera(!autoCamera);
$('#view-train').onchange=()=>{invalidateAutoRecord(false);viewTrain=hasSecondTrain()?Number($('#view-train').value):0;scenicLook=null;autoPhase=null;autoElapsed=0;resetDirector();if(autoCamera)updateAutoCamera();else setCamera(camMode,true);if(lastVisual){applyVisual(lastVisual);moveCamera(lastVisual);}say(`列車${viewTrain+1}を見る視点に切りかえました。`);};
const trackside=new T.Vector3(5,2.5,18);
function palette(){const options=category==='rails'?Object.entries(KIT.pieces).filter(([,p])=>!p.intercity).filter(([,p])=>railLayer==='elevated'?p.procedural:!p.procedural).map(([key,p])=>[key,p.name,{straight_long:'━',straight_short:'─',curve_left:'↶',curve_right:'↷',turnout_left:'⑂',turnout_right:'⑂',crossing:'╳',viaduct_straight:'━',viaduct_left:'↶',viaduct_right:'↷',ramp_up:'↗',ramp_down:'↘'}[key]]):category==='buildings'?[['office','オフィス','▥'],['apartment','マンション','▤'],['hotel','高いビル','▥'],['shop','お店','▰'],['warehouse','倉庫','⌂']]:[['road','直線道路','━'],['corner','曲がり角','┗'],['tee','T字路','⊥'],['junction','交差点','╋'],['crossing','ふみきり道路','╳'],['tree','木','♣']];$('#rail-layer-row').hidden=category!=='rails';$('#palette').replaceChildren();for(const[key,label,icon]of options){const b=document.createElement('button');b.innerHTML=`<b>${icon}</b>${label}`;b.dataset.tool=key;if(isIntercity(town)&&category==='rails')b.disabled=true;const port=ports.find(p=>p.key===selectedPort);if(category==='rails'&&port&&Math.abs((KIT.pieces[key].ports[0].position[2]||0)-(port.h||0))>.001)b.disabled=true;b.onclick=()=>{connectorMode=false;connectorStart=null;stationTool=false;if(category==='rails')addRail(key);else{tool=key;$('#edit-help').textContent=ROAD_TYPES.includes(key)?'道路のはしを選ぶと、次の道路がつながります。':'置きたい場所をタップしてください。';$$('#palette button').forEach(x=>x.classList.toggle('active',x===b));}};$('#palette').append(b)}if(category==='rails'){const join=document.createElement('button');join.textContent=connectorMode?'接続をやめる':'はしどうしをつなぐ';join.id='connect-rails';join.classList.toggle('active',connectorMode);join.disabled=isIntercity(town)||ports.length<2;join.onclick=()=>{connectorMode=!connectorMode;connectorStart=null;tool=null;stationTool=false;palette();say(connectorMode?'つなぐはしを2つ、順番に選んでください。':'接続を取り消しました。');};$('#palette').append(join);if(connectorMode){const pick=document.createElement('button');pick.textContent='このはしを使う';pick.disabled=!ports.some(p=>p.key===selectedPort);pick.onclick=()=>connectSelectedPorts(ports.find(p=>p.key===selectedPort));$('#palette').append(pick);}if(railLayer==='ground')stationPalette();}$('#edit-help').textContent=connectorMode?'水色のはしを2つ選びます。小さいはしは「次のはし」→「このはしを使う」でも選べます。':category==='rails'?`水色のはしを選び、部品をつなぎます。${ports.find(p=>p.key===selectedPort)?.h?' 選んだはしはこうか（8m）です。':' 地上からこうかへは上り坂を選びます。'}`:'部品を選んで、街をタップして置きます。';if(category==='rails'&&stationTool)$('#edit-help').textContent=STATION_TEXT.help;}
// ---- 自由編集の駅（置く・選ぶ・変える。計算は free-station.mjs） ----
function freeStationGeometries(){if(isMountain(town)||isStationLoop(town)||isIntercity(town))return [];return activeStations(town,activeDistrict).map(st=>stationGeometry(st,town.rails,KIT)).filter(Boolean);}
function setStations(list){if(list.length)town.stations=list;else delete town.stations;}
function selectedStation(){return selected?.kind==='station'?town.stations?.find(s=>s.id===selected.id)||null:null;}
function stationAtPoint(x,y){
 for(const st of activeStations(town,activeDistrict)){const g=stationGeometry(st,town.rails,KIT);if(!g)continue;
  for(const r of stationFootprint(g,st.side)){const c=Math.cos(r.angle),s=Math.sin(r.angle),dx=x-r.cx,dy=y-r.cy;if(Math.abs(c*dx+s*dy)<=r.hx&&Math.abs(-s*dx+c*dy)<=r.hy)return st;}}
 return null;
}
function railAt(x,y){let hit=null,dist=Infinity;for(const it of town.rails)for(const r of KIT.pieces[it.piece].routes)for(let i=0,n=Math.max(20,Math.ceil(r.length/2));i<=n;i++){const p=sampleItem(it,r,i/n),d=Math.hypot(p[0]-x,p[1]-y);if(d<4&&d<dist){hit=it;dist=d;}}return hit;}
function selectStation(st,message){selected={kind:'station',id:st.id};stationNaming=false;say(message);updateMarkers();ui();palette();}
function showPlaceSpots(spots){placeSpots=(spots||[]).map(s=>({x:s.x,y:s.y,h:s.h||0,r:s.r||11}));updateMarkers();}
function placeStationAt(x,y){
 if(activeDistrict){say(STATION_TEXT.district);return;}
 const rail=railAt(x,y),own=stationAtPoint(x,y);
 if(own&&(!rail||own.rails.includes(rail.uid)||!['straight_long','straight_short'].includes(rail.piece))){selectStation(own,STATION_TEXT.exists);return;}
 if(!rail){say(STATION_TEXT.noRail);return;}
 const plan=planStation(town,KIT,rail.uid,stationMode);
 if(plan.select){selectStation(town.stations.find(s=>s.id===plan.select),STATION_TEXT.exists);return;}
 if(!plan.ok){showPlaceSpots(plan.spots);say(plan.reason==='blocked'?STATION_TEXT.blocked(plan.kind):STATION_TEXT[plan.reason]||STATION_TEXT.noRail,true);return;}
 remember();setStations([...(town.stations||[]),plan.station]);selected={kind:'station',id:plan.station.id};stationNaming=false;
 const off=!route?.parts?.some(p=>p.it.uid===rail.uid);
 changed(STATION_TEXT.placed(plan.station.name)+(off?' '+STATION_TEXT.offRoute:''),true);
}
// 選んだ駅の側を変える。重なるときは変えずに赤い丸を出す。
function changeStationSide(mode,message){
 const st=selectedStation();if(!st)return;
 const r=chooseSide(town,KIT,st,mode);
 if(!r.ok){showPlaceSpots(r.spots);say(STATION_TEXT.blocked(r.kind),true);return;}
 if(r.station.side===st.side){palette();return;}
 remember();setStations(town.stations.map(s=>s.id===st.id?{...s,side:r.station.side}:s));changed(message,true);
}
function setStationMode(next){stationMode=next;const st=selectedStation();if(st){if(next==='both'&&st.side!=='both')return changeStationSide('both',STATION_TEXT.bothSides);if(next==='one'&&st.side==='both')return changeStationSide('one',STATION_TEXT.oneSide);}palette();}
function renameStation(name){
 const st=selectedStation();if(!st)return;
 if(!validStationName(name)){say(STATION_TEXT.badName,true);return;}
 if(name===st.name){stationNaming=false;palette();return;}
 remember();setStations(town.stations.map(s=>s.id===st.id?{...s,name}:s));stationNaming=false;changed(STATION_TEXT.renamed(name),true);
}
function removeSelectedStation(){const st=selectedStation();if(!st)return;remember();setStations(town.stations.filter(s=>s.id!==st.id));selected=null;stationNaming=false;changed(STATION_TEXT.removed,true);}
function stationPalette(){
 const pal=$('#palette'),add=(parent,label,fn,extra={})=>{const b=document.createElement('button');b.type='button';b.innerHTML=label;b.onclick=fn;Object.assign(b,extra);parent.append(b);return b;};
 const tool=add(pal,'<b>🚉</b>えき',()=>{placeSpots=[];if(activeDistrict){stationTool=false;updateMarkers();palette();say(STATION_TEXT.district);return;}stationTool=!stationTool;connectorMode=false;connectorStart=null;palette();updateMarkers();say(stationTool?STATION_TEXT.help:'えきを おくのを やめたよ。');},{id:'station-tool',disabled:isIntercity(town)});
 tool.classList.toggle('active',stationTool);tool.setAttribute('aria-pressed',String(stationTool));
 const st=selectedStation();if(!stationTool&&!st)return;
 const row=document.createElement('div');row.className='station-options';row.setAttribute('role','group');row.setAttribute('aria-label','えきの ホーム');pal.append(row);
 const current=st?(st.side==='both'?'both':'one'):stationMode;
 for(const [value,label] of [['one','かたがわ'],['both','りょうがわ']]){const b=add(row,label,()=>setStationMode(value));b.dataset.stationSide=value;b.classList.toggle('active',current===value);b.setAttribute('aria-pressed',String(current===value));}
 if(!st)return;
 const edit=document.createElement('div');edit.className='station-options station-edit';edit.setAttribute('role','group');edit.setAttribute('aria-label','えらんだ えき');pal.append(edit);
 add(edit,'はんたいがわへ',()=>changeStationSide(st.side==='left'?'right':'left',STATION_TEXT.flipped),{id:'station-flip',disabled:st.side==='both'});
 add(edit,'なまえを かえる',()=>renameStation(nextStationName(town.stations,st.name)),{id:'station-rename'});
 add(edit,'えきを けす',removeSelectedStation,{id:'station-delete'});
 if(!stationNaming){add(edit,'じぶんで つける',()=>{stationNaming=true;palette();$('#station-name')?.focus();},{id:'station-name-open',className:'station-small'});return;}
 const form=document.createElement('form');form.className='station-name-form';form.onsubmit=e=>{e.preventDefault();renameStation($('#station-name').value.trim());};
 const input=document.createElement('input');input.id='station-name';input.maxLength=STATION_NAME_MAX;input.value=st.name;input.autocomplete='off';input.setAttribute('aria-label','えきの なまえ（8もじまで）');
 const ok=document.createElement('button');ok.type='submit';ok.textContent='きめる';form.append(input,ok);edit.append(form);
}
// 選んだ駅のホームと駅舎を、うすい だいだい色で示す。
function markSelectedStation(){const st=selectedStation();if(!st)return;const g=stationGeometry(st,town.rails,KIT);if(!g)return;
 for(const r of stationFootprint(g,st.side)){const m=new T.Mesh(new T.PlaneGeometry(r.hx*2+1,r.hy*2+1),new T.MeshBasicMaterial({color:'#efac46',transparent:true,opacity:.42,depthTest:false,side:T.DoubleSide}));m.rotation.set(-Math.PI/2,0,r.angle);m.position.set(r.cx,r.kind==='platform'?1.2:5.2,-r.cy);m.renderOrder=19;markers.add(m);}}
function addRail(key){if(isIntercity(town)){say('都市間の専用線です。線路を自由につくる場合は別の街を選んでください。');return;}if(town.rails.length>=300){say('線路は300個まで置けます。');return}const p=ports.find(p=>p.key===selectedPort);if(town.rails.length&&!p){say('一周つながっています。線路を選んで一部を外すと、付け足せます。');return}if(p&&Math.abs((KIT.pieces[key].ports[0].position[2]||0)-(p.h||0))>.001){say('はしの高さがちがいます。上り坂・下り坂でつないでください。');return;}remember();const uid=Math.max(0,...town.rails.map(x=>x.uid))+1;town.rails.push({uid,piece:key,pose:p?[p.x,p.y,p.a]:[0,0,0],branch:'B'});selected={kind:'rail',uid};selectedPort=uid+':B';changed('線路をつなぎました。')}
function applyProp(fn){if(selected?.kind!=='prop'){say('先に建物や道路を選んでください。');return}const p=town.props.find(p=>p.uid===selected.uid);if(!p)return;remember();fn(p);changed('置き場所を変えました。')}
function connectSelectedPorts(end){if(!connectorStart){connectorStart=end.key;selectedPort=end.key;updateMarkers();say('1つ目を選びました。つなぎたい、もう一方の水色のはしを選んでください。');return;}
 try{if(town.rails.length>=300)throw Error('線路は300個までです。');const start=ports.find(p=>p.key===connectorStart),uid=Math.max(0,...town.rails.map(r=>r.uid))+1,join=connectRailPorts(start,end,uid,KIT);if(railIntersections([...town.rails,join],KIT)>railIntersections(town.rails,KIT))throw Error('とちゅうで別の線路と重なります。線路を少し組み直してください。');remember();town.rails.push(join);connectorMode=false;connectorStart=null;stationTool=false;selected={kind:'rail',uid};selectedPort=null;changed('はしどうしを接続しました。「もどす」で取り消せます。');}
 catch(e){say(e.message,true);}}
function selectAt(x,y){const nearest=ports.filter(p=>railLayer==="elevated"?KIT.pieces[town.rails.find(r=>r.uid===p.uid).piece].procedural:!KIT.pieces[town.rails.find(r=>r.uid===p.uid).piece].procedural).map(p=>({p,d:Math.hypot(x-p.x,y-p.y)})).sort((a,b)=>a.d-b.d)[0];if(nearest&&nearest.d<5){if(connectorMode){connectSelectedPorts(nearest.p);return true;}selectedPort=nearest.p.key;selected={kind:'rail',uid:nearest.p.uid};say('このはしに次の線路をつなぎます。');updateMarkers();ui();palette();return true}const road=roadPorts(visibleTownProps()).map(p=>({p,d:Math.hypot(x-p.x,y-p.y)})).sort((a,b)=>a.d-b.d)[0];if(road&&road.d<5){selectedRoadPort=road.p;say('この道路のはしに次の道路をつなぎます。');return true}let hit=null,dist=Infinity;for(const p of category==="rails"?[]:visibleTownProps()){const d=Math.hypot(p.pose[0]-x,p.pose[1]-y);if(d<10&&d<dist){hit={kind:'prop',uid:p.uid};dist=d}}if(hit){selected=hit;const p=town.props.find(p=>p.uid===hit.uid);$('#height').value=String(p.scale);$('#tint').value=p.tint;say('選びました。次の場所をタップで移動できます。');updateMarkers();ui();return true}if(category==='rails'){const st=stationAtPoint(x,y);if(st){selectStation(st,'えき「'+st.name+'」を えらんだよ。');return true}}for(const it of town.rails.filter(it=>railLayer==="elevated"?KIT.pieces[it.piece].procedural:!KIT.pieces[it.piece].procedural))for(const r of KIT.pieces[it.piece].routes)for(let i=0,n=Math.max(20,Math.ceil(r.length/2));i<=n;i++){const p=sampleItem(it,r,i/n),d=Math.hypot(p[0]-x,p[1]-y);if(d<4&&d<dist){hit={kind:'rail',uid:it.uid};dist=d}}if(hit){selected=hit;say('線路を選びました。分岐は「分岐を切りかえ」で行き先を変えられます。');ui();palette();return true}return false}
function tapWorld(x,y){if(mode!=='build')return;if(placeSpots.length){placeSpots=[];updateMarkers();}if(stationTool){placeStationAt(x,y);return;}if(tool){if(town.props.length>=200){say('建物・道路・木は合計200個まで置けます。');return}remember();const uid=Math.max(0,...town.props.map(p=>p.uid))+1;town.props.push(ROAD_TYPES.includes(tool)&&selectedRoadPort?snapRoad(tool,selectedRoadPort,uid):{uid,type:tool,pose:[Math.round(x/2)*2,Math.round(y/2)*2,0],scale:Number($('#height').value)||1,tint:$('#tint').value});selected={kind:'prop',uid};changed('街に部品を置きました。');return}if(!selectAt(x,y)&&selected?.kind==='prop')applyProp(p=>{p.pose[0]=Math.round(x/2)*2;p.pose[1]=Math.round(y/2)*2;});}
const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0);
const canAdjustView=()=>mode!=='build'&&!paintDraft&&adjustableMode(camMode);
function manualView(){if(autoCamera)setAutoCamera(false);}
function zoomView(factor){if(canAdjustView()){manualView();viewAdjustment=zoomAdjustment(viewAdjustment,factor);}else if(camMode==='orbit'||mode==='build'){if(mode==='build'){lastEditDrag=performance.now();orbitGoal=null;}orbit.distance=Math.max(12,Math.min(isIsland(town)||isSuspended(town)?5000:1800,orbit.distance*factor));}}
function tapPaintedTrain(){
 const hit=ray.intersectObjects((paintTarget==='other'?oppositeRoot:trainRoot).children,true).find(({object,face})=>{
  const m=Array.isArray(object.material)?object.material[face?.materialIndex??0]:object.material;
  if(!m?.visible||m.userData.letteringOverlay)return false;
  for(let parent=object;parent;parent=parent.parent)if(!parent.visible)return false;
  return true;
 });
 if(!hit)return;
 const index=hitDecorationIndex(hit,paintDraft);
 if(index>=0){decorationEditor.select(index);return;}
 const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex??0]:hit.object.material;
 const part=material?.name?.replace(/^Paint_/,'').replace(/\.\d+$/,'');
 if(part==='stripe'||part==='stripe2'){$('[data-paint-tab="pattern"]').click();return;}
 if(material?.userData.decorationSurface||Object.hasOwn(PAINT_PARTS,part)){
  const face=part==='face'&&!$('#paint-panel').classList.contains('fixed-livery');
  $(face?'[data-paint-tab="face"]':'[data-paint-tab="colors"]').click();
 }
}
const viewGestures=bindViewGestures(canvas,{
 onStart:()=>{lastCameraDrag=performance.now();manualView();},
 drag:(dx,dy)=>{if(mode==='build'){lastEditDrag=performance.now();orbitGoal=null;const f=orbit.distance/Math.max(200,canvas.clientHeight);orbit.x-=dx*f;orbit.y+=dy*f;}else{
   const now=performance.now(),maxPixels=Math.min(40,now-lastCameraDrag)*.38;
   lastCameraDrag=now;
   const scale=Math.min(1,maxPixels/(Math.hypot(dx,dy)||1));dx*=scale;dy*=scale;
   if(camMode==='orbit'){orbit.yaw-=dx*.003;orbit.pitch=Math.max(.13,Math.min(1.49,orbit.pitch+dy*.0025));}
   else if(canAdjustView()){manualView();viewAdjustment=dragAdjustment(viewAdjustment,dx*.6,dy*.6);}
 }},pinch:zoomView,wheel:zoomView,
 tap:e=>{if(!paintDraft&&mode!=='build')return;const rect=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);if(paintDraft){tapPaintedTrain();return;}const hit=new T.Vector3(),railHit=!tool?ray.intersectObjects([...markers.children,...railRoot.children],true)[0]:null;if(railHit)tapWorld(railHit.point.x,-railHit.point.z);else if(ray.ray.intersectPlane(plane,hit))tapWorld(hit.x,-hit.z);}
});
window.addEventListener('blur',viewGestures.cancel);
window.addEventListener('pagehide',viewGestures.cancel);
document.addEventListener('visibilitychange',()=>{if(document.hidden)viewGestures.cancel();});
$('#reset-view').onclick=()=>{viewGestures.cancel();viewAdjustment=neutralAdjustment();say('視点を標準の位置にもどしました。');};
canvas.addEventListener('keydown',e=>{if(!canAdjustView())return;const steps={ArrowLeft:[20,0],ArrowRight:[-20,0],ArrowUp:[0,20],ArrowDown:[0,-20]};if(steps[e.key]){e.preventDefault();manualView();viewAdjustment=dragAdjustment(viewAdjustment,...steps[e.key]);}else if(e.key==='Home'){e.preventDefault();viewAdjustment=neutralAdjustment();}else if(['+','=','-'].includes(e.key)){e.preventDefault();zoomView(e.key==='-'?1.1:1/1.1);}});

function fit(){if(isSuspended(town)){Object.assign(orbit,{x:1030,y:15,yaw:1.47,pitch:.89,distance:Math.max(1050,2100/Math.max(.5,camera.aspect))});return;}if(isIsland(town)){Object.assign(orbit,{x:300,y:180,yaw:1.52,pitch:1.06,distance:Math.max(1550,2700/Math.max(.48,camera.aspect))});return;}if(isTokyo(town)){orbit.x=45;orbit.y=-18;orbit.yaw=2.25;orbit.pitch=.67;orbit.distance=innerWidth<650?730:530;return;}if(isMountain(town)){orbit.x=-20;orbit.y=350;orbit.yaw=.9;orbit.pitch=.78;orbit.distance=innerWidth<600?1600:1250;return;}if(isIntercity(town)){const p=trainView(lastVisual,viewTrain===1)?.body||[200,0];orbit.x=p[0]<3000?100:5900;orbit.y=400;orbit.distance=p[0]<3000?750:1100;orbit.pitch=.88;return;}const ps=town.rails.flatMap(it=>KIT.pieces[it.piece].routes.flatMap(r=>[sampleItem(it,r,0),sampleItem(it,r,.5),sampleItem(it,r,1)]));if(!ps.length){orbit.x=0;orbit.y=0;orbit.distance=130;return}const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);orbit.x=(Math.min(...xs)+Math.max(...xs))/2;orbit.y=(Math.min(...ys)+Math.max(...ys))/2;const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));orbit.yaw=span>300?-1.1:-.55;orbit.distance=Math.max(110,span*(span>300?1.3:1.65));if(innerWidth<600)orbit.distance*=1.2}
function saveFile(data,name){const u=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)}
async function readFile(input,validator){const f=input.files[0];if(!f)return null;try{const max=validator===validateReplay?96000000:24000000;if(f.size>max)throw Error(`${max/1000000}MB以下のファイルを選んでください。`);return validator(JSON.parse(await f.text()),KIT)}finally{input.value=''}}
// 駅で止まったまま（まだ一度も数えていない8秒の停車）で発車を押したときだけ、待ちを約3秒にする。
// ドアは開いてから閉まり、標準の発車チャイムも鳴る。自作の音がある電車は、メロディーを最後まで鳴らすため短くしない。
function quickDeparture(){
 if(!(activeDistrict||isMountain(town)||(isIntercity(town)&&town.intercityStations===1)||freeStops.length))return;
 if(hasWorkshopSound(soundFor(town,false))||(hasSecondTrain()&&hasWorkshopSound(soundFor(town,true))))return;
 for(const s of isIntercity(town)?[trainState]:[trainState,oppositeState])if(s&&s.stationPhase==='dwell'&&s.dwell>=7.99){s.dwell=QUICK_DWELL;s.dwellDuration=QUICK_DWELL+.3;}
}
function townBlocked(){return townSwitchBusy||townImportBusy||sceneReading||loadingModel||!!recording||recordStarting||!!replay||!!paintBaseTown||trafficSelecting||savingTrain;}
function townBlockReason(){if(townSwitchBusy||townImportBusy)return '街の切りかえ中です。しばらくお待ちください。';if(sceneReading||loadingModel||trafficSelecting)return '模型を読みこんでいます。読みこみが終わってから、もう一度街を選んでください。';if(recording||recordStarting)return '録画を終えてから街を選んでください。';if(replay)return '走行記録の再生を終えてから街を選んでください。';if(paintBaseTown||savingTrain)return '電車づくりを保存するか終えてから街を選んでください。';return ''; }
function presetTown(id){switch(id){case 'suspended':return {format:'rail-town',version:3,suspended:'shiomi-v1',train:'original',oppositeTrain:'original',formation:defaultFormation(2),rails:[],props:[]};case 'island':return {format:'rail-town',version:3,island:'yume-v1',train:'original',formation:defaultFormation(3),rails:[],props:[]};case 'tokyo':return {format:'rail-town',version:3,tokyo:'marunouchi-loop-v1',train:'rinkai',formation:defaultFormation(4),rails:[],props:[]};case 'mountain':return mountainTown();case 'district':return districtTown(KIT);case 'intercity':return intercityTown();case 'elevated':return elevatedTown(KIT);case 'large':return largeTown(KIT);case 'small':return defaultTown(KIT);case 'branch':return {format:'rail-town',version:3,rails:clone(KIT.presets.branch),props:[{uid:1,type:'shop',pose:[20,-24,0],scale:1,tint:'#ffffff'}],train:town.train,formation:defaultFormation(2)};case 'empty':return {format:'rail-town',version:3,rails:[],props:[],formation:defaultFormation(2),train:town.train};default:throw Error('まだ保存した街がありません。');}}
async function openTownChooser(tab='choose'){try{if(replay&&!recording&&!recordStarting&&!loadingModel&&!sceneReading)await exitReplay();}catch(e){say(e.message||'街をもどせませんでした。');return;}$('#file-menu').hidden=true;$('#menu').setAttribute('aria-expanded','false');townChooser.open(tab);}
async function switchTown(id,edit=false,imported=null){
 if(id===null){if(townSwitchBusy)sceneLoadTicket++;return false;}
 if(townBlocked())return false;
 if(!imported&&id===townStore.active){if(edit)setMode('build');return true;}
 if(townStoreError||(!townWritable&&!townStore.temporary))throw Error(townStoreError||'以前の街のデータを保護しています。今の街をファイルに保存してください。');
 const previous=clone(town),oldHistory=history,oldFuture=future,ticket=++sceneLoadTicket;let changedScene=false,success=false,merged=null,libraryBefore;
 invalidateAutoRecord(true);setAutoCamera(false);townSwitchBusy=true;
 try{
 stopSceneAudio();trainState.playing=false;trainState.speed=0;intercityFleet?.stop();if(oppositeState){oppositeState.playing=false;oppositeState.speed=0;}finishJourney();ui();
  const temporary=()=>{townWritable=false;libraryWritable=false;libraryError='一時表示中です。編集した街はファイルに保存してください。';townStore={...townStore,temporary:true,slots:{...townStore.slots,[townStore.active]:previous}};};
  if(townStore.temporary)temporary();
  else try{
   if(localStorage.readOnly)throw localStorage.openError;
   townStore=await withStorageLock(()=>commitTownStore(localStorage,townStore,townStore.active,previous,s=>validateScene(s,KIT),{expectedLive:liveTownText}));liveTownText=townStore.live;
  }catch(error){if(imported||(!localStorage.readOnly&&!isQuotaError(error)))throw error;temporary();}
  let next;
  if(imported){if(!libraryWritable)throw Error(libraryError);libraryBefore=localStorage.getItem(LIBRARY_KEY);const latest=libraryBefore===null?trainLibrary:readLibrary(localStorage);merged=mergeRetainedScene(latest,imported,readPending(localStorage),{migrateLegacy:!imported.trainLibrary});next=merged.scene;}
  else next=clone(townStore.slots[id]||presetTown(id));
  next=validateScene(next,KIT);await selectTownTraffic(next);if(ticket!==sceneLoadTicket)throw Error('街の切りかえを取り消しました。元の街は保存されています。');
  town=next;changedScene=true;selected=null;selectedPort=null;selectedRoadPort=null;setMode('watch');setAutoCamera(false);changed('街を準備しています…');await Promise.all([loadTrain(town.train),trafficLoad]);
  if(ticket!==sceneLoadTicket)throw Error('街の切りかえを取り消しました。元の街は保存されています。');
  if(merged&&localStorage.getItem(LIBRARY_KEY)!==libraryBefore)throw Error('電車の保存庫が別の画面で変わりました。もう一度、街ファイルを読みこんでください。');
  try{if(!townStore.temporary){townStore=await withStorageLock(async()=>{if(merged&&localStorage.getItem(LIBRARY_KEY)!==libraryBefore)throw Error('保存庫は別の画面で変えられています。');
   let plan=null;if(merged){const pending=readPending(localStorage),usage=usageMemoryOnly?trainUsage:readUsage(localStorage);plan=planRetention(readCurrentLibrary(),merged.items,town,usage,pending);}
   const result=await commitTownStore(localStorage,townStore,id,plan?.scene||town,s=>validateScene(s,KIT),{expectedLive:liveTownText,...(plan?{libraryItems:plan.items,extraWrites:plan.extraWrites,expected:[[LIBRARY_KEY,libraryBefore]]}:{})});
   if(plan){merged.items=plan.items;town=plan.scene;trainUsage=plan.usage;}return result;
  });liveTownText=townStore.live;}}catch(error){if(imported||!isQuotaError(error))throw error;temporary();}
  if(townStore.temporary){townStore={...townStore,active:id,slots:{...townStore.slots,[id]:clone(town)}};$('#save-status').textContent=libraryError;}
  if(merged)trainLibrary=merged.items;
  if(isMountain(town)){trafficTime=0;mountainTrafficVehicle=MOUNTAIN_BUS_ID;}
  history=[];future=[];fit();success=true;
 }catch(error){
  town=previous;history=oldHistory;future=oldFuture;
  try{if(changedScene){changed('元の街へもどしています…');await Promise.all([loadTrain(town.train),trafficLoad]);}else await selectTownTraffic(previous);}catch{say('元の街は保存されています。ページを開き直すと復帰できます。');}
  throw error;
 }finally{townSwitchBusy=false;ui();if(success){setMode(edit?'build':'watch');if(!edit)setCamera(isSuspended(town)?'front':isIsland(town)?'follow':isTokyo(town)?'front':activeDistrict?'station':'orbit');$('#file-menu').hidden=true;say(townStore.temporary?libraryError:'街を開きました。前の街は「街を選ぶ・つくる」からもどれます。');}}
 return true;
}
let replayStoreText=null;
const replayEpoch=createReplayEpoch();
setReplayCleanupGuard(localStorage,()=>replayStoreText);
onReplayCleanup(storage=>{if(storage!==localStorage)return;replayStoreText=null;replayEpoch.suppress();say('作品を守るため、自動の走行記録を整理しました。今の走行記録はファイルに保存できます。');});
function startJourney(){if(soundStationPreview)return;replayEpoch.start();journeyCapturing=true;journey={format:'rail-town-replay',version:2,scene:clone(town),frames:[{t:0,...clone(visualState())}]};captureElapsed=0;nextCapture=.1;ui();}
function finishJourney(){if(soundStationPreview)return;journeyCapturing=false;ui();}
$('#journey-start').onclick=async()=>{
 if(townBlocked()||journeyCapturing)return;
 const previous=journey;
 if(previous?.frames.length>1&&!await confirmTrainChange('今の画面の走行記録を、新しい記録に置きかえますか？必要な記録は先にファイル保存してください。'))return;
 if(townBlocked()||journeyCapturing||journey!==previous)return;
 startJourney();say('走行の記録を開始しました。終わったあと、必要ならファイルに保存してください。');
};
$('#journey-stop').onclick=()=>{finishJourney();say('走行の記録を終えました。ブラウザには自動保存しません。');};
$('#journey-delete').onclick=()=>$('#storage-open').click();
setupStoragePanel({
 read:()=>({...storageUsage(localStorage),raw:localStorage.getItem(REPLAY_KEY),canExport:!!journey&&journey.frames.length>1,canDelete:!!journey||localStorage.getItem(REPLAY_KEY)!==null}),
 blocked:()=>{if(journeyCapturing||townBlocked()||trainState.playing||trainState.speed>.1||intercityFleet?.visual().some(v=>v.speed>.1)){say('列車を止め、録画・再生・編集を終えてから保存データを確認してください。');return true;}return false;},
 exportReplay:()=>{if(journey?.frames.length>1)saveFile(journey,'わたしの街の走行.json');},
 erase:expected=>withStorageLock(async()=>{recoverStorage(localStorage);if(localStorage.getItem(REPLAY_KEY)!==expected)throw Error('走行記録が変わりました。閉じて、保存データをもう一度開いてください。');await commitStorage(localStorage,[[REPLAY_KEY,null]],{expected:[[REPLAY_KEY,expected]]});replayEpoch.suppress();replayStoreText=null;journey=null;captureElapsed=0;nextCapture=0;ui();})
});
async function enterReplay(data=journey){if(journeyCapturing){say('走行の記録を終えてから見返してください。');return;}if(townSwitchBusy||townImportBusy||sceneReading||loadingModel||paintBaseTown||recordStarting){say('準備が終わってから走行記録を開いてください。');return;}if(!data||data.frames.length<2)return;if(recording){say('録画を終えてから再生を始めてください。');return}const nextReplay=validateReplay(data,KIT);sceneReading=true;ui();try{const sceneTicket=++sceneLoadTicket;await selectTownTraffic(nextReplay.scene);if(sceneTicket!==sceneLoadTicket)return;if(!liveBackup)liveBackup={town:clone(town),trainState:clone(trainState),oppositeState:clone(oppositeState),mountainControl:clone(mountainControl),trafficTime};replay=nextReplay;town=clone(replay.scene);trainState.playing=false;trainState.speed=0;rebuildTown();rebuildRails();updateRoute();await Promise.all([loadTrain(town.train),trafficLoad]);replayTime=0;replayPlaying=true;$('#exit-replay').hidden=false;$('#replay-controls').hidden=false;setMode('memories');ui();say('走行を再生中です。視点は自由に変えられます。')}finally{sceneReading=false;ui();}}
function exitReplay(){if(!replay)return;if(recording)stopRecord();town=liveBackup.town;trafficTime=liveBackup.trafficTime||0;const restoredPeer=liveBackup.oppositeState,restoredControl=liveBackup.mountainControl;const restored={...liveBackup.trainState,playing:false,speed:0};trainState=restored;replay=null;liveBackup=null;replayPlaying=false;$('#exit-replay').hidden=true;$('#replay-controls').hidden=true;changed('自分の街にもどりました。');if((isTokyo(town)||isIsland(town))&&restoredPeer){trainState=restored;oppositeState={...restoredPeer,playing:false,speed:0};}if(isSuspended(town)&&restoredPeer){trainState=restored;oppositeState={...restoredPeer,playing:false,speed:0};route=lineFor(trainState);oppositeRoute=lineFor(oppositeState);}if(isMountain(town)){trainState=restored;oppositeState=restoredPeer?{...restoredPeer,playing:false,speed:0}:initialMountainOpponent(oppositeCarLength);mountainControl=restoredControl||{owner:null,turn:1};route=mountainRoute(trainState);oppositeRoute=mountainRoute(oppositeState);}return Promise.all([loadTrain(town.train),trafficLoad]);}
async function ensureAudio(waitForSamples=true){if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();audioGain=audioContext.createGain();audioGain.gain.value=0;const limiter=audioContext.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=10;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.2;audioGain.connect(limiter);limiter.connect(audioContext.destination);audioDestination=audioContext.createMediaStreamDestination();limiter.connect(audioDestination);void loadHornSample(audioContext).catch(()=>{});audioLoadPromise=loadTrainSamples(audioContext).then(({samples,failures})=>{soundscape=createTrainAudio(audioContext,audioGain,{samples,voices:4});canvas.dataset.audioSamples=String(soundscape.sampleCount);if(failures.length)say('一部の効果音を読みこめなかったため、合成音で再生します。');});}await audioContext.resume();if(waitForSamples)await audioLoadPromise;}
function setGameSound(on){
  audioEnabled=on;
  $('#sound').textContent=on?'音 ON':'音 OFF';
  $('#sound').setAttribute('aria-pressed',String(on));
  audioGain.gain.cancelScheduledValues(audioContext.currentTime);
  audioGain.gain.setTargetAtTime(on?.22:0,audioContext.currentTime,.025);
  if(!on)cabHorn.release();
}
const cabHorn=bindHorn($('#cab-horn'),async()=>{
  const ready=ensureAudio(false);
  if(!audioEnabled&&audioContext)setGameSound(true);
  const type=viewTrain===1?town.oppositeTrain:town.train;
  const [,sample]=await Promise.all([ready,type==='steam'?null:loadHornSample(audioContext)]);
  return ()=>startHorn(audioContext,audioGain,type,sample);
},()=>say('警笛の音声を開始できませんでした。'));
function updateTrainSound(){
  if(!soundscape||audioContext.state!=='running')return;
  const now=audioContext.currentTime,dt=now-lastAudioTime;if(dt<.045)return;lastAudioTime=now;
  const audible=(audioEnabled||!!soundStationPreview)&&!paintDraft&&!document.hidden&&mode!=='build'&&(!replay||replayPlaying)&&!loadingModel&&!townSwitchBusy;
  camera.updateMatrixWorld();const right=camera.matrixWorld.elements;
  const guidewaySound=isIsland(town)?'monorail':isSuspended(town)?'suspended-monorail':null;
  const trains=[lastVisual,lastVisual?.opposite,...(lastVisual?.returnTrains||[])].filter(Boolean).map((v,i)=>{
    const cars=v.cars||[{body:v.body}],nearest=cars.reduce((best,c)=>{const d=Math.hypot(c.body[0]-camera.position.x,c.body[1]+camera.position.z,(c.body[3]||0)+2-camera.position.y);return !best||d<best.d?{d,p:c.body}:best;},null);
    const inside=i===viewTrain&&['left','right','front','panorama'].includes(camMode),dx=nearest.p[0]-camera.position.x,dz=-nearest.p[1]-camera.position.z;
    const service=v.service;
    return{soundProfile:soundFor(town,!!(i%2)),kind:guidewaySound??soundKind(i%2?(town.oppositeTrain||town.train):town.train),speed:v.speed,gain:trainSoundGain(nearest.d,inside),distance:nearest.d,pan:inside?0:Math.max(-.9,Math.min(.9,(dx*right[0]+dz*right[2])/Math.max(12,nearest.d))),phase:service?.stationPhase,dwell:service?.dwell,playing:replay?replayPlaying:trainState.playing};
  });
  soundscape.update(trains,{time:now,dt:Math.min(.1,dt),audible,events:dt<.25});
  canvas.dataset.sound=JSON.stringify({time:now,renderDoor:doorOpening(lastVisual?.service,lastVisual?.speed),enabled:audioEnabled,state:audioContext.state,voices:trains.length,audible,sources:trains.map(t=>({kind:t.kind,speed:t.speed,gain:t.gain,distance:t.distance,phase:t.phase,dwell:t.dwell})),events:soundscape.stats,activeShots:soundscape.activeShots});
}
const crossingSounds=new Set();
function stopSceneAudio(){
 cabHorn.release();
 soundscape?.reset();nextBell=0;
 for(const entry of crossingSounds){clearTimeout(entry.timer);for(const osc of entry.sources){osc.onended=null;try{osc.stop();}catch{}osc.disconnect();}entry.gain.disconnect();}
 crossingSounds.clear();
}
function bell(active){if(!audioContext||audioContext.state!=='running'||!audioEnabled||!active||townSwitchBusy||loadingModel)return;const now=audioContext.currentTime;if(now<nextBell)return;nextBell=now+60/130;const gain=audioContext.createGain(),entry={gain,sources:[],timer:null};crossingSounds.add(entry);gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.38*active,now+.008);gain.gain.exponentialRampToValueAtTime(.001,now+.4);gain.connect(audioGain);for(const f of[700,750]){const osc=audioContext.createOscillator();entry.sources.push(osc);osc.frequency.value=f;osc.connect(gain);osc.start(now);osc.stop(now+.42);osc.onended=()=>osc.disconnect();}entry.timer=setTimeout(()=>{gain.disconnect();crossingSounds.delete(entry);},500)}
const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'];const mime=window.MediaRecorder&&canvas.captureStream?types.find(t=>MediaRecorder.isTypeSupported(t)):null;$('#record').disabled=!mime;$('#record-support').textContent=mime?'録画した動画は、この下で再生・保存できます。':'このブラウザでは動画保存に対応していません。走行再生は利用できます。';
async function startRecord(withAuto=false){
 if(townSwitchBusy||townImportBusy||sceneReading||!mime||recording||recordStarting||loadingModel||paintDraft||trafficSelecting)return false;
 recordRequest={...recordRequest,cancelStart:false};const request={...recordRequest};
 recordStarting=true;$('#record').disabled=true;ui();if(mode==='build')setMode('watch');
 let stream=null;
 try{
  await ensureAudio();
  const decision=recordRequestResult(request,recordRequest);
  if(!decision.start||townSwitchBusy||townImportBusy||sceneReading||paintDraft||mode==='build')return false;
  stream=canvas.captureStream(30);
  if(audioDestination)for(const track of audioDestination.stream.getAudioTracks())stream.addTrack(track.clone());
  canvas.dataset.recordingAudio=String(stream.getAudioTracks().length);
  const chunks=[],recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onerror=()=>{say('録画に失敗しました。もう一度お試しください。');stopRecord()};
  recorder.onstop=()=>{
   stream.getTracks().forEach(t=>t.stop());
   if(videoURL)URL.revokeObjectURL(videoURL);
   const blob=new Blob(chunks,{type:mime});
   if(blob.size){videoURL=URL.createObjectURL(blob);$('#video').src=videoURL;$('#video').hidden=false;$('#download-video').href=videoURL;$('#download-video').download='わたしの街の電車.'+(mime.includes('mp4')?'mp4':'webm');$('#download-video').hidden=false;$('#delete-video').hidden=false;say('動画ができました。「記録」から再生・保存できます。')}
   recording=null;$('#record').hidden=false;$('#stop-record').hidden=true;document.body.classList.remove('recording');ui();
  };
  recorder.start(1000);recording=recorder;recordStart=performance.now();
  if(withAuto&&decision.auto)setAutoCamera(true);
  document.body.classList.add('recording');$('#record').hidden=true;$('#stop-record').hidden=false;
  recordTimer=setTimeout(stopRecord,30000);ui();say('30秒の録画を開始しました。視点を切りかえながら録画できます。');return true;
 }catch(e){stream?.getTracks().forEach(t=>t.stop());say('録画を開始できませんでした。走行再生をご利用ください。');return false;}
 finally{recordStarting=false;$('#record').disabled=!mime;ui();}
}
$('#delete-video').onclick=async()=>{
 if(recording||recordStarting||!videoURL)return;const expected=videoURL;
 if(!await confirmTrainChange('この画面の動画を消しますか？ファイルに保存した動画は残ります。'))return;
 if(recording||recordStarting||videoURL!==expected)return;
 const video=$('#video');video.pause();video.removeAttribute('src');video.load();video.hidden=true;
 URL.revokeObjectURL(videoURL);videoURL=null;$('#download-video').removeAttribute('href');$('#download-video').hidden=true;$('#delete-video').hidden=true;$('#record-time').textContent='';say('この画面の動画を消しました。');
};
function stopRecord(){clearTimeout(recordTimer);recordTimer=null;if(recording?.state==='recording')recording.stop()}
function visualState(){const offsets=carParts.map(c=>({bogies:c.bogieOffsets,bodyAnchor:c.bodyAnchor})),cars=isMountain(town)?mountainPoses(trainState,carLength,offsets,isLocomotive(town.train)):isIntercity(town)&&intercityFleet?intercityFleet.mainCars(trainState,offsets,effectiveFormation(town)):trainPoses(route,trainState,effectiveFormation(town),carLength,offsets),lead=(isMountain(town)?mountainLead(cars,trainState):cars[0])||{body:[0,0,0],front:[0,0,0],back:[0,0,0]};const v={islandFlightTime:isIsland(town)?simulationTime:undefined,mountainSignals:isMountain(town)?[0,1].map(i=>{const owner=mountainControl.owners?.[i];return owner==null?0:[trainState,oppositeState][owner].trip;}):undefined,mountainSignal:isMountain(town)?(mountainControl.owner==null?0:([trainState,oppositeState][mountainControl.owner].trip)):undefined,trafficTime,body:lead.body,front:lead.front,back:lead.back,cars,speed:trainState.speed,service:{mountain:isMountain(town),dir:trainState.dir,facing:isMountain(town)?trainState.facing:effectiveFormation(town).locomotiveDirection,stationPhase:trainState.stationPhase,dwell:trainState.dwell,dwellDuration:trainState.dwellDuration},gates:gateRows.map(g=>({uid:g.uid,angle:g.angle,alarm:g.alarm}))};if(hasSecondTrain()&&oppositeState){const offsets=oppositeParts.map(c=>({bogies:c.bogieOffsets,bodyAnchor:c.bodyAnchor})),cars=isMountain(town)?mountainPoses(oppositeState,oppositeCarLength,offsets,isLocomotive(town.oppositeTrain||town.train)):trainPoses(oppositeRoute,oppositeState,effectiveFormation(town,true),oppositeCarLength,offsets),lead=isMountain(town)?mountainLead(cars,oppositeState):cars[0];v.opposite={...lead,cars,speed:oppositeState.speed,service:{mountain:isMountain(town),dir:oppositeState.dir,facing:isMountain(town)?oppositeState.facing:effectiveFormation(town,true).locomotiveDirection,stationPhase:oppositeState.stationPhase,dwell:oppositeState.dwell,dwellDuration:oppositeState.dwellDuration}};}if(isIntercity(town)&&intercityFleet){const [local,...returns]=intercityFleet.visual(carParts.map(c=>({bogies:c.bogieOffsets,bodyAnchor:c.bodyAnchor})),oppositeParts.map(c=>({bogies:c.bogieOffsets,bodyAnchor:c.bodyAnchor})));v.opposite=local;v.returnTrains=returns;}return v;}
function mixService(a,b,t){return a?.stationPhase==='dwell'&&b?.stationPhase==='dwell'&&Number.isFinite(a.dwell)&&Number.isFinite(b.dwell)?{...a,dwell:a.dwell+(b.dwell-a.dwell)*t}:a;}
function mixAngle(a,b,t){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t}
function replayVisual(){const fs=replay.frames;let i=Math.max(0,Math.min(fs.length-2,Math.floor(replayTime*10)));while(i<fs.length-2&&fs[i+1].t<replayTime)i++;while(i>0&&fs[i].t>replayTime)i--;const a=fs[i],b=fs[i+1],t=Math.max(0,Math.min(1,(replayTime-a.t)/(b.t-a.t))),mixPose=(x,y)=>[x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,mixAngle(x[2],y[2],t),...((x.length===5||y.length===5)?[(x[3]||0)+((y[3]||0)-(x[3]||0))*t,(x[4]||0)+((y[4]||0)-(x[4]||0))*t]:[])];const v={islandFlightTime:Number.isFinite(a.islandFlightTime)&&Number.isFinite(b.islandFlightTime)?a.islandFlightTime+(b.islandFlightTime-a.islandFlightTime)*t:replayTime,mountainSignals:a.mountainSignals,mountainSignal:a.mountainSignal,trafficTime:Number.isFinite(a.trafficTime)&&Number.isFinite(b.trafficTime)?a.trafficTime+(b.trafficTime-a.trafficTime)*t:replayTime,speed:a.speed+(b.speed-a.speed)*t,gates:a.gates,service:mixService(a.service,b.service,t)};for(const key of['body','front','back'])v[key]=mixPose(a[key],b[key]);if(Array.isArray(a.cars)&&Array.isArray(b.cars)&&a.cars.length===b.cars.length)v.cars=a.cars.map((c,n)=>({body:mixPose(c.body,b.cars[n].body),front:mixPose(c.front,b.cars[n].front),back:mixPose(c.back,b.cars[n].back),tail:c.tail}));if(a.opposite&&b.opposite&&a.opposite.cars.length===b.opposite.cars.length)v.opposite={service:mixService(a.opposite.service,b.opposite.service,t),speed:a.opposite.speed+(b.opposite.speed-a.opposite.speed)*t,cars:a.opposite.cars.map((c,n)=>({body:mixPose(c.body,b.opposite.cars[n].body),front:mixPose(c.front,b.opposite.cars[n].front),back:mixPose(c.back,b.opposite.cars[n].back),tail:c.tail}))};if(a.returnTrains&&b.returnTrains)v.returnTrains=a.returnTrains.map((r,k)=>({speed:r.speed+(b.returnTrains[k].speed-r.speed)*t,service:mixService(r.service,b.returnTrains[k].service,t),cars:r.cars.map((c,n)=>({body:mixPose(c.body,b.returnTrains[k].cars[n].body),front:mixPose(c.front,b.returnTrains[k].cars[n].front),back:mixPose(c.back,b.returnTrains[k].cars[n].back),tail:c.tail}))}));return v}
function placeCars(partsList,cars){for(let i=0;i<partsList.length;i++){const item=partsList[i],state=cars[i]||cars[0],turn=state.tail?Math.PI:0;item.setDestination?.(Math.cos(cars[0].body[2])>0);animateSteamMotion(item.motion,state.body);for(const [name,group] of Object.entries(item.parts)){const q=name==='body'?state.body:name==='bogieFront'?(state.front||state.body):(state.back||state.body),offset=name==='bogieFront'?item.bogieOffsets[0]:name==='bogieBack'?item.bogieOffsets[1]:0;const angle=q[2]+turn;const pitch=(q[4]||0)*(state.tail?-1:1);group.rotation.set(0,angle,pitch,'YXZ');group.position.set(q[0]-offset*Math.cos(angle)*Math.cos(pitch),(q[3]||0)-offset*Math.sin(pitch),-q[1]+offset*Math.sin(angle)*Math.cos(pitch));}}
  partsList[0]?.updateGangway?.();
}
function applyVisual(v){lastVisual=v;const freightView=(viewTrain===1?town.oppositeTrain:town.train)==='freight';const platformLabel=freightView?'ホームから見る':'ホームのドア';$('#station-doors-view span').textContent=platformLabel;if(camMode==='station-doors')$('#view-name').textContent=platformLabel;const canViewOther=hasSecondTrain()&&!!v.opposite?.cars?.length;$("#view-train").hidden=!canViewOther;if(!canViewOther&&viewTrain===1){viewTrain=0;$("#view-train").value="0";scenicLook=null;autoElapsed=0;autoPhase=null;}traffic.update(Number.isFinite(v.trafficTime)?v.trafficTime:trafficTime,trafficEnabled?roadFrame(v.trafficTime??trafficTime):null);const {body}=v;const cars=v.cars||[{body,front:v.front,back:v.back,tail:false}];placeCars(carParts,cars);animateDoors(carParts,cars,v,(isStationLoop(town)||isMountain(town)||activeDistrict||town.intercityStations===1||freeStops.length>0)&&!paintDraft,isSuspended(town)?suspendedPlatform(body):isStationLoop(town)?(-body[1]-5.3*Math.cos(body[2])):isMountain(town)?mountainPlatformCenter(v):town.intercityStations===1?platformZ(v.body):freeStops.length?freeDoorPlatform(v):5);if(freeStops.length){const plat=freeDoorPlatform(v);canvas.dataset.freeStation=JSON.stringify({door:doorOpening(v.service,v.speed),sides:cars.map(c=>typeof plat==='function'?plat(c).side:0),phase:v.service?.stationPhase??null,dwell:v.service?.dwell??null,at:freeStationOf(cars,freeStopGeometries)?.name||null,stops:freeStops.map(x=>x.name),camera:camMode});}else if(canvas.dataset.freeStation)delete canvas.dataset.freeStation;if(hasSecondTrain()&&v.opposite){placeCars(oppositeParts,v.opposite.cars);animateDoors(oppositeParts,v.opposite.cars,v.opposite,!paintDraft,isSuspended(town)?suspendedPlatform(v.opposite.cars[0].body):(isIsland(town)||isTokyo(town))?(-v.opposite.cars[0].body[1]-(isIsland(town)?4.55:6.1)*Math.cos(v.opposite.cars[0].body[2])):isMountain(town)?mountainPlatformCenter(v.opposite):town.intercityStations===1?platformZ(v.opposite.cars[0].body):5);}for(let i=0;i<returnModels.length;i++){const m=returnModels[i],r=v.returnTrains?.[i];m.root.visible=!!r&&!paintDraft&&isIntercity(town);if(r){placeCars(m.cars,r.cars);animateDoors(m.cars,r.cars,r,town.intercityStations===1&&!paintDraft,platformZ(r.cars[0].body));}}oppositeRoot.visible=hasSecondTrain()&&!!v.opposite&&(!paintDraft||paintTarget==="other");const inside=['left','right','front'].includes(camMode)&&mode!=='build',view=trainView(v,viewTrain===1),viewType=viewTrain===1?town.oppositeTrain:town.train,viewBody=passengerView(autoCamera&&isSuspended(town)?movingView(view):view,viewType,camMode).body,viewTram=viewType==='tram',viewSteam=isLocomotive(viewType);if(inside&&hideViewedTrain(viewType,camMode)&&viewTrain===1)oppositeRoot.visible=false;trainRoot.visible=!(inside&&hideViewedTrain(viewType,camMode)&&viewTrain===0)&&route?.length>0&&(!paintDraft||paintTarget==="main");cabin.visible=inside&&hideViewedTrain(viewType,camMode)&&route?.length>0;cabin.scale.set(viewTram?.62:1,viewTram?.92:1,viewTram?.78:1);cabin.position.set(viewBody[0],viewBody[3]||0,-viewBody[1]);cabin.rotation.set(0,viewBody[2],viewBody[4]||0,'YXZ');
  for(const g of gateRows){const s=v.gates.find(x=>x.uid===g.uid)||g;for(const gate of g.gates)gate.obj.rotation.x=gate.s*s.angle*1.42;g.lamps.forEach((l,i)=>l.material.color.set(s.alarm&&Math.floor(performance.now()/600)%2===i%2?'#ff4932':'#461c15'));}const active=crossingAlarm(v,isMountain(town));$('#crossing-alert').hidden=!active;const sources=isMountain(town)?(active?[[485,174,-723]]:[]):gateRows.filter(g=>(v.gates.find(x=>x.uid===g.uid)||g).alarm).map(g=>g.group?[g.group.position.x,2,g.group.position.z]:[185,2,-281]);const audible=active?crossingAudibility(camera.position.toArray(),sources):0;bell(mode!=='build'&&(!replay||replayPlaying)?audible:0);canvas.dataset.crossingAudio=JSON.stringify({active,audible,enabled:audioEnabled,running:audioContext?.state==='running',lastTone:nextBell?nextBell-60/130:null});
}
function prepareCameraObstacles(){
 directorObstacles=isIntercity(town)?countryObstacles(town.intercityStations===1):[];
 if(isIntercity(town)&&town.intercityStations===1)for(const x of[300,5700])for(const z of[-4.5,13.5]){
  directorObstacles.push({min:[x-122,13.04,z-2.9],max:[x+122,13.26,z+2.9]});
  directorObstacles.push({min:[x-17,12.4,z-1.5],max:[x+17,12.6,z+1.5]});
 }
 if(activeDistrict){directorObstacles.push({min:[121,4.24,2.1],max:[299,4.46,7.9]},{min:[205,7.5,-23],max:[215,11.35,13]});}
 for(const prop of town.props){const spec=buildingSpecs[prop.type]||(prop.type==='tree'?{w:6,d:6,h:13}:null);if(!spec)continue;const angle=prop.pose[2],scale=prop.scale||1,w=(Math.abs(Math.cos(angle))*spec.w+Math.abs(Math.sin(angle))*spec.d)*scale/2,d=(Math.abs(Math.sin(angle))*spec.w+Math.abs(Math.cos(angle))*spec.d)*scale/2;
  directorObstacles.push({min:[prop.pose[0]-w,-.5,-prop.pose[1]-d],max:[prop.pose[0]+w,(templates.get(prop.type)?.height||spec.h||spec.hInput)*scale,-prop.pose[1]+d]});}
}
function measureCameraViewport(){
 const rect=canvas.getBoundingClientRect(),blocked=[];
 for(const el of $$('.scene-label,#stats,#service-info,#crossing-alert,#toast,.zoom,.floating-panel,#file-menu')){if(el.hidden||getComputedStyle(el).display==='none')continue;const r=el.getBoundingClientRect();blocked.push({left:r.left-rect.left-3,right:r.right-rect.left+3,top:r.top-rect.top-3,bottom:r.bottom-rect.top+3});}
 directorViewport=safeViewport(rect.width,rect.height,blocked);return rect.width+'x'+rect.height;
}
function cameraDirectorTelemetry(){const sorted=[...cameraWorkSamples].sort((a,b)=>a-b);return{shotId:director.shotId,reason:director.reason,held:director.held,simulationTime,time:director.time,traversalId:director.traversalId,section:director.section,used:director.used,anchor:director.candidate?.anchor||null,axis:director.candidate?.axis??null,metrics:director.candidate?.metrics||null,subject:director.candidate?.subject||null,rejected:director.rejected,safeArea:directorViewport?.safe,cut:director.cut,history:director.history,cpuP95:sorted[Math.floor(sorted.length*.95)]??null};}
function cameraCandidateNeeds(state,orientationChanged,freshPlan=false){
 const used=freshPlan?[]:state.used,active=state.candidate;
 return{hero:!used.includes('hero')||(orientationChanged&&active?.id==='hero'),pass:!used.includes('pass')||(orientationChanged&&active?.id==='pass'),landscape:!used.includes('landscape')||!!state.pending||(orientationChanged&&!!active?.subject)};
}
function updateAutoCamera(){
 if(!autoCamera)return;
 const workStart=performance.now();
 const v=movingView(trainView(lastVisual,viewTrain===1)),valid=!!v?.cars?.length&&v.cars.every(c=>c.body?.every(Number.isFinite)),time=replay?replayTime:simulationTime;
 if(!valid){director=stepDirector(director,{enabled:true,time,trainId:viewTrain,direction:1,routeId:townStore.active,epoch:directorEpoch,visualAvailable:false});directorPose=null;if(camMode!=='front')setCamera('front',true);return;}
 if(isIsland(town)||isTokyo(town)||isSuspended(town)){
  const island=isIsland(town),tokyo=isTokyo(town);
  const shot=island?islandTourShot(v,camera.aspect):tokyo?tokyoTourShot(v,time):suspendedShot(v,camera.aspect);
  if(director.shotId!==shot.id||directorCut<0){
   director={...director,shotId:shot.id,mode:shot.mode,reason:island?'island-location':tokyo?'tokyo-location':'suspended-location',cut:director.cut+1};
   directorCut=director.cut;autoRenderedPose=null;setCamera(shot.mode,true);applyVisual(lastVisual);
   if(shot.label)$('#view-name').textContent=shot.label;
  }
  directorPose=shot.pose;
  return;
 }
 if(isMountain(town)){
  const selected=trainView(lastVisual,viewTrain===1),next=stepMountainDirector(director,{v:{...v,service:selected.service},time,identity:'mountain/'+viewTrain+'/'+directorEpoch+'/'+(replay?'replay':'live'),aspect:camera.aspect,carLength:viewTrain===1?oppositeCarLength:carLength,traffic:mountainRoadFrame(lastVisual.trafficTime??trafficTime),loading:loadingModel||townSwitchBusy||townImportBusy||sceneReading});
  director=next;directorPose=next.pose||null;
  if(director.cut!==directorCut){directorCut=director.cut;directorFollow=null;autoRenderedPose=null;setCamera(director.mode,true);applyVisual(lastVisual);}
  return;
 }
 const intercity=isIntercity(town),countrySafe=intercity&&countryAvailable(v),g=countryGeometry(v),type=viewTrain===1?(town.oppositeTrain||town.train):town.train,maxSpeed=intercity?intercityTrainSpeed(type):15,profile=CONSIST?.trains?.[type]?.paintProfile||{},length=viewTrain===1?oppositeCarLength:carLength;
 const selected=trainView(lastVisual,viewTrain===1),routeId=townStore.active+'/'+(replay?'replay':'live'),occupied=intercity&&v.cars.some(c=>c.body[0]>1450&&c.body[0]<4550&&Math.abs(Math.sin(c.body[2]))<.01),stationVisible=(isMountain(town)&&selected.service?.stationPhase==='dwell')||(activeDistrict&&v.cars.some(c=>Math.abs(c.body[1])<16&&c.body[0]>75&&c.body[0]<345))||(town.intercityStations===1&&v.cars.some(c=>stationAt(c.body)))||(freeStops.length>0&&!!freeStationOf(v.cars,freeStopGeometries));
 const localTown=!intercity&&!isStationLoop(town)&&!isMountain(town);
 const freshPlan=director.identity!==[viewTrain,selected.service?.dir||g.dir,routeId].join('/')||director.epoch!==directorEpoch||(occupied&&!director.occupied);
 const orientation=canvas.clientWidth+'x'+canvas.clientHeight,orientationChanged=director.orientation!==null&&director.orientation!==orientation,shouldEvaluate=time-directorCandidateTime>=.2||!directorCandidates||orientationChanged||freshPlan;
 if(shouldEvaluate){
  if(!directorCandidates)prepareCameraObstacles();
  directorViewportKey=measureCameraViewport();directorCandidateTime=time;
  const options={viewport:directorViewport,carLength:length,carHeight:type==='tram'?3.1:3.3,maxSpeed,profile,tram:type==='tram',phase:lightingPhase,obstacles:directorObstacles,reducedMotion:reducedCameraMotion.matches,locomotive:isLocomotive(type),atStation:activeDistrict?v.cars.some(c=>Math.abs(c.body[1])<24&&c.body[0]>90&&c.body[0]<330):!!stationAt(v.body)};
  const needs=cameraCandidateNeeds(director,orientationChanged,freshPlan),active=director.candidate,reframePass=!freshPlan&&orientationChanged&&active?.id==='pass';
  const hero=countrySafe&&needs.hero?heroCandidate(v,options):{},pass=countrySafe&&needs.pass?passCandidate(v,reframePass?{...options,anchorAxis:active.axis,reframe:active}:options):{},land=countrySafe&&needs.landscape?landscapeCandidates(v,options):{candidates:[],rejected:[]},departure=!countrySafe&&(!intercity||stationVisible||(orientationChanged&&active?.localPosition))?serviceExteriorCandidate(v,options):null;
  directorCandidates={localWindow:localTown?localSceneryWindow(v.body,town.props):null,hero:hero.id?{...hero,minimum:reducedCameraMotion.matches?8:5,duration:reducedCameraMotion.matches?8:5}:null,pass:pass.id?pass:null,departure:departure?.id?departure:null,landscapes:land.candidates,rejected:[hero.rejected,pass.rejected,departure?.rejected,...land.rejected].filter(Boolean),options};
 }
 const options={...directorCandidates.options,phase:lightingPhase},active=director.candidate;
 let reframed=null;
 if(orientationChanged&&active){
  if(active.id==='hero')reframed=directorCandidates.hero;
  else if(active.id==='pass')reframed=directorCandidates.pass;
  else if(active.subject)reframed=directorCandidates.landscapes.find(c=>c.id===active.id)||null;
  else if(active.localPosition)reframed=directorCandidates.departure?{...directorCandidates.departure,id:active.id}:null;
 }
 const safeOptions=loadingModel&&autoRenderedPose?{...options,poseOverride:autoRenderedPose}:options;
 const checked=orientationChanged?(reframed||null):active,exterior=checked?.id==='hero'||checked?.id==='pass',activeUnsafe=!!checked&&(exterior?!countryShotSafe(v,checked,safeOptions):checked.subject?!landscapeSafe(v,checked,safeOptions):checked.localPosition?!serviceExteriorSafe(v,checked,safeOptions):false);
 const cross=activeDistrict?pedestrianCrossingView(v,length):null;
 const straight=v.cars.some(c=>c.body[1]>270&&c.body[1]<301&&Math.abs(Math.cos(c.body[2]))>.9),front=g.dir*(v.cars[0].body[0]-185)+length/2,rear=g.dir*(v.cars.at(-1).body[0]-185)-length/2;
 const next=stepDirector(director,{enabled:true,time,trainId:viewTrain,direction:selected.service?.dir||g.dir,routeId,epoch:directorEpoch,orientation,visualAvailable:true,running:replay?replayPlaying:trainState.playing,loading:loadingModel||townSwitchBusy||townImportBusy||sceneReading,speed:v.speed,intercity,localTown,localShort:localTown&&!!route&&!route.closed&&route.length<120,locked:intercity&&intercityZone(v.body).locked,countrySafe,occupied,section:g.z>-400?'outbound':'inbound',exterior,activeUnsafe,reframed,stationVisible,servicePhase:selected.service?.stationPhase,doorClosing:selected.service?.stationPhase==='dwell'&&selected.service.dwell<2.5, crossingActive:!!cross&&straight&&front>=-105&&rear<6&&cross.phase!=='idle',crossingComplete:!straight||rear>=6,passComplete:active?.id==='pass'&&countryExtent(v,length).rear>=active.axis,remaining:countrySafe?countryRemaining(v,maxSpeed,length):0,...directorCandidates,reducedMotion:reducedCameraMotion.matches});
 director=next;
 if(director.cut!==directorCut){directorCut=director.cut;directorFollow=null;autoRenderedPose=null;setCamera(director.mode||'front',true);applyVisual(lastVisual);}
 const candidate=director.candidate;
 directorPose=candidate?.id==='hero'||candidate?.id==='pass'?countryShotPose(v,candidate):candidate?.subject?landscapePose(v,candidate,profile):candidate?.localPosition?serviceExteriorPose(v,candidate):null;
 if(directorPose){
  if(!directorFollow)directorFollow={position:[...directorPose.position],target:[...directorPose.target]};
  else{const amount=1-Math.exp(-Math.min(.1,cameraFrameDelta)*10);for(const key of['position','target'])directorFollow[key]=directorFollow[key].map((x,i)=>x+(directorPose[key][i]-x)*amount);}
  directorPose={...directorPose,position:directorFollow.position,target:directorFollow.target};
 }
 cameraWorkSamples.push(performance.now()-workStart);if(cameraWorkSamples.length>600)cameraWorkSamples.shift();
}
function stationDoorCameraPose(){
 if(freeStops.length){const visual=trainView(lastVisual,false),g=freeStationOf(visual?.cars,freeStopGeometries);
  // ドアに寄るのは止まっている間だけ。走り出したら駅全体の構図へ戻す（ホームの外の線路の上にカメラが出ないように）。
  if(g&&visual?.service?.stationPhase==='dwell'&&Math.abs(visual.speed||0)<.01){measureCameraViewport();// ホームの中心に近い車両から選ぶ（長い編成で、ホームのはしのドアに寄らないように）。
   const sets=carParts.map(c=>c.doorTargets||[]),order=visual.cars.map((c,i)=>[Math.abs(toLocal(g,c.body[0],c.body[1])[0]),i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
   const shot=mountainDoorShot({...visual,cars:order.map(i=>visual.cars[i])},order.map(i=>sets[i]||[]),{platform:car=>freeDoorSide(car,g),viewport:directorViewport});if(shot)return shot;}return freeStationView(freeViewStation(visual),camera.aspect<1);}
 if(isMountain(town)){const other=viewTrain===1,visual=trainView(lastVisual,other);measureCameraViewport();return mountainDoorShot(visual,(other?oppositeParts:carParts).map(c=>c.doorTargets||[]),{platform:mountainPlatformCenter(visual),viewport:directorViewport});}
 const other=viewTrain===1,visual=trainView(lastVisual,other),type=other?(town.oppositeTrain||town.train):town.train,elevated=town.intercityStations===1,centerX=elevated?STATIONS.reduce((a,b)=>Math.abs(a.x-visual.body[0])<Math.abs(b.x-visual.body[0])?a:b).x:210,platform=elevated?platformZ(visual.body):5,sets=(other?oppositeParts:carParts).map(c=>c.doorTargets||[]);
 const key=[loadTicket,viewTrain,type,centerX,visual.service?.dir,visual.service?.facing].join('/'),orientation=canvas.clientWidth+'x'+canvas.clientHeight,body=visual.body.join(','),overlays=$$('.floating-panel,#file-menu').filter(el=>!el.hidden).map(el=>el.id+':'+el.offsetWidth+':'+el.offsetHeight).join('/');
 if(stationDoorCache?.key===key&&stationDoorCache.orientation===orientation&&stationDoorCache.body===body&&stationDoorCache.overlays===overlays)return stationDoorCache.shot;
 measureCameraViewport();const selection=stationDoorCache?.key===key?stationDoorCache.shot?.selection:null,shot=platformDoorShot(visual,sets,{centerX,platform,elevated,steam:type==='steam',viewport:directorViewport,selection});
 stationDoorCache={key,orientation,body,overlays,shot};canvas.dataset.doorCamera=JSON.stringify({source:'prepared-door-leaves',type,train:viewTrain+1,selection:shot?.selection||null,angle:shot?.angle||null,position:shot?.position||null,target:shot?.target||null,door:shot?.door||null,fov:shot?.fov||null,geometryDoors:sets.map(s=>s.length)});return shot;
}
const limitedCabProfiles={
 'limited-classic':{cabX:8.55,cabHeight:2.68},'limited-stream':{cabX:7.15,cabHeight:2.55},'limited-panorama':{cabX:5.95,cabHeight:4.03}
};
function moveCamera(v){camera.far=(isIntercity(town)||isIsland(town)||isSuspended(town))&&!paintDraft?8000:3000;districtRoot.visible=!paintDraft;townRoot.visible=!paintDraft;traffic.root.visible=trafficEnabled&&!paintDraft;const other=paintDraft?paintTarget==='other':viewTrain===1;v=trainView(v,other);if(autoCamera||camMode==='panorama')v=movingView(v);v=passengerView(v,other?town.oppositeTrain:town.train,camMode);const p=v?.body||[0,0,0];const world=(x,y,z)=>new T.Vector3(x,y,z).applyEuler(new T.Euler(0,p[2],p[4]||0,'YXZ')).add(new T.Vector3(p[0],p[3]||0,-p[1]));const cameraType=other?town.oppositeTrain:town.train,profile=limitedCabProfiles[cameraType]||(cameraType==='steam'&&windowMode(camMode)?null:CONSIST?.trains?.[cameraType]?.paintProfile),tram=cameraType==='tram',viewLength=other?oppositeCarLength:carLength;const tramSide=((v?.service?.dir??trainState.dir)<0?1:-1)*(other?-1:1),normalSide=other?Math.sign(Math.cos(p[2]))||1:1;let pos,target;
  if(isMountain(town)){orbit.yaw=Math.max(.25,Math.min(1.35,orbit.yaw));orbit.pitch=Math.max(.35,orbit.pitch);}
  if(camMode==='orbit'||mode==='build'){const pitch=mode==='build'?1.55:orbit.pitch;pos=new T.Vector3(orbit.x+Math.cos(orbit.yaw)*Math.cos(pitch)*orbit.distance,Math.sin(pitch)*orbit.distance,-orbit.y+Math.sin(orbit.yaw)*Math.cos(pitch)*orbit.distance);target=new T.Vector3(orbit.x,0,-orbit.y);camera.fov=48;}
  else if(camMode==='bridge-town'&&isMountain(town)){const shot=mountainSceneryCamera(v,{carLength:viewLength,aspect:camera.aspect,height:mountainSurfaceHeight});pos=new T.Vector3(...shot.position);target=new T.Vector3(...shot.target);camera.fov=shot.fov;}
  else if(camMode==='traffic'){const view=traffic.camera(isMountain(town)?mountainTrafficVehicle:trafficVehicle,camera.aspect<1,roadLook.value);pos=view?.position||world(30,20,10);target=view?.target||world(0,2,0);camera.fov=52;}
  else if(camMode==='station'&&isSuspended(town)){
    const s=suspendedStations.reduce((a,b)=>Math.abs(p[0]-a.s)<Math.abs(p[0]-b.s)?a:b);
    const q=lineFor({dir:1}).sample(s.s);
    const city=s===suspendedStations[0],coast=s===suspendedStations.at(-1);
    const offset=city?[65,7,-15]:coast?[-41,10,18]:[-20,3.1,4.2];
    pos=new T.Vector3(q[0]+offset[0],q[3]+offset[1],-q[1]+offset[2]);
    target=new T.Vector3(q[0]+(coast?17:3),q[3]+(city?4:2.7),-q[1]);camera.fov=camera.aspect<1?67:56;
  }
  else if(camMode==='station'&&isIsland(town)){
    const route=other?islandOuterRoute:islandRoute,stops=other?islandOuterStations:islandStations;
    let index=(other?oppositeState:trainState)?.station??0;
    if(replay){
      let closest=Infinity;
      stops.forEach((station,i)=>{const q=route.sample(station.s),gap=Math.hypot(q[0]-p[0],q[1]-p[1]);if(gap<closest){closest=gap;index=i;}});
    }
    const stop=route.sample(stops[index].s),side=Math.cos(stop[2]);
    pos=new T.Vector3(stop[0]+side*32,23,-stop[1]+42);target=new T.Vector3(stop[0],13,-stop[1]-11);camera.fov=camera.aspect<1?65:52;if(islandStations[index].name==='未来島空港'){
    pos.set(stop[0]-58,45,125);target.set(stop[0],10,-7);camera.fov=camera.aspect<1?66:49;
  }}
  else if(camMode==='station'&&isTokyo(town)){const portrait=camera.aspect<1;if(undergroundStationAt(p)){pos=world(-14.8,2.78,-2.55);target=world(-5.2,2.72,-9.25);camera.fov=portrait?75:66;}else{pos=new T.Vector3(-78,portrait?81:65,194);target=new T.Vector3(0,22,71);camera.fov=portrait?68:58;}}
  else if(camMode==='station'&&freeStops.length){const g=freeViewStation(v),view=freeStationView(g,camera.aspect<1);pos=new T.Vector3(...view.position);target=new T.Vector3(...view.target);camera.fov=view.fov;}
  else if(camMode==='station'){const mobile=camera.aspect<1;pos=new T.Vector3(mobile?287:300,mobile?85:48,mobile?128:86);target=new T.Vector3(205,2,-10);camera.fov=mobile?54:46;}
  else if(camMode==='crossing-person'||camMode==='station-doors'){const view=camMode==='crossing-person'?pedestrianCrossingView(movingView(v),viewLength):platformDoorView(tram,other,hasNamedParts(cameraType)?{visual:v,doorX:cameraType==='steam'?8.1:-10.7,carLength:viewLength,skipFirst:cameraType==='steam'}:null);pos=new T.Vector3(...view.position);if(autoCamera&&camMode==='crossing-person')pos.z=other?-305:-272;target=new T.Vector3(...view.target);camera.fov=view.fov;}
  else if(camMode==='crossing'){pos=new T.Vector3(215,12,-319);target=new T.Vector3(185,1,-281);camera.fov=50;}
  else if(camMode==='follow'){const f=camera.aspect<1?1.4:1;pos=world((tram?-16:-24)*f,(tram?8:11)*f,tram?8*tramSide:8*normalSide);target=world(tram?0:3,1.5,0);camera.fov=50;}
  else if(camMode==='paint-face'){const distance=Math.max(7,2.3/(Math.tan(Math.PI*20/180)*camera.aspect));pos=world(viewLength/2+distance,2.1,0);target=world(viewLength/2,2.1,0);camera.fov=40;}else if(camMode==='paint-left'||camMode==='paint-right'){const distance=Math.max(12,(viewLength*.6)/(Math.tan(Math.PI*24/180)*camera.aspect));pos=world(0,4.1,(camMode==='paint-left'?1:-1)*distance);target=world(0,2.1,0);camera.fov=48;}else if(camMode==='front-exterior'){const f=camera.aspect<1?1.3:1;pos=world(viewLength/2+(tram?13:17)*f,(tram?5.5:7)*f,(tram?9*tramSide:10*normalSide)*f);target=world(tram?1:3,2,0);camera.fov=48;}
  else if(camMode==='trackside'){pos=trackside;target=world(0,2,0);camera.fov=46;}
  else if(camMode==='panorama'){pos=world(7.45,2.22,0);target=world(60,2.20,0);camera.fov=68;}
  else if(camMode==='front'){pos=world(profile?.cabX??(tram?5.45:8.8),profile?.cabHeight??(tram?2.25:2.45),profile?.cabSide??0);target=world(35,profile?.cabHeight??2.1,profile?.cabSide??0);camera.fov=66;}
  else{const side=camMode==='left'?-1:1;const portrait=camera.aspect<1;pos=world(profile?.passengerX??(tram?.7:1.1),profile?.passengerHeight??(tram?2.13:2.32),side*(profile?.passengerSide??.06));const ahead=autoCamera&&director.shotId?.startsWith('local-window-')?16:(portrait?6.9:2.6);target=world((profile?.passengerX??1.1)+ahead,profile?.passengerHeight??(tram?2.1:2.28),side*20);camera.fov=62;}
  if(town.intercityStations===1&&camMode==='station'){const sx=(p[0]<3000?300:5700),f=camera.aspect<1?1.7:1;pos=sx===5700?new T.Vector3(sx,125*f,-210*f):new T.Vector3(sx+190*f,135*f,160*f);target=new T.Vector3(sx,sx===300?12:7,sx===300?-120:4.5);camera.fov=52;}if(autoCamera&&camMode==='front-exterior'){const f=camera.aspect<1?1.4:1;pos=world(viewLength/2+26*f,18*f,8);target=world(0,2,0);camera.fov=48;}
  if(activeDistrict&&!autoCamera&&!paintDraft&&camMode==='front-exterior'&&(isLimitedExpress(cameraType)||isExpress(cameraType))){
    // Below the platform canopy, the first departure shows the selected train's nose.
    pos=world(viewLength/2+17,3.25,5.3);target=world(2,2.05,0);
  }
  if(isLocomotive(cameraType)&&!paintDraft&&camMode==='front-exterior'&&Math.abs(p[1])<24){const station=isIntercity(town)?stationAt(p):p[0]>90&&p[0]<330;if(station){pos=world(viewLength/2+16,3.4,-3.8);target=world(3,2.2,0);camera.fov=48;}}
  if(cameraType==='freight'&&camMode==='station-doors'&&!freeStops.length){const view=freightPlatformView(v,town.intercityStations===1,other,camera.aspect<1);pos=new T.Vector3(...view.position);target=new T.Vector3(...view.target);camera.fov=view.fov;}
  else if(camMode==='station-doors'&&!paintDraft){const view=stationDoorCameraPose()||(town.intercityStations===1?stationCamera(v,viewLength,camera.aspect<1,cameraType==='steam'):null);if(view){pos=new T.Vector3(...view.position);target=new T.Vector3(...view.target);camera.fov=view.fov;}}
  if(paintDraft&&tram&&camMode==='front-exterior'){const f=camera.aspect<1?1.4:1;pos=world(11*f,6*f,-12*f);target=world(0,2.6,0);camera.fov=48;}
  if(isIntercity(town)&&!paintDraft&&countryAvailable(movingView(v))&&['front-exterior','trackside'].includes(camMode)){const shot=countryCamera(movingView(v),camMode,trackside.toArray(),camera.aspect<1);pos=new T.Vector3(...shot.position);target=new T.Vector3(...shot.target);camera.fov=shot.fov;}
  if(autoCamera&&directorPose){pos=new T.Vector3(...directorPose.position);target=new T.Vector3(...directorPose.target);camera.fov=directorPose.fov;}
  if(isSuspended(town)&&['front-exterior','follow'].includes(camMode)){
    const ahead=camMode==='front-exterior',factor=camera.aspect<1?1.18:1;
    pos=world((ahead?16.8:-26)*factor,ahead?2.85:3.65,(ahead?-7.6:-10)*factor);target=world(ahead?3.1:-4,2.65,0);camera.fov=camera.aspect<1?62:ahead?46:51;
  }
  if(isSuspended(town)&&p[0]>suspendedPortal[0]&&p[0]<suspendedPortal[1]&&['follow','front-exterior','trackside'].includes(camMode)){pos=world(10,3.5,2.7);target=world(0,2,0);camera.fov=66;}
  if(isTokyo(town)&&!paintDraft&&!['orbit','station'].includes(camMode)&&p[3]<8&&!['left','right','front','panorama'].includes(camMode)){pos=world(-viewLength*.65,3.9,2.4);target=world(12,2,0);camera.fov=63;}
  const steamDoorFill=!paintDraft&&cameraType==='steam'&&camMode==='station-doors'&&mode!=='build';
  paintLight.visible=!!paintDraft||steamDoorFill;paintLight.intensity=paintDraft?2.4:1.5;
  if(paintDraft){paintLight.position.copy(pos).add(new T.Vector3(0,3,0));paintLight.target.position.copy(target);}
  else if(steamDoorFill){paintLight.position.copy(pos).add(new T.Vector3(0,.8,0));if(stationDoorCache?.shot?.door?.center)paintLight.target.position.fromArray(stationDoorCache.shot.door.center);else paintLight.target.position.copy(target);}
  canvas.dataset.doorLight=JSON.stringify({active:steamDoorFill,visible:paintLight.visible,intensity:paintLight.intensity,paint:!!paintDraft,type:cameraType,mode:camMode});
  const scenicNow=performance.now();if(camMode==='crossing-person'){if(!scenicLook)scenicLook=target.clone();else scenicLook.lerp(target,1-Math.exp(-(autoCamera?cameraFrameDelta:Math.min(.1,(scenicNow-scenicTime)/1000))*5));target=scenicLook;}scenicTime=scenicNow;
  if(autoCamera){if(loadingModel&&director.reason==='model-loading-hold'&&autoRenderedPose){pos=new T.Vector3(...autoRenderedPose.position);target=new T.Vector3(...autoRenderedPose.target);camera.fov=autoRenderedPose.fov;}else autoRenderedPose={position:pos.toArray(),target:target.toArray(),fov:camera.fov};}
  if(isMountain(town)&&!paintDraft){
   if(['left','right'].includes(camMode)&&p[1]>180){const townTarget=new T.Vector3(235,34,-100),toward=townTarget.clone().sub(pos),looking=target.clone().sub(pos);if(toward.x*looking.x+toward.z*looking.z>0){pos=world(profile?.passengerX??(tram?.7:1.1),(profile?.passengerHeight??2.32)+.15,(camMode==='left'?-1:1)*.95);const forward=looking.clone().setY(0).normalize(),desired=toward.clone().setY(0).normalize(),angle=Math.atan2(forward.x*desired.z-forward.z*desired.x,forward.dot(desired)),turn=Math.max(-Math.PI/6,Math.min(Math.PI/6,angle)),dx=forward.x*Math.cos(turn)-forward.z*Math.sin(turn),dz=forward.x*Math.sin(turn)+forward.z*Math.cos(turn);target.set(pos.x+dx*100,pos.y+toward.y/toward.length()*100,pos.z+dz*100);}}

   if(['front-exterior','follow','trackside'].includes(camMode)){
    let shot=mountainExteriorCamera(v,camMode,{carLength:viewLength,aspect:camera.aspect,height:mountainSurfaceHeight,anchor:camMode==='trackside'?trackside.toArray():null});
    const cameraKey=camMode+':'+viewTrain+':'+camera.aspect.toFixed(3);if(camMode!=='trackside')shot=smoothMountainCamera(shot,mountainCameraKey===cameraKey?mountainCameraPose:null,cameraFrameDelta,mountainSurfaceHeight);mountainCameraPose=shot;mountainCameraKey=cameraKey;
    pos=new T.Vector3(...shot.position);target=new T.Vector3(...shot.target);camera.fov=shot.fov;if(shot.anchor)trackside.fromArray(shot.anchor);
   }else if(camMode==='traffic'){if(roadLook.value==='outside')pos.fromArray(clearMountainTerrain(pos.toArray(),target.toArray(),mountainSurfaceHeight));}else{const floor=mountainHeight(pos.x,-pos.z);if(!['left','right','front','panorama','station-doors'].includes(camMode))pos.y=Math.max(pos.y,floor+7);}

  }
  $('#reset-view').hidden=!canAdjustView();
  if(canAdjustView()){const shot=adjustedCamera({position:pos.toArray(),target:target.toArray(),fov:camera.fov},viewAdjustment,camMode);pos.fromArray(shot.position);target.fromArray(shot.target);camera.fov=shot.fov;if(isMountain(town)&&!['left','right','front','panorama'].includes(camMode)&&(viewAdjustment.yaw||viewAdjustment.pitch||viewAdjustment.zoom!==1)){for(let i=0;i<10;i++){const t=i/10;pos.y=Math.max(pos.y,(mountainSurfaceHeight(pos.x*(1-t)+target.x*t,-pos.z*(1-t)-target.z*t)+2-target.y*t)/(1-t));}}}
  if(!paintDraft && !['left','right','front','panorama'].includes(camMode)){
    let floor=0;
    if(isMountain(town))floor=mountainSurfaceHeight(pos.x,-pos.z);
    else if(isIsland(town))floor=1.5;
    else if(isTokyo(town))floor=camMode==='orbit'||p[3]>=10.97?10.97:0;
    else if(suspendedRenderer){
      const inBore=camMode!=='orbit' && p[0]>=suspendedPortal[0] && p[0]<=suspendedPortal[1];
      floor=suspendedRenderer.groundHeight(pos.x,pos.z,inBore);
    }
    pos.y=Math.max(pos.y,floor+1.05);
  }
  previousOrientation.copy(camera.quaternion);
  camera.near=camMode==='orbit'||mode==='build'||(town.intercityStations===1&&camMode==='station')?1:.08;camera.position.copy(pos);camera.lookAt(target);
  // Keep distinct cuts immediate. During a shot, avoid whipping around as a train passes.
  if(autoCamera && lastShotTime!==null){
    const goal=camera.quaternion;
    previousOrientation.rotateTowards(goal,Math.min(.08,(scenicNow-lastShotTime)/1000)*.95);
    goal.copy(previousOrientation);
  }
  lastShotTime=autoCamera?scenicNow:null;
  camera.updateProjectionMatrix();
  const cabVisible=camMode==='front'&&mode!=='build'&&!paintDraft&&!!route?.length;
  const cabKey=cabVisible&&!loadingModel&&!townSwitchBusy&&!replay?(other?'other:':'main:')+cameraType:null;
  cabHorn.show(cabKey);
  if(cabKey!==leverView){
    leverView=cabKey;leverNotch=null;lever.value='0';showLever('自動');
    $('#cab-control').hidden=cabKey===null;if(cabKey!==null&&$('#toast').textContent.startsWith('出発進行'))$('#toast').classList.add('toast-away');
  }
  if(cabVisible)cabin.visible=false;
  cockpit.update({visible:cabVisible,speed:v?.speed||0,phase:lightingPhase,type:isSuspended(town)?'suspended-monorail':isIsland(town)?'monorail':cameraType,foreground:cameraType==='freight'});
}
function countryKey(){const v=movingView(trainView(lastVisual,viewTrain===1));return [viewTrain,Math.sign(Math.cos(v?.body?.[2]||0)),Math.round(v?.body?.[1]||0),camera.aspect<1].join(":");}
function countryViewAllowed(name){return ['front','left','right','panorama'].includes(name)||(['front-exterior','trackside'].includes(name)&&countryAvailable(movingView(trainView(lastVisual,viewTrain===1))));}
function updateIntercity(){
 const active=isIntercity(town),zone=active?intercityZone(trainView(lastVisual,viewTrain===1)?.body):null,locked=!!zone?.locked&&mode!=='build'&&!paintDraft;
 if(active&&camMode==='orbit'){const center=(trainView(lastVisual,viewTrain===1)?.body?.[0]||0)<3000?100:5900;orbit.x=Math.max(center-400,Math.min(center+400,orbit.x));orbit.y=Math.max(-100,Math.min(900,orbit.y));orbit.distance=Math.min(center<3000?900:1500,orbit.distance);}
 if(active)intercityRenderer?.update(mode==='build'?[(lastVisual?.body?.[0]||0)<3000?200:5800,0]:trainView(lastVisual,viewTrain===1)?.body||[200,0],lightingPhase,camera,light);
 if(locked&&!intercityLocked){returnCamera=autoCamera?null:camMode;intercityLocked=true;if(!autoCamera&&!countryViewAllowed(camMode))setCamera('front',true);}
 else if(!locked&&intercityLocked){intercityLocked=false;const restore=returnCamera;returnCamera=null;if(!autoCamera&&restore&&mode!=='build'){if(restore==='orbit')fit();setCamera(restore,true);}}
 if(!autoCamera){
  if(locked&&camMode==="trackside"&&(countryShotKey!==countryKey()||(replay&&countryReplayTime!==null&&Math.abs(replayTime-countryReplayTime)>.5)))setCamera("trackside",true);
  if(locked&&!countryViewAllowed(camMode))setCamera('front',true);
  if(locked&&camMode==='trackside'&&Math.abs(countryGeometry(movingView(trainView(lastVisual,viewTrain===1))).x-trackside.x)>600)setCamera('front',true);
 }countryReplayTime=replay?replayTime:null;
 for(const b of $$('[data-camera]'))b.disabled=!!paintDraft||(locked&&!countryViewAllowed(b.dataset.camera));
 for(const id of ['delete','rotate','duplicate','next-port','switch'])$('#'+id).disabled=active&&selected?.kind!=='prop';
 if(active){const selected=trainView(lastVisual,viewTrain===1);$('#service-info').hidden=false;$('#service-info').textContent=(town.intercityStations===1&&selected?.service?.stationPhase==='dwell'?(stationAt(selected.body,150)?.name||zone.city)+' · 停車中 '+Math.ceil(selected.service.dwell)+'秒':zone.label==='都市区間'?zone.city:zone.label)+' · '+Math.round((selected?.speed||0)*3.6)+' km/h'+(locked?' · 次の街まで '+(Math.max(0,Math.cos(selected.body[2])>0?5500-selected.body[0]:selected.body[0]-500)/1000).toFixed(1)+' km':' · 自由視点');}
}
const paintLight=new T.DirectionalLight('#ffffff',2.4);scene.add(paintLight,paintLight.target);
const lever=$('#cab-lever');
let leverView=null,leverNotch=null;
function showLever(label){
  $('#cab-control output').textContent=label;
  lever.setAttribute('aria-valuetext',label);
}
const speedControl=$('#speed'),speedReading=$('#speed-value'),speedWarning=$('#speed-over');
let otherSpeedBarLimit=15;
function updateSpeedBar(){
 const other=viewTrain===1;
 const actual=Math.abs((other?lastVisual?.opposite:lastVisual)?.speed||0);
 const limit=other?otherSpeedBarLimit:Number(speedControl.max);
 const over=actual>limit+1e-7;
 if(speedWarning.hidden===over){
   speedWarning.hidden=!over;
   speedControl.parentElement.classList.toggle('over-limit',over);
 }
 const label=Math.round((over?actual:Number(speedControl.value))*3.6)+' km/h';
 if(speedReading.textContent!==label)speedReading.textContent=label;
}
function moveLever(){
  if(!leverView)return;
  if(autoCamera)setAutoCamera(false);
  leverNotch=Number(lever.value);
  showLever(leverNotch>0?'加速 '+leverNotch:leverNotch<0?'ブレーキ '+(-leverNotch):'そのまま');
  if(leverNotch>0&&!trainState.playing)$('#play').click();
}
lever.addEventListener('input',moveLever);
lever.addEventListener('click',()=>{if(leverNotch===null)moveLever();});
function fullPower(which){return viewTrain===which&&leverNotch===4;}
function normalTopSpeed(type){return isMountain(town)?10:isIntercity(town)?intercityTrainSpeed(type):15;}
function cabTopSpeed(type){
 return fullPowerLimit(normalTopSpeed(type));
}
function cabAcceleration(which){
  const type=which===0?town.train:town.oppositeTrain;
  return tractionAcceleration(fullPower(which),type==='maglev'&&isIntercity(town));
}
function cabSpeed(state,which,limit,dt){
  if(leverNotch===null||viewTrain!==which||!state)return limit;
  return leverTarget(state.speed,leverNotch,limit,dt,cabAcceleration(which));
}
let last=performance.now(),lodTime=0;
const statsLabel=()=>isStationLoop(town)?`${loopName(town)} · ${loopStations(town).length}駅`:isMountain(town)?'登山鉄道 · 4駅 · 2両×2列車':`線路 ${town.rails.length} · 街 ${town.props.length}`;
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.06,(now-last)/1000);last=now;if(document.hidden)return;const replayBefore=replayTime,clockRunning=!loadingModel&&!townSwitchBusy&&!townImportBusy&&!sceneReading&&!paintDraft&&mode!=='build';if(!replay&&clockRunning&&trainState.playing)simulationTime+=dt;cameraFrameDelta=clockRunning&&(replay?replayPlaying:trainState.playing)?dt:0;const roadKey=townStore.active;if(roadTownKey!==roadKey){roadDrive.reset();resetRoadView();roadTownKey=roadKey;}
 const showRoad=camMode==='traffic'&&trafficEnabled&&mode==='watch'&&!paintDraft&&!townSwitchBusy&&!sceneReading;
 roadControls.hidden=!showRoad;$('#road-drive').disabled=!!replay;
 if(roadDrive.driver&&(!showRoad||replay||selectedCar()!==roadDrive.driver.id))releaseRoad();
 if(!replay&&clockRunning&&!soundStationPreview&&trafficEnabled)roadDrive.tick(dt,(t,step)=>isMountain(town)?advanceMountainRoadTime(t,step,summitCrossingState(lastVisual).alarm):t+step);
 if(!replay&&clockRunning&&!soundStationPreview&&trafficEnabled)trafficTime=isMountain(town)?advanceMountainRoadTime(trafficTime,dt,summitCrossingState(lastVisual).alarm):trafficTime+dt;
  if(roadDrive.driver){const car=traffic.frame.find(v=>v.id===roadDrive.driver.id);if(car&&dt>0){const last=roadDrive.driver.previous;roadDrive.driver.previous=car.body;if(last)$('#road-speed').value=Math.round(Math.hypot(car.body[0]-last[0],car.body[1]-last[1])/dt*3.6)+' km/h';}}
  if(replay){if(replayPlaying){replayTime=Math.min(replay.frames.at(-1).t,replayTime+dt);if(replayTime>=replay.frames.at(-1).t){replayPlaying=false;ui()}}$('#seek').value=String(replayTime/replay.frames.at(-1).t*1000);applyVisual(replayVisual());if(activeDistrict||isStationLoop(town)||freeStops.length)document.querySelector("#service-info").textContent="走行記録を再生中 · "+Math.round((lastVisual?.speed||0)*3.6)+" km/h";}
  else if(route){const cruise=Number($('#speed').value);let safetySpeed=Infinity;if(isIntercity(town))safetySpeed=intercitySpeedLimit(trainState.s+trainState.dir*14,trainState.dir,safetySpeed);for(const g of gateRows){if(g.district){const trains=[{route,state:trainState,formation:effectiveFormation(town),carLength,cross:crossingDistance(route,CROSSING.y)},{route:oppositeRoute,state:oppositeState,formation:effectiveFormation(town,true),carLength:oppositeCarLength,cross:crossingDistance(oppositeRoute,CROSSING.outerY)}];Object.assign(g,advanceCrossing(g,trains,town.formation,dt,carLength));if(g.angle>.05&&trains.some(t=>{const d=distanceOnRoute(t.route,t.cross,t.state.s)*t.state.dir;return d>0&&d<24;}))safetySpeed=0;continue;}const part=route.parts.find(p=>p.it.uid===g.uid),cross=part?.start+5;const occupied=Number.isFinite(cross)&&formationOccupiesDistance(route,trainState,effectiveFormation(town),cross,carLength,.45,7);const approach=Number.isFinite(cross)&&Math.abs(distanceOnRoute(route,cross,trainState.s))<40+formationLength(effectiveFormation(town),carLength)/2;g.alarm=approach||occupied;if(g.alarm)g.clear=0;else g.clear+=dt;g.angle=Math.max(0,Math.min(1,g.angle+(g.alarm?-dt/1.4:g.clear>1?dt/2:0)));if(distanceOnRoute(route,cross,trainState.s)*trainState.dir>0&&Math.abs(distanceOnRoute(route,cross,trainState.s))<17&&g.angle>.05)safetySpeed=0;}
    const mainLimit=cabSpeed(trainState,0,Math.min(safetySpeed,fullPower(0)?cabTopSpeed(town.train):cruise),dt),otherLimit=cabSpeed(oppositeState,1,Math.min(safetySpeed,fullPower(1)?cabTopSpeed(town.oppositeTrain):cruise),dt);
    const was=trainState.playing,wasMoving=trainState.speed>.1;if(isSuspended(town)){
      if(clockRunning){
        trainState=advanceSuspended(trainState,dt,mainLimit,effectiveFormation(town));
        oppositeState=advanceSuspended({...oppositeState,playing:trainState.playing},dt,otherLimit,effectiveFormation(town,true));
        route=lineFor(trainState);oppositeRoute=lineFor(oppositeState);
      }
      const active=viewTrain===1?oppositeState:trainState;
      $('#service-info').textContent=active.stationPhase==='dwell'?suspendedStations[active.station].name+' · 停車中':('次は '+suspendedStations[active.station+active.dir].name+' · '+Math.round(active.speed*3.6)+' km/h');
    }else if(isStationLoop(town)){
      const stations=loopStations(town);
      if(clockRunning){
        trainState=stepLoop(trainState,dt,mainLimit,effectiveFormation(town),carLength,stations,route.length);
        if(isTokyo(town)||isIsland(town))oppositeState=stepLoop({...oppositeState,playing:trainState.playing},dt,otherLimit,effectiveFormation(town,true),oppositeCarLength,isIsland(town)?islandOuterStations:tokyoInnerStations,oppositeRoute.length);
      }
      const service=viewTrain===1?oppositeState:trainState,i=service.station;
      const inner=isIsland(town)?viewTrain===0:viewTrain===1;
      const line=inner?'内回り · ':'外回り · ';
      $('#service-info').textContent=line+(service.stationPhase==='dwell'?stations[i].name+' · 停車中':('次は '+stations[(i+service.dir+stations.length)%stations.length].name+' · '+Math.round(service.speed*3.6)+' km/h'));
    }else if(isMountain(town)){if(clockRunning){const next=advanceMountainPair(trainState,oppositeState,mountainControl,dt,mainLimit,[carLength,oppositeCarLength],otherLimit);trainState=next.main;oppositeState=next.other;mountainControl=next.control;}route=mountainRoute(trainState);oppositeRoute=mountainRoute(oppositeState);const selected=viewTrain===1?oppositeState:trainState;$('#service-info').textContent='列車'+(viewTrain+1)+' · '+(selected.waiting?selected.label+' · 対向列車を待っています':selected.dwell>0?selected.label+' · '+(selected.stopKind==='switch'?'折返し準備':'停車中')+' '+Math.ceil(selected.dwell)+'秒':(selected.trip>0?'山を登っています':'温泉街へ下っています')+' · '+Math.round(selected.speed*3.6)+' km/h');}else if(activeDistrict){trainState=advanceService(route,trainState,effectiveFormation(town),dt,mainLimit,carLength);oppositeState.playing=trainState.playing;oppositeState=advanceService(oppositeRoute,oppositeState,effectiveFormation(town,true),dt,otherLimit,oppositeCarLength);$('#service-info').textContent=trainState.stationPhase==='dwell'?`みどり中央 · 停車中 ${Math.ceil(trainState.dwell)}秒`:`みどり中央ゆき · ${Math.round(trainState.speed*3.6)} km/h`; }else if(freeStops.length){advanceFreeTrain(dt,mainLimit);}else{trainState=(town.intercityStations===1?advanceIntercityService:formationAdvance)(route,trainState,effectiveFormation(town),dt,mainLimit,carLength,.45,cabAcceleration(0));if(isIntercity(town)&&intercityFleet&&!loadingModel&&!paintDraft&&mode!=='build'){intercityFleet.advance(dt,trainState.playing,cabSpeed(oppositeState,1,fullPower(1)?cabTopSpeed(town.oppositeTrain):Infinity,dt),fullPower(1));oppositeState=intercityFleet.states[0];}}for(const s of[trainState,oppositeState])if(s?.dwellDuration===QUICK_DWELL+.3&&s.stationPhase!=='dwell')delete s.dwellDuration;if(wasMoving!==(trainState.speed>.1)){ui();}if(was&&!trainState.playing){finishJourney();say('線路の終わりで停止しました。方向を変えてもどれます。');ui()}
    const visual=visualState(),moving=v=>[v,v?.opposite,...(v?.returnTrains||[])].some(t=>t?.speed>0),ending=isIntercity(town)&&moving(lastVisual)&&!moving(visual);applyVisual(visual);if(!soundStationPreview&&journeyCapturing&&journey&&(trainState.playing||moving(visual)||ending)&&captureElapsed<600){captureElapsed=Math.min(600,captureElapsed+dt);if(captureElapsed>=nextCapture||ending){journey.frames.push({t:captureElapsed,...clone(visual)});nextCapture=captureElapsed+.1;}if(captureElapsed>=600){finishJourney();say('10分の走行記録を終えました。必要ならファイル保存してください。');}}
  }
  updateIntercity();
  cameraFrameDelta=cameraFollowDelta(replay?Math.max(0,replayTime-replayBefore):dt,{blocked:!clockRunning,replay:!!replay,running:replay?replayPlaying:trainState.playing,speed:trainView(lastVisual,viewTrain===1)?.speed||0});
  if(autoCamera){if(paintDraft||mode==='build'||townSwitchBusy||townImportBusy||sceneReading){invalidateAutoRecord(true);setAutoCamera(false);}else updateAutoCamera();}
  if(orbitGoal){if(mode!=='build')orbitGoal=null;else{const k=1-Math.exp(-dt*9);orbit.x+=(orbitGoal.x-orbit.x)*k;orbit.y+=(orbitGoal.y-orbit.y)*k;orbit.distance+=(orbitGoal.distance-orbit.distance)*k;if(Math.abs(orbitGoal.distance-orbit.distance)<.5&&Math.hypot(orbitGoal.x-orbit.x,orbitGoal.y-orbit.y)<.5){Object.assign(orbit,orbitGoal);orbitGoal=null;}}}
  if(troubleSpots.length)for(const m of markers.children)if(m.userData.trouble)m.material.opacity=m.userData.trouble*(.72+.28*Math.sin(now/170));
  updateSpeedBar();moveCamera(lastVisual);ground.visible=!isMountain(town)&&!isStationLoop(town);if(suspendedRenderer)suspendedRenderer.update(replay?replayTime:simulationTime);if(islandRenderer)islandRenderer.update(lastVisual?.islandFlightTime??simulationTime,lastVisual?.body);if(tokyoRenderer)tokyoRenderer.update(trainView(lastVisual,viewTrain===1)?.body,camMode,!!paintDraft);if(mountainRenderer){mountainRenderer.root.visible=!paintDraft;mountainRenderer.update(camMode,replay?{owner:lastVisual.mountainSignal?0:null}:mountainControl,replay?[{trip:lastVisual.mountainSignal}]:[trainState,oppositeState],lastVisual,replay?replayTime:simulationTime);}if(isIntercity(town)){const p=trainView(lastVisual,viewTrain===1)?.body||[200,0];townRoot.visible=!paintDraft&&(!intercityLocked||intercityZone(p).tunnel);distant.visible=false;ground.position.set(p[0],-.5,-p[1]);scene.fog.near=intercityLocked?200:600;scene.fog.far=intercityLocked?850:1500;sun.position.x=p[0]-140;sun.position.z=-p[1]+110;sun.target.position.set(p[0],0,-p[1]);}else{ground.position.set(0,-.5,0);scene.fog.near=isIsland(town)?1550:800;scene.fog.far=isIsland(town)?6500:2400;const dusk=lightingPhase==='sunset';sun.position.set(dusk?-100:-140,dusk?75:240,dusk?180:110);sun.target.position.set(200,0,-140);}updateTrainSound();if(now-lodTime>500){lodTime=now;for(const b of buildingBatches){b.items.forEach((p,i)=>{const near=!light&&Math.hypot(camera.position.x-p.pose[0],camera.position.z+p.pose[1])<700;dummy.position.set(p.pose[0],-.45,-p.pose[1]);dummy.rotation.set(0,p.pose[2],0);dummy.scale.set(near?1:0,near?p.scale:0,near?1:0);dummy.updateMatrix();b.mesh.setMatrixAt(i,dummy.matrix);dummy.scale.set(near?0:1,near?0:p.scale,near?0:1);dummy.updateMatrix();b.far.setMatrixAt(i,dummy.matrix)});b.mesh.instanceMatrix.needsUpdate=true;b.far.instanceMatrix.needsUpdate=true;}}
  if(isIntercity(town)&&lightingPhase==='day'&&!light)natureSky.prepare();natureSky.update(scene,night?nightSky:lightingPhase==='sunset'?sunsetSky:daySky,{intercity:isIntercity(town),day:lightingPhase==='day',light,editing:mode==='build'||!!paintDraft,body:trainView(lastVisual,viewTrain===1)?.body,camera:camera.position.toArray(),stations:town.intercityStations===1,viewKey:viewTrain+'/'+camMode});
  renderer.render(scene,camera);frameCount++;
  // 最初の絵が本当に描き終わるまで読み込み表示を残す（readPixels で描画の完了を待つ）。
  if(bootFrames>=0&&++bootFrames>=3){bootFrames=-1;try{const gl=renderer.getContext();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));}catch{}if($('#stats').textContent==='準備中')$('#stats').textContent=statsLabel();$('#loading').hidden=true;}
  if(now-lastStats>1000){if(journeyCapturing)$('#replay-info').textContent='記録中 · '+Math.floor(captureElapsed)+'秒（最大10分）';fps=Math.round(frameCount*1000/(now-lastStats));frameCount=0;lastStats=now;$('#stats').textContent=`${statsLabel()} · ${fps} fps`;canvas.dataset.telemetry=JSON.stringify({sky:natureSky.status,intercity:isIntercity(town)?{...intercityZone(lastVisual?.body),locked:intercityLocked,lanes:4,trains:[lastVisual,lastVisual?.opposite,...(lastVisual?.returnTrains||[])].filter(Boolean).map(v=>({body:v.cars?.[0]?.body,speed:v.speed,count:v.cars?.length})),meeting:intercityFleet?.meeting}:null,arrivalCity:intercityRenderer?.cityStats(),mountain:isMountain(town)?{leg:trainState.leg,trip:trainState.trip,facing:trainState.facing,s:trainState.s,stop:trainState.stopKind,label:trainState.label,waiting:trainState.waiting,owner:mountainControl.owner,other:oppositeState,cars:lastVisual?.cars}:null,autoCamera,director:cameraDirectorTelemetry(),doors:{main:doorOpening(lastVisual?.service,lastVisual?.speed),opposite:doorOpening(lastVisual?.opposite?.service,lastVisual?.opposite?.speed),leaves:carParts.map(c=>c.doors?.map(d=>({side:d.userData.side,x:d.position.x}))||[])},camera:{train:viewTrain+1,body:trainView(lastVisual,viewTrain===1)?.body,speed:trainView(lastVisual,viewTrain===1)?.speed,mainVisible:trainRoot.visible,otherVisible:oppositeRoot.visible,mode:camMode,fov:camera.fov,position:camera.position.toArray(),direction:camera.getWorldDirection(new T.Vector3()).toArray()},traffic:trafficEnabled?traffic.frame:[],trafficTime:lastVisual?.trafficTime,fps,draws:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,body:lastVisual?.body,speed:lastVisual?.speed,routeLength:route?.length,closed:route?.closed,district:activeDistrict,phase:lightingPhase,station:trainState.stationPhase,dwell:trainState.dwell,opposite:oppositeState?{s:oppositeState.s,speed:oppositeState.speed,phase:oppositeState.stationPhase}:null,trainModels:{main:trainRoot.userData.train,opposite:oppositeRoot.userData.train,mainCars:carParts.length,oppositeCars:oppositeParts.length,carLength,oppositeCarLength},warnings,frames:journey?.frames.length||0,replay:!!replay,gates:gateRows.map(g=>({uid:g.uid,angle:g.angle,alarm:g.alarm}))});if(recording)$('#record-time').textContent=` ${Math.floor((now-recordStart)/1000)}秒 / 30秒`;}
}
const trafficPicker=document.createElement('label');trafficPicker.id='traffic-picker';
const trafficCaption=document.createElement('span');trafficCaption.textContent='車を選ぶ（全8種類）';
const mountainTrafficPicker=document.createElement('select');
mountainTrafficPicker.id='mountain-traffic-vehicle';
mountainTrafficPicker.setAttribute('aria-label','ながめる車');
mountainTrafficPicker.add(new Option('観光バス',MOUNTAIN_BUS_ID));
mountainTrafficPicker.add(new Option('マイクロバス',MOUNTAIN_MINIBUS_ID));
mountainTrafficPicker.add(new Option('軽ボックス','nbox'));
mountainTrafficPicker.onchange=()=>{
 mountainTrafficVehicle=mountainTrafficPicker.value;
 syncTrafficChoice();setCamera('traffic');
};
trafficPicker.append(trafficCaption,$('#traffic-vehicle'));$('#camera-scroll').prepend(trafficPicker);
$('#traffic-view').after(mountainTrafficPicker);
$('#file-menu .menu-grid').insertBefore($('#traffic-settings'),$('#menu-quality'));
$('#traffic-vehicle').onchange=async()=>{
 const next=Number($('#traffic-vehicle').value),id=VEHICLE_IDS[next],previous=town.trafficVehicles,ids=selectedVehicles(previous),oldView=trafficVehicle,owner=town,ticket=sceneLoadTicket;
 if(trafficSelecting||!trafficEnabled||isMountain(town)||!id){syncTrafficChoice();return;}
 if(ids.includes(id)){trafficVehicle=next;setCamera('traffic');return;}
 if(townSwitchBusy||townImportBusy||sceneReading||replay||recording||recordStarting||paintDraft){syncTrafficChoice();return;}
 trafficSelecting=true;ui();say('選んだ車を準備しています…');
 try{
  await traffic.select([...ids,id]);
  if(town!==owner||ticket!==sceneLoadTicket)return;
  town.trafficVehicles=selectedVehicles([...ids,id]);
  if(!await persist())throw Error('save');
  trafficVehicle=next;if(journeyCapturing)finishJourney();setCamera('traffic');say('選んだ車が街を走ります。');
 }catch(e){
  if(town!==owner||ticket!==sceneLoadTicket)return;
  town.trafficVehicles=previous;trafficVehicle=oldView;await traffic.select(ids);
  if(town===owner&&ticket===sceneLoadTicket)say('車を読みこむか保存することができませんでした。もう一度選んでください。');
 }finally{trafficSelecting=false;syncTrafficChoice();ui();}
};
function syncTrafficChoice(){
 const mountain=isMountain(town),ids=selectedVehicles(town?.trafficVehicles),available=trafficEnabled&&(mountain||ids.length>0);
 document.querySelector("#traffic-settings").textContent=`走る車の台数 ${ids.length}/${VEHICLE_IDS.length}`;
 document.querySelector("#traffic-settings").setAttribute("aria-label",`走る車を選ぶ：全${VEHICLE_IDS.length}種類から${ids.length}台を選んでいます`);
 $('#traffic-settings').hidden=!activeDistrict;$('#traffic-settings').disabled=!!replay||!!recording||!!paintDraft||trafficSelecting;
 trafficPicker.hidden=!trafficEnabled||mountain;$('#traffic-vehicle').hidden=trafficPicker.hidden;$('#traffic-vehicle').disabled=mountain||trafficSelecting||!!paintDraft;$('#traffic-view').hidden=!available;
 mountainTrafficPicker.hidden=!mountain||!trafficEnabled;mountainTrafficPicker.disabled=!!paintDraft;
 mountainTrafficPicker.value=mountainTrafficVehicle;
 const busView=mountain&&mountainTrafficVehicle===MOUNTAIN_BUS_ID;
 const viewLabel=mountain?(busView?'観光バスをながめる':mountainTrafficVehicle===MOUNTAIN_MINIBUS_ID?'マイクロバスをながめる':'軽ボックスをながめる'):'車をながめる';
 const viewImage=busView?'assets/views/mountain-tour-bus.webp':'assets/views/traffic.webp';
 $('#traffic-view span').textContent=viewLabel;
 const image=$('#traffic-view img');if(image.getAttribute('src')!==viewImage)image.setAttribute('src',viewImage);
 if(camMode==='traffic')$('#view-name').textContent=viewLabel;
 if(mountain)return;
 trafficCaption.textContent=trafficSelecting?'車を準備中…':'車を選ぶ（全8種類）';
 for(const option of $('#traffic-vehicle').options){option.hidden=false;option.disabled=(!!replay||!!recording||recordStarting)&&!ids.includes(VEHICLE_IDS[Number(option.value)]);}
 if(!ids.includes(VEHICLE_IDS[trafficVehicle]))trafficVehicle=ids.length?VEHICLE_IDS.indexOf(ids[0]):0;
 $('#traffic-vehicle').value=ids.length?String(trafficVehicle):'';if(!available&&camMode==='traffic')setCamera('front-exterior');
}
$('#traffic-settings').onclick=()=>{const ids=selectedVehicles(town.trafficVehicles);$('#traffic-checks').replaceChildren();for(const option of $('#traffic-vehicle').options){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=VEHICLE_IDS[Number(option.value)];input.checked=ids.includes(input.value);label.append(input,document.createTextNode(option.textContent));$('#traffic-checks').append(label);}$('#traffic-settings-status').textContent='0台にすると、車は走りません。';$('#traffic-settings-dialog').showModal();};
$('#traffic-settings-cancel').onclick=()=>$('#traffic-settings-dialog').close();
$('#traffic-settings-dialog').addEventListener('cancel',e=>{if(trafficSelecting)e.preventDefault();});
$('#traffic-settings-apply').onclick=async()=>{
 const ids=$$('#traffic-checks input:checked').map(e=>e.value),previous=town.trafficVehicles;trafficSelecting=true;for(const e of $$('#traffic-settings-dialog button,#traffic-checks input'))e.disabled=true;$('#traffic-settings-status').textContent='選んだ車を準備しています…';
 try{await traffic.select(ids);town.trafficVehicles=ids;if(!await persist())throw Error('保存できませんでした。スマホ・パソコンの空き容量を確認してください。');if(trainState.playing)startJourney();syncTrafficChoice();$('#traffic-settings-dialog').close();say(ids.length?`${ids.length}台の車を走らせます。`:'車の走行を止めました。');}
 catch(e){town.trafficVehicles=previous;await traffic.select(selectedVehicles(previous));$('#traffic-settings-status').textContent='車の読みこみまたは保存ができませんでした。選んだものは変えていません。もう一度お試しください。';}
 finally{trafficSelecting=false;for(const e of $$('#traffic-settings-dialog button,#traffic-checks input'))e.disabled=false;ui();}
};
$('#mode-watch').onclick=()=>setMode('watch');$('#mode-build').onclick=()=>openTownChooser();$('#mode-memories').onclick=()=>{setMode('memories')};$('#editor-close').onclick=()=>setMode('watch');$('#memories-close').onclick=()=>setMode('watch');
$$('[data-camera]').forEach(b=>b.onclick=()=>setCamera(b.dataset.camera));$$('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;tool=null;connectorMode=false;connectorStart=null;stationTool=false;$$('[data-category]').forEach(x=>x.classList.toggle('active',x===b));palette()});
$('#select-tool').onclick=()=>{tool=null;connectorMode=false;connectorStart=null;stationTool=false;palette();$$('#palette button').forEach(b=>b.classList.remove('active'));say('建物・道路・線路をタップして選んでください。')};$('#rotate').onclick=()=>applyProp(p=>p.pose[2]+=Math.PI/2);$('#height').onchange=()=>{if(selected?.kind==='prop')applyProp(p=>p.scale=Number($('#height').value))};$('#tint').onchange=()=>{if(selected?.kind==='prop')applyProp(p=>p.tint=$('#tint').value)};
$('#duplicate').onclick=()=>{if(selected?.kind!=='prop'||town.props.length>=200)return;remember();const p=clone(town.props.find(p=>p.uid===selected.uid));p.uid=Math.max(0,...town.props.map(p=>p.uid))+1;p.pose[0]+=20;town.props.push(p);selected={kind:'prop',uid:p.uid};changed('複製しました。次の場所をタップして移動できます。')};
$('#delete').onclick=()=>{if(!selected){say('消す部品を先に選んでください。');return}if(selected.kind==='station'){removeSelectedStation();return;}remember();const key=selected.kind==='prop'?'props':'rails';town[key]=town[key].filter(p=>p.uid!==selected.uid);let message='部品を消しました。「もどす」で復元できます。';
 if(key==='rails'&&town.stations?.length){const next=stationsAfterRailRemoval(town.stations,selected.uid,town.rails,KIT);if(next.changed){setStations(next.stations);message=STATION_TEXT.railChanged;}}
 selected=null;changed(message)};
$('#undo').onclick=()=>{if(!history.length)return;future.push(clone(town));town=history.pop();selected=null;changed('1手前にもどしました。');loadTrain(town.train)};$('#redo').onclick=()=>{if(!future.length)return;history.push(clone(town));town=future.pop();selected=null;changed('やり直しました。');loadTrain(town.train)};
$('#switch').onclick=()=>{const it=selected?.kind==='rail'?town.rails.find(p=>p.uid===selected.uid):null;if(!it||!it.piece.startsWith('turnout')){say('先に分岐レールを選んでください。');return}const p=route.parts.find(p=>p.it.uid===it.uid);if(p&&Math.abs(distanceOnRoute(route,p.start+p.r.length/2,trainState.s))<p.r.length/2+11){say('電車が分岐に乗っているため、切りかえできません。');return}remember();it.branch=it.branch==='C'?'B':'C';changed(it.branch==='C'?'分岐先を曲線側に切りかえました。':'分岐先を直進側に切りかえました。',true)};
$('#next-port').onclick=()=>{if(!ports.length)return;selectedPort=ports[(ports.findIndex(p=>p.key===selectedPort)+1)%ports.length].key;updateMarkers();palette();say('接続先を変えました。')};$('#zoom-in').onclick=()=>zoomView(1/1.25);$('#zoom-out').onclick=()=>zoomView(1.25);$('#fit').onclick=()=>{if(mode==='build'){if(isIntercity(town))fit();else fitEdit();return;}fit();setCamera('orbit')};
$('#play').onclick=async()=>{if(loadingModel){say('電車を読みこみ中です。');return}if(replay){if(replayTime>=replay.frames.at(-1).t)replayTime=0;replayPlaying=!replayPlaying;soundscape?.reset();ui();return}if(warnings){if(mode!=='build'&&!replay&&!recording)setMode('build');say('まだ しゅっぱつ できないよ。'+troubleText,true);return}if(!formationFitsRoute(route,effectiveFormation(town),carLength)){say('電車をのせるには、線路をもう少し長くつないでください。',true);return}if(mode==='build')setMode('watch');trainState.playing=!trainState.playing;if(trainState.playing){quickDeparture();void recordTrainUsage('used',[selectedTrainId(town,trainLibrary),...(hasSecondTrain()?[selectedTrainId(town,trainLibrary,true)]:[])]);if(camMode!=='front')say('出発進行。下の絵カードで、車窓や運転席からの景色を選べます。');}else finishJourney();if(audioEnabled)await ensureAudio();ui()};
$('#reverse').onclick=()=>{if(isMountain(town)||isStationLoop(town))return;if(trainState.speed>.1||replay)return;if(town.intercityStations===1&&intercityFleet?.visual().some(v=>v.speed>.1)){say('停止ボタンで全ての列車を止めてから、方向を変えてください。');return;}if(activeDistrict){trainState=reverseService(route,trainState,effectiveFormation(town),carLength);oppositeState=reverseService(oppositeRoute,oppositeState,effectiveFormation(town,true),oppositeCarLength);}else{if(town.intercityStations===1)trainState=intercityFleet?intercityFleet.reverseMain(trainState,effectiveFormation(town)):reverseIntercityService(trainState,effectiveFormation(town),carLength,route);else if(freeStops.length)trainState=reverseFreeService(route,trainState,effectiveFormation(town),carLength,freeStops);else if(isLocomotive(town.train))trainState=reverseService(route,trainState,effectiveFormation(town),carLength);else trainState.dir*=-1;if(isIntercity(town)){if(town.intercityStations===1&&intercityFleet)intercityFleet.reverse();else intercityFleet=createIntercityTraffic(route,trainState,effectiveFormation(town),carLength,effectiveFormation(town,true),oppositeCarLength,isHighSpeed(town.train),town.intercityStations===1,intercityTrainSpeed(town.train),{main:town.train,other:town.oppositeTrain||town.train});oppositeRoute=intercityFleet.routes[0];oppositeState=intercityFleet.states[0];}}say('進行方向を変えました。発車ボタンで走ります。')};$('#speed').oninput=()=>updateSpeedBar();async function selectTrain(field,value){
 if(townSwitchBusy||townImportBusy||sceneReading||replay||recording||loadingModel||paintBaseTown){ui();return;}
 invalidateAutoRecord(false);resetDirector();const previous=clone(town),other=field==='oppositeTrain',entry=trainLibrary.find(e=>e.id===value);
 if(!selectableModel(town,entry?.type||value)||(!entry&&!Object.hasOwn(TRAIN_TYPES,value))){ui();return;}
 if(isMountain(town)&&!mountainTypeAllowed(entry?.type||value)){say('登山鉄道では新幹線とリニアは選べません。');ui();return;}
 trainState.playing=false;trainState.speed=0;if(oppositeState){oppositeState.playing=false;oppositeState.speed=0;}finishJourney();
 town=entry?applySavedTrain(town,entry,other):applyBaseTrain(town,value,other);
 try{await loadTrain(town.train);if(!await persist())throw Error('storage');if(entry)await recordTrainUsage('used',[entry.id]);}catch(e){town=previous;await loadTrain(town.train);ui();say('選んだものを保存できなかったため、以前の電車にもどしました。');}
}

const templateSelect=$('#paint-template');for(const e of TRAIN_EXAMPLES)templateSelect.add(new Option(e.design.name,e.id));
templateSelect.onchange=()=>{const e=TRAIN_EXAMPLES.find(e=>e.id===templateSelect.value);if(!e||!paintDraft)return;paintDraft=normalizeDesign(e.design);templateSelect.value='';paintFields();previewColors();};
let soundLibrarySnapshot=null;
let workshopOutput=null,workshopLegacySource=null,workshopLegacyTicket=0;
const soundEditor=setupSoundEditor({
 audio:async()=>{await ensureAudio();if(!workshopOutput){workshopOutput=audioContext.createGain();workshopOutput.gain.value=.9;workshopOutput.connect(audioContext.destination);workshopOutput.connect(audioDestination);}
 return{context:audioContext,output:workshopOutput,stopLegacy:()=>{workshopLegacyTicket++;workshopLegacySource?.stop();},legacy:async()=>{const ticket=++workshopLegacyTicket;workshopLegacySource?.stop();const response=await fetch('./assets/audio/departure-bell.mp3');if(!response.ok)throw Error('音を読みこめません');const buffer=await audioContext.decodeAudioData(await response.arrayBuffer());if(ticket!==workshopLegacyTicket)return;workshopLegacySource=audioContext.createBufferSource();workshopLegacySource.buffer=buffer;const g=audioContext.createGain();g.gain.value=.85;workshopLegacySource.connect(g);g.connect(workshopOutput);workshopLegacySource.start();}};},
 library:()=>trainLibrary,
 save:async()=>{await $('#paint-save').onclick();if(paintDraft)throw Error($('#paint-error').textContent||'保存できませんでした。下書きは残っています。');},
 saveAs:async()=>{$("#paint-destination").value="";saveTargetSnapshot=null;soundLibrarySnapshot=localStorage.getItem(LIBRARY_KEY);await $("#paint-save").onclick();if(paintDraft)throw Error($("#paint-error").textContent||"保存できませんでした。");},
 exportDraft:profile=>saveFile({...clone(paintBaseTown),train:paintType,[designField({train:paintType})]:normalizeDesign(paintDraft),soundProfile:profile,trainLibrary:clone(trainLibrary)},'音づくりの街.json'),
 preview:profile=>stationSoundPreview(profile)
});
$('#sound-editor-open').onclick=()=>soundEditor.show();
async function stationSoundPreview(profile){
 if(soundStationPreview||loadingModel||recording||replay||recordStarting)throw Error('準備が終わってから駅でためしてください。');
 const backup={town:clone(town),state:clone(trainState),other:oppositeState?clone(oppositeState):null,trafficTime,journey:clone(journey),captureElapsed,nextCapture,camMode,orbit:clone(orbit),viewTrain,lightingPhase,paintDrafts,paintDraft,autoCamera,autoElapsed,autoPhase,fleet:intercityFleet,mountainControl:clone(mountainControl),gateStates:gateRows.map(g=>({uid:g.uid,angle:g.angle,alarm:g.alarm,clear:g.clear}))};
 const before={scene:JSON.stringify(town),state:JSON.stringify(trainState),other:JSON.stringify(oppositeState),fleet:JSON.stringify(intercityFleet?.states),trafficTime,record:JSON.stringify(journey),captureElapsed,nextCapture,camMode,orbit:JSON.stringify(orbit),viewTrain,lightingPhase};
 soundStationPreview=backup;trainState.playing=false;intercityFleet?.stop();soundscape?.reset();workshopLegacySource?.stop();
 const overlay=document.createElement('div');overlay.className='sound-station-overlay';overlay.innerHTML='<strong>駅でためす</strong><span>この駅は音をためすだけです。街と記録は進みません。</span><button>■ 止めて編集へもどる</button>';document.body.append(overlay);const inertStates=[...document.body.children].filter(el=>el!==overlay).map(el=>[el,el.inert]);for(const [el]of inertStates)el.inert=true;overlay.querySelector('button').focus();
 $('#paint-panel').hidden=true;document.body.classList.remove('customizing');
 try{town={...districtTown(KIT),train:paintType,oppositeTrain:paintType,[designField({train:paintType})]:normalizeDesign(paintDraft),[designField({train:paintType},true)]:normalizeDesign(paintDraft),soundProfile:profile,oppositeSoundProfile:{version:1,departure:{mode:'off'},signal:{mode:'off'},close:{mode:'off'}},formation:clone(backup.town.formation)};
 paintDrafts=null;paintDraft=null;rebuildTown();rebuildRails();updateRoute();await loadTrain(town.train);setCamera('station-doors');viewTrain=0;setLighting('day');await ensureAudio();soundscape.reset();audioGain.gain.setValueAtTime(.22,audioContext.currentTime);trainState.playing=true;trainState.stationPhase='dwell';trainState.dwell=8;trainState.speed=0;if(oppositeState){oppositeState.playing=false;oppositeState.speed=0;}await new Promise(resolve=>overlay.querySelector('button').onclick=resolve);
 }finally{soundscape?.reset();overlay.remove();for(const [el,wasInert]of inertStates)el.inert=wasInert;mountainControl=backup.mountainControl;town=backup.town;paintDraft=backup.paintDraft;paintDrafts=backup.paintDrafts;rebuildTown();rebuildRails();updateRoute();await loadTrain(town.train);trainState={...backup.state,playing:false,speed:0};oppositeState=backup.other?{...backup.other,playing:false,speed:0}:null;trafficTime=backup.trafficTime;journey=backup.journey;captureElapsed=backup.captureElapsed;nextCapture=backup.nextCapture;mountainControl=backup.mountainControl;if(isMountain(town)){route=mountainRoute(trainState);oppositeRoute=mountainRoute(oppositeState);}if(backup.fleet){intercityFleet=backup.fleet;oppositeRoute=intercityFleet.routes[0];oppositeState=intercityFleet.states[0];}for(const g of gateRows){const state=backup.gateStates.find(s=>s.uid===g.uid);if(state)Object.assign(g,state);}viewTrain=backup.viewTrain;orbit=backup.orbit;autoCamera=false;autoElapsed=backup.autoElapsed;autoPhase=backup.autoPhase;setCamera(backup.camMode);setLighting(backup.lightingPhase);audioGain?.gain.setValueAtTime(audioEnabled?.22:0,audioContext.currentTime);const after={scene:JSON.stringify(town),state:JSON.stringify(trainState),other:JSON.stringify(oppositeState),fleet:JSON.stringify(intercityFleet?.states),trafficTime,record:JSON.stringify(journey),captureElapsed,nextCapture,camMode,orbit:JSON.stringify(orbit),viewTrain,lightingPhase};canvas.dataset.workshopPreview=JSON.stringify({checks:Object.fromEntries(Object.keys(before).map(k=>[k,before[k]===after[k]])),paused:!trainState.playing&&!oppositeState?.playing,stationRecording:false});soundStationPreview=null;$('#paint-panel').hidden=false;document.body.classList.add('customizing');ui();}
}
const decorationEditor=setupDecorationEditor({
 getDesign:()=>paintDraft,getType:()=>paintType,getFormationCount:()=>effectiveFormation(town).count,
 onChange:items=>{if(!paintDraft)return;if(items.length)paintDraft.decorations=items;else delete paintDraft.decorations;previewColors();}
});
const paintControls=setupPaintControls({getDraft:()=>paintDraft,onChange:previewColors,onPreset:index=>{const old=paintDraft;paintDraft=normalizeDesign({...DESIGN_PRESETS[index],name:old.name,wrap:old.wrap,face:old.face,front:old.front,lettering:old.lettering,decorations:old.decorations});paintFields();previewColors();},onView:setCamera});
function paintFields(){if(!paintDraft)return;$('#paint-name').value=paintDraft.name;for(const key of Object.keys(PAINT_PARTS)){$('#paint-'+key).value=paintDraft[key];$('#hex-'+key).value=paintDraft[key];$('#hex-'+key).setCustomValidity('');}paintControls.sync();decorationEditor.refresh();}
function previewColors(){paintTouched.add(paintTarget);paintDrafts[paintTarget]=paintDraft;(paintTarget==='other'?otherPaint:mainPaint)?.apply(paintDraft);paintControls.sync();}
function refreshWorkshopSaved(selected=$('#workshop-saved').value){
 const list=$('#workshop-saved');list.replaceChildren();sortedTrainLibrary().filter(e=>selectableModel(town,e.type)).forEach(e=>list.add(new Option(e.design.name+' · '+typeName(e.type),e.id)));
 if(trainLibrary.some(e=>e.id===selected))list.value=selected;
 $('#workshop-library').hidden=!list.options.length;
 if(isMountain(paintBaseTown||town))for(const option of list.options)option.disabled=!mountainTypeAllowed(trainLibrary.find(e=>e.id===option.value)?.type);
 return list;
}
const workshopFamilies={
 shinkansen:{name:'新幹線',shapes:shinkansenTypes},
 limited:{name:'特急列車',shapes:limitedExpressTypes}
};
const shapeDescriptions={
 'express-short':'短く丸みのある先頭車。',
 'express-long':'前に長くのびた流線形の先頭車。',
 'express-retro':'丸い鼻と、左右の丸いライトが目じるしの先頭車。',
 'limited-classic':'左右の運転窓と、列車名をかかげるヘッドマーク。',
 'limited-stream':'ななめにかたむいた前面と、側面へ回りこむ運転窓。',
 'limited-panorama':'前面の大きな展望窓の上に運転席。'
};
let shapeFamily=null,workshopShape=null,shapeVersion=0,restorePreviewRotation=false;
function closeShapePicker(){
 if(!shapeFamily)return;
 const family=shapeFamily;shapeFamily=null;workshopShape=null;shapeVersion++;
 if(trainPreview){trainPreview.stop();if(restorePreviewRotation&&trainPreview.paused)trainPreview.toggle();}
 restorePreviewRotation=false;
 $('.chooser-detail').prepend($('#chooser-canvas'));
 $('#shape-picker').hidden=true;$('#workshop-home').hidden=false;
 $('#workshop-title').textContent='どんな電車をつくる？';
 return family;
}
async function previewWorkshopShape(type){
 if(!shapeFamily||!workshopFamilies[shapeFamily].shapes.includes(type))return;
 const version=++shapeVersion;workshopShape=type;
 for(const b of $$('[data-train-shape]'))b.setAttribute('aria-pressed',String(type===b.dataset.trainShape));
 $('#shape-choose').disabled=true;$('#shape-info').textContent='模型を読みこみ中…';
 try{
   const viewer=getTrainPreview();
   if(!viewer.paused){viewer.toggle();restorePreviewRotation=true;}
   viewer.start();
   const design=normalizeDesign(typeDrafts[type]||EXPRESS_DESIGNS[type]);
   const loaded=await viewer.show(type,design,CONSIST?.trains?.[type]);
   if(shapeVersion!==version||!loaded)return;
   $('#shape-info').textContent=shapeDescriptions[type];$('#shape-choose').disabled=false;
 }catch{
   if(version===shapeVersion)$('#shape-info').textContent='模型を読みこめませんでした。形をおすともう一度試せます。';
 }
}
function openShapePicker(family){
 const {name,shapes}=workshopFamilies[family];
 shapeFamily=family;$('#workshop-home').hidden=true;$('#shape-picker').hidden=false;
 $('#workshop-title').textContent=name+'の形を選ぶ';$('#shape-model').append($('#chooser-canvas'));
 const initial=paintDraft&&shapes.includes(paintType)?paintType:shapes[0];
 for(const b of $$('[data-train-shape]')){
   b.hidden=!shapes.includes(b.dataset.trainShape);
   if(!b.hidden){const image=b.querySelector('img');if(!image.hasAttribute('src'))image.src=image.dataset.src;}
 }
 $('#train-workshop').scrollTop=0;
 document.querySelector('[data-train-shape="'+initial+'"]').focus({preventScroll:true});
 previewWorkshopShape(initial);
}
function showWorkshop(keepDraft=false){
 if(townSwitchBusy||townImportBusy||sceneReading||loadingModel||replay||recording||recordStarting||savingTrain)return;
 invalidateAutoRecord(true);setAutoCamera(false);intercityFleet?.stop();
 trainState.playing=false;trainState.speed=0;if(oppositeState){oppositeState.playing=false;oppositeState.speed=0;}finishJourney();
 setMode('watch');$('#file-menu').hidden=true;
 if(!keepDraft){paintBaseTown=clone(town);paintEditId=null;paintOriginalEntry=null;typeDrafts={};}else if(paintDraft){typeDrafts[paintType]=normalizeDesign(paintDraft);paintControls.cancel();}
 const list=refreshWorkshopSaved();
 $('#workshop-library').hidden=!list.options.length;$('#workshop-error').textContent=libraryError;$('#workshop-error').hidden=!libraryError;
 for(const b of $$('[data-train-kind],#workshop-edit,#workshop-delete'))b.disabled=!libraryWritable;
 if(isMountain(paintBaseTown||town)){for(const b of $$('[data-train-kind]'))b.disabled=b.disabled||!mountainTypeAllowed(b.dataset.trainKind);for(const option of list.options)option.disabled=!mountainTypeAllowed(trainLibrary.find(e=>e.id===option.value)?.type);}
 const special=routeModel(town);
 for(const b of $$('[data-train-family]')){
   b.hidden=!!special;
   b.disabled=!libraryWritable||!workshopFamilies[b.dataset.trainFamily].shapes.some(type=>selectableModel(town,type));
 }
 for(const b of $$('[data-train-kind]')){
   const type=b.dataset.trainKind;
   b.hidden=special?type!==special:!!paintDraft&&isMonorail(type);
 }
 $('#train-workshop').showModal();
}
async function chooseTrainType(type,entry=null){
 if(isMonorail(type)&&type!==routeModel(town)){
   if(paintDraft||loadingModel||savingTrain)return;
   $('#train-workshop').close();closePaint();
   try{if(!await switchTown(type==='monorail'?'island':'suspended'))return;}
   catch(e){say(e.message,true);return;}
   showWorkshop();if(!paintBaseTown)return;
 }
 if(!selectableModel(town,type))return;
 if(isMountain(paintBaseTown||town)&&!mountainTypeAllowed(type)){say('登山鉄道では新幹線とリニアは選べません。');return;}
 if(loadingModel||savingTrain||!libraryWritable)return;
 if(entry){paintEditId=entry.id;paintOriginalEntry=JSON.stringify(entry);typeDrafts={};}
 soundLibrarySnapshot=localStorage.getItem(LIBRARY_KEY);soundEditor.open(entry?.soundProfile||soundFor(paintBaseTown),type);paintType=type;paintTarget='main';paintDraft=normalizeDesign(entry?.design||typeDrafts[type]||(type==='tram'?TRAM_DESIGN:EXPRESS_DESIGNS[type]||DESIGN_PRESETS[0]));
 town=clone(paintBaseTown);town.train=type;paintDrafts={main:paintDraft};paintTouched.clear();
 $('#train-workshop').close();$('#paint-panel').hidden=false;document.body.classList.add('customizing');
 const limited=workshopFamilies.limited.shapes.includes(type),special=isMonorail(type)||limited;
 $('#paint-panel').classList.toggle('fixed-livery',special);
 const faceColor=$('#paint-face').closest('.paint-color');
 if(limited)$('[data-paint-page="colors"] .paint-colors').append(faceColor);
 else $('[data-paint-page="face"] .paint-colors').prepend(faceColor);
 faceColor.querySelector('label').textContent=limited?'前面':'地色';
 $('#paint-template-row').hidden=type==='tram'||special;
 $('#paint-template-row').nextElementSibling.hidden=special;
 $('#paint-preview').hidden=special;
 $('#paint-roof').closest('.paint-color').hidden=type==='suspended-monorail';
 for(const tab of $$('[data-paint-tab]'))tab.hidden=special&&!['colors','pattern','mark','sound'].includes(tab.dataset.paintTab);
 if(special)$('[data-paint-tab="colors"]').click();
 $('#paint-kind').textContent=type==='tram'?'路面電車 · 1両':typeName(type);$('#paint-save').textContent=paintEditId?'上書き保存':'電車を保存';$('#paint-error').hidden=true;
 refreshSaveDestinations(paintEditId);paintFields();document.querySelector('[data-paint-tab].active')?.click();setCamera('front-exterior');
 try{await loadTrain(town.train);}catch{showPaintError('模型を読みこめませんでした。型を選び直すか、×でもどれます。');}
}
function showPaintError(message){$('#paint-error').textContent=message;$('#paint-error').hidden=false;}
async function cancelWorkshop(){
 if(loadingModel||savingTrain)return;
 closeShapePicker();$('#train-workshop').close();const previous=paintBaseTown;const hadPreview=!!paintDraft;
 if(previous)town=previous;closePaint();if(hadPreview)await loadTrain(town.train);say('作りかけを保存せずにもどしました。');
}
$('#paint-open').onclick=()=>showWorkshop();
$('#paint-type-change').onclick=()=>showWorkshop(true);
for(const b of $$('[data-train-kind]'))b.onclick=()=>chooseTrainType(b.dataset.trainKind);
for(const b of $$('[data-train-family]'))b.onclick=()=>openShapePicker(b.dataset.trainFamily);
for(const b of $$('[data-train-shape]'))b.onclick=()=>previewWorkshopShape(b.dataset.trainShape);
$('#shape-back').onclick=()=>{
 const family=closeShapePicker();
 document.querySelector('[data-train-family="'+family+'"]')?.focus();
};
$('#shape-choose').onclick=()=>{
 const type=workshopShape;if(!type||$('#shape-choose').disabled)return;
 closeShapePicker();chooseTrainType(type);
};
$('#workshop-edit').onclick=()=>{const entry=trainLibrary.find(e=>e.id===$('#workshop-saved').value);if(entry)chooseTrainType(entry.type,entry);};
$('#workshop-close').onclick=cancelWorkshop;
$('#train-workshop').oncancel=e=>{e.preventDefault();if(shapeFamily)$('#shape-back').click();else cancelWorkshop();};

$('#paint-name').addEventListener('compositionstart',()=>{nameComposing=true;});$('#paint-name').addEventListener('compositionend',()=>{nameComposing=false;$('#paint-name').oninput();});
$('#paint-name').oninput=()=>{if(nameComposing)return;paintDraft.name=normalizeDesign({name:$('#paint-name').value}).name;previewColors();};
for(const key of Object.keys(PAINT_PARTS)){
 $('#paint-'+key).oninput=()=>{paintDraft[key]=$('#paint-'+key).value;$('#hex-'+key).value=paintDraft[key];previewColors();};
 $('#hex-'+key).oninput=()=>{const input=$('#hex-'+key),valid=/^#[0-9a-f]{6}$/i.test(input.value);input.setCustomValidity(valid?'':'#と6けたの色コードで入力してください');if(valid){paintDraft[key]=input.value.toLowerCase();$('#paint-'+key).value=paintDraft[key];previewColors();}};
}
$$('[data-preset]').forEach(b=>b.onclick=()=>{paintDraft={...DESIGN_PRESETS[Number(b.dataset.preset)]};paintFields();previewColors();});
function closePaint(){soundEditor.stop();workshopLegacySource?.stop();paintControls.cancel();if(camMode.startsWith('paint-'))setCamera('front-exterior');paintDraft=null;paintDrafts=null;paintBaseTown=null;paintEditId=null;paintOriginalEntry=null;nameComposing=false;typeDrafts={};$('#paint-panel').hidden=true;document.body.classList.remove('customizing');ui();}
$('#paint-cancel').onclick=cancelWorkshop;
let saveTargetSnapshot=null;
function refreshSaveDestinations(selected=''){
 const list=$('#paint-destination');list.replaceChildren(new Option('新しい電車として保存', ''));
 const targets=document.createElement('optgroup');targets.label='上書きする電車を選ぶ';
 const ordered=sortedTrainLibrary().filter(e=>selectableModel(town,e.type)),names=new Map();
 for(const entry of ordered)names.set(entry.design.name,(names.get(entry.design.name)||0)+1);
 for(const entry of ordered){
  const suffix=names.get(entry.design.name)>1?' · '+entry.id:'';
  targets.append(new Option(entry.design.name+' · '+typeName(entry.type)+suffix,entry.id));
 }
 if(ordered.length)list.append(targets);
 list.value=trainLibrary.some(e=>e.id===selected)?selected:'';
 $('#library-count').textContent=`保存済み ${trainLibrary.length}台`;
 updateSaveDestination();
}
function updateSaveDestination(){
 const entry=trainLibrary.find(e=>e.id===$('#paint-destination').value);
 saveTargetSnapshot=entry?JSON.stringify(entry):null;
 $('#paint-save').textContent=entry?'選んだ電車に上書き保存':'電車を保存';
 $('#paint-delete').disabled=!entry;
}
$('#paint-destination').onchange=updateSaveDestination;
function confirmTrainChange(message){const origin=document.activeElement;const dialog=document.createElement('dialog');dialog.className='sound-confirm';const text=document.createElement('p'),cancel=document.createElement('button'),accept=document.createElement('button');text.textContent=message;cancel.textContent='もどる';accept.textContent='実行する';accept.className='primary';dialog.append(text,cancel,accept);document.body.append(dialog);return new Promise(resolve=>{const finish=value=>{dialog.close();dialog.remove();if(origin?.isConnected)origin.focus({preventScroll:true});resolve(value);};cancel.onclick=()=>finish(false);accept.onclick=()=>finish(true);dialog.oncancel=e=>{e.preventDefault();finish(false);};dialog.showModal();cancel.focus();});}
function chooseStoredTrain(initialEntry){
 const dialog=$('#choose-stored-train'),list=$('#choose-stored-list'),accept=$('#choose-stored-accept');
 const entries=sortedTrainLibrary();
 list.replaceChildren(new Option('電車を選んでください',''));
 for(const entry of entries)list.add(new Option(entry.design.name+' · '+typeName(entry.type),entry.id));
 list.value=initialEntry?.id||'';
 const update=()=>{accept.disabled=!list.value;};
 list.onchange=update;update();dialog.returnValue='';
 return new Promise(resolve=>{
  dialog.addEventListener('close',()=>resolve(dialog.returnValue==='remove'?entries.find(entry=>entry.id===list.value):null),{once:true});
  dialog.showModal();list.focus();
 });
}

async function deleteSavedEntry(entry,{fromChooser=false,chooseTarget=false}={}){
 if((!chooseTarget&&!entry)||savingTrain||!libraryWritable)return false;
 savingTrain=true;
 try{
 if(chooseTarget){entry=await chooseStoredTrain(entry);if(!entry)return false;}
 else if(!await confirmTrainChange(`「${entry.design.name}」を保存一覧から外して保管しますか？「外した電車をもどす」からもどせます。編集中の内容・走行中の見た目・記録は残ります。`))return false;
  const fresh=readLibrary(localStorage),current=fresh.find(e=>e.id===entry.id);
  if(JSON.stringify(current)!==JSON.stringify(entry))throw Error('この電車は別の画面で変えられています。一覧を開き直してください。');
  let next=removeTrain(fresh,paintBaseTown||town,entry.id);const expectedLibrary=localStorage.getItem(LIBRARY_KEY);
  next=await commitTrainLibrary(next.items,next.scene,expectedLibrary);
  trainLibrary=next.items;libraryError='';if(paintBaseTown)paintBaseTown=next.scene;
  if(paintDraft){for(const key of ['trainId','oppositeTrainId'])if(town[key]===entry.id)delete town[key];}
  else town=clone(next.scene);
  if(paintEditId===entry.id){paintEditId=null;paintOriginalEntry=null;}
  savingTrain=false;ui();if(!paintDraft&&!fromChooser)showWorkshop(true);refreshSaveDestinations($('#paint-destination').value);say('電車を保存一覧から外しました。こうぼうの「外した電車をもどす」からもどせます。');return true;
 }finally{savingTrain=false;}
}
$('#workshop-delete').onclick=async()=>{try{if(await deleteSavedEntry(trainLibrary.find(e=>e.id===$('#workshop-saved').value))&&paintDraft)showWorkshop(true);}catch(e){$('#workshop-error').textContent=e.message;$('#workshop-error').hidden=false;}};
$('#paint-delete').onclick=async()=>{
 try{if(await deleteSavedEntry(trainLibrary.find(e=>e.id===$('#paint-destination').value)))$('#paint-error').hidden=true;}catch(e){showPaintError(e.message);}
};
function offerSavedTrainRide(name,updated){
 soundEditor.dialog.close();setMode('watch');openTrainChooser('train');
 const card=$('#chooser-cards [aria-pressed="true"]');
 card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest'});
 $('#chooser-saved').textContent='「'+name+'」を'+(updated?'上書き':'保存')+'しました。';
 $('#chooser-ride').hidden=false;$('#chooser-use').hidden=true;
}
$('#paint-save').onclick=async()=>{
 if(!paintDraft||loadingModel||savingTrain||paintControls.busy||nameComposing)return;
 if(!decorationEditor.commitPending())return;
 soundEditor.stop();if(localStorage.getItem(LIBRARY_KEY)!==soundLibrarySnapshot){showPaintError("保存庫が別の画面で変えられています。下書きは残っています。音のこうぼうで「別名で保存」を選べます。");return;}const invalid=$$('.paint-hex').find(i=>!i.checkValidity());if(invalid){document.querySelector('[data-paint-tab='+invalid.closest('[data-paint-page]').dataset.paintPage+']').click();invalid.reportValidity();return;}
 let targetId=$('#paint-destination').value,expected=saveTargetSnapshot,entry=trainLibrary.find(e=>e.id===targetId);
 if(targetId&&!entry){showPaintError('保存先が見つかりません。保存先を選び直してください。');return;}
 if(entry){savingTrain=true;let accepted;try{accepted=await confirmTrainChange(`保存先「${entry.design.name}」を「${normalizeDesign(paintDraft).name}」で上書きしますか？ この街の列車1に設定します。他の街は保存時の車両で走ります。`);}finally{savingTrain=false;}if(!accepted)return;}
 const previewTown=town,draft=normalizeDesign(paintDraft),type=paintType,id=targetId||'saved-'+crypto.randomUUID();let candidate,savedName=null;
 const prepare=()=>{
  const fresh=readCurrentLibrary(),current=fresh.find(e=>e.id===targetId);
  if(targetId&&JSON.stringify(current)!==expected)throw Error('保存先は別の画面で変えられたり消されたりしています。編集内容は残しています。保存先を選び直してください。');
  return saveUniqueTrain(fresh,paintBaseTown,{id,type,design:draft,soundProfile:soundEditor.profile},readPending(localStorage));
 };
 try{candidate=prepare();}catch(e){showPaintError(e.message);return;}
 savingTrain=true;$('#paint-error').hidden=true;$('#paint-destination').disabled=true;
 try{
  town=candidate.scene;paintDrafts=null;await loadTrain(town.train);
  candidate=prepare();const libraryExpected=localStorage.getItem(LIBRARY_KEY);town=candidate.scene;candidate=await commitTrainLibrary(candidate.items,candidate.scene,libraryExpected,{createdId:!targetId&&!candidate.duplicate?id:null});town=candidate.scene;
  trainLibrary=candidate.items;libraryError='';savedName=draft.name;
 }catch(e){
  town=previewTown;paintDrafts={main:paintDraft};try{await loadTrain(town.train);}catch{}
  savingTrain=false;ui();showPaintError(e.message||'保存できませんでした。編集内容は残しています。');
 }finally{savingTrain=false;$('#paint-destination').disabled=false;}
 if(savedName!==null){
  try{closePaint();ui();$('#save-status').textContent='このスマホ・パソコンに保存済み';offerSavedTrainRide(savedName,!!targetId);}
  catch{paintDraft=null;paintBaseTown=null;$('#saved-train-ride')?.remove();soundEditor.dialog.close();$('#paint-panel').hidden=true;document.body.classList.remove('customizing');$('#save-status').textContent='このスマホ・パソコンに保存済み';say('電車は保存できました。発車ボタンから走らせられます。');}
 }
};


let trainPreview=null,chooserField='train',chooserVersion=0,chooserSnapshot=null,disposeThumbnails=null;
function chosenTrain(id){const entry=trainLibrary.find(e=>e.id===id);if(id.startsWith('saved-')&&!entry)throw Error('保存データが見つかりません。');const type=entry?.type||id,scene=entry?applySavedTrain(town,entry):applyBaseTrain(town,type);return{entry,type,design:designFor(scene)};}
function renderChooserCards(){
 $('#chooser-capacity').textContent=`保存済み ${trainLibrary.length}台`;
 disposeThumbnails?.();const container=$('#chooser-cards'),items=[];container.replaceChildren();
 for(const option of $('#chooser-list').querySelectorAll('option')){if(option.disabled)continue;const choice=chosenTrain(option.value),button=document.createElement('button'),canvas=document.createElement('canvas'),label=document.createElement('span'),name=document.createElement('strong'),kind=document.createElement('small');
  button.type='button';button.className='chooser-card';button.dataset.trainId=option.value;button.setAttribute('aria-pressed',String(option.value===$('#chooser-list').value));canvas.setAttribute('aria-hidden','true');name.textContent=choice.design.name;kind.textContent=typeName(choice.type)+(choice.entry?"":" · 基本");label.append(name,kind);button.append(canvas,label);container.append(button);items.push({canvas,type:choice.type,design:choice.design});
  button.onclick=()=>{$('#chooser-list').value=option.value;showChosenTrain();};
 }
 disposeThumbnails=observeTrainThumbnails(container,items);
}
function syncChooserButtons(){for(const id of ['train','opposite-train']){const select=$('#'+id),button=$('#'+id+'-model');if(button){button.textContent=select.selectedOptions[0]?.textContent||'電車を選ぶ';button.disabled=select.disabled;}}}
for(const id of ['train','opposite-train']){const button=document.createElement('button');button.id=id+'-model';button.type='button';button.className='train-model-button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',(id==='train'?'列車1':'列車2')+'を3Dで選ぶ');$('#'+id).hidden=true;$('#'+id).after(button);button.onclick=()=>openTrainChooser(id);}
function getTrainPreview(){
 if(!trainPreview)trainPreview=createTrainPreview($('#chooser-canvas'),async asset=>{
  if(!modelCache.has(asset)){const pending=loader.loadAsync('./assets/'+asset+'?v='+encodeURIComponent(CONSIST?.assetVersion||'1')).catch(e=>{modelCache.delete(asset);throw e});modelCache.set(asset,pending);}return modelCache.get(asset);
 },syncPreviewRotation);
 return trainPreview;
}
function openTrainChooser(field){
 if(townSwitchBusy||townImportBusy||sceneReading||replay||recording||loadingModel||paintBaseTown)return;
 ui();chooserField=field;$('#chooser-saved').textContent='';$('#chooser-ride').hidden=true;$('#chooser-use').hidden=false;$('#chooser-title').textContent=(field==='train'?'列車1':'列車2')+'の電車を選ぶ';
 $('#chooser-delete').disabled=!libraryWritable||!trainLibrary.length;$('#chooser-use').disabled=$('#chooser-edit').disabled=true;
 $('#chooser-list').replaceChildren(...Array.from($('#'+field).children,c=>c.cloneNode(true)));$('#chooser-list').value=$('#'+field).value;
 $('#train-chooser').showModal();
 renderChooserCards();
 try{getTrainPreview();trainPreview.start();syncPreviewRotation();showChosenTrain();}catch(e){$('#chooser-status').textContent='3Dを準備できませんでした。閉じてもう一度お試しください。';$('#chooser-use').disabled=true;}
}
function syncPreviewRotation(){const paused=trainPreview.paused;$('#chooser-rotate').textContent=paused?'回転を再開':'回転を止める';$('#chooser-rotate').setAttribute('aria-pressed',String(!paused));}
async function showChosenTrain(){if($('#chooser-list').value!==pickerValue(false)){$('#chooser-ride').hidden=true;$('#chooser-use').hidden=false;}const version=++chooserVersion,id=$('#chooser-list').value,entry=trainLibrary.find(e=>e.id===id);$('#chooser-delete').disabled=!libraryWritable||!trainLibrary.length;$('#chooser-use').disabled=$('#chooser-edit').disabled=true;for(const b of $$('#chooser-cards button'))b.setAttribute('aria-pressed',String(b.dataset.trainId===id));$('#chooser-status').textContent='1両の模型を読みこみ中…';chooserSnapshot=entry?JSON.stringify(entry):null;
 try{if(id.startsWith('saved-')&&!entry)throw Error('保存データが見つかりません。');const type=entry?.type||id,previewScene=entry?applySavedTrain(town,entry):applyBaseTrain(town,type),design=designFor(previewScene);
 const loaded=await trainPreview.show(type,design,CONSIST?.trains?.[type]);if(version!==chooserVersion||!loaded)return;
 $('#chooser-status').textContent=design.name+' · '+typeName(type)+' · 1両プレビュー'+(libraryError?' · '+libraryError:'');$('#chooser-use').disabled=false;$('#chooser-edit').disabled=!libraryWritable;
 }catch(e){if(version===chooserVersion)$('#chooser-status').textContent='模型を読みこめませんでした。別の電車を選んでお試しください。';}
}
function closeTrainChooser(){chooserVersion++;disposeThumbnails?.();disposeThumbnails=null;trainPreview?.stop();$('#train-chooser').close();}
$('#chooser-edit').onclick=async()=>{
 if(loadingModel||savingTrain||!libraryWritable||replay||recording||recordStarting)return;
 const id=$('#chooser-list').value;
 if(id.startsWith('saved-')&&JSON.stringify(trainLibrary.find(e=>e.id===id))!==chooserSnapshot){$('#chooser-status').textContent='保存データが変わりました。電車を選び直してください。';$('#chooser-edit').disabled=$('#chooser-use').disabled=true;return;}
 const choice=chosenTrain(id);closeTrainChooser();showWorkshop();if(!paintBaseTown)return;if(!choice.entry)typeDrafts[choice.type]=choice.design;await chooseTrainType(choice.type,choice.entry);
};
$('#chooser-delete').onclick=async()=>{
 if(savingTrain)return;
 const id=$('#chooser-list').value,entry=trainLibrary.find(e=>e.id===id);
 try{if(!await deleteSavedEntry(entry,{fromChooser:true,chooseTarget:true}))return;
  $('#chooser-list').replaceChildren(...Array.from($('#'+chooserField).children,c=>c.cloneNode(true)));$('#chooser-list').value=$('#'+chooserField).value;renderChooserCards();await showChosenTrain();
 }catch(e){$('#chooser-status').textContent=e.message;}
};
$('#chooser-list').onchange=showChosenTrain;
$('#chooser-rotate').onclick=()=>{if(trainPreview){trainPreview.toggle();syncPreviewRotation();}};
$('#chooser-close').onclick=closeTrainChooser;
$('#chooser-ride').onclick=()=>{
 if($('#chooser-list').value!==pickerValue(false))return;
 closeTrainChooser();viewTrain=0;$('#view-train').value='0';$('#view-train').onchange();
 setCamera('front-exterior');if(!trainState.playing)$('#play').click();
};
$('#train-chooser').oncancel=e=>{e.preventDefault();closeTrainChooser();};
$('#chooser-use').onclick=async()=>{const id=$('#chooser-list').value;if(id.startsWith('saved-')&&JSON.stringify(trainLibrary.find(e=>e.id===id))!==chooserSnapshot){$('#chooser-status').textContent='保存データが変わりました。電車を選び直してください。';$('#chooser-use').disabled=true;return;}closeTrainChooser();await selectTrain(chooserField==='train'?'train':'oppositeTrain',id);};

$('#train').onchange=()=>selectTrain('train',$('#train').value);
$('#opposite-train').onchange=()=>selectTrain('oppositeTrain',$('#opposite-train').value);
$('#formation').onchange=async()=>{if(isMountain(town)){ui();return;}if(trainState.playing||trainState.speed>.1||replay||recording){say('停止してから編成を変えられます。');ui();return}const next=defaultFormation(Number($('#formation').value),CONSIST?.assetVersion||'pending');if(route&&town.train!=='tram'&&!formationFitsRoute(route,next,carLength)){say('この線路には編成が収まりません。編成は変えていません。');ui();return}town.formation=next;persist();await loadTrain(town.train)};
$('#sound').onclick=async()=>{$('#sound').disabled=true;try{await ensureAudio();setGameSound(!audioEnabled);soundscape?.reset();nextBell=0;}finally{$('#sound').disabled=false;}};$('#quality').onclick=()=>{light=!light;renderer.shadowMap.enabled=!light;renderer.setPixelRatio(light?1:Math.min(devicePixelRatio,1.5));$('#quality').setAttribute('aria-pressed',String(light));$('#quality').textContent=light?'標準表示':'軽量表示';$('#menu-quality').textContent=light?'標準表示にもどす':'軽量表示にする';say(light?'遠景を簡略化し、軽い表示にしました。':'標準の表示にもどしました。')};
$('#menu-quality').onclick=()=>$('#quality').click();
$('#menu').onclick=()=>{$('#file-menu').hidden=!$('#file-menu').hidden;$('#menu').setAttribute('aria-expanded',String(!$('#file-menu').hidden))};$('#menu-close').onclick=()=>{$('#file-menu').hidden=true;$('#menu').setAttribute('aria-expanded','false')};$('#save-town').onclick=()=>saveFile({...clone(replay?liveBackup.town:town),trainLibrary:clone(trainLibrary)},'わたしの街.json');
$('#load-town').onchange=async e=>{
 if(townBlocked()){e.target.value='';say('録画・再生・準備が終わってから街ファイルを読みこんでください。');return;}
 townImportBusy=true;ui();try{const next=await readFile(e.target,validateScene);if(!next)return;const dialog=$('#town-import-confirm');dialog.returnValue='cancel';const accepted=await new Promise(resolve=>{dialog.addEventListener('close',()=>resolve(dialog.returnValue==='load'),{once:true});dialog.showModal();});if(!accepted)return;townImportBusy=false;await switchTown('mine',false,next);}catch(error){say(error.message);}finally{townImportBusy=false;ui();}
};
$('#town-menu-open').onclick=()=>openTownChooser();
$('#rail-layer').onchange=()=>{railLayer=$('#rail-layer').value;tool=null;palette();};
$('#replay').onclick=()=>enterReplay();$('#exit-replay').onclick=exitReplay;$('#export-replay').onclick=()=>{if(journey)saveFile(journey,'わたしの街の走行.json')};$('#import-replay').onchange=async e=>{if(journeyCapturing){e.target.value='';return;}if(townSwitchBusy||townImportBusy||sceneReading||loadingModel||paintBaseTown||recording||recordStarting){e.target.value='';say('準備が終わってから走行記録を読みこんでください。');return;}sceneReading=true;ui();try{const data=await readFile(e.target,validateReplay);if(data){replayEpoch.suppress();journey=data;sceneReading=false;await enterReplay(data)}}catch(e){say(e.message,true)}finally{sceneReading=false;ui();}};$('#seek').oninput=()=>{if(replay){soundscape?.reset();resetDirector();replayTime=Number($('#seek').value)/1000*replay.frames.at(-1).t;replayPlaying=false;ui()}};$('#record').onclick=()=>startRecord(false);$('#auto-record').onclick=()=>{if(!mime||recording||recordStarting||loadingModel||paintDraft||trafficSelecting)return;startRecord(true);};$('#stop-record').onclick=stopRecord;
window.addEventListener('storage',event=>{if(event.key===USAGE_KEY){if(!usageMemoryOnly){try{trainUsage=readUsage(localStorage);choicesKey='';}catch{usageMemoryOnly=true;}}return;}if((event.key==='rail-town-v2'&&event.newValue!==liveTownText)||(event.key==='rail-town-slots-v1'&&event.newValue!==townStore.raw)){townWritable=false;townStoreError='街が別の画面で変わりました。この画面の街はファイル保存できます。開き直してから切りかえてください。';say(townStoreError);ui();return;}if(event.key!==LIBRARY_KEY||savingTrain)return;try{trainLibrary=readLibrary(localStorage);libraryWritable=townWritable;libraryError=townWritable?'':townStoreError;ui();}catch{libraryWritable=false;libraryError='保存した電車を読みこめません。元のデータを守るため保存を止めています。';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){soundscape?.reset();intercityFleet?.stop();trainState.playing=false;trainState.speed=0;if(oppositeState){oppositeState.playing=false;oppositeState.speed=0;}replayPlaying=false;stopRecord();finishJourney();if(audioContext)audioContext.suspend();ui()}else{last=performance.now();if(audioEnabled&&audioContext)audioContext.resume()}});window.addEventListener('pagehide',()=>{persist();finishJourney();stopRecord()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();trainState.playing=false;stopRecord();say('3D表示を一時停止しました。画面を再読みこみすると保存した街から再開できます。')});
new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}).observe($('#stage'));
try{if(navigator.locks?.request)await withStorageLock(()=>{replayStoreText=localStorage.getItem(REPLAY_KEY);recoverStorage(localStorage);});else if(localStorage.getItem('rail-save-journal-v2')!==null)throw Error('このブラウザでは保存の復旧を安全に行えません。対応ブラウザで開いてください。');}catch(e){townWritable=false;libraryWritable=false;townStoreError=e.message;libraryError=e.message;}
replayStoreText=localStorage.getItem('rail-town-replay');
try{townStore=readTownStore(localStorage,s=>validateScene(s,KIT));}catch(error){townStoreError=error.message;}
try{liveTownText=localStorage.getItem('rail-town-v2');town=liveTownText!==null?validateScene(JSON.parse(liveTownText),KIT):townStore.slots[townStore.active]?clone(townStore.slots[townStore.active]):{...districtTown(KIT),train:'original',oppositeTrain:'original',trainDesign:designFor({}),oppositeTrainDesign:designFor({},true)};}catch(error){town=districtTown(KIT);townWritable=false;townStoreError='以前の街の保存データを読みこめません。上書きせず保護しています。今の画面はファイルに保存できます。';say(townStoreError);}
try{trainLibrary=localStorage.getItem(LIBRARY_KEY)===null&&localStorage.getItem(LEGACY_LIBRARY_KEY)===null?clone(TRAIN_EXAMPLES):readLibrary(localStorage);}catch{libraryWritable=false;libraryError='保存した電車を読みこめません。元のデータを守るため、新しい保存を止めています。';}
if(libraryWritable&&townWritable){try{const merged=mergeSceneLibrary(trainLibrary,town,{migrateLegacy:localStorage.getItem(LIBRARY_KEY)===null&&localStorage.getItem(LEGACY_LIBRARY_KEY)===null});trainLibrary=merged.items;town=merged.scene;}catch(e){libraryError=e.message;libraryWritable=false;}}
async function saveInitialTrainLibrary(){
 try{const plan=await commitTrainLibrary(trainLibrary,town,localStorage.getItem(LIBRARY_KEY));trainLibrary=plan.items;town=plan.scene;}
 catch(e){const retryable=isQuotaError(e)&&localStorage.getItem(JOURNAL_KEY)===null;libraryWritable=retryable;libraryError=retryable?'保存容量が不足しています。編集はできますが、保存時に空き容量が必要です。':e.message;}
}
if(libraryWritable&&townWritable)await saveInitialTrainLibrary();
if(!townWritable){libraryWritable=false;libraryError=townStoreError;}
if(localStorage.readOnly&&!townStoreError){
 townStore.temporary=true;townWritable=false;libraryWritable=false;
 libraryError='このスマホ・パソコンの保存庫を開けないため、移行前のデータを一時表示しています。編集した街はファイルに保存してください。';
 $('#save-status').textContent=libraryError;
}
const townChooser=setupTownChooser({current:()=>({active:townStore.active,saved:Object.keys(townStore.slots),slots:townStore.slots,error:townStoreError}),select:switchTown,edit:()=>setMode('build'),blocked:townBlockReason});
setupTownDeletion({snapshot:()=>({...townStore,live:liveTownText}),blocked:townBlockReason,erase:async(snapshot,id)=>{
 if(townBlocked())throw Error(townBlockReason());
 if(townStore.temporary)throw Error(libraryError);
 const wasActive=id===townStore.active;townSwitchBusy=true;
 try{const next=await withStorageLock(()=>deleteTown(localStorage,snapshot,id,s=>validateScene(s,KIT),{format:'rail-town',version:3,rails:[],props:[],train:'original',formation:defaultFormation(2)}));townStore=next;liveTownText=next.live;
 if(wasActive){replayEpoch.suppress();townWritable=false;trainState.playing=false;window.location.reload();}else townChooser.refresh();
 }finally{townSwitchBusy=false;ui();}
}});
try{const j=localStorage.getItem('rail-town-replay');if(j)journey=validateReplay(JSON.parse(j),KIT)}catch(e){journey=null;say('以前の走行記録を読みこめませんでした。保存した街はそのままです。')}
async function init(){try{await Promise.all(Object.keys(KIT.pieces).filter(k=>k!=='crossing'&&!KIT.pieces[k].procedural).map(async key=>{const gltf=await loader.loadAsync('./assets/'+key+'.glb');railTemplates.set(key,collect(gltf.scene))}));changed('街の準備ができました。発車して車窓をながめてみましょう。');await trafficLoad;fit();palette();await loadTrain(town.train);setLighting('day');if(isSuspended(town))setCamera('front');else if(isIsland(town))setCamera('follow');else if(isTokyo(town))setCamera('front');else if(activeDistrict)setCamera('station');bootFrames=0;requestAnimationFrame(animate);}catch(e){console.error(e);$('#load-detail').textContent='読みこみに失敗しました。ページを再読みこみしてください。'}}
setupColorPicker();
init();

document.querySelector('#photo').onclick=()=>canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='まちとレール_'+lightingPhase+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);say('いまの景色を写真に保存しました。');},'image/png');

setupStationAdControls();
