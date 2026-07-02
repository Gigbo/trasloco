import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [];
const isJsonMode = process.argv.includes("--json");

function addCheck(label, ok, detail, fix, required = false) {
  checks.push({
    label,
    ok,
    detail,
    fix,
    required
  });
}

function run(command, args = []) {
  return spawnSync(command, args, {
    encoding: "utf8"
  });
}

function commandVersion(command, args = ["--version"]) {
  const result = run(command, args);

  if (result.error || result.status !== 0) {
    return null;
  }

  return [result.stdout, result.stderr].join("").trim();
}

addCheck("Node.js", true, process.version);

const pnpmVersion = commandVersion("pnpm", ["-v"]);
addCheck(
  "pnpm",
  Boolean(pnpmVersion),
  pnpmVersion ?? "pnpm non trovato nel PATH.",
  "Installa pnpm con: npm install -g pnpm",
  true
);

addCheck(
  "node_modules",
  existsSync("node_modules"),
  existsSync("node_modules")
    ? "Dipendenze progetto presenti."
    : "Dipendenze progetto mancanti.",
  "Esegui: pnpm install",
  true
);

addCheck(
  ".env",
  existsSync(".env"),
  existsSync(".env")
    ? "Configurazione locale presente."
    : "Configurazione locale assente: verra usato il provider mock.",
  "Per usare Ollama copia .env.example in .env e imposta LLM_PROVIDER=ollama"
);

const ollamaVersion = commandVersion("ollama", ["--version"]);
addCheck(
  "Ollama CLI",
  Boolean(ollamaVersion),
  ollamaVersion ?? "Ollama non trovato.",
  "Installa Ollama da https://ollama.com/"
);

if (ollamaVersion) {
  const listResult = run("ollama", ["list"]);
  const ollamaList = listResult.stdout.trim();
  const ollamaListOk = listResult.status === 0 && ollamaList.length > 0;

  addCheck(
    "Ollama modelli",
    ollamaListOk,
    ollamaListOk ? firstUsefulLine(ollamaList) : "Nessun modello rilevato o Ollama non attivo.",
    "Avvia Ollama e poi installa un modello: ollama pull gemma4:latest"
  );

  if (ollamaListOk) {
    addCheck(
      "gemma4:latest",
      ollamaList.includes("gemma4:latest"),
      ollamaList.includes("gemma4:latest")
        ? "Modello consigliato installato."
        : "Modello consigliato non trovato.",
      "Esegui: ollama pull gemma4:latest"
    );
  }
}

const failedChecks = checks.filter((check) => !check.ok);
const blockingChecks = failedChecks.filter((check) => check.required);

if (!isJsonMode) {
  console.log("\nRelocation Manager - controllo locale\n");
}

if (isJsonMode) {
  console.log(
    JSON.stringify(
      {
        ok: blockingChecks.length === 0,
        hasWarnings: failedChecks.length > 0,
        checks
      },
      null,
      2
    )
  );
} else {
  for (const check of checks) {
    const marker = check.ok ? "OK" : "ATTENZIONE";
    console.log(`[${marker}] ${check.label}: ${check.detail}`);

    if (!check.ok && check.fix) {
      console.log(`       Come risolvere: ${check.fix}`);
    }
  }

  if (blockingChecks.length > 0) {
    console.log("\nControllo fallito. Correggi i punti obbligatori e riprova.");
  } else if (failedChecks.length > 0) {
    console.log(
      "\nControllo completato con avvisi. Puoi avviare l'app, ma correggi gli avvisi per usare tutte le funzioni."
    );
  } else {
    console.log("\nTutto pronto. Puoi avviare l'app con: pnpm dev");
  }
}

process.exitCode = blockingChecks.length > 0 ? 1 : 0;

function firstUsefulLine(value) {
  return value.split("\n").slice(0, 2).join(" | ");
}
