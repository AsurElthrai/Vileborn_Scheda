/**
 * data.js
 * Database completo di Origini, Retaggi Oscuri e relativi doni.
 * Fonte: Vileborn (Claudio Pustorino, Horrible Guild)
 *
 * Per aggiungere un dono o modificare un effetto,
 * modifica solo questo file — il resto dell'app si aggiorna automaticamente.
 */

'use strict';

// ─────────────────────────────────────────────
//  ORIGINI
//  Ogni origine definisce:
//    sub         → approcci aumentati (testo display)
//    boost       → array dei nomi approcci da aumentare
//    personalita → suggerimenti personalità
//    addestramento → suggerimenti addestramento
//    capacita    → array di { nome, desc, negativo }
// ─────────────────────────────────────────────

const ORIGINI = {

  Borghese: {
    sub: 'Ragione + Precisione',
    boost: ['Ragione', 'Precisione'],
    personalita: ['studioso', 'riflessivo', 'concentrato', 'ambizioso', 'saccente', 'sfrontato', 'ingegnoso'],
    addestramento: ['alchimia', 'strategia', 'riparare', 'medicina', 'valutare', 'prevenire', 'artigianato'],
    capacita: [
      {
        nome: 'Spremersi le Meningi',
        desc: 'Subisci confusione per ottenere un successo di ragione senza effettuare una prova. Richiede un\'azione.',
        negativo: 'Costo: subisci confusione.'
      },
      {
        nome: 'Quid Pro Quo',
        desc: '1×/sessione, ottieni un favore da un soggetto senza prova.',
        negativo: 'Tira 1d6: dispari = sei tu in debito con lui.'
      },
      {
        nome: 'Istinto per gli Affari',
        desc: 'Hai vantaggio in ogni prova per valutare merci, oggetti o contratti.',
        negativo: null
      },
      {
        nome: 'Mente Acuta',
        desc: 'Hai +1 a tutte le reazioni di ragione.',
        negativo: null
      },
    ]
  },

  Fervente: {
    sub: 'Volontà + Ascendente',
    boost: ['Volontà', 'Ascendente'],
    personalita: ['inflessibile', 'dogmatico', 'zelante', 'compassionevole', 'intransigente', 'inquisitorio', 'riflessivo'],
    addestramento: ['predicare', 'accudire', 'scritture sacre', 'ascoltare', 'ispirare', 'proteggere', 'consolare'],
    capacita: [
      {
        nome: 'Atto di Contrizione',
        desc: 'Subisci vergogna per ottenere un successo di volontà senza tirare dadi. Richiede un\'azione.',
        negativo: 'Costo: subisci vergogna.'
      },
      {
        nome: 'Conoscenza del Dogma',
        desc: 'Hai vantaggio in ogni prova inerente a contesti religiosi.',
        negativo: null
      },
      {
        nome: 'Disciplina Inflessibile',
        desc: 'Ignori tutti gli effetti della paura. Quando la subisci, segnala come di consueto, ma ignorane gli effetti negativi.',
        negativo: null
      },
      {
        nome: 'Dedizione al Dovere',
        desc: 'Quando usi i moventi e il tuo dovere è già segnato, puoi segnare l\'aspirazione al suo posto per usarlo una seconda volta.',
        negativo: null
      },
    ]
  },

  Furfante: {
    sub: 'Precisione + Sotterfugio',
    boost: ['Precisione', 'Sotterfugio'],
    personalita: ['persuasivo', 'avido', 'leale alla banda', 'astuto', 'opportunista', 'sospettoso', 'bugiardo'],
    addestramento: ['nascondersi', 'coltelli', 'borseggiare', 'scassinare', 'spiare', 'mentire', 'cacciare'],
    capacita: [
      {
        nome: 'Sete di Libertà',
        desc: '1×/sessione, chiedi all\'Oscurità qual è la via più veloce per fuggire da una situazione o liberarsi di un vincolo. Risponde sinceramente.',
        negativo: null
      },
      {
        nome: 'Mani di Velluto',
        desc: 'Hai vantaggio in ogni prova per sottrarre oggetti o scassinare serrature.',
        negativo: null
      },
      {
        nome: 'Moralità Flessibile',
        desc: 'Quando subiresti vergogna, tira 1d6: se il risultato è pari, non la subisci.',
        negativo: null
      },
      {
        nome: 'Guardarsi le Spalle',
        desc: 'Hai +1 a tutte le reazioni di sotterfugio e precisione.',
        negativo: null
      },
    ]
  },

  Nobile: {
    sub: 'Impeto + Ascendente',
    boost: ['Impeto', 'Ascendente'],
    personalita: ['arrogante', 'autoritario', 'lungimirante', 'calcolatore', 'raffinato', 'affascinante', 'leale'],
    addestramento: ['comandare', 'etichetta', 'duellare', 'tattica', 'diplomazia', 'araldica', 'arte'],
    capacita: [
      {
        nome: 'Come Osate?!',
        desc: 'Subisci rabbia per ottenere un successo di ascendente senza tirare dadi. Richiede un\'azione.',
        negativo: 'Costo: subisci rabbia.'
      },
      {
        nome: 'Attenzione all\'Etichetta',
        desc: 'Hai vantaggio in ogni prova che coinvolga politica o buone maniere.',
        negativo: null
      },
      {
        nome: 'Retaggio Prestigioso',
        desc: 'Rendi noto il tuo nome di famiglia a un soggetto e tira 1d6.',
        negativo: 'Pari = ti rispetta; dispari = ti disprezza.'
      },
      {
        nome: 'Disciplina Militare',
        desc: 'Quando subiresti confusione, tira 1d6: se il risultato è pari, non la subisci.',
        negativo: null
      },
    ]
  },

  Nomade: {
    sub: 'Ascendente + Sotterfugio',
    boost: ['Ascendente', 'Sotterfugio'],
    personalita: ['socievole', 'curioso', 'osservatore', 'adattabile', 'spirito libero', 'pragmatico', 'empatico'],
    addestramento: ['esplorare', 'intrattenere', 'raccogliere informazioni', 'usanze locali', 'mediare', 'sopravvivenza', 'viaggiare'],
    capacita: [
      {
        nome: 'Racconti di Strada',
        desc: '1×/sessione, rivela una diceria su un luogo, soggetto o evento.',
        negativo: 'L\'Oscurità tira 1d6 in segreto: dispari = falsa; pari = vera.'
      },
      {
        nome: 'Compagno di Ventura',
        desc: 'Hai vantaggio in ogni prova per conquistare la fiducia di qualcuno.',
        negativo: null
      },
      {
        nome: 'Cuor Leggero',
        desc: 'Quando subiresti ansia, tira 1d6: se il risultato è pari, non la subisci.',
        negativo: null
      },
      {
        nome: 'Rifugio Sicuro',
        desc: '1×/sessione, chiedi all\'Oscurità se un luogo è sicuro. Risponde sinceramente "Sì", "No" o "Sì e no".',
        negativo: null
      },
    ]
  },

  Orfano: {
    sub: 'Volontà + Sotterfugio',
    boost: ['Volontà', 'Sotterfugio'],
    personalita: ['guardingo', 'pronto a tutto', 'opportunista', 'furbo', 'distaccato', 'cinico', 'coraggioso'],
    addestramento: ['rubare', 'vita di strada', 'ingannare', 'trovare rifugio', 'sgattaiolare', 'allerta', 'colpire basso'],
    capacita: [
      {
        nome: 'A Mali Estremi',
        desc: 'Subisci vergogna per ottenere un successo di sotterfugio senza tirare dadi. Richiede un\'azione.',
        negativo: 'Costo: subisci vergogna.'
      },
      {
        nome: 'Stringere i Denti',
        desc: 'Ignori tutti gli effetti dell\'esaurimento. Quando lo subisci, segnalo come di consueto, ma ignorane gli effetti negativi.',
        negativo: null
      },
      {
        nome: 'In Cerca di un Legame',
        desc: 'Puoi usare i tuoi legami 2 volte per ogni atto.',
        negativo: null
      },
      {
        nome: 'Sempre all\'Erta',
        desc: 'Puoi subire ansia per ottenere immediatamente un successo di precisione senza tirare dadi. Richiede un\'azione.',
        negativo: 'Costo: subisci ansia.'
      },
    ]
  },

  Umile: {
    sub: 'Impeto + Volontà',
    boost: ['Impeto', 'Volontà'],
    personalita: ['altruista', 'diffidente', 'prudente', 'ribelle', 'speranzoso', 'di buon cuore', 'testardo'],
    addestramento: ['sopportare', 'credenze popolari', 'evitare il pericolo', 'arrangiarsi', 'rissa', 'basso profilo', 'orientarsi'],
    capacita: [
      {
        nome: 'Fatica Ben Spesa',
        desc: 'Subisci esaurimento per ottenere un successo di volontà senza tirare dadi. Richiede un\'azione.',
        negativo: 'Costo: subisci esaurimento.'
      },
      {
        nome: 'Frutti della Terra',
        desc: 'Hai vantaggio in ogni prova per trovare risorse utili in ambienti naturali.',
        negativo: null
      },
      {
        nome: 'Ti Aiuto Io!',
        desc: 'Quando superi una reazione per evitare un effetto negativo, puoi scegliere di subirlo al posto di un Vileborn che ha fallito quella stessa reazione.',
        negativo: null
      },
      {
        nome: 'Spalle Larghe',
        desc: 'Quando subiresti esaurimento, tira 1d6: se il risultato è pari, non lo subisci.',
        negativo: null
      },
    ]
  }

};


// ─────────────────────────────────────────────
//  RETAGGI OSCURI
//  Ogni retaggio definisce:
//    sub           → approcci aumentati + tipo Oscuro (display)
//    boost         → array approcci da aumentare
//    pulsione      → testo della pulsione
//    personalita   → suggerimenti personalità
//    addestramento → suggerimenti addestramento
//    doni          → array di { n, nome, effetto, tuttavia }
// ─────────────────────────────────────────────

const RETAGGI = {

  Camminaspiriti: {
    sub: 'Volontà + Ascendente · Caduti',
    boost: ['Volontà', 'Ascendente'],
    pulsione: 'Obbedire alla volontà degli spiriti, lasciandoti dominare dalla loro sete di vendetta e dalle loro incessanti richieste.',
    personalita: ['tormentato', 'schivo', 'empatico', 'ossessionato', 'silenzioso', 'visionario', 'guardingo'],
    addestramento: ['esorcismi', 'sacre scritture', 'riti funebri', 'occultismo', 'ascoltare', 'interpretare i segni', 'aldilà'],
    doni: [
      { n: 1, nome: 'Pallidi Sussurri',   effetto: 'Entri in contatto con uno spirito e gli puoi porre una domanda a cui dovrà rispondere sinceramente.',                                           tuttavia: 'Il tuo aspetto si fa pallido e inquietante. Hai -1 nelle prove di ascendente finché questo dono rimane segnato.', persistenti: [{ tipo: 'mod', chiave: 'ascendente', val: -1 }] },
      { n: 2, nome: 'Presenza Eterea',    effetto: 'Materializzi uno spirito che ostacola un soggetto o agita piccoli oggetti in un\'area a tua scelta, fino alla fine del tuo prossimo turno.',   tuttavia: 'Ti esponi al tormento dello spirito evocato. Tira 1d6: se 1, subisci paura.' },
      { n: 3, nome: 'Passo Spettrale',    effetto: 'Diventi immateriale per un attimo. Puoi reagire a un attacco fisico senza bisogno di tirare, o attraversare un ostacolo fisico.',              tuttavia: 'Sottolinea uno dei tuoi tratti di personalità: finché questo dono rimane segnato non potrai usarlo.' },
      { n: 4, nome: 'Ultima Scintilla',   effetto: 'Rivivi con tutti e cinque i sensi gli ultimi momenti di vita di un soggetto, dal suo punto di vista.',                                         tuttavia: 'Rischi di rivivere il trauma della sua morte. Tira 1d6: se 1, subisci una ferita.' },
      { n: 5, nome: 'Possessione',        effetto: 'Richiami uno spirito e lo ospiti nel tuo corpo mortale. Aumenta di una taglia un approccio (massimo d10) per questa scena.',                  tuttavia: 'Lo spirito si nutre della tua energia. Tira 1d6: se 1, subisci esaurimento.' },
      { n: 6, nome: 'Seconda Occasione',  effetto: 'Segna questo dono per evitare di subire un effetto qualsiasi (anche una ferita) che ti farebbe andare fuori gioco.',                          tuttavia: 'La morte richiede un prezzo. Tira 1d6: se 1, un alleato scelto dall\'Oscurità subisce l\'effetto al posto tuo.' },
      { n: 7, nome: 'Visione di Morte',   effetto: 'Infliggi istantaneamente una ferita a un soggetto che puoi vedere, facendogli vivere per un attimo i tormenti dell\'aldilà.',                  tuttavia: 'Rischi di cedere alla brama di vendetta degli spiriti. Tira 1d6: se 1, subisci rabbia.' },
      { n: 8, nome: 'Cuore Fermo',        effetto: 'Finché segnato non hai bisogno di bere, mangiare o dormire. Inoltre ignori gli effetti dell\'esaurimento, ma marchi comunque la casella.',     tuttavia: 'Senti un forte distacco dalla vita. Finché segnato non puoi mettere in gioco i tuoi moventi.', persistenti: [{ tipo: 'blocca', obiettivo: 'moventi' }] },
      { n: 9, nome: 'Martirio',           effetto: 'Cura istantaneamente una ferita di un tuo alleato. Se è fuori gioco, elimini la sua ultima ferita e lo fai tornare in gioco.',                 tuttavia: 'Sacrifichi la tua energia vitale. Subisci istantaneamente una ferita.' },
    ]
  },

  Cantasangue: {
    sub: 'Impeto + Ascendente · Vampiri',
    boost: ['Impeto', 'Ascendente'],
    pulsione: 'Senti la brama di bere sangue umano, un desiderio che arde come una fiamma inestinguibile nelle tue vene.',
    personalita: ['seducente', 'impulsivo', 'feroce', 'intimidatorio', 'egocentrico', 'tormentato', 'manipolatore'],
    addestramento: ['dominare', 'fingere', 'istigare', 'prestanza fisica', 'resistere', 'attirare l\'attenzione', 'savoir faire'],
    doni: [
      { n: 1, nome: 'Battito Rivelatore',      effetto: 'Ti concentri sul battito cardiaco di un soggetto. Se ne ha uno, per questa scena sai se sta dicendo la verità.',                                tuttavia: 'Il battito che senti rischia di agitarti. Tira 1d6: se 1, subisci ansia.' },
      { n: 2, nome: 'Potenza del Sangue',      effetto: 'Diventi incredibilmente forte per un istante. Usa il tuo turno per ottenere immediatamente un successo di impeto.',                              tuttavia: 'Metti il tuo cuore e il tuo fisico sotto sforzo. Tira 1d6: se 1, subisci una ferita.' },
      { n: 3, nome: 'Furto Scarlatto',         effetto: 'Ti intrufoli nella mente di un soggetto e gli rubi un segreto. Non puoi porre domande specifiche, sarà l\'Oscurità a raccontarti cosa scopri.', tuttavia: 'I tuoi poteri non sono raffinati. Tira 1d6: se 1, il soggetto si accorgerà che hai frugato nella sua mente.' },
      { n: 4, nome: 'Traccia Cremisi',         effetto: 'Ti concentri sull\'odore del sangue di un soggetto: finché segnato puoi seguirne le tracce e conoscerne la direzione senza prove.',              tuttavia: 'Seguire la traccia ti ossessiona. Hai -1 alle prove di ragione finché questo dono rimane segnato.', persistenti: [{ tipo: 'mod', chiave: 'ragione', val: -1 }] },
      { n: 5, nome: 'Nebbia Rossa',            effetto: 'Ti trasformi in nebbia per un momento. Puoi passare tra sbarre o grate, o reagire a un singolo attacco fisico senza bisogno di tirare.',        tuttavia: 'Cambiare forma è molto stancante. Tira 1d6: se 1, subisci esaurimento.' },
      { n: 6, nome: 'Seduzione Oscura',        effetto: 'Risvegli emozioni viscerali in un soggetto. Hai +1 alle prove di ascendente contro di lui per questa scena.',                                    tuttavia: 'Il soggetto ti distrae. Hai svantaggio alle prove di precisione finché segnato, quando il soggetto è presente.', persistenti: [{ tipo: 'svantaggio', chiave: 'precisione' }] },
      { n: 7, nome: 'Scultore del Sangue',     effetto: 'Versi il tuo sangue e lo scolpisci in un\'arma della foggia che preferisci. Hai vantaggio a tutte le prove in cui la usi per questa scena.',    tuttavia: 'Ti infliggi una ferita a causa della copiosa perdita di sangue.' },
      { n: 8, nome: 'Precognizione del Sangue',effetto: 'Senti il fluire del sangue di un soggetto e ne prevedi i movimenti: hai +1 in tutte le prove fisiche contro di lui per la scena.',               tuttavia: 'Sei tentato dal suo sangue. Hai svantaggio alle prove di volontà contro il soggetto fino a fine scena.', persistenti: [{ tipo: 'svantaggio', chiave: 'volonta' }] },
      { n: 9, nome: 'Aritmia',                 effetto: 'Fai perdere un battito di cuore a un soggetto: la prossima volta che dovrà agire, non accadrà nulla. Se non ha battito, il dono non funziona.',  tuttavia: 'Devi concentrarti moltissimo per generare questo effetto. Subisci immediatamente esaurimento.' },
    ]
  },

  Celartigli: {
    sub: 'Impeto + Precisione · Ferali',
    boost: ['Impeto', 'Precisione'],
    pulsione: 'Senti la brama di cacciare esseri umani, un impulso selvaggio che ti spinge a vederli come prede.',
    personalita: ['selvaggio', 'capobranco', 'violento', 'irascibile', 'protettivo', 'indipendente', 'ribelle'],
    addestramento: ['minacciare', 'seguire tracce', 'cacciare', 'rissa', 'sfruttare il territorio', 'evitare ostacoli', 'agguati'],
    doni: [
      { n: 1, nome: 'Forma Ferina',           effetto: 'Sviluppi tratti animali. Hai +1 alle prove di impeto e sei immune agli effetti dell\'esaurimento per questa scena.',                                tuttavia: 'Rischi di farti sopraffare dal tuo istinto di caccia. Tira 1d6: se 1, subisci rabbia.' },
      { n: 2, nome: 'Senso del Pericolo',     effetto: 'Il tuo istinto ti dice se ci sono minacce nei paraggi: l\'Oscurità ti rivela un indizio sulla loro natura, e sai con sicurezza se sono Oscuri.',   tuttavia: 'Il pericolo che percepisci rischia di metterti eccessivamente all\'erta. Tira 1d6: se 1, subisci ansia.' },
      { n: 3, nome: 'Vista da Predatore',     effetto: 'Puoi vedere dettagli minuscoli anche nel buio, hai +1 alle prove di precisione per questa scena.',                                                  tuttavia: 'L\'eccesso di stimoli visivi ti confonde. Hai -1 alle prove di ragione finché questo dono rimane segnato.', persistenti: [{ tipo: 'mod', chiave: 'ragione', val: -1 }] },
      { n: 4, nome: 'Proteggere il Branco',   effetto: 'Subisci una ferita al posto di un alleato. Inoltre hai +1 alle prove di volontà per questa scena.',                                                tuttavia: 'Ti concentri solo su chi ti ha ferito. Hai -1 nelle prove di cui non è il bersaglio. L\'effetto termina se lo elimini.' },
      { n: 5, nome: 'Voce dell\'Alfa',        effetto: 'Calmi un animale, anche inferocito, e lo convinci a collaborare con te. Ti aiuterà come può, anche difendendoti.',                                  tuttavia: 'Se capita qualcosa di brutto all\'animale subisci immediatamente rabbia.' },
      { n: 6, nome: 'Guarigione Accelerata',  effetto: 'Guarisci istantaneamente una ferita sfruttando il tuo metabolismo eccezionale.',                                                                    tuttavia: 'Rischi di affamarti per la velocità del tuo metabolismo. Tira 1d6: se 1, subisci esaurimento.' },
      { n: 7, nome: 'Movimenti Eccezionali',  effetto: 'Finché segnato puoi raggiungere luoghi inaccessibili, spiccando balzi, planando, strisciando ed emulando altri movimenti tipici dei predatori.',   tuttavia: 'Assumi un aspetto più animalesco che umano. Hai svantaggio alle prove di ascendente finché segnato.', persistenti: [{ tipo: 'svantaggio', chiave: 'ascendente' }] },
      { n: 8, nome: 'Istinto Animale',        effetto: 'Superi istantaneamente una reazione di impeto, volontà o precisione senza bisogno di tirare.',                                                      tuttavia: 'Hai la forte tentazione di contrattaccare. Hai svantaggio alle prove di ragione finché segnato.', persistenti: [{ tipo: 'svantaggio', chiave: 'ragione' }] },
      { n: 9, nome: 'Pelle della Bestia',     effetto: 'La tua pelle diventa resistente come quella di un Ferale. Le armi normali non possono infliggerti ferite per questa scena.',                        tuttavia: 'Diventi vulnerabile ad argento e argentacciaio. Hai svantaggio nelle prove che lo coinvolgono per questa scena.' },
    ]
  },

  Cercaselva: {
    sub: 'Impeto + Volontà · Silvani',
    boost: ['Impeto', 'Volontà'],
    pulsione: 'Devastare simboli di civiltà o bellezza umana, riaffermando la tua lealtà alla natura selvaggia.',
    personalita: ['primitivo', 'rabbioso', 'istintivo', 'affettuoso', 'vulnerabile', 'evasivo', 'sensibile'],
    addestramento: ['erboristeria', 'difendere', 'distruggere', 'risorse naturali', 'pollice verde', 'accudire', 'trovare rifugio'],
    doni: [
      { n: 1, nome: 'Radici Profonde',     effetto: 'Ti colleghi con la natura che ti circonda. Hai vantaggio alle prove di volontà e sei immune agli effetti dell\'ansia per il resto della scena.',      tuttavia: 'Sei rallentato dalla tua connessione con la terra. Hai -1 alle prove di impeto fino alla fine della scena.', persistenti: [{ tipo: 'mod', chiave: 'impeto', val: -1 }] },
      { n: 2, nome: 'Vento Ristoratore',   effetto: 'Purifichi un\'area circoscritta, come una radura o un breve corso d\'acqua, da tossine, effetti venefici e sostanze pericolose.',                     tuttavia: 'Il tuo corpo rischia di assorbire parte della contaminazione. Tira 1d6: se 1, subisci una ferita.' },
      { n: 3, nome: 'Pelle di Corteccia',  effetto: 'Ignori le prossime 2 ferite che subiresti.',                                                                                                           tuttavia: 'Il tuo aspetto diventa inquietante. Hai svantaggio alle prove di ascendente finché segnato.', persistenti: [{ tipo: 'svantaggio', chiave: 'ascendente' }] },
      { n: 4, nome: 'Concerto della Terra',effetto: 'Fai crescere piante o rampicanti capaci di modificare la struttura di una costruzione, fortificandola o indebolendola, a tua scelta.',                tuttavia: 'Rischi di cedere all\'odio della natura per la costruzione. Tira 1d6: se 1, la renderai del tutto impraticabile. Se un Vileborn è al suo interno, subisce una ferita.' },
      { n: 5, nome: 'Crescita Rigogliosa', effetto: 'Ti concentri su un luogo e lo rendi rigoglioso, facendo crescere in pochi istanti ciò che avrebbe impiegato mesi, anche in assenza di sole.',         tuttavia: 'Rischi di perdere il controllo di questa crescita. Tira 1d6: se 1, rendi la zona talmente selvaggia da diventare inospitale per gli esseri umani.' },
      { n: 6, nome: 'Andatura Esperta',    effetto: 'Finché segnato, ti muovi senza difficoltà in terreni naturali, anche difficoltosi o impervi.',                                                         tuttavia: 'Ti isoli nell\'abbraccio della natura e rifuggi i contatti umani. Finché segnato non puoi usare i tuoi legami.', persistenti: [{ tipo: 'blocca', obiettivo: 'legami' }] },
      { n: 7, nome: 'Rancore della Terra', effetto: 'Usa il tuo turno per scatenare un attacco che sfrutta gli elementi naturali. Ottieni immediatamente un successo di impeto.',                           tuttavia: 'Il caos della natura rischia di inebriarti e farti perdere il controllo. Tira 1d6: se 1, subisci rabbia.' },
      { n: 8, nome: 'Forza delle Montagne',effetto: 'La tua forza si moltiplica, hai +1 alle prove di impeto e ignori gli effetti dell\'esaurimento per il resto della scena.',                             tuttavia: 'Rischi di farti spaventare dalla tua forza. Tira 1d6: se 1, subisci paura.' },
      { n: 9, nome: 'Eco Primordiale',     effetto: 'Ti armonizzi con un luogo naturale, ricevendo una visione e delle sensazioni che ne rivelano lo stato attuale, offrendoti un indizio su ciò che accade al suo interno.', tuttavia: 'Se qualcosa di negativo lo sta influenzando, tira 1d6: se 1, subisci una ferita o una condizione legata al suo stato, a scelta dell\'Oscurità.' },
    ]
  },

  Crearovina: {
    sub: 'Ragione + Volontà · Stregati',
    boost: ['Ragione', 'Volontà'],
    pulsione: 'Spingere le persone verso la sventura, osservandole mentre realizzano il loro destino peggiore.',
    personalita: ['insofferente', 'vendicativo', 'sinistro', 'fatalista', 'disturbato', 'ambiguo', 'impassibile'],
    addestramento: ['chiromanzia', 'interpretare', 'rituali proibiti', 'lasciarsi andare', 'manipolare', 'corrompere', 'sesto senso'],
    doni: [
      { n: 1, nome: 'Oscuro Presagio',        effetto: 'Chiedi all\'Oscurità di rivelarti qual è il pericolo più imminente per un soggetto, te lo rivelerà attraverso una breve visione.',                   tuttavia: 'La visione rischia di spaventarti. Tira 1d6: se 1, subisci paura.' },
      { n: 2, nome: 'Destino Deviato',        effetto: 'Ti immedesimi per breve tempo in una versione di te che ha vissuto un destino migliore. Per una scena, aumenti un approccio a tua scelta di una taglia (massimo d10).', tuttavia: 'Rischi di rimpiangere la fortuna che non hai avuto. Tira 1d6: se 1, subisci rabbia.' },
      { n: 3, nome: 'Cieli Avversi',          effetto: 'La tua presenza peggiora le condizioni meteorologiche in un\'area, evocando nebbia, pioggia o vento.',                                               tuttavia: 'Rischi di richiamare un fulmine. Tira 1d6: se 1, un soggetto qualsiasi in scena a scelta dell\'Oscurità subisce una ferita.' },
      { n: 4, nome: 'Deviazione Oscura',      effetto: 'Dopo averne visto il risultato, obblighi l\'Oscurità a ritirare il dado oscurità.',                                                                  tuttavia: 'Se il dado oscurità ottiene un risultato superiore al precedente, la malasorte ti colpisce e subisci una ferita in aggiunta ai normali effetti.' },
      { n: 5, nome: 'Eco della Rovina',       effetto: 'Attiri la malasorte su un soggetto, a cui accadono piccoli eventi sfortunati per questa scena. Hai vantaggio alle prove di sotterfugio contro di lui.',tuttavia: 'Il fatalismo si impossessa di te, hai -1 alle prove di volontà finché segnato.', persistenti: [{ tipo: 'mod', chiave: 'volonta', val: -1 }] },
      { n: 6, nome: 'Memoria Infusa',         effetto: 'Infondi un pensiero in un piccolo oggetto, in del cibo o in una bevanda. Il primo soggetto che vi entrerà in contatto o lo consumerà, lo percepirà così come lo hai impresso.', tuttavia: 'Rischi di perdere il ricordo di ciò che hai infuso. Tira 1d6: se 1, il ricordo passerà dalla tua mente a ciò in cui lo hai veicolato e lo dimenticherai.' },
      { n: 7, nome: 'Benedizione Nefasta',    effetto: 'Indica un soggetto e infliggiti una ferita; la subirà al posto tuo.',                                                                                tuttavia: 'L\'effetto potrebbe non trasferirsi del tutto. Tira 1d6: se 1, la subite entrambi.' },
      { n: 8, nome: 'Specchio della Sventura',effetto: 'Ridireziona una ferita, una condizione o un effetto negativo appena subito da un alleato a un altro soggetto a tua scelta.',                         tuttavia: 'Tira 1d6: se 1, non riesci a ridirezionare l\'effetto come desideri. Invece, lo subisce un soggetto a scelta dell\'Oscurità.' },
      { n: 9, nome: 'Sogno Premonitore',      effetto: 'Prima di dormire, chiedi all\'Oscurità di raccontarti un presagio su un argomento a tua scelta. Ti racconterà qualcosa di significativo nella forma di una visione onirica.', tuttavia: 'Il sogno turba il tuo sonno. Subisci esaurimento.' },
    ]
  },

  Danzaombre: {
    sub: 'Volontà + Sotterfugio · Ombre',
    boost: ['Volontà', 'Sotterfugio'],
    pulsione: 'Senti la brama di terrorizzare le persone, traumatizzandole per sempre e placando per un momento la fame delle Ombre.',
    personalita: ['insensibile', 'inquietante', 'vendicativo', 'cauto', 'crudele', 'riservato', 'attento'],
    addestramento: ['spaventare', 'passare inosservato', 'illusionismo', 'spiare', 'controllarsi', 'confondere', 'terrorizzare'],
    doni: [
      { n: 1, nome: 'Fame delle Ombre',      effetto: 'La tua ombra divora le emozioni negative. Rimuovi una condizione, tua o di un alleato, e ottieni +1 alle prove di ragione fino alla fine della scena.', tuttavia: 'Le Ombre rischiano di colmare e dilaniare il tuo corpo. Tira 1d6: se 1, piangi lacrime nere come la pece e subisci una ferita.' },
      { n: 2, nome: 'Freddo, Troppo Freddo', effetto: 'Sottrai il calore da una piccola area o raffreddi un oggetto. Se questo è a contatto con la pelle di un soggetto, dovrà lasciarlo cadere o subire una ferita.', tuttavia: 'Rischi di perdere tu stesso calore corporeo. Tira 1d6: se 1, subisci esaurimento.' },
      { n: 3, nome: 'Oscuri Segreti',        effetto: 'Ti metti in contatto con le Ombre, che ti sussurreranno quali sono le emozioni che permeano il luogo in cui ti trovi.',                                tuttavia: 'Queste emozioni ti rimangono attaccate addosso. Tira 1d6: se 1, subisci ansia.' },
      { n: 4, nome: 'Passeggero Oscuro',     effetto: 'Un passeggero riposa nella tua ombra: è completamente fatto di tenebre. Segna questo dono per farti aiutare in un\'azione, o per chiedere un piccolo semplice favore.', tuttavia: 'Finché segnato non puoi usare i tuoi legami.', persistenti: [{ tipo: 'blocca', obiettivo: 'legami' }] },
      { n: 5, nome: 'Reazione d\'Ombra',     effetto: 'La tua ombra reagisce per te. Superi istantaneamente una reazione di volontà, ragione o precisione senza bisogno di tirare.',                          tuttavia: 'Finché segnato, la tua ombra si muoverà di sua volontà, rendendo evidente la tua natura e dandoti -1 alle prove di ascendente.', persistenti: [{ tipo: 'mod', chiave: 'ascendente', val: -1 }] },
      { n: 6, nome: 'Salto d\'Ombra',        effetto: 'Ti dilegui nella tua stessa ombra ed emergi da un\'altra a portata di vista.',                                                                          tuttavia: 'Le Ombre potrebbero ghermirti. Tira 1d6: se 1, a scelta dell\'Oscurità ricompari all\'inizio del tuo turno successivo o in un punto sbagliato.' },
      { n: 7, nome: 'Tentacoli di Oscurità', effetto: 'Dai vita alle Ombre che combattono per te. Agiscono sempre con 2d8 ed eseguono i tuoi ordini per una scena. Dare ordini non consuma la tua azione.',   tuttavia: 'Potresti perderne il controllo. Tira 1d6 alla fine di ogni tuo turno in cui sono presenti. Se 1, l\'Oscurità le controllerà al posto tuo.' },
      { n: 8, nome: 'Terrori Notturni',      effetto: 'Materializzi le paure di un soggetto nella sua mente, distraendolo, spaventandolo o peggio, a scelta dell\'Oscurità.',                                  tuttavia: 'Potresti materializzare le tue stesse paure. Tira 1d6: se 1, subisci paura.' },
      { n: 9, nome: 'Manto d\'Ombra',        effetto: 'Nascondi un soggetto alla vista, rendendolo invisibile finché non attira l\'attenzione su di sé.',                                                      tuttavia: 'Le Ombre sono affamate. Tira 1d6: se 1, il soggetto subisce una ferita.' },
    ]
  },

  Tessisorte: {
    sub: 'Ascendente + Sotterfugio · Fatati',
    boost: ['Ascendente', 'Sotterfugio'],
    pulsione: 'Scommettere sul destino tuo o di coloro che ami, pur sapendo che è un azzardo che avrà conseguenze negative.',
    personalita: ['esuberante', 'spregiudicato', 'imprevedibile', 'beffardo', 'imprudente', 'giocoso', 'provocatorio'],
    addestramento: ['rischiare', 'indovinare', 'distrarre', 'mentire', 'sfruttare la situazione', 'confondere', 'scommettere'],
    doni: [
      { n: 1, nome: 'Sfarfallio del Fato',   effetto: 'Manipoli la fortuna a tuo favore. Hai vantaggio in una prova a tua scelta.',                                                                           tuttavia: 'La sorte potrebbe vendicarsi. Tira 1d6: se dispari, l\'Oscurità sceglie segretamente un tuo alleato. Alla sua prossima prova, gli imporrà svantaggio.' },
      { n: 2, nome: 'Paradosso Fatato',      effetto: 'Sovverti leggermente la fisica per un attimo. Cadi più lentamente di quanto dovresti, passi in uno spazio troppo stretto per te, sposti un oggetto troppo pesante per te.', tuttavia: 'La tua mente si ribella all\'illogicità di ciò che accade. Tira 1d6: se 1, subisci confusione.' },
      { n: 3, nome: 'Forma Ingannatrice',    effetto: 'Per questa scena prendi la forma di un piccolo animale, come un gatto, una gazza ladra o una volpe. Puoi tornare alla tua forma originale quando lo desideri.', tuttavia: 'Quando torni umano tira 1 dado: se dispari hai -1 alle prove di ragione e conservi un atteggiamento tipico di quell\'animale finché segnato.' },
      { n: 4, nome: 'Voci Ingannevoli',      effetto: 'Crei suoni fastidiosi che distraggono un soggetto. Hai +1 alle prove di precisione contro di lui per questa scena.',                                    tuttavia: 'Mantenere l\'illusione richiede energia. Subisci esaurimento alla fine della scena.' },
      { n: 5, nome: 'Patto Fatato',          effetto: 'Attiva questo dono nel momento in cui stringi un accordo. Se il soggetto infrange il patto, tu lo saprai e lui subirà istantaneamente una ferita.',    tuttavia: 'Se sarai tu a infrangere il patto, subirai le stesse conseguenze.' },
      { n: 6, nome: 'Dissolutezza Stregata', effetto: 'Hai vantaggio alle prove di sotterfugio e sei immune agli effetti della vergogna per questa scena.',                                                    tuttavia: 'La tua tempra morale ne risente. Hai -1 alle prove di volontà finché questo dono è segnato.', persistenti: [{ tipo: 'mod', chiave: 'volonta', val: -1 }] },
      { n: 7, nome: 'Specchio Arcano',       effetto: 'Assumi l\'aspetto di un soggetto che hai visto almeno una volta. L\'effetto rimane attivo per l\'intera durata della scena in corso.',                  tuttavia: 'La tua personalità potrebbe perdersi nella sua. Tira 1d6: se 1, non puoi usare i tuoi moventi finché segnato.', persistenti: [{ tipo: 'blocca', obiettivo: 'moventi' }] },
      { n: 8, nome: 'Segreti e Bugie',       effetto: 'I Fatati ti rivelano il vero nome di un soggetto e ti dicono se è sincero su chi dice di essere.',                                                     tuttavia: 'Potrebbero raggirarti. Tira 1d6: se 1, l\'Oscurità può decidere di mentirti, ma tu non potrai saperlo con sicurezza.' },
      { n: 9, nome: 'Oro degli Stolti',      effetto: 'Mascheri la foggia di un oggetto per una scena, alterandone l\'apparenza e facendolo sembrare molto più o molto meno pregiato di quanto non sia.',     tuttavia: 'I Fatati potrebbero tirarti un brutto scherzo. Tira 1d6: se 1, l\'Oscurità potrà interrompere l\'effetto dell\'illusione nel momento meno opportuno.' },
    ]
  }

};

// ─────────────────────────────────────────────
//  COSTANTI CONDIVISE
// ─────────────────────────────────────────────

/** Nomi degli approcci nell'ordine di display */
const APPROCCI_NAMES = ['Impeto', 'Volontà', 'Ascendente', 'Ragione', 'Precisione', 'Sotterfugio'];

/** Dadi disponibili in ordine crescente */
const DICE_ORDER = ['d4', 'd6', 'd8', 'd10', 'd12'];

/** Testo dei livelli del dado oscurità */
const SIGN_LABELS = [
  'Nessun segno',
  '1 segno — dado oscurità: 9+',
  '2 segni — dado oscurità: 6+',
  '3 segni — dado oscurità: 3+'
];