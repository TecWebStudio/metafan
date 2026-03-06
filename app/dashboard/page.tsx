"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Row = Record<string, unknown>;
type Column = { Field: string; Key: string; Null: string; Type: string };
type StatItem = { table: string; count: number };
type View = "overview" | "view" | "add" | "edit" | "delete" | "drop";

export default function DashboardPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [formData, setFormData] = useState<Row>({});
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadTables = useCallback(async () => {
    const res = await fetch("/api/db?action=tables");
    const data = await res.json();
    if (data.ok) setTables(data.tables);
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/db?action=stats");
    const data = await res.json();
    if (data.ok) setStats(data.stats);
  }, []);

  useEffect(() => {
    loadTables();
    loadStats();
  }, [loadTables, loadStats]);

  async function loadTableData(table: string) {
    setLoading(true);
    const [colRes, rowRes] = await Promise.all([
      fetch(`/api/db?action=columns&table=${table}`),
      fetch(`/api/db?action=data&table=${table}`),
    ]);
    const colData = await colRes.json();
    const rowData = await rowRes.json();
    if (colData.ok) setColumns(colData.columns);
    if (rowData.ok) setRows(rowData.rows);
    setLoading(false);
  }

  async function selectTable(table: string, nextView: View) {
    setSelectedTable(table);
    setView(nextView);
    await loadTableData(table);
    setFormData({});
    setEditRow(null);
    setDeleteRow(null);
    setSidebarOpen(false);
  }

  async function handleInsert() {
    setLoading(true);
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "insert", table: selectedTable, data: formData }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      showToast("Record inserito con successo");
      setFormData({});
      loadStats();
      await loadTableData(selectedTable);
    } else {
      showToast(data.error || "Errore inserimento", "err");
    }
  }

  async function handleUpdate() {
    if (!editRow) return;
    setLoading(true);
    const pkCols = columns.filter((c) => c.Key === "PRI");
    const where: Row = {};
    pkCols.forEach((c) => { where[c.Field] = editRow[c.Field]; });
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", table: selectedTable, data: formData, where }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      showToast("Record aggiornato");
      setEditRow(null);
      setFormData({});
      await loadTableData(selectedTable);
    } else {
      showToast(data.error || "Errore aggiornamento", "err");
    }
  }

  async function handleDelete() {
    if (!deleteRow) return;
    setLoading(true);
    const pkCols = columns.filter((c) => c.Key === "PRI");
    const where: Row = {};
    pkCols.forEach((c) => { where[c.Field] = deleteRow[c.Field]; });
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", table: selectedTable, where }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      showToast("Record eliminato");
      setDeleteRow(null);
      loadStats();
      await loadTableData(selectedTable);
    } else {
      showToast(data.error || "Errore eliminazione", "err");
    }
  }

  async function handleDrop(table: string) {
    setLoading(true);
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "drop", table }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      showToast(`Tabella "${table}" eliminata`);
      setConfirm(null);
      setSelectedTable("");
      setView("overview");
      await loadTables();
      await loadStats();
    } else {
      showToast(data.error || "Errore drop", "err");
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const writableCols = columns.filter((c) => c.Key !== "PRI");
  const editableCols = columns;

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "overview", label: "Panoramica", icon: "📊" },
    { id: "view", label: "Visualizza Dati", icon: "🔍" },
    { id: "add", label: "Aggiungi Record", icon: "➕" },
    { id: "edit", label: "Modifica Record", icon: "✏️" },
    { id: "delete", label: "Elimina Record", icon: "🗑️" },
    { id: "drop", label: "Elimina Tabella", icon: "⚠️" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#060910" }}>
      {/* Sidebar */}
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-20"
          style={{ background: "rgba(6,9,16,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,164,76,.08)" }}
        >
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-white" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="text-base font-bold text-white">
              {navItems.find((n) => n.id === view)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8899b4]">metafan</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(201,164,76,.15)", color: "#c9a44c" }}>MF</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">

          {/* OVERVIEW */}
          {view === "overview" && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

          {/* VIEW */}
          {view === "view" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "view")} />
              {selectedTable && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                      <table className="dash-table w-full text-sm">
                        <thead>
                          <tr>{columns.map((c) => <th key={c.Field}>{c.Field}</th>)}</tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center py-8 text-[#8899b4]">Nessun dato</td></tr>
                          ) : rows.map((row, i) => (
                            <tr key={i}>{columns.map((c) => <td key={c.Field}>{String(row[c.Field] ?? "")}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ADD */}
          {view === "add" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "add")} />
              {selectedTable && (
                <div className="glow-card rounded-xl p-6 mt-4 max-w-xl">
                  <h3 className="font-bold text-white mb-5">Nuovo record in <span style={{ color: "#c9a44c" }}>{selectedTable}</span></h3>
                  <div className="space-y-4">
                    {writableCols.map((c) => (
                      <div key={c.Field}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#c9a44c" }}>{c.Field}</label>
                        <input
                          value={String(formData[c.Field] ?? "")}
                          onChange={(e) => setFormData((p) => ({ ...p, [c.Field]: e.target.value }))}
                          className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8899b4] outline-none"
                          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                          placeholder={c.Type}
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

          {/* EDIT */}
          {view === "edit" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "edit")} />
              {selectedTable && !editRow && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <p className="px-5 py-3 text-sm text-[#8899b4]">Seleziona un record da modificare</p>
                    <div className="overflow-x-auto">
                      <table className="dash-table w-full text-sm">
                        <thead>
                          <tr>{columns.map((c) => <th key={c.Field}>{c.Field}</th>)}<th>Azione</th></tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr key={i}>
                              {columns.map((c) => <td key={c.Field}>{String(row[c.Field] ?? "")}</td>)}
                              <td>
                                <button
                                  onClick={() => { setEditRow(row); setFormData({ ...row }); }}
                                  className="text-xs px-3 py-1 rounded font-semibold text-[#060910]"
                                  style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
                                >
                                  Modifica
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
              {selectedTable && editRow && (
                <div className="glow-card rounded-xl p-6 mt-4 max-w-xl">
                  <h3 className="font-bold text-white mb-5">Modifica record</h3>
                  <div className="space-y-4">
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

          {/* DELETE */}
          {view === "delete" && (
            <div>
              <TableSelector tables={tables} selected={selectedTable} onSelect={(t) => selectTable(t, "delete")} />
              {selectedTable && (
                loading ? <Spinner /> : (
                  <div className="glow-card rounded-xl overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                      <table className="dash-table w-full text-sm">
                        <thead>
                          <tr>{columns.map((c) => <th key={c.Field}>{c.Field}</th>)}<th>Azione</th></tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr key={i} style={deleteRow === row ? { background: "rgba(239,68,68,.07)" } : {}}>
                              {columns.map((c) => <td key={c.Field}>{String(row[c.Field] ?? "")}</td>)}
                              <td>
                                <button
                                  onClick={() => setConfirm({ msg: "Eliminare questo record?", action: () => { setDeleteRow(row); handleDelete(); } })}
                                  className="text-xs px-3 py-1 rounded font-semibold text-red-400 hover:text-white"
                                  style={{ background: "rgba(239,68,68,.12)" }}
                                >
                                  Elimina
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* DROP */}
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

      {/* Toast */}
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

      {/* Confirm modal */}
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

function TableSelector({ tables, selected, onSelect }: { tables: string[]; selected: string; onSelect: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
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
