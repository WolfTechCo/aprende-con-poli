/* Capturas para comparar la app actual con el boceto de la entrega 3.1 (boceto-3-1.css).
   Uso (servidor local en 8766): node proponer.js [tamaños] [variantes]
   variantes: hoy, A, B, C (de pie A, B y C son iguales). Guarda en ./propuesta y anota las medidas. */
const { chromium } = require('playwright');
const fs = require('fs');
const { metric } = require('./metrica');
const OUT = './propuesta'; fs.mkdirSync(OUT, { recursive: true });
const CSS = fs.readFileSync(__dirname + '/boceto-3-1.css', 'utf8');
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], bajoV: [360, 640], bajoH1: [667, 375], bajoH2: [740, 360], pc: [1366, 768] };
const ONLY = (process.argv[2] || 'tabV,tabH,celV,celH,bajoH1,pc').split(','), VARS = (process.argv[3] || 'hoy,A,B,C').split(',');
const QS = ['ms_tot', 'ms_mul', 'me_yes', 'me_turn', 'm2_res', 'm5_bar', 'm5_prob', 'm2_bike'];
const LS = [['intro5', 0], ['mesmul', 2], ['mtabla2', 1], ['mtabla2', 2], ['mtabla510', 3]];
(async () => {
  const b = await chromium.launch(), rep = [];
  for (const dn of ONLY) {
    const [w, h] = DEV[dn], land = w > h;
    for (const v of VARS) {
      if (!land && (v === 'B' || v === 'C')) continue;
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: dn !== 'pc' });
      const p = await ctx.newPage(); p.on('pageerror', e => rep.push(`${dn} ${v} ERROR ${e.message}`));
      await p.goto('http://127.0.0.1:8766/');
      await p.evaluate(() => { localStorage.clear(); for (const [k, x] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, x); });
      await p.reload(); await p.evaluate(() => { addProfile('Ana', 'a'); save.voice = false; persist(); });
      await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' });
      if (v !== 'hoy') { await p.addStyleTag({ content: CSS }); await p.evaluate(c => document.documentElement.classList.add('opt' + c), v); }
      const rec = async name => {
        await p.waitForTimeout(200); const m = await p.evaluate(metric);
        rep.push(`${dn.padEnd(6)} ${v.padEnd(3)} ${name.padEnd(16)} alto ${String(m.alto).padStart(3)}% ancho ${String(m.ancho).padStart(3)}% relleno ${String(m.relleno).padStart(3)}% hueco ${String(m.hueco).padStart(2)}%${m.desb > 0 ? ' DESBORDE ' + m.desb : ''} · letra ${m.letra} resp ${m.resp} dibujo ${m.dibujo}`);
        await p.screenshot({ path: `${OUT}/${dn}-${name}-${v}.jpg`, type: 'jpeg', quality: 70 });
      };
      for (const k of QS) {
        await p.evaluate(k => {
          let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; // mismo ejercicio en todas las variantes
          if (cur.name !== 'lesson') go('lesson', { id: 'mtabla510' });
          const q = NQ[k](); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
          choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } });
          $$('svg.mg:not(.arr)').forEach(s => { const g = s.getBBox(), m = 4; s.setAttribute('viewBox', `${g.x - m} ${g.y - m} ${g.width + 2 * m} ${g.height + 2 * m}`); s.style.setProperty('--vw', Math.round(g.width + 2 * m)); s.style.setProperty('--vh', Math.round(g.height + 2 * m)); });
          $('#action').hidden = true; $('#title').textContent = 'Las tablas del 5 y del 10'; poli.say('¿Cuál es la respuesta? Mira bien el dibujo.');
        }, k);
        await rec('q-' + k);
      }
      for (const [id, st] of LS) {
        await p.evaluate(i => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; go('lesson', { id: i }); }, id); await p.waitForTimeout(250);
        for (let i = 0; i < st; i++) { await p.evaluate(() => { const a = document.querySelector('#action'); a.hidden = false; a.disabled = false; a.click(); }); await p.waitForTimeout(200); }
        await p.evaluate(() => { $$('svg.mg:not(.arr)').forEach(s => { const g = s.getBBox(), m = 4; s.setAttribute('viewBox', `${g.x - m} ${g.y - m} ${g.width + 2 * m} ${g.height + 2 * m}`); s.style.setProperty('--vw', Math.round(g.width + 2 * m)); s.style.setProperty('--vh', Math.round(g.height + 2 * m)); }); });
        await rec(`lec-${id}-${st}`);
      }
      await ctx.close();
    }
  }
  await b.close();
  fs.writeFileSync(`${OUT}/medidas.txt`, rep.join('\n'));
  console.log(rep.join('\n'));
})();
