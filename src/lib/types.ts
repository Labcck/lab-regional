export type AccionId = "buscar" | "analizar" | "generar" | "resumir" | "automatizar" | "otro";

export interface Respuesta {
  id: string;
  room: string;
  pais: string;
  problema: string;
  accion: AccionId;
  accionDetalle?: string;
  createdAt: number;
}

export interface IdeaGenerada {
  nombreIdea: string;
  problema: string;
  usuario: string;
  comoFunciona: string;
  beneficio: string;
  mvp: string;
}

export interface AccionStat {
  accion: AccionId;
  label: string;
  count: number;
  paises: string[];
}

export interface TableroData {
  totalParticipantes: number;
  totalPaises: number;
  porAccion: AccionStat[];
  respuestas: {
    id: string;
    pais: string;
    problema: string;
    accion: AccionId;
    accionDetalle?: string;
    createdAt: number;
  }[];
}
