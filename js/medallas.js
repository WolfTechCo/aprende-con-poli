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
/* lo ganado no se pierde: una medalla que Poli ya anunció (save.badges) queda para siempre, aunque lleguen temas nuevos */
const medalsEarned = () => MEDALS.filter(m => (save.badges || []).includes(m.id) || m.ok()).map(m => m.id);
/* al llegar el capítulo 5, quien ya tenía todo lo de los capítulos 1 a 4 conserva «Mente brillante» y el rango más alto.
   Se revisa una sola vez por jugador ('c5' en save.badges). Para otro capítulo nuevo: otra marca y el capítulo anterior */
function keepEarned() {
  if (demoMode) return;
  const b = save.badges ||= [];
  if (b.includes('c5')) return;
  if (TOPICS.filter(T => T.ch <= 4).every(T => T.learned()) && !b.includes('mente')) b.push('mente');
  if ([1, 2, 3, 4].every(k => chStars(k) === CH[k].figs.length * 3 + 4) && !b.includes('rey')) b.push('rey');
  b.push('c5'); persist();
}

/* anuncio de Poli en el mapa: medallas nuevas (una sola vez, con confeti) o la racha.
   Al actualizar a la entrega 2, las medallas que ya tenía se celebran todas juntas */
function medalNews() {
  if (demoMode || tourOn) return '';
  keepEarned();
  const now = medalsEarned(), old = save.badges || [], fresh = MEDALS.filter(m => now.includes(m.id) && !old.includes(m.id));
  let out = '';
  if (fresh.length) {
    save.badges = [...new Set([...old, ...now])]; persist();
    out += fresh.length === 1 ? `¡Ganaste la medalla ${fresh[0].name}! Toca tus estrellas para verla. ` : `¡Tienes ${fresh.length} medallas nuevas! Toca tus estrellas para verlas. `;
    setTimeout(() => { if (cur.name === 'map') { sfx.win(); confetti(100); } }, 500);
  }
  const { cur: racha } = streakInfo();
  if (!fresh.length && racha >= 2 && !medalNews.said) { medalNews.said = true; out += `Llevas ${racha} días seguidos. `; }
  return out;
}
