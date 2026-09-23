"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  BarChart3,
  Globe2,
  LayoutDashboard,
  PenLine,
  ScrollText,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { ACCIONES, PAISES, ROOM_CODE } from "@/lib/data";
import type { AccionId, IdeaGenerada } from "@/lib/types";

type Paso = "bienvenida" | "pais" | "reto" | "accion" | "cargando" | "resultado" | "regional";

type Ejemplo = { pais: string; problema: string };

const ICONOS_ACCION: Record<AccionId, React.ComponentType<{ className?: string }>> = {
  buscar: Search,
  analizar: BarChart3,
  generar: Sparkles,
  resumir: ScrollText,
  automatizar: Zap,
  otro: PenLine,
};

export default function Home() {
  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [pais, setPais] = useState<string>("");
  const [problema, setProblema] = useState("");
  const [accion, setAccion] = useState<AccionId | null>(null);
  const [accionDetalle, setAccionDetalle] = useState("");
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
        body: JSON.stringify({
          room: ROOM_CODE,
          pais,
          problema,
          accion: id,
          accionDetalle: id === "otro" ? accionDetalle : undefined,
        }),
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
    setAccionDetalle("");
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
          <p className="text-xs tracking-[0.3em] uppercase text-black/40 font-semibold">CCK</p>
          <h1 className="text-2xl font-extrabold mt-1 brand-gradient-text">LAB</h1>
        </div>

        {pasoIndex >= 0 && (
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i <= pasoIndex ? "w-8 bg-[var(--blue)]" : "w-4 bg-black/10"
                }`}
              />
            ))}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 animate-fade-up">
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
                <p className="text-sm text-black/60">
                  En unos minutos vamos a compartir retos reales de nuestros
                  países y convertirlos en oportunidades para el LAB.
                </p>
              </div>

              <button
                onClick={() => setPaso("pais")}
                className="w-full rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
              >
                Empezar →
              </button>
            </div>
          )}

          {paso === "pais" && (
            <Pregunta
              titulo="¿De qué país venís?"
              subtitulo="Elegí tu país para continuar."
              onAtras={() => setPaso("bienvenida")}
            >
              <div className="grid grid-cols-2 gap-2.5">
                {PAISES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPais(p.id)}
                    className={`rounded-xl py-3 flex items-center gap-3 px-3 border transition-all ${
                      pais === p.id
                        ? "border-[var(--blue)] bg-[var(--blue-light)]"
                        : "border-[var(--card-border)] bg-white hover:bg-[var(--bg-soft)]"
                    }`}
                  >
                    <Image
                      src={p.flag}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                    />
                    <span className="text-sm font-semibold text-left">{p.nombre}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => pais && setPaso("reto")}
                disabled={!pais}
                className="w-full mt-4 rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Continuar →
              </button>
            </Pregunta>
          )}

          {paso === "reto" && (
            <Pregunta
              titulo="Si el LAB pudiera resolver una sola cosa para tu país, ¿qué sería?"
              subtitulo="Pensá en algo que hoy te genere tiempo, esfuerzo o dificultad."
              onAtras={() => setPaso("pais")}
            >
              <textarea
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                placeholder="Escribí tu reto en pocas palabras..."
                rows={4}
                maxLength={280}
                className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)] px-4 py-3 text-base outline-none focus:border-[var(--blue)] placeholder:text-black/30 resize-none"
              />
              <p className="text-[11px] text-black/30 text-right mt-1">
                {problema.length}/280
              </p>

              <button
                onClick={() => problema.trim() && setPaso("accion")}
                disabled={!problema.trim()}
                className="w-full mt-2 rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Continuar →
              </button>
            </Pregunta>
          )}

          {paso === "accion" && (
            <Pregunta
              titulo="¿Qué debería hacer la solución ideal?"
              subtitulo="Elegí la acción principal que necesitás."
              onAtras={() => setPaso("reto")}
            >
              <div className="grid grid-cols-2 gap-2.5">
                {ACCIONES.map((a) => {
                  const Icono = ICONOS_ACCION[a.id];
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAccion(a.id)}
                      disabled={enviando}
                      className={`rounded-xl p-4 flex flex-col items-center gap-2 border transition-all disabled:opacity-40 ${
                        accion === a.id
                          ? "border-[var(--blue)] bg-[var(--blue-light)]"
                          : "border-[var(--card-border)] bg-white hover:bg-[var(--bg-soft)]"
                      }`}
                    >
                      <Icono className="w-6 h-6 text-[var(--blue)]" />
                      <span className="text-sm font-semibold text-center leading-tight">
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {accion === "otro" && (
                <input
                  value={accionDetalle}
                  onChange={(e) => setAccionDetalle(e.target.value)}
                  placeholder="Contanos qué acción te gustaría..."
                  maxLength={80}
                  autoFocus
                  className="w-full mt-3 rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)] px-4 py-3 text-base outline-none focus:border-[var(--blue)] placeholder:text-black/30"
                />
              )}

              <button
                onClick={() => accion && verOportunidad(accion)}
                disabled={
                  !accion || enviando || (accion === "otro" && !accionDetalle.trim())
                }
                className="w-full mt-4 rounded-xl py-3.5 font-bold text-white bg-gradient-to-r from-[var(--blue)] to-[var(--blue-dark)] active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none"
              >
                Ver oportunidad →
              </button>
              {error && <p className="text-sm text-[var(--red)] mt-3">{error}</p>}
            </Pregunta>
          )}

          {paso === "cargando" && (
            <div className="py-14 flex flex-col items-center gap-4 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-black/10 border-t-[var(--blue)] animate-spin" />
              <p className="text-black/60 text-sm">Construyendo tu oportunidad...</p>
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
                className="w-full rounded-full py-3.5 font-bold bg-white border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--blue-light)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Globe2 className="w-5 h-5" />
                Ver oportunidad regional
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
                <p className="text-sm text-black/70">
                  Este mismo tipo de solución ya fue elegido en{" "}
                  <span className="font-bold text-black">{totalMatch} países</span>{" "}
                  durante esta sesión.
                </p>
              ) : (
                <p className="text-sm text-black/70">
                  Sos la primera persona en elegir este tipo de solución.
                  ¡Seguí atenta al tablero regional!
                </p>
              )}

              <div className="flex justify-center gap-2 flex-wrap">
                {paisesMatch.map((id) => {
                  const p = PAISES.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--blue-light)] pl-1.5 pr-3 py-1.5"
                    >
                      <Image src={p.flag} alt="" width={22} height={22} className="rounded-full" />
                      <span className="text-sm font-semibold text-[var(--blue-dark)]">
                        {p.nombre}
                      </span>
                    </span>
                  );
                })}
              </div>

              {ejemplos.length > 0 && (
                <div className="text-left space-y-2 pt-1">
                  <p className="text-[11px] uppercase tracking-wide text-black/40 font-bold">
                    Otros retos parecidos
                  </p>
                  {ejemplos.map((e, i) => {
                    const p = PAISES.find((x) => x.id === e.pais);
                    return (
                      <div
                        key={i}
                        className="rounded-lg bg-[var(--bg-soft)] border border-[var(--card-border)] px-3 py-2 text-sm text-black/70 flex items-start gap-2"
                      >
                        {p && (
                          <Image
                            src={p.flag}
                            alt=""
                            width={18}
                            height={18}
                            className="rounded-full mt-0.5 shrink-0"
                          />
                        )}
                        <span>&ldquo;{e.problema}&rdquo;</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href="/tablero"
                  className="w-full rounded-full py-3 font-semibold bg-white border border-[var(--card-border)] text-black/80 hover:bg-[var(--bg-soft)] transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--blue)]" />
                  Ver tablero en vivo
                </a>
                <button
                  onClick={reiniciar}
                  className="text-xs text-black/35 hover:text-black/60 transition-colors"
                >
                  Enviar otro reto
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-black/25 mt-6 font-semibold tracking-wide">
          LAB
        </p>
      </div>
    </main>
  );
}

function Pregunta({
  titulo,
  subtitulo,
  onAtras,
  children,
}: {
  titulo: string;
  subtitulo: string;
  onAtras?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {onAtras && (
        <button
          onClick={onAtras}
          className="inline-flex items-center gap-1 text-xs font-semibold text-black/40 hover:text-[var(--blue)] transition-colors -ml-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Atrás
        </button>
      )}
      <div>
        <h2 className="text-lg font-bold leading-snug">{titulo}</h2>
        <p className="text-sm text-black/55">{subtitulo}</p>
      </div>
      {children}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="border-l-2 border-[var(--blue)]/40 pl-3">
      <dt className="text-[11px] uppercase tracking-wide text-black/40 font-bold">{label}</dt>
      <dd className="text-black/80">{valor}</dd>
    </div>
  );
}
