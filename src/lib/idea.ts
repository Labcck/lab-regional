import { getAccion, getPais } from "./data";
import type { AccionId, IdeaGenerada } from "./types";

export function generarIdea(
  pais: string,
  problema: string,
  accionId: AccionId,
  detalle?: string
): IdeaGenerada {
  const accion = getAccion(accionId);
  const paisNombre = getPais(pais)?.nombre ?? pais;

  if (accionId === "otro" && detalle && detalle.trim()) {
    const detalleLimpio = detalle.trim();
    return {
      nombreIdea: `${detalleLimpio} para ${paisNombre}`,
      problema,
      usuario: `Tu equipo en ${paisNombre}`,
      comoFunciona: `Una solución de IA a la medida — "${detalleLimpio}" — enfocada en resolver: "${problema}".`,
      beneficio:
        "Reduce el tiempo y el esfuerzo dedicado a este reto, liberando al equipo para tareas de mayor valor estratégico.",
      mvp: "Prototipo inicial definido junto con el equipo, según esta necesidad concreta.",
    };
  }

  return {
    nombreIdea: `${accion.nombrePrefijo} para ${paisNombre}`,
    problema,
    usuario: `Tu equipo en ${paisNombre}`,
    comoFunciona: accion.comoFunciona(problema),
    beneficio:
      "Reduce el tiempo y el esfuerzo dedicado a este reto, liberando al equipo para tareas de mayor valor estratégico.",
    mvp: accion.mvp,
  };
}
