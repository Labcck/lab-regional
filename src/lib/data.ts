import type { AccionId, CategoriaId, DificultadId } from "./types";

export const ROOM_CODE = process.env.NEXT_PUBLIC_ROOM_CODE || "LABREGIONAL";

export const PAISES: { id: string; nombre: string; bandera: string }[] = [
  { id: "CR", nombre: "Costa Rica", bandera: "🇨🇷" },
  { id: "PA", nombre: "Panamá", bandera: "🇵🇦" },
  { id: "GT", nombre: "Guatemala", bandera: "🇬🇹" },
  { id: "HN", nombre: "Honduras", bandera: "🇭🇳" },
  { id: "SV", nombre: "El Salvador", bandera: "🇸🇻" },
  { id: "NI", nombre: "Nicaragua", bandera: "🇳🇮" },
  { id: "DO", nombre: "República Dominicana", bandera: "🇩🇴" },
  { id: "PY", nombre: "Paraguay", bandera: "🇵🇾" },
];

export const CATEGORIAS: {
  id: CategoriaId;
  label: string;
  emoji: string;
  usuario: string;
  dominio: string;
}[] = [
  {
    id: "investigacion",
    label: "Investigación",
    emoji: "🔎",
    usuario: "Los equipos de research e insights",
    dominio: "para Investigación Regional",
  },
  {
    id: "clientes",
    label: "Clientes",
    emoji: "🤝",
    usuario: "Los equipos de cuentas y atención al cliente",
    dominio: "para Gestión de Clientes",
  },
  {
    id: "propuestas",
    label: "Propuestas",
    emoji: "📝",
    usuario: "Los equipos comerciales y de nuevo negocio",
    dominio: "para Propuestas Comerciales",
  },
  {
    id: "contenido",
    label: "Contenido",
    emoji: "✍️",
    usuario: "Los equipos creativos y de contenido",
    dominio: "de Contenido Regional",
  },
  {
    id: "crisis",
    label: "Crisis",
    emoji: "🚨",
    usuario: "Los equipos de comunicación y manejo de crisis",
    dominio: "para Manejo de Crisis",
  },
  {
    id: "procesos",
    label: "Procesos internos",
    emoji: "🔄",
    usuario: "Los equipos operativos y administrativos",
    dominio: "para Procesos Internos",
  },
  {
    id: "conocimiento",
    label: "Conocimiento",
    emoji: "📚",
    usuario: "Todos los equipos de la organización",
    dominio: "de Conocimiento Regional",
  },
  {
    id: "otro",
    label: "Otro",
    emoji: "💡",
    usuario: "Los equipos involucrados",
    dominio: "Regional",
  },
];

export const DIFICULTADES: { id: DificultadId; label: string; emoji: string }[] = [
  { id: "encontrar", label: "encontrar información", emoji: "🔎" },
  { id: "rapido", label: "hacerlo rápido", emoji: "⏱️" },
  { id: "ordenar", label: "ordenar el conocimiento", emoji: "📚" },
  { id: "crear", label: "crear contenido", emoji: "✍️" },
  { id: "repetir", label: "no repetir procesos manuales", emoji: "🔄" },
];

export const ACCIONES: {
  id: AccionId;
  label: string;
  emoji: string;
  nombrePrefijo: string;
  comoFunciona: (categoriaLabel: string) => string;
  mvp: string;
}[] = [
  {
    id: "buscar",
    label: "Buscar",
    emoji: "🔍",
    nombrePrefijo: "Asistente de Búsqueda",
    comoFunciona: (cat) =>
      `Una IA que centraliza las fuentes de información dispersas sobre ${cat} y responde preguntas en segundos, con citas a la fuente original.`,
    mvp: "Buscador conversacional + respuestas con fuentes citadas.",
  },
  {
    id: "analizar",
    label: "Analizar",
    emoji: "📊",
    nombrePrefijo: "Motor de Análisis",
    comoFunciona: (cat) =>
      `Una IA que procesa la información disponible sobre ${cat} y detecta patrones, riesgos y oportunidades automáticamente.`,
    mvp: "Carga de datos + panel de hallazgos automáticos.",
  },
  {
    id: "crear",
    label: "Crear",
    emoji: "✨",
    nombrePrefijo: "Generador de Contenido",
    comoFunciona: (cat) =>
      `Una IA que genera primeros borradores relacionados con ${cat}, entrenada con el tono y los estándares de la organización.`,
    mvp: "Plantillas + generación de borradores editables.",
  },
  {
    id: "automatizar",
    label: "Automatizar",
    emoji: "⚙️",
    nombrePrefijo: "Automatizador de Procesos",
    comoFunciona: (cat) =>
      `Una IA que ejecuta automáticamente las tareas repetitivas asociadas a ${cat}, liberando tiempo del equipo.`,
    mvp: "Flujo automatizado de principio a fin para el proceso más repetitivo.",
  },
  {
    id: "recomendar",
    label: "Recomendar",
    emoji: "🎯",
    nombrePrefijo: "Motor de Recomendaciones",
    comoFunciona: (cat) =>
      `Una IA que aprende de los casos anteriores sobre ${cat} y sugiere el mejor siguiente paso para el equipo.`,
    mvp: "Base de casos históricos + recomendaciones contextuales.",
  },
];

export function getCategoria(id: CategoriaId) {
  return CATEGORIAS.find((c) => c.id === id)!;
}

export function getDificultad(id: DificultadId) {
  return DIFICULTADES.find((d) => d.id === id)!;
}

export function getAccion(id: AccionId) {
  return ACCIONES.find((a) => a.id === id)!;
}

export function getPais(id: string) {
  return PAISES.find((p) => p.id === id);
}
