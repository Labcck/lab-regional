"use client";

import { useEffect, useState } from "react";
import { CATEGORIAS, PAISES, ROOM_CODE } from "@/lib/data";
import type { TableroData } from "@/lib/types";

type PaisInfo = { id: string; nombre: string; bandera: string };

function bandera(id: string) {
  return PAISES.find((p) => p.id === id)?.bandera ?? "🏳️";
}

function emojiCategoria(id: string) {
  return CATEGORIAS.find((c) => c.id === id)?.emoji ?? "💡";
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

  const maxCount = data?.porCategoria[0]?.count ?? 1;

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
              <p className="text-3xl font-extrabold">{data?.totalCategorias ?? 0}</p>
              <p className="text-xs text-white/50">oportunidades</p>
            </div>
          </div>
        </div>

        {cargando && !data && (
          <p className="text-white/50 text-sm">Cargando tablero...</p>
        )}

        {data && data.porCategoria.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-white/70">
              Todavía no hay respuestas. Pedile a las participantes que
              entren con el código{" "}
              <span className="font-bold text-white">{ROOM_CODE}</span> en
              sus teléfonos.
            </p>
          </div>
        )}

        {data && data.oportunidadTop && (
          <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-[var(--orange)]/40 animate-fade-up">
            <p className="text-xs uppercase tracking-widest text-[var(--orange)] font-bold mb-2">
              🏆 Oportunidad regional priorizada
            </p>
            <h2 className="text-2xl font-extrabold mb-3">
              {data.oportunidadTop.idea.nombreIdea}
            </h2>
            <p className="text-sm text-white/75 mb-4 max-w-2xl">
              {data.oportunidadTop.idea.comoFunciona}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {data.oportunidadTop.combo.paises.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-sm"
                  >
                    <span className="text-lg leading-none">{bandera(id)}</span>
                    <span className="text-white/70 font-semibold">{id}</span>
                  </span>
                ))}
              </div>
              <span className="text-sm text-white/60">
                {data.oportunidadTop.combo.count} respuestas ·{" "}
                {data.oportunidadTop.combo.paises.length} países
              </span>
            </div>
          </div>
        )}

        {data && data.porCategoria.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 text-xs uppercase tracking-wide border-b border-white/10">
                  <th className="px-5 py-3 font-semibold">Reto</th>
                  <th className="px-5 py-3 font-semibold">Países</th>
                  <th className="px-5 py-3 font-semibold w-1/3">Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.porCategoria.map((c) => (
                  <tr key={c.categoria} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                      <span className="mr-2">{emojiCategoria(c.categoria)}</span>
                      {c.label}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.paises.map((id) => (
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
                          style={{ width: `${Math.max(8, (c.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
