import { getAccion, getCategoria, getDificultad } from "./data";
import type { AccionId, CategoriaId, DificultadId, IdeaGenerada } from "./types";

export function generarIdea(
  categoriaId: CategoriaId,
  dificultadId: DificultadId,
  accionId: AccionId
): IdeaGenerada {
  const categoria = getCategoria(categoriaId);
  const dificultad = getDificultad(dificultadId);
  const accion = getAccion(accionId);

  return {
    nombreIdea: `${accion.nombrePrefijo} ${categoria.dominio}`,
    problema: `Actualmente, a los equipos les cuesta ${dificultad.label} en el área de ${categoria.label.toLowerCase()}.`,
    usuario: categoria.usuario,
    comoFunciona: accion.comoFunciona(categoria.label),
    beneficio: `Reduce el tiempo dedicado a ${dificultad.label} y libera al equipo para tareas de mayor valor estratégico.`,
    mvp: accion.mvp,
  };
}
