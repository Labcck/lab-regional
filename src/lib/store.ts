import type { Respuesta } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(REDIS_URL && REDIS_TOKEN);

// Fallback en memoria: solo sirve para desarrollo local (un único proceso).
// En producción en Vercel, conectá Supabase (o Redis) para que las
// respuestas se compartan entre todos los dispositivos y funciones serverless.
const memoryStore: Map<string, Respuesta[]> = (globalThis as unknown as {
  __labMemoryStore?: Map<string, Respuesta[]>;
}).__labMemoryStore ?? new Map();
(globalThis as unknown as { __labMemoryStore?: Map<string, Respuesta[]> }).__labMemoryStore =
  memoryStore;

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL!, SUPABASE_KEY!);
}

async function getKv() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

function key(room: string) {
  return `lab:responses:${room}`;
}

export async function addResponse(resp: Respuesta): Promise<void> {
  if (hasSupabase) {
    const sb = await getSupabase();
    const { error } = await sb.from("respuestas").insert({
      id: resp.id,
      room: resp.room,
      pais: resp.pais,
      problema: resp.problema,
      accion: resp.accion,
      created_at: new Date(resp.createdAt).toISOString(),
    });
    if (error) throw new Error(error.message);
    return;
  }
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
  if (hasSupabase) {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from("respuestas")
      .select("id, room, pais, problema, accion, created_at")
      .eq("room", room)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      room: r.room,
      pais: r.pais,
      problema: r.problema,
      accion: r.accion,
      createdAt: new Date(r.created_at).getTime(),
    }));
  }
  if (hasKv) {
    const kv = await getKv();
    const raw = await kv.lrange<string>(key(room), 0, -1);
    return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r) as Respuesta);
  }
  return memoryStore.get(room) ?? [];
}

export async function resetRoom(room: string): Promise<void> {
  if (hasSupabase) {
    const sb = await getSupabase();
    const { error } = await sb.from("respuestas").delete().eq("room", room);
    if (error) throw new Error(error.message);
    return;
  }
  if (hasKv) {
    const kv = await getKv();
    await kv.del(key(room));
    return;
  }
  memoryStore.delete(room);
}
