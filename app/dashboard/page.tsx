"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrdersDashboard from "@/components/OrdersDashboard";

type Row = Record<string, unknown>;
type Column = { Field: string; Key: string; Null: string; Type: string; Default?: unknown };
type StatItem = { table: string; count: number };
type View = "overview" | "ordini" | "macchine" | "view" | "add" | "edit" | "delete" | "drop" | "vpn";
type MachineStatus = "active" | "maintenance" | "offline";

interface MachineSpec {
  name: string;
  abbr: string;
  basePowerKw: number;
  baseConsumptionKwh: number;
  maxTempC: number;
}

interface MachineConfig {
  power: number;   // 0–100 %
  status: MachineStatus;
}

const MACHINE_SPECS: MachineSpec[] = [
  { name: "CNC Fresatrice 5-Assi", abbr: "CN", basePowerKw: 7.5,  baseConsumptionKwh: 3.2, maxTempC: 85  },
  { name: "Pick & Place SMT",       abbr: "PP", basePowerKw: 2.1,  baseConsumptionKwh: 1.8, maxTempC: 45  },
  { name: "Reflow Oven IR",         abbr: "RF", basePowerKw: 12.0, baseConsumptionKwh: 4.8, maxTempC: 260 },
  { name: "AOI Saki BF-Comet",      abbr: "AO", basePowerKw: 0.8,  baseConsumptionKwh: 0.6, maxTempC: 40  },
  { name: "Stampante 3D SLS",       abbr: "3D", basePowerKw: 3.5,  baseConsumptionKwh: 2.8, maxTempC: 200 },
  { name: "Laser Cutter CO₂",       abbr: "LC", basePowerKw: 5.0,  baseConsumptionKwh: 3.5, maxTempC: 60  },
  { name: "Saldatrice a Onda",      abbr: "SW", basePowerKw: 8.0,  baseConsumptionKwh: 4.2, maxTempC: 250 },
  { name: "Flying Probe Tester",    abbr: "FP", basePowerKw: 0.5,  baseConsumptionKwh: 0.4, maxTempC: 35  },
];

const MS_LABEL:  Record<MachineStatus, string> = { active: "Attiva", maintenance: "Manutenzione", offline: "Offline" };
const MS_COLOR:  Record<MachineStatus, string> = { active: "#4ade80", maintenance: "#fbbf24", offline: "#f87171" };
const MS_BG:     Record<MachineStatus, string> = { active: "rgba(34,197,94,.12)", maintenance: "rgba(251,191,36,.12)", offline: "rgba(239,68,68,.12)" };
const MS_BORDER: Record<MachineStatus, string> = { active: "rgba(34,197,94,.25)", maintenance: "rgba(251,191,36,.25)", offline: "rgba(239,68,68,.25)" };

function initMachineConfigs(): Record<string, MachineConfig> {
  return Object.fromEntries(MACHINE_SPECS.map((m) => [m.name, { power: 80, status: "active" as MachineStatus }]));
}
type VpnStatus = "disconnected" | "connecting" | "connected";
const INTERNAL_ROW_ID = "__rowid__";

const VPN_SESSIONS = [
  { user: "M. Rossi",    ip: "192.168.1.101", location: "Milano, IT",  since: "09:32", activity: "Dashboard Ordini" },
  { user: "L. Bianchi",  ip: "192.168.1.102", location: "Roma, IT",    since: "10:15", activity: "Visualizza Dati"  },
  { user: "A. Ferrari",  ip: "10.0.0.23",     location: "Torino, IT",  since: "11:02", activity: "Aggiorna Record"  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [identityColumns, setIdentityColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [formData, setFormData] = useState<Row>({});
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // VPN state
  const [vpnStatus, setVpnStatus] = useState<VpnStatus>("disconnected");
  const [vpnConnectedAt, setVpnConnectedAt] = useState<string | null>(null);

  // Machine management state
  const [machineConfigs, setMachineConfigs] = useState<Record<string, MachineConfig>>(initMachineConfigs);
  const [managingMachine, setManagingMachine] = useState<string | null>(null);

  function updateMachinePower(name: string, power: number) {
    setMachineConfigs((prev) => ({ ...prev, [name]: { ...prev[name], power } }));
  }
  function updateMachineStatus(name: string, status: MachineStatus) {
    setMachineConfigs((prev) => ({ ...prev, [name]: { ...prev[name], status } }));
  }

  // Current user (read from non-httpOnly cookie)
  const [currentUser, setCurrentUser] = useState("metafan");
  useEffect(() => {
    const match = document.cookie.split(";").find((c) => c.trim().startsWith("mf_user="));
    if (match) setCurrentUser(match.split("=")[1]?.trim() ?? "metafan");
  }, []);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchJson = useCallback(async function <T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const data = await res.json();

    if (res.status === 401) {
      router.push("/login");
      throw new Error("Sessione scaduta");
    }

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Richiesta non riuscita");
    }

    return data as T;
  }, [router]);

  async function loadTables() {
    const data = await fetchJson<{ ok: true; tables: string[] }>("/api/db?action=tables");
    setTables(data.tables);
  }

  async function loadStats() {
    const data = await fetchJson<{ ok: true; stats: StatItem[] }>("/api/db?action=stats");
    setStats(data.stats);
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateDashboard() {
      try {
        const [tablesData, statsData] = await Promise.all([
          fetchJson<{ ok: true; tables: string[] }>("/api/db?action=tables"),
          fetchJson<{ ok: true; stats: StatItem[] }>("/api/db?action=stats"),
        ]);

        if (cancelled) return;
        setTables(tablesData.tables);
        setStats(statsData.stats);
      } catch (error) {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : "Errore caricamento dashboard", "err");
        }
      }
    }

    void hydrateDashboard();
    return () => { cancelled = true; };
  }, [fetchJson]);

  async function loadTableData(table: string) {
    setLoading(true);
    try {
      const encodedTable = encodeURIComponent(table);
      const [colData, rowData] = await Promise.all([
        fetchJson<{ ok: true; columns: Column[]; identityColumns: string[] }>(`/api/db?action=columns&table=${encodedTable}`),
        fetchJson<{ ok: true; rows: Row[]; identityColumns: string[] }>(`/api/db?action=data&table=${encodedTable}`),
      ]);
      setColumns(colData.columns);
      setIdentityColumns(colData.identityColumns.length > 0 ? colData.identityColumns : rowData.identityColumns);
      setRows(rowData.rows);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Errore caricamento tabella", "err");
    } finally {
      setLoading(false);
    }
  }

  async function selectTable(table: string, nextView: View) {
    setSelectedTable(table);
    setView(nextView);
    await loadTableData(table);
    setFormData({});
    setEditRow(null);
    setDeleteRow(null);
    setIdentityColumns([]);
    setSidebarOpen(false);
  }

  function getRowWhere(row: Row) {
    const keys = identityColumns.length > 0 ? identityColumns : [INTERNAL_ROW_ID];
    return Object.fromEntries(
      keys
        .map((key) => [key, row[key]] as const)
        .filter(([, value]) => value !== undefined)
    );
  }

  async function handleInsert() {
    setLoading(true);
    try {
      await fetchJson<{ ok: true; insertId: string }>("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insert", table: selectedTable, data: formData }),
      });
      showToast("Record inserito con successo");
      setFormData({});
      await loadStats();
      await loadTableData(selectedTable);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Errore inserimento", "err");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editRow) return;
    setLoading(true);
    const pkFields = new Set(identityColumns);
    const where = getRowWhere(editRow);
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([key]) => !pkFields.has(key) && key !== INTERNAL_ROW_ID)
    );

    try {
      await fetchJson<{ ok: true }>("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", table: selectedTable, data: updateData, where }),
      });
      showToast("Record aggiornato");
      setEditRow(null);
      setFormData({});
      await loadTableData(selectedTable);
      await loadStats();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Errore aggiornamento", "err");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(targetRow?: Row) {
    const row = targetRow ?? deleteRow;
    if (!row) return;
    setLoading(true);
    const where = getRowWhere(row);
    try {
      await fetchJson<{ ok: true }>("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: selectedTable, where }),
      });
      showToast("Record eliminato");
      setDeleteRow(null);
      await loadStats();
      await loadTableData(selectedTable);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Errore eliminazione", "err");
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(table: string) {
    setLoading(true);
    try {
      await fetchJson<{ ok: true }>("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "drop", table }),
      });
      showToast(`Tabella "${table}" eliminata`);
      setConfirm(null);
      setSelectedTable("");
      setView("overview");
      await loadTables();
      await loadStats();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Errore drop", "err");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  // VPN connection simulation
  function handleVpnToggle() {
    if (vpnStatus === "connected") {
      setVpnStatus("disconnected");
      setVpnConnectedAt(null);
      showToast("VPN disconnessa");
    } else if (vpnStatus === "disconnected") {
      setVpnStatus("connecting");
      setTimeout(() => {
        setVpnStatus("connected");
        const now = new Date();
        setVpnConnectedAt(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
        showToast("VPN connessa — tunnel sicuro attivo");
      }, 2500);
    }
  }

  const writableCols = columns.filter((c) => c.Key !== "PRI");
  const editableCols = columns;
  const selectedTableStat = stats.find((item) => item.table === selectedTable);
  const summaryColumns = columns.slice(0, 3);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "overview",  label: "Panoramica",        icon: "📊" },
    { id: "ordini",    label: "Ordini Produzione",  icon: "🏭" },
    { id: "macchine",  label: "Gestione Macchine",  icon: "⚙️" },
    { id: "vpn",       label: "VPN Aziendale",      icon: "🔐" },
    { id: "view",      label: "Visualizza Dati",    icon: "🔍" },
    { id: "add",       label: "Aggiungi Record",    icon: "➕" },
    { id: "edit",      label: "Modifica Record",    icon: "✏️" },
    { id: "delete",    label: "Elimina Record",     icon: "🗑️" },
    { id: "drop",      label: "Elimina Tabella",    icon: "⚠️" },
  ];

  return (
    /* ── h-screen + overflow-hidden keep the sidebar pinned and prevent body scroll ── */
    <div className="dashboard-shell h-screen flex overflow-hidden" style={{ background: "#060910" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 260, background: "#0c1120", borderRight: "1px solid rgba(201,164,76,.1)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(201,164,76,.1)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[#060910] text-xs" style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}>MF</div>
          <div>
            <div className="text-sm font-bold text-white">MetaFan</div>
            <div className="text-xs text-[#8899b4]">Area Gestione</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => { setView(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${view === id ? "text-white" : "text-[#8899b4] hover:text-white hover:bg-white/5"}`}
              style={view === id ? { background: "rgba(201,164,76,.12)", borderLeft: "2px solid #c9a44c" } : {}}
            >
              <span>{icon}</span>
              {label}
              {/* VPN status dot */}
              {id === "vpn" && vpnStatus !== "disconnected" && (
                <span
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ background: vpnStatus === "connected" ? "#4ade80" : "#fbbf24" }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 space-y-3" style={{ borderTop: "1px solid rgba(201,164,76,.1)" }}>
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#8899b4] hover:text-white hover:bg-white/5 transition-all">
            <span>🌐</span> Sito Pubblico
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#8899b4] hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "rgba(6,9,16,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,164,76,.08)" }}
        >
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="text-base font-bold text-white">
              {navItems.find((n) => n.id === view)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8899b4]">{currentUser}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(201,164,76,.15)", color: "#c9a44c" }}>
              {currentUser.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
          {selectedTable && view !== "overview" && view !== "ordini" && view !== "drop" && view !== "vpn" && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: "rgba(201,164,76,.04)", borderColor: "rgba(201,164,76,.12)" }}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8899b4]">Tabella attiva</p>
                <p className="text-lg font-bold text-white">{selectedTable}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#ccddee]">
                <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(201,164,76,.15)", background: "rgba(255,255,255,.03)" }}>
                  {selectedTableStat?.count ?? rows.length} record
                </span>
                <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(201,164,76,.15)", background: "rgba(255,255,255,.03)" }}>
                  {identityColumns.includes(INTERNAL_ROW_ID) ? "ID: rowid" : `ID: ${identityColumns.join(", ")}`}
                </span>
              </div>
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {view === "overview" && (
            <div>
              <div className="dashboard-immersive-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 mb-8">
                {stats.map(({ table, count }) => (
                  <div key={table} className="glow-card rounded-xl p-6">
                    <p className="text-xs text-[#8899b4] uppercase tracking-wider mb-1">{table}</p>
                    <p className="text-3xl font-black" style={{ color: "#c9a44c" }}>{count}</p>
                    <p className="text-xs text-[#8899b4] mt-1">record totali</p>
                  </div>
                ))}
              </div>
              <div className="glow-card rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Tabelle Database</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {tables.map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer group transition-all"
                      style={{ background: "rgba(201,164,76,.05)", border: "1px solid rgba(201,164,76,.1)" }}
                      onClick={() => selectTable(t, "view")}
                    >
                      <span className="text-sm font-medium text-white">{t}</span>
                      <span className="text-xs group-hover:text-[#c9a44c] transition-colors text-[#8899b4]">→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDINI PRODUZIONE ── */}
          {view === "ordini" && <OrdersDashboard />}

          {/* ── VPN AZIENDALE ── */}
          {view === "vpn" && (
            <VpnPanel
              status={vpnStatus}
              connectedAt={vpnConnectedAt}
              onToggle={handleVpnToggle}
              sessions={VPN_SESSIONS}
            />
          )}

          {/* ── GESTIONE MACCHINE ── */}
          {view === "macchine" && (
            <div className="space-y-6">
              {/* Aggregate stats bar */}
              <div className="rounded-xl p-5 grid sm:grid-cols-3 gap-4" style={{ background: "rgba(201,164,76,.04)", border: "1px solid rgba(201,164,76,.1)" }}>
                {[
                  {
                    label: "Macchine attive",
                    value: `${Object.values(machineConfigs).filter((c) => c.status === "active").length} / ${MACHINE_SPECS.length}`,
                  },
                  {
                    label: "Potenza totale",
                    value: `${MACHINE_SPECS
                      .filter((m) => machineConfigs[m.name]?.status !== "offline")
                      .reduce((s, m) => s + +(m.basePowerKw * (machineConfigs[m.name]?.power ?? 80) / 100).toFixed(2), 0)
                      .toFixed(1)} kW`,
                  },
                  {
                    label: "Consumo totale/ciclo",
                    value: `${MACHINE_SPECS
                      .filter((m) => machineConfigs[m.name]?.status !== "offline")
                      .reduce((s, m) => s + +(m.baseConsumptionKwh * (machineConfigs[m.name]?.power ?? 80) / 100).toFixed(2), 0)
                      .toFixed(1)} kWh`,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#8899b4] mb-1">{label}</p>
                    <p className="text-2xl font-black" style={{ color: "#c9a44c" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Machine cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {MACHINE_SPECS.map((m) => {
                  const cfg = machineConfigs[m.name] ?? { power: 80, status: "active" as MachineStatus };
                  const currentPower = +(m.basePowerKw * cfg.power / 100).toFixed(2);
                  const currentConsumption = +(m.baseConsumptionKwh * cfg.power / 100).toFixed(2);
                  const currentTemp = cfg.status === "offline" ? 0 : Math.round(m.maxTempC * cfg.power / 100 * 0.9);
                  const isManaging = managingMachine === m.name;

                  return (
                    <div
                      key={m.name}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: `1px solid ${isManaging ? "rgba(201,164,76,.35)" : "rgba(201,164,76,.1)"}`,
                        boxShadow: isManaging ? "0 8px 40px rgba(201,164,76,.12)" : "none",
                        transition: "border-color .2s, box-shadow .2s",
                      }}
                    >
                      <div className="p-4 flex flex-col items-center text-center">
                        {/* Abbr icon */}
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-black mb-3"
                          style={{
                            background: "rgba(201,164,76,.12)",
                            color: cfg.status === "offline" ? "#556680" : "#c9a44c",
                            border: "1px solid rgba(201,164,76,.2)",
                            opacity: cfg.status === "offline" ? 0.5 : 1,
                          }}
                        >
                          {m.abbr}
                        </div>
                        <h4 className="font-bold text-white text-xs mb-1 leading-tight">{m.name}</h4>

                        {/* Status badge */}
                        <span
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
                          style={{ background: MS_BG[cfg.status], color: MS_COLOR[cfg.status], border: `1px solid ${MS_BORDER[cfg.status]}` }}
                        >
                          {MS_LABEL[cfg.status]}
                        </span>

                        {/* Mini stats */}
                        {cfg.status !== "offline" && (
                          <div className="w-full grid grid-cols-2 gap-1.5 mt-1 mb-3">
                            <div className="rounded-lg p-2 text-center" style={{ background: "rgba(201,164,76,.05)" }}>
                              <p className="text-[9px] text-[#8899b4] uppercase">Potenza</p>
                              <p className="text-xs font-bold text-[#c9a44c]">{currentPower} kW</p>
                            </div>
                            <div className="rounded-lg p-2 text-center" style={{ background: "rgba(201,164,76,.05)" }}>
                              <p className="text-[9px] text-[#8899b4] uppercase">Consumo</p>
                              <p className="text-xs font-bold text-[#c9a44c]">{currentConsumption} kWh</p>
                            </div>
                          </div>
                        )}

                        {/* Manage button */}
                        <button
                          onClick={() => setManagingMachine(isManaging ? null : m.name)}
                          className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={
                            isManaging
                              ? { background: "rgba(201,164,76,.2)", color: "#c9a44c", border: "1px solid rgba(201,164,76,.3)" }
                              : { background: "rgba(255,255,255,.05)", color: "#8899b4", border: "1px solid rgba(255,255,255,.08)" }
                          }
                        >
                          {isManaging ? "Chiudi" : "Gestisci"}
                        </button>
                      </div>

                      {/* Inline management panel */}
                      {isManaging && (
                        <DashboardMachinePanel
                          spec={m}
                          cfg={cfg}
                          currentPower={currentPower}
                          currentConsumption={currentConsumption}
                          currentTemp={currentTemp}
                          onPowerChange={(v) => updateMachinePower(m.name, v)}
                          onStatusChange={(s) => updateMachineStatus(m.name, s)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VIEW ── */}
          {view === "view" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "view")} />
              {selectedTable && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <ResponsiveRows
                      columns={columns}
                      rows={rows}
                      summaryColumns={summaryColumns}
                      emptyLabel="Nessun dato"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* ── ADD ── */}
          {view === "add" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "add")} />
              {selectedTable && (
                <div className="dashboard-immersive-form glow-card rounded-xl p-6 mt-4 max-w-xl 2xl:max-w-5xl">
                  <h3 className="font-bold text-white mb-5">Nuovo record in <span style={{ color: "#c9a44c" }}>{selectedTable}</span></h3>
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {writableCols.map((c) => (
                      <div key={c.Field}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#c9a44c" }}>{c.Field}</label>
                        <input
                          value={String(formData[c.Field] ?? "")}
                          onChange={(e) => setFormData((p) => ({ ...p, [c.Field]: e.target.value }))}
                          className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8899b4] outline-none"
                          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                          type={getInputType(c)}
                          placeholder={c.Type}
                          min={/INT|REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(c.Type.toUpperCase()) ? "0" : undefined}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleInsert}
                    disabled={loading}
                    className="mt-6 px-6 py-2.5 rounded-lg font-semibold text-[#060910] text-sm disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
                  >
                    {loading ? "Inserimento..." : "Inserisci Record"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── EDIT ── */}
          {view === "edit" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "edit")} />
              {selectedTable && !editRow && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <p className="px-5 py-3 text-sm text-[#8899b4]">Seleziona un record da modificare</p>
                    <ResponsiveRows
                      columns={columns}
                      rows={rows}
                      summaryColumns={summaryColumns}
                      emptyLabel="Nessun record disponibile"
                      actionLabel="Modifica"
                      onAction={(row) => { setEditRow(row); setFormData({ ...row }); }}
                      actionVariant="gold"
                    />
                  </div>
                )
              )}
              {selectedTable && editRow && (
                <div className="dashboard-immersive-form glow-card rounded-xl p-6 mt-4 max-w-xl 2xl:max-w-5xl">
                  <h3 className="font-bold text-white mb-5">Modifica record</h3>
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {editableCols.map((c) => (
                      <div key={c.Field}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: c.Key === "PRI" ? "#8899b4" : "#c9a44c" }}>
                          {c.Field} {c.Key === "PRI" && <span className="text-[10px] normal-case">(chiave primaria)</span>}
                        </label>
                        <input
                          value={String(formData[c.Field] ?? "")}
                          disabled={c.Key === "PRI"}
                          onChange={(e) => setFormData((p) => ({ ...p, [c.Field]: e.target.value }))}
                          className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8899b4] outline-none disabled:opacity-40"
                          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                          type={getInputType(c)}
                          min={/INT|REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(c.Type.toUpperCase()) ? "0" : undefined}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-lg font-semibold text-[#060910] text-sm disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
                    >
                      {loading ? "Aggiornamento..." : "Salva Modifiche"}
                    </button>
                    <button onClick={() => { setEditRow(null); setFormData({}); }} className="px-6 py-2.5 rounded-lg font-semibold text-sm text-[#8899b4] hover:text-white" style={{ background: "rgba(255,255,255,.05)" }}>
                      Annulla
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DELETE ── */}
          {view === "delete" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "delete")} />
              {selectedTable && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <ResponsiveRows
                      columns={columns}
                      rows={rows}
                      summaryColumns={summaryColumns}
                      emptyLabel="Nessun record disponibile"
                      actionLabel="Elimina"
                      onAction={(row) => setConfirm({ msg: "Eliminare questo record?", action: () => handleDelete(row) })}
                      actionVariant="danger"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* ── DROP ── */}
          {view === "drop" && (
            <div>
              <p className="text-sm text-[#8899b4] mb-6">⚠️ Elimina permanentemente una tabella e tutti i suoi dati.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((t) => (
                  <div key={t} className="rounded-xl p-5 flex items-center justify-between" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)" }}>
                    <span className="font-semibold text-white text-sm">{t}</span>
                    <button
                      onClick={() => setConfirm({ msg: `Eliminare definitivamente la tabella "${t}"? Azione irreversibile.`, action: () => handleDrop(t) })}
                      className="text-xs px-3 py-1.5 rounded font-semibold text-red-400 hover:text-white transition-colors"
                      style={{ background: "rgba(239,68,68,.15)" }}
                    >
                      DROP
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: toast.type === "ok" ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
            border: `1px solid ${toast.type === "ok" ? "rgba(34,197,94,.3)" : "rgba(239,68,68,.3)"}`,
            color: toast.type === "ok" ? "#4ade80" : "#f87171",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Confirm modal ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "#0c1120", border: "1px solid rgba(201,164,76,.2)" }}>
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm text-[#ccddee] mb-6">{confirm.msg}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { confirm.action(); setConfirm(null); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.3)" }}
              >
                Conferma
              </button>
              <button
                onClick={() => setConfirm(null)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-[#8899b4] hover:text-white"
                style={{ background: "rgba(255,255,255,.05)" }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Machine Panel ─────────────────────────── */

function DashboardMachinePanel({
  spec,
  cfg,
  currentPower,
  currentConsumption,
  currentTemp,
  onPowerChange,
  onStatusChange,
}: {
  spec: MachineSpec;
  cfg: MachineConfig;
  currentPower: number;
  currentConsumption: number;
  currentTemp: number;
  onPowerChange: (v: number) => void;
  onStatusChange: (s: MachineStatus) => void;
}) {
  const statuses: MachineStatus[] = ["active", "maintenance", "offline"];

  return (
    <div className="px-4 pb-5 pt-0" style={{ borderTop: "1px solid rgba(201,164,76,.12)" }}>
      <div className="pt-4 space-y-5">

        {/* Power slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-bold text-[#c9a44c] uppercase tracking-wider">Livello Potenza</p>
            <span className="text-xs font-black text-white">{cfg.power}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={cfg.power}
            onChange={(e) => onPowerChange(Number(e.target.value))}
            disabled={cfg.status === "offline"}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #c9a44c ${cfg.power}%, rgba(201,164,76,.15) ${cfg.power}%)`,
              accentColor: "#c9a44c",
            }}
          />
          <div className="flex justify-between text-[9px] text-[#556680] mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Potenza", value: cfg.status === "offline" ? "— kW"  : `${currentPower} kW`,         color: "#c9a44c" },
            { label: "Consumo", value: cfg.status === "offline" ? "— kWh" : `${currentConsumption} kWh`,  color: "#c9a44c" },
            { label: "Temp.",   value: cfg.status === "offline" ? "— °C"  : `${currentTemp} °C`,          color: currentTemp > spec.maxTempC * 0.85 ? "#f87171" : "#4ade80" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
              <p className="text-[9px] text-[#8899b4] uppercase mb-0.5">{label}</p>
              <p className="text-[11px] font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Nominal specs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,.02)" }}>
            <p className="text-[9px] text-[#556680] uppercase mb-0.5">Potenza nominale</p>
            <p className="text-[11px] text-[#8899b4]">{spec.basePowerKw} kW</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,.02)" }}>
            <p className="text-[9px] text-[#556680] uppercase mb-0.5">Cons. max/ciclo</p>
            <p className="text-[11px] text-[#8899b4]">{spec.baseConsumptionKwh} kWh</p>
          </div>
        </div>

        {/* Status buttons */}
        <div>
          <p className="text-[11px] font-bold text-[#c9a44c] uppercase tracking-wider mb-2">Stato Operativo</p>
          <div className="flex gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={
                  cfg.status === s
                    ? { background: MS_BG[s], color: MS_COLOR[s], border: `1px solid ${MS_BORDER[s]}` }
                    : { background: "rgba(255,255,255,.04)", color: "#556680", border: "1px solid rgba(255,255,255,.06)" }
                }
              >
                {MS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── VPN Panel ─────────────────────────── */

function VpnPanel({
  status,
  connectedAt,
  onToggle,
  sessions,
}: {
  status: VpnStatus;
  connectedAt: string | null;
  onToggle: () => void;
  sessions: { user: string; ip: string; location: string; since: string; activity: string }[];
}) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Status card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: isConnected
            ? "rgba(34,197,94,.06)"
            : isConnecting
            ? "rgba(251,191,36,.06)"
            : "rgba(255,255,255,.03)",
          border: `1px solid ${isConnected ? "rgba(34,197,94,.2)" : isConnecting ? "rgba(251,191,36,.2)" : "rgba(201,164,76,.12)"}`,
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Animated status dot */}
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: isConnected
                    ? "rgba(34,197,94,.15)"
                    : isConnecting
                    ? "rgba(251,191,36,.15)"
                    : "rgba(255,255,255,.05)",
                }}
              >
                {isConnected ? "🔒" : isConnecting ? "⏳" : "🔓"}
              </div>
              {isConnected && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#060910] pulse-dot"
                  style={{ background: "#4ade80" }}
                />
              )}
            </div>
            <div>
              <p className="text-lg font-black text-white">
                {isConnected ? "VPN Connessa" : isConnecting ? "Connessione in corso…" : "VPN Disconnessa"}
              </p>
              <p className="text-sm text-[#8899b4] mt-0.5">
                {isConnected
                  ? `Tunnel sicuro attivo dalle ${connectedAt} — Server MetaFan HQ`
                  : isConnecting
                  ? "Autenticazione e handshake TLS in corso…"
                  : "Nessun tunnel attivo — accesso remoto disabilitato"}
              </p>
            </div>
          </div>

          <button
            onClick={onToggle}
            disabled={isConnecting}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
            style={
              isConnected
                ? { background: "rgba(239,68,68,.15)", color: "#f87171", border: "1px solid rgba(239,68,68,.3)" }
                : { background: "linear-gradient(135deg,#c9a44c,#a88630)", color: "#060910" }
            }
          >
            {isConnecting ? "Connessione…" : isConnected ? "Disconnetti VPN" : "Connetti VPN"}
          </button>
        </div>

        {/* Connecting progress bar */}
        {isConnecting && (
          <div className="mt-4 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,.06)" }}>
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg,#c9a44c,#4ade80)",
                animation: "vpnProgress 2.5s ease-out forwards",
                width: "100%",
              }}
            />
            <style>{`@keyframes vpnProgress { from { width:0 } to { width:100% } }`}</style>
          </div>
        )}
      </div>

      {/* Server info */}
      {isConnected && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Server",   value: "MetaFan HQ (10.10.0.1)" },
            { label: "Protocollo", value: "OpenVPN / AES-256-GCM" },
            { label: "Latenza",  value: "12 ms" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: "rgba(201,164,76,.04)", border: "1px solid rgba(201,164,76,.1)" }}
            >
              <p className="text-xs text-[#8899b4] uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Connected employees */}
      {isConnected && (
        <div className="glow-card rounded-xl overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(201,164,76,.08)" }}>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#4ade80" }} />
              Sessioni Dipendenti Attive
              <span className="ml-auto text-xs text-[#8899b4]">{sessions.length} connessi</span>
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(201,164,76,.06)" }}>
            {sessions.map((s) => (
              <div key={s.user} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(201,164,76,.15)", color: "#c9a44c" }}>
                  {s.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.user}</p>
                  <p className="text-xs text-[#8899b4]">{s.ip} · {s.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#8899b4]">{s.activity}</p>
                  <p className="text-[11px] text-[#556680]">Da {s.since}</p>
                </div>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#4ade80" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disconnected state hint */}
      {status === "disconnected" && (
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(201,164,76,.04)", border: "1px solid rgba(201,164,76,.08)" }}
        >
          <p className="text-xs text-[#8899b4] leading-relaxed">
            <span className="text-[#c9a44c] font-semibold">Come funziona:</span> La VPN aziendale crea un tunnel crittografato
            tra il dispositivo remoto e i server interni MetaFan. Una volta connesso, i dipendenti
            possono accedere al gestionale da qualsiasi rete in modo sicuro, con la stessa esperienza
            di un accesso locale.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function TableSelector({ tables, selected, onSelect }: { tables: string[]; selected: string; onSelect: (t: string) => void }) {
  return (
    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
      {tables.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selected === t ? "text-[#060910]" : "text-[#8899b4] hover:text-white"}`}
          style={selected === t ? { background: "linear-gradient(135deg,#c9a44c,#a88630)" } : { background: "rgba(201,164,76,.06)", border: "1px solid rgba(201,164,76,.12)" }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="spin w-8 h-8 rounded-full border-2 border-[#c9a44c] border-t-transparent" /></div>;
}

function ResponsiveRows({
  columns,
  rows,
  summaryColumns,
  emptyLabel,
  actionLabel,
  onAction,
  actionVariant = "gold",
}: {
  columns: Column[];
  rows: Row[];
  summaryColumns: Column[];
  emptyLabel: string;
  actionLabel?: string;
  onAction?: (row: Row) => void;
  actionVariant?: "gold" | "danger";
}) {
  if (rows.length === 0) {
    return <div className="py-8 text-center text-[#8899b4]">{emptyLabel}</div>;
  }

  const actionStyle = actionVariant === "danger"
    ? { background: "rgba(239,68,68,.12)", color: "#f87171" }
    : { background: "linear-gradient(135deg,#c9a44c,#a88630)", color: "#060910" };

  return (
    <>
      <div className="md:hidden grid gap-3 p-4 dashboard-card-grid">
        {rows.map((row, index) => (
          <div key={String(row[INTERNAL_ROW_ID] ?? index)} className="rounded-xl border p-4" style={{ borderColor: "rgba(201,164,76,.12)", background: "rgba(255,255,255,.03)" }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {summaryColumns.map((column) => row[column.Field]).filter(Boolean).join(" • ") || "Record"}
                </p>
                <p className="mt-1 text-xs text-[#8899b4]">{columns.length} campi</p>
              </div>
              {actionLabel && onAction && (
                <button onClick={() => onAction(row)} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={actionStyle}>
                  {actionLabel}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.Field} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 text-xs">
                  <span className="text-[#8899b4]">{column.Field}</span>
                  <span className="max-w-[60%] text-right text-[#f0f4fc] break-words">{String(row[column.Field] ?? "")}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="dash-table w-full text-sm">
          <thead>
            <tr>
              {columns.map((column) => <th key={column.Field}>{column.Field}</th>)}
              {actionLabel && <th>Azione</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row[INTERNAL_ROW_ID] ?? index)}>
                {columns.map((column) => <td key={column.Field}>{String(row[column.Field] ?? "")}</td>)}
                {actionLabel && onAction && (
                  <td>
                    <button onClick={() => onAction(row)} className="rounded px-3 py-1 text-xs font-semibold" style={actionStyle}>
                      {actionLabel}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getInputType(column: Column) {
  const field = column.Field.toLowerCase();
  const type = column.Type.toUpperCase();

  if (field.includes("email")) return "email";
  if (field.includes("timestamp")) return "datetime-local";
  if (field.includes("data")) return "date";
  if (/INT|REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(type)) return "number";
  return "text";
}
