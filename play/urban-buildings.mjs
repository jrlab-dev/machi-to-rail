// Each atlas tile covers four bays by four storeys. Dimensions in metres drive
// the repeat count, so a taller building gains floors without stretching glass.
const tileSize = 128;
const wall = ['#96aeb4','#d2cabc','#d5cabb','#baafa4','#d8cec0','#a6b2bb'];
const glass = ['#688998','#8da7b0','#607989','#a3b5bb','#748f9b','#b2bfc0'];
let sharedMaterial;

function makeAtlas(T) {
  const canvas = document.createElement('canvas');
  canvas.width = 4 * tileSize;
  canvas.height = 2 * tileSize;
  const ctx = canvas.getContext('2d');
  function rect(color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  for (let kind = 0; kind < 8; kind++) {
    ctx.save();
    ctx.translate(kind % 4 * tileSize, Math.floor(kind / 4) * tileSize);
    rect(wall[kind] || '#afb7b8', 0, 0, tileSize, tileSize);
    for (let floor = 0; floor < 4; floor++) {
      for (let bay = 0; bay < 4; bay++) {
        const x = bay * 32, y = floor * 32;
        if (kind === 7) {
          rect('#a4aeb0', x, y, 32, 1);
          rect('#bdc3c1', x, y, 1, 32);
          continue;
        }
        const variant = (floor * 11 + bay * 7 + kind + floor * bay) % 17;
        const inset = [1,2,4,5,3,1,1][kind], top = [1,5,3,5,2,2,1][kind];
        const w = 32 - 2 * inset, h = [28,17,24,19,25,26,29][kind];
        rect('#475d65', x + inset, y + top, w, h);
        const pane = ctx.createLinearGradient(0, y + top, 0, y + top + h);
        pane.addColorStop(0, glass[(variant + 2) % glass.length]);
        pane.addColorStop(0.48, variant === 4 || variant === 9 ? '#f1d6a2' : glass[variant % glass.length]);
        pane.addColorStop(1, variant === 4 || variant === 9 ? '#d0af85' : '#596f7b');
        ctx.fillStyle = pane;
        ctx.fillRect(x + inset + 1, y + top + 1, w - 2, h - 3);
        if (variant % 4 === 1) rect('#c2bfaf', x + inset + 1, y + top + 1, w - 2, h * .34);
        rect('#9ca9a8', x + 16, y + top + 1, 1.4, h - 2);
        if (kind === 2) {
          rect('#a8b5b1', x, y + 20, 32, 8);
          rect('#e1ded1', x, y + 19, 32, 2);
          rect('#7e8986', x, y + 29, 32, 3);
        } else if (kind === 6) {
          rect('#394f57', x + 1, y + 7, 31, 2);
          rect('#c9b9a0', x + 3, y + 23, 9, 4);
        } else {
          rect(kind === 0 || kind === 5 ? '#adc1c5' : '#bcb9ac', x, y + 30, 32, 2);
        }
      }
    }
    if (kind === 7) {
      rect('#959e9d', 0, 0, 128, 128);
      rect('#d6d7cf', 2, 2, 124, 124);
      rect('#b7bab3', 4, 4, 120, 120);
      for (let x = 19; x < 123; x += 19) rect('#adb1ac', x, 5, 1, 117);
      rect('#8a9390', 10, 11, 33, 22);
      rect('#d2d2c5', 9, 9, 31, 19);
      for (const x of [76,90]) {
        rect('#9a9f9a', x + 2, 82, 12, 24);
        rect('#d0d1c9', x, 80, 12, 24);
        for (let y = 83; y < 102; y += 3) rect('#9ca6a4', x + 2, y, 8, 1);
      }
    }
    ctx.restore();
  }
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  return map;
}

function material(T) {
  if (sharedMaterial) return sharedMaterial;
  const m = new T.MeshStandardMaterial({map: makeAtlas(T), roughness: .79});
  m.onBeforeCompile = shader => {
    shader.vertexShader = 'attribute vec4 urbanTile;\nvarying vec3 urbanUv;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', `
      #include <uv_vertex>
      bool roof = abs(normal.y) > 0.5;
      float width = abs(normal.x) > 0.5 ? length(instanceMatrix[2].xyz) : length(instanceMatrix[0].xyz);
      float bays = max(1.0, floor(width / 2.85 + 0.5));
      vec2 frontage = uv * vec2(bays, urbanTile.y) * 0.25 + urbanTile.zw;
      if (urbanTile.x == 7.0) frontage = vec2(0.43, 0.52);
      urbanUv = vec3(roof ? uv * 0.99 + 0.005 : frontage, roof ? 7.0 : urbanTile.x);
    `);
    shader.fragmentShader = 'varying vec3 urbanUv;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      vec2 tile = vec2(mod(urbanUv.z, 4.0), 1.0-floor(urbanUv.z/4.0));
      vec2 atlasSize = vec2(4.0, 2.0);
      vec2 withinTile = clamp(fract(urbanUv.xy), 0.004, 0.996);
      vec3 paint = textureGrad(map, (tile+withinTile)/atlasSize,
        dFdx(urbanUv.xy)/atlasSize, dFdy(urbanUv.xy)/atlasSize).rgb;
      diffuseColor.rgb *= paint;
    `);
    // Only warm interior panes contribute a little light after dark.
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      totalEmissiveRadiance += paint * (0.28 * smoothstep(0.12, 0.27, paint.r-paint.b));
    `);
  };
  sharedMaterial = m;
  return m;
}

const tints = ['#fffaf3','#f5f5f1','#e7edf1','#efdfd1','#e7e7de','#f8efdf','#e3eaf0'];
function parts(lot, add) {
  const {w, h, d, kind, near} = lot;
  const tint = tints[Math.abs(lot.seed) % tints.length];
  if (lot.plinth) add(0, -.65, 0, w + 3, .65, d + 3, 7, '#c2bfb2');
  if (!near) {
    add(0, 0, 0, w, h, d, kind, tint);
    return;
  }
  const base = Math.min(h * .22, kind === 4 ? 5.1 : 3.8);
  const top = kind === 5 ? h * .78 : h;
  add(0, 0, 0, w * .96, base, d * .96, 6, tint);
  add(0, base, 0, w * .96, top - base, d * .96, kind, tint);
  add(0, base - .26, 0, w, .26, d, 7, '#ddd8cb');
  if (kind === 5) add(-w * .045, top, 0, w * .83, h - top, d * .81, kind, tint);
  if (kind === 3 || kind === 4) {
    const awning = ['#75938a','#ae7862','#7e879c'][lot.seed % 3];
    add(0, base * .79, d * .476, w * .77, .38, d * .046, 7, awning);
    add(-w * .34, .08, d * .482, w * .13, base * .64, .16, 7, '#b6bab3');
  }
  if (kind === 2) {
    const floors = Math.max(1, Math.round((h - base) / 3.25));
    for (let i = 1; i < floors; i++) {
      add(0, base + i * (h - base) / floors - .14, 0, w, .14, d, 7, '#e9e4da');
    }
  }
  if (kind === 0 || kind === 5) {
    for (const side of [-1, 1]) add(side * w * .47, base, 0, .22, top - base, d * .98, 7, '#d7ddd9');
  }
  const cap = kind === 5 ? .83 : .98;
  add(kind === 5 ? -w * .045 : 0, h, 0, w * cap, .22, d * cap, 7, '#d1d3cb');
  add(-w * .18, h + .22, -d * .15, w * .26, Math.min(3.2, h * .08), d * .21, 7, '#d0ccc1');
  add(w * .15, h + .22, d * .11, Math.min(3.8,w*.22), .86, Math.min(2.5,d*.19), 7, '#abb6b4');
}

// One draw for the close buildings and one for the background per street group.
// Ownership follows the host renderer's InstancedMesh disposal lifecycle.
export function addUrbanBuildings(T, group, lots) {
  const dummy = new T.Object3D();
  const color = new T.Color();
  for (const near of [false, true]) {
    const pieces = [];
    const buildings = lots.filter(lot => Boolean(lot.near) === near);
    for (const lot of buildings) {
      const angle = lot.rotation || 0, cos = Math.cos(angle), sin = Math.sin(angle);
      parts(lot, (x, y, z, w, h, d, tile, tint) => {
        const floors = tile === 6 ? 1 : Math.max(1, Math.round(h / (tile === 2 ? 3.25 : 3.85)));
        pieces.push({x: lot.x + x*cos + z*sin, y: (lot.y ?? 0) + y + h/2,
          z: lot.z + z*cos - x*sin, w, h, d, angle, tile, floors, tint, seed: lot.seed});
      });
    }
    if (!pieces.length) continue;
    const geometry = new T.BoxGeometry();
    const mesh = new T.InstancedMesh(geometry, material(T), pieces.length);
    const tiles = new Float32Array(pieces.length * 4);
    pieces.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.y = p.angle;
      dummy.scale.set(p.w, p.h, p.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(p.tint));
      tiles.set([p.tile, p.floors, (p.seed & 3) / 4, ((p.seed >>> 2) & 3) / 4], i * 4);
    });
    geometry.setAttribute('urbanTile', new T.InstancedBufferAttribute(tiles, 4));
    mesh.name = near ? 'urban-street-fronts' : 'urban-skyline';
    mesh.userData.buildingCount = buildings.length;
    mesh.castShadow = near;
    mesh.receiveShadow = near;
    mesh.computeBoundingSphere();
    mesh.addEventListener('dispose', () => geometry.dispose());
    group.add(mesh);
  }
}
