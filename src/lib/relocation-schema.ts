import { z } from "zod";

export const schemaVersion = "1.0.0" as const;

const prioritySchema = z.enum(["Alta", "Media", "Bassa"]);
const severitySchema = z.enum(["Alta", "Media", "Bassa"]);
const riskLevelSchema = z.enum(["Alto", "Medio", "Basso"]);
const sunExposureSchema = z.enum([
  "Nord",
  "Sud",
  "Est",
  "Ovest",
  "Mista",
  "Sconosciuta"
]);

export const TaskLogisticoSchema = z.object({
  id: z.string().min(1),
  titolo: z.string().min(1),
  descrizione: z.string().min(1),
  scadenza_giorni_al_trasloco: z.number(),
  priorita: prioritySchema,
  categoria: z.enum([
    "documenti",
    "imballaggio",
    "utenze",
    "trasporto",
    "casa",
    "finanze",
    "altro"
  ]),
  critico: z.boolean(),
  criterio_completamento: z.string().min(1),
  stato_suggerito: z.enum(["Da fare", "In corso", "Bloccato", "Completato"]),
  dipendenze: z.array(z.string().min(1))
});

export const VoceCostoSchema = z
  .object({
    id: z.string().min(1),
    voce_spesa: z.string().min(1),
    categoria: z.enum([
      "trasporto",
      "materiali",
      "manodopera",
      "deposito",
      "utenze",
      "verde",
      "imprevisti",
      "altro"
    ]),
    stima_eur: z.number().nonnegative(),
    range_min_eur: z.number().nonnegative(),
    range_max_eur: z.number().nonnegative(),
    certezza: prioritySchema,
    strategia_risparmio: z.string().min(1),
    rischio_sforamento: riskLevelSchema
  })
  .superRefine((value, context) => {
    if (value.range_min_eur > value.range_max_eur) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["range_min_eur"],
        message: "range_min_eur deve essere minore o uguale a range_max_eur."
      });
    }

    if (
      value.stima_eur < value.range_min_eur ||
      value.stima_eur > value.range_max_eur
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stima_eur"],
        message: "stima_eur deve stare dentro range_min_eur e range_max_eur."
      });
    }
  });

export const DeclutteringItemSchema = z.object({
  id: z.string().min(1),
  oggetto: z.string().min(1),
  categoria: z.enum([
    "mobili",
    "vestiti",
    "libri",
    "cucina",
    "elettronica",
    "ricordi",
    "piante",
    "altro"
  ]),
  domanda_socratica: z.string().min(1),
  azione_consigliata: z.enum(["Vendere", "Donare", "Buttare"]),
  motivazione: z.string().min(1),
  valore_stimato_eur: z.number().nonnegative(),
  ingombro: riskLevelSchema,
  urgenza_decisione: prioritySchema
});

export const InterventoBotanicoSchema = z.object({
  id: z.string().min(1),
  azione: z.string().min(1),
  giorni_prima: z.number(),
  critico: z.boolean(),
  motivo: z.string().min(1)
});

export const CellaGiardinoSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  uso_suggerito: z.string().min(1),
  note: z.string()
});

export const Giardino4x2Schema = z.object({
  larghezza_m: z.literal(4),
  profondita_m: z.literal(2),
  esposizione_solare: sunExposureSchema,
  celle: z.array(CellaGiardinoSchema)
});

export const TerrazzoSchema = z.object({
  esposizione_solare: sunExposureSchema,
  vincoli: z.array(z.string().min(1)),
  uso_suggerito: z.string().min(1)
});

export const LayoutNuovoSpazioSchema = z.object({
  giardino_4x2: Giardino4x2Schema,
  terrazzo: TerrazzoSchema,
  flussi_movimento: z.array(z.string().min(1))
});

export const PiantaCriticaSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  rischio: riskLevelSchema,
  azione_preventiva: z.string().min(1)
});

export const LogisticaBotanicaSchema = z.object({
  interventi_pre_trasloco: z.array(InterventoBotanicoSchema),
  layout_nuovo_spazio: LayoutNuovoSpazioSchema,
  piante_critiche: z.array(PiantaCriticaSchema),
  note_generali: z.string()
});

export const DomandaApertaSchema = z.object({
  id: z.string().min(1),
  domanda: z.string().min(1),
  motivo: z.string().min(1),
  priorita: prioritySchema
});

export const RischioSchema = z.object({
  id: z.string().min(1),
  tipo: z.enum(["logistico", "economico", "tempo", "spazio", "botanico", "altro"]),
  descrizione: z.string().min(1),
  gravita: severitySchema,
  mitigazione: z.string().min(1)
});

export const RelocationSchema = z.object({
  schema_version: z.literal(schemaVersion),
  snapshot_id: z.string().min(1),
  created_at: z.string().min(1),
  fase_trasloco: z.string().min(1),
  sintesi_operativa: z.string().min(1),
  task_logistici: z.array(TaskLogisticoSchema),
  analisi_costi: z.array(VoceCostoSchema),
  verdetto_decluttering: z.array(DeclutteringItemSchema),
  logistica_botanica: LogisticaBotanicaSchema,
  domande_aperte: z.array(DomandaApertaSchema),
  rischi: z.array(RischioSchema)
});

export type RelocationData = z.infer<typeof RelocationSchema>;
export type TaskLogistico = z.infer<typeof TaskLogisticoSchema>;
export type VoceCosto = z.infer<typeof VoceCostoSchema>;
export type DeclutteringItem = z.infer<typeof DeclutteringItemSchema>;
