/* Medida de ocupación compartida por medir.js y proponer.js: se ejecuta dentro de la página (page.evaluate). */
/* medida dentro de la página */
const metric = () => {
  const s = document.querySelector('#screen'), cs = getComputedStyle(s), sr = s.getBoundingClientRect();
  const Z = { l: sr.left + parseFloat(cs.paddingLeft), t: sr.top + parseFloat(cs.paddingTop), r: sr.right - parseFloat(cs.paddingRight), b: sr.bottom - parseFloat(cs.paddingBottom) };
  const W = Z.r - Z.l, H = Z.b - Z.t, rects = [];
  const vis = e => { const st = getComputedStyle(e); return st.visibility !== 'hidden' && st.display !== 'none' && +st.opacity > 0.05; };
  const add = r => { if (r.width > 2 && r.height > 2) rects.push(r); };
  const walk = e => {
    if (!vis(e)) return;
    const tag = e.tagName.toLowerCase();
    if (tag === 'svg' || tag === 'img' || tag === 'canvas') { add(e.getBoundingClientRect()); return; }
    const st = getComputedStyle(e);
    const painted = (st.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor)) || st.backgroundImage !== 'none' || st.boxShadow !== 'none' || parseFloat(st.borderTopWidth) > 0;
    if (painted && !e.matches('.screen,#screen')) add(e.getBoundingClientRect());
    for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) add(r); }
    for (const c of e.children) walk(c);
  };
  walk(s);
  const clip = r => ({ l: Math.max(r.left, Z.l), t: Math.max(r.top, Z.t), r: Math.min(r.right, Z.r), b: Math.min(r.bottom, Z.b) });
  const cr = rects.map(clip).filter(r => r.r > r.l && r.b > r.t);
  let bb = cr.reduce((a, r) => ({ l: Math.min(a.l, r.l), t: Math.min(a.t, r.t), r: Math.max(a.r, r.r), b: Math.max(a.b, r.b) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
  const N = 48, cell = Array(N * N).fill(0);
  for (const r of cr) {
    const x0 = Math.floor((r.l - Z.l) / W * N), x1 = Math.ceil((r.r - Z.l) / W * N), y0 = Math.floor((r.t - Z.t) / H * N), y1 = Math.ceil((r.b - Z.t) / H * N);
    for (let y = Math.max(0, y0); y < Math.min(N, y1); y++) for (let x = Math.max(0, x0); x < Math.min(N, x1); x++) cell[y * N + x] = 1;
  }
  let gap = 0, run = 0;
  for (let y = 0; y < N; y++) { const empty = !cell.slice(y * N, y * N + N).some(Boolean); run = empty ? run + 1 : 0; gap = Math.max(gap, run); }
  const q = s.querySelector('h2.q, .q, h2'), opt = s.querySelector('.opt');
  let art = 0; s.querySelectorAll('svg').forEach(v => { if (!v.closest('.opt') && !v.parentElement.closest('svg')) art = Math.max(art, Math.round(v.getBoundingClientRect().height)); });
  // algo que se sale de su tarjeta o botón blanco (más de 2 px)
  let fuera = 0; const box = '.panel,.opt,.mbig,.tcard,.mcap,.mstory,.stone,.ctab,.chap,.famline';
  s.querySelectorAll(box).forEach(c => { const R = c.getBoundingClientRect(); if (!R.width) return;
    c.querySelectorAll('svg,span,b,p,small,img').forEach(k => { if (k.closest(box) !== c || k.parentElement.closest('svg')) return; const r = k.getBoundingClientRect(); if (!r.width) return;
      const inl = getComputedStyle(k).display === 'inline'; // en letras sueltas solo cuenta el lado: su caja invisible sobresale arriba y abajo
      if (r.left < R.left - 2 || r.right > R.right + 2 || (!inl && (r.top < R.top - 2 || r.bottom > R.bottom + 2))) fuera++; }); });
  const t = s.querySelector('.tabwrap');
  return {
    zona: `${Math.round(W)}×${Math.round(H)}`,
    alto: Math.round((bb.b - bb.t) / H * 100), ancho: Math.round((bb.r - bb.l) / W * 100),
    relleno: Math.round(cell.reduce((a, b) => a + b, 0) / (N * N) * 100), hueco: Math.round(gap / N * 100),
    desb: (s.scrollHeight - s.clientHeight) + (t ? Math.max(0, t.scrollHeight - t.clientHeight) : 0),
    fuera, letra: q ? Math.round(parseFloat(getComputedStyle(q).fontSize)) : 0, resp: opt ? Math.round(opt.getBoundingClientRect().height) : 0, dibujo: art,
  };
};
module.exports = { metric };
