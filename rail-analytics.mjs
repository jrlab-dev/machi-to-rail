/* まちとレール アクセス解析（GA4）。
 * ゲームの処理は書き換えず、ボタンの操作と画面の変化を外から見て、回数と秒数だけを送る。
 * 電車の名前・写真・文字・街の配置など、作品の中身は送らない。
 * 数えない端末：?nocount=1 を一度開くと、その端末では読み込まない（?nocount=0 で戻す）。 */
const ID = 'G-W01HN3PX55';
const KEY = 'dev_nocount';

function toast(msg) {
  const d = document.createElement('div');
  d.textContent = msg;
  d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;' +
    'background:#222;color:#fff;padding:10px 16px;border-radius:10px;font:14px/1.4 sans-serif;';
  (document.body || document.documentElement).appendChild(d);
  setTimeout(() => d.remove(), 4000);
}

function counted() {
  try {
    const q = new URLSearchParams(location.search).get('nocount');
    if (q === '1') localStorage.setItem(KEY, '1');
    if (q === '0') localStorage.removeItem(KEY);
    if (q === '1' || q === '0') toast(q === '1' ? 'この端末は かぞえません（アクセス解析オフ）' : 'この端末も かぞえます（アクセス解析オン）');
    if (localStorage.getItem(KEY) === '1') return false;
  } catch (e) {}
  // 本番の住所以外（旧住所・手元の検査）では送らない。
  return location.hostname === 'rail.jr-genius.jp' && location.protocol === 'https:';
}

function start() {
  if (window.__railAnalytics || !counted()) return;
  window.__railAnalytics = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(tag);
  if (document.getElementById('world') && document.getElementById('play')) watchGame();
  if (document.getElementById('accept') && document.getElementById('receive')) watchMove();
}

function send(name, params) {
  try { window.gtag('event', name, params || {}); } catch (e) {}
}
const $ = s => document.querySelector(s);
const band = n => (n > 20 ? '21+' : String(n));
// ボタンを押したとき（ゲーム側の処理より先に呼ばれるが、ゲームの動きは変えない）
function onClick(selector, fn) {
  document.addEventListener('click', e => {
    const el = e.target instanceof Element ? e.target.closest(selector) : null;
    if (el) { try { fn(el, e); } catch (err) {} }
  }, true);
}
// 条件が満たされるまで待つ（ゲームの処理が終わった後の画面を見る）
function after(test, ms, fn) {
  const t0 = Date.now();
  const tick = () => {
    let ok = false;
    try { ok = test(); } catch (e) {}
    if (ok) { try { fn(); } catch (e) {} return; }
    if (Date.now() - t0 < ms) setTimeout(tick, 200);
  };
  setTimeout(tick, 0);
}
// 見本の街・わたしの街などの種類だけ（名前や中身ではない）。
// 街の一覧は開いたときに作り直されるので、そのときの印を覚え、切り替えたらこちらで更新する。
let knownTown = '';
const townId = () => knownTown;
function readTownList() { knownTown = $('#town-chooser[open] .town-card[aria-current="true"]')?.dataset.townId || knownTown; }

function watchGame() {
  const t0 = Date.now();
  let departs = 0, saves = 0, switches = 0, ready = false;

  // 1：遊べる状態になった（読み込みにかかった秒数）
  after(() => $('#loading')?.hidden, 180000, () => {
    ready = true;
    send('play_ready', { sec: Math.round((Date.now() - t0) / 1000) });
  });

  // 2：発車（停止ではなく走り出したとき）
  onClick('#play', btn => {
    const was = btn.textContent;
    if (!was.includes('発車')) return;
    after(() => btn.textContent.includes('停止'), 2000, () => {
      departs++;
      if (departs <= 50) send('depart', { nth: band(departs), town: townId() });
    });
  });

  // 3：電車づくりを開いた／電車を保存した（保存できたときだけ「この端末に保存済み」が書き込まれる）
  onClick('#paint-open', () => send('workshop_open', {}));
  onClick('#paint-save', btn => {
    const status = $('#save-status');
    if (btn.disabled || !status) return;
    const kind = btn.textContent.includes('上書き') || btn.textContent.includes('変更') ? 'update' : 'new';
    const obs = new MutationObserver(() => {
      if (!status.textContent.includes('保存済み')) return;
      obs.disconnect();
      saves++;
      send('train_save', { kind, nth: band(saves) });
    });
    obs.observe(status, { childList: true, characterData: true, subtree: true });
    setTimeout(() => obs.disconnect(), 120000); // 上書きの確認に答える時間も見る
  });

  // 4：街を切り替えた（選んだ街の種類だけ）
  onClick('#mode-build, #town-menu-open', () => after(() => $('#town-chooser')?.open, 3000, readTownList));
  onClick('.town-card', card => {
    const to = card.dataset.townId || '';
    if (card.getAttribute('aria-current') === 'true') return;
    const toastEl = $('#toast');
    if (!toastEl) return;
    // 切り替えが済むと「街を開きました。」と案内が新しく書き込まれる（やめた・失敗したときは出ない）
    const obs = new MutationObserver(() => {
      if (!toastEl.textContent.startsWith('街を開きました')) return;
      obs.disconnect();
      knownTown = to; switches++;
      if (switches <= 30) send('town_switch', { to });
    });
    obs.observe(toastEl, { childList: true, characterData: true, subtree: true });
    setTimeout(() => obs.disconnect(), 60000);
  });
  onClick('#town-empty', () => send('town_build', { from: 'empty' }));
  onClick('#town-edit-current', () => send('town_build', { from: 'current', town: townId() }));

  // 5：街をファイルに保存・写真・録画
  onClick('#save-town', () => send('town_file_save', {}));
  onClick('#photo', () => send('photo_save', {}));
  onClick('#record, #auto-record', b => send('video_record', { auto: b.id === 'auto-record' ? 1 : 0 }));

  // 6：ページを離れた・閉じた（遊んだ秒数と回数。同じ内容なら2度送らない）
  let last = '';
  function leave() {
    const sec = Math.round((Date.now() - t0) / 1000);
    const key = [departs, saves, switches, ready].join('|');
    if (key === last) return;
    last = key;
    send('leave', {
      sec, ready: ready ? 1 : 0, departs: band(departs), saves: band(saves), switches: band(switches),
      town: townId(), transport_type: 'beacon'
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });
  window.addEventListener('pagehide', leave);
}

function watchMove() {
  // 旧住所からの作品を受け取れた（ファイルか、旧住所の画面からの直接コピーか）
  onClick('#accept', () => {
    const how = document.getElementById('file')?.files?.length ? 'file' : 'window';
    after(() => !document.getElementById('play')?.hidden, 30000, () => send('move_receive', { how }));
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
