# Tracker Avanzamento

Legenda stato:

- `TODO`: da iniziare
- `DOING`: in corso
- `BLOCKED`: bloccato
- `DONE`: completato

## Stato Generale

| Area | Stato | Owner | Note |
| --- | --- | --- | --- |
| Documentazione progetto | DONE | Full-Stack Developer | README, roadmap e tracker creati |
| Stack tecnico | DONE | Full-Stack Developer | Confermato Vite + React + Fastify + SQLite |
| Strategia LLM | DONE | LLM Integration Engineer | Adattatore intercambiabile: mock, Ollama locale, API cloud |
| Guida non tecnica | DONE | Technical Guide / Code Translator | Guida per dilettanti e non programmatori creata |
| Protocollo sessione | DONE | Full-Stack Developer | Controllo qualita e brief finale definiti |
| Schema LLM | DONE | LLM Integration Engineer | Schema v1 documentato in `docs/SCHEMA_LLM_V1.md` |
| Frontend shell | DONE | UI/UX Architect | Dashboard operativa con moduli principali creata |
| Backend locale | DONE | Full-Stack Developer | Fastify con `/api/health` e `/api/chat` mock |
| Persistenza SQLite | DONE | Full-Stack Developer | Conversazioni, snapshot e decisioni utente granulari salvati |
| Test parser | DONE | QA / Reliability Engineer | 25 test totali passano, inclusi parser, backend, env loader, provider Ollama, fallback provider, diagnostica Ollama ed e2e dati dashboard |

## Sprint 0 - Setup E Direzione

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S0-001 | Creare README di progetto | DONE | Alta | Full-Stack Developer | README presente con missione, team e skill |
| S0-002 | Creare roadmap dettagliata | DONE | Alta | Full-Stack Developer | Roadmap presente in `docs/ROADMAP.md` |
| S0-003 | Creare tracker avanzamento | DONE | Alta | Full-Stack Developer | Tracker presente in `docs/TRACKER.md` |
| S0-004 | Confermare stack definitivo | DONE | Alta | Product Owner | Decisione scritta nel README |
| S0-005 | Definire schema JSON v1 | DONE | Alta | LLM Integration Engineer | Schema documentato e pronto per implementazione Zod |
| S0-006 | Aggiungere guida per non tecnici | DONE | Alta | Technical Guide / Code Translator | `docs/GUIDA_NON_TECNICA.md` presente |
| S0-007 | Definire brief di fine sessione | DONE | Alta | Full-Stack Developer | `docs/SESSION_BRIEF.md` presente |
| S0-008 | Controllare errori e miglioramenti a ogni sessione | DONE | Alta | QA / Reliability Engineer | Regola inserita nel README |
| S0-009 | Definire strategia LLM intercambiabile | DONE | Alta | LLM Integration Engineer | Mock prima, Ollama poi, API cloud opzionale |

## Sprint 1 - Fondazioni Tecniche

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S1-001 | Inizializzare Vite React TypeScript | DONE | Alta | Full-Stack Developer | App avviabile in locale |
| S1-002 | Configurare TailwindCSS | DONE | Alta | UI/UX Architect | Stili globali caricati |
| S1-003 | Creare server Fastify | DONE | Alta | Full-Stack Developer | `/api/health` risponde |
| S1-004 | Configurare SQLite | DONE | Alta | Full-Stack Developer | Database creato in `data/` |
| S1-005 | Aggiungere `.env.example` | DONE | Media | Full-Stack Developer | Variabili LLM documentate |

## Sprint 2 - Parser E Contratto IA

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S2-001 | Creare `RelocationSchema` con Zod | DONE | Alta | LLM Integration Engineer | Schema copre tutti i moduli |
| S2-002 | Implementare estrazione blocco JSON | DONE | Alta | Full-Stack Developer | Supporta markdown e testo misto |
| S2-003 | Gestire JSON malformato | DONE | Alta | Full-Stack Developer | Errore restituito senza rompere la UI |
| S2-004 | Aggiungere fixture LLM | DONE | Media | QA / Reliability Engineer | Casi validi e invalidi presenti |
| S2-005 | Scrivere test parser | DONE | Alta | QA / Reliability Engineer | 7 test passano |

## Sprint 3 - UI Operativa

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S3-001 | Creare shell dashboard | DONE | Alta | UI/UX Architect | Dashboard operativa pronta |
| S3-002 | Creare Console Interrogatoria | DONE | Alta | Full-Stack Developer | Invio mock e storico conversazioni selezionabile funzionanti |
| S3-003 | Creare Master Timeline | DONE | Alta | Full-Stack Developer | Task ordinati, priorita visibile e conferma critici |
| S3-004 | Creare Cruscotto Finanziario | DONE | Alta | Full-Stack Developer | Totale costi calcolato con override persistiti |
| S3-005 | Creare Cimitero del Superfluo | DONE | Alta | Full-Stack Developer | Decisioni persistite obbligatorie in coda |
| S3-006 | Creare Planimetria Botanica | DONE | Media | UI/UX Architect | Checklist e griglia base presenti |

## Sprint 4 - Persistenza E Integrazione LLM

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S4-001 | Salvare conversazioni | DONE | Alta | Full-Stack Developer | Storico persistente in SQLite |
| S4-002 | Salvare snapshot JSON validi | DONE | Alta | Full-Stack Developer | Snapshot recuperabili da `/api/state` e `/api/snapshots` |
| S4-003 | Integrare API LLM server-side | DONE | Alta | LLM Integration Engineer | Provider mock e Ollama server-side attivi; API cloud opzionale futura |
| S4-004 | Ripristinare ultimo stato al refresh | DONE | Alta | Full-Stack Developer | Ultimo snapshot e stati utente granulari caricati da SQLite |
| S4-005 | Gestire fallback su errore LLM | DONE | Media | QA / Reliability Engineer | Backend restituisce 502 leggibile e UI mantiene dashboard usabile |

## Sprint 5 - Hardening

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S5-001 | Test e2e chat -> dashboard | DONE | Alta | QA / Reliability Engineer | Flusso chat mock -> snapshot -> dati dashboard coperto |
| S5-002 | Test completamento task critici | TODO | Alta | QA / Reliability Engineer | Conferma obbligatoria verificata |
| S5-003 | Verifica accessibilita base | DONE | Media | UI/UX Architect | Focus visibile, label e stati ARIA base aggiunti |
| S5-004 | Build produzione locale | DONE | Alta | Full-Stack Developer | `pnpm build` passa |
| S5-005 | Documentare setup e comandi | DONE | Media | Full-Stack Developer | README aggiornato |
| S5-006 | Estrarre hook da `App.tsx` | DONE | Media | Full-Stack Developer | Provider status e persistenza UI separati in hook dedicati |
| S5-007 | Controllare installazioni mancanti | DONE | Media | Full-Stack Developer | Audit scritto in `docs/INSTALLATION_AUDIT.md` |
| S5-008 | Mostrare diagnostica Ollama in UI | DONE | Media | LLM Integration Engineer | Console mostra stato modello, endpoint e modelli installati |

## Rischi Aperti

| Rischio | Impatto | Mitigazione | Stato |
| --- | --- | --- | --- |
| Output LLM non conforme | Alto | Zod, fixture, ParseErrorPanel | DONE |
| Scope creep UI | Medio | Roadmap modulare e brutalismo funzionale | TODO |
| Perdita dati locali | Alto | SQLite, snapshot versionati e stato utente separato | DONE |
| API key esposta | Alto | Solo backend locale legge `.env` | TODO |
| Task critici completati superficialmente | Medio | Conferme esplicite e tono inquisitorio | TODO |
| Perdita contesto tra sessioni | Medio | Aggiornare sempre `docs/SESSION_BRIEF.md` | DONE |

## Decision Log

| Data | Decisione | Motivo | Owner |
| --- | --- | --- | --- |
| 2026-07-01 | Creare documentazione iniziale prima del codice | Serve coordinamento prima dello scaffolding | Full-Stack Developer |
| 2026-07-01 | Confermare stack Vite + React + TypeScript + TailwindCSS + Zod + Fastify + SQLite | Stack locale rapido, robusto e adatto a dashboard LLM | Product Owner |
| 2026-07-01 | Aggiungere Technical Guide / Code Translator al team | Il progetto deve essere comprensibile anche a non programmatori | Product Owner |
| 2026-07-01 | Chiudere ogni sessione con brief aggiornato | Serve continuita tra sessioni e meno perdita di contesto | Full-Stack Developer |
| 2026-07-01 | Usare un adattatore LLM intercambiabile | Permette mock, Ollama locale e API cloud senza riscrivere l'app | LLM Integration Engineer |
| 2026-07-01 | Definire Schema LLM V1 | Stabilizza il contratto tra IA, parser, dashboard e database | LLM Integration Engineer |
| 2026-07-01 | Implementare parser e schema prima dei moduli UI completi | Riduce il rischio di costruire dashboard su dati instabili | Full-Stack Developer |
| 2026-07-01 | Creare backend Fastify con provider mock prima di Ollama | Permette sviluppo stabile senza dipendere da modelli locali o cloud | Full-Stack Developer |
| 2026-07-01 | Salvare conversazioni e snapshot validi in SQLite prima delle UI finali | Evita perdita dati e abilita ripristino al refresh | Full-Stack Developer |
| 2026-07-01 | Costruire prima moduli UI con stato locale, poi persistere decisioni utente | Permette validare esperienza e flussi prima di fissare schema decisioni | UI/UX Architect |
| 2026-07-01 | Separare snapshot IA e decisioni utente in SQLite | Una nuova risposta LLM non deve cancellare completamenti, costi corretti o decisioni gia prese | Full-Stack Developer |
| 2026-07-02 | Rendere lo storico conversazioni visibile nella Console Interrogatoria | L'utente deve poter recuperare risposte precedenti senza aprire SQLite o leggere JSON grezzo nel database | Full-Stack Developer |
| 2026-07-02 | Rendere selezionabile lo storico snapshot validato | I piani operativi validi devono essere recuperabili separatamente dal testo grezzo delle conversazioni | Full-Stack Developer |
| 2026-07-02 | Implementare provider Ollama locale | Permette usare un modello installato sul Mac mantenendo il provider mock come modalita stabile | LLM Integration Engineer |
| 2026-07-02 | Usare `gemma4:latest` come modello Ollama consigliato | Test reale riuscito con `snapshotSaved=true` e contenuto piu coerente con l'Inquisitore Logistico | LLM Integration Engineer |
| 2026-07-02 | Mostrare provider e modello nella Console Interrogatoria | L'utente deve capire subito se sta usando mock o Ollama/Gemma senza leggere `.env` | Full-Stack Developer |
| 2026-07-02 | Restituire 502 esplicito quando il provider LLM fallisce | Un errore Ollama deve essere leggibile e non sembrare un crash generico del backend | QA / Reliability Engineer |
| 2026-07-02 | Estrarre `useProviderStatus` e `usePersistedRelocationState` | `App.tsx` deve restare leggibile: compone la dashboard, gli hook gestiscono sensori e salvataggi | Full-Stack Developer |
| 2026-07-02 | Centralizzare le proiezioni dashboard | Timeline, budget e decluttering condividono funzioni pure testabili invece di duplicare logica nei componenti | QA / Reliability Engineer |
| 2026-07-02 | Correggere ordinamento Master Timeline | I task devono essere ordinati per `scadenza_giorni_al_trasloco`, non mostrati nell'ordine grezzo dell'LLM | Full-Stack Developer |
| 2026-07-02 | Non installare Playwright o jsdom finche non servono davvero | Il progetto e stabile con Vitest; tooling browser e component test si aggiungono quando c'e un caso concreto | QA / Reliability Engineer |
| 2026-07-02 | Aggiungere focus visibile globale e label ai controlli | Tastiera e screen reader devono poter usare i controlli principali senza ambiguita | UI/UX Architect |
| 2026-07-02 | Aggiungere diagnostica Ollama a `/api/health` | La UI deve distinguere backend attivo, Ollama raggiungibile e modello configurato davvero installato | LLM Integration Engineer |
