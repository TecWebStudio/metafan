"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const contactInfo = [
    { icon: "📍", label: "Indirizzo", value: "Via dell'Industria 42, Milano MI" },
    { icon: "📞", label: "Telefono", value: "+39 02 1234 5678" },
    { icon: "✉️", label: "Email", value: "info@metafan.it" },
    { icon: "⏰", label: "Orari", value: "Lun–Ven 8:00 – 18:00" },
  ];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-36 pb-24 px-6"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,164,76,.12) 0%, transparent 60%), #060910" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block" style={{ background: "rgba(201,164,76,.10)", border: "1px solid rgba(201,164,76,.3)", color: "#c9a44c" }}>
            Contattaci
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            Parliamo del tuo <span className="text-gradient">Progetto</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            Il nostro team tecnico è a disposizione per analizzare le tue esigenze e
            proporti la soluzione più adatta.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "rgba(201,164,76,.1)", border: "1px solid rgba(201,164,76,.2)" }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#c9a44c" }}>{label}</p>
                  <p className="text-sm text-[#ccddee]">{value}</p>
                </div>
              </div>
            ))}

            <div
              className="mt-8 rounded-2xl p-6"
              style={{ background: "rgba(201,164,76,.05)", border: "1px solid rgba(201,164,76,.12)" }}
            >
              <h4 className="font-bold text-white mb-3">Area Gestione</h4>
              <p className="text-sm text-[#8899b4] mb-4">
                Sei un operatore MetaFan? Accedi all&apos;area riservata per gestire prodotti, ordini e dati aziendali.
              </p>
              <a
                href="/login"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-[#060910]"
                style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
              >
                Accedi →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ background: "rgba(201,164,76,.07)", border: "1px solid rgba(201,164,76,.2)" }}
              >
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">Messaggio inviato!</h3>
                <p className="text-[#8899b4]">Ti risponderemo entro 24 ore lavorative.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glow-card rounded-2xl p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>Nome *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#8899b4] outline-none transition-all"
                      style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#8899b4] outline-none"
                      style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                      placeholder="mario@azienda.it"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>Argomento</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                  >
                    <option value="">Seleziona un argomento</option>
                    <option value="pcb">Progettazione PCB</option>
                    <option value="iot">Soluzioni IoT</option>
                    <option value="arvr">Sistemi AR/VR</option>
                    <option value="3d">Stampa 3D</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c9a44c" }}>Messaggio *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#8899b4] outline-none resize-none"
                    style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,164,76,.15)" }}
                    placeholder="Descrivi il tuo progetto..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg font-semibold text-[#060910] transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)", boxShadow: "0 8px 32px rgba(201,164,76,.2)" }}
                >
                  Invia Messaggio
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
