"use client";

import { useState } from "react";
import { ACCIONES, PAISES, ROOM_CODE } from "@/lib/data";
import type { AccionId, IdeaGenerada } from "@/lib/types";

type Paso = "bienvenida" | "pais" | "reto" | "accion" | "cargando" | "resultado" | "regional";

type Ejemplo = { pais: string; problema: string };

export default function Home() {
  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [pais, setPais] = useState<string>("");
  const [problema, setProblema] = useState("");
  const [accion, setAccion] = useState<AccionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [idea, setIdea] = useState<IdeaGenerada | null>(null);
  const [paisesMatch, setPaisesMatch] = useState<string[]>([]);
  const [totalMatch, setTotalMatch] = useState(0);
  const [ejemplos, setEjemplos] = useState<Ejemplo[]>([]);

  async function verOportunidad(id: AccionId) {
    setAccion(id);
    setPaso("cargando");
    setEnviando(true);
    try {
      const res = await fetch("/api/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: ROOM_CODE, pais, problema, accion: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setIdea(data.idea);
      setPaisesMatch(data.paisesConMismaAccion || []);
      setTotalMatch(data.totalConMismaAccion || 0);
      setEjemplos(data.ejemplos || []);
      setPaso("resultado");
    } catch {
      setError("No se pudo conectar. Intentá de nuevo.");
      setPaso("accion");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setPaso("pais");
    setPais("");
    setProblema("");
    setAccion(null);
    setIdea(null);
    setPaisesMatch([]);
    setTotalMatch(0);
    setEjemplos([]);
  }

  const pasoIndex = ["pais", "reto", "accion"].indexOf(paso);

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
            <div className="space-y-5 text-center">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-[var(--orange)] font-bold">
                  Bienvenidos al taller
                </p>
                <h2 className="text-xl font-extrabold leading-snug">
                  ¿Qué debería construir el LAB para generar más valor en la
                  región?
                </h2>
                <p className="text-sm text-white/70">
                  En unos minutos vamos a compartir retos reales de nuestros
                  países y convertirlos en oportunidades para el LAB.
                </p>
              </div>

              <button
                onClick={() => setPaso("pais")}
                className="w-full rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--orange)] to-[var(--red)] shadow-lg shadow-red-900/30 active:scale-[0.98] transition-transform"
              >
                Empezar →
              </button>
            </div>
          )}

          {paso === "pais" && (
            <Pregunta titulo="¿De qué país venís?" subtitulo="Elegí tu país para continuar.">
              <div className="grid grid-cols-2 gap-2.5">
                {PAISES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPais(p.id)}
                    className={`rounded-xl py-3.5 flex items-center gap-2.5 px-3 border transition-all ${
                      pais === p.id
                        ? "border-[var(--orange)] bg-white/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl leading-none">{p.bandera}</span>
                    <span className="text-sm font-semibold text-left">{p.nombre}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => pais && setPaso("reto")}
                disabled={!pais}
                className="w-full mt-4 rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--orange)] to-[var(--red)] shadow-lg shadow-red-900/30 active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Continuar →
              </button>
            </Pregunta>
          )}

          {paso === "reto" && (
            <Pregunta
              titulo="Si el LAB pudiera resolver una sola cosa para tu país, ¿qué sería?"
              subtitulo="Pensá en algo que hoy te genere tiempo, esfuerzo o dificultad."
            >
              <textarea
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                placeholder="Escribí tu reto en pocas palabras..."
                rows={4}
                maxLength={280}
                className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-base outline-none focus:border-[var(--orange)] placeholder:text-white/35 resize-none"
              />
              <p className="text-[11px] text-white/35 text-right mt-1">
                {problema.length}/280
              </p>

              <button
                onClick={() => problema.trim() && setPaso("accion")}
                disabled={!problema.trim()}
                className="w-full mt-2 rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--orange)] to-[var(--red)] shadow-lg shadow-red-900/30 active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Continuar →
              </button>
            </Pregunta>
          )}

          {paso === "accion" && (
            <Pregunta
              titulo="¿Qué debería hacer la solución ideal?"
              subtitulo="Elegí la acción principal que necesitás."
            >
              <div className="grid grid-cols-2 gap-2.5">
                {ACCIONES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccion(a.id)}
                    disabled={enviando}
                    className={`rounded-xl p-4 flex flex-col items-center gap-1.5 border transition-all disabled:opacity-40 ${
                      accion === a.id
                        ? "border-[var(--orange)] bg-white/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="text-sm font-semibold text-center leading-tight">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => accion && verOportunidad(accion)}
                disabled={!accion || enviando}
                className="w-full mt-4 rounded-xl py-3.5 font-bold bg-gradient-to-r from-[var(--blue)] to-[var(--blue-dark)] active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Ver oportunidad →
              </button>
              {error && <p className="text-sm text-[var(--red)] mt-3">{error}</p>}
            </Pregunta>
          )}

          {paso === "cargando" && (
            <div className="py-14 flex flex-col items-center gap-4 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[var(--orange)] animate-spin" />
              <p className="text-white/70 text-sm">Construyendo tu oportunidad...</p>
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
                <Campo label="Reto" valor={idea.problema} />
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
                  Este mismo tipo de solución ya fue elegido en{" "}
                  <span className="font-bold text-white">{totalMatch} países</span>{" "}
                  durante esta sesión.
                </p>
              ) : (
                <p className="text-sm text-white/80">
                  Sos la primera persona en elegir este tipo de solución.
                  ¡Seguí atenta al tablero regional!
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

              {ejemplos.length > 0 && (
                <div className="text-left space-y-2 pt-1">
                  <p className="text-[11px] uppercase tracking-wide text-white/40 font-bold">
                    Otros retos parecidos
                  </p>
                  {ejemplos.map((e, i) => {
                    const p = PAISES.find((x) => x.id === e.pais);
                    return (
                      <div
                        key={i}
                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/75"
                      >
                        <span className="mr-1.5">{p?.bandera}</span>
                        &ldquo;{e.problema}&rdquo;
                      </div>
                    );
                  })}
                </div>
              )}

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

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="border-l-2 border-[var(--orange)]/50 pl-3">
      <dt className="text-[11px] uppercase tracking-wide text-white/40 font-bold">{label}</dt>
      <dd className="text-white/85">{valor}</dd>
    </div>
  );
}
