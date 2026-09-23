import type { AccionId } from "./types";

export const ROOM_CODE = process.env.NEXT_PUBLIC_ROOM_CODE || "LABREGIONAL";

export const PAISES: { id: string; nombre: string; flag: string }[] = [
  { id: "CR", nombre: "Costa Rica", flag: "/flags/cr.svg" },
  { id: "PA", nombre: "Panamá", flag: "/flags/pa.svg" },
  { id: "SV", nombre: "El Salvador", flag: "/flags/sv.svg" },
  { id: "PY", nombre: "Paraguay", flag: "/flags/py.svg" },
  { id: "HN", nombre: "Honduras", flag: "/flags/hn.svg" },
  { id: "GT", nombre: "Guatemala", flag: "/flags/gt.svg" },
  { id: "DO", nombre: "República Dominicana", flag: "/flags/do.svg" },
];

export const ACCIONES: {
  id: AccionId;
  label: string;
  emoji: string;
  nombrePrefijo: string;
  comoFunciona: (problema: string) => string;
  mvp: string;
}[] = [
  {
    id: "buscar",
    label: "Buscar información",
    emoji: "🔍",
    nombrePrefijo: "Asistente de Búsqueda",
    comoFunciona: (problema) =>
      `Una IA que centraliza la información dispersa sobre "${problema}" y responde preguntas en segundos, citando la fuente original.`,
    mvp: "Buscador conversacional + respuestas con fuentes citadas.",
  },
  {
    id: "analizar",
    label: "Analizar",
    emoji: "📊",
    nombrePrefijo: "Motor de Análisis",
    comoFunciona: (problema) =>
      `Una IA que procesa la información disponible sobre "${problema}" y detecta patrones, riesgos y oportunidades automáticamente.`,
    mvp: "Carga de datos + panel de hallazgos automáticos.",
  },
  {
    id: "generar",
    label: "Generar contenido",
    emoji: "✨",
    nombrePrefijo: "Generador de Contenido",
    comoFunciona: (problema) =>
      `Una IA que genera primeros borradores para resolver "${problema}", entrenada con el tono y los estándares de tu organización.`,
    mvp: "Plantillas + generación de borradores editables.",
  },
  {
    id: "resumir",
    label: "Resumir",
    emoji: "🧾",
    nombrePrefijo: "Asistente de Resúmenes",
    comoFunciona: (problema) =>
      `Una IA que lee documentos largos relacionados con "${problema}" y entrega resúmenes claros y accionables en segundos.`,
    mvp: "Carga de documentos + resumen automático con puntos clave.",
  },
  {
    id: "automatizar",
    label: "Automatizar",
    emoji: "⚙️",
    nombrePrefijo: "Automatizador de Procesos",
    comoFunciona: (problema) =>
      `Una IA que ejecuta automáticamente las tareas repetitivas detrás de "${problema}", liberando tiempo del equipo.`,
    mvp: "Flujo automatizado de principio a fin para la tarea más repetitiva.",
  },
  {
    id: "otro",
    label: "Otro",
    emoji: "💡",
    nombrePrefijo: "Solución a medida",
    comoFunciona: (problema) =>
      `Una IA diseñada a la medida para resolver "${problema}", según la necesidad específica descrita.`,
    mvp: "Prototipo inicial definido junto con el equipo, según la necesidad concreta.",
  },
];

export function getAccion(id: AccionId) {
  return ACCIONES.find((a) => a.id === id)!;
}

export function getPais(id: string) {
  return PAISES.find((p) => p.id === id);
}
