"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ProductionOrder, AggregatedStats } from "@/app/api/orders/route";

type SortKey = "macchina" | "ore_lavorate" | "tempo_produzione_min";

function insightText(value: number, label: string, positiveIsGood = true): string {
  if (positiveIsGood && value > 0) return `Risparmio del ${value.toFixed(1)}% rispetto allo standard di mercato`;
  if (!positiveIsGood && value > 95) return `Eccellente: il ${label} supera il 95%`;
  if (value > 80) return `Buono: ${label} al ${value}%`;
  return `Attenzione: ${label} al ${value}% — margine di miglioramento`;
}

function esitoColor(esito: string) {
  if (esito === "Superato") return { bg: "rgba(34,197,94,.12)", border: "rgba(34,197,94,.3)", text: "#4ade80" };
  if (esito === "Scarto") return { bg: "rgba(239,68,68,.12)", border: "rgba(239,68,68,.3)", text: "#f87171" };
  return { bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.3)", text: "#fbbf24" };
}

export default function OrdersDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("macchina");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.status === 401) { router.push("/login"); return; }
      if (data.ok) {
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch { /* network error */ } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const sortedOrders = [...orders].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "macchina") return a.macchina.localeCompare(b.macchina) * dir;
    return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="spin w-10 h-10 rounded-full border-2 border-[#c9a44c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* BI Stats Cards */}
      {stats && (
        <div className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <StatCard
              label="Ordini Totali"
              value={String(stats.totale_ordini)}
              insight={`${stats.tasso_superamento}% tasso di superamento`}
              icon="📦"
            />
            <StatCard
              label="Ore Lavorate"
              value={`${stats.ore_totali}h`}
              insight={`Media ${(stats.ore_totali / stats.totale_ordini).toFixed(1)}h per ordine`}
              icon="⏱️"
            />
            <StatCard
              label="Consumo Energetico"
              value={`${stats.consumo_totale_kwh} kWh`}
              insight={insightText(stats.risparmio_percentuale, "risparmio")}
              positive
              icon="⚡"
            />
            <StatCard
              label="Tempo Medio Ciclo"
              value={`${stats.tempo_medio_min} min`}
              insight="Ottimizzato rispetto allo standard di settore"
              icon="🔄"
            />
          </div>

          {/* Risparmio banner */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.15)" }}
          >
            <div className="text-3xl">📊</div>
            <div>
              <p className="text-sm font-semibold text-[#4ade80]">
                Risparmio energetico complessivo: {stats.risparmio_percentuale}%
              </p>
              <p className="text-xs text-[#8899b4] mt-1">
                Le nostre macchine ottimizzate consumano {stats.consumo_totale_kwh} kWh contro i {stats.consumo_standard_totale_kwh} kWh
                dello standard di mercato. L&apos;integrazione Industria 4.0 e il monitoraggio HMI in tempo reale
                permettono di ridurre gli sprechi e massimizzare l&apos;efficienza produttiva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Per-Machine Breakdown */}
      {stats && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-0.5" style={{ background: "#c9a44c" }} />
            Analisi per Macchina
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.per_macchina.map((m) => (
              <div
                key={m.macchina}
                className="glow-card rounded-xl p-4"
              >
                <p className="text-xs text-[#8899b4] mb-1">{m.macchina}</p>
                <p className="text-xl font-black" style={{ color: "#c9a44c" }}>{m.ordini} ordini</p>
                <div className="mt-3 space-y-1.5">
                  <MiniStat label="Ore" value={`${m.ore}h`} />
                  <MiniStat label="Consumo" value={`${m.consumo_kwh} kWh`} />
                  <MiniStat label="Risparmio" value={`${m.risparmio_pct}%`} positive={m.risparmio_pct > 0} />
                  <MiniStat label="Qualità" value={`${m.tasso_superamento}%`} positive={m.tasso_superamento > 80} />
                </div>
                {m.risparmio_pct > 10 && (
                  <p className="mt-2 text-[10px] text-[#4ade80] leading-tight">
                    ✓ Efficienza superiore: {m.risparmio_pct}% di risparmio energetico
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#8899b4] uppercase tracking-wider mr-2">Ordina per:</span>
        {([
          ["macchina", "Macchina"],
          ["ore_lavorate", "Ore Lavorate"],
          ["tempo_produzione_min", "Tempo Produzione"],
        ] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortKey === key ? "text-[#060910]" : "text-[#8899b4] hover:text-white"
            }`}
            style={
              sortKey === key
                ? { background: "linear-gradient(135deg,#c9a44c,#a88630)" }
                : { background: "rgba(201,164,76,.06)", border: "1px solid rgba(201,164,76,.12)" }
            }
          >
            {label}{sortIcon(key)}
          </button>
        ))}
      </div>

      {/* Orders Table/Cards */}
      <div className="glow-card rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="dash-table w-full text-sm">
            <thead>
              <tr>
                <th>Codice</th>
                <th className="cursor-pointer" onClick={() => handleSort("macchina")}>
                  Macchina{sortIcon("macchina")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("ore_lavorate")}>
                  Ore{sortIcon("ore_lavorate")}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort("tempo_produzione_min")}>
                  Tempo (min){sortIcon("tempo_produzione_min")}
                </th>
                <th>Consumo</th>
                <th>Esito</th>
                <th>Data</th>
                <th>Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const ec = esitoColor(order.esito);
                return (
                  <tr key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="font-mono text-xs">{order.codice_ordine}</td>
                    <td className="font-medium text-white">{order.macchina}</td>
                    <td>{order.ore_lavorate}h</td>
                    <td>{order.tempo_produzione_min} min</td>
                    <td>
                      <span>{order.consumo_kwh} kWh</span>
                      {order.consumo_kwh < order.consumo_standard_kwh && (
                        <span className="ml-1.5 text-[10px] text-[#4ade80]">
                          ↓{((1 - order.consumo_kwh / order.consumo_standard_kwh) * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: ec.bg, border: `1px solid ${ec.border}`, color: ec.text }}
                      >
                        {order.esito}
                      </span>
                    </td>
                    <td className="text-xs">{order.data_produzione}</td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="px-3 py-1 rounded text-xs font-semibold text-[#060910]"
                        style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
                      >
                        Apri
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid gap-3 p-4">
          {sortedOrders.map((order) => {
            const ec = esitoColor(order.esito);
            return (
              <div
                key={order.id}
                className="rounded-xl border p-4 cursor-pointer transition-all hover:border-[#c9a44c]/30"
                style={{ borderColor: "rgba(201,164,76,.12)", background: "rgba(255,255,255,.03)" }}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.macchina}</p>
                    <p className="text-xs text-[#8899b4] font-mono">{order.codice_ordine}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ background: ec.bg, border: `1px solid ${ec.border}`, color: ec.text }}
                  >
                    {order.esito}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-[#8899b4]">Ore</p>
                    <p className="text-white font-medium">{order.ore_lavorate}h</p>
                  </div>
                  <div>
                    <p className="text-[#8899b4]">Tempo</p>
                    <p className="text-white font-medium">{order.tempo_produzione_min} min</p>
                  </div>
                  <div>
                    <p className="text-[#8899b4]">Consumo</p>
                    <p className="text-white font-medium">{order.consumo_kwh} kWh</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, insight, icon, positive }: {
  label: string; value: string; insight: string; icon: string; positive?: boolean;
}) {
  return (
    <div className="glow-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#8899b4] uppercase tracking-wider">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-black" style={{ color: "#c9a44c" }}>{value}</p>
      <p className={`text-[11px] mt-2 leading-tight ${positive ? "text-[#4ade80]" : "text-[#8899b4]"}`}>
        {positive && "✓ "}{insight}
      </p>
    </div>
  );
}

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#8899b4]">{label}</span>
      <span className={positive ? "text-[#4ade80] font-medium" : "text-white"}>{value}</span>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: ProductionOrder; onClose: () => void }) {
  const ec = esitoColor(order.esito);
  const risparmio = ((1 - order.consumo_kwh / order.consumo_standard_kwh) * 100).toFixed(1);
  const isEfficient = order.consumo_kwh < order.consumo_standard_kwh;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: "#0c1120", border: "1px solid rgba(201,164,76,.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <p className="text-xs text-[#8899b4] font-mono">{order.codice_ordine}</p>
            <h2 className="text-xl font-black text-white mt-1">{order.macchina}</h2>
            <p className="text-xs text-[#8899b4] mt-1">
              Lotto {order.lotto} · Operatore: {order.operatore} · {order.data_produzione}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8899b4] hover:text-white text-2xl leading-none p-1">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Machine Image */}
          <div
            className="rounded-xl p-6 flex items-center justify-center"
            style={{ background: "rgba(201,164,76,.04)", border: "1px solid rgba(201,164,76,.1)" }}
          >
            <Image
              src={order.immagine_macchina}
              alt={order.macchina}
              width={120}
              height={120}
              className="opacity-90"
            />
          </div>

          {/* Esito */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: ec.bg, border: `1px solid ${ec.border}` }}
          >
            <div className="text-2xl">
              {order.esito === "Superato" ? "✅" : order.esito === "Scarto" ? "❌" : "⚠️"}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: ec.text }}>Esito: {order.esito}</p>
              <p className="text-xs text-[#8899b4] mt-0.5">
                {order.esito === "Superato"
                  ? "Il ciclo produttivo è stato completato con successo entro i parametri di qualità."
                  : order.esito === "Scarto"
                  ? "Il prodotto non ha superato i controlli qualità e deve essere riprocessato."
                  : "Sono necessari controlli aggiuntivi prima dell'approvazione finale."}
              </p>
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <h3 className="text-xs font-bold text-[#c9a44c] uppercase tracking-wider mb-3">Descrizione Tecnica</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <SpecCard
                label="Consumo Energetico"
                value={`${order.consumo_kwh} kWh`}
                detail={`Standard mercato: ${order.consumo_standard_kwh} kWh`}
                insight={
                  isEfficient
                    ? `✓ Risparmio del ${risparmio}% rispetto allo standard`
                    : `Consumo allineato allo standard di settore`
                }
                positive={isEfficient}
              />
              <SpecCard
                label="Durata Ciclo Produzione"
                value={`${order.tempo_produzione_min} minuti`}
                detail={`${order.ore_lavorate} ore di lavoro effettivo`}
                insight="Tempo ottimizzato grazie al monitoraggio HMI real-time"
              />
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-bold text-[#c9a44c] uppercase tracking-wider mb-3">Risorse Utilizzate</h3>
            <div className="flex flex-wrap gap-2">
              {order.risorse_utilizzate.map((r) => (
                <span
                  key={r}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: "rgba(201,164,76,.08)", border: "1px solid rgba(201,164,76,.15)" }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Cycle Description */}
          <div>
            <h3 className="text-xs font-bold text-[#c9a44c] uppercase tracking-wider mb-3">Ciclo di Produzione</h3>
            <p className="text-sm text-[#8899b4] leading-relaxed">{order.descrizione_ciclo}</p>
          </div>

          {/* Storytelling Insight */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(201,164,76,.04)", border: "1px solid rgba(201,164,76,.1)" }}
          >
            <p className="text-xs font-bold text-[#c9a44c] uppercase tracking-wider mb-2">💡 Interpretazione Dati</p>
            <p className="text-xs text-[#8899b4] leading-relaxed">
              {isEfficient ? (
                <>
                  Questo ordine ha registrato un <span className="text-[#4ade80] font-semibold">risparmio del {risparmio}%</span> sui
                  consumi energetici rispetto alla media di settore. L&apos;ottimizzazione è resa possibile dall&apos;integrazione
                  dei dati di produzione con il sistema HMI, che consente all&apos;operatore di intervenire in tempo reale
                  sui parametri della macchina, riducendo sprechi e tempi morti.
                </>
              ) : (
                <>
                  Il consumo energetico è in linea con lo standard. Il sistema di monitoraggio continuo rileva
                  automaticamente le anomalie di processo, garantendo la qualità del prodotto e facilitando
                  la cooperazione tra i diversi reparti attraverso l&apos;integrazione verticale dei dati.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ label, value, detail, insight, positive }: {
  label: string; value: string; detail: string; insight: string; positive?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(201,164,76,.1)" }}
    >
      <p className="text-xs text-[#8899b4] mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-[#8899b4] mt-1">{detail}</p>
      <p className={`text-[10px] mt-2 ${positive ? "text-[#4ade80]" : "text-[#8899b4]"}`}>{insight}</p>
    </div>
  );
}
