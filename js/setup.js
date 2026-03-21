/**
 * setup.js
 * Gestisce la schermata di configurazione del personaggio:
 *  - Tab manuale (scelte dipendenti) e tab JSON
 *  - Griglia origini e retaggi con card selezionabili
 *  - Capacità origine dipendente dalla selezione
 *  - Doni retaggio dipendenti dalla selezione
 *  - Approcci auto-aggiornati da origine + retaggio
 *  - Suggerimenti personalità/addestramento dipendenti
 *  - Legami, equipaggiamento, moventi
 *
 * Dipende da: data.js, app.js
 */

'use strict';

// ─────────────────────────────────────────────
//  STATO SETUP
// ─────────────────────────────────────────────

let selOrigin   = null;   // nome origine selezionata
let selRetaggio = null;   // nome retaggio selezionato
let selCapacita = null;   // oggetto capacità selezionata { nome, desc, negativo }
let selDoni     = new Set(); // indici doni selezionati

const tagData   = { pers: [], add: [] }; // tag personalità e addestramento

let doniRows    = [];  // doni aggiuntivi manuali
let legamiRows  = [];  // righe legami
let eqRows      = [];  // righe equipaggiamento

// ─────────────────────────────────────────────
//  TAB SETUP (manuale / json)
// ─────────────────────────────────────────────

function switchSetupTab(tab) {
  g('panel-manual').style.display = tab === 'manual' ? '' : 'none';
  g('panel-json').style.display   = tab === 'json'   ? '' : 'none';
  g('tab-manual').classList.toggle('active', tab === 'manual');
  g('tab-json').classList.toggle('active',   tab === 'json');
}

// ─────────────────────────────────────────────
//  GRIGLIA ORIGINI
// ─────────────────────────────────────────────

function initOrigineGrid() {
  const grid = g('origine-grid');
  grid.innerHTML = '';
  Object.entries(ORIGINI).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.id = 'orig-' + name;
    card.innerHTML = `
      <div class="choice-card-name">${name}</div>
      <div class="choice-card-sub">${data.sub}</div>`;
    card.onclick = () => selectOrigin(name);
    grid.appendChild(card);
  });
}

function selectOrigin(name) {
  selOrigin = name;
  document.querySelectorAll('#origine-grid .choice-card')
    .forEach(c => c.classList.remove('selected'));
  g('orig-' + name).classList.add('selected');

  renderCapacitaSection();
  updateApproccioGrid();
  renderSuggestions('pers');
  renderSuggestions('add');
}

// ─────────────────────────────────────────────
//  CAPACITÀ ORIGINE (dipendente)
// ─────────────────────────────────────────────

function renderCapacitaSection() {
  if (!selOrigin) return;
  const sec  = g('capacita-section');
  const list = g('capacita-list');
  sec.style.display = 'block';
  list.innerHTML = '';
  selCapacita = null;

  ORIGINI[selOrigin].capacita.forEach((cap, i) => {
    const item = document.createElement('div');
    item.className = 'choice-item';
    item.id = 'cap-' + i;
    item.innerHTML = `
      <div class="choice-item-radio"></div>
      <div class="choice-item-body">
        <div class="choice-item-name">${cap.nome}</div>
        <div class="choice-item-desc">${cap.desc}</div>
        ${cap.negativo
          ? `<div class="choice-item-however">${cap.negativo}</div>`
          : ''}
      </div>`;
    item.onclick = () => selectCapacita(i, cap);
    list.appendChild(item);
  });
}

function selectCapacita(i, cap) {
  selCapacita = cap;
  document.querySelectorAll('#capacita-list .choice-item')
    .forEach(c => c.classList.remove('selected'));
  g('cap-' + i).classList.add('selected');
}

// ─────────────────────────────────────────────
//  GRIGLIA RETAGGI OSCURI
// ─────────────────────────────────────────────

function initRetaggioGrid() {
  const grid = g('retaggio-grid');
  grid.innerHTML = '';
  Object.entries(RETAGGI).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.id = 'ret-' + name;
    card.innerHTML = `
      <div class="choice-card-name">${name}</div>
      <div class="choice-card-sub">${data.sub}</div>`;
    card.onclick = () => selectRetaggio(name);
    grid.appendChild(card);
  });
}

function selectRetaggio(name) {
  selRetaggio = name;
  selDoni.clear();
  document.querySelectorAll('#retaggio-grid .choice-card')
    .forEach(c => c.classList.remove('selected'));
  g('ret-' + name).classList.add('selected');

  renderDoniSection();
  updateApproccioGrid();
  renderSuggestions('pers');
  renderSuggestions('add');
}

// ─────────────────────────────────────────────
//  DONI RETAGGIO (dipendenti)
// ─────────────────────────────────────────────

function renderDoniSection() {
  if (!selRetaggio) return;
  const sec  = g('doni-section');
  const list = g('doni-choice-list');
  sec.style.display = 'block';
  list.innerHTML = '';

  RETAGGI[selRetaggio].doni.forEach((don, i) => {
    const item = document.createElement('div');
    item.className = 'don-choice-item';
    item.id = 'don-' + i;
    item.innerHTML = `
      <div class="don-choice-check"></div>
      <div class="don-choice-num">${don.n}</div>
      <div class="choice-item-body">
        <div class="choice-item-name">${don.nome}</div>
        <div class="choice-item-desc">${don.effetto}</div>
        <div class="choice-item-however">${don.tuttavia}</div>
      </div>`;
    item.onclick = () => toggleDonChoice(i);
    list.appendChild(item);
  });
}

function toggleDonChoice(i) {
  const item = g('don-' + i);
  if (selDoni.has(i)) {
    selDoni.delete(i);
    item.classList.remove('selected');
  } else {
    selDoni.add(i);
    item.classList.add('selected');
  }
}

// ─────────────────────────────────────────────
//  APPROCCI (auto-aggiornati)
// ─────────────────────────────────────────────

function initApproccioGrid() {
  const grid = g('approcci-grid');
  grid.innerHTML = '';
  APPROCCI_NAMES.forEach(name => {
    const key = name.toLowerCase().replace('à', 'a');
    const div = document.createElement('div');
    div.className = 'approccio-item';
    div.innerHTML = `
      <span class="approccio-name" id="app-lbl-${key}">${name}</span>
      <select class="die-select" id="die-${key}">
        ${DICE_ORDER.map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>`;
    grid.appendChild(div);
  });
  updateApproccioGrid();
}

function updateApproccioGrid() {
  const boosts = new Set();
  if (selOrigin)   ORIGINI[selOrigin].boost.forEach(b => boosts.add(b));
  if (selRetaggio) RETAGGI[selRetaggio].boost.forEach(b => boosts.add(b));

  APPROCCI_NAMES.forEach(name => {
    const key     = name.toLowerCase().replace('à', 'a');
    const sel     = g('die-' + key);
    const lbl     = g('app-lbl-' + key);
    const boosted = boosts.has(name);
    if (sel) sel.value = boosted ? 'd8' : 'd6';
    if (lbl) {
      lbl.style.fontWeight = boosted ? '500' : '400';
      lbl.style.color      = boosted ? 'var(--gold)' : '';
    }
  });
}

// ─────────────────────────────────────────────
//  SUGGERIMENTI PERSONALITÀ / ADDESTRAMENTO
// ─────────────────────────────────────────────

function renderSuggestions(ns) {
  const container = g(ns + '-suggestions');
  if (!container) return;
  container.innerHTML = '';

  let opts = [];
  const src = ns === 'pers' ? 'personalita' : 'addestramento';
  if (selOrigin)   opts = [...opts, ...ORIGINI[selOrigin][src]];
  if (selRetaggio) opts = [...opts, ...RETAGGI[selRetaggio][src]];
  opts = [...new Set(opts)]; // deduplication

  opts.forEach(opt => {
    const chip = document.createElement('span');
    chip.className = 'sug-chip';
    chip.textContent = opt;
    chip.onclick = () => {
      if (!tagData[ns].includes(opt)) {
        addTag(ns, opt);
        chip.classList.add('used');
      }
    };
    container.appendChild(chip);
  });
}

// ─────────────────────────────────────────────
//  TAG INPUT (personalità e addestramento)
// ─────────────────────────────────────────────

function focusTagInput(ns) {
  const wrap = g(ns + '-tags');
  let inp = wrap.querySelector('.tag-text-input');
  if (!inp) {
    inp = document.createElement('input');
    inp.className   = 'tag-text-input';
    inp.placeholder = 'scrivi e premi Invio…';
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && inp.value.trim()) {
        e.preventDefault();
        addTag(ns, inp.value.trim());
        inp.value = '';
      }
      if (e.key === 'Backspace' && !inp.value && tagData[ns].length) {
        removeTag(ns, tagData[ns].length - 1);
      }
    });
    wrap.appendChild(inp);
  }
  inp.focus();
}

function addTag(ns, val) {
  tagData[ns].push(val);
  renderTags(ns);
}

function removeTag(ns, idx) {
  tagData[ns].splice(idx, 1);
  renderTags(ns);
}

function renderTags(ns) {
  const wrap = g(ns + '-tags');
  wrap.innerHTML = '';
  tagData[ns].forEach((t, i) => {
    const span = document.createElement('span');
    span.className = 'tag-item';
    span.innerHTML = `${t}<button onclick="removeTag('${ns}',${i})">✕</button>`;
    wrap.appendChild(span);
  });
  focusTagInput(ns);
}

// ─────────────────────────────────────────────
//  DONI MANUALI AGGIUNTIVI
// ─────────────────────────────────────────────

function addDoneRow(nome = '', effetto = '', tuttavia = '') {
  const id = Date.now() + Math.random();
  doniRows.push({ id, nome, effetto, tuttavia });
  renderDoniList();
}

function removeDoneRow(id) {
  doniRows = doniRows.filter(d => d.id !== id);
  renderDoniList();
}

function renderDoniList() {
  const cont = g('doni-list');
  cont.innerHTML = '';
  doniRows.forEach(d => {
    const div = document.createElement('div');
    div.className = 'manual-row';
    div.innerHTML = `
      <div class="manual-row-header">
        <input class="field-input" type="text" value="${d.nome}"
          placeholder="Nome dono"
          oninput="doniRows.find(x=>x.id===${d.id}).nome=this.value">
        <button class="remove-row-btn" onclick="removeDoneRow(${d.id})">✕</button>
      </div>
      <input class="field-input" type="text" value="${d.effetto}"
        placeholder="Effetto…"
        oninput="doniRows.find(x=>x.id===${d.id}).effetto=this.value">
      <input class="field-input" type="text" value="${d.tuttavia}"
        placeholder="Tuttavia…"
        oninput="doniRows.find(x=>x.id===${d.id}).tuttavia=this.value">`;
    cont.appendChild(div);
  });
}

// ─────────────────────────────────────────────
//  LEGAMI
// ─────────────────────────────────────────────

function addLegameRow(nome = '', valore = 4, npc = false) {
  const id = Date.now() + Math.random();
  legamiRows.push({ id, nome, valore, npc });
  renderLegamiList();
}

function removeLegameRow(id) {
  legamiRows = legamiRows.filter(l => l.id !== id);
  renderLegamiList();
}

function renderLegamiList() {
  const cont = g('legami-list');
  cont.innerHTML = '';
  legamiRows.forEach(l => {
    const div = document.createElement('div');
    div.className = 'legame-row-setup';
    div.innerHTML = `
      <input class="field-input" type="text" value="${l.nome}"
        placeholder="Nome…"
        oninput="legamiRows.find(x=>x.id===${l.id}).nome=this.value"
        style="flex:1">
      <input type="number" min="1" max="10" value="${l.valore}"
        class="legame-val-input"
        oninput="legamiRows.find(x=>x.id===${l.id}).valore=parseInt(this.value)||4">
      <label class="legame-npc-label">
        <input type="checkbox" ${l.npc ? 'checked' : ''}
          onchange="legamiRows.find(x=>x.id===${l.id}).npc=this.checked"> NPC
      </label>
      <button class="remove-row-btn" onclick="removeLegameRow(${l.id})">✕</button>`;
    cont.appendChild(div);
  });
}

// ─────────────────────────────────────────────
//  EQUIPAGGIAMENTO
// ─────────────────────────────────────────────

function addEqRow(nome = '', desc = '', tipo = 'custom') {
  const id = Date.now() + Math.random();
  eqRows.push({ id, nome, desc, tipo });
  renderEqList();
}

function removeEqRow(id) {
  eqRows = eqRows.filter(e => e.id !== id);
  renderEqList();
}

function renderEqList() {
  const cont = g('eq-list');
  cont.innerHTML = '';
  eqRows.forEach(e => {
    const div = document.createElement('div');
    div.className = 'eq-row-setup';
    div.innerHTML = `
      <div class="eq-row-fields">
        <input class="field-input" type="text" value="${e.nome}"
          placeholder="Nome oggetto…"
          oninput="eqRows.find(x=>x.id===${e.id}).nome=this.value">
        <div class="eq-row-bottom">
          <input class="field-input" type="text" value="${e.desc}"
            placeholder="Descrizione / materiale…"
            style="flex:1"
            oninput="eqRows.find(x=>x.id===${e.id}).desc=this.value">
          <select class="select-input" style="width:110px"
            onchange="eqRows.find(x=>x.id===${e.id}).tipo=this.value">
            <option value="custom" ${e.tipo==='custom'?'selected':''}>Generico</option>
            <option value="arg"    ${e.tipo==='arg'   ?'selected':''}>Argentacciaio</option>
            <option value="fer"    ${e.tipo==='fer'   ?'selected':''}>Ferrofreddo</option>
            <option value="osc"    ${e.tipo==='osc'   ?'selected':''}>Oscuro</option>
          </select>
        </div>
      </div>
      <button class="remove-row-btn" onclick="removeEqRow(${e.id})" style="margin-top:9px">✕</button>`;
    cont.appendChild(div);
  });
}

// ─────────────────────────────────────────────
//  CREA PERSONAGGIO
// ─────────────────────────────────────────────

function createCharacter() {
  const nome       = g('s-nome').value.trim() || 'Senza nome';
  const atto       = g('s-atto').value;
  const origine    = selOrigin   || 'Borghese';
  const retaggio   = selRetaggio || 'Tessisorte';
  const aspirazione = g('s-aspirazione').value.trim();
  const dovere     = g('s-dovere').value.trim();

  // Capacità origine
  let capacitaStr = '';
  if (selCapacita) {
    capacitaStr = `${selCapacita.nome} — ${selCapacita.desc}`;
    if (selCapacita.negativo) capacitaStr += ` (${selCapacita.negativo})`;
  }

  // Approcci
  const approcci = {};
  APPROCCI_NAMES.forEach(n => {
    const key = n.toLowerCase().replace('à', 'a');
    const sel = g('die-' + key);
    approcci[n] = sel ? sel.value : 'd6';
  });

  // Doni: retaggio selezionati + manuali
  const doniRetaggio = selRetaggio
    ? [...selDoni].map(i => {
        const d = RETAGGI[selRetaggio].doni[i];
        return { nome: d.nome, effetto: d.effetto, tuttavia: d.tuttavia };
      })
    : [];
  const doniManuali = doniRows.map(d => ({
    nome: d.nome, effetto: d.effetto, tuttavia: d.tuttavia
  }));

  const savedLayout = PC?.layout;
  PC = {
    nome, atto, origine, retaggio,
    capacita:      capacitaStr,
    personalita:   [...tagData.pers],
    addestramento: [...tagData.add],
    approcci,
    doni:          [...doniRetaggio, ...doniManuali],
    moventi:       { aspirazione, dovere },
    legami:        legamiRows.map(l => ({ nome: l.nome, valore: l.valore, npc: l.npc })),
    equipaggiamento: eqRows.map(e => ({ nome: e.nome, desc: e.desc, tipo: e.tipo }))
  };
  if (savedLayout) PC.layout = savedLayout;

  saveToStorage();
  buildSession();
}

// ─────────────────────────────────────────────
//  PERSONAGGIO DI ESEMPIO
// ─────────────────────────────────────────────

function loadExample() {
  fetch('data/elara.json')
    .then(r => r.json())
    .then(data => { PC = data; saveToStorage(); buildSession(); })
    .catch(() => alert('Impossibile caricare il personaggio di esempio.'));
}

// ─────────────────────────────────────────────
//  CARICA JSON (tab JSON)
// ─────────────────────────────────────────────

let pendingJson = null;

function handleFileLoad(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      pendingJson = JSON.parse(evt.target.result);
      g('json-preview-text').textContent =
        `Trovato: ${pendingJson.nome || '?'} — ${pendingJson.origine || ''} ${pendingJson.retaggio || ''} — Atto ${pendingJson.atto || '?'}`;
      g('json-preview').style.display = 'block';
    } catch (err) {
      alert('File JSON non valido.');
    }
  };
  reader.readAsText(file);
}

function loadFromJson() {
  if (!pendingJson) return;
  PC = pendingJson;
  saveToStorage();
  buildSession();
}

function loadFromPaste() {
  const txt = g('json-paste').value.trim();
  if (!txt) return;
  try {
    PC = JSON.parse(txt);
    saveToStorage();
    buildSession();
  } catch (e) {
    alert('JSON non valido. Controlla il testo.');
  }
}

// Drag & drop sul json-drop
const dropZone = g('json-drop');
if (dropZone) {
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        pendingJson = JSON.parse(evt.target.result);
        g('json-preview-text').textContent =
          `Trovato: ${pendingJson.nome || '?'} — ${pendingJson.origine || ''} ${pendingJson.retaggio || ''} — Atto ${pendingJson.atto || '?'}`;
        g('json-preview').style.display = 'block';
      } catch (err) { alert('File JSON non valido.'); }
    };
    reader.readAsText(file);
  });
}

// ─────────────────────────────────────────────
//  PRE-COMPILAZIONE FORM DA PC CORRENTE
// ─────────────────────────────────────────────

function prefillSetupForm() {
  if (!PC) return;

  g('s-nome').value = PC.nome || '';
  g('s-atto').value = PC.atto || '2';
  g('s-aspirazione').value = PC.moventi?.aspirazione || '';
  g('s-dovere').value      = PC.moventi?.dovere      || '';

  // Origine
  if (PC.origine && ORIGINI[PC.origine]) {
    selectOrigin(PC.origine);
    // Seleziona capacità se corrisponde
    const caps = ORIGINI[PC.origine].capacita;
    caps.forEach((cap, i) => {
      if (PC.capacita && PC.capacita.startsWith(cap.nome)) {
        selectCapacita(i, cap);
      }
    });
  }

  // Retaggio
  if (PC.retaggio && RETAGGI[PC.retaggio]) {
    selectRetaggio(PC.retaggio);
    // Seleziona doni se corrispondono
    RETAGGI[PC.retaggio].doni.forEach((don, i) => {
      const match = (PC.doni || []).find(d => d.nome === don.nome);
      if (match) {
        selDoni.add(i);
        const item = g('don-' + i);
        if (item) item.classList.add('selected');
      }
    });
  }

  // Personalità e addestramento
  tagData.pers = [...(PC.personalita || [])];
  tagData.add  = [...(PC.addestramento || [])];
  renderTags('pers');
  renderTags('add');

  // Approcci
  APPROCCI_NAMES.forEach(n => {
    const key = n.toLowerCase().replace('à', 'a');
    const sel = g('die-' + key);
    if (sel && PC.approcci?.[n]) sel.value = PC.approcci[n];
  });

  // Doni manuali (quelli non dal retaggio)
  const doniRetNomi = selRetaggio
    ? RETAGGI[selRetaggio].doni.map(d => d.nome)
    : [];
  doniRows = (PC.doni || [])
    .filter(d => !doniRetNomi.includes(d.nome))
    .map((d, i) => ({ id: Date.now() + i, nome: d.nome || '', effetto: d.effetto || '', tuttavia: d.tuttavia || '' }));
  renderDoniList();

  // Legami
  legamiRows = (PC.legami || []).map((l, i) => ({
    id: Date.now() + i + 100,
    nome: l.nome || '', valore: l.valore || 4, npc: l.npc || false
  }));
  renderLegamiList();

  // Equipaggiamento
  eqRows = (PC.equipaggiamento || []).map((e, i) => ({
    id: Date.now() + i + 200,
    nome: e.nome || '', desc: e.desc || '', tipo: e.tipo || 'custom'
  }));
  renderEqList();
}

// ─────────────────────────────────────────────
//  INIT SETUP
// ─────────────────────────────────────────────

initOrigineGrid();
initRetaggioGrid();
initApproccioGrid();

// Righe iniziali vuote
addLegameRow();