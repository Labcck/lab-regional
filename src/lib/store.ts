import type { Respuesta } from "./types";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(REDIS_URL && REDIS_TOKEN);

// Fallback en memoria: solo sirve para desarrollo local (un único proceso).
// En producción en Vercel, conectá una integración de Redis (Storage →
// Marketplace → Redis/Upstash) para que las respuestas se compartan entre
// todos los dispositivos y funciones serverless.
const memoryStore: Map<string, Respuesta[]> = (globalThis as unknown as {
  __labMemoryStore?: Map<string, Respuesta[]>;
}).__labMemoryStore ?? new Map();
(globalThis as unknown as { __labMemoryStore?: Map<string, Respuesta[]> }).__labMemoryStore =
  memoryStore;

async function getKv() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

function key(room: string) {
  return `lab:responses:${room}`;
}

export async function isUsingKv() {
  return hasKv;
}

export async function addResponse(resp: Respuesta): Promise<void> {
  if (hasKv) {
    const kv = await getKv();
    await kv.rpush(key(resp.room), JSON.stringify(resp));
    return;
  }
  const list = memoryStore.get(resp.room) ?? [];
  list.push(resp);
  memoryStore.set(resp.room, list);
}

export async function getResponses(room: string): Promise<Respuesta[]> {
  if (hasKv) {
    const kv = await getKv();
    const raw = await kv.lrange<string>(key(room), 0, -1);
    return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r) as Respuesta);
  }
  return memoryStore.get(room) ?? [];
}

export async function resetRoom(room: string): Promise<void> {
  if (hasKv) {
    const kv = await getKv();
    await kv.del(key(room));
    return;
  }
  memoryStore.delete(room);
}
