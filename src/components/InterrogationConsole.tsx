import type {
  ConversationPayload,
  ProviderStatusPayload,
  SnapshotPayload
} from "../lib/api-types";

type InterrogationConsoleProps = {
  message: string;
  rawResponse: string;
  apiStatus: string;
  providerStatus: ProviderStatusPayload;
  isChangingModel: boolean;
  isLoading: boolean;
  persistedItems: number;
  conversations: ConversationPayload[];
  snapshots: SnapshotPayload[];
  selectedConversationId: number | null;
  selectedSnapshotId: number | null;
  onMessageChange: (message: string) => void;
  onRawResponseChange: (rawResponse: string) => void;
  onSubmit: () => void;
  onModelChange: (model: string) => Promise<void>;
  onSelectConversation: (conversation: ConversationPayload) => void;
  onSelectSnapshot: (snapshot: SnapshotPayload) => void;
};

export function InterrogationConsole({
  message,
  rawResponse,
  apiStatus,
  providerStatus,
  isChangingModel,
  isLoading,
  persistedItems,
  conversations,
  snapshots,
  selectedConversationId,
  selectedSnapshotId,
  onMessageChange,
  onRawResponseChange,
  onSubmit,
  onModelChange,
  onSelectConversation,
  onSelectSnapshot
}: InterrogationConsoleProps) {
  return (
    <aside className="border-b border-neutral-800 bg-black p-5 lg:border-b-0 lg:border-r">
      <p className="text-xs font-semibold uppercase text-red-500">
        L'Inquisitore Logistico
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Relocation Manager</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-400">
        Console tecnica. Interroga il provider LLM, valida il JSON e trasforma il
        modulo IA in dashboard operativa.
      </p>

      <section className="mt-5 border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">
            Provider LLM
          </p>
          <span
            className={`border px-2 py-1 text-xs font-semibold uppercase ${
              providerStatus.status === "ok"
                ? "border-emerald-800 text-emerald-300"
                : "border-red-900 text-red-300"
            }`}
          >
            {providerStatus.status}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-xs">
          <dt className="text-neutral-600">Motore</dt>
          <dd className="font-mono text-neutral-300">{providerStatus.provider}</dd>
          <dt className="text-neutral-600">Modello</dt>
          <dd className="font-mono text-neutral-300">
            {providerStatus.model ?? "non dichiarato"}
          </dd>
        </dl>
        {providerStatus.llm ? (
          <div className="mt-3 border-t border-neutral-800 pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase text-neutral-600">Diagnostica Ollama</p>
              <span
                className={`border px-2 py-1 text-xs font-semibold uppercase ${
                  providerStatus.llm.status === "ready" ||
                  providerStatus.llm.status === "not_applicable"
                    ? "border-emerald-800 text-emerald-300"
                    : "border-red-900 text-red-300"
                }`}
              >
                {providerStatus.llm.status}
              </span>
            </div>
            {providerStatus.llm.baseUrl ? (
              <p className="mt-2 font-mono text-xs text-neutral-500">
                {providerStatus.llm.baseUrl}
              </p>
            ) : null}
            {providerStatus.llm.detail ? (
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                {providerStatus.llm.detail}
              </p>
            ) : null}
            {providerStatus.llm.installedModels.length > 0 ? (
              <div className="mt-3">
                <label
                  className="text-xs uppercase text-neutral-600"
                  htmlFor="ollama-model-select"
                >
                  Modelli installati: {providerStatus.llm.installedModels.length}
                </label>
                <select
                  className="mt-2 w-full border border-neutral-800 bg-black px-2 py-2 font-mono text-xs text-neutral-200 outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:text-neutral-600"
                  disabled={isChangingModel || providerStatus.llm.installedModels.length < 2}
                  id="ollama-model-select"
                  value={providerStatus.model ?? ""}
                  onChange={(event) => {
                    void onModelChange(event.target.value);
                  }}
                >
                  {providerStatus.llm.installedModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {providerStatus.llm.installedModels.length < 2 ? (
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Installa un altro modello Ollama per abilitarne il cambio.
                  </p>
                ) : null}
                {isChangingModel ? (
                  <p className="mt-2 text-xs leading-5 text-neutral-400">
                    Cambio modello in corso...
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {providerStatus.llm.installedModels.slice(0, 4).map((model) => (
                    <span
                      className={`border px-2 py-1 font-mono text-xs ${
                        model === providerStatus.model
                          ? "border-emerald-800 text-emerald-300"
                          : "border-neutral-800 text-neutral-400"
                      }`}
                      key={model}
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {providerStatus.detail ? (
          <p className="mt-3 text-xs leading-5 text-red-300">{providerStatus.detail}</p>
        ) : null}
      </section>

      <label
        className="mt-6 block text-xs font-semibold uppercase text-neutral-500"
        htmlFor="interrogation-message"
      >
        Console interrogatoria
      </label>
      <textarea
        id="interrogation-message"
        className="mt-2 h-28 w-full resize-none border border-neutral-800 bg-neutral-950 p-3 text-sm leading-5 text-neutral-200 outline-none focus:border-red-500"
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
      />
      <button
        className="mt-3 w-full border border-red-800 bg-red-950 px-4 py-3 text-sm font-semibold uppercase text-red-100 hover:bg-red-900 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-500"
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Interrogazione..." : "Interroga"}
      </button>
      <p className="mt-3 min-h-5 text-xs text-neutral-500">{apiStatus}</p>
      <p className="mt-1 text-xs text-neutral-600">
        Conversazioni persistite: {persistedItems}
      </p>

      <section className="mt-6 border border-neutral-800 bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-800 p-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">
            Piani validati
          </p>
          <span className="font-mono text-xs text-neutral-500">{snapshots.length}</span>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {snapshots.length > 0 ? (
            snapshots.map((snapshot) => {
              const isSelected = snapshot.id === selectedSnapshotId;

              return (
                <button
                  className={`w-full border-b border-neutral-900 p-3 text-left hover:bg-neutral-900 ${
                    isSelected ? "bg-neutral-900 text-neutral-100" : "bg-black"
                  }`}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`Carica piano validato ${snapshot.id}: ${snapshot.payload.fase_trasloco}`}
                  key={snapshot.id}
                  type="button"
                  onClick={() => onSelectSnapshot(snapshot)}
                >
                  <span className="block text-xs text-neutral-500">
                    #{snapshot.id} · {formatDate(snapshot.created_at)} ·{" "}
                    {snapshot.schema_version}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-neutral-200">
                    {snapshot.payload.fase_trasloco}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-500">
                    {snapshot.payload.sintesi_operativa}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="p-3 text-sm leading-6 text-neutral-500">
              Nessuno snapshot validato.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 border border-neutral-800 bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-800 p-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">
            Storico operativo
          </p>
          <span className="font-mono text-xs text-neutral-500">
            {conversations.length}
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;

              return (
                <button
                  className={`w-full border-b border-neutral-900 p-3 text-left hover:bg-neutral-900 ${
                    isSelected ? "bg-neutral-900 text-neutral-100" : "bg-black"
                  }`}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`Carica conversazione ${conversation.id}`}
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation)}
                >
                  <span className="block text-xs text-neutral-500">
                    #{conversation.id} · {formatDate(conversation.created_at)} ·{" "}
                    {conversation.provider}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-5 text-neutral-300">
                    {conversation.user_message}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="p-3 text-sm leading-6 text-neutral-500">
              Nessuna conversazione persistita.
            </p>
          )}
        </div>
      </section>

      <label
        className="mt-6 block text-xs font-semibold uppercase text-neutral-500"
        htmlFor="raw-ai-output"
      >
        Output IA grezzo
      </label>
      <textarea
        id="raw-ai-output"
        className="mt-2 h-[360px] w-full resize-none border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs leading-5 text-neutral-200 outline-none focus:border-red-500"
        value={rawResponse}
        onChange={(event) => onRawResponseChange(event.target.value)}
        spellCheck={false}
      />
    </aside>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data non valida";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
