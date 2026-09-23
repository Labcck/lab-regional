import { NextRequest, NextResponse } from "next/server";
import { ACCIONES, getPais } from "@/lib/data";
import { getResponses } from "@/lib/store";
import type { AccionStat, TableroData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const room = (req.nextUrl.searchParams.get("room") || "").trim().toUpperCase();
  if (!room) {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }

  const respuestas = await getResponses(room);

  const porAccion: AccionStat[] = ACCIONES.map((a) => {
    const enAccion = respuestas.filter((r) => r.accion === a.id);
    const paises = Array.from(new Set(enAccion.map((r) => r.pais)));
    return {
      accion: a.id,
      label: a.label,
      count: enAccion.length,
      paises,
    };
  })
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count);

  const data: TableroData = {
    totalParticipantes: respuestas.length,
    totalPaises: Array.from(new Set(respuestas.map((r) => r.pais))).length,
    porAccion,
    respuestas: [...respuestas]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => ({
        id: r.id,
        pais: r.pais,
        problema: r.problema,
        accion: r.accion,
        accionDetalle: r.accionDetalle,
        createdAt: r.createdAt,
      })),
  };

  return NextResponse.json({
    ...data,
    paisesInfo: Array.from(new Set(respuestas.map((r) => r.pais))).map((id) => getPais(id)),
  });
}
