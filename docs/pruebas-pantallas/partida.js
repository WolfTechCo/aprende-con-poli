const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), out = [];
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  p.on('pageerror', e => out.push('ERROR ' + e.message));
  await p.goto('http://127.0.0.1:8766/');
  await p.evaluate(() => { localStorage.clear(); for (const [k, v] of [['poli-recorrido-visto', '4'], ['poli-recorrido-ajustes-visto', '99'], ['poli-novedades-visto', '3.1.0']]) localStorage.setItem(k, v); });
  await p.reload(); await p.waitForTimeout(300);
  // jugador que ya lo tenía todo de los capítulos 1 a 4 (como una familia que actualiza)
  await p.evaluate(() => {
    addProfile('Ana', 'a'); save.voice = false;
    for (const ch of [1, 2, 3, 4]) { const C = CH[ch]; prog(C.intro).lesson = true; C.figs.forEach(F => Object.assign(prog(F.id), { lesson: true, build: true, paint: true, hunt: true, g1: true, g2: true })); }
    Object.assign(save, { challenge: 3, challenge3d: 3, challengeNum: 3, challengePat: 3, ch: 4 });
    save.stats = { poli: { n: 60, h: '11111111111111111111', last: Date.now() } }; persist();
  });
  const rank0 = await p.evaluate(() => ({ r: rankOf(), mente: medalsEarned().includes('mente'), badges: save.badges.slice().sort().join() , stars: totalStars() + '/' + maxStars() }));
  out.push('al actualizar (ya tenía todo): ' + JSON.stringify(rank0));
  // ahora aparecen temas nuevos: ¿lo ganado sigue?
  const kept = await p.evaluate(() => ({ r: rankOf(), mente: medalsEarned().includes('mente'), todosAprendidos: TOPICS.every(T => T.learned()) }));
  out.push('con temas nuevos sin aprender: ' + JSON.stringify(kept));
  // un jugador nuevo no recibe lo que no ganó
  const fresh = await p.evaluate(() => { addProfile('Luis', 'o'); const r = { r: rankOf(), mente: medalsEarned().includes('mente'), n: medalsEarned().length }; switchProfile(root.order[0]); return r; });
  out.push('jugador nuevo: ' + JSON.stringify(fresh));
  // recorrer: lección de inicio, isla 1, juego, desafío
  const play = async (label, maxQ) => {
    for (let q = 0; q < maxQ; q++) {
      await p.waitForTimeout(350);
      const opts = await p.$$('.opt'); if (!opts.length) return q;
      for (const o of opts) { const d = await o.evaluate(e => e.classList.contains('wrong') || e.classList.contains('right')); if (d) continue; await o.click({ timeout: 2000 }).catch(() => { }); await p.waitForTimeout(120); if (await p.evaluate(() => !!document.querySelector('.opt.right'))) break; }
      await p.waitForTimeout(450); await p.mouse.click(195, 300); await p.waitForTimeout(600);
    }
    return maxQ;
  };
  await p.evaluate(() => { save.ch = 5; persist(); go('map'); }); await p.waitForTimeout(600);
  await p.evaluate(() => go('lesson', { id: 'intro5' })); await p.waitForTimeout(500);
  for (let st = 0; st < 8; st++) {
    if (await p.evaluate(() => cur.name) !== 'lesson') break;
    for (const e of await p.$$('.pl')) await e.click().catch(() => { });
    for (const o of await p.$$('.opt')) { await o.click({ timeout: 1500 }).catch(() => { }); if (await p.evaluate(() => !document.querySelector('#action').disabled)) break; }
    await p.waitForTimeout(500); await p.click('#action').catch(() => { }); await p.waitForTimeout(300);
  }
  out.push('lección de inicio completa: ' + await p.evaluate(() => !!prog('intro5').lesson) + ' · estrellas ' + await p.evaluate(() => chStars(5)));
  for (const id of ['msuma', 'mesmul', 'mtabla2', 'mtabla510']) {
    await p.evaluate(i => { prog(i).lesson = true; persist(); }, id);
    for (const k of ['g1', 'g2']) {
      await p.evaluate(([i, k]) => go('game', { id: i, k }), [id, k]); await p.waitForTimeout(400);
      await play(id + k, 5); await p.waitForTimeout(800);
      out.push(`${id} ${k}: ${await p.evaluate(([i, k]) => !!prog(i)[k], [id, k])}`);
    }
  }
  await p.evaluate(() => go('challenge', { ch: 5 })); await p.waitForTimeout(400);
  await play('desafio', 8); await p.waitForTimeout(900);
  out.push('Gran Desafío 5 estrellas: ' + await p.evaluate(() => save.challengeMul));
  out.push('estrellas: ' + await p.evaluate(() => totalStars() + ' de ' + maxStars()) + ' · stickers ' + await p.evaluate(() => stickerCount() + ' de ' + stickerMax()));
  // respaldo ida y vuelta conserva el desafío nuevo
  out.push('respaldo conserva desafío: ' + await p.evaluate(() => restoreFrom({ app: 'aprende-con-poli', perfiles: [JSON.parse(JSON.stringify(save))] })[0].challengeMul));
  console.log(out.join('\n')); await b.close();
})();
