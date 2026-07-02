import type { ChatRequest, ChatResponse, LlmProvider } from "./types";

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

type OllamaTagsResponse = {
  models?: Array<{
    name?: string;
    model?: string;
  }>;
};

const defaultBaseUrl = "http://127.0.0.1:11434";
const defaultModel = "llama3.1:8b";

export function createOllamaProvider(): LlmProvider {
  const baseUrl = normalizeBaseUrl(process.env.OLLAMA_BASE_URL ?? defaultBaseUrl);
  let selectedModel = process.env.OLLAMA_MODEL ?? defaultModel;

  return {
    name: "ollama",
    get model() {
      return selectedModel;
    },
    setModel(model: string) {
      selectedModel = model;
    },
    async diagnostics() {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET"
      }).catch((error: unknown) => {
        return {
          ok: false,
          status: 0,
          json: async () => ({
            error: `Ollama non raggiungibile su ${baseUrl}. Dettaglio: ${formatError(error)}`
          })
        } as Response;
      });

      const payload = (await response.json().catch(() => null)) as
        | (OllamaTagsResponse & { error?: string })
        | null;

      if (!response.ok) {
        return {
          status: "unreachable",
          baseUrl,
          installedModels: [],
          selectedModelInstalled: false,
          detail:
            payload?.error ??
            `Ollama ha risposto con HTTP ${response.status} durante la diagnostica.`
        };
      }

      const installedModels = (payload?.models ?? [])
        .map((item) => item.name ?? item.model)
        .filter((item): item is string => Boolean(item))
        .sort((left, right) => left.localeCompare(right));
      const selectedModelInstalled = installedModels.includes(selectedModel);

      return {
        status: selectedModelInstalled ? "ready" : "missing_model",
        baseUrl,
        installedModels,
        selectedModelInstalled,
        detail: selectedModelInstalled
          ? `Modello "${selectedModel}" disponibile in Ollama.`
          : `Modello configurato "${selectedModel}" non trovato in Ollama.`
      };
    },
    async chat(request: ChatRequest): Promise<ChatResponse> {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: buildRelocationPrompt(request.message),
          stream: false,
          format: relocationJsonSchema,
          options: {
            temperature: 0.2
          }
        })
      }).catch((error: unknown) => {
        throw new Error(
          `Ollama non raggiungibile su ${baseUrl}. Avvia Ollama e verifica OLLAMA_BASE_URL. Dettaglio: ${formatError(error)}`
        );
      });

      const payload = (await response.json().catch(() => null)) as
        | OllamaGenerateResponse
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ??
            `Ollama ha risposto con HTTP ${response.status}. Verifica che il modello "${selectedModel}" sia installato.`
        );
      }

      if (!payload?.response) {
        throw new Error("Ollama ha risposto senza testo utilizzabile.");
      }

      return {
        provider: "ollama",
        assistantText: [
          `Provider Ollama locale: ${selectedModel}.`,
          "Risposta JSON generata dal modello locale.",
          "```json",
          payload.response,
          "```"
        ].join("\n\n")
      };
    }
  };
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "errore sconosciuto";
}

function buildRelocationPrompt(userMessage: string) {
  return `
Sei "L'Inquisitore Logistico", assistente brutalmente onesto per organizzare traslochi.
Rispondi solo con JSON valido. Non aggiungere markdown, commenti o testo fuori dal JSON.

Obiettivo utente:
${userMessage}

Genera un piano operativo conforme esattamente a questa struttura:

{
  "schema_version": "1.0.0",
  "snapshot_id": "stringa_univoca",
  "created_at": "ISO-8601",
  "fase_trasloco": "stringa",
  "sintesi_operativa": "stringa",
  "task_logistici": [
    {
      "id": "stringa",
      "titolo": "stringa",
      "descrizione": "stringa",
      "scadenza_giorni_al_trasloco": -30,
      "priorita": "Alta",
      "categoria": "trasporto",
      "critico": true,
      "criterio_completamento": "stringa",
      "stato_suggerito": "Da fare",
      "dipendenze": []
    }
  ],
  "analisi_costi": [
    {
      "id": "stringa",
      "voce_spesa": "stringa",
      "categoria": "materiali",
      "stima_eur": 100,
      "range_min_eur": 50,
      "range_max_eur": 150,
      "certezza": "Media",
      "strategia_risparmio": "stringa",
      "rischio_sforamento": "Medio"
    }
  ],
  "verdetto_decluttering": [
    {
      "id": "stringa",
      "oggetto": "stringa",
      "categoria": "mobili",
      "domanda_socratica": "stringa",
      "azione_consigliata": "Donare",
      "motivazione": "stringa",
      "valore_stimato_eur": 0,
      "ingombro": "Alto",
      "urgenza_decisione": "Alta"
    }
  ],
  "logistica_botanica": {
    "interventi_pre_trasloco": [
      {
        "id": "stringa",
        "azione": "stringa",
        "giorni_prima": 2,
        "critico": true,
        "motivo": "stringa"
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
            "uso_suggerito": "stringa",
            "note": "stringa"
          }
        ]
      },
      "terrazzo": {
        "esposizione_solare": "Sconosciuta",
        "vincoli": ["stringa"],
        "uso_suggerito": "stringa"
      },
      "flussi_movimento": ["stringa"]
    },
    "piante_critiche": [
      {
        "id": "stringa",
        "nome": "stringa",
        "rischio": "Medio",
        "azione_preventiva": "stringa"
      }
    ],
    "note_generali": "stringa"
  },
  "domande_aperte": [
    {
      "id": "stringa",
      "domanda": "stringa",
      "motivo": "stringa",
      "priorita": "Alta"
    }
  ],
  "rischi": [
    {
      "id": "stringa",
      "tipo": "logistico",
      "descrizione": "stringa",
      "gravita": "Alta",
      "mitigazione": "stringa"
    }
  ]
}

Vincoli obbligatori:
- Usa solo valori enum validi.
- Inserisci almeno 2 task logistici, 1 voce costo, 1 oggetto decluttering, 1 intervento botanico.
- Mantieni range_min_eur <= stima_eur <= range_max_eur.
- Ogni cella del giardino deve includere sempre x, y, uso_suggerito e note.
- Il tono deve essere operativo e severo, ma il contenuto deve restare utile.
`.trim();
}

const relocationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version",
    "snapshot_id",
    "created_at",
    "fase_trasloco",
    "sintesi_operativa",
    "task_logistici",
    "analisi_costi",
    "verdetto_decluttering",
    "logistica_botanica",
    "domande_aperte",
    "rischi"
  ],
  properties: {
    schema_version: { const: "1.0.0" },
    snapshot_id: { type: "string" },
    created_at: { type: "string" },
    fase_trasloco: { type: "string" },
    sintesi_operativa: { type: "string" },
    task_logistici: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "titolo",
          "descrizione",
          "scadenza_giorni_al_trasloco",
          "priorita",
          "categoria",
          "critico",
          "criterio_completamento",
          "stato_suggerito",
          "dipendenze"
        ],
        properties: {
          id: { type: "string" },
          titolo: { type: "string" },
          descrizione: { type: "string" },
          scadenza_giorni_al_trasloco: { type: "number" },
          priorita: { enum: ["Alta", "Media", "Bassa"] },
          categoria: {
            enum: [
              "documenti",
              "imballaggio",
              "utenze",
              "trasporto",
              "casa",
              "finanze",
              "altro"
            ]
          },
          critico: { type: "boolean" },
          criterio_completamento: { type: "string" },
          stato_suggerito: { enum: ["Da fare", "In corso", "Bloccato", "Completato"] },
          dipendenze: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    },
    analisi_costi: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "voce_spesa",
          "categoria",
          "stima_eur",
          "range_min_eur",
          "range_max_eur",
          "certezza",
          "strategia_risparmio",
          "rischio_sforamento"
        ],
        properties: {
          id: { type: "string" },
          voce_spesa: { type: "string" },
          categoria: {
            enum: [
              "trasporto",
              "materiali",
              "manodopera",
              "deposito",
              "utenze",
              "verde",
              "imprevisti",
              "altro"
            ]
          },
          stima_eur: { type: "number", minimum: 0 },
          range_min_eur: { type: "number", minimum: 0 },
          range_max_eur: { type: "number", minimum: 0 },
          certezza: { enum: ["Alta", "Media", "Bassa"] },
          strategia_risparmio: { type: "string" },
          rischio_sforamento: { enum: ["Alto", "Medio", "Basso"] }
        }
      }
    },
    verdetto_decluttering: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "oggetto",
          "categoria",
          "domanda_socratica",
          "azione_consigliata",
          "motivazione",
          "valore_stimato_eur",
          "ingombro",
          "urgenza_decisione"
        ],
        properties: {
          id: { type: "string" },
          oggetto: { type: "string" },
          categoria: {
            enum: [
              "mobili",
              "vestiti",
              "libri",
              "cucina",
              "elettronica",
              "ricordi",
              "piante",
              "altro"
            ]
          },
          domanda_socratica: { type: "string" },
          azione_consigliata: { enum: ["Vendere", "Donare", "Buttare"] },
          motivazione: { type: "string" },
          valore_stimato_eur: { type: "number", minimum: 0 },
          ingombro: { enum: ["Alto", "Medio", "Basso"] },
          urgenza_decisione: { enum: ["Alta", "Media", "Bassa"] }
        }
      }
    },
    logistica_botanica: {
      type: "object",
      additionalProperties: false,
      required: [
        "interventi_pre_trasloco",
        "layout_nuovo_spazio",
        "piante_critiche",
        "note_generali"
      ],
      properties: {
        interventi_pre_trasloco: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "azione", "giorni_prima", "critico", "motivo"],
            properties: {
              id: { type: "string" },
              azione: { type: "string" },
              giorni_prima: { type: "number" },
              critico: { type: "boolean" },
              motivo: { type: "string" }
            }
          }
        },
        layout_nuovo_spazio: {
          type: "object",
          additionalProperties: false,
          required: ["giardino_4x2", "terrazzo", "flussi_movimento"],
          properties: {
            giardino_4x2: {
              type: "object",
              additionalProperties: false,
              required: ["larghezza_m", "profondita_m", "esposizione_solare", "celle"],
              properties: {
                larghezza_m: { const: 4 },
                profondita_m: { const: 2 },
                esposizione_solare: {
                  enum: ["Nord", "Sud", "Est", "Ovest", "Mista", "Sconosciuta"]
                },
                celle: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["x", "y", "uso_suggerito", "note"],
                    properties: {
                      x: { type: "integer", minimum: 0 },
                      y: { type: "integer", minimum: 0 },
                      uso_suggerito: { type: "string" },
                      note: { type: "string" }
                    }
                  }
                }
              }
            },
            terrazzo: {
              type: "object",
              additionalProperties: false,
              required: ["esposizione_solare", "vincoli", "uso_suggerito"],
              properties: {
                esposizione_solare: {
                  enum: ["Nord", "Sud", "Est", "Ovest", "Mista", "Sconosciuta"]
                },
                vincoli: {
                  type: "array",
                  items: { type: "string" }
                },
                uso_suggerito: { type: "string" }
              }
            },
            flussi_movimento: {
              type: "array",
              items: { type: "string" }
            }
          }
        },
        piante_critiche: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "nome", "rischio", "azione_preventiva"],
            properties: {
              id: { type: "string" },
              nome: { type: "string" },
              rischio: { enum: ["Alto", "Medio", "Basso"] },
              azione_preventiva: { type: "string" }
            }
          }
        },
        note_generali: { type: "string" }
      }
    },
    domande_aperte: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "domanda", "motivo", "priorita"],
        properties: {
          id: { type: "string" },
          domanda: { type: "string" },
          motivo: { type: "string" },
          priorita: { enum: ["Alta", "Media", "Bassa"] }
        }
      }
    },
    rischi: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "tipo", "descrizione", "gravita", "mitigazione"],
        properties: {
          id: { type: "string" },
          tipo: { enum: ["logistico", "economico", "tempo", "spazio", "botanico", "altro"] },
          descrizione: { type: "string" },
          gravita: { enum: ["Alta", "Media", "Bassa"] },
          mitigazione: { type: "string" }
        }
      }
    }
  }
} as const;
