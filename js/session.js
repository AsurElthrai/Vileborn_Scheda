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

// ─────────────────────────────────────────────
//  BUILD SESSIONE
// ─────────────────────────────────────────────

function buildSession() {
  if (!PC) return;
  wounds = 0;
  signs.fill(false);

  g('disp-nome').textContent = PC.nome;
  g('disp-sub').textContent  = `${PC.origine} · ${PC.retaggio} · Atto ${PC.atto}`;

  buildSections();
  initDrag();
  showSession();
}

function buildSections() {
  const cont = g('sections');
  cont.innerHTML = '';

  const built = {
    stato: buildStato(),
    cond:  buildCondizioni(),
    app:   buildApprocci(),
    pers:  buildPersonalita(),
    add:   buildAddestramento(),
    doni:  buildDoni(),
    mov:   buildMoventi(),
    leg:   buildLegami(),
    eq:    buildEquipaggiamento()
  };

  const defaultOrder = ['stato','cond','app','pers','add','doni','mov','leg','eq'];
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
}

function updateColButtons(id, n) {
  [1, 2, 3].forEach(i => {
    const btn = g('cb' + i + '-' + id);
    if (btn) btn.classList.toggle('active', i === n);
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
        <button id="cb3-${id}" class="col-btn" onclick="setSectionCols('${id}',3)" title="3 colonne">3</button>
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
    const extra  = (PC.capacita && name === 'Ragione')
      ? `<span class="itag" title="${PC.capacita}">★</span>` : '';
    return `
      <div class="app-row">
        <span class="app-lbl" id="al-${key}">${name}</span>
        <div class="app-right">
          <span class="dbadge ${isHigh ? 'hi' : ''}" id="db-${key}">${die}</span>
          ${extra}
          <span class="mod" id="md-${key}">-1</span>
        </div>
      </div>`;
  }).join('');

  return makeSection('app', 'Approcci', rows);
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
          onclick="event.stopPropagation(); g('dc-${i}').classList.toggle('on')"></div>
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

function updateAll() {
  const ansia  = g('c-ansia')?.classList.contains('on');
  const esau   = g('c-esau')?.classList.contains('on');
  const verg   = g('c-verg')?.classList.contains('on');
  const paura  = g('c-paura')?.classList.contains('on');
  const conf   = g('c-conf')?.classList.contains('on');
  const rabbia = g('c-rabbia')?.classList.contains('on');

  // Ansia → penalizza ragione, precisione, sotterfugio
  ANSIA_KEYS.forEach(k => {
    g('al-' + k)?.classList.toggle('pen', ansia);
    g('db-' + k)?.classList.toggle('pen', ansia);
    g('md-' + k)?.classList.toggle('on',  ansia);
  });

  // Esaurimento → penalizza impeto, volontà, ascendente
  ESAU_KEYS.forEach(k => {
    g('al-' + k)?.classList.toggle('pen', esau);
    g('db-' + k)?.classList.toggle('pen', esau);
    g('md-' + k)?.classList.toggle('on',  esau);
  });

  // Vergogna → sezione personalità rossa + barra chip
  g('sec-pers')?.classList.toggle('dimmed', verg);
  PC.personalita?.forEach((_, i) => {
    const el = g('p-' + i);
    if (!el) return;
    if (verg) { el.classList.add('str'); el.classList.remove('on'); }
    else el.classList.remove('str');
  });

  // Paura → sezione addestramento rossa + barra chip
  g('sec-add')?.classList.toggle('dimmed', paura);
  PC.addestramento?.forEach((_, i) => {
    const el = g('a-' + i);
    if (!el) return;
    if (paura) { el.classList.add('str'); el.classList.remove('on'); }
    else el.classList.remove('str');
  });

  // Confusione → sezione moventi rossa + blocca checkbox
  g('sec-mov')?.classList.toggle('dimmed', conf);
  ['mn-asp', 'mn-dov'].forEach(id => g(id)?.classList.toggle('str', conf));
  ['m-asp',  'm-dov' ].forEach(id => g(id)?.classList.toggle('blocked', conf));

  // Rabbia → sezione legami rossa + blocca checkbox
  g('sec-leg')?.classList.toggle('dimmed', rabbia);
  PC.legami?.forEach((_, i) => {
    g('l-' + i)?.classList.toggle('blocked', rabbia);
    g('ln-' + i)?.classList.toggle('str', rabbia);
  });
}

// ─────────────────────────────────────────────
//  MECCANICHE — CHIP E DONI
// ─────────────────────────────────────────────

function toggleChip(id) { g(id)?.classList.toggle('on'); }

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
//  AZIONI SPECIALI
// ─────────────────────────────────────────────

function clearSigns() {
  signs.fill(false);
  for (let i = 1; i <= 3; i++) g('sg' + i)?.classList.remove('on');
  if (g('slbl')) g('slbl').textContent = SIGN_LABELS[0];
  PC.doni?.forEach((_, i) => g('dc-' + i)?.classList.remove('on'));
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