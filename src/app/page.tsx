"use client";

import { useState } from "react";
import { ACCIONES, CATEGORIAS, DIFICULTADES, PAISES, ROOM_CODE } from "@/lib/data";
import type { AccionId, CategoriaId, DificultadId, IdeaGenerada } from "@/lib/types";

type Paso =
  | "bienvenida"
  | "reto"
  | "dificultad"
  | "accion"
  | "cargando"
  | "resultado"
  | "regional";

export default function Home() {
  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [codigo, setCodigo] = useState("");
  const [pais, setPais] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [categoria, setCategoria] = useState<CategoriaId | null>(null);
  const [dificultad, setDificultad] = useState<DificultadId | null>(null);
  const [accion, setAccion] = useState<AccionId | null>(null);

  const [idea, setIdea] = useState<IdeaGenerada | null>(null);
  const [paisesMatch, setPaisesMatch] = useState<string[]>([]);
  const [totalMatch, setTotalMatch] = useState(0);
  const [enviando, setEnviando] = useState(false);

  function entrar() {
    setError(null);
    if (codigo.trim().toUpperCase() !== ROOM_CODE) {
      setError("Código incorrecto. Verificá con el facilitador del LAB.");
      return;
    }
    if (!pais) {
      setError("Elegí tu país para continuar.");
      return;
    }
    setPaso("reto");
  }

  function elegirCategoria(id: CategoriaId) {
    setCategoria(id);
    setPaso("dificultad");
  }

  function elegirDificultad(id: DificultadId) {
    setDificultad(id);
    setPaso("accion");
  }

  async function elegirAccion(id: AccionId) {
    setAccion(id);
    setPaso("cargando");
    setEnviando(true);
    try {
      const res = await fetch("/api/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: ROOM_CODE,
          pais,
          categoria,
          dificultad,
          accion: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setIdea(data.idea);
      setPaisesMatch(data.paisesConMismaCategoria || []);
      setTotalMatch(data.totalConMismaCategoria || 0);
      setPaso("resultado");
    } catch {
      setError("No se pudo conectar. Intentá de nuevo.");
      setPaso("accion");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setPaso("reto");
    setCategoria(null);
    setDificultad(null);
    setAccion(null);
    setIdea(null);
    setPaisesMatch([]);
    setTotalMatch(0);
  }

  const pasoIndex = ["reto", "dificultad", "accion"].indexOf(paso);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase text-white/50 font-semibold">
            CCK · Regional AI Lab
          </p>
          <h1 className="text-2xl font-extrabold mt-1">
            LAB <span className="brand-gradient-text">Regional</span>
          </h1>
        </div>

        {pasoIndex >= 0 && (
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i <= pasoIndex ? "w-8 bg-[var(--orange)]" : "w-4 bg-white/15"
                }`}
              />
            ))}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 shadow-2xl animate-fade-up">
          {paso === "bienvenida" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1">Construyamos la próxima solución</h2>
                <p className="text-sm text-white/70">
                  Respondé 3 preguntas rápidas sobre tu reto. Entre todas las
                  personas iremos construyendo el mapa de oportunidades
                  regionales del LAB.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80 block mb-1.5">
                  Código de acceso
                </label>
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Pedile el código al facilitador"
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-base outline-none focus:border-[var(--orange)] placeholder:text-white/35"
                  autoCapitalize="characters"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80 block mb-1.5">
                  Tu país
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PAISES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPais(p.id)}
                      className={`rounded-xl py-2.5 flex flex-col items-center gap-0.5 border transition-all ${
                        pais === p.id
                          ? "border-[var(--orange)] bg-white/15 scale-105"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                      title={p.nombre}
                    >
                      <span className="text-2xl leading-none">{p.bandera}</span>
                      <span className="text-[10px] font-semibold text-white/50">{p.id}</span>
                    </button>
                  ))}
                </div>
                {pais && (
                  <p className="text-xs text-white/50 mt-1.5">
                    {PAISES.find((p) => p.id === pais)?.nombre}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-[var(--red)]">{error}</p>}

              <button
                onClick={entrar}
                className="w-full rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--orange)] to-[var(--red)] shadow-lg shadow-red-900/30 active:scale-[0.98] transition-transform"
              >
                Entrar al LAB →
              </button>
            </div>
          )}

          {paso === "reto" && (
            <Pregunta
              titulo="¿Dónde tenés el mayor reto?"
              subtitulo="Elegí el área donde hoy sentís más fricción."
            >
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIAS.map((c) => (
                  <OpcionGrande
                    key={c.id}
                    emoji={c.emoji}
                    label={c.label}
                    onClick={() => elegirCategoria(c.id)}
                  />
                ))}
              </div>
            </Pregunta>
          )}

          {paso === "dificultad" && (
            <Pregunta
              titulo="¿Qué es lo que más te cuesta?"
              subtitulo="Pensá en tu día a día actual."
            >
              <div className="flex flex-col gap-2.5">
                {DIFICULTADES.map((d) => (
                  <OpcionFila
                    key={d.id}
                    emoji={d.emoji}
                    label={d.label}
                    onClick={() => elegirDificultad(d.id)}
                  />
                ))}
              </div>
            </Pregunta>
          )}

          {paso === "accion" && (
            <Pregunta
              titulo="¿Qué te gustaría que hiciera la IA?"
              subtitulo="Elegí la acción principal que necesitás."
            >
              <div className="grid grid-cols-2 gap-2.5">
                {ACCIONES.map((a) => (
                  <OpcionGrande
                    key={a.id}
                    emoji={a.emoji}
                    label={a.label}
                    onClick={() => elegirAccion(a.id)}
                    disabled={enviando}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-[var(--red)] mt-3">{error}</p>}
            </Pregunta>
          )}

          {paso === "cargando" && (
            <div className="py-14 flex flex-col items-center gap-4 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[var(--orange)] animate-spin" />
              <p className="text-white/70 text-sm">Construyendo tu idea...</p>
            </div>
          )}

          {paso === "resultado" && idea && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--orange)] font-bold mb-1">
                  Tu oportunidad
                </p>
                <h2 className="text-xl font-extrabold leading-tight">{idea.nombreIdea}</h2>
              </div>

              <dl className="space-y-3 text-sm">
                <Campo label="Problema" valor={idea.problema} />
                <Campo label="Usuario" valor={idea.usuario} />
                <Campo label="Cómo funcionaría" valor={idea.comoFunciona} />
                <Campo label="Beneficio" valor={idea.beneficio} />
                <Campo label="Primer MVP" valor={idea.mvp} />
              </dl>

              <button
                onClick={() => setPaso("regional")}
                className="w-full rounded-xl py-3.5 font-bold bg-gradient-to-r from-[var(--blue)] to-[var(--blue-dark)] active:scale-[0.98] transition-transform"
              >
                Hacerla regional →
              </button>
            </div>
          )}

          {paso === "regional" && idea && (
            <div className="space-y-4 text-center animate-fade-up">
              <p className="text-xs uppercase tracking-widest text-[var(--orange)] font-bold">
                Oportunidad regional
              </p>
              <h2 className="text-xl font-extrabold">{idea.nombreIdea}</h2>

              {totalMatch > 1 ? (
                <p className="text-sm text-white/80">
                  Este mismo reto ya fue identificado en{" "}
                  <span className="font-bold text-white">{totalMatch} países</span>{" "}
                  durante esta sesión.
                </p>
              ) : (
                <p className="text-sm text-white/80">
                  Sos la primera persona en identificar este reto. ¡Seguí
                  atenta al tablero regional!
                </p>
              )}

              <div className="flex justify-center gap-2 flex-wrap">
                {paisesMatch.map((id) => {
                  const p = PAISES.find((x) => x.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"
                    >
                      <span className="text-2xl leading-none">{p?.bandera}</span>
                      <span className="text-sm font-semibold text-white/80">{id}</span>
                    </span>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href="/tablero"
                  className="w-full rounded-xl py-3 font-semibold border border-white/20 text-white/90 hover:bg-white/5 transition-colors"
                >
                  Ver tablero regional en vivo
                </a>
                <button
                  onClick={reiniciar}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Enviar otro reto
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">
          Una dinámica de{" "}
          <span className="text-white/50 font-semibold">Regional AI Lab · CCK</span>
        </p>
      </div>
    </main>
  );
}

function Pregunta({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold leading-snug">{titulo}</h2>
        <p className="text-sm text-white/60">{subtitulo}</p>
      </div>
      {children}
    </div>
  );
}

function OpcionGrande({
  emoji,
  label,
  onClick,
  disabled,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl p-4 flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all disabled:opacity-40"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-center leading-tight">{label}</span>
    </button>
  );
}

function OpcionFila({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-4 py-3.5 flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-all text-left"
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-semibold capitalize">{label}</span>
    </button>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="border-l-2 border-[var(--orange)]/50 pl-3">
      <dt className="text-[11px] uppercase tracking-wide text-white/40 font-bold">{label}</dt>
      <dd className="text-white/85">{valor}</dd>
    </div>
  );
}
