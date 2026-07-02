export const validRelocationResponse = `Analisi ricevuta. La situazione e gestibile, ma solo se smettiamo di confondere "lo tengo per sicurezza" con "mi serve".

\`\`\`json
{
  "schema_version": "1.0.0",
  "snapshot_id": "snap_demo_001",
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
          }
        ]
      },
      "terrazzo": {
        "esposizione_solare": "Sconosciuta",
        "vincoli": ["Verificare peso massimo vasi", "Lasciare passaggio libero"],
        "uso_suggerito": "Area piante in vaso leggere e strumenti piccoli."
      },
      "flussi_movimento": [
        "Ingresso -> cucina non deve essere bloccato da vasi"
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
\`\`\``;
