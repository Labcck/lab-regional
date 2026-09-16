export type CategoriaId =
  | "investigacion"
  | "clientes"
  | "propuestas"
  | "contenido"
  | "crisis"
  | "procesos"
  | "conocimiento"
  | "otro";

export type DificultadId =
  | "encontrar"
  | "rapido"
  | "ordenar"
  | "crear"
  | "repetir";

export type AccionId = "buscar" | "analizar" | "crear" | "automatizar" | "recomendar";

export interface Respuesta {
  id: string;
  room: string;
  pais: string;
  categoria: CategoriaId;
  dificultad: DificultadId;
  accion: AccionId;
  nombre: string;
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

export interface ComboStat {
  categoria: CategoriaId;
  accion: AccionId;
  count: number;
  paises: string[];
}

export interface TableroData {
  totalParticipantes: number;
  totalCategorias: number;
  porCategoria: {
    categoria: CategoriaId;
    label: string;
    count: number;
    paises: string[];
  }[];
  oportunidadTop: {
    combo: ComboStat;
    idea: IdeaGenerada;
  } | null;
}
