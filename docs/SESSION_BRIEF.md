# Brief Di Sessione

## Ultima Sessione

Data: 2026-07-02

Obiettivo della sessione:

- rendere l'avvio locale ancora piu semplice;
- aggiungere un comando unico che controlla il Mac e poi avvia l'app;
- mantenere disponibili i comandi separati per sviluppo tecnico.

## Decisioni Prese

- Aggiunto `pnpm start:local` come comando consigliato per uso quotidiano.
- `start:local` esegue il check pre-volo in modalita JSON.
- Se mancano requisiti obbligatori, l'avvio si ferma.
- Se ci sono solo avvisi, l'app parte comunque.
- `pnpm dev` resta il comando diretto per sviluppo tecnico.

## File Aggiornati

- `scripts/check-local.mjs`
- `scripts/start-local.mjs`
- `package.json`
- `docs/RUN_LOCAL.md`
- `README.md`
- `docs/ROADMAP.md`
- `docs/TRACKER.md`
- `docs/SESSION_BRIEF.md`

## Stato Attuale

- `pnpm check:local` controlla ambiente e Ollama.
- `pnpm start:local` esegue check e poi avvia backend/frontend.
- Lo script mostra istruzioni chiare: aprire l'URL indicato da Vite e spegnere con `Ctrl + C`.
- Comando testato: parte correttamente e mostra `http://127.0.0.1:5175/` quando le porte standard sono occupate.
- Il dev server di prova e stato spento a fine sessione.

## Controllo Qualita Sessione

Errori o lacune trovate:

- La guida aveva `pnpm check:local` e `pnpm dev`, ma mancava un comando unico.
- `check:local` non aveva una modalita macchina per essere riusato da altri script.

Correzioni applicate:

- Aggiunto `scripts/start-local.mjs`.
- Aggiunta modalita `--json` a `scripts/check-local.mjs`.
- Aggiornati README e guida `docs/RUN_LOCAL.md`.
- Aggiornati roadmap e tracker.

Verifiche eseguite:

- `pnpm start:local`: avvio riuscito, poi spento con `Ctrl + C`.
- `pnpm check:local`: completato senza errori con permesso locale.
- `pnpm test`: 27 test passanti.
- `pnpm typecheck`: completato senza errori.
- `pnpm build`: completato senza errori.
- `git diff --check`: completato senza errori.

## Prossima Sessione Consigliata

Obiettivo:

- verificare manualmente il cambio modello tra `gemma4:latest` e `llama3.2:latest` dalla UI, oppure passare a packaging/test browser.

Passi consigliati:

1. Avviare con `pnpm start:local`.
2. Aprire l'URL mostrato da Vite.
3. Cambiare modello nella Console Interrogatoria.
4. Inviare una richiesta breve e verificare che la risposta indichi il modello scelto.

## Promemoria Operativo

All'inizio della prossima sessione leggere:

1. `README.md`
2. `docs/RUN_LOCAL.md`
3. `docs/TRACKER.md`
4. `docs/SESSION_BRIEF.md`
