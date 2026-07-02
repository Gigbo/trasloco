import { spawn } from "node:child_process";

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

const commands = [
  {
    name: "api",
    ...packageScript("dev:api"),
    delayMs: 0
  },
  {
    name: "web",
    ...packageScript("dev:web"),
    delayMs: 500
  }
];

const children = [];
const timers = [];

for (const commandConfig of commands) {
  const timer = setTimeout(() => {
    children.push(startProcess(commandConfig));
  }, commandConfig.delayMs);

  timers.push(timer);
}

function startProcess({ name, command, args }) {
  const env = { ...process.env };

  if (!env.NO_COLOR) {
    env.FORCE_COLOR = "1";
  }

  const child = spawn(command, args, {
    stdio: "inherit",
    env
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      stopAll();
      process.exit(code);
    }

    if (signal) {
      console.error(`[${name}] exited with signal ${signal}`);
      stopAll();
      process.exit(1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    stopAll();
    process.exit(1);
  });

  return child;
}

function stopAll() {
  for (const timer of timers) {
    clearTimeout(timer);
  }

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(130);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(143);
});
