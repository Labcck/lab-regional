import { getAccion, getPais } from "./data";
import type { AccionId, IdeaGenerada } from "./types";

export function generarIdea(pais: string, problema: string, accionId: AccionId): IdeaGenerada {
  const accion = getAccion(accionId);
  const paisNombre = getPais(pais)?.nombre ?? pais;

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
