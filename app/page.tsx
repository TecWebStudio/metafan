import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const services = [
  { icon: "⚡", title: "Progettazione PCB", desc: "Schede elettroniche custom ad alta precisione per ogni settore industriale." },
  { icon: "🌐", title: "Soluzioni IoT", desc: "Dispositivi connessi, sensori smart e architetture edge-cloud scalabili." },
  { icon: "🥽", title: "AR/VR Systems", desc: "Hardware per realtà aumentata e virtuale: dalla prototipazione al prodotto finito." },
  { icon: "🖨️", title: "Stampa 3D", desc: "Prototipi e scocche funzionali con materiali tecnici e tolleranze strette." },
  { icon: "⚙️", title: "Firmware & Embedded", desc: "Sviluppo firmware professionale per microcontrollori e SoC." },
  { icon: "🏭", title: "Manifattura Avanzata", desc: "Linee di produzione digitalizzate e controllo qualità automatizzato." },
];

const stats = [
  { value: "150+", label: "Prodotti Attivi" },
  { value: "5", label: "Zone Operative" },
  { value: "99%", label: "Qualità Garantita" },
  { value: "24h", label: "Supporto Tecnico" },
];

const zones = [
  { name: "Zona Produttiva", desc: "Assemblaggio e test PCB automatizzato.", icon: "🏗️" },
  { name: "Uffici", desc: "Design, progettazione e gestione commesse.", icon: "🖥️" },
  { name: "R&D", desc: "Ricerca, prototipazione e innovazione.", icon: "🔬" },
  { name: "Magazzino", desc: "Logistica e tracciabilità componenti.", icon: "📦" },
  { name: "Zona Ristoro", desc: "Area benessere per il team MetaFan.", icon: "☕" },
  { name: "Lab AR/VR", desc: "Testing e sviluppo sistemi immersivi.", icon: "🥽" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,164,76,.15) 0%, transparent 60%), #060910",
        }}
      >
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 pb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[.2em] px-4 py-2 rounded-full mb-6 animate-fade-up"
            style={{
              background: "rgba(201,164,76,.10)",
              border: "1px solid rgba(201,164,76,.3)",
              color: "#c9a44c",
            }}
          >
            Innovazione Elettronica di Precisione
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 animate-fade-up stagger-1">
            <span className="text-white">Costruiamo il </span>
            <span className="text-gradient">Futuro</span>
            <br />
            <span className="text-white">dell&apos;Elettronica</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
            PCB custom, IoT, AR/VR e stampa 3D: MetaFan è il partner tecnologico per la
            manifattura italiana di eccellenza.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-up stagger-3">
            <Link
              href="/services"
              className="px-8 py-3.5 rounded-lg font-semibold text-[#060910] transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,#c9a44c,#a88630)",
                boxShadow: "0 8px 32px rgba(201,164,76,.25)",
              }}
            >
              Scopri i Servizi
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-lg font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(201,164,76,.07)",
                border: "1px solid rgba(201,164,76,.2)",
              }}
            >
              Contattaci
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-[#8899b4] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, #c9a44c, transparent)" }} />
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="glow-card text-center rounded-2xl p-8">
              <div className="text-4xl font-black mb-2" style={{ color: "#c9a44c" }}>{value}</div>
              <div className="text-sm text-[#8899b4]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Cosa Facciamo</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">Soluzioni <span className="text-gradient">Complete</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon, title, desc }) => (
            <div key={title} className="glow-card rounded-2xl p-8">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-[#8899b4] leading-relaxed">{desc}</p>
              <div className="mt-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "#c9a44c" }}>Scopri →</div>
            </div>
          ))}
        </div>
      </section>

      {/* Zones */}
      <section className="py-24 px-6" style={{ background: "rgba(201,164,76,.03)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Il Nostro Spazio</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">Zone <span className="text-gradient">Operative</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {zones.map(({ name, desc, icon }) => (
              <div
                key={name}
                className="flex gap-4 items-start rounded-xl p-6"
                style={{ background: "rgba(201,164,76,.05)", border: "1px solid rgba(201,164,76,.10)" }}
              >
                <span className="text-3xl">{icon}</span>
                <div>
                  <h4 className="font-bold text-white mb-1">{name}</h4>
                  <p className="text-sm text-[#8899b4]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Pronto a innovare con <span className="text-gradient">MetaFan</span>?
          </h2>
          <p className="text-[#8899b4] mb-10">
            Contattaci per discutere il tuo progetto. I nostri esperti sono pronti ad accompagnarti dalla prototipazione alla produzione.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 rounded-lg font-semibold text-[#060910] text-lg transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)", boxShadow: "0 8px 40px rgba(201,164,76,.3)" }}
          >
            Inizia Ora
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
