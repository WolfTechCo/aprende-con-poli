'use strict';
/* ---------- pestañas de capítulos (Mis stickers y Mi avance) ---------- */
const chapOf = () => CH[cur.ch] ? +cur.ch : CH[save.ch] ? +save.ch : 1;
function chapTabs(sel, sum) {
  return `<div class="ctabs" role="tablist">${Object.keys(CH).map(Number).map(k => { const s = sum(k);
    return `<button role="tab" aria-selected="${k === sel}" class="ctab ${k === sel ? 'on' : ''} ${s.done ? 'done' : ''}" data-ch="${k}"><span class="ct">${CH[k].label}</span><span class="cs">${s.html}</span></button>`; }).join('')}</div>`;
}
const stickersOf = ch => { const C = CH[ch]; return [
  { on: !!prog(C.intro).lesson, art: `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="#34d399" stroke="#1b9f72" stroke-width="1.4" stroke-linejoin="round"/></svg>`, name: C.sticker()[0], sub: C.sticker()[1] },
  ...C.figs.map(F => { const on = figStars(F.id) === 3; return { on, art: figSvg(F), name: F.short || cap(F.name), sub: on ? '¡Completo!' : '3 estrellas' }; }),
  { on: (save[C.chal] || 0) >= 3, art: `<svg viewBox="0 0 24 24"><path d="${trophyPath}" fill="#ffc233" stroke="#e09a00" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`, name: gx('Campeona', 'Campeón'), sub: 'Desafío perfecto' }]; };
viewAlbum = function () {
  const ch = chapOf(), list = stickersOf(ch);
  const el = frame(`<div class="tabwrap">${chapTabs(ch, k => { const l = stickersOf(k), n = l.filter(s => s.on).length; return { done: n === l.length, html: n === l.length ? '✓ ¡Completo!' : `${n} de ${l.length}` }; })}
    <div class="stkgrid">${list.map((s, i) => `<div class="stk ${s.on ? 'on' : 'off'}" style="animation-delay:${i * .05}s">${s.art}<b>${s.name}</b><small>${s.sub}</small></div>`).join('')}</div></div>`, 'fill');
  $$('.ctab', el).forEach(b => b.onclick = () => go('album', { ch: +b.dataset.ch }));
  const n = list.filter(s => s.on).length;
  poli.say(n === list.length ? '¡Completaste todos los stickers de este capítulo!' : 'Completa las tres estrellas de cada isla para ganar su sticker.');
};
const chapStones = ch => { const all = TOPICS.filter(T => T.ch === ch), L = all.filter(T => T.learned()).map(levelOf); if (!L.length) return { k: 'off', s: 0 }; return { k: L.some(x => x.k === 'prac') ? 'prac' : 'ok', s: Math.round(L.reduce((a, x) => a + x.stones, 0) / all.length) }; };
const _viewAvance2 = viewAvance2;
viewAvance2 = function () {
  const ch = chapOf();
  _viewAvance2();
  const el = $('.avwrap');
  $$('.sec', el).forEach(h => { const g = h.nextElementSibling; if (!h.textContent.trim().startsWith(String(ch))) g.remove(); h.remove(); });
  $('.famline', el).insertAdjacentHTML('afterend', chapTabs(ch, k => { const c = chapStones(k);
    return { done: c.s === 5, html: c.k === 'off' ? '🔒' : `<span class="mroad">${Array.from({ length: 5 }, (_, i) => `<i class="${i < c.s ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</span>${c.k === 'prac' ? '<span>💪</span>' : ''}` }; }));
  el.classList.add('tabwrap');
  $$('.ctab', el).forEach(b => b.onclick = () => go('avance', { ch: +b.dataset.ch }));
};
