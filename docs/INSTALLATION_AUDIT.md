# Controllo Installazioni

Data controllo: 2026-07-02

## Stato Rapido

| Strumento | Stato | Note |
| --- | --- | --- |
| Dipendenze progetto | OK | `node_modules` presente |
| Lockfile | OK | `pnpm-lock.yaml` presente |
| pnpm | OK | Versione rilevata: `11.7.0` |
| Node.js | OK in runtime Codex | Versione runtime usata per test: `v24.14.0` |
| Git | OK | Repository sincronizzato con GitHub |
| Ollama client | OK | Versione client rilevata: `0.30.10` |
| Ollama server | OK | Verifica locale eseguita con permesso |
| Modello `gemma4:latest` | OK | Installato, dimensione rilevata: 9.6 GB |
| Playwright | Non installato | Non serve ora; utile per veri test browser end-to-end |
| jsdom / Testing Library | Non installati | Non servono ora; utili per test componenti React |

## Cosa Devi Fare Ora

Nulla di obbligatorio.

Il progetto compila e i test passano con le dipendenze attuali. Non installare Playwright o jsdom finche non decidiamo di aggiungere test browser o test componenti React.

## Verifica Manuale Per Te

Nel terminale, dentro la cartella `Trasloco`, puoi controllare:

```bash
node -v
pnpm -v
git --version
ollama --version
ollama list
```

Se `node -v` non risponde, installa Node.js LTS dal sito ufficiale oppure tramite Homebrew:

```bash
brew install node
```

Se `pnpm -v` non risponde:

```bash
npm install -g pnpm
```

Verifica eseguita: `ollama list` mostra `gemma4:latest`.

Se in futuro `ollama list` dice che Ollama non e attivo, apri l'app Ollama oppure usa:

```bash
ollama serve
```

Se manca il modello locale consigliato:

```bash
ollama pull gemma4:latest
```

## Installazioni Future Non Urgenti

### Playwright

Serve quando vorremo testare la pagina come farebbe un utente reale nel browser.

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Testing Library E jsdom

Servono quando vorremo testare singoli componenti React senza aprire un browser completo.

```bash
pnpm add -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

## Metafora Semplice

Le dipendenze attuali sono gli attrezzi base gia sul tavolo: cacciavite, metro e trapano. Playwright e Testing Library sono strumenti piu specifici, come una livella laser: utili quando serve precisione in piu, ma non vanno comprati prima di sapere dove misurare.
