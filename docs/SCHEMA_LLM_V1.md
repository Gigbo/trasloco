# Schema LLM V1

Questo documento definisce il contratto JSON tra l'LLM e Relocation Manager.

Il testo dell'IA puo essere discorsivo. Il JSON no: deve seguire questa struttura.

## Regola Base

Ogni risposta utile dell'LLM deve contenere un blocco JSON valido dentro un blocco markdown:

````md
```json
{
  "schema_version": "1.0.0"
}
```
````

Metafora semplice: il testo dell'IA e la telefonata, il JSON e il modulo compilato. La dashboard legge solo il modulo.

## Oggetto Radice

Campi obbligatori:

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `schema_version` | string | Si | Versione dello schema. Per questa versione: `1.0.0` |
| `snapshot_id` | string | Si | ID univoco dello snapshot generato dall'IA |
| `created_at` | string | Si | Data ISO 8601 della generazione |
| `fase_trasloco` | string | Si | Fase operativa attuale del trasloco |
| `sintesi_operativa` | string | Si | Riassunto breve e diretto del piano |
| `task_logistici` | array | Si | Lista dei task ordinabili in timeline |
| `analisi_costi` | array | Si | Lista delle voci di costo |
| `verdetto_decluttering` | array | Si | Lista degli oggetti da decidere |
| `logistica_botanica` | object | Si | Piano per piante, giardino 4x2m e terrazzo |
| `domande_aperte` | array | Si | Domande che l'IA deve ancora chiarire |
| `rischi` | array | Si | Rischi logistici, economici o organizzativi |

Regole:

- gli array possono essere vuoti, ma devono esistere;
- i campi obbligatori non devono mai essere omessi;
- i numeri devono essere numeri veri, non stringhe;
- le enum devono usare esattamente i valori documentati;
- nessun commento dentro il JSON.

## `task_logistici`

Ogni task logistico diventa una riga nella Master Timeline.

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile del task, es. `task_fragili_001` |
| `titolo` | string | Si | Nome breve del task |
| `descrizione` | string | Si | Descrizione operativa |
| `scadenza_giorni_al_trasloco` | number | Si | Giorni rispetto al trasloco. Esempio: `-30`, `-7`, `0`, `3` |
| `priorita` | string | Si | `Alta`, `Media`, `Bassa` |
| `categoria` | string | Si | `documenti`, `imballaggio`, `utenze`, `trasporto`, `casa`, `finanze`, `altro` |
| `critico` | boolean | Si | `true` se serve conferma prima del completamento |
| `criterio_completamento` | string | Si | Come si verifica che il task e davvero finito |
| `stato_suggerito` | string | Si | `Da fare`, `In corso`, `Bloccato`, `Completato` |
| `dipendenze` | array | Si | Lista di ID task da completare prima |

Regola ordinamento:

- la UI ordina per `scadenza_giorni_al_trasloco` crescente;
- se due task hanno stessa scadenza, la UI ordina per priorita: `Alta`, poi `Media`, poi `Bassa`.

Metafora semplice: ogni task e un cartellino da mettere su una lavagna. La scadenza dice dove metterlo, la priorita dice quanto e urgente.

## `analisi_costi`

Ogni voce diventa una riga del Cruscotto Finanziario.

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile della voce costo |
| `voce_spesa` | string | Si | Nome della spesa |
| `categoria` | string | Si | `trasporto`, `materiali`, `manodopera`, `deposito`, `utenze`, `verde`, `imprevisti`, `altro` |
| `stima_eur` | number | Si | Stima in euro |
| `range_min_eur` | number | Si | Stima minima |
| `range_max_eur` | number | Si | Stima massima |
| `certezza` | string | Si | `Alta`, `Media`, `Bassa` |
| `strategia_risparmio` | string | Si | Suggerimento pratico per ridurre la spesa |
| `rischio_sforamento` | string | Si | `Alto`, `Medio`, `Basso` |

Regole:

- `stima_eur` deve essere compresa tra `range_min_eur` e `range_max_eur`;
- tutti gli importi sono in euro;
- la UI somma `stima_eur` per il totale.

## `verdetto_decluttering`

Ogni elemento diventa una decisione obbligatoria nel Cimitero del Superfluo.

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile dell'oggetto |
| `oggetto` | string | Si | Nome dell'oggetto |
| `categoria` | string | Si | `mobili`, `vestiti`, `libri`, `cucina`, `elettronica`, `ricordi`, `piante`, `altro` |
| `domanda_socratica` | string | Si | Domanda dura ma utile per decidere |
| `azione_consigliata` | string | Si | `Vendere`, `Donare`, `Buttare` |
| `motivazione` | string | Si | Perche l'IA consiglia questa azione |
| `valore_stimato_eur` | number | Si | Valore economico stimato. Anche `0` e valido |
| `ingombro` | string | Si | `Alto`, `Medio`, `Basso` |
| `urgenza_decisione` | string | Si | `Alta`, `Media`, `Bassa` |

Regole:

- l'utente puo scegliere solo `Vendere`, `Donare`, `Buttare`;
- finche non sceglie, l'oggetto resta in coda;
- l'azione consigliata dall'IA non e automaticamente definitiva.

## `logistica_botanica`

Questo oggetto alimenta la Planimetria Botanica.

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `interventi_pre_trasloco` | array | Si | Checklist rigida prima del trasloco |
| `layout_nuovo_spazio` | object | Si | Mappa base di giardino 4x2m e terrazzo |
| `piante_critiche` | array | Si | Piante con rischio alto durante il trasloco |
| `note_generali` | string | Si | Note operative sintetiche |

### `interventi_pre_trasloco`

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile dell'intervento |
| `azione` | string | Si | Azione da fare |
| `giorni_prima` | number | Si | Giorni prima del trasloco |
| `critico` | boolean | Si | Se `true`, richiede attenzione alta |
| `motivo` | string | Si | Perche serve |

### `layout_nuovo_spazio`

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `giardino_4x2` | object | Si | Griglia del giardino |
| `terrazzo` | object | Si | Informazioni base sul terrazzo |
| `flussi_movimento` | array | Si | Percorsi da non bloccare |

### `giardino_4x2`

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `larghezza_m` | number | Si | Deve essere `4` |
| `profondita_m` | number | Si | Deve essere `2` |
| `esposizione_solare` | string | Si | `Nord`, `Sud`, `Est`, `Ovest`, `Mista`, `Sconosciuta` |
| `celle` | array | Si | Celle della griglia |

Ogni cella:

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `x` | number | Si | Coordinata orizzontale |
| `y` | number | Si | Coordinata verticale |
| `uso_suggerito` | string | Si | Uso previsto della cella |
| `note` | string | Si | Note o vincoli |

### `terrazzo`

| Campo | Tipo | Obbligatorio | Descrizione |
| --- | --- | --- | --- |
| `esposizione_solare` | string | Si | `Nord`, `Sud`, `Est`, `Ovest`, `Mista`, `Sconosciuta` |
| `vincoli` | array | Si | Vincoli fisici o pratici |
| `uso_suggerito` | string | Si | Uso consigliato |

### `piante_critiche`

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile della pianta |
| `nome` | string | Si | Nome comune della pianta |
| `rischio` | string | Si | `Alto`, `Medio`, `Basso` |
| `azione_preventiva` | string | Si | Azione da fare per ridurre il rischio |

## `domande_aperte`

Domande che l'IA deve porre per migliorare il piano.

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile della domanda |
| `domanda` | string | Si | Domanda da mostrare nella console |
| `motivo` | string | Si | Perche serve la risposta |
| `priorita` | string | Si | `Alta`, `Media`, `Bassa` |

## `rischi`

Rischi da mostrare o usare per generare task.

| Campo | Tipo | Obbligatorio | Valori ammessi / Descrizione |
| --- | --- | --- | --- |
| `id` | string | Si | ID stabile del rischio |
| `tipo` | string | Si | `logistico`, `economico`, `tempo`, `spazio`, `botanico`, `altro` |
| `descrizione` | string | Si | Descrizione del rischio |
| `gravita` | string | Si | `Alta`, `Media`, `Bassa` |
| `mitigazione` | string | Si | Azione consigliata per ridurre il rischio |

## Esempio JSON Valido

```json
{
  "schema_version": "1.0.0",
  "snapshot_id": "snap_2026_07_01_001",
  "created_at": "2026-07-01T10:30:00+02:00",
  "fase_trasloco": "Pianificazione iniziale",
  "sintesi_operativa": "Serve bloccare data, budget e volume reale degli oggetti prima di comprare scatole a caso.",
  "task_logistici": [
    {
      "id": "task_fragili_001",
      "titolo": "Censire e imballare i fragili",
      "descrizione": "Elencare piatti, bicchieri, lampade e oggetti fragili prima di scegliere materiali di imballaggio.",
      "scadenza_giorni_al_trasloco": -21,
      "priorita": "Alta",
      "categoria": "imballaggio",
      "critico": true,
      "criterio_completamento": "Ogni fragile ha pluriball, riempimento vuoti e scatola etichettata.",
      "stato_suggerito": "Da fare",
      "dipendenze": []
    },
    {
      "id": "task_utenze_001",
      "titolo": "Verificare volture utenze",
      "descrizione": "Controllare luce, gas, internet e acqua nella casa di arrivo.",
      "scadenza_giorni_al_trasloco": -14,
      "priorita": "Alta",
      "categoria": "utenze",
      "critico": true,
      "criterio_completamento": "Tutte le utenze hanno data di attivazione o subentro confermata.",
      "stato_suggerito": "Da fare",
      "dipendenze": []
    }
  ],
  "analisi_costi": [
    {
      "id": "cost_scatole_001",
      "voce_spesa": "Scatole e materiali imballaggio",
      "categoria": "materiali",
      "stima_eur": 90,
      "range_min_eur": 60,
      "range_max_eur": 130,
      "certezza": "Media",
      "strategia_risparmio": "Recuperare scatole pulite da supermercati e comprare solo nastro e pluriball per fragili.",
      "rischio_sforamento": "Medio"
    },
    {
      "id": "cost_furgone_001",
      "voce_spesa": "Noleggio furgone",
      "categoria": "trasporto",
      "stima_eur": 180,
      "range_min_eur": 120,
      "range_max_eur": 260,
      "certezza": "Bassa",
      "strategia_risparmio": "Ridurre il volume prima del preventivo, altrimenti paghi per trasportare indecisione.",
      "rischio_sforamento": "Alto"
    }
  ],
  "verdetto_decluttering": [
    {
      "id": "decl_divano_001",
      "oggetto": "Divano vecchio",
      "categoria": "mobili",
      "domanda_socratica": "Lo stai portando perche serve davvero o perche non vuoi ammettere che e solo peso imbottito?",
      "azione_consigliata": "Donare",
      "motivazione": "Ingombro alto e valore economico basso.",
      "valore_stimato_eur": 40,
      "ingombro": "Alto",
      "urgenza_decisione": "Alta"
    }
  ],
  "logistica_botanica": {
    "interventi_pre_trasloco": [
      {
        "id": "bot_stop_acqua_001",
        "azione": "Sospendere irrigazione abbondante",
        "giorni_prima": 2,
        "critico": true,
        "motivo": "Vasi troppo bagnati pesano di piu e sporcano durante il trasporto."
      }
    ],
    "layout_nuovo_spazio": {
      "giardino_4x2": {
        "larghezza_m": 4,
        "profondita_m": 2,
        "esposizione_solare": "Mista",
        "celle": [
          {
            "x": 0,
            "y": 0,
            "uso_suggerito": "Piante resistenti al sole",
            "note": "Non bloccare il passaggio laterale."
          },
          {
            "x": 1,
            "y": 0,
            "uso_suggerito": "Aromatiche",
            "note": "Zona accessibile per manutenzione frequente."
          }
        ]
      },
      "terrazzo": {
        "esposizione_solare": "Sconosciuta",
        "vincoli": ["Verificare peso massimo vasi", "Lasciare passaggio libero"],
        "uso_suggerito": "Area piante in vaso leggere e strumenti piccoli."
      },
      "flussi_movimento": [
        "Ingresso -> cucina non deve essere bloccato da vasi",
        "Terrazzo -> punto acqua deve restare accessibile"
      ]
    },
    "piante_critiche": [
      {
        "id": "plant_limone_001",
        "nome": "Limone in vaso",
        "rischio": "Medio",
        "azione_preventiva": "Legare i rami e proteggere il vaso con cartone."
      }
    ],
    "note_generali": "Prima si decide dove passano le persone, poi dove stanno le piante. Non il contrario."
  },
  "domande_aperte": [
    {
      "id": "q_data_001",
      "domanda": "Qual e la data precisa del trasloco?",
      "motivo": "Senza data i giorni di scadenza sono una stima debole.",
      "priorita": "Alta"
    }
  ],
  "rischi": [
    {
      "id": "risk_volume_001",
      "tipo": "logistico",
      "descrizione": "Il volume reale degli oggetti non e ancora misurato.",
      "gravita": "Alta",
      "mitigazione": "Fare censimento stanza per stanza prima di chiedere preventivi."
    }
  ]
}
```

## Esempi Di JSON Non Valido

### Numero Scritto Come Testo

```json
{
  "stima_eur": "90"
}
```

Errore: `stima_eur` deve essere un numero, non una stringa.

### Enum Non Ammessa

```json
{
  "priorita": "Urgentissima"
}
```

Errore: `priorita` accetta solo `Alta`, `Media`, `Bassa`.

### Campo Obbligatorio Mancante

```json
{
  "fase_trasloco": "Pianificazione iniziale"
}
```

Errore: mancano `schema_version`, `task_logistici`, `analisi_costi`, `verdetto_decluttering`, `logistica_botanica` e altri campi obbligatori.

## Regole Per Il Prompt LLM

Il prompt di sistema del backend dovra imporre queste regole:

1. Rispondi con testo breve e poi con un solo blocco ```json.
2. Il JSON deve rispettare `schema_version: "1.0.0"`.
3. Non inserire commenti nel JSON.
4. Non usare valori fuori enum.
5. Se non conosci un dato, usa un valore esplicito come `Sconosciuta`, `Bassa`, array vuoto o una domanda in `domande_aperte`.
6. Non inventare date precise se l'utente non le ha fornite.
7. Mantieni ID stabili, leggibili e prefissati per area: `task_`, `cost_`, `decl_`, `bot_`, `plant_`, `q_`, `risk_`.

## Mappatura UI

| Campo JSON | Modulo UI |
| --- | --- |
| `fase_trasloco` | Header dashboard |
| `sintesi_operativa` | Pannello riepilogo operativo |
| `task_logistici` | Master Timeline |
| `analisi_costi` | Cruscotto Finanziario |
| `verdetto_decluttering` | Cimitero del Superfluo |
| `logistica_botanica` | Planimetria Botanica |
| `domande_aperte` | Console Interrogatoria |
| `rischi` | Pannello allarmi e priorita |

## Decisioni Di Design

- Lo schema e rigido per proteggere la UI dagli errori dell'LLM.
- Gli ID sono obbligatori per salvare stato utente e decisioni senza duplicati.
- Gli array obbligatori possono essere vuoti per evitare controlli speciali nel frontend.
- `schema_version` permette migrazioni future.
- `created_at` e `snapshot_id` permettono storico e ripristino.
