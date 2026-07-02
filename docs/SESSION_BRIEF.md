# Brief Di Sessione

## Ultima Sessione

Data: 2026-07-01

Obiettivo della sessione:

- persistere le decisioni utente dei moduli UI;
- separare lo snapshot generato dall'IA dalle azioni prese nella dashboard;
- aggiungere API locali per completamenti, costi, decluttering e botanica;
- verificare che refresh e riavvio non perdano lo stato operativo.

## Decisioni Prese

- Lo snapshot IA resta una fotografia del piano generato dal modello.
- Le decisioni utente sono salvate in tabelle SQLite separate.
- `App.tsx` e il punto unico di coordinamento dello stato UI persistito.
- I moduli UI sono componenti controllati: ricevono stato e callback, non salvano piu decisioni solo in memoria.
- Le note botaniche vengono salvate al blur del campo testo per evitare una chiamata API a ogni carattere.

## File Aggiornati

- `server/db.ts`
- `server/app.ts`
- `server/app.test.ts`
- `src/App.tsx`
- `src/components/MasterTimeline.tsx`
- `src/components/FinancialDashboard.tsx`
- `src/components/DeclutteringGraveyard.tsx`
- `src/components/BotanicalPlan.tsx`
- `README.md`
- `docs/TRACKER.md`
- `docs/ROADMAP.md`
- `docs/SESSION_BRIEF.md`

## Stato Attuale

- Conversazioni e snapshot validi sono persistiti in SQLite.
- `/api/state` restituisce snapshot, conversazioni recenti e stato utente.
- `/api/user-state` restituisce solo le decisioni granulari.
- Master Timeline salva completamento e riapertura task.
- Cruscotto Finanziario salva override manuali delle stime.
- Cimitero del Superfluo salva decisioni `Vendere`, `Donare`, `Buttare`.
- Planimetria Botanica salva checklist interventi e note layout.

## Controllo Qualita Sessione

Errori trovati:

- Nessun errore TypeScript o test fallito dopo l'integrazione.
- La verifica browser headless resta non completata per assenza del browser Chromium nel runtime locale.

Miglioramenti proposti:

- Spezzare `App.tsx` in hook dedicati, per esempio `useUserStatePersistence`, prima che cresca ancora.
- Aggiungere storico conversazioni nella Console Interrogatoria.
- Aggiungere test e2e quando sara disponibile un browser Playwright installato.

Verifiche eseguite:

- `pnpm test`: 14 test passanti.
- `pnpm typecheck`: completato senza errori.

## Prossima Sessione Consigliata

Obiettivo:

- migliorare la Console Interrogatoria e lo storico operativo.

Passi consigliati:

1. Mostrare le conversazioni recenti nella console laterale.
2. Separare `App.tsx` in hook o componenti piu piccoli.
3. Aggiungere filtro o selezione snapshot quando esistono piu piani.
4. Preparare l'adattatore Ollama reale mantenendo il provider mock come fallback.

## Promemoria Operativo

All'inizio della prossima sessione leggere:

1. `README.md`
2. `docs/TRACKER.md`
3. `docs/SESSION_BRIEF.md`
4. `docs/GUIDA_NON_TECNICA.md`
