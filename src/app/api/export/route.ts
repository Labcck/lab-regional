import { NextRequest, NextResponse } from "next/server";
import { getAccion, getPais } from "@/lib/data";
import { getResponses } from "@/lib/store";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const room = (req.nextUrl.searchParams.get("room") || "").trim().toUpperCase();
  if (!room) {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }

  const respuestas = await getResponses(room);
  const filas = [
    ["País", "Reto", "Acción de IA elegida", "Fecha y hora"],
    ...respuestas
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((r) => [
        getPais(r.pais)?.nombre ?? r.pais,
        r.problema,
        getAccion(r.accion)?.label ?? r.accion,
        new Date(r.createdAt).toLocaleString("es-CR"),
      ]),
  ];

  const csv = filas.map((fila) => fila.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lab-regional-${room}.csv"`,
    },
  });
}
