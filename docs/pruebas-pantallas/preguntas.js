const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8766/'); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const keys = Object.keys(N_TOPIC).filter(k => /^m[s2e5]_/.test(k)), out = {};
    const txt = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    for (const k of keys) {
      let bad = 0, ex = '';
      for (let i = 0; i < 3000; i++) {
        const q = NQ[k](), oks = q.opts.filter(o => o.ok), hs = q.opts.map(o => o.html);
        const nums = q.opts.map(o => o.html).filter(h => typeof h === 'number');
        let prob = '';
        if (oks.length !== 1) prob = 'correctas=' + oks.length;
        else if (new Set(hs.map(String)).size !== hs.length) prob = 'repetidas';
        else if (q.opts.length !== 3) prob = 'opciones=' + q.opts.length;
        else if (nums.some(v => !Number.isInteger(v) || v <= 0 || v > 100)) prob = 'numero fuera ' + nums;
        else if (/[·]/.test((q.voice || '') + q.opts.map(o => (o.say || '') + (o.hint || '')).join(''))) prob = 'voz con punto';
        else { // nunca la multiplicación dada vuelta como opción incorrecta
          const exs = hs.map(txt).filter(t => /^\d+ ?· ?\d+$/.test(t)).map(t => t.split('·').map(s => +s.trim()));
          const right = txt(oks[0].html);
          if (/·/.test(right)) { const [a, c] = right.split('·').map(s => +s.trim()); if (a !== c && exs.some(([x, y]) => x === c && y === a)) prob = 'dada vuelta'; }
        }
        if (prob) { bad++; ex = prob + ' :: ' + txt(q.prompt) + ' | ' + hs.map(txt).join(' / '); }
      }
      out[k] = bad ? `${bad} malas, ej: ${ex}` : 'ok';
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errores', errs);
  await b.close();
})();
