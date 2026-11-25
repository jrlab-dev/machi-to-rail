/* Existing road surface extracted read-only; width constants apply to unused 2-lane mode. */
const W_SHLD=1,W_MED=.4,W_LANE=3;
function cv(w,h){ const c = document.createElement('canvas'); c.width=w; c.height=h; return c; }

function asphalt(g, w, h, base){
  g.fillStyle = base; g.fillRect(0,0,w,h);
  const img = g.getImageData(0,0,w,h), d = img.data;
  for(let i=0;i<d.length;i+=4){
    const n = Math.random()*10 - 4;
    d[i]+=n; d[i+1]+=n; d[i+2]+=n;
  }
  g.putImageData(img,0,0);
  for(let i=0;i<w*h/420;i++){
    g.fillStyle = `rgba(0,0,0,${Math.random()*0.10})`;
    g.fillRect(Math.random()*w, Math.random()*h, 2, 2);
  }
}


function roadTex(W, L, texW, texH, lanes, drawLaneDashes=true){
  const w = texW, h = texH;
  const px = w / W, pz = h / L;
  const c = cv(w,h), g = c.getContext('2d');
  asphalt(g, w, h, '#23262A');
  const X = m => (m + W/2)*px;
  const P = '#E9EDE2';
  g.fillStyle = P;
  const line = 0.15*px;
  if(lanes === 2){
    
    const edge = W/2 - W_SHLD;
    const med = W_MED/2;
    const laneSep = med + W_LANE;
    
    g.fillRect(X(-edge)-line/2, 0, line, h);
    g.fillRect(X( edge)-line/2, 0, line, h);
    
    g.fillRect(X(-med)-line/2, 0, line, h);
    g.fillRect(X( med)-line/2, 0, line, h);
    
    
    if(drawLaneDashes){
      for(let z=0; z<L; z+=10){
        g.fillRect(X(-laneSep)-line/2, z*pz, line, 5*pz);
        g.fillRect(X( laneSep)-line/2, z*pz, line, 5*pz);
      }
    }
  } else {
    
    g.fillRect(X(-3.0)-line/2, 0, line, h);
    g.fillRect(X( 3.0)-line/2, 0, line, h);
    
    g.save();
    g.globalAlpha = 0.16;
    g.fillStyle = '#3A3E44';
    g.fillRect(X(-4.5), 0, 1.5*px, h);
    g.fillRect(X( 3.0), 0, 1.5*px, h);
    g.restore();
    g.fillStyle = P;
  }
  return c;
}




window.RoadSurface={roadTex,asphalt};
