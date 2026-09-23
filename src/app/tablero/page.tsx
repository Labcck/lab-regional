"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Download,
  PenLine,
  ScrollText,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { ACCIONES, PAISES, ROOM_CODE } from "@/lib/data";
import type { AccionId, TableroData } from "@/lib/types";

type PaisInfo = { id: string; nombre: string; flag: string };

const ICONOS_ACCION: Record<AccionId, React.ComponentType<{ className?: string }>> = {
  buscar: Search,
  analizar: BarChart3,
  generar: Sparkles,
  resumir: ScrollText,
  automatizar: Zap,
  otro: PenLine,
};

function pais(id: string) {
  return PAISES.find((p) => p.id === id);
}

function IconoAccion({ id, className }: { id: string; className?: string }) {
  const Icono = ICONOS_ACCION[id as AccionId];
  if (!Icono) return null;
  return <Icono className={className} />;
}

function etiquetaAccion(a: { label: string; detalles?: string[] }) {
  return a.detalles && a.detalles.length > 0 ? a.detalles.join(", ") : a.label;
}

function horaCorta(ts: number) {
  return new Date(ts).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
}

export default function Tablero() {
  const [data, setData] = useState<(TableroData & { paisesInfo: PaisInfo[] }) | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarReset, setMostrarReset] = useState(false);
  const [pin, setPin] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const res = await fetch(`/api/tablero?room=${ROOM_CODE}`, { cache: "no-store" });
        const json = await res.json();
        if (activo) setData(json);
      } catch {
        // silencioso: se reintenta en el próximo ciclo
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    const id = setInterval(cargar, 4000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, []);

  async function reset() {
    setResetMsg(null);
    const res = await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: ROOM_CODE, pin }),
    });
    if (res.ok) {
      setResetMsg("Sesión reiniciada.");
      setMostrarReset(false);
      setPin("");
      setData(null);
      setCargando(true);
    } else {
      const json = await res.json().catch(() => ({}));
      setResetMsg(json.error || "No se pudo reiniciar.");
    }
  }

  async function borrarRespuesta(id: string) {
    if (!confirm("¿Borrar esta respuesta?")) return;
    await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: ROOM_CODE, id }),
    });
    setData((d) => (d ? { ...d, respuestas: d.respuestas.filter((r) => r.id !== id) } : d));
  }

  const maxCount = data?.porAccion[0]?.count ?? 1;

  return (
    <main className="flex-1 px-6 py-10 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-black/40 font-semibold">CCK</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">
              Mapa de Oportunidades <span className="brand-gradient-text">en vivo</span>
            </h1>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-3xl font-extrabold text-[var(--blue)]">
                {data?.totalParticipantes ?? 0}
              </p>
              <p className="text-xs text-black/50">participantes</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[var(--blue)]">
                {data?.totalPaises ?? 0}
              </p>
              <p className="text-xs text-black/50">países</p>
            </div>
          </div>
        </div>

        {cargando && !data && <p className="text-black/50 text-sm">Cargando tablero...</p>}

        {data && data.respuestas.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-black/60">
              Todavía no hay respuestas. Compartí el enlace de la dinámica con
              las participantes para que empiecen desde su celular.
            </p>
          </div>
        )}

        {data && data.porAccion.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-[var(--blue)]/30 animate-fade-up">
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--orange)] font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Oportunidad regional priorizada
            </p>
            <h2 className="text-xl font-extrabold mb-1 inline-flex items-center gap-2">
              <IconoAccion id={data.porAccion[0].accion} className="w-5 h-5 text-[var(--blue)]" />
              {etiquetaAccion(data.porAccion[0])}
            </h2>
            <p className="text-sm text-black/60 mb-3">
              Es el tipo de solución que más veces se repitió durante la
              sesión — la primera candidata para que el LAB la explore.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                {data.porAccion[0].paises.map((id) => {
                  const p = pais(id);
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--blue-light)] pl-1.5 pr-3 py-1 text-sm"
                    >
                      <Image src={p.flag} alt="" width={18} height={18} className="rounded-full" />
                      <span className="text-[var(--blue-dark)] font-semibold">{id}</span>
                    </span>
                  );
                })}
              </div>
              <span className="text-sm text-black/50">
                {data.porAccion[0].count} respuestas · {data.porAccion[0].paises.length} países
              </span>
            </div>
          </div>
        )}

        {data && data.porAccion.length > 0 && (
          <div className="glass-card rounded-2xl overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-black/45 text-xs uppercase tracking-wide border-b border-[var(--card-border)]">
                  <th className="px-5 py-3 font-semibold">Tipo de solución</th>
                  <th className="px-5 py-3 font-semibold">Países</th>
                  <th className="px-5 py-3 font-semibold w-1/3">Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.porAccion.map((a) => (
                  <tr key={a.accion} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="px-5 py-3.5 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <IconoAccion id={a.accion} className="w-4 h-4 text-[var(--blue)] shrink-0" />
                        {etiquetaAccion(a)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {a.paises.map((id) => {
                          const p = pais(id);
                          if (!p) return null;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--blue-light)] pl-1 pr-2 py-0.5 text-xs"
                            >
                              <Image
                                src={p.flag}
                                alt=""
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                              <span className="text-[var(--blue-dark)] font-semibold">{id}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-3 rounded-full bg-[var(--bg-soft)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] transition-all duration-700"
                          style={{ width: `${Math.max(8, (a.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.respuestas.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-[var(--orange)] font-bold">
                Retos compartidos en vivo
              </p>
              <a
                href={`/api/export?room=${ROOM_CODE}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:text-[var(--blue-dark)] border border-[var(--card-border)] rounded-full px-3 py-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar CSV
              </a>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {data.respuestas.map((r) => {
                const p = pais(r.pais);
                return (
                  <div
                    key={r.id}
                    className="rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)] px-4 py-3 flex items-start gap-3"
                  >
                    {p && (
                      <Image
                        src={p.flag}
                        alt=""
                        width={20}
                        height={20}
                        className="rounded-full mt-0.5 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black/80">{r.problema}</p>
                      <p className="text-[11px] text-black/40 mt-1 inline-flex items-center gap-1">
                        <IconoAccion id={r.accion} className="w-3 h-3" />
                        {r.accion === "otro" && r.accionDetalle
                          ? r.accionDetalle
                          : ACCIONES.find((a) => a.id === r.accion)?.label}{" "}
                        · {r.pais} · {horaCorta(r.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => borrarRespuesta(r.id)}
                      title="Borrar esta respuesta"
                      className="shrink-0 text-black/25 hover:text-[var(--red)] transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <p className="text-[11px] text-black/30">
            Se actualiza automáticamente cada 4 segundos · Código de sesión:{" "}
            {ROOM_CODE}
          </p>
          <button
            onClick={() => setMostrarReset((v) => !v)}
            className="text-[11px] text-black/30 hover:text-black/60 transition-colors"
          >
            Reiniciar sesión
          </button>
        </div>

        {mostrarReset && (
          <div className="mt-3 glass-card rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN del facilitador (si aplica)"
              className="rounded-lg bg-[var(--bg-soft)] border border-[var(--card-border)] px-3 py-2 text-sm outline-none focus:border-[var(--blue)]"
            />
            <button
              onClick={reset}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[var(--red)] hover:bg-[var(--red-dark)] transition-colors"
            >
              Confirmar reinicio
            </button>
            {resetMsg && <span className="text-xs text-black/60">{resetMsg}</span>}
          </div>
        )}
      </div>
    </main>
  );
}
