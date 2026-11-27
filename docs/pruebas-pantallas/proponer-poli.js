/* Capturas para decidir DÓNDE va Poli (Poli nuevo, 27-11-2026), sobre pantallas reales de la app, con el boceto C como Poli
   provisorio. Formas:
   - hoy: la franja de abajo de hoy;
   - delgada: franja baja que solo lleva el globito; Poli se para encima del borde;
   - rincon: sin franja; Poli chico en el rincón de abajo y un globito que aparece sobre él al hablar;
   - pregunta: sin franja; Poli junto al enunciado y el enunciado es su globito (hoy el texto sale dos veces).
   Uso (servidor local en 8766): node proponer-poli.js [tamaños] [formas] [SALIDA.png]
   Deja una lámina: filas = pantalla y tamaño, columnas = formas, con el alto que usa el contenido (metrica.js). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const { metric } = require('./metrica');
global.window = {}; require('./boceto-mascotas.js'); require('./boceto-poli.js');
const { svg } = window.BOCETO_POLI;
const DEV = { tabV: [820, 1180], tabH: [1180, 820], celV: [390, 844], celH: [844, 390], pc: [1366, 768] };
const [devTxt = 'celV,tabV,celH', formasTxt = 'hoy,delgada,rincon,pregunta', salida = 'propuesta-poli.png'] = process.argv.slice(2);
const DEVS = devTxt.split(','), FORMAS = formasTxt.split(',');
const NOMBRE = { hoy: 'Franja de hoy', delgada: 'Franja delgada', rincon: 'Rincón + globito', pregunta: 'Junto a la pregunta' };
const CSS = {
  hoy: '',
  delgada: `#dock{min-height:0!important;padding:0 12px 6px!important;gap:8px!important}#dock::before{height:44px!important}
    #poli{width:70px!important;margin:-34px 0 0!important}#bubble{margin-bottom:4px!important;max-height:56px!important;padding:7px 12px!important;font-size:15px!important;border-radius:18px!important}`,
  rincon: `#dock{position:absolute!important;left:0;right:0;bottom:0;min-height:0!important;padding:0 6px 4px!important;background:none!important;pointer-events:none}
    #dock::before{display:none!important}#poli{width:66px!important;margin:0!important}
    #bubble{position:absolute!important;left:62px;bottom:64px;flex:none!important;max-width:min(70%,420px);margin:0!important;padding:8px 12px!important;font-size:15px!important;border-radius:18px!important;box-shadow:0 4px 0 #c7c9f0,0 10px 20px rgba(20,60,120,.25)!important;pointer-events:auto}
    #bubble::before{left:6px!important;bottom:-12px!important;border:8px solid transparent!important;border-top:14px solid #fff!important;border-bottom:0!important}
    #action{position:relative;z-index:7}`,
  pregunta: `#dock{min-height:0!important;padding:0 12px 8px!important;justify-content:flex-end;background:none!important}#dock::before,#poli,#bubble{display:none!important}.poliq.lec{margin:8px auto 0}.poliq.lec h2.q{font-size:clamp(15px,2vw,22px)!important;font-weight:600}
    .poliq{display:flex;align-items:flex-end;gap:6px;margin:0 auto;max-width:min(100%,720px)}
    .poliq>.mini{width:clamp(56px,10vw,120px);flex:none}.poliq>.mini svg{width:100%;height:auto;overflow:visible}
    .poliq h2.q{position:relative;background:#fff;color:#2b2d6e!important;text-shadow:none!important;border-radius:18px;padding:8px 14px;margin:0 0 clamp(4px,1.4vh,14px)!important;
      font-size:clamp(16px,2.4vw,26px)!important;line-height:1.25!important;box-shadow:0 4px 0 #c7c9f0,0 10px 20px rgba(20,60,120,.25);text-align:left}
    .poliq h2.q::before{content:"";position:absolute;left:-12px;bottom:12px;border:8px solid transparent;border-right:14px solid #fff;border-left:0}`,
};
/* en horizontal (celular acostado) sobra espacio a la izquierda: Poli y su globito van ahí */
CSS.pregunta += `@media (orientation:landscape) and (max-height:600px){.poliq{position:absolute;left:10px;top:58px;z-index:4;flex-direction:column-reverse;align-items:flex-start;width:min(24vw,230px);margin:0}
  .poliq>.mini{width:64px}.poliq h2.q{margin:0 0 4px!important;padding:6px 10px;font-size:15px!important}.poliq h2.q::before{left:14px;bottom:-12px;border:8px solid transparent;border-top:14px solid #fff;border-bottom:0}
  .qwrap>h2.q{display:none}}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ppoli-'));
(async () => {
  const b = await chromium.launch(), fotos = [], errs = [];
  const poliHoy = svg('C', 'o', {}), poliHabla = svg('C', 'o', { boca: 'abierta' }), poliMira = svg('C', 'o', { ad: 120, boca: 'abierta', rot: -3 });
  for (const dn of DEVS) for (const pant of ['pregunta', 'leccion']) for (const fm of FORMAS) {
        const [w, h] = DEV[dn];
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: dn !== 'pc', bypassCSP: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(`${dn} ${fm} ${e.message}`));
    await p.goto('http://127.0.0.1:8766/');
    await p.evaluate(() => { localStorage.clear(); for (const [k, x] of [['poli-recorrido-visto', '99'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '9.9.9']]) localStorage.setItem(k, x); });
    await p.reload(); await p.evaluate(() => { addProfile('Ana', 'o'); save.voice = false; persist(); });
    await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' + CSS[fm] });
    if (pant === 'pregunta') await p.evaluate(([fm, mini]) => {
      let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
      go('lesson', { id: 'mtabla510' });
      const q = NQ.ms_tot(); const el = frame('<div class="progress"><i class="now"></i><i></i><i></i><i></i><i></i></div><div class="stepbody"></div>');
      choice(el.querySelector('.stepbody'), { prompt: q.prompt, shape: q.shape || '', opts: q.opts, cls: q.cls || '', onRight() { } });
      $('#action').hidden = true; $('#title').textContent = 'Suma y por'; poli.say(q.prompt);
      if (fm === 'pregunta') { const h2 = $('h2.q'), d = document.createElement('div'); d.className = 'poliq'; d.innerHTML = `<div class="mini">${mini}</div>`;
        if (innerWidth > innerHeight && innerHeight < 600) { d.innerHTML += `<h2 class="q">${h2.textContent}</h2>`; $('#screen').appendChild(d); } else { h2.before(d); d.appendChild(h2); } }
    }, [fm, poliHabla]);
    else { await p.evaluate(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; go('lesson', { id: 'mtabla2' }); }); await p.waitForTimeout(250);
      await p.evaluate(() => { const a = $('#action'); a.hidden = false; a.disabled = false; a.click(); });
      if (fm === 'pregunta') await p.evaluate(mini => { const d = document.createElement('div'); d.className = 'poliq lec';
        d.innerHTML = `<div class="mini">${mini}</div><h2 class="q">${$('#bubbleText').textContent}</h2>`;
        if (innerWidth > innerHeight && innerHeight < 600) $('#screen').appendChild(d); else { const pr = $('#screen .progress'); pr ? pr.after(d) : $('#screen .screen').prepend(d); } }, poliMira); }
    await p.evaluate(s => { const el = document.querySelector('#poli'); if (el) el.innerHTML = s; }, pant === 'leccion' ? poliMira : poliHoy);
    await p.evaluate(() => $$('svg.mg:not(.arr)').forEach(s => { const g = s.getBBox(), m = 4; s.setAttribute('viewBox', `${g.x - m} ${g.y - m} ${g.width + 2 * m} ${g.height + 2 * m}`); }));
    await p.waitForTimeout(250);
    const m = await p.evaluate(metric); m.px = await p.evaluate(() => Math.round($('#screen').getBoundingClientRect().height)); const f = path.join(tmp, `${dn}-${pant}-${fm}.png`);
    await p.screenshot({ path: f }); fotos.push({ f, dn, pant, fm, m, w, h });
    await ctx.close();
  }
  /* lámina: una fila por (tamaño, pantalla), una columna por forma */
  const cols = FORMAS.length, rows = [];
  for (let i = 0; i < fotos.length; i += cols) rows.push(fotos.slice(i, i + cols));
  const H = 420, cell = x => x ? `<div class="c"><img src="data:image/png;base64,${fs.readFileSync(x.f).toString('base64')}" style="height:${H}px;width:auto;max-width:${Math.round(H * 1.9)}px"><div class="m">${x.dn} · ${x.pant} · espacio para el contenido: ${x.m.px} px${x.m.desb > 0 ? ' · ⚠ se pasa ' + x.m.desb + ' px' : ''}</div></div>` : '<div class="c vacio">—</div>';
  const q = await b.newPage({ viewport: { width: 1600, height: 400 } });
  await q.setContent(`<style>body{margin:0;font:600 13px system-ui,sans-serif;color:#345;background:#fff}table{border-collapse:collapse}td,th{border:1px solid #e3e7f2;padding:4px;vertical-align:top;text-align:center}
    th{background:#f4f6fb;font-size:15px}.m{padding-top:3px}.vacio{color:#aab;padding-top:140px}</style>
    <table><tr>${FORMAS.map(f => `<th>${NOMBRE[f]}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${cell(x)}</td>`).join('')}</tr>`).join('')}</table>`);
  await q.waitForTimeout(300); await (await q.$('table')).screenshot({ path: salida });
  console.log(fotos.filter(Boolean).map(x => `${x.dn.padEnd(5)} ${x.pant.padEnd(9)} ${x.fm.padEnd(9)} espacio ${x.m.px}px alto ${x.m.alto}% relleno ${x.m.relleno}%${x.m.desb > 0 ? ' DESBORDE ' + x.m.desb : ''}`).join('\n'));
  console.log(JSON.stringify({ salida, errores: errs }));
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
