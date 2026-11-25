export const LETTER_FONTS={sans:'角ゴシック',round:'丸文字',serif:'明朝'};
const fonts={sans:'"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',round:'"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif',serif:'"Hiragino Mincho ProN", "Yu Mincho", serif'};
const clamp=(v,a,b,d)=>typeof v==='number'&&Number.isFinite(v)?Math.max(a,Math.min(b,v)):d;
export function normalizeLetter(value){const v=value&&typeof value==='object'?value:{};return {text:typeof v.text==='string'?[...v.text.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,' ').trim()].slice(0,24).join(''):'',color:/^#[0-9a-f]{6}$/i.test(v.color||'')?v.color.toLowerCase():'#183e52',font:Object.hasOwn(LETTER_FONTS,v.font)?v.font:'sans',size:clamp(v.size,4,16,10),x:clamp(v.x,10,90,50),y:clamp(v.y,8,32,20),outline:v.outline!==false};}
export function normalizeLettering(v){return v&&typeof v==='object'?{side:normalizeLetter(v.side),front:normalizeLetter(v.front)}:null;}
export function drawLetter(ctx,value){
 const d=normalizeLetter(value),w=ctx.canvas.width,h=ctx.canvas.height;ctx.clearRect(0,0,w,h);if(!d.text)return;
 ctx.save();ctx.font='700 '+(h*d.size/100)+'px '+fonts[d.font];ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 const x=w*d.x/100,y=h*(1-d.y/100),available=2*Math.min(x-w*.025,w*.975-x),scale=Math.min(1,available/(ctx.measureText(d.text).width+h*.012));
 ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=d.color;
 if(d.outline){const rgb=d.color.match(/[a-f\d]{2}/g).map(x=>parseInt(x,16));ctx.strokeStyle=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>150?'#18282d':'#fffaf0';ctx.lineWidth=h*.004;ctx.strokeText(d.text,0,0);}
 ctx.fillText(d.text,0,0);ctx.restore();
}
