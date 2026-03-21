# Vileborn — Scheda di Sessione

Web app per la gestione della scheda di sessione del gioco di ruolo **Vileborn** (Claudio Pustorino, Horrible Guild).

Funziona direttamente nel browser — nessuna installazione necessaria.

publish branch per la pubblicazione

---

## Struttura del progetto

```
vileborn-scheda/
├── index.html          ← Struttura HTML
├── css/
│   └── style.css       ← Stili (tema light + dark)
├── js/
│   ├── data.js         ← Database origini, retaggi, doni
│   ├── app.js          ← Bootstrap, tema, storage, export/import
│   ├── setup.js        ← Logica schermata configurazione
│   └── session.js      ← Logica scheda di sessione
├── data/
│   └── example.json      ← Personaggio di esempio
└── README.md
```

> **Nota**: per lavorare localmente apri `index.html` tramite un server locale (es. Live Server in VS Code o IntelliJ). I browser bloccano il caricamento di file JS locali per sicurezza (`file://`).  
> Su **GitHub Pages** funziona senza configurazioni aggiuntive.

---

## Come usarla

### Primo avvio

All'apertura puoi scegliere tra:

- **Nuovo personaggio** — compila il form guidato con scelte dipendenti (i doni cambiano in base al retaggio, le capacità in base all'origine, i suggerimenti di personalità e addestramento si aggiornano automaticamente)
- **Carica JSON** — trascina o seleziona un file `.json` esportato in precedenza, oppure incolla il testo JSON direttamente

Il personaggio viene salvato automaticamente nel browser e ricaricato all'avvio successivo.

### Durante la sessione

| Azione | Come |
|---|---|
| Segna ferite | Tocca le caselle quadrate (la quarta tratteggiata = fuori gioco) |
| Segni retaggio | Tocca i pallini colorati (viola → arancione → rosso) |
| Attiva condizione | Tocca la condizione — gli effetti sui approcci si applicano visivamente |
| Usa un dono | Tocca la casella a sinistra del nome; tocca il nome per espandere effetto e conseguenze |
| Riorganizza sezioni | Tieni premuto la maniglia (⋮⋮⋮) e trascina |
| Compatta la vista | Tasto "Compatta" in alto a destra |
| Cambia tema | Tasto ☀/☽ |

### Menu (⋮)

| Voce | Azione |
|---|---|
| Esporta JSON | Scarica il file del personaggio |
| Importa JSON | Carica un personaggio da file |
| Modifica personaggio | Torna al form di configurazione |
| Cedi alla pulsione | Rimuove segni e doni segnati |
| Sanctus | Rimuove ferite, segni e doni |
| Reset | Azzera tutta la sessione |

---

## Per i tuoi amici

1. Condividi il link GitHub Pages
2. Ognuno apre la pagina, compila il proprio personaggio dal form o carica il proprio JSON
3. I dati vengono salvati nel browser del proprio dispositivo

---

## Aggiornare i dati di gioco

Tutto il contenuto di regole (origini, retaggi, doni) si trova in **`js/data.js`**. Per modificare un effetto, aggiungere un dono o correggere un testo, modifica solo quel file — il resto dell'app si aggiorna automaticamente.

---

## Formato JSON personaggio

```json
{
  "nome": "Nome personaggio",
  "atto": "2",
  "origine": "Borghese",
  "retaggio": "Tessisorte",
  "capacita": "Mente Acuta — descrizione",
  "personalita": ["riflessivo", "giocoso"],
  "addestramento": ["strategia", "infiltratore"],
  "approcci": {
    "Impeto": "d6", "Volontà": "d6", "Ascendente": "d8",
    "Ragione": "d8", "Precisione": "d10", "Sotterfugio": "d8"
  },
  "doni": [
    { "nome": "Nome dono", "effetto": "Descrizione.", "tuttavia": "Conseguenza." }
  ],
  "moventi": { "aspirazione": "", "dovere": "" },
  "legami": [
    { "nome": "Nome", "valore": 6, "npc": false }
  ],
  "equipaggiamento": [
    { "nome": "Oggetto", "desc": "Materiale", "tipo": "custom" }
  ]
}
```

Tipi equipaggiamento: `custom`, `arg` (argentacciaio), `fer` (ferrofreddo), `osc` (oscuro).

---

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub
2. Carica tutti i file mantenendo la struttura delle cartelle
3. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
4. Aspetta ~1 minuto e la pagina sarà disponibile su `https://tuonome.github.io/nome-repo`

---

*Basato su Vileborn di Claudio Pustorino — Horrible Guild*
