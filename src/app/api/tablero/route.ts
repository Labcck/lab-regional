import { NextRequest, NextResponse } from "next/server";
import { CATEGORIAS, getPais } from "@/lib/data";
import { generarIdea } from "@/lib/idea";
import { getResponses } from "@/lib/store";
import type { CategoriaId, ComboStat, TableroData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const room = (req.nextUrl.searchParams.get("room") || "").trim().toUpperCase();
  if (!room) {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }

  const respuestas = await getResponses(room);

  const porCategoria = CATEGORIAS.map((cat) => {
    const enCategoria = respuestas.filter((r) => r.categoria === cat.id);
    const paises = Array.from(new Set(enCategoria.map((r) => r.pais)));
    return {
      categoria: cat.id as CategoriaId,
      label: cat.label,
      count: enCategoria.length,
      paises,
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const comboMap = new Map<string, ComboStat>();
  for (const r of respuestas) {
    const k = `${r.categoria}::${r.accion}`;
    const existing = comboMap.get(k);
    if (existing) {
      existing.count += 1;
      if (!existing.paises.includes(r.pais)) existing.paises.push(r.pais);
    } else {
      comboMap.set(k, {
        categoria: r.categoria,
        accion: r.accion,
        count: 1,
        paises: [r.pais],
      });
    }
  }

  const combos = Array.from(comboMap.values()).sort(
    (a, b) => b.count - a.count || b.paises.length - a.paises.length
  );

  const top = combos[0];

  const data: TableroData = {
    totalParticipantes: respuestas.length,
    totalCategorias: porCategoria.length,
    porCategoria,
    oportunidadTop: top
      ? {
          combo: top,
          idea: generarIdea(top.categoria, respuestas.find((r) => r.categoria === top.categoria && r.accion === top.accion)!.dificultad, top.accion),
        }
      : null,
  };

  return NextResponse.json({
    ...data,
    // adjunta info de banderas para no recalcular en el cliente
    paisesInfo: Array.from(new Set(respuestas.map((r) => r.pais))).map((id) => getPais(id)),
  });
}
