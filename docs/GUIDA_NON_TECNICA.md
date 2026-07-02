# Guida Per Non Tecnici

Questa guida serve a seguire lo sviluppo del Relocation Manager anche senza sapere programmare.

## Idea Base

L'app e come una centrale operativa per il trasloco.

La chat con l'IA e la conversazione. La dashboard e il tavolo di lavoro. Il JSON e il modulo compilato che passa dalla conversazione al tavolo.

Metafora:

- la persona parla con l'assistente;
- l'assistente compila una scheda strutturata;
- l'app legge la scheda;
- la dashboard crea liste, costi, decisioni e mappe.

## Cosa Stiamo Costruendo

Non stiamo creando un semplice blocco note. Stiamo creando un sistema che:

1. ascolta una richiesta sul trasloco;
2. fa rispondere un'IA con testo e dati ordinati;
3. controlla che i dati siano corretti;
4. trasforma quei dati in schermate operative;
5. salva le decisioni in locale.

## Spiegazione Semplice Dello Stack

### Vite

Vite e il motore di avvio del frontend.

Metafora: e il quadro elettrico del cantiere. Accende velocemente l'app mentre la sviluppiamo.

### React

React costruisce l'interfaccia a pezzi riutilizzabili.

Metafora: come mobili modulari. Hai un pezzo per la chat, uno per i costi, uno per la timeline, uno per il decluttering.

### TypeScript

TypeScript controlla che i dati abbiano la forma giusta mentre scriviamo codice.

Metafora: e un ispettore che dice "questa vite non entra in questo buco" prima che il mobile crolli.

### TailwindCSS

TailwindCSS serve a dare stile alla pagina senza scrivere grandi file CSS.

Metafora: e una scatola di etichette gia pronte: scuro, bordo, testo grande, spaziatura, rosso allarme.

### Zod

Zod controlla se il JSON dell'IA e fatto bene.

Metafora: e il doganiere del progetto. Se il pacco non ha i documenti giusti, non entra nella dashboard.

### Fastify

Fastify e il piccolo server locale che parla con l'IA e con il database.

Metafora: e il centralino. Il frontend chiede, il server chiama l'IA, riceve la risposta e la rimanda indietro.

### SQLite

SQLite e il database locale.

Metafora: e un archivio in un singolo cassetto. Non serve un ufficio esterno: sta dentro il progetto.

## Come Funziona Il Flusso

1. L'utente scrive nella Console Interrogatoria.
2. Il backend manda il messaggio all'LLM.
3. L'LLM risponde con testo e JSON.
4. Il parser cerca il JSON nella risposta.
5. Zod controlla se il JSON e valido.
6. Se e valido, la dashboard si aggiorna.
7. Se e sbagliato, la dashboard mostra un errore e non si rompe.
8. I dati buoni vengono salvati in SQLite.

## Cosa Significa JSON

JSON e un modo ordinato per scrivere dati.

Esempio semplice:

```json
{
  "oggetto": "divano vecchio",
  "azione": "Donare"
}
```

Metafora: e un modulo con campi fissi. Se manca un campo importante, l'app deve accorgersene.

## Regola D'Oro Del Progetto

L'IA puo parlare in modo creativo, ma i dati devono essere rigidi.

Il testo puo variare. Il JSON no.

## Come Leggere Il Tracker

Nel tracker ogni attivita ha:

- un ID, per ritrovarla;
- uno stato, per sapere dove siamo;
- una priorita, per capire cosa viene prima;
- un owner, cioe chi e responsabile;
- un criterio di completamento, cioe come sappiamo che e finita.

Stati:

- `TODO`: ancora da fare;
- `DOING`: in lavorazione;
- `BLOCKED`: bloccato;
- `DONE`: completato.

## Come Leggere La Roadmap

La roadmap e il percorso completo. Non e una lista casuale.

Prima costruiamo fondamenta e parser. Poi la dashboard. Poi il database e l'IA reale. Alla fine testiamo e rendiamo tutto stabile.

## Domande Da Fare Quando Qualcosa Non E Chiaro

- Questo serve davvero al trasloco?
- Dove viene salvato questo dato?
- Cosa succede se l'IA sbaglia?
- L'utente capisce cosa deve fare?
- Il sistema impedisce errori gravi?
- Questa funzione complica o semplifica?

## Mini Glossario

Frontend: la parte visibile dell'app.

Backend: la parte nascosta che parla con IA e database.

Database: archivio dei dati.

Parser: pezzo di codice che legge e interpreta il JSON.

Schema: regole sulla forma dei dati.

API: porta di comunicazione tra due parti del sistema.

Snapshot: fotografia salvata di un piano generato dall'IA.

Migrazione: modifica controllata della struttura del database o dei dati.

