'use strict';
/* =========================================================
   Reporte de uso y opinión (Ajustes → "Ayúdanos a mejorar")
   - Anónimo: sin nombres; cada perfil sale como "Perfil 1", "Perfil 2"…
   - Nada se envía solo: el adulto ve el texto completo y lo comparte como quiera.
   - Para recibirlo por correo, escribir el correo del proyecto en FEEDBACK_MAIL:
     aparece el botón "Enviar por correo" (abre el correo del adulto con el reporte escrito).
   ========================================================= */
const FEEDBACK_MAIL = '';
const FBKEY = 'poli-opinion'; // por dispositivo: código al azar, estrellas y comentario
const fbClean = s => String(s || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 300);

function fbLoad() {
  let f = {};
  try { f = JSON.parse(localStorage.getItem(FBKEY) || '{}') || {}; } catch (e) { }
  if (!/^[a-z0-9]{8}$/.test(f.id || '')) f.id = Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  f.stars = Number.isInteger(f.stars * 2) && f.stars >= 0 && f.stars <= 5 ? f.stars : 0;
  f.text = fbClean(f.text);
  return f;
}
const fbSave = f => { try { localStorage.setItem(FBKEY, JSON.stringify(f)); } catch (e) { } };
const fbNum = n => String(n).replace('.', ',');

function buildReport(f) {
  const keep = save, L = ['APRENDE CON POLI · reporte anónimo (sin nombres)', `Código: ${f.id}`, `Versión: ${APPVER}`, `Fecha: ${new Date().toISOString().slice(0, 10)}`, ''];
  root.order.forEach((id, i) => {
    save = id === root.cur ? keep : loadProfile(id);
    const sts = Object.values(save.stats || {}), last = Math.max(0, ...sts.map(x => x.last || 0));
    L.push(`Perfil ${i + 1}: ${totalStars()} de ${maxStars()} estrellas · ${TOPICS.filter(T => T.learned()).length} de ${TOPICS.length} temas · ${(save.days || []).length} días de uso · ${sts.reduce((a, x) => a + x.n, 0)} respuestas · último uso: ${ago(last)}`);
    const t = TOPICS.filter(T => save.stats?.[T.id]?.h.length).map(T => `${T.name} ${pctOf(save.stats[T.id])} %`);
    if (t.length) L.push(`  A la primera: ${t.join(', ')}`);
  });
  save = keep;
  L.push('', `Recomendación: ${f.stars ? fbNum(f.stars) + ' de 5' : 'sin responder'}`, `Comentario: ${f.text.trim() || '(sin comentario)'}`);
  return L.join('\n');
}

function setupFeedback(el) {
  const f = fbLoad(), rate = $('#rate', el), rep = $('#fbRep', el), txt = $('#fbText', el);
  txt.value = f.text;
  const draw = () => {
    $$('.rs', rate).forEach(r => { const i = +r.dataset.i; $('.rfg', r).style.width = f.stars >= i ? '100%' : f.stars >= i - .5 ? '50%' : '0'; });
    rate.setAttribute('aria-valuenow', f.stars);
    $('#rval', el).textContent = f.stars ? `${fbNum(f.stars)} de 5` : '';
    rep.value = buildReport(f);
  };
  const set = v => { f.stars = Math.max(.5, Math.min(5, v)); fbSave(f); draw(); sfx.pop(); };
  // tocar la mitad izquierda de una estrella da media estrella; la derecha, entera
  rate.onclick = e => {
    const r = e.target.closest('.rs'); if (!r) return;
    const b = r.getBoundingClientRect();
    set(+r.dataset.i - (e.clientX - b.left < b.width / 2 ? .5 : 0));
  };
  rate.onkeydown = e => {
    const d = { ArrowRight: .5, ArrowUp: .5, ArrowLeft: -.5, ArrowDown: -.5 }[e.key];
    if (d) { e.preventDefault(); set((f.stars || 0) + d); }
    else if (e.key === 'Home') { e.preventDefault(); set(.5); }
    else if (e.key === 'End') { e.preventDefault(); set(5); }
  };
  txt.oninput = () => { f.text = fbClean(txt.value); fbSave(f); rep.value = buildReport(f); };
  $('#bFbCopy', el).onclick = async () => {
    try { await navigator.clipboard.writeText(rep.value); }
    catch (e) { rep.select(); try { document.execCommand('copy'); } catch (e2) { } }
    sfx.ok(); poli.say('Listo, copié el reporte. Ya puedes pegarlo donde quieras.', false);
  };
  $('#bFbFile', el).onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rep.value], { type: 'text/plain' }));
    a.download = `poli-reporte-${f.id}.txt`;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    sfx.pop(); poli.say('Listo, guardé el archivo del reporte.', false);
  };
  if ($('#bFbMail', el)) $('#bFbMail', el).onclick = () => {
    sfx.pop(); location.href = `mailto:${FEEDBACK_MAIL}?subject=${encodeURIComponent('Reporte Aprende con Poli')}&body=${encodeURIComponent(rep.value)}`;
  };
  draw();
}
