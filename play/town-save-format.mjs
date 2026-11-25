import {presets} from './town-presets-v1.mjs';

export const slotsKey = 'rail-town-slots-v1';
export const liveKey = 'rail-town-v2';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function packScene(id, scene) {
  const preset = id === 'mine' ? 'district' : id;
  const base = Object.hasOwn(presets, preset) && presets[preset];
  if (!base || !scene || !same(scene.rails, base.rails) || !same(scene.props, base.props)) return scene;
  const changes = Object.fromEntries(Object.entries(scene).filter(([key, value]) => !same(value, base[key])));
  const omitted = Object.keys(base).filter(key => !Object.hasOwn(scene, key));
  return {preset, ...(Object.keys(changes).length && {changes}), ...(omitted.length && {omitted})};
}

export function isUnmodifiedPreset(id, scene) {
  return Object.hasOwn(presets, id) && Object.keys(presets[id]).length === Object.keys(scene || {}).length &&
    Object.entries(presets[id]).every(([key, value]) => same(value, scene[key]));
}

export function townSaveLabel(id, scene) {
  if (!scene) return '見本を開く';
  if (id === 'mine') return '保存した続きから';
  const entry = packScene(id, scene);
  if (!entry.preset) return '保存した続きから';
  return entry.changes || entry.omitted ? '設定した続きから' : '見本を開く';
}

function unpackScene(entry) {
  if (!entry || !Object.hasOwn(entry, 'preset') || Object.hasOwn(entry, 'rails')) return entry;
  if (!Object.hasOwn(presets, entry.preset)) throw Error('見本の街を読み込めません。');
  const scene = {...presets[entry.preset], ...entry.changes};
  for (const key of entry.omitted || []) delete scene[key];
  return scene;
}

// Legacy rows and unrecognized data stay readable as original strings.
export function packTowns(values) {
  const raw = values.get(slotsKey), live = values.get(liveKey);
  const result = new Map([[slotsKey, raw], [liveKey, live]]);
  try {
    const data = raw && JSON.parse(raw);
    if (data?.version === 1 && data.slots && Object.hasOwn(data.slots, data.active)) {
      const slots = Object.fromEntries(Object.entries(data.slots).map(([id, scene]) => [id, packScene(id, scene)]));
      result.set(slotsKey, {format: 'town-slots-1', data: {...data, slots}});
      if (live && same(JSON.parse(live), data.slots[data.active])) {
        result.set(liveKey, {format: 'active-slot-1'});
        return result;
      }
    }
    if (live) {
      const entry = packScene(data?.active || 'mine', JSON.parse(live));
      if (entry?.preset && !Object.hasOwn(entry, 'rails')) result.set(liveKey, {format: 'town-scene-1', entry});
    }
  } catch { /* Original strings remain available for recovery. */ }
  return result;
}

export function unpackTowns(values) {
  const raw = values.get(slotsKey), live = values.get(liveKey);
  if (raw?.format === 'town-slots-1') {
    const slots = Object.fromEntries(Object.entries(raw.data.slots).map(([id, entry]) => [id, unpackScene(entry)]));
    values.set(slotsKey, JSON.stringify({...raw.data, slots}));
    if (live?.format === 'active-slot-1') values.set(liveKey, JSON.stringify(slots[raw.data.active]));
  }
  if (live?.format === 'town-scene-1') values.set(liveKey, JSON.stringify(unpackScene(live.entry)));
}
