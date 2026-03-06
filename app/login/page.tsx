"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Credenziali non valide");
      }
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,164,76,.15) 0%, transparent 60%), #060910",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-[#060910]"
              style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
            >
              MF
            </div>
            <span className="text-2xl font-bold text-white">
              Meta<span style={{ color: "#c9a44c" }}>Fan</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Area Gestione</h1>
          <p className="text-sm text-[#8899b4]">Accedi per gestire il sistema</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glow-card rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div
              className="text-sm rounded-lg px-4 py-3"
              style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#8899b4] outline-none transition-all focus:ring-1"
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(201,164,76,.15)",
              }}
              placeholder="metafan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#8899b4] outline-none"
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(201,164,76,.15)",
              }}
              placeholder="••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-semibold text-[#060910] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#c9a44c,#a88630)",
              boxShadow: "0 8px 32px rgba(201,164,76,.2)",
            }}
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#8899b4]">
          <Link href="/" className="hover:text-white transition-colors">
            ← Torna al sito
          </Link>
        </p>
      </div>
    </div>
  );
}
