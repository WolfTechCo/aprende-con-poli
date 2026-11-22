/* Revisión de pantallas (entrega 3.1). Una sola orden para todos los capítulos, con tamaños en paralelo y resultado
   «pasa / no pasa». Ver LEEME.md.
   Uso (servidor local en 8766):  node revisar.js [modo] [capítulos] [tamaños]
     modo:      rapido (tabV, celV, celH: por defecto) · completo (los 9 tamaños) · o una lista: tabV,celH
     capítulos: 5 (por defecto) · 3,4,5 · todos · general (portada, mapa, premios, Mi avance, adultos)
   Reglas (FALLA): error de la app · algo se pasa de la pantalla · un dibujo o texto se sale de su tarjeta ·
     algo queda cortado por su caja o tapado por otra cosa (por ejemplo el «¡Nuevo!» bajo la cabecera).
   Avisos: preguntas que usan poco alto, respuestas mucho más grandes que el dibujo (o al revés) y pantallas que
     empeoraron respecto de la pasada anterior (capturas/ultima.json).
   Deja capturas en ./capturas/<tamaño>/ y una lámina por tamaño (capturas/lamina-<tamaño>.jpg) para mirarlas de una vez. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const { metric } = require('./metrica');

const OUT = path.join(__dirname, 'capturas');
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], bajoV: [360, 640], bajoH1: [667, 375], bajoH2: [740, 360], pc: [1366, 768], celV2: [412, 915], tabV2: [768, 1024], tabV3: [1024, 1366], pcL: [1920, 1080] };
const MODOS = { rapido: ['tabV', 'celV', 'celH'], completo: ['tabV', 'tabH', 'celV', 'celH', 'bajoV', 'bajoH1', 'bajoH2', 'pc', 'celV2'] };
const [modo = 'rapido', capsArg = '5', tamArg] = process.argv.slice(2);
const SIZES = tamArg ? tamArg.split(',') : MODOS[modo] || modo.split(',');
const CAPS = capsArg === 'todos' ? ['general', 1, 2, 3, 4, 5] : capsArg.split(',').map(x => x === 'general' ? x : +x);
const PARALELO = Math.max(1, Math.min(SIZES.length, os.cpus().length));
// pantallas donde se permite deslizar (CLAUDE.md): el mapa en celular, el Rincón de adultos y las novedades
const DESLIZA = n => /^mapa|^adultos|^novedades/.test(n);

const seed = () => { localStorage.clear(); for (const [k, v] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, v); };
const fill = () => {
  addProfile('Ana', 'a'); save.voice = false;
  for (const ch of [1, 2, 3, 4]) { const C = CH[ch]; prog(C.intro).lesson = true; C.figs.forEach(F => Object.assign(prog(F.id), { lesson: true, build: true, paint: true, hunt: true, g1: true, g2: true })); }
  Object.assign(save, { challenge: 3, challenge3d: 3, challengeNum: 3, challengePat: 3, ch: 4 });
  const now = Date.now(); save.stats = { udc: { n: 30, h: '111101111011111', last: now }, valor: { n: 8, h: '10101100', last: now }, poli: { n: 40, h: '11111111110111111111', last: now } };
  persist();
};
/* cortado o tapado: insignias, pestañas, botones y tarjetas que no se ven enteros */
const recortes = () => {
  const out = [], SEL = '.cnew,.chap,.ctab,.opt,.pill,.tcard,.prize,.btn,#action,.tagx,.mcap';
  const vis = e => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > .05; };
  document.querySelectorAll(SEL).forEach(e => {
    if (!vis(e) || e.closest('[hidden]')) return;
    let r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const name = (e.className && e.className.baseVal === undefined ? e.className : e.id || e.tagName).toString().split(' ')[0] || e.id;
    // cortado por una caja con overflow distinto de visible (por ejemplo una fila que se desliza)
    // (dentro de una fila que se desliza de lado, lo que queda afuera a los lados está «por deslizar», no cortado)
    let desliza = false;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a); if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      if (s.overflowX === 'auto' || s.overflowX === 'scroll') desliza = true;
      const R = a.getBoundingClientRect(), v = Math.max(R.top - r.top, r.bottom - R.bottom), hz = desliza || s.overflowX === 'visible' ? 0 : Math.max(R.left - r.left, r.right - R.right);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && a.scrollHeight > a.clientHeight + 2) continue; // caja que se desliza hacia abajo
      if (Math.max(v, hz) > 2) { out.push(`cortado ${name} ${Math.round(Math.max(v, hz))}px`); return; }
    }
    // tapado: el centro y las esquinas de arriba deben ser del mismo elemento (o de algo dentro de él)
    if (desliza) return; // en una fila que se desliza basta con que no esté cortada arriba ni abajo
    // (no en las esquinas: los botones son redondeados y el navegador respeta la curva al tocar)
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const pts = [[cx, cy], [r.left + r.width * .2, cy], [r.right - r.width * .2, cy], [cx, r.top + Math.min(6, r.height * .3)]];
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { out.push(`fuera de la pantalla ${name}`); return; }
      const t = document.elementFromPoint(x, y);
      if (t && !e.contains(t) && !t.contains(e) && !t.closest('#confetti') && t.id !== 'confetti') {
        const tn = (t.closest('#bar') ? 'la cabecera' : t.closest('#dock') ? 'la barra de Poli' : (t.className && t.className.baseVal === undefined ? t.className : t.tagName).toString().split(' ')[0]);
        if (getComputedStyle(t).pointerEvents !== 'none') { out.push(`tapado ${name} por ${tn}`); return; }
      }
    }
  });
  return [...new Set(out)];
};

async function revisarTamano(browser, dn) {
  const [w, h] = DEV[dn], res = {}, errores = [], dir = path.join(OUT, dn);
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: !/^pc/.test(dn) });
  const p = await ctx.newPage(); p.on('pageerror', e => errores.push(e.message));
  await p.goto('http://127.0.0.1:8766/'); await p.evaluate(seed); await p.reload(); await p.waitForTimeout(250);
  await p.evaluate(fill); await p.reload(); await p.waitForTimeout(300);
  await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}#confetti{display:none!important}' });
  const rec = async (name, extra = {}) => {
    await p.waitForTimeout(160);
    const m = await p.evaluate(metric), rc = await p.evaluate(recortes);
    const kind = name.startsWith('q-') ? 'pregunta' : name.startsWith('lec-') ? 'leccion' : name.startsWith('juego-') ? 'juego' : 'pantalla';
    res[name] = { ...m, rc, kind, ...extra, err: errores.splice(0) };
    await p.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 55 });
  };
  const steps = async (prefix) => {
    for (let st = 0; st < 12; st++) {
      if (await p.evaluate(() => cur.name) !== 'lesson') break;
      await rec(`${prefix}-${st}`);
      for (const e of await p.$$('.pl')) await e.click({ timeout: 800 }).catch(() => { });
      for (const o of await p.$$('.opt')) {
        if (await o.evaluate(e => e.classList.contains('right') || e.classList.contains('wrong'))) continue;
        await o.click({ timeout: 800 }).catch(() => { }); await p.waitForTimeout(60);
        if (await p.evaluate(() => !document.querySelector('#action').disabled)) break;
      }
      await p.evaluate(() => { const a = document.querySelector('#action'); a.disabled = false; a.click(); }); await p.waitForTimeout(120);
    }
  };
  for (const ch of CAPS) {
    if (ch === 'general') {
      await p.evaluate(() => go('welcome')); await rec('g-portada');
      await p.evaluate(() => go('map')); await p.waitForTimeout(300); await rec('mapa');
      for (const v of ['premios', 'medallas', 'ropa', 'album', 'repaso']) { await p.evaluate(v => go(v), v).catch(() => { }); await rec('g-' + v); }
      await p.evaluate(() => { adultUnlocked = true; go('adultos'); }).catch(() => { }); await rec('adultos');
      continue;
    }
    const C = await p.evaluate(n => ({ intro: CH[n].intro, figs: CH[n].figs.map(F => ({ id: F.id, acts: ACTS[F.kind] || [] })) }), ch);
    await p.evaluate(n => { save.ch = n; persist(); go('map'); }, ch); await p.waitForTimeout(400); await rec(`mapa-c${ch}`);
    await p.evaluate(n => go('album', { ch: n }), ch); await rec(`c${ch}-stickers`);
    await p.evaluate(n => go('avance', { ch: n }), ch); await p.waitForTimeout(250); await rec(`c${ch}-avance`);
    for (const F of C.figs) { await p.evaluate(i => go('island', { id: i }), F.id); await rec(`c${ch}-isla-${F.id}`); }
    for (const id of [C.intro, ...C.figs.map(F => F.id)]) { await p.evaluate(i => go('lesson', { id: i }), id); await p.waitForTimeout(120); await steps(`lec-${id}`); }
    for (const F of C.figs) for (const k of F.acts.filter(k => k !== 'lesson')) {
      await p.evaluate(([i, k]) => ['build', 'paint', 'hunt'].includes(k) ? go(k, { id: i }) : go('game', { id: i, k }), [F.id, k]); await p.waitForTimeout(150);
      await rec(`juego-${F.id}-${k}`);
    }
    // cada tipo de pregunta del capítulo (motor de números: capítulos 3, 4 y 5)
    const ks = await p.evaluate(f => typeof N_TOPIC === 'undefined' ? [] : Object.keys(N_TOPIC).filter(k => f.includes(N_TOPIC[k]) && NQ[k]), C.figs.map(F => F.id));
    for (const k of ks) {
      await p.evaluate(([k, id]) => {
        if (cur.name !== 'lesson' || cur.id !== id) go('lesson', { id }); setAction(null);
        const q = NQ[k](); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
        choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } });
      }, [k, C.figs[0].id]);
      await rec(`q-${k}`);
    }
    await p.evaluate(n => go('challenge', { ch: n }), ch); await rec(`c${ch}-desafio`);
  }
  await ctx.close();
  return res;
}

/* reglas: qué falla y qué es aviso */
function juzgar(dn, name, m, antes) {
  const fallas = [], avisos = [];
  for (const e of m.err) fallas.push(`error de la app: ${e}`);
  if (m.desb > 0 && !DESLIZA(name)) fallas.push(`se pasa ${m.desb}px de la pantalla`);
  if (m.fuera > 0) fallas.push(`${m.fuera} dibujo(s) o texto(s) fuera de su tarjeta`);
  for (const r of m.rc) fallas.push(r);
  if (m.kind === 'pregunta') {
    if (m.alto < 70) avisos.push(`usa solo ${m.alto} % del alto`);
    if (m.zona && m.resp && (m.resp > m.zona * 1.6 || m.zona > m.resp * 4)) avisos.push(`respuestas ${m.resp}px y contenido ${m.zona}px de alto: no se ven parejos`);
  }
  if (m.kind === 'leccion' && m.alto < 55) avisos.push(`lección usa solo ${m.alto} % del alto`);
  // (las preguntas salen al azar: solo se avisa una baja grande)
  if (antes && antes.alto - m.alto >= 15) avisos.push(`empeoró: usaba ${antes.alto} % del alto y ahora ${m.alto} %`);
  if (antes && !antes.fallas && fallas.length) avisos.push('antes pasaba');
  return { fallas, avisos };
}

/* lámina: todas las capturas de un tamaño en una sola imagen */
async function lamina(browser, dn, names) {
  const [w, h] = DEV[dn], cols = w > h ? 4 : 6, tw = w > h ? 420 : 240, th = Math.round(tw * h / w);
  const imgs = names.map(n => `<figure><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(OUT, dn, n + '.jpg')).toString('base64')}"><figcaption>${n}</figcaption></figure>`).join('');
  const page = await browser.newPage({ viewport: { width: cols * (tw + 8) + 8, height: 600 } });
  await page.setContent(`<style>body{margin:0;padding:4px;background:#fff;font:12px sans-serif;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:8px}
    figure{margin:0}img{width:${tw}px;height:${th}px;display:block;border:1px solid #ccc}figcaption{padding:2px 0}</style>${imgs}`);
  await page.screenshot({ path: path.join(OUT, `lamina-${dn}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
  await page.close();
}

(async () => {
  const t0 = Date.now(); fs.mkdirSync(OUT, { recursive: true });
  const anterior = fs.existsSync(path.join(OUT, 'ultima.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'ultima.json'))) : {};
  const browser = await chromium.launch(), todo = {}, cola = [...SIZES];
  console.log(`Revisando ${SIZES.join(', ')} · capítulos ${CAPS.join(', ')} · ${PARALELO} a la vez`);
  await Promise.all(Array.from({ length: PARALELO }, async () => { while (cola.length) { const dn = cola.shift(); todo[dn] = await revisarTamano(browser, dn); console.log(`  ${dn} listo (${Object.keys(todo[dn]).length} pantallas)`); } }));
  let nF = 0, nA = 0, nP = 0; const lineas = [], guardar = {};
  for (const dn of SIZES) {
    guardar[dn] = {};
    for (const [name, m] of Object.entries(todo[dn])) {
      const { fallas, avisos } = juzgar(dn, name, m, anterior[dn] && anterior[dn][name]);
      nP++; nF += fallas.length ? 1 : 0; nA += avisos.length ? 1 : 0;
      for (const f of fallas) lineas.push(`FALLA  ${dn.padEnd(6)} ${name.padEnd(26)} ${f}`);
      for (const a of avisos) lineas.push(`aviso  ${dn.padEnd(6)} ${name.padEnd(26)} ${a}`);
      guardar[dn][name] = { alto: m.alto, ancho: m.ancho, relleno: m.relleno, hueco: m.hueco, resp: m.resp, dibujo: m.dibujo, fallas: fallas.length };
    }
  }
  await Promise.all(SIZES.map(dn => lamina(browser, dn, Object.keys(todo[dn]))));
  await browser.close();
  // la pasada anterior se reemplaza por esta (solo los tamaños revisados)
  fs.writeFileSync(path.join(OUT, 'ultima.json'), JSON.stringify({ ...anterior, ...Object.fromEntries(SIZES.map(dn => [dn, { ...(anterior[dn] || {}), ...guardar[dn] }])) }, null, 1));
  fs.writeFileSync(path.join(OUT, 'informe.txt'), lineas.join('\n'));
  console.log(lineas.sort().join('\n'));
  console.log(`\n${nF ? 'NO PASA' : 'PASA'}: ${nP} pantallas · ${nF} con falla · ${nA} con aviso · ${Math.round((Date.now() - t0) / 1000)} s`);
  console.log(`Láminas: ${SIZES.map(dn => `capturas/lamina-${dn}.jpg`).join(', ')}`);
  process.exitCode = nF ? 1 : 0;
})();
