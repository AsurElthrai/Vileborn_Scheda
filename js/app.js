/**
 * app.js
 * Bootstrap dell'applicazione.
 * Gestisce: tema dark/light, localStorage, export/import JSON,
 * navigazione tra setup e sessione, menu contestuale.
 *
 * Dipende da: data.js
 * Viene usato da: setup.js, session.js
 */

'use strict';

// ─────────────────────────────────────────────
//  STATO GLOBALE
// ─────────────────────────────────────────────

/** Personaggio attivo. Null finché non viene creato o caricato. */
let PC = null;

// ─────────────────────────────────────────────
//  UTILITY DOM
// ─────────────────────────────────────────────

/** Shorthand getElementById */
function g(id) {
  return document.getElementById(id);
}

// ─────────────────────────────────────────────
//  TEMA DARK / LIGHT
// ─────────────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem('vileborn_theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeButtons();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vileborn_theme', next);
  updateThemeButtons();
}

function updateThemeButtons() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon  = isDark ? '&#9790;' : '&#9788;';
  const title = isDark ? 'Modalità chiara' : 'Modalità scura';
  ['theme-btn', 'theme-btn-setup'].forEach(id => {
    const btn = g(id);
    if (btn) { btn.innerHTML = icon; btn.title = title; }
  });
}

// ─────────────────────────────────────────────
//  LOCAL STORAGE
// ─────────────────────────────────────────────

function saveToStorage() {
  try {
    localStorage.setItem('vileborn_pc', JSON.stringify(PC));
  } catch (e) {
    console.warn('Impossibile salvare in localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('vileborn_pc');
    if (raw) { PC = JSON.parse(raw); return true; }
  } catch (e) {
    console.warn('Impossibile leggere dal localStorage:', e);
  }
  return false;
}

// ─────────────────────────────────────────────
//  FEEDBACK TOAST
// ─────────────────────────────────────────────

let feedbackTimer = null;

/**
 * Mostra una notifica temporanea nella scheda di sessione.
 * @param {string} msg  - Testo da mostrare
 * @param {'w'|'s'|'d'} type - warning / success / danger
 */
function fb(msg, type) {
  const bar = g('fbar');
  if (!bar) return;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  bar.textContent = msg;
  bar.className = `fbar ${type} flash`;
  bar.style.display = 'block';
  feedbackTimer = setTimeout(() => { bar.style.display = 'none'; }, 2500);
}

// ─────────────────────────────────────────────
//  NAVIGAZIONE SETUP ↔ SESSIONE
// ─────────────────────────────────────────────

function showSession() {
  g('setup-screen').style.display  = 'none';
  g('session-screen').style.display = 'block';
}

function showSetup() {
  g('session-screen').style.display = 'none';
  g('setup-screen').style.display   = 'flex';
}

/** Torna al setup pre-compilando il form con i dati del personaggio corrente. */
function goSetup() {
  closeMenu();
  showSetup();
  if (PC) prefillSetupForm();
}

// ─────────────────────────────────────────────
//  MENU CONTESTUALE
// ─────────────────────────────────────────────

function toggleMenu() {
  g('actions-menu').classList.toggle('open');
}

function closeMenu() {
  g('actions-menu').classList.remove('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#actions-menu') && !e.target.closest('#menu-btn')) {
    closeMenu();
  }
});

// ─────────────────────────────────────────────
//  COLONNE GRIGLIA
// ─────────────────────────────────────────────

let gridCols = 3;

function initGridCols() {
  const saved = parseInt(localStorage.getItem('vileborn_cols'));
  if (saved && saved >= 1 && saved <= 6) gridCols = saved;
  applyGridCols();
}

function changeGridCols(delta) {
  gridCols = Math.min(6, Math.max(1, gridCols + delta));
  applyGridCols();
  localStorage.setItem('vileborn_cols', gridCols);
}

function applyGridCols() {
  document.documentElement.style.setProperty('--ncols', String(gridCols));
  const lbl = g('cols-lbl');
  if (lbl) lbl.textContent = gridCols;
  if (typeof resizeSectionGrid === 'function') requestAnimationFrame(resizeSectionGrid);
}

// ─────────────────────────────────────────────
//  SCALA UI
// ─────────────────────────────────────────────

let uiScale = 1.0;

function initScale() {
  const saved = parseFloat(localStorage.getItem('vileborn_scale'));
  if (saved && saved >= 0.5 && saved <= 1.0) uiScale = saved;
  applyScale();
}

function changeScale(delta) {
  uiScale = Math.min(1.0, Math.max(0.5, Math.round((uiScale + delta) * 20) / 20));
  applyScale();
  localStorage.setItem('vileborn_scale', uiScale);
}

function applyScale() {
  const body = g('session-body');
  if (body) body.style.zoom = String(uiScale);
  const lbl = g('scale-lbl');
  if (lbl) lbl.textContent = Math.round(uiScale * 100) + '%';
  if (typeof resizeSectionGrid === 'function') requestAnimationFrame(resizeSectionGrid);
}

// ─────────────────────────────────────────────
//  MODALITÀ COMPATTA
// ─────────────────────────────────────────────

let compact = false;

function toggleCompact() {
  compact = !compact;
  g('session-body').classList.toggle('compact-mode', compact);
  const btn = g('view-toggle-btn');
  btn.textContent = compact ? 'Normale' : 'Compatta';
  btn.classList.toggle('compact-active', compact);
}

// ─────────────────────────────────────────────
//  EXPORT / IMPORT JSON
// ─────────────────────────────────────────────

function exportJSON() {
  if (!PC) return;
  const json = JSON.stringify(PC, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${(PC.nome || 'personaggio').toLowerCase().replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  closeMenu();
}

function triggerImport() {
  g('import-input').click();
  closeMenu();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      PC = JSON.parse(evt.target.result);
      saveToStorage();
      buildSession();
      fb('Personaggio caricato!', 's');
    } catch (err) {
      alert('File JSON non valido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────

initTheme();
initGridCols();
initScale();

// Se esiste un personaggio salvato, proponi di caricarlo
if (loadFromStorage() && PC) {
  const banner = document.createElement('div');
  banner.className = 'resume-banner';
  banner.innerHTML = `
    <span>Personaggio salvato: <strong>${PC.nome}</strong></span>
    <button class="resume-load" onclick="buildSession(); this.parentElement.remove()">Carica</button>
    <button class="resume-dismiss" onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.appendChild(banner);
}