/* Capturas de la fase 2 de la entrega 3.1 (figuras nuevas del capítulo 5): la app real con los estilos de
   boceto-figuras.js. No cambia la app. Uso (servidor local en 8766):
     node figuras.js [tamaños] [estilos] [preguntas]
     node figuras.js                       # tabV,celV,celH · hoy,A,B,C · ms_tot,ms_pic,me_yes,m5_prob,intro
   Guarda en ./propuesta-figuras/<tamaño>-<pregunta>-<estilo>.jpg y anota la ocupación (metrica.js). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { metric } = require('./metrica');
const OUT = path.join(__dirname, 'propuesta-figuras'); fs.mkdirSync(OUT, { recursive: true });
const BOS = fs.readFileSync(path.join(__dirname, 'boceto-figuras.js'), 'utf8');
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], bajoV: [360, 640], bajoH1: [667, 375], pc: [1366, 768] };
const SIZES = (process.argv[2] || 'tabV,celV,celH').split(','), STY = (process.argv[3] || 'hoy,A,B,C').split(',');
/* pregunta:tema (el tema fija la cosa dibujada, para ver todas; «hoy» usa la más parecida de la app actual) */
const QS = (process.argv[4] || 'ms_tot:empa,ms_tot:huevo,ms_pic:fruti,me_yes:lapiz,m5_prob,intro:sopa').split(',');
const HOY = { empa: 'galle', huevo: 'huevo', fruti: 'fruti', lapiz: 'galle', sopa: 'sopa' };
// en el boceto, los dibujos de los cuentos crecen como cosas reales (no como letras)
const CSS = '.memo{gap:6px 10px}.memo .bf-st{width:clamp(56px,min(15vw,11vh),120px);height:auto}@media (orientation:landscape) and (max-height:500px){.memo .bf-st{width:min(13vh,60px)}}';
(async () => {
  const b = await chromium.launch(), rep = [];
  for (const dn of SIZES) for (const st of STY) {
    const [w, h] = DEV[dn];
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: dn !== 'pc' });
    const p = await ctx.newPage(); p.on('pageerror', e => rep.push(`${dn} ${st} ERROR ${e.message}`));
    await p.goto('http://127.0.0.1:8766/');
    await p.evaluate(() => { localStorage.clear(); for (const [k, x] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, x); });
    await p.reload(); await p.evaluate(() => { addProfile('Ana', 'a'); save.voice = false; persist(); });
    await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' });
    if (st !== 'hoy') {
      await p.evaluate(BOS); // la app solo permite scripts propios (CSP): el boceto entra por evaluate
      await p.evaluate(st => {
        const F = window.BOCETO_FIG;
        MTH.splice(0, MTH.length, ...F.THEMES);
        window.grpSvg = (sizes, th, o = {}) => F.grp(sizes, th, { ...o, cols: o.cols || mCols(sizes.length) }, st);
        STORIES.forEach((S, i) => { S.ico = F.storyIco(F.STORY_KEYS[i], st); });
      }, st);
      await p.addStyleTag({ content: CSS });
    }
    const rec = async name => {
      await p.waitForTimeout(220); const m = await p.evaluate(metric);
      rep.push(`${dn.padEnd(5)} ${st.padEnd(3)} ${name.padEnd(8)} alto ${String(m.alto).padStart(3)}% ancho ${String(m.ancho).padStart(3)}% fuera ${m.fuera ?? '-'}`);
      await p.screenshot({ path: `${OUT}/${dn}-${name}-${st}.jpg`, type: 'jpeg', quality: 82 });
    };
    for (const qk of QS) {
      const [k, tk] = qk.split(':'), name = tk ? `${k}-${tk}` : k;
      if (tk) await p.evaluate(([t, st, H]) => { window._MTH0 = window._MTH0 || MTH.slice(); const all = st === 'hoy' ? window._MTH0 : window.BOCETO_FIG.THEMES; MTH.splice(0, MTH.length, all.find(x => x.k === (st === 'hoy' ? H[t] : t))); }, [tk, st, HOY]);
      if (k === 'intro') {
        await p.evaluate(() => { let s = 11; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; go('lesson', { id: CH[5].intro }); });
        await p.waitForTimeout(300); await rec(name); continue;
      }
      await p.evaluate(k => {
        let s = k === 'm5_prob' ? 9 : 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; // mismo ejercicio en todos los estilos
        if (cur.name !== 'lesson') go('lesson', { id: 'mtabla510' });
        const q = NQ[k](); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
        choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } });
        $('#action').hidden = true; $('#title').textContent = 'Sumas que se repiten'; poli.say('¿Cuál es la respuesta? Mira bien el dibujo.');
      }, k);
      await rec(name);
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/medidas.txt`, rep.join('\n'));
  console.log(rep.join('\n'));
})();
