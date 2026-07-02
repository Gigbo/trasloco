import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";
import { createSqlitePersistence, type Persistence } from "./db";
import { createLlmProvider } from "./llm/provider";
import type { LlmProvider } from "./llm/types";
import { parseRelocationResponse } from "../src/lib/parse-ai-json";

const ChatBodySchema = z.object({
  message: z.string().trim().min(1, "message non puo essere vuoto")
});

const IdParamsSchema = z.object({
  taskId: z.string().trim().min(1).optional(),
  itemId: z.string().trim().min(1).optional(),
  costId: z.string().trim().min(1).optional(),
  interventionId: z.string().trim().min(1).optional()
});

const TaskStateBodySchema = z.object({
  completed: z.boolean()
});

const DeclutteringBodySchema = z.object({
  action: z.enum(["Vendere", "Donare", "Buttare"])
});

const CostOverrideBodySchema = z.object({
  stima_eur: z.number().nonnegative()
});

const BotanicalNotesBodySchema = z.object({
  layout_notes: z.string()
});

const ModelSelectionBodySchema = z.object({
  model: z.string().trim().min(1, "model non puo essere vuoto")
});

const selectedLlmModelSettingKey = "selected_llm_model";

type BuildAppOptions = {
  llmProvider?: LlmProvider;
  persistence?: Persistence;
};

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: false
  });

  const llmProvider = options.llmProvider ?? createLlmProvider();
  const persistence = options.persistence ?? createSqlitePersistence();
  const savedModel = persistence.getAppSetting(selectedLlmModelSettingKey);

  if (savedModel && llmProvider.setModel) {
    llmProvider.setModel(savedModel.value);
  }

  app.addHook("onClose", async () => {
    persistence.close();
  });

  app.get("/api/health", async () => {
    const llmDiagnostics = llmProvider.diagnostics
      ? await llmProvider.diagnostics()
      : null;

    return {
      status: "ok",
      service: "relocation-manager-api",
      provider: llmProvider.name,
      model: llmProvider.model ?? null,
      llm: llmDiagnostics,
      timestamp: new Date().toISOString()
    };
  });

  app.put("/api/llm/model", async (request, reply) => {
    const parsed = ModelSelectionBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Modello LLM non valido.",
        detail: parsed.error.issues[0]?.message ?? "Payload non valido."
      });
    }

    if (!llmProvider.setModel) {
      return reply.status(400).send({
        error: "Cambio modello non supportato.",
        detail: `Il provider "${llmProvider.name}" non supporta il cambio modello runtime.`
      });
    }

    const diagnostics = llmProvider.diagnostics ? await llmProvider.diagnostics() : null;
    const installedModels = diagnostics?.installedModels ?? [];

    if (!installedModels.includes(parsed.data.model)) {
      return reply.status(400).send({
        error: "Modello non installato.",
        detail: `Il modello "${parsed.data.model}" non risulta installato in Ollama.`,
        installedModels
      });
    }

    await llmProvider.setModel(parsed.data.model);
    persistence.setAppSetting(selectedLlmModelSettingKey, parsed.data.model);

    const nextDiagnostics = llmProvider.diagnostics
      ? await llmProvider.diagnostics()
      : null;

    return {
      provider: llmProvider.name,
      model: llmProvider.model ?? parsed.data.model,
      llm: nextDiagnostics
    };
  });

  app.post("/api/chat", async (request, reply) => {
    const parsed = ChatBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Richiesta chat non valida.",
        detail: parsed.error.issues[0]?.message ?? "Payload non valido."
      });
    }

    let response;

    try {
      response = await llmProvider.chat(parsed.data);
    } catch (error) {
      return reply.status(502).send({
        error: "Provider LLM non disponibile.",
        detail:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto durante la chiamata al provider LLM."
      });
    }

    const conversation = persistence.saveConversation({
      userMessage: parsed.data.message,
      assistantText: response.assistantText,
      provider: response.provider
    });

    const parseResult = parseRelocationResponse(response.assistantText);
    const snapshot = parseResult.success
      ? persistence.saveSnapshot({
          conversationId: conversation.id,
          payload: parseResult.data
        })
      : null;

    return {
      assistantText: response.assistantText,
      provider: response.provider,
      conversationId: conversation.id,
      snapshotId: snapshot?.id ?? null,
      snapshotSaved: Boolean(snapshot)
    };
  });

  app.get("/api/state", async () => {
    return {
      latestSnapshot: persistence.getLatestSnapshot(),
      recentSnapshots: persistence.getRecentSnapshots(20),
      recentConversations: persistence.getRecentConversations(20),
      userState: persistence.getUserState()
    };
  });

  app.get("/api/snapshots", async () => {
    return {
      snapshots: persistence.getRecentSnapshots(50)
    };
  });

  app.get("/api/user-state", async () => {
    return persistence.getUserState();
  });

  app.put("/api/tasks/:taskId", async (request, reply) => {
    const params = IdParamsSchema.safeParse(request.params);
    const body = TaskStateBodySchema.safeParse(request.body);

    if (!params.success || !params.data.taskId || !body.success) {
      return reply.status(400).send({
        error: "Stato task non valido.",
        detail: body.success ? "taskId mancante." : body.error.issues[0]?.message
      });
    }

    return persistence.setTaskState(params.data.taskId, body.data.completed);
  });

  app.put("/api/decluttering/:itemId", async (request, reply) => {
    const params = IdParamsSchema.safeParse(request.params);
    const body = DeclutteringBodySchema.safeParse(request.body);

    if (!params.success || !params.data.itemId || !body.success) {
      return reply.status(400).send({
        error: "Decisione decluttering non valida.",
        detail: body.success ? "itemId mancante." : body.error.issues[0]?.message
      });
    }

    return persistence.setDeclutteringDecision(params.data.itemId, body.data.action);
  });

  app.put("/api/costs/:costId", async (request, reply) => {
    const params = IdParamsSchema.safeParse(request.params);
    const body = CostOverrideBodySchema.safeParse(request.body);

    if (!params.success || !params.data.costId || !body.success) {
      return reply.status(400).send({
        error: "Override costo non valido.",
        detail: body.success ? "costId mancante." : body.error.issues[0]?.message
      });
    }

    return persistence.setCostOverride(params.data.costId, body.data.stima_eur);
  });

  app.put("/api/botanical/interventions/:interventionId", async (request, reply) => {
    const params = IdParamsSchema.safeParse(request.params);
    const body = TaskStateBodySchema.safeParse(request.body);

    if (!params.success || !params.data.interventionId || !body.success) {
      return reply.status(400).send({
        error: "Stato intervento botanico non valido.",
        detail: body.success ? "interventionId mancante." : body.error.issues[0]?.message
      });
    }

    return persistence.setBotanicalInterventionState(
      params.data.interventionId,
      body.data.completed
    );
  });

  app.put("/api/botanical/notes", async (request, reply) => {
    const body = BotanicalNotesBodySchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: "Note botaniche non valide.",
        detail: body.error.issues[0]?.message
      });
    }

    return persistence.setBotanicalNotes(body.data.layout_notes);
  });

  return app;
}
