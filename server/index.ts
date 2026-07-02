import { buildApp } from "./app";

const port = Number(process.env.API_PORT ?? 5174);
const host = process.env.API_HOST ?? "127.0.0.1";

const app = buildApp();

try {
  await app.listen({ host, port });
  console.log(`Relocation Manager API listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
