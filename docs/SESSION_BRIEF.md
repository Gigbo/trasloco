# Brief Di Sessione

## Ultima Sessione

Data: 2026-07-02

Obiettivo della sessione:

- preparare un avvio locale semplice fuori da Codex;
- aggiungere una checklist automatica per strumenti e Ollama;
- documentare cosa fare quando porte, Node, pnpm o modelli non sono pronti.

## Decisioni Prese

- Aggiunto `pnpm check:local` come controllo pre-avvio.
- Il check distingue problemi bloccanti da avvisi.
- `.env` e Ollama possono generare avvisi senza bloccare: il provider `mock` resta utilizzabile.
- La guida pratica vive in `docs/RUN_LOCAL.md`.

## File Aggiornati

- `scripts/check-local.mjs`
- `package.json`
- `docs/RUN_LOCAL.md`
- `docs/INSTALLATION_AUDIT.md`
- `README.md`
- `docs/ROADMAP.md`
- `docs/TRACKER.md`
- `docs/SESSION_BRIEF.md`

## Stato Attuale

- `pnpm check:local` controlla:
  - Node.js;
  - pnpm;
  - `node_modules`;
  - `.env`;
  - Ollama CLI;
  - modelli Ollama;
  - `gemma4:latest`.
- Nel sandbox Codex il check puo mostrare avvisi su Ollama.
- Con permesso locale, il check vede correttamente Ollama.
- Modelli rilevati sul Mac:
  - `gemma4:latest`;
  - `llama3.2:latest`.
- La guida `docs/RUN_LOCAL.md` spiega come avviare, verificare e spegnere l'app.

## Controllo Qualita Sessione

Errori o lacune trovate:

- Non c'era una guida rapida per avviare l'app senza Codex.
- Non c'era un comando unico per capire se il Mac era pronto.
- La prima versione del check trattava gli avvisi Ollama come errore bloccante.

Correzioni applicate:

- Aggiunto script `scripts/check-local.mjs`.
- Aggiunto script npm `check:local`.
- Aggiunto `docs/RUN_LOCAL.md`.
- Aggiornato audit installazioni con `llama3.2:latest`.
- Il check ora fallisce solo su problemi obbligatori, come `pnpm` o `node_modules` mancanti.

Verifiche eseguite:

- `pnpm check:local`: completato con avvisi nel sandbox.
- `pnpm check:local` con permesso locale: completato senza errori.
- `pnpm test`: 27 test passanti.
- `pnpm typecheck`: completato senza errori.
- `pnpm build`: completato senza errori.
- `git diff --check`: completato senza errori.

## Prossima Sessione Consigliata

Obiettivo:

- preparare packaging/avvio ancora piu semplice.

Passi consigliati:

1. Valutare uno script `start:local` con controlli e avvio guidato.
2. Valutare se aggiungere Playwright solo se vogliamo test browser reale.
3. Verificare manualmente il cambio modello tra `gemma4:latest` e `llama3.2:latest` dalla UI.

## Promemoria Operativo

All'inizio della prossima sessione leggere:

1. `README.md`
2. `docs/RUN_LOCAL.md`
3. `docs/TRACKER.md`
4. `docs/SESSION_BRIEF.md`
