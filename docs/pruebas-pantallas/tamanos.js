const { chromium } = require('playwright');
const OUT = './capturas';
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], bajoV: [360, 640], bajoH1: [667, 375], bajoH2: [740, 360], pc: [1366, 768], celV2: [412, 915], tabV2: [768, 1024], tabV3: [1024, 1366], pcL: [1920, 1080] };
const ONLY = process.argv[2] ? process.argv[2].split(',') : Object.keys(DEV), TAG = process.argv[3] || '';
const seed = () => { localStorage.clear(); for (const [k, v] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, v); };
const fill = () => {
  addProfile('Ana', 'a'); save.voice = false;
  for (const ch of [1, 2, 3, 4]) { const C = CH[ch]; prog(C.intro).lesson = true; C.figs.forEach(F => { Object.assign(prog(F.id), { lesson: true, build: true, paint: true, hunt: true, g1: true, g2: true }); }); }
  save.challenge = 3; save.challenge3d = 3; save.challengeNum = 3; save.challengePat = 3; save.ch = 4;
  const now = Date.now(); save.stats = { poli: { n: 40, h: '11111111110111111111', last: now }, pcolor: { n: 9, h: '110111011', last: now } };
  persist();
};
const metric = () => {
  const s = document.querySelector('#screen'), right = innerWidth;
  let maxR = 0;
  s.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.height) maxR = Math.max(maxR, r.right); });
  const t = s.querySelector('.tabwrap');
  return { v: (s.scrollHeight - s.clientHeight) + (t ? Math.max(0, t.scrollHeight - t.clientHeight) : 0), x: Math.round(maxR - right), page: document.documentElement.scrollHeight - innerHeight };
};
(async () => {
  const b = await chromium.launch(), report = [];
  for (const dn of ONLY) {
    const [w, h] = DEV[dn];
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: dn !== 'pc' });
    const p = await ctx.newPage(); p.on('pageerror', e => report.push(`${dn} ERROR ${e.message}`));
    await p.goto('http://127.0.0.1:8766/'); await p.evaluate(seed); await p.reload(); await p.waitForTimeout(300); await p.evaluate(fill); await p.reload(); await p.waitForTimeout(400);
    const rec = async (name, shot = true) => {
      await p.waitForTimeout(250); const m = await p.evaluate(metric);
      report.push(`${dn} ${name}: alto=${m.v} lado=${m.x}${m.page > 0 ? ' pagina=' + m.page : ''}`);
      if (shot) await p.screenshot({ path: `${OUT}/${TAG}${dn}-${name}.jpg`, type: 'jpeg', quality: 60 });
    };
    await p.evaluate(() => { save.ch = 5; persist(); go('map'); }); await p.waitForTimeout(900); await rec('mapa5');
    await p.evaluate(() => { save.ch = 4; persist(); go('map'); }); await p.waitForTimeout(700); await rec('mapa4');
    await p.evaluate(() => go('album', { ch: 5 })); await p.waitForTimeout(500); await rec('stickers5');
    await p.evaluate(() => go('avance', { ch: 5 })); await p.waitForTimeout(900); await rec('avance5');
    for (const id of ['msuma', 'mesmul', 'mtabla2', 'mtabla510']) { await p.evaluate(i => go('island', { id: i }), id); await p.waitForTimeout(500); await rec('isla-' + id); }
    for (const id of ['intro5', 'msuma', 'mesmul', 'mtabla2', 'mtabla510']) {
      await p.evaluate(i => go('lesson', { id: i }), id); await p.waitForTimeout(500);
      for (let st = 0; st < 12; st++) {
        const name = await p.evaluate(() => cur.name); if (name !== 'lesson') break;
        await rec(`lec-${id}-${st}`);
        const pl = await p.$$('.pl'); for (const e of pl) { await e.click({ timeout: 1500 }).catch(() => { }); await p.waitForTimeout(120); }
        const opts = await p.$$('.opt');
        for (const o of opts) {
          const dis = await o.evaluate(e => e.classList.contains('right') || e.classList.contains('wrong')); if (dis) continue;
          await o.click({ timeout: 1500 }).catch(() => { }); await p.waitForTimeout(150);
          const ok = await p.evaluate(() => !document.querySelector('#action').disabled); if (ok) break;
        }
        await p.waitForTimeout(500);
        await p.click('#action', { timeout: 3000 }).catch(() => { });
        await p.waitForTimeout(350);
      }
    }
    const keys = await p.evaluate(() => Object.keys(N_TOPIC).filter(k => /^m[s2e5]_/.test(k)));
    for (const k of keys) {
      for (let i = 0; i < 4; i++) {
        await p.evaluate(k => {
          const q = NQ[k](); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
          choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } }); poli.say(q.voice || q.prompt);
        }, k);
        await rec(`q-${k}-${i}`, i === 0);
      }
    }
    await ctx.close();
  }
  await b.close();
  console.log(report.join('\n'));
})();
