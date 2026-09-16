import { NextRequest, NextResponse } from "next/server";
import { getPais } from "@/lib/data";
import { generarIdea } from "@/lib/idea";
import { addResponse, getResponses } from "@/lib/store";
import type { AccionId, Respuesta } from "@/lib/types";

const ACCION_IDS = new Set(["buscar", "analizar", "generar", "resumir", "automatizar"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { room, pais, problema, accion } = body as Record<string, string>;

  if (!room || typeof room !== "string") {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }
  if (!pais || !getPais(pais)) {
    return NextResponse.json({ error: "País inválido" }, { status: 400 });
  }
  if (!problema || typeof problema !== "string" || !problema.trim()) {
    return NextResponse.json({ error: "Falta describir el reto" }, { status: 400 });
  }
  if (!accion || !ACCION_IDS.has(accion)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const respuesta: Respuesta = {
    id: crypto.randomUUID(),
    room: room.trim().toUpperCase(),
    pais,
    problema: problema.trim().slice(0, 280),
    accion: accion as AccionId,
    createdAt: Date.now(),
  };

  await addResponse(respuesta);

  const idea = generarIdea(respuesta.pais, respuesta.problema, respuesta.accion);

  const todas = await getResponses(respuesta.room);
  const conMismaAccion = todas.filter((r) => r.accion === respuesta.accion);
  const paisesConMismaAccion = Array.from(new Set(conMismaAccion.map((r) => r.pais)));
  const ejemplos = conMismaAccion
    .filter((r) => r.id !== respuesta.id)
    .slice(-3)
    .reverse()
    .map((r) => ({ pais: r.pais, problema: r.problema }));

  return NextResponse.json({
    idea,
    paisesConMismaAccion,
    totalConMismaAccion: paisesConMismaAccion.length,
    ejemplos,
  });
}
