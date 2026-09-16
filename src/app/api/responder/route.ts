import { NextRequest, NextResponse } from "next/server";
import { CATEGORIAS, getPais } from "@/lib/data";
import { generarIdea } from "@/lib/idea";
import { addResponse, getResponses } from "@/lib/store";
import type { AccionId, CategoriaId, DificultadId, Respuesta } from "@/lib/types";

const CATEGORIA_IDS = new Set(CATEGORIAS.map((c) => c.id));
const DIFICULTAD_IDS = new Set(["encontrar", "rapido", "ordenar", "crear", "repetir"]);
const ACCION_IDS = new Set(["buscar", "analizar", "crear", "automatizar", "recomendar"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { room, pais, categoria, dificultad, accion, nombre } = body as Record<string, string>;

  if (!room || typeof room !== "string") {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }
  if (!pais || !getPais(pais)) {
    return NextResponse.json({ error: "País inválido" }, { status: 400 });
  }
  if (!categoria || !CATEGORIA_IDS.has(categoria as CategoriaId)) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }
  if (!dificultad || !DIFICULTAD_IDS.has(dificultad)) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 });
  }
  if (!accion || !ACCION_IDS.has(accion)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const respuesta: Respuesta = {
    id: crypto.randomUUID(),
    room: room.trim().toUpperCase(),
    pais,
    categoria: categoria as CategoriaId,
    dificultad: dificultad as DificultadId,
    accion: accion as AccionId,
    nombre: (nombre || "").slice(0, 60),
    createdAt: Date.now(),
  };

  await addResponse(respuesta);

  const idea = generarIdea(respuesta.categoria, respuesta.dificultad, respuesta.accion);

  const todas = await getResponses(respuesta.room);
  const paisesConMismaCategoria = new Set(
    todas.filter((r) => r.categoria === respuesta.categoria).map((r) => r.pais)
  );

  return NextResponse.json({
    idea,
    paisesConMismaCategoria: Array.from(paisesConMismaCategoria),
    totalConMismaCategoria: paisesConMismaCategoria.size,
  });
}
