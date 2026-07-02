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
| Test parser | DONE | QA / Reliability Engineer | 14 test totali passano, inclusi parser, backend e persistenza |

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
| S3-002 | Creare Console Interrogatoria | DOING | Alta | Full-Stack Developer | Invio messaggi mock funzionante; storico chat da costruire |
| S3-003 | Creare Master Timeline | DONE | Alta | Full-Stack Developer | Task ordinati, priorita visibile e conferma critici |
| S3-004 | Creare Cruscotto Finanziario | DONE | Alta | Full-Stack Developer | Totale costi calcolato con override persistiti |
| S3-005 | Creare Cimitero del Superfluo | DONE | Alta | Full-Stack Developer | Decisioni persistite obbligatorie in coda |
| S3-006 | Creare Planimetria Botanica | DONE | Media | UI/UX Architect | Checklist e griglia base presenti |

## Sprint 4 - Persistenza E Integrazione LLM

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S4-001 | Salvare conversazioni | DONE | Alta | Full-Stack Developer | Storico persistente in SQLite |
| S4-002 | Salvare snapshot JSON validi | DONE | Alta | Full-Stack Developer | Snapshot recuperabili da `/api/state` |
| S4-003 | Integrare API LLM server-side | DOING | Alta | LLM Integration Engineer | Provider mock server-side attivo; Ollama/API cloud da aggiungere |
| S4-004 | Ripristinare ultimo stato al refresh | DONE | Alta | Full-Stack Developer | Ultimo snapshot e stati utente granulari caricati da SQLite |
| S4-005 | Gestire fallback su errore LLM | TODO | Media | QA / Reliability Engineer | UI degradata ma usabile |

## Sprint 5 - Hardening

| ID | Task | Stato | Priorita | Owner | Criterio di completamento |
| --- | --- | --- | --- | --- | --- |
| S5-001 | Test e2e chat -> dashboard | TODO | Alta | QA / Reliability Engineer | Flusso principale coperto |
| S5-002 | Test completamento task critici | TODO | Alta | QA / Reliability Engineer | Conferma obbligatoria verificata |
| S5-003 | Verifica accessibilita base | TODO | Media | UI/UX Architect | Focus, contrasto e tastiera ok |
| S5-004 | Build produzione locale | DONE | Alta | Full-Stack Developer | `pnpm build` passa |
| S5-005 | Documentare setup e comandi | DONE | Media | Full-Stack Developer | README aggiornato |

## Rischi Aperti

| Rischio | Impatto | Mitigazione | Stato |
| --- | --- | --- | --- |
| Output LLM non conforme | Alto | Zod, fixture, ParseErrorPanel | TODO |
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
