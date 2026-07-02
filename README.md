# Relocation Manager

Dashboard locale per gestire un trasloco con supporto LLM. L'app traduce conversazioni discorsive con "L'Inquisitore Logistico" in task, costi, decisioni di decluttering e pianificazione botanica.

## Obiettivo

Costruire una web app locale, veloce e reattiva che:

- riceve output testuali e JSON da un LLM;
- valida e normalizza il JSON operativo;
- mostra una dashboard brutalista, ad alto contrasto e orientata ai dati;
- trasforma caos logistico in azioni tracciabili;
- riduce costi, oggetti inutili e rischi organizzativi.

## Stack Confermato

- Frontend: Vite, React, TypeScript
- Styling: TailwindCSS
- Validazione schema: Zod
- Backend locale: Node.js, Fastify
- Database locale: SQLite con better-sqlite3
- LLM: adattatore server-side intercambiabile con modalita mock, Ollama locale o API cloud
- Test: Vitest, React Testing Library, Playwright

## Team Operativo

### Product Owner / Relocation Strategist

Responsabile della direzione funzionale. Decide cosa conta davvero: timeline, costi, decluttering, botanica e prevenzione errori.

Competenze richieste:

- conoscenza pratica del processo di trasloco;
- capacità di distinguere bisogni reali da funzionalità decorative;
- definizione delle priorità di rilascio;
- validazione dei flussi utente.

### Full-Stack Developer

Responsabile di frontend, backend locale, persistenza e integrazione LLM.

Competenze richieste:

- React e TypeScript;
- API server-side con Fastify o Express;
- SQLite e modellazione dati locale;
- validazione runtime con Zod;
- gestione errori e stati degradati.

### UI/UX Architect

Responsabile dell'interfaccia brutalista funzionale.

Competenze richieste:

- dashboard dense ma leggibili;
- accessibilità su contrasto, focus state e tastiera;
- componenti dati: timeline, tabelle, checklist, pannelli;
- progettazione di conferme per azioni critiche;
- design non decorativo, orientato all'operatività.

### LLM Integration Engineer

Responsabile del contratto tra IA e applicazione.

Competenze richieste:

- prompt engineering strutturato;
- output JSON vincolato;
- parsing robusto di blocchi markdown e testo misto;
- gestione di JSON malformato;
- versionamento degli schema dati.

### QA / Reliability Engineer

Responsabile della qualità dei flussi principali.

Competenze richieste:

- test unitari su parser e schema;
- test componenti su moduli critici;
- test end-to-end su flusso chat -> JSON -> dashboard;
- verifica regressioni UI;
- test di casi limite su output LLM incompleto o errato.

### Technical Guide / Code Translator

Responsabile di spiegare il progetto a persone non tecniche o alle prime armi con il codice.

Competenze richieste:

- tradurre concetti tecnici in linguaggio semplice;
- usare metafore pratiche senza perdere precisione;
- scrivere istruzioni passo per passo;
- distinguere tra "cosa devi fare" e "perche serve";
- preparare checklist operative per chi non programma.

## Skill Permanenti Del Progetto

Queste skill devono restare sempre visibili nel README e guidare ogni decisione tecnica.

### 1. Parsing Difensivo Degli Output LLM

L'app non deve fidarsi mai dell'output dell'IA. Ogni risposta deve passare da:

- estrazione del blocco JSON;
- `JSON.parse`;
- validazione schema;
- normalizzazione;
- gestione esplicita dell'errore.

### 2. Contratti Dati Versionati

Ogni snapshot operativo deve indicare una versione schema. Modificare la struttura dei dati senza migrazione o compatibilità rompe la dashboard.

### 3. UI Operativa, Non Lifestyle

Ogni schermata deve aiutare l'utente a decidere, tagliare, ordinare o completare. Niente elementi decorativi che non migliorano la leggibilità o il controllo.

### 4. Prevenzione Degli Auto-Inganni

Le azioni critiche richiedono conferma esplicita. Il sistema deve impedire completamenti superficiali, specialmente su fragili, budget, documenti, utenze e oggetti non valutati.

### 5. Persistenza Locale Prima Di Tutto

La dashboard deve sopravvivere a refresh e crash. Conversazioni, snapshot JSON, task completati e decisioni di decluttering devono essere salvati localmente.

### 6. Test Sul Contratto IA -> UI

Il parser e gli schema sono parte critica del prodotto. Ogni modifica a `fase_trasloco`, `task_logistici`, `analisi_costi`, `verdetto_decluttering` o `logistica_botanica` richiede test.

### 7. Accessibilità Da Dashboard

Contrasto alto, navigazione da tastiera, stati focus visibili e testo leggibile sono requisiti, non rifiniture.

### 8. Spiegazione Per Non Tecnici

Ogni passaggio importante deve poter essere spiegato anche a chi non sa programmare. Se un concetto e complesso, va accompagnato da una spiegazione semplice e da una metafora concreta.

### 9. Controllo Qualita A Ogni Sessione

All'inizio o durante ogni sessione va controllato se esistono errori, incoerenze, rischi tecnici o modifiche migliorative. Le proposte devono essere pragmatiche: meno complessita, piu affidabilita, migliore manutenzione.

### 10. Brief Di Fine Sessione

Ogni sessione deve chiudersi con un brief scritto in `docs/SESSION_BRIEF.md`, cosi la sessione successiva riparte senza perdere contesto.

### 11. Provider LLM Intercambiabile

L'app non deve dipendere da un solo modello. Il backend deve usare un adattatore LLM sostituibile: prima mock locale per sviluppo, poi Ollama locale, poi eventuale API cloud se serve piu affidabilita.

## Moduli Applicativi

- Console Interrogatoria: chat minimalista con tono socratico, storico conversazioni, piani validati e output IA ricaricabile.
- Master Timeline: task ordinati per `scadenza_giorni_al_trasloco` e priorita.
- Cruscotto Finanziario: tabella costi, totale dinamico, strategie risparmio.
- Cimitero del Superfluo: decisioni obbligatorie su vendere, donare, buttare.
- Planimetria Botanica: checklist piante, giardino 4x2m, terrazzo, esposizione solare e flussi.

## Documenti Di Progetto

- [Roadmap](docs/ROADMAP.md)
- [Tracker Avanzamento](docs/TRACKER.md)
- [Guida Per Non Tecnici](docs/GUIDA_NON_TECNICA.md)
- [Schema LLM V1](docs/SCHEMA_LLM_V1.md)
- [Brief Di Sessione](docs/SESSION_BRIEF.md)

## Avvio Locale

Prerequisiti:

- Node.js installato;
- pnpm installato.

Comandi:

```bash
pnpm install
pnpm dev
```

Indirizzi locali:

- app frontend: `http://127.0.0.1:5173/`
- API backend: `http://127.0.0.1:5174/`
- health check tramite proxy: `http://127.0.0.1:5173/api/health`
- stato persistito: `http://127.0.0.1:5173/api/state`

Controlli tecnici:

```bash
pnpm test
pnpm build
```

Spiegazione semplice:

- `pnpm install` prepara gli strumenti del progetto;
- `pnpm dev` accende frontend e backend in locale;
- `pnpm test` controlla che parser e schema respingano output LLM sbagliati;
- `pnpm build` verifica che l'app possa essere impacchettata.

## API Locali

- `GET /api/health`: verifica che il backend sia attivo.
- `POST /api/chat`: riceve `{ "message": "..." }` e restituisce una risposta mock con JSON LLM valido.
- `GET /api/state`: restituisce ultimo snapshot valido, snapshot recenti, conversazioni recenti e stato utente salvato in SQLite.
- `GET /api/snapshots`: restituisce lo storico dei piani validati.
- `GET /api/user-state`: restituisce solo le decisioni utente granulari.
- `PUT /api/tasks/:taskId`: salva completamento o riapertura di un task.
- `PUT /api/decluttering/:itemId`: salva `Vendere`, `Donare` o `Buttare`.
- `PUT /api/costs/:costId`: salva una stima costo modificata.
- `PUT /api/botanical/interventions/:interventionId`: salva lo stato di una checklist botanica.
- `PUT /api/botanical/notes`: salva le note libere sul layout giardino/terrazzo.

Il provider attuale e `mock`: non chiama Ollama e non usa API cloud. Serve a sviluppare e testare la dashboard senza dipendere da un modello reale.

## Provider LLM

Provider disponibili:

- `mock`: usa una fixture locale stabile, consigliato per sviluppo e test.
- `ollama`: chiama un modello locale tramite Ollama.

Configurazione mock:

```bash
LLM_PROVIDER=mock
```

Configurazione Ollama:

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

Prima di usare `ollama`, il servizio Ollama deve essere attivo e il modello deve essere disponibile localmente. Esempio:

```bash
ollama pull llama3.1:8b
ollama serve
```

Se Ollama non risponde, il backend restituisce un errore esplicito. Per tornare allo sviluppo stabile basta rimettere `LLM_PROVIDER=mock`.

## Persistenza Locale

Il database SQLite viene creato in `data/relocation.sqlite`.

Salviamo:

- conversazioni inviate a `/api/chat`;
- risposte del provider LLM;
- snapshot JSON validi dopo parsing e validazione schema;
- completamento e riapertura task;
- decisioni definitive di decluttering;
- override manuali delle stime costo;
- checklist botaniche e note layout.

Regola importante: il payload IA e le decisioni utente sono separati. Una nuova risposta del modello puo aggiornare il piano operativo, ma non deve cancellare automaticamente le decisioni gia prese nella dashboard.

## Protocollo Di Ogni Sessione

1. Leggere README, tracker e ultimo brief.
2. Controllare errori, incoerenze o opportunita di semplificazione.
3. Aggiornare tracker e documenti quando cambiano decisioni o stato.
4. Lavorare solo su obiettivi chiari e verificabili.
5. Chiudere con un brief per la sessione successiva.
