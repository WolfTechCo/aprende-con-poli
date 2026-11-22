/* Boceto de la fase 2 de la entrega 3.1: figuras nuevas del capítulo 5 en 3 estilos (A, B y C).
   No se carga en la app: figuras.js lo inyecta en la página para tomar capturas, y también se usa en Node
   para armar la página de propuesta (exporta las mismas funciones).
   Estilos:
     A · Tarjetas blancas: cada grupo en una tarjeta blanca, como las cosas reales de los capítulos 1 y 2.
     B · Mesa con mantel: los grupos sobre una mesa con mantel a cuadros (escena).
     C · Stickers: cada cosa con borde blanco grueso, como los stickers del álbum, sobre un círculo de color.
   En los tres, solo algunas cosas llevan carita (huevos, frutillas y la estrella), como se acordó. */
(function (root) {
  const INK = '#2b2d6e';
  /* ---------- caritas (solo en algunas cosas) ---------- */
  const face = (s = 1, y = 0) => `<g transform="translate(0 ${y}) scale(${s})"><circle cx="-3" cy="-1" r="1.35" fill="${INK}"/><circle cx="3" cy="-1" r="1.35" fill="${INK}"/><circle cx="-2.6" cy="-1.5" r=".45" fill="#fff"/><circle cx="3.4" cy="-1.5" r=".45" fill="#fff"/><path d="M-2 2.2Q0 4 2 2.2" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/><circle cx="-5" cy="1.6" r="1.4" fill="#ff8fab" opacity=".7"/><circle cx="5" cy="1.6" r="1.4" fill="#ff8fab" opacity=".7"/></g>`;
  /* ---------- cosas ---------- */
  const ITEM = {
    empa: () => `<path d="M-11 4A11 11 0 0 1 11 4Z" fill="#f6b955" stroke="#c9822a" stroke-width="1.8" stroke-linejoin="round"/>${[-150, -120, -90, -60, -30].map(a => { const r = a * Math.PI / 180; return `<circle cx="${(Math.cos(r) * 9.6).toFixed(1)}" cy="${(4 + Math.sin(r) * 9.6).toFixed(1)}" r="1.5" fill="#e09a3a"/>`; }).join('')}<path d="M-5 -1Q0 -4 5 -1" fill="none" stroke="#fff3c4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`,
    huevo: f => `<ellipse rx="8" ry="10" fill="#fffaf0" stroke="#d9c39a" stroke-width="1.8"/><ellipse cx="-3" cy="-4" rx="2" ry="3" fill="#fff"/>${f ? face(.9, 1.5) : ''}`,
    fruti: f => `<path d="M-10 -3Q0 17 10 -3Q5 -10 0 -7Q-5 -10 -10 -3z" fill="#ff4d5e" stroke="#d62f42" stroke-width="1.6"/><path d="M-6 -7L0 -12.5L6 -7L0 -5z" fill="#22c58b" stroke="#169a6b" stroke-width="1"/>${f ? face(.85, 1) : '<circle cx="-4" cy="0" r="1" fill="#ffe08a"/><circle cx="4" cy="1" r="1" fill="#ffe08a"/><circle cx="0" cy="6" r="1" fill="#ffe08a"/>'}`,
    sopa: () => `<circle r="10.5" fill="#f2a93b" stroke="#c9822a" stroke-width="1.8"/><circle r="6" fill="#f9cf7a"/><path d="M-3 -2Q0 -4 3 -2" fill="none" stroke="#c9822a" stroke-width="1.2" stroke-linecap="round"/><circle cx="2" cy="2.5" r="1.1" fill="#c9822a"/>`,
    lapiz: (f, c) => `<rect x="-4" y="-13" width="8" height="21" fill="${c}" stroke="${INK}" stroke-width="1.2"/><rect x="-4" y="-17" width="8" height="4.5" rx="1.5" fill="#ff8fab" stroke="${INK}" stroke-width="1.2"/><path d="M-4 8L0 16L4 8Z" fill="#f6d7a8" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M-1.4 13.2L0 16L1.4 13.2Z" fill="${INK}"/><rect x="-2.4" y="-11" width="1.6" height="17" fill="#fff" opacity=".45"/>`,
  };
  const COL = ['#ff4d5e', '#ffb703', '#22c58b', '#4ea8ff', '#9b6bff', '#ff8a3d'];
  /* posiciones dentro del recipiente (1 a 7) */
  const spots = (n, S = 28) => { const top = n <= 3 ? n : Math.ceil(n / 2), rows = n <= 3 ? [n] : [top, n - top];
    return rows.flatMap((m, r) => Array.from({ length: m }, (_, i) => [(i - (m - 1) / 2) * S, rows.length === 1 ? 0 : r ? 14 : -13])); };
  /* ---------- recipientes: fondo (detrás de las cosas) y frente (delante) ---------- */
  const CONT = {
    bandeja: { back: () => `<rect x="-52" y="-33" width="104" height="66" rx="14" fill="#c98a4b" stroke="#8a5a2b" stroke-width="2.6"/><rect x="-45" y="-27" width="90" height="54" rx="9" fill="#e8b47a"/><path d="M-38 -14H38M-38 0H38M-38 14H38" stroke="#d9a066" stroke-width="1.6"/>` },
    caja: { back: n => `<rect x="-52" y="-33" width="104" height="66" rx="9" fill="#eedcbc" stroke="#a07548" stroke-width="2.4"/>${spots(n).map(([x, y]) => `<ellipse cx="${x}" cy="${y + 4}" rx="13" ry="10" fill="#cfae80"/>`).join('')}`,
      front: n => spots(n).map(([x, y]) => `<path d="M${x - 13} ${y + 4}A13 9 0 0 0 ${x + 13} ${y + 4}" fill="#eedcbc" stroke="#a07548" stroke-width="1.4"/>`).join('') },
    plato: { back: () => `<ellipse rx="53" ry="34" fill="#fff" stroke="#4ea8ff" stroke-width="3.5"/><ellipse rx="41" ry="25" fill="none" stroke="#cfe4ff" stroke-width="2.5"/>` },
    pocillo: { back: () => `<ellipse rx="53" ry="34" fill="#ff8fab" stroke="#e05a7e" stroke-width="3"/><ellipse rx="45" ry="27" fill="#fff0f4"/>` },
    estuche: { back: () => `<rect x="-52" y="-2" width="104" height="34" rx="11" fill="#4ea8ff" stroke="#2a7fd6" stroke-width="2.4"/>`,
      front: () => `<rect x="-52" y="8" width="104" height="26" rx="11" fill="#4ea8ff" stroke="#2a7fd6" stroke-width="2.4"/><path d="M-43 13H43" stroke="#ffd36b" stroke-width="2.6" stroke-dasharray="3 2"/><circle cx="46" cy="13" r="3.4" fill="#ffd36b" stroke="#e09a00"/>` },
  };
  /* temas: cosa + recipiente (mismos campos que MTH de la app) */
  const THEMES = [
    { k: 'empa', one: 'empanada', pl: 'empanadas', f: 1, cont: 'bandeja', conts: 'bandejas' },
    { k: 'huevo', one: 'huevo', pl: 'huevos', f: 0, cont: 'caja', conts: 'cajas', face: 1 },
    { k: 'fruti', one: 'frutilla', pl: 'frutillas', f: 1, cont: 'pocillo', conts: 'pocillos', face: 1 },
    { k: 'sopa', one: 'sopaipilla', pl: 'sopaipillas', f: 1, cont: 'plato', conts: 'platos' },
    { k: 'lapiz', one: 'lápiz', pl: 'lápices', f: 0, cont: 'estuche', conts: 'estuches' },
  ];
  /* sticker: la misma forma dibujada antes con borde blanco grueso y una sombra suave */
  const sticker = inner => `<g transform="translate(0 1.6)" opacity=".18"><g stroke="${INK}" stroke-width="7" stroke-linejoin="round">${inner}</g></g><g stroke="#fff" stroke-width="6" stroke-linejoin="round">${inner}</g>${inner}`;
  const thing = (th, st, i) => { const f = th.face && st !== 'X', s = ITEM[th.k](f, COL[i % 6]); return st === 'C' ? sticker(s) : s; };
  /* un grupo (centrado en 0,0) */
  function group(th, n, st, idx = 0) {
    const pen = th.k === 'lapiz', P = pen ? Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * (n > 5 ? 14 : 17), -8]) : spots(n);
    const C = CONT[th.cont], items = P.map(([x, y], i) => `<g class="bf-it" style="--d:${i}" transform="translate(${x} ${y})"><g class="bf-a"><g transform="scale(1.3)">${thing(th, st, i)}</g></g></g>`).join('');
    const inner = (C.back ? C.back(n) : '') + items + (C.front ? C.front(n) : '');
    if (st === 'A') return `<rect x="-58" y="-38" width="116" height="80" rx="16" fill="#d9dcf5"/><rect x="-58" y="-42" width="116" height="84" rx="16" fill="#fff"/>${inner}`;
    if (st === 'C') return `<circle r="46" fill="${['#fff3c4', '#dff7ec', '#e6f0ff', '#ffe5ee', '#efe6ff'][idx % 5]}" transform="scale(1.25 .9)"/>${pen ? inner : (C.back ? C.back(n) : '') + items + (C.front ? C.front(n) : '')}`;
    return inner; // B: sobre la mesa
  }
  const GW = 122, GH = 92;
  /* reemplazo de grpSvg (mismos parámetros y mismas medidas --vw/--vh que la app) */
  function grp(sizes, th, { cols = 3, cls = '', tap = false } = {}, st = 'A') {
    const rows = Math.ceil(sizes.length / cols), H = rows * GH + 8 + (tap ? 26 : 0), W = cols * GW;
    let bg = '';
    if (st === 'B') { // mesa con mantel a cuadros
      const cells = []; for (let y = 0; y < H + 20; y += 16) for (let x = 0; x < W; x += 16) if (((x + y) / 16) % 2 === 0) cells.push(`<rect x="${x}" y="${y - (tap ? 26 : 0)}" width="16" height="16"/>`);
      bg = `<rect x="0" y="${tap ? -26 : 0}" width="${W}" height="${H}" rx="18" fill="#fff"/><g fill="#ff6b7a" opacity=".28">${cells.join('')}</g><rect x="1.5" y="${(tap ? -26 : 0) + 1.5}" width="${W - 3}" height="${H - 3}" rx="17" fill="none" stroke="#ff6b7a" stroke-width="3"/>`;
    }
    const g = sizes.map((n, i) => { const cx = GW / 2 + (i % cols) * GW, cy = GH / 2 + 4 + Math.floor(i / cols) * GH;
      return `<g class="pl bf-g" data-i="${i}" style="--g:${i}" transform="translate(${cx} ${cy})">${group(th, n, st, i)}${tap ? '<text class="plc" y="-46" text-anchor="middle"></text><rect x="-60" y="-44" width="120" height="88" fill="transparent"/>' : ''}</g>`; }).join('');
    return `<svg viewBox="0 ${tap ? -26 : 0} ${W} ${H}" class="grp mg ${cls}" style="--vw:${W};--vh:${H}">${bg}${g}</svg>`;
  }
  /* ---------- dibujos de los cuentos (reemplazan los emojis) ---------- */
  const STORY = {
    pajaro: f => `<ellipse cx="20" cy="23" rx="12" ry="10" fill="#4ea8ff" stroke="#2a7fd6" stroke-width="1.6"/><path d="M12 22Q2 12 4 26Q10 30 14 26Z" fill="#9fd0ff" stroke="#2a7fd6" stroke-width="1.4"/><path d="M28 22Q38 12 36 26Q30 30 26 26Z" fill="#9fd0ff" stroke="#2a7fd6" stroke-width="1.4"/><path d="M18 26L20 30L22 26Z" fill="#ffb703"/>${f ? '<g transform="translate(20 21)">' + face(.9) + '</g>' : '<circle cx="16.5" cy="20" r="1.5" fill="#2b2d6e"/><circle cx="23.5" cy="20" r="1.5" fill="#2b2d6e"/>'}<path d="M16 33V37M24 33V37" stroke="#ff8a3d" stroke-width="1.8" stroke-linecap="round"/>`,
    calcetin: () => [6, 20].map((x, i) => `<path d="M${x} 6H${x + 10}V24Q${x + 10} 34 ${x} 34Q${x - 4} 34 ${x - 4} 30Q${x - 4} 26 ${x} 26Z" fill="${i ? '#ff8a3d' : '#9b6bff'}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M${x} 10H${x + 10}M${x} 14H${x + 10}" stroke="#fff" stroke-width="2"/>`).join(''),
    mano: () => `<path d="M11 36V20Q11 17 13.5 17Q16 17 16 20V9Q16 6 18.5 6Q21 6 21 9V7Q21 4 23.5 4Q26 4 26 7V10Q26 7 28.5 7Q31 7 31 10V26Q31 36 21 36Z" fill="#ffd2a8" stroke="#c98a5a" stroke-width="1.6" stroke-linejoin="round"/><path d="M11 22Q5 16 4.5 20Q4 24 11 30" fill="#ffd2a8" stroke="#c98a5a" stroke-width="1.6" stroke-linejoin="round"/>`,
    estrella: f => `<path d="M20 3L25 14L37 15L28 23L31 35L20 29L9 35L12 23L3 15L15 14Z" fill="#ffc233" stroke="#e09a00" stroke-width="1.8" stroke-linejoin="round"/>${f ? '<g transform="translate(20 21)">' + face(.9) + '</g>' : ''}`,
    caja: () => `${Array.from({ length: 10 }, (_, i) => `<rect x="${7 + i * 2.7}" y="${5 + (i % 2) * 2}" width="2.4" height="16" fill="${COL[i % 6]}" stroke="${INK}" stroke-width=".5"/>`).join('')}<rect x="5" y="16" width="30" height="20" rx="3" fill="#ffb703" stroke="#e09a00" stroke-width="1.6"/><text x="20" y="31" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">10</text>`,
    canasto: () => `${[[11, 14], [17, 11], [23, 14], [29, 11], [14, 8], [26, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="5" fill="#ff4d5e" stroke="#d62f42" stroke-width="1"/>`).join('')}<path d="M4 18H36L32 36H8Z" fill="#d49a5a" stroke="#8a5a2b" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 24H34M7 30H33M14 18L13 36M20 18V36M26 18L27 36" stroke="#8a5a2b" stroke-width="1.1"/><text x="20" y="33" font-size="9" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif" stroke="#8a5a2b" stroke-width=".6">10</text>`,
  };
  const STORY_KEYS = ['pajaro', 'calcetin', 'mano', 'estrella', 'caja', 'canasto'];
  function storyIco(k, st) {
    const s = STORY[k](st !== 'X' && (k === 'pajaro' || k === 'estrella'));
    const body = st === 'C' ? sticker(s) : s;
    const bg = st === 'A' ? '<rect x="0" y="2" width="40" height="40" rx="10" fill="#d9dcf5"/><rect x="0" y="0" width="40" height="40" rx="10" fill="#fff"/>' : '';
    return `<svg class="bf-st" viewBox="-2 -2 44 46" width="1.15em" height="1.15em">${bg}${body}</svg>`;
  }
  root.BOCETO_FIG = { THEMES, grp, group, storyIco, STORY_KEYS, ITEM, CONT, GW, GH };
})(typeof window !== 'undefined' ? window : module.exports);
