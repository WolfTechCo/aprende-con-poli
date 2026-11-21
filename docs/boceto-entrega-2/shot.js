const { chromium } = require('playwright');
const OUT = process.argv[2], ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const DEV = { tabletH: [1024, 768], tabletV: [768, 1024], cellV: [390, 844], cellH: [844, 390], pc: [1366, 768] };
const seed = () => {
  localStorage.clear();
  localStorage.setItem('poli-recorrido-visto', '99'); localStorage.setItem('poli-recorrido-ajustes-visto', '99'); localStorage.setItem('poli-novedades-visto', '9.9.9');
};
const fill = () => {
  const day = k => { const d = new Date(); d.setDate(d.getDate() - k); return dayKey(d); };
  addProfile('Ana', 'a');
  for (const ch of [1, 2, 3]) { const C = CH[ch]; prog(C.intro).lesson = true; C.figs.forEach((F, i) => { if (ch < 3 || i < 3) { const p = prog(F.id); p.lesson = true; if (ch === 1 || i < 2) { Object.assign(p, { build: true, paint: true, hunt: true, k1: true, k2: true }); } } }); }
  save.challenge = 3;
  const now = Date.now();
  save.stats = { poli: { n: 40, h: '11111111110111111111', last: now }, fig3d: { n: 22, h: '11011101110111011110', last: now }, udc: { n: 14, h: '10011010011010', last: now }, valor: { n: 3, h: '110', last: now - 864e5 } };
  save.days = [day(3), day(2), day(1), day(0)];
  save.acc = 'corona'; save.badges = medalsEarned(); persist();
  addProfile('Tomás', 'o'); save.stats = { poli: { n: 8, h: '10110111', last: now } }; prog('intro').lesson = true; persist();
  switchProfile(root.order[0]);
};
(async () => {
  const b = await chromium.launch();
  const steps = {
    portada: async p => { await p.evaluate(() => go('welcome')); },
    mapa: async p => { await p.evaluate(() => go('map')); },
    menu: async p => { await p.evaluate(() => go('map')); await p.waitForTimeout(300); await p.click('#bMenu'); },
    casita: async p => { await p.evaluate(() => go('map')); await p.waitForTimeout(300); await p.click('#bHome'); },
    premios: async p => { await p.evaluate(() => go('premios')); },
    medallas: async p => { await p.evaluate(() => go('medallas')); },
    ropa: async p => { await p.evaluate(() => go('ropa')); },
    avance: async p => { await p.evaluate(() => go('avance', { ch: 1 })); await p.waitForTimeout(900); await p.click('.tcard'); },
    candado: async p => { await p.evaluate(() => go('adultos', { from: 'map' })); },
    rincon: async p => { await p.evaluate(() => go('adultos', { from: 'map', ok: true, sec: 'kids', edit: root.order[0] })); },
    rinconlista: async p => { await p.evaluate(() => go('adultos', { from: 'map', ok: true })); },
    stickers: async p => { await p.evaluate(() => go('album', { ch: 1 })); },
    stickers2: async p => { await p.evaluate(() => go('album', { ch: 3 })); },
    avance3: async p => { await p.evaluate(() => go('avance', { ch: 3 })); await p.waitForTimeout(900); await p.click('.tcard.prac'); },
  };
  const report = [];
  for (const [dn, [w, h]] of Object.entries(DEV)) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dn.startsWith('cell') ? 2 : 1, hasTouch: dn.startsWith('cell') || dn.startsWith('tablet') });
    const p = await ctx.newPage(); p.on('pageerror', e => report.push(`${dn} ERROR ${e.message}`));
    await p.goto('http://localhost:8765/'); await p.evaluate(seed); await p.reload(); await p.waitForTimeout(300); await p.evaluate(fill); await p.reload(); await p.waitForTimeout(400);
    for (const [sn, fn] of Object.entries(steps)) {
      if (ONLY && !ONLY.includes(sn)) continue;
      await fn(p); await p.waitForTimeout(1300);
      const ov = await p.evaluate(() => { const s = document.querySelector('#screen'); const inner = s.firstElementChild; const t = document.querySelector('.tabwrap'); return { scr: (s.scrollHeight - s.clientHeight) + (t ? Math.max(0, t.scrollHeight - t.clientHeight) : 0), page: document.documentElement.scrollHeight - innerHeight }; });
      report.push(`${dn} ${sn} desborde=${ov.scr}px`);
      await p.screenshot({ path: `${OUT}/${sn}-${dn}.jpg`, type: 'jpeg', quality: 82 });
    }
    await ctx.close();
  }
  await b.close(); console.log(report.join('\n'));
})();
