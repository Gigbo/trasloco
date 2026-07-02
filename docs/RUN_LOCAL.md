# Avvio Locale

Questa guida serve per aprire Relocation Manager dal tuo Mac, senza dover ricordare tutto a memoria.

Metafora semplice: l'app ha due motori.

- Frontend: la finestra che vedi nel browser.
- Backend: il banco operativo che parla con SQLite e Ollama.

`pnpm dev` accende entrambi.

## 1. Apri La Cartella Giusta

Nel terminale:

```bash
cd "/Users/danielpalmirov/Desktop/Condivisi Mac/Trasloco"
```

Se vedi errori tipo `not a git repository`, quasi sempre sei nella cartella sbagliata.

## 2. Controllo Pre-Avvio

Esegui:

```bash
pnpm check:local
```

Questo controllo verifica:

- Node.js;
- pnpm;
- dipendenze del progetto;
- file `.env`;
- Ollama;
- modello `gemma4:latest`.

Se appare un avviso, leggi la riga `Come risolvere`.

Nota: alcuni avvisi non bloccano l'app. Per esempio, se Ollama non e attivo puoi comunque usare il provider `mock`.

## 3. Prima Installazione

Se non hai ancora installato le dipendenze:

```bash
pnpm install
```

Lo fai una volta sola, o quando cambiano le dipendenze.

## 4. Configurazione LLM

Per sviluppo stabile senza modello reale:

```bash
LLM_PROVIDER=mock
```

Per usare Ollama, il file `.env` deve contenere:

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:latest
```

Se `.env` non esiste:

```bash
cp .env.example .env
```

Poi modifica `.env` con un editor.

## 5. Avvia Ollama

Apri l'app Ollama oppure esegui:

```bash
ollama serve
```

Verifica i modelli installati:

```bash
ollama list
```

Se manca `gemma4:latest`:

```bash
ollama pull gemma4:latest
```

Per avere il selettore modello attivo nella UI serve almeno un secondo modello, per esempio:

```bash
ollama pull llama3.2:latest
```

Sul Mac di sviluppo attuale sono gia presenti `gemma4:latest` e `llama3.2:latest`.

## 6. Avvia L'App

```bash
pnpm dev
```

Indirizzi tipici:

- frontend: `http://127.0.0.1:5173/`
- backend: `http://127.0.0.1:5174/`

Se una porta e occupata, Vite ne sceglie un'altra. Il terminale ti mostrera una riga tipo:

```text
Local: http://127.0.0.1:5175/
```

Apri quell'indirizzo.

## 7. Controlla Che Tutto Risponda

Nel browser puoi aprire:

```text
http://127.0.0.1:5173/api/health
```

Se Vite ha scelto `5175`, usa:

```text
http://127.0.0.1:5175/api/health
```

Risposta buona con Ollama:

```json
{
  "provider": "ollama",
  "model": "gemma4:latest",
  "llm": {
    "status": "ready"
  }
}
```

## 8. Spegnere L'App

Nel terminale dove gira `pnpm dev`, premi:

```text
Ctrl + C
```

## Problemi Comuni

### `command not found: pnpm`

Installa pnpm:

```bash
npm install -g pnpm
```

### Ollama Non Risponde

Apri l'app Ollama oppure:

```bash
ollama serve
```

### Il Modello Non Compare Nel Select

Esegui:

```bash
ollama list
```

Se il modello non c'e:

```bash
ollama pull nome-modello
```

Poi aggiorna la pagina.

### Git Dice Che Non Sei In Un Repository

Torna nella cartella progetto:

```bash
cd "/Users/danielpalmirov/Desktop/Condivisi Mac/Trasloco"
```
