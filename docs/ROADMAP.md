# Roadmap Dettagliata

## Fase 0 - Fondazioni Di Progetto

Obiettivo: definire struttura, contratti e percorso di sviluppo.

Deliverable:

- README con team, stack e skill permanenti.
- Roadmap sviluppo.
- Tracker avanzamento.
- Guida per persone non tecniche.
- Brief di sessione aggiornabile.
- Schema dati iniziale per output LLM in `docs/SCHEMA_LLM_V1.md`.
- Decisione definitiva su stack locale.

Criteri di completamento:

- il progetto ha documentazione iniziale leggibile;
- i moduli principali sono identificati;
- esiste un tracker aggiornabile.
- esiste un brief per mantenere continuita tra sessioni.

## Fase 1 - Scaffolding Tecnico

Obiettivo: creare app locale funzionante con frontend, backend e database.

Task:

- inizializzare Vite + React + TypeScript;
- configurare TailwindCSS;
- configurare server Fastify;
- aggiungere SQLite locale;
- predisporre `.env.example`;
- creare script `dev`, `build`, `test`;
- impostare lint e formattazione;
- creare struttura `src/`, `server/`, `data/`.

Deliverable:

- app avviabile in locale;
- backend raggiungibile da frontend;
- database inizializzato;
- pagina iniziale con layout dashboard vuoto.

Criteri di completamento:

- `pnpm dev` avvia frontend e backend;
- la UI mostra shell principale;
- il backend espone almeno `/api/health`.

Stato attuale:

- frontend Vite/React inizializzato;
- TailwindCSS configurato;
- backend Fastify creato con `/api/health` e `/api/chat`;
- SQLite creato per conversazioni e snapshot.

## Fase 2 - Contratto LLM E Parser

Obiettivo: rendere robusto il passaggio IA -> JSON -> UI.

Task:

- definire schema Zod `RelocationSchema`;
- implementare estrazione JSON da testo e blocchi markdown;
- gestire JSON assente, malformato o incompleto;
- normalizzare task e costi;
- ordinare `task_logistici` per `scadenza_giorni_al_trasloco`;
- creare fixture di risposte LLM valide e invalide;
- scrivere test unitari del parser.

Deliverable:

- parser isolato in `src/lib/parse-ai-json.ts`;
- schema dati in `src/lib/relocation-schema.ts`;
- pannello errore parsing;
- test parser.

Criteri di completamento:

- nessun output LLM malformato rompe la UI;
- gli errori sono leggibili e mostrano causa probabile;
- le fixture coprono casi validi e rotti.

Stato attuale:

- `RelocationSchema` implementato con Zod;
- parser JSON implementato;
- fixture valide e invalide presenti;
- test parser presenti e passanti.

## Fase 3 - Console Interrogatoria

Obiettivo: implementare la chat operativa con tono terminale.

Task:

- creare layout console;
- gestire invio messaggi;
- mostrare stato loading;
- separare messaggi utente e IA;
- evidenziare domande socratiche;
- collegare `/api/chat`;
- salvare conversazioni in SQLite.

Deliverable:

- chat minimale funzionante;
- storico conversazione persistente;
- risposta IA con testo e payload operativo.

Criteri di completamento:

- l'utente invia un messaggio e riceve risposta;
- il payload viene passato al parser;
- gli errori API sono visibili senza bloccare la pagina.

Stato attuale:

- invio messaggi mock funzionante;
- risposta IA mock con JSON operativo;
- storico conversazioni persistente visibile nella console;
- selezione conversazione precedente con ricaricamento dell'output IA grezzo.

## Fase 4 - Master Timeline

Obiettivo: trasformare i task logistici in piano operativo.

Task:

- creare componente timeline/checklist;
- ordinare task per scadenza;
- indicare priorita Alta, Media, Bassa;
- gestire completamento task;
- aggiungere conferma per task critici;
- salvare stato completamento;
- aggiungere filtri per priorita e stato.

Deliverable:

- timeline usabile;
- conferma critica funzionante;
- stato persistente.

Criteri di completamento:

- i task critici non si completano senza conferma;
- la timeline resta ordinata;
- refresh non perde completamenti.

Stato attuale:

- timeline UI creata;
- priorita e criticita visibili;
- conferma per task critici presente;
- completamenti persistiti in SQLite.

## Fase 5 - Cruscotto Finanziario

Obiettivo: dare controllo chiaro su costi e risparmi.

Task:

- creare tabella costi;
- calcolare totale dinamico;
- evidenziare budget alto o sforato;
- mostrare strategie risparmio;
- consentire override manuale stima;
- salvare modifiche locali.

Deliverable:

- tabella costi leggibile;
- totale aggiornato;
- evidenza visiva su rischi economici.

Criteri di completamento:

- il totale cambia quando cambiano le stime;
- ogni voce mostra strategia risparmio;
- dati persistenti.

Stato attuale:

- tabella costi creata;
- totale dinamico e override persistiti localmente presenti;
- modifiche salvate in SQLite tramite API locale.

## Fase 6 - Cimitero Del Superfluo

Obiettivo: obbligare decisioni definitive sugli oggetti.

Task:

- creare coda oggetti;
- mostrare domanda socratica;
- implementare azioni Vendere, Donare, Buttare;
- impedire uscita dalla coda senza decisione;
- salvare decisione;
- mostrare riepilogo decisioni.

Deliverable:

- interfaccia decisionale rapida;
- storico oggetti decisi;
- coda oggetti residui.

Criteri di completamento:

- ogni oggetto resta in coda finche non riceve un'azione;
- le decisioni sono persistenti;
- azione "Buttare" ha evidenza visiva irreversibile.

Stato attuale:

- coda decluttering creata;
- azioni Vendere, Donare, Buttare presenti;
- decisioni persistite in SQLite.

## Fase 7 - Planimetria Botanica

Obiettivo: gestire piante, giardino 4x2m e terrazzo.

Task:

- creare checklist interventi pre-trasloco;
- aggiungere griglia base 4x2m;
- aggiungere area terrazzo;
- annotare esposizione solare;
- annotare flussi movimento;
- salvare layout e note.

Deliverable:

- checklist botanica;
- mappa testuale o griglia visuale;
- note esposizione e passaggi.

Criteri di completamento:

- interventi botanici tracciabili;
- layout modificabile;
- dati persistenti.

Stato attuale:

- checklist botanica creata;
- griglia 4x2m e terrazzo presenti;
- checklist e note layout persistite in SQLite.

## Fase 8 - Persistenza Snapshot E Recupero Stato

Obiettivo: rendere l'app affidabile nel tempo.

Task:

- salvare snapshot JSON validi;
- mantenere storico snapshot;
- permettere ripristino snapshot precedente;
- salvare stato utente separato dal payload IA;
- gestire migrazioni schema.

Deliverable:

- storico piani operativi;
- ripristino stato;
- database versionato.

Stato attuale:

- conversazioni salvate in SQLite;
- snapshot JSON validi salvati in SQLite;
- `/api/state` restituisce ultimo snapshot, snapshot recenti, conversazioni recenti e stato utente;
- `/api/snapshots` restituisce lo storico dei piani validati;
- decisioni utente granulari persistite: task, decluttering, costi, checklist botanica e note layout;
- ripristino automatico al refresh per ultimo snapshot e decisioni utente;
- storico snapshot navigabile dalla Console Interrogatoria.

Criteri di completamento:

- refresh e riavvio non perdono dati;
- uno snapshot vecchio resta leggibile;
- stato IA e decisioni utente non si sovrascrivono accidentalmente.

## Fase 9 - Test, Hardening E Packaging Locale

Obiettivo: rendere il progetto usabile senza fragilita evidenti.

Task:

- test unitari parser e schema;
- test componenti principali;
- test e2e chat -> dashboard;
- verifica responsive desktop/tablet;
- controllo accessibilita base;
- gestione errori API;
- documentare setup locale.

Deliverable:

- suite test minima;
- README aggiornato con setup;
- build locale verificata.

Criteri di completamento:

- `pnpm test` passa;
- `pnpm build` passa;
- flusso principale validato end-to-end.

## Ordine Di Rilascio Consigliato

1. Parser e schema. DONE
2. Shell dashboard. DONE
3. Console interrogatoria mockata. DONE
4. Timeline. DONE
5. Budget. DONE
6. Decluttering. DONE
7. Botanica. DONE
8. Persistenza completa locale. DONE
9. Storico conversazioni e snapshot. DONE
10. Adattatore LLM con provider mock e Ollama. DONE
11. Diagnostica provider e fallback UI. DONE
12. Refactor `App.tsx` in hook dedicati. DONE
13. Test e2e chat -> dashboard.
14. Verifica accessibilita base.
15. Eventuale API cloud.
16. Test e packaging.
