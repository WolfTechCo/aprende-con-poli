'use strict';
/* =========================================================
   Racha y medallas
   - La racha cuenta días seguidos en que practicó (save.days, hora local).
   - Las medallas se calculan con lo que ya se guarda (respuestas, estrellas, temas): no hay que
     migrar nada. Solo se recuerdan las ya anunciadas (save.badges) para que Poli las celebre una vez.
   - Para agregar una medalla: una línea en MEDALS. El id no se cambia después (queda guardado).
   ========================================================= */
function streakInfo() {
  const set = new Set(save.days || []), dayBefore = k => { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d - 1)); };
  let cur = 0, k = dayKey();
  if (!set.has(k)) k = dayBefore(k); // si hoy aún no practica, la racha de ayer sigue viva
  while (set.has(k)) { cur++; k = dayBefore(k); }
  let best = 0, run = 0, prev = null;
  for (const d of [...set].sort()) { run = prev && dayBefore(d) === prev ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return { cur, best };
}
const answersOf = () => Object.values(save.stats || {}).reduce((a, x) => a + x.n, 0);
const MEDALS = [
  { id: 'paso', ico: '🌱', name: 'Primer paso', how: 'Responde tu primera pregunta', ok: () => answersOf() >= 1 },
  { id: 'r3', ico: '🔥', name: 'Racha de 3', how: 'Practica 3 días seguidos', ok: () => streakInfo().best >= 3 },
  { id: 'r7', ico: '🚀', name: 'Racha de 7', how: 'Practica 7 días seguidos', ok: () => streakInfo().best >= 7 },
  { id: 'a50', ico: '💪', name: '50 respuestas', how: 'Responde 50 preguntas', ok: () => answersOf() >= 50 },
  { id: 'a200', ico: '🏅', name: '200 respuestas', how: 'Responde 200 preguntas', ok: () => answersOf() >= 200 },
  { id: 'punt', ico: '🎯', name: 'Puntería', how: '90 % a la primera en un tema', ok: () => Object.values(save.stats || {}).some(x => x.h.length >= 10 && pctOf(x) >= 90) },
  { id: 'e20', ico: '⭐', name: '20 estrellas', how: 'Junta 20 estrellas', ok: () => totalStars() >= 20 },
  { id: 'e50', ico: '🌟', name: '50 estrellas', how: 'Junta 50 estrellas', ok: () => totalStars() >= 50 },
  { id: 'mente', ico: '🧠', name: 'Mente brillante', how: 'Aprende todos los temas', ok: () => TOPICS.every(T => T.learned()) },
];
const medalsEarned = () => MEDALS.filter(m => m.ok()).map(m => m.id);

/* anuncio de Poli en el mapa: medallas nuevas y racha */
function medalNews() {
  if (demoMode || tourOn) return '';
  const now = medalsEarned(), old = save.badges || [], fresh = MEDALS.filter(m => now.includes(m.id) && !old.includes(m.id));
  let out = '';
  if (fresh.length) {
    save.badges = now; persist();
    out += `¡Ganaste ${fresh.length === 1 ? 'la medalla' : 'medallas'} ${fresh.slice(0, 2).map(m => m.name).join(' y ')}${fresh.length > 2 ? ` y ${fresh.length - 2} más` : ''}! `;
    setTimeout(() => { if (cur.name === 'map') { sfx.win(); confetti(100); } }, 500);
  }
  const { cur: racha } = streakInfo();
  if (racha >= 2 && !medalNews.said) { medalNews.said = true; out += `Llevas ${racha} días seguidos. `; }
  return out;
}

/* sección de Mi avance */
function medalsHtml() {
  const { cur: racha, best } = streakInfo(), now = medalsEarned();
  return `<h3 class="sec">Medallas</h3>
    <p class="pintro">🔥 Racha: <b>${racha} ${racha === 1 ? 'día' : 'días'}</b> seguidos · Mejor racha: <b>${best}</b>. Practicar un ratito cada día mantiene la racha.</p>
    <div class="medals">${MEDALS.map(m => `<div class="medal ${now.includes(m.id) ? 'on' : ''}"><span aria-hidden="true">${m.ico}</span><b>${m.name}</b><small>${m.how}</small></div>`).join('')}</div>`;
}
