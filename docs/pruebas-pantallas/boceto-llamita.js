/* Boceto de la Llamita de la racha (entrega 4A, fase 4A-3, parte 2), estilo Gel 3D. Se carga después de boceto-mascotas.js.
   Evoluciona con el récord de días seguidos, y como en la tanda C de las mascotas cambia también la silueta:
   chispa (1–2 días, una gotita) → llamita (3, tres puntas y bracitos) → fogata (7, sobre su leña, celebra)
   → llama azul (14, más alta y caliente) → llama dorada (30 o más, con corona y brillo).
   Si la racha se corta es una brasa dormida (nunca se apaga ni se pierde nada). Extras para el Rincón de adultos:
   de vacaciones (fuera de la temporada de estudio o en pausa) y en temporada de estudio (con mochila y libro).
   Marco: el suelo en y = 0. */
(function (root) {
  const M = root.BOCETO_MASC, { PAL } = M;
  const { P, C, E, R, gel, arc, dot, piso, starD, aura, corona, f1 } = M.H;
  /* degradados del fuego: claro abajo al centro (el núcleo) y oscuro en las puntas */
  const FG = { nar: ['#fff6c8', '#ffb23d', '#ef6a1a', '#c8501a'], azu: ['#f4fcff', '#7cc8ff', '#3478e6', '#1f55b8'],
    oro: ['#fffbe6', '#ffd84a', '#ff9f1a', '#c27a00'], bra: ['#ffb27a', '#d9572a', '#8a2e14', '#5e1e0c'] };
  const DEFS = '<defs>' + Object.entries(FG).map(([k, [a, b, c]]) => `<radialGradient id="kl-${k}" cx=".5" cy=".82" r=".95"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join('')
    + '<radialGradient id="kl-tibio" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#ffb27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb27a" stop-opacity="0"/></radialGradient><radialGradient id="kl-humo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c9c3d6" stop-opacity=".7"/><stop offset="1" stop-color="#c9c3d6" stop-opacity="0"/></radialGradient></defs>';
  const fl = (d, g, w = 1.3) => `<path d="${d}" fill="url(#kl-${g})" stroke="${FG[g][3]}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const core = (d, c, o = .78) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
  /* cara: ojos grandes con brillos, mejillas; boca según el ánimo */
  const cara = (x, y, s = 1, { boca = 'sonrisa', dormida = false, mej = '#ff6a5c' } = {}) => `<g transform="translate(${x} ${y}) scale(${s})">`
    + (dormida ? [-3.4, 3.4].map(e => `<path d="M${e - 2.2} -.4Q${e} 1.6 ${e + 2.2} -.4" fill="none" stroke="#4a1a10" stroke-width="1" stroke-linecap="round"/>`).join('')
      : `<g class="ojos">${[-3.4, 3.4].map(e => `<ellipse cx="${e}" cy="-.8" rx="2.3" ry="2.7" fill="url(#km-ojo)"/><circle cx="${e + .8}" cy="-1.9" r="1" fill="#fff"/><circle cx="${e - .7}" cy=".4" r=".45" fill="#fff"/>`).join('')}</g>`)
    + ({ sonrisa: `<path d="M-1.2 2.1Q0 3.4 1.2 2.1" fill="none" stroke="#6a2414" stroke-width=".9" stroke-linecap="round"/>`,
      abierta: `<path d="M-1.5 1.8Q0 4.6 1.5 1.8Z" fill="#7a2414"/><path d="M-.7 3Q0 3.9 .7 3" fill="#ff8f8f"/>`,
      o: `<ellipse cx="0" cy="2.8" rx=".9" ry="1.1" fill="#6a2414"/>` })[boca]
    + `<ellipse cx="-5.8" cy="2.1" rx="2.1" ry="1.3" fill="${mej}" opacity=".55"/><ellipse cx="5.8" cy="2.1" rx="2.1" ry="1.3" fill="${mej}" opacity=".55"/></g>`;
  /* leña cruzada (gel café); quemada = brasa */
  const lena = (y, w = 17, quemada = false) => [8, -8].map(r => `<g transform="translate(0 ${y}) rotate(${r})">${gel(R(-w, -3, 2 * w, 6, 3), quemada ? 'oscuro' : 'cafe', 1)}`
    + `<ellipse cx="${r > 0 ? w - 1.6 : -w + 1.6}" cy="0" rx="1.8" ry="2.4" fill="${quemada ? '#ff8a3d' : '#f5d9b8'}" stroke="${quemada ? '#8a2e14' : '#6e4220'}" stroke-width=".6"/>`
    + (quemada ? `<path d="M${-w + 5} -1H${w - 6}" stroke="#ff8a3d" stroke-width=".9" stroke-linecap="round" opacity=".8"/>` : `<path d="M${-w + 5} -1.2H${w - 7}" stroke="#a86b38" stroke-width=".7" stroke-linecap="round" opacity=".6"/>`) + '</g>').join('');
  /* chispitas que suben (clase .sube) */
  const chispas = (pts, c = '#ffb23d') => pts.map(([x, y, r], i) => `<circle class="sube" style="animation-delay:${(i * .5).toFixed(1)}s" cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
  const estrellas = pts => pts.map(([x, y, r], i) => `<path class="tw" style="animation-delay:${(i * .45).toFixed(2)}s" d="${starD(r, x, y)}" fill="#ffd23c" stroke="#f0a800" stroke-width=".4"/>`).join('');
  /* bracitos: llamitas chicas a los lados (arriba = celebra) */
  const brazo = (x, y, g, g2, arriba) => `<g transform="translate(${x} ${y}) scale(${g} 1) rotate(${arriba ? -40 : 10})">${fl('M0 0Q5 -1 7 -5Q9 -9 7.4 -11Q6 -7 3.4 -6Q1 -5 0 -3Z', g2, 1)}</g>`;

  /* formas de cada etapa (base en y = 0 o sobre la leña) */
  const F = {
    chispa: 'M1.4 -25Q-1 -21 3 -16Q8 -10 7.6 -4Q7 2 0 2.4Q-7 2 -7.6 -4Q-8 -12 -1 -18Q2.6 -21 1.4 -25Z',
    llamita: 'M0 -33Q6 -25 8 -18Q11 -24 10 -29Q19 -18 17 -5Q15 4 0 5Q-15 4 -17 -5Q-18 -14 -11 -21Q-11 -14 -6 -12Q-7 -24 0 -33Z',
    fogata: 'M-2 -42Q5 -33 6 -25Q10 -31 9 -37Q19 -27 19 -17Q22 -21 22 -26Q28 -13 24 -3Q20 7 0 8Q-20 7 -24 -3Q-27 -13 -19 -21Q-19 -14 -15 -12Q-17 -23 -10 -30Q-9 -23 -6 -21Q-8 -33 -2 -42Z',
    alta: 'M0 -50Q7 -40 7 -31Q11 -36 10 -43Q20 -31 20 -20Q24 -24 24 -30Q30 -15 26 -4Q21 7 0 8Q-21 7 -26 -4Q-30 -15 -21 -25Q-21 -17 -16 -14Q-18 -27 -11 -35Q-10 -27 -6 -25Q-9 -40 0 -50Z',
  };
  const CORE = {
    chispa: 'M0 -9Q4 -5 4 -1Q4 1.6 0 1.8Q-4 1.6 -4 -1Q-4 -5 0 -9Z',
    llamita: 'M0 -13Q7 -6 7 0Q6 4 0 4.4Q-6 4 -7 0Q-7 -6 0 -13Z',
    fogata: 'M0 -18Q10 -9 10 -1Q9 6 0 6.6Q-9 6 -10 -1Q-10 -9 0 -18Z',
    alta: 'M0 -22Q11 -11 11 -1Q10 6 0 6.6Q-10 6 -11 -1Q-11 -11 0 -22Z',
  };
  const brillo = (h) => arc(`M${f1(-h * .42)} ${f1(-h * .12)}Q${f1(-h * .44)} ${f1(-h * .42)} ${f1(-h * .22)} ${f1(-h * .6)}`, 1.8, .75);

  const ETAPAS_LL = [
    { id: 'chispa', t: 'Chispa', d: '1 o 2 días' }, { id: 'llamita', t: 'Llamita', d: '3 días' }, { id: 'fogata', t: 'Fogata', d: '7 días' },
    { id: 'azul', t: 'Llama azul', d: '14 días' }, { id: 'dorada', t: 'Llama dorada', d: '30 días o más' }, { id: 'brasa', t: 'Brasa dormida', d: 'Si la racha se corta' },
    { id: 'vacaciones', t: 'De vacaciones', d: 'Extra: fuera de la temporada de estudio o en pausa', extra: true },
    { id: 'estudio', t: 'Temporada de estudio', d: 'Extra: antes de una prueba', extra: true },
  ];

  const DRAW = {
    chispa: () => piso(10) + `<g transform="scale(1.25)"><g class="llama">${fl(F.chispa, 'nar')}${core(CORE.chispa, '#fff6c8')}${brillo(20)}${cara(0, -6.6, .78)}</g></g>` + chispas([[8, -26, 1], [-6, -21, .8]]),
    llamita: () => piso(15) + brazo(-14, -6, -1, 'nar') + brazo(14, -6, 1, 'nar')
      + `<g class="llama">${fl(F.llamita, 'nar')}${core(CORE.llamita, '#fff6c8')}${brillo(30)}${cara(0, -6, 1)}</g>` + chispas([[-12, -30, 1], [11, -34, .9], [2, -38, .8]]),
    fogata: () => piso(22) + lena(2.4) + `<g transform="translate(0 -8)">`
      + `<g class="llama">${fl(F.fogata, 'nar')}${core(CORE.fogata, '#fff6c8')}${brillo(40)}${cara(0, -8, 1.22, { boca: 'abierta' })}</g>${brazo(-21, -3, -1, 'nar', true)}${brazo(21, -3, 1, 'nar', true)}</g>` + chispas([[-17, -40, 1.2], [15, -46, 1], [3, -50, .9], [-6, -48, .8]]),
    azul: () => piso(24) + lena(2.4, 18) + `<g transform="translate(0 -8)">`
      + `<g class="llama">${fl(F.alta, 'azu')}${core(CORE.alta, '#f4fcff', .85)}${brillo(48)}${cara(0, -9, 1.26, { boca: 'abierta', mej: '#7a8cff' })}</g>${brazo(-23, -3, -1, 'azu', true)}${brazo(23, -3, 1, 'azu', true)}</g>`
      + chispas([[-19, -46, 1.2], [17, -52, 1], [4, -58, .9], [-7, -56, .8]], '#9fdcff'),
    dorada: () => aura(-24, 44) + piso(24) + lena(2.4, 18) + `<g transform="translate(0 -8)">`
      + `<g class="llama">${fl(F.alta, 'oro')}${core(CORE.alta, '#fffbe6', .85)}${brillo(48)}${cara(0, -9, 1.26, { boca: 'abierta' })}</g>${brazo(-23, -3, -1, 'oro', true)}${brazo(23, -3, 1, 'oro', true)}`
      + corona(0, -46.6, 1.05) + '</g>' + estrellas([[-28, -44, 3], [28, -50, 2.6], [-26, -12, 2.2], [27, -16, 2]]) + chispas([[-14, -56, 1], [12, -60, .9]], '#ffd84a'),
    brasa: () => `<ellipse cx="0" cy="-6" rx="20" ry="13" fill="url(#kl-tibio)" class="brasa"/>` + piso(17) + gel(P('M-17 0Q-15 -5 -8 -5.4Q0 -7 8 -5.4Q15 -5 17 0Q0 2.4 -17 0Z'), 'ceniza', 1) + `<circle cx="-11" cy="-2.2" r=".9" fill="#ff8a3d"/><circle cx="12" cy="-1.6" r=".8" fill="#ff8a3d"/>`
      + `<g class="brasa">${fl('M-12 -4Q-14 -14 -5 -16Q0 -19 5.6 -16Q14 -14 12 -4Q0 -.6 -12 -4Z', 'bra', 1.2)}`
      + `<path d="M-8 -7.6L-5 -10L-2 -8.2M3.6 -12.6L6 -10.2L8.6 -11" fill="none" stroke="#ffb23d" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`
      + arc('M-8.6 -8Q-8 -12.6 -3.6 -14', 1.3, .55) + cara(0, -8, .82, { dormida: true, boca: 'o' }) + '</g>'
      + `<ellipse class="humo" cx="5" cy="-20" rx="4" ry="3" fill="url(#kl-humo)"/><ellipse class="humo" style="animation-delay:1.2s" cx="8" cy="-26" rx="3" ry="2.4" fill="url(#kl-humo)"/>`
      + `<text class="zz" x="10" y="-15" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="800" font-size="6" fill="#7a6ad8">z</text><text class="zz" style="animation-delay:1s" x="14" y="-21" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="800" font-size="4.6" fill="#7a6ad8">z</text>`,
    vacaciones: () => piso(15) + brazo(-14, -6, -1, 'nar') + brazo(14, -6, 1, 'nar')
      + `<g class="llama">${fl(F.llamita, 'nar')}${core(CORE.llamita, '#fff6c8')}${brillo(30)}${cara(0, -6, 1)}`
      + `<path d="M-8.6 -7.6H8.6" stroke="#2a2238" stroke-width="1"/>` + [-4, 4].map(x => gel(R(x - 3.6, -9.6, 7.2, 4.8, 2.2), 'oscuro', .7) + `<path d="M${x - 2} -8.6l1.6 -.6" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".8"/>`).join('')
      + `</g><g transform="translate(1 -24) rotate(-8)">${gel(E(0, 2, 15, 3.2), 'vainilla', 1)}${gel(P('M-8 2Q-8 -7 0 -7.6Q8 -7 8 2Z'), 'vainilla', 1)}<path d="M-7.8 -.4Q0 1.4 7.8 -.4" stroke="#ff5c8a" stroke-width="1.8" fill="none"/><circle cx="6" cy="-1" r="1.6" fill="#ffd23c"/></g>`,
    estudio: () => piso(15) + [-1, 1].map(g => gel(R(g * 13 - (g < 0 ? 4 : 0), -18, 4, 14, 2), 'azul', .9)).join('')
      + brazo(-14, -6, -1, 'nar')
      + `<g class="llama">${fl(F.llamita, 'nar')}${core(CORE.llamita, '#fff6c8')}${brillo(30)}${cara(0, -6, 1)}</g>`
      + [-1, 1].map(g => `<path d="M${g * 6.6} -20Q${g * 9.6} -12 ${g * 8.4} -3" fill="none" stroke="${PAL.azul[3]}" stroke-width="1.8" stroke-linecap="round"/>`).join('')
      + `<g transform="translate(15 -5) rotate(-12)">${gel(R(-5.4, -7, 10.8, 13, 1.6), 'rojo', 1)}<rect x="-4" y="-5.6" width="8" height="10.2" rx=".8" fill="#fff6e8"/><path d="M-2.4 -3H2.4M-2.4 -1H2.4M-2.4 1H1" stroke="#c8b8a0" stroke-width=".6"/></g>`
      + `<g transform="translate(-16 -26) rotate(28)">${gel(R(-1.4, -7, 2.8, 12, .8), 'amarillo', .7)}<path d="M-1.4 5L0 8L1.4 5Z" fill="#f5d9b8" stroke="#a87200" stroke-width=".5"/></g>`,
  };
  const CSS = `.llama{animation:kl-fl 1.1s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes kl-fl{50%{transform:scaleY(1.07) scaleX(.95) skewX(-2deg)}}
.brasa{animation:kl-br 3s ease-in-out infinite}
@keyframes kl-br{50%{filter:brightness(1.25)}}
.sube{animation:kl-sube 2.2s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes kl-sube{0%{opacity:0;transform:translateY(6px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-10px) scale(.3)}}
.humo{animation:kl-humo 3s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes kl-humo{0%{opacity:0;transform:translateY(4px) scale(.6)}40%{opacity:1}100%{opacity:0;transform:translateY(-6px) scale(1.4)}}
.zz{animation:kl-zz 2.4s ease-in-out infinite}
@keyframes kl-zz{0%{opacity:0;transform:translate(0,0)}50%{opacity:1}100%{opacity:0;transform:translate(4px,-8px)}}
@media (prefers-reduced-motion:reduce){.llama,.brasa,.sube,.humo,.zz{animation:none}}`;
  const llamita = id => `<g>${DRAW[id]()}</g>`;
  M.LL = { DEFS, CSS, ETAPAS: ETAPAS_LL, DRAW, llamita, FG };
})(typeof window !== 'undefined' ? window : global);
