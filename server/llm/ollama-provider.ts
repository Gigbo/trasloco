import type { ChatRequest, ChatResponse, LlmProvider } from "./types";

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

const defaultBaseUrl = "http://127.0.0.1:11434";
const defaultModel = "llama3.1:8b";

export function createOllamaProvider(): LlmProvider {
  const baseUrl = normalizeBaseUrl(process.env.OLLAMA_BASE_URL ?? defaultBaseUrl);
  const model = process.env.OLLAMA_MODEL ?? defaultModel;

  return {
    name: "ollama",
    async chat(request: ChatRequest): Promise<ChatResponse> {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          prompt: buildRelocationPrompt(request.message),
          stream: false,
          format: "json",
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
            `Ollama ha risposto con HTTP ${response.status}. Verifica che il modello "${model}" sia installato.`
        );
      }

      if (!payload?.response) {
        throw new Error("Ollama ha risposto senza testo utilizzabile.");
      }

      return {
        provider: "ollama",
        assistantText: [
          `Provider Ollama locale: ${model}.`,
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
- Il tono deve essere operativo e severo, ma il contenuto deve restare utile.
`.trim();
}
