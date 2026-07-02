import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";

const packageManagerPath = process.env.npm_execpath;

function packageScript(name) {
  if (packageManagerPath) {
    return {
      command: process.execPath,
      args: [packageManagerPath, name]
    };
  }

  return {
    command: "pnpm",
    args: [name]
  };
}

console.log("\nRelocation Manager - avvio locale\n");
console.log("1. Controllo strumenti e configurazione...");

const check = spawnSync(process.execPath, ["scripts/check-local.mjs", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"]
});

if (check.status !== 0) {
  console.error("\nControllo pre-avvio fallito. Esegui `pnpm check:local` per i dettagli.");
  process.exit(check.status ?? 1);
}

const result = JSON.parse(check.stdout);

if (result.hasWarnings) {
  console.log("   Controllo completato con avvisi non bloccanti.");
  console.log("   Per leggerli: pnpm check:local");
} else {
  console.log("   Controllo completato: tutto pronto.");
}

console.log("\n2. Avvio frontend e backend...");
console.log("   Quando Vite mostra `Local: ...`, apri quell'indirizzo nel browser.");
console.log("   Per spegnere: Ctrl + C\n");

const dev = packageScript("dev");
const child = spawn(dev.command, dev.args, {
  stdio: "inherit",
  env: {
    ...process.env,
    FORCE_COLOR: process.env.NO_COLOR ? undefined : "1"
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(`Impossibile avviare l'app: ${error.message}`);
  process.exit(1);
});
