"use client";

import { useEffect, useState } from "react";
import { ACCIONES, PAISES, ROOM_CODE } from "@/lib/data";
import type { TableroData } from "@/lib/types";

type PaisInfo = { id: string; nombre: string; bandera: string };

function bandera(id: string) {
  return PAISES.find((p) => p.id === id)?.bandera ?? "🏳️";
}

function emojiAccion(id: string) {
  return ACCIONES.find((a) => a.id === id)?.emoji ?? "💡";
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
    } else {
      const json = await res.json().catch(() => ({}));
      setResetMsg(json.error || "No se pudo reiniciar.");
    }
  }

  const maxCount = data?.porAccion[0]?.count ?? 1;

  return (
    <main className="flex-1 px-6 py-10 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/50 font-semibold">
              CCK · Regional AI Lab
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">
              Mapa de Oportunidades <span className="brand-gradient-text">en vivo</span>
            </h1>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-3xl font-extrabold">{data?.totalParticipantes ?? 0}</p>
              <p className="text-xs text-white/50">participantes</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{data?.totalPaises ?? 0}</p>
              <p className="text-xs text-white/50">países</p>
            </div>
          </div>
        </div>

        {cargando && !data && <p className="text-white/50 text-sm">Cargando tablero...</p>}

        {data && data.respuestas.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-white/70">
              Todavía no hay respuestas. Compartí el enlace de la dinámica con
              las participantes para que empiecen desde su celular.
            </p>
          </div>
        )}

        {data && data.porAccion.length > 0 && (
          <div className="glass-card rounded-2xl overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-white/50 text-xs uppercase tracking-wide border-b border-white/10">
                  <th className="px-5 py-3 font-semibold">Tipo de solución</th>
                  <th className="px-5 py-3 font-semibold">Países</th>
                  <th className="px-5 py-3 font-semibold w-1/3">Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.porAccion.map((a) => (
                  <tr key={a.accion} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                      <span className="mr-2">{emojiAccion(a.accion)}</span>
                      {a.label}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {a.paises.map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs"
                          >
                            <span className="text-base leading-none">{bandera(id)}</span>
                            <span className="text-white/70 font-semibold">{id}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--orange)] to-[var(--red)] transition-all duration-700"
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
                className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 rounded-full px-3 py-1 transition-colors"
              >
                Descargar CSV
              </a>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {data.respuestas.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-start gap-3"
                >
                  <span className="text-xl leading-none mt-0.5">{bandera(r.pais)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/85">{r.problema}</p>
                    <p className="text-[11px] text-white/40 mt-1">
                      {emojiAccion(r.accion)} {ACCIONES.find((a) => a.id === r.accion)?.label} ·{" "}
                      {r.pais} · {horaCorta(r.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <p className="text-[11px] text-white/25">
            Se actualiza automáticamente cada 4 segundos · Código de sesión:{" "}
            {ROOM_CODE}
          </p>
          <button
            onClick={() => setMostrarReset((v) => !v)}
            className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
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
              className="rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm outline-none focus:border-[var(--orange)]"
            />
            <button
              onClick={reset}
              className="rounded-lg px-4 py-2 text-sm font-semibold bg-[var(--red)] hover:bg-[var(--red-dark)] transition-colors"
            >
              Confirmar reinicio
            </button>
            {resetMsg && <span className="text-xs text-white/60">{resetMsg}</span>}
          </div>
        )}
      </div>
    </main>
  );
}
