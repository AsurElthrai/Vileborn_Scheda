/**
 * session.js
 * Gestisce la scheda di sessione:
 *  - Build dinamico delle sezioni da PC
 *  - Meccaniche di gioco (ferite, condizioni, segni, doni)
 *  - Effetti visivi condizioni (approcci penalizzati, sezioni colorate)
 *  - Drag & drop per riordinare le sezioni
 *  - Azioni speciali: Cedi alla pulsione, Sanctus, Reset
 *
 * Dipende da: data.js, app.js
 */

'use strict';

// ─────────────────────────────────────────────
//  STATO SESSIONE
// ─────────────────────────────────────────────

let wounds = 0;
const signs = [false, false, false];

/**
 * Blocchi persistenti condizionali applicati via popup dado1+blocca.
 * Formato: '${donIndex}:${target}'  es. '2:moventi'
 * Attivi solo finché il dono corrispondente è segnato.
 */
const _conditionalBlock = new Set();

// ─────────────────────────────────────────────
//  BUILD SESSIONE
// ─────────────────────────────────────────────

let _masonryObserver = null;

function buildSession() {
  if (!PC) return;
  wounds = 0;
  signs.fill(false);

  g('disp-nome').textContent = PC.nome;
  g('disp-sub').textContent  = `${PC.origine} · ${PC.retaggio} · Atto ${PC.atto}`;

  buildSections();
  initDrag();
  showSession();
  requestAnimationFrame(resizeSectionGrid);

  // ResizeObserver: ricalcola il masonry ogni volta che un blocco cambia altezza
  if (_masonryObserver) _masonryObserver.disconnect();
  _masonryObserver = new ResizeObserver(() => requestAnimationFrame(resizeSectionGrid));
  document.querySelectorAll('.sec').forEach(sec => _masonryObserver.observe(sec));
}

function resizeSectionGrid() {
  const cont = g('sections');
  if (!cont || getComputedStyle(cont).display !== 'grid') return;
  const secs = [...cont.querySelectorAll('.sec')];
  const sy = window.scrollY;
  // Reset spans so il browser ricalcola l'altezza naturale
  secs.forEach(sec => { sec.style.gridRowEnd = 'auto'; });
  // Reflow forzato — necessario prima di misurare
  void cont.offsetHeight;
  const zoom = parseFloat(g('session-body')?.style.zoom) || 1;
  secs.forEach(sec => {
    const h = sec.getBoundingClientRect().height / zoom;
    sec.style.gridRowEnd = `span ${Math.ceil((h + 8) / 10)}`;
  });
  // Ripristina posizione scroll (il reflow può far saltare la pagina su mobile)
  if (window.scrollY !== sy) window.scrollTo({ top: sy, behavior: 'instant' });
}

window.addEventListener('resize', () => requestAnimationFrame(resizeSectionGrid));

function buildSections() {
  const cont = g('sections');
  cont.innerHTML = '';

  const built = {
    stato: buildStato(),
    cond:  buildCondizioni(),
    app:   buildApprocci(),
    cap:   buildCapacita(),
    pers:  buildPersonalita(),
    add:   buildAddestramento(),
    doni:  buildDoni(),
    mov:   buildMoventi(),
    leg:   buildLegami(),
    eq:    buildEquipaggiamento()
  };

  const defaultOrder = ['stato','cond','app','cap','pers','add','doni','mov','leg','eq'];
  const savedOrder   = PC.layout?.order || [];
  const order = [
    ...savedOrder.filter(id => defaultOrder.includes(id)),
    ...defaultOrder.filter(id => !savedOrder.includes(id))
  ];
  const cols = PC.layout?.cols || {};

  order.forEach(id => {
    const sec = built[id];
    if (!sec) return;
    const c = cols[id] || 3;
    sec.dataset.cols = c;
    cont.appendChild(sec);
    updateColButtons(id, c);
  });
}

function setSectionCols(id, n) {
  const sec = g('sec-' + id);
  if (!sec) return;
  sec.dataset.cols = n;
  updateColButtons(id, n);
  if (!PC.layout) PC.layout = {};
  if (!PC.layout.cols) PC.layout.cols = {};
  PC.layout.cols[id] = n;
  saveToStorage();
  requestAnimationFrame(resizeSectionGrid);
}

function updateColButtons(id, n) {
  const num = Number(n);
  [1, 2, 3].forEach(i => {
    const btn = g('cb' + i + '-' + id);
    if (btn) btn.classList.toggle('active', i === num);
  });
}

// ─────────────────────────────────────────────
//  FACTORY SEZIONE
// ─────────────────────────────────────────────

function makeSection(id, title, bodyHtml) {
  const sec = document.createElement('div');
  sec.className    = 'sec';
  sec.id           = 'sec-' + id;
  sec.draggable    = true;
  sec.dataset.cols = 3;
  sec.innerHTML  = `
    <div class="sec-hdr" onclick="toggleSec('${id}')">
      <div class="drag-handle" onclick="event.stopPropagation()">
        <span></span><span></span><span></span>
      </div>
      <span class="sec-title">${title}</span>
      <div class="col-ctrl" onclick="event.stopPropagation()">
        <button id="cb1-${id}" class="col-btn" onclick="setSectionCols('${id}',1)" title="1 colonna">1</button>
        <button id="cb2-${id}" class="col-btn" onclick="setSectionCols('${id}',2)" title="2 colonne">2</button>
        <button id="cb3-${id}" class="col-btn col-btn-3" onclick="setSectionCols('${id}',3)" title="Larghezza piena">3</button>
      </div>
      <span class="sec-arr open" id="arr-${id}">▾</span>
    </div>
    <div class="sec-body" id="body-${id}">${bodyHtml}</div>`;
  return sec;
}

function toggleSec(id) {
  const s = g('sec-' + id);
  s.classList.toggle('collapsed');
  const arr = g('arr-' + id);
  if (arr) arr.classList.toggle('open', !s.classList.contains('collapsed'));
  requestAnimationFrame(resizeSectionGrid);
}

// ─────────────────────────────────────────────
//  SEZIONE STATO (ferite + segni)
// ─────────────────────────────────────────────

function buildStato() {
  return makeSection('stato', 'Stato', `
    <div class="stato-grid">
      <div class="ferite-col">
        <div class="sub-label">Ferite</div>
        <div class="wboxes">
          <div class="wbox" id="w1" onclick="toggleWound(1)"></div>
          <div class="wbox" id="w2" onclick="toggleWound(2)"></div>
          <div class="wbox" id="w3" onclick="toggleWound(3)"></div>
          <div class="wbox ko" id="w4" onclick="toggleWound(4)"></div>
          <span class="wlbl" id="wlbl">0/3</span>
        </div>
      </div>
      <div class="segni-col">
        <div class="sub-label">Segni retaggio</div>
        <div class="spips">
          <div class="spip s1" id="sg1" onclick="toggleSign(1)"></div>
          <div class="spip s2" id="sg2" onclick="toggleSign(2)"></div>
          <div class="spip s3" id="sg3" onclick="toggleSign(3)"></div>
        </div>
        <div class="slbl" id="slbl">Nessun segno</div>
      </div>
    </div>`);
}

// ─────────────────────────────────────────────
//  SEZIONE CONDIZIONI
// ─────────────────────────────────────────────

function buildCondizioni() {
  const conds = [
    { id: 'ansia',  nome: 'Ansia',       eff: '-1 a ragione, precisione e sotterfugio' },
    { id: 'esau',   nome: 'Esaurimento', eff: '-1 a impeto, volontà e ascendente' },
    { id: 'verg',   nome: 'Vergogna',    eff: 'Non puoi mettere in gioco la personalità' },
    { id: 'paura',  nome: 'Paura',       eff: "Non puoi mettere in gioco l'addestramento" },
    { id: 'conf',   nome: 'Confusione',  eff: 'Non puoi mettere in gioco i moventi' },
    { id: 'rabbia', nome: 'Rabbia',      eff: 'Non puoi mettere in gioco i legami' },
  ];
  const html = conds.map(c => `
    <div class="cond" id="c-${c.id}" onclick="toggleCond('${c.id}')">
      <div class="cond-h">
        <div class="cdot"></div>
        <span class="cname">${c.nome}</span>
      </div>
      <div class="ceff">${c.eff}</div>
    </div>`).join('');
  return makeSection('cond', 'Condizioni', html);
}

// ─────────────────────────────────────────────
//  SEZIONE APPROCCI
// ─────────────────────────────────────────────

function buildApprocci() {
  if (!PC.approcci) return null;
  const HIGH = ['d10', 'd12'];
  const ANSIA_K = ['ragione', 'precisione', 'sotterfugio'];
  const ESAU_K  = ['impeto',  'volonta',    'ascendente'];

  const rows = APPROCCI_NAMES.map(name => {
    const key    = name.toLowerCase().replace('à', 'a');
    const die    = PC.approcci[name] || 'd6';
    const isHigh = HIGH.includes(die);
    return `
      <div class="app-row">
        <span class="app-lbl" id="al-${key}">${name}</span>
        <div class="app-right">
          <span class="dbadge ${isHigh ? 'hi' : ''}" id="db-${key}">${die}</span>
          <span class="mod" id="md-${key}">-1</span>
          <span class="svn" id="sv-${key}" title="Svantaggio (dono segnato)">SVN</span>
        </div>
      </div>`;
  }).join('');

  return makeSection('app', 'Approcci', rows);
}

// ─────────────────────────────────────────────
//  SEZIONE CAPACITÀ ORIGINE
// ─────────────────────────────────────────────

function buildCapacita() {
  if (!PC.capacita) return null;
  const sep     = PC.capacita.indexOf(' — ');
  const nome    = sep > -1 ? PC.capacita.slice(0, sep) : PC.capacita;
  const resto   = sep > -1 ? PC.capacita.slice(sep + 3) : '';
  const negMatch = resto.match(/^([\s\S]*?)(\s*\(([^)]+)\))?$/);
  const descTxt  = negMatch ? negMatch[1].trim() : resto;
  const negTxt   = negMatch?.[3] || '';
  const html = `
    <div class="cap-block">
      <div class="cap-nome">${nome}</div>
      ${descTxt ? `<div class="cap-desc">${descTxt}</div>` : ''}
      ${negTxt  ? `<div class="cap-neg">${negTxt}</div>`  : ''}
    </div>`;
  return makeSection('cap', 'Capacità Origine', html);
}

// ─────────────────────────────────────────────
//  SEZIONE PERSONALITÀ
// ─────────────────────────────────────────────

function buildPersonalita() {
  if (!PC.personalita?.length) return null;
  const chips = PC.personalita.map((p, i) =>
    `<span class="chip" id="p-${i}" onclick="toggleChip('p-${i}')">${p}</span>`
  ).join('');
  return makeSection('pers', 'Personalità', chips);
}

// ─────────────────────────────────────────────
//  SEZIONE ADDESTRAMENTO
// ─────────────────────────────────────────────

function buildAddestramento() {
  if (!PC.addestramento?.length) return null;
  const chips = PC.addestramento.map((a, i) =>
    `<span class="chip" id="a-${i}" onclick="toggleChip('a-${i}')">${a}</span>`
  ).join('');
  return makeSection('add', 'Addestramento', chips);
}

// ─────────────────────────────────────────────
//  SEZIONE DONI
// ─────────────────────────────────────────────

function buildDoni() {
  if (!PC.doni?.length) return null;
  const html = PC.doni.map((d, i) => `
    <div class="don">
      <div class="don-hdr" onclick="toggleDonBody(${i})">
        <div class="don-chk" id="dc-${i}"
          onclick="event.stopPropagation(); toggleDon(${i})"></div>
        <span class="don-dname">${d.nome}</span>
        <span class="don-arr" id="da-${i}">▾</span>
      </div>
      <div class="don-bdy h" id="db-${i}">
        ${d.effetto  ? `<div class="deff">${d.effetto}</div>`   : ''}
        ${d.tuttavia ? `<div class="dhow">${d.tuttavia}</div>`  : ''}
      </div>
    </div>`).join('');
  return makeSection('doni', 'Doni', html);
}

// ─────────────────────────────────────────────
//  SEZIONE MOVENTI
// ─────────────────────────────────────────────

function buildMoventi() {
  const asp = PC.moventi?.aspirazione || 'da compilare';
  const dov = PC.moventi?.dovere      || 'da compilare';
  return makeSection('mov', 'Moventi', `
    <div class="mrow">
      <div class="mchk" id="m-asp" onclick="useM('m-asp')"></div>
      <div>
        <div class="mname" id="mn-asp">Aspirazione</div>
        <div class="msub">${asp}</div>
      </div>
    </div>
    <div class="mrow">
      <div class="mchk" id="m-dov" onclick="useM('m-dov')"></div>
      <div>
        <div class="mname" id="mn-dov">Dovere</div>
        <div class="msub">${dov}</div>
      </div>
    </div>`);
}

// ─────────────────────────────────────────────
//  SEZIONE LEGAMI
// ─────────────────────────────────────────────

function buildLegami() {
  if (!PC.legami?.length) return null;
  const html = PC.legami.map((l, i) => `
    <div class="lrow">
      <div class="lchk" id="l-${i}" onclick="useL('l-${i}')"></div>
      <span class="lname" id="ln-${i}">
        ${l.nome}${l.npc ? '<span class="npc-tag">NPC</span>' : ''}
      </span>
      <span class="lval">${l.valore}</span>
    </div>`).join('');
  return makeSection('leg', 'Legami', html);
}

// ─────────────────────────────────────────────
//  SEZIONE EQUIPAGGIAMENTO
// ─────────────────────────────────────────────

function buildEquipaggiamento() {
  if (!PC.equipaggiamento?.length) return null;
  const html = PC.equipaggiamento.map((e, i) => `
    <div class="eqrow">
      <div class="eqchk" id="eq-${i}"
        onclick="g('eq-${i}').classList.toggle('on')"></div>
      <div>
        <div class="eqname">${e.nome}</div>
        ${e.desc ? `<span class="eqtag ${e.tipo || 'custom'}">${e.desc}</span>` : ''}
      </div>
    </div>`).join('');
  return makeSection('eq', 'Equipaggiamento', html);
}

// ─────────────────────────────────────────────
//  MECCANICHE — FERITE
// ─────────────────────────────────────────────

function toggleWound(n) {
  if (n === 4) {
    wounds = wounds >= 4 ? 0 : 4;
  } else {
    wounds = wounds === n ? n - 1 : n;
  }
  for (let i = 1; i <= 3; i++) g('w' + i)?.classList.toggle('on', i <= wounds && wounds < 4);
  g('w4')?.classList.toggle('on', wounds >= 4);
  g('wlbl').textContent = wounds >= 4 ? 'Fuori gioco' : `${wounds}/3`;
  if (wounds >= 4) fb('Fuori gioco!', 'd');
}

// ─────────────────────────────────────────────
//  MECCANICHE — SEGNI RETAGGIO
// ─────────────────────────────────────────────

function toggleSign(n) {
  signs[n - 1] = !signs[n - 1];
  if (signs[n - 1])   for (let i = 0;   i < n - 1; i++) signs[i] = true;
  else                for (let i = n;   i < 3;     i++) signs[i] = false;
  for (let i = 1; i <= 3; i++) g('sg' + i)?.classList.toggle('on', signs[i - 1]);
  g('slbl').textContent = SIGN_LABELS[signs.filter(Boolean).length];
}

// ─────────────────────────────────────────────
//  MECCANICHE — CONDIZIONI
// ─────────────────────────────────────────────

const ANSIA_KEYS  = ['ragione', 'precisione', 'sotterfugio'];
const ESAU_KEYS   = ['impeto',  'volonta',    'ascendente'];

function toggleCond(id) {
  g('c-' + id).classList.toggle('on');
  updateAll();
}

/**
 * Raccoglie gli effetti persistenti di tutti i doni attualmente segnati.
 * Cerca i dati `persistenti` in RETAGGI (fonte di verità) confrontando per nome,
 * così funziona anche con personaggi caricati da JSON che non hanno il campo.
 */
function getDoniEffettiAttivi() {
  const mods  = {};          // { chiave: totale_mod }
  const svn   = new Set();   // chiavi con svantaggio
  const block = new Set();   // 'legami' | 'moventi'

  if (!PC.doni) return { mods, svn, block };

  PC.doni.forEach((dono, i) => {
    if (!g('dc-' + i)?.classList.contains('on')) return;

    // Lookup in RETAGGI per nome (retrocompatibile con vecchi JSON)
    let persistenti = dono.persistenti;
    if (!persistenti && PC.retaggio && RETAGGI[PC.retaggio]) {
      const fonte = RETAGGI[PC.retaggio].doni.find(d => d.nome === dono.nome);
      persistenti = fonte?.persistenti;
    }
    if (!persistenti) return;

    persistenti.forEach(eff => {
      if (eff.tipo === 'mod')       mods[eff.chiave] = (mods[eff.chiave] || 0) + eff.val;
      if (eff.tipo === 'svantaggio') svn.add(eff.chiave);
      if (eff.tipo === 'blocca')    block.add(eff.obiettivo);
    });
  });

  // Blocchi condizionali da popup dado1+blocca (es. Specchio Arcano)
  _conditionalBlock.forEach(entry => {
    const sep    = entry.lastIndexOf(':');
    const idxStr = entry.substring(0, sep);
    const target = entry.substring(sep + 1);
    if (g('dc-' + idxStr)?.classList.contains('on')) {
      block.add(target);
    }
  });

  return { mods, svn, block };
}

function updateAll() {
  const ansia  = g('c-ansia')?.classList.contains('on');
  const esau   = g('c-esau')?.classList.contains('on');
  const verg   = g('c-verg')?.classList.contains('on');
  const paura  = g('c-paura')?.classList.contains('on');
  const conf   = g('c-conf')?.classList.contains('on');
  const rabbia = g('c-rabbia')?.classList.contains('on');

  // Effetti persistenti dai doni segnati
  const { mods: doniMods, svn: doniSvn, block: doniBlock } = getDoniEffettiAttivi();

  // ── Approcci ──────────────────────────────────────────
  APPROCCI_NAMES.forEach(name => {
    const key = name.toLowerCase().replace('à', 'a');

    // Calcola modificatore totale: condizioni + doni
    let mod = 0;
    if (ansia && ANSIA_KEYS.includes(key)) mod -= 1;
    if (esau  && ESAU_KEYS.includes(key))  mod -= 1;
    mod += (doniMods[key] || 0);

    const isSvn = doniSvn.has(key);
    const isPen = mod < 0 || isSvn;

    g('al-' + key)?.classList.toggle('pen', isPen);
    g('db-' + key)?.classList.toggle('pen', isPen);

    // Mostra il modificatore numerico (es. -1, -2…)
    const mdEl = g('md-' + key);
    if (mdEl) {
      mdEl.classList.toggle('on', mod < 0);
      if (mod < 0) mdEl.textContent = String(mod);
    }

    // Mostra indicatore svantaggio
    const svEl = g('sv-' + key);
    if (svEl) svEl.classList.toggle('on', isSvn);
  });

  // ── Vergogna → personalità ────────────────────────────
  g('sec-pers')?.classList.toggle('dimmed', verg);
  PC.personalita?.forEach((_, i) => {
    const el = g('p-' + i);
    if (!el) return;
    if (verg) { el.classList.add('str'); el.classList.remove('on'); }
    else el.classList.remove('str');
  });

  // ── Paura → addestramento ────────────────────────────
  g('sec-add')?.classList.toggle('dimmed', paura);
  PC.addestramento?.forEach((_, i) => {
    const el = g('a-' + i);
    if (!el) return;
    if (paura) { el.classList.add('str'); el.classList.remove('on'); }
    else el.classList.remove('str');
  });

  // ── Confusione o dono → blocca moventi ───────────────
  const blockMoventi = conf || doniBlock.has('moventi');
  g('sec-mov')?.classList.toggle('dimmed', blockMoventi);
  ['mn-asp', 'mn-dov'].forEach(id => g(id)?.classList.toggle('str',     blockMoventi));
  ['m-asp',  'm-dov' ].forEach(id => g(id)?.classList.toggle('blocked', blockMoventi));

  // ── Rabbia o dono → blocca legami ────────────────────
  const blockLegami = rabbia || doniBlock.has('legami');
  g('sec-leg')?.classList.toggle('dimmed', blockLegami);
  PC.legami?.forEach((_, i) => {
    g('l-'  + i)?.classList.toggle('blocked', blockLegami);
    g('ln-' + i)?.classList.toggle('str',     blockLegami);
  });
}

// ─────────────────────────────────────────────
//  MECCANICHE — CHIP E DONI
// ─────────────────────────────────────────────

function toggleChip(id) { g(id)?.classList.toggle('on'); }

/**
 * Segna/libera un dono e aggiorna la scheda con i suoi effetti persistenti.
 * Se il dono viene segnato e ha un popup tuttavia, lo mostra.
 * Se il dono viene liberato, rimuove eventuali blocchi condizionali.
 */
function toggleDon(i) {
  const el = g('dc-' + i);
  if (!el) return;
  el.classList.toggle('on');
  const isOn = el.classList.contains('on');

  if (isOn && PC.doni?.[i]) {
    // Cerca dati popup: prima sull'oggetto dono, poi in RETAGGI (retrocompatibile)
    const dono = PC.doni[i];
    let popup = dono.popup;
    if (!popup && PC.retaggio && RETAGGI[PC.retaggio]) {
      const fonte = RETAGGI[PC.retaggio].doni.find(d => d.nome === dono.nome);
      popup = fonte?.popup;
    }
    if (popup) showDonPopup(dono.nome, dono.tuttavia || '', popup, i);
  } else if (!isOn) {
    // Libera blocchi condizionali di questo dono (es. Specchio Arcano con dado1)
    [..._conditionalBlock].forEach(entry => {
      if (entry.startsWith(i + ':')) _conditionalBlock.delete(entry);
    });
  }

  updateAll();
}

function toggleDonBody(i) {
  const b = g('db-' + i);
  const a = g('da-' + i);
  if (!b) return;
  b.classList.toggle('h');
  a?.classList.toggle('open', !b.classList.contains('h'));
}

function useM(id) {
  if (!g(id)?.classList.contains('blocked')) g(id)?.classList.toggle('on');
}

function useL(id) {
  if (!g(id)?.classList.contains('blocked')) g(id)?.classList.toggle('on');
}

// ─────────────────────────────────────────────
//  POPUP TUTTAVIA DONO
// ─────────────────────────────────────────────

/** Dati del popup attivo: { tipo, effetto, donIndex } */
let _popupEffect = null;

/**
 * Mostra il popup per il tuttavia di un dono appena segnato.
 * @param {string}  nome     - Nome del dono
 * @param {string}  tuttavia - Testo del tuttavia
 * @param {object}  popup    - { tipo: 'dado1'|'automatico', effetto: string|null }
 * @param {number}  donIndex - Indice nel PC.doni
 */
function showDonPopup(nome, tuttavia, popup, donIndex) {
  _popupEffect = { ...popup, donIndex };
  g('pop-nome').textContent    = nome;
  g('pop-tuttavia').textContent = tuttavia;

  const isAuto = popup.tipo === 'automatico';
  if (isAuto) {
    g('pop-question').textContent  = 'Questo effetto si applica automaticamente.';
    g('pop-btn-si').textContent    = popup.effetto ? 'Applica' : 'OK';
    g('pop-btn-no').style.display  = 'none';
  } else {
    g('pop-question').textContent  = 'Hai ottenuto 1 sul d6?';
    g('pop-btn-si').textContent    = popup.effetto ? 'Sì, applica' : 'Sì';
    g('pop-btn-no').style.display  = '';
  }

  g('don-popup').style.display = 'flex';
}

function closeDonPopupOutside(e) {
  if (e.target === g('don-popup')) closeDonPopup();
}

function closeDonPopup() {
  g('don-popup').style.display = 'none';
  _popupEffect = null;
}

/**
 * L'utente conferma: applica l'effetto sulla scheda.
 * Ferite e condizioni sono PERMANENTI — non vengono rimossi
 * automaticamente quando il dono viene liberato.
 * L'unica eccezione sono i blocchi condizionali (blocca:X) che
 * durano finché il dono rimane segnato.
 */
function applyDonEffect() {
  if (_popupEffect?.effetto) {
    applyEffettoScheda(_popupEffect.effetto, _popupEffect.donIndex);
  }
  closeDonPopup();
}

function skipDonEffect() {
  closeDonPopup();
}

/**
 * Applica un effetto negativo alla scheda.
 * @param {string} effetto   - 'ferita' | id condizione | 'blocca:X'
 * @param {number} donIndex  - Indice del dono nel PC.doni
 */
function applyEffettoScheda(effetto, donIndex) {
  if (effetto === 'ferita') {
    // Aggiunge una ferita; rimane anche dopo che il dono viene liberato
    const next = Math.min(wounds + 1, 4);
    if (next > wounds) toggleWound(next);

  } else if (effetto.startsWith('blocca:')) {
    // Blocco persistente condizionale: attivo solo finché il dono è segnato
    const target = effetto.slice(7); // 'blocca:moventi' → 'moventi'
    _conditionalBlock.add(donIndex + ':' + target);
    updateAll();

  } else {
    // Condizione (ansia, esau, verg, paura, conf, rabbia)
    // Rimane attiva anche dopo che il dono viene liberato
    const el = g('c-' + effetto);
    if (el && !el.classList.contains('on')) {
      el.classList.add('on');
      updateAll();
    }
  }
}

// ─────────────────────────────────────────────
//  AZIONI SPECIALI
// ─────────────────────────────────────────────

function clearSigns() {
  signs.fill(false);
  for (let i = 1; i <= 3; i++) g('sg' + i)?.classList.remove('on');
  if (g('slbl')) g('slbl').textContent = SIGN_LABELS[0];
  PC.doni?.forEach((_, i) => g('dc-' + i)?.classList.remove('on'));
  _conditionalBlock.clear(); // rimuove blocchi condizionali (es. Specchio Arcano)
  updateAll(); // rimuove gli effetti persistenti dei doni liberati
}

function cediPulsione() {
  clearSigns();
  fb('Pulsione ceduta — segni e doni rimossi.', 'w');
  closeMenu();
}

function usaSanctus() {
  wounds = 0;
  for (let i = 1; i <= 4; i++) g('w' + i)?.classList.remove('on');
  if (g('wlbl')) g('wlbl').textContent = '0/3';
  clearSigns();
  fb('Sanctus usato — ferite e segni rimossi.', 's');
  closeMenu();
}

function resetAll() {
  wounds = 0;
  for (let i = 1; i <= 4; i++) g('w' + i)?.classList.remove('on');
  if (g('wlbl')) g('wlbl').textContent = '0/3';

  ['ansia', 'esau', 'verg', 'paura', 'conf', 'rabbia']
    .forEach(c => g('c-' + c)?.classList.remove('on'));
  updateAll();
  clearSigns();

  ['m-asp', 'm-dov'].forEach(id => g(id)?.classList.remove('on', 'blocked'));
  PC.personalita?.forEach((_, i)   => g('p-' + i)?.classList.remove('on', 'str'));
  PC.addestramento?.forEach((_, i) => g('a-' + i)?.classList.remove('on', 'str'));
  PC.legami?.forEach((_, i) => {
    g('l-'  + i)?.classList.remove('on', 'blocked');
    g('ln-' + i)?.classList.remove('str');
  });
  PC.equipaggiamento?.forEach((_, i) => g('eq-' + i)?.classList.remove('on'));

  if (g('fbar')) g('fbar').style.display = 'none';
  closeMenu();
}

// ─────────────────────────────────────────────
//  DRAG & DROP SEZIONI
// ─────────────────────────────────────────────

function initDrag() {
  const cont = g('sections');
  let dragEl  = null;

  cont.querySelectorAll('.sec').forEach(sec => {
    sec.addEventListener('dragstart', e => {
      dragEl = sec;
      sec.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    sec.addEventListener('dragend', () => {
      dragEl = null;
      sec.classList.remove('dragging');
      cont.querySelectorAll('.sec').forEach(s => s.classList.remove('drag-over'));
      const order = [...cont.querySelectorAll('.sec')].map(s => s.id.replace('sec-', ''));
      if (!PC.layout) PC.layout = {};
      PC.layout.order = order;
      saveToStorage();
    });
    sec.addEventListener('dragover', e => {
      e.preventDefault();
      if (dragEl && dragEl !== sec) {
        sec.classList.add('drag-over');
        const rect = sec.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) cont.insertBefore(dragEl, sec);
        else cont.insertBefore(dragEl, sec.nextSibling);
      }
    });
    sec.addEventListener('dragleave', () => sec.classList.remove('drag-over'));
    sec.addEventListener('drop', e => { e.preventDefault(); sec.classList.remove('drag-over'); });
  });
}