/* Mide cuánto del espacio útil usa el contenido (entrega 3.1).
   Uso (servidor local en 8766): node medir.js [tamaños] [etiqueta] [capítulo]
   - tamaños: tabV,tabH,celV,celH,bajoV,bajoH1,bajoH2,pc,celV2,tabV2,tabV3,pcL (por defecto: los 8 principales)
   - capítulo: 5 (por defecto), 3 o 4
   Por pantalla anota: alto% y ancho% (caja que encierra el contenido dentro de la zona útil), relleno% (cuadrícula de
   48×48: celdas con algo encima), hueco% (franja vacía horizontal más alta), desborde y tamaños (letra de la pregunta,
   alto de las respuestas y del dibujo más grande). Guarda capturas en ./capturas y el resumen en ./capturas/medidas-*.json. */
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = './capturas';
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], bajoV: [360, 640], bajoH1: [667, 375], bajoH2: [740, 360], pc: [1366, 768], celV2: [412, 915], tabV2: [768, 1024], tabV3: [1024, 1366], pcL: [1920, 1080] };
const MAIN = ['tabV', 'tabH', 'celV', 'celH', 'bajoH1', 'bajoH2', 'bajoV', 'pc'];
const ONLY = process.argv[2] ? process.argv[2].split(',') : MAIN, TAG = process.argv[3] || '', CHN = +(process.argv[4] || 5);
fs.mkdirSync(OUT, { recursive: true });
const seed = () => { localStorage.clear(); for (const [k, v] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, v); };
const fill = () => {
  addProfile('Ana', 'a'); save.voice = false;
  for (const ch of Object.keys(CH).map(Number)) { const C = CH[ch]; prog(C.intro).lesson = true; C.figs.forEach(F => { Object.assign(prog(F.id), { lesson: true, build: true, paint: true, hunt: true, g1: true, g2: true }); }); }
  save.challenge = 3; save.challenge3d = 3; save.challengeNum = 3; save.challengePat = 3; save.ch = 4;
  const now = Date.now(); save.stats = { poli: { n: 40, h: '11111111110111111111', last: now }, pcolor: { n: 9, h: '110111011', last: now } };
  persist();
};
const { metric } = require('./metrica');
(async () => {
  const b = await chromium.launch(), report = [], data = {};
  for (const dn of ONLY) {
    const [w, h] = DEV[dn];
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: dn !== 'pc' && dn !== 'pcL' });
    const p = await ctx.newPage(); p.on('pageerror', e => report.push(`${dn} ERROR ${e.message}`));
    await p.goto('http://127.0.0.1:8766/'); await p.evaluate(seed); await p.reload(); await p.waitForTimeout(300); await p.evaluate(fill); await p.reload(); await p.waitForTimeout(400);
    await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' });
    const rec = async (name, shot = true) => {
      await p.waitForTimeout(250); const m = await p.evaluate(metric);
      (data[name] = data[name] || {})[dn] = m;
      report.push(`${dn.padEnd(6)} ${name.padEnd(26)} alto ${String(m.alto).padStart(3)}% ancho ${String(m.ancho).padStart(3)}% relleno ${String(m.relleno).padStart(3)}% hueco ${String(m.hueco).padStart(2)}%${m.desb > 0 ? ' DESBORDE ' + m.desb : ''}${m.fuera ? ' FUERA ' + m.fuera : ''} · letra ${m.letra} resp ${m.resp} dibujo ${m.dibujo}`);
      if (shot) await p.screenshot({ path: `${OUT}/${TAG}c${CHN}-${dn}-${name}.jpg`, type: 'jpeg', quality: 60 });
    };
    const C = await p.evaluate(n => ({ intro: CH[n].intro, figs: CH[n].figs.map(F => F.id) }), CHN);
    await p.evaluate(n => { save.ch = n; persist(); go('map'); }, CHN); await p.waitForTimeout(900); await rec('mapa');
    await p.evaluate(n => go('album', { ch: n }), CHN); await p.waitForTimeout(500); await rec('stickers');
    await p.evaluate(n => go('avance', { ch: n }), CHN); await p.waitForTimeout(900); await rec('avance');
    for (const id of C.figs) { await p.evaluate(i => go('island', { id: i }), id); await p.waitForTimeout(500); await rec('isla-' + id); }
    for (const id of [C.intro, ...C.figs]) {
      await p.evaluate(i => go('lesson', { id: i }), id); await p.waitForTimeout(500);
      for (let st = 0; st < 12; st++) {
        const name = await p.evaluate(() => cur.name); if (name !== 'lesson') break;
        await rec(`lec-${id}-${st}`);
        const pl = await p.$$('.pl'); for (const e of pl) { await e.click({ timeout: 1500 }).catch(() => { }); await p.waitForTimeout(100); }
        const opts = await p.$$('.opt');
        for (const o of opts) {
          const dis = await o.evaluate(e => e.classList.contains('right') || e.classList.contains('wrong')); if (dis) continue;
          await o.click({ timeout: 1500 }).catch(() => { }); await p.waitForTimeout(150);
          const ok = await p.evaluate(() => !document.querySelector('#action').disabled); if (ok) break;
        }
        await p.waitForTimeout(400);
        await p.click('#action', { timeout: 3000 }).catch(() => { });
        await p.waitForTimeout(300);
      }
    }
    const ks = await p.evaluate(f => Object.keys(N_TOPIC).filter(k => f.includes(N_TOPIC[k]) && NQ[k]), C.figs);
    for (const k of ks) {
      await p.evaluate(k => {
        if (cur.name !== 'lesson') go('lesson', { id: CH[5].figs[0].id }); setAction(null);
        const q = NQ[k](); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
        choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } });
      }, k);
      await rec(`q-${k}`);
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/medidas-${TAG}c${CHN}.json`, JSON.stringify(data, null, 1));
  console.log(report.join('\n'));
})();
