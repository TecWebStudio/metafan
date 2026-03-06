import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const values = [
  { icon: "🎯", title: "Precisione", desc: "Ogni PCB e ogni dispositivo è progettato con tolleranze strette e processi certificati." },
  { icon: "🚀", title: "Innovazione", desc: "Investiamo il 20% del fatturato in R&D per restare all'avanguardia tecnologica." },
  { icon: "🤝", title: "Partnership", desc: "Lavoriamo come partner tecnico dei nostri clienti, non solo come fornitori." },
  { icon: "🌱", title: "Sostenibilità", desc: "Produzione eco-compatibile con riduzione degli scarti e filiera responsabile." },
];

const team = [
  { name: "Marco Bianchi", role: "CEO & Co-Founder", area: "Strategia & Visione" },
  { name: "Sofia Esposito", role: "CTO", area: "Architettura Hardware" },
  { name: "Lorenzo Russo", role: "Head of R&D", area: "Innovazione & Prototipazione" },
  { name: "Giulia Ferretti", role: "Operations Manager", area: "Produzione & Qualità" },
];

const milestones = [
  { year: "2018", event: "Fondazione MetaFan come startup elettronica" },
  { year: "2019", event: "Prima linea di produzione PCB operativa" },
  { year: "2020", event: "Lancio divisione IoT e connettività" },
  { year: "2021", event: "Apertura laboratorio AR/VR" },
  { year: "2022", event: "Certificazione ISO 9001:2015" },
  { year: "2023", event: "Espansione a 5 zone operative, 150+ prodotti" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-36 pb-24 px-6"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,164,76,.12) 0%, transparent 60%), #060910",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block" style={{ background: "rgba(201,164,76,.10)", border: "1px solid rgba(201,164,76,.3)", color: "#c9a44c" }}>
            Chi Siamo
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            La nostra <span className="text-gradient">storia</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            MetaFan nasce dalla passione per l&apos;elettronica e dalla visione di portare la manifattura italiana
            nel futuro digitale. Dal 2018 costruiamo tecnologia con precisione artigianale.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>La Nostra Missione</span>
            <h2 className="text-3xl font-black text-white mt-3 mb-6">
              Elettronica <span className="text-gradient">italiana</span> di eccellenza
            </h2>
            <p className="text-[#8899b4] mb-4 leading-relaxed">
              MetaFan progetta e produce hardware elettronico avanzato — dai PCB multi-layer ai sistemi IoT
              completi, fino all&apos;hardware per realtà aumentata e virtuale.
            </p>
            <p className="text-[#8899b4] leading-relaxed">
              Il nostro impianto è organizzato in 5 zone specializzate che garantiscono un flusso produttivo
              efficiente dalla prototipazione alla consegna finale.
            </p>
            <Link
              href="/services"
              className="inline-block mt-8 px-6 py-3 rounded-lg font-semibold text-[#060910] transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
            >
              I Nostri Servizi
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="glow-card rounded-xl p-6">
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="font-bold text-white mb-1">{title}</h4>
                <p className="text-xs text-[#8899b4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6" style={{ background: "rgba(201,164,76,.03)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>La Nostra Crescita</span>
            <h2 className="text-3xl font-black text-white mt-3">Timeline</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px" style={{ background: "rgba(201,164,76,.2)" }} />
            {milestones.map(({ year, event }) => (
              <div key={year} className="flex gap-8 mb-8 group">
                <div className="w-24 flex-shrink-0 text-right">
                  <span className="text-sm font-bold" style={{ color: "#c9a44c" }}>{year}</span>
                </div>
                <div
                  className="relative flex-1 rounded-xl p-5"
                  style={{ background: "rgba(201,164,76,.05)", border: "1px solid rgba(201,164,76,.10)" }}
                >
                  <div
                    className="absolute -left-[1.6rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    style={{ background: "#c9a44c", boxShadow: "0 0 12px rgba(201,164,76,.5)" }}
                  />
                  <p className="text-sm text-[#ccddee]">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Le Persone</span>
          <h2 className="text-3xl font-black text-white mt-3">Il Team <span className="text-gradient">MetaFan</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(({ name, role, area }) => (
            <div key={name} className="glow-card rounded-2xl p-6 text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black"
                style={{ background: "linear-gradient(135deg,rgba(201,164,76,.2),rgba(201,164,76,.05))", border: "1px solid rgba(201,164,76,.3)", color: "#c9a44c" }}
              >
                {name.split(" ").map(n => n[0]).join("")}
              </div>
              <h4 className="font-bold text-white mb-1">{name}</h4>
              <p className="text-xs font-semibold mb-1" style={{ color: "#c9a44c" }}>{role}</p>
              <p className="text-xs text-[#8899b4]">{area}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
