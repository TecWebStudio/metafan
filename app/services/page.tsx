import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const services = [
  {
    icon: "⚡",
    title: "Progettazione PCB",
    desc: "Schede mono e multi-layer ad alta densità. Design DFM, ottimizzazione termica, test AOI e X-Ray. Supporto da 1 prototipo a lotti industriali.",
    features: ["Fino a 16 layer", "Componenti SMD 0201", "Test ICT & Flying Probe", "Certificazione IPC-A-610"],
  },
  {
    icon: "🌐",
    title: "Soluzioni IoT",
    desc: "Ecosistemi IoT completi: sensori industriali, gateway, cloud integration e dashboard di monitoraggio real-time.",
    features: ["Protocolli MQTT/AMQP", "Edge computing", "OTA updates", "Dashboard personalizzate"],
  },
  {
    icon: "🥽",
    title: "Sistemi AR/VR",
    desc: "Hardware e firmware per headset AR/VR: display driver, sistema di tracking, ottimizzazione latenza.",
    features: ["Display 4K per occhio", "IMU 6-DoF", "Latenza < 10ms", "SDK dedicato"],
  },
  {
    icon: "🖨️",
    title: "Stampa 3D",
    desc: "Prototipazione rapida e produzione di scocche funzionali con FDM, SLA e SLS.",
    features: ["Tolleranze ±0.1mm", "Materiali tecnici PEEK/Nylon", "Post-processing", "Reverse engineering"],
  },
  {
    icon: "⚙️",
    title: "Firmware & Embedded",
    desc: "Sviluppo software embedded per microcontrollori ARM, RISC-V e FPGA. BSP, driver e applicazioni real-time.",
    features: ["FreeRTOS / Zephyr", "Driver HAL custom", "Debug JTAG/SWD", "Certificazioni CE/FCC"],
  },
  {
    icon: "🏭",
    title: "Manifattura & Collaudo",
    desc: "Assistenza alla produzione, setup linee automatizzate, procedure di collaudo e traceability.",
    features: ["Pick & Place automatico", "Reflow multizona", "Test bed su misura", "MES integration"],
  },
];

export default function ServicesPage() {
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
            Servizi
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            Soluzioni <span className="text-gradient">Complete</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            Dall&apos;idea al prodotto finito: MetaFan copre ogni fase dello sviluppo hardware
            con competenza, precisione e tecnologie all&apos;avanguardia.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map(({ icon, title, desc, features }) => (
            <div key={title} className="glow-card rounded-2xl p-8">
              <div className="text-4xl mb-5">{icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-sm text-[#8899b4] leading-relaxed mb-6">{desc}</p>
              <ul className="space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c9a44c" }} />
                    <span className="text-[#aabbcc]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-4">Hai un progetto in mente?</h2>
          <p className="text-[#8899b4] mb-8">Contattaci per un&apos;analisi tecnica gratuita.</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-lg font-semibold text-[#060910] hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)", boxShadow: "0 8px 32px rgba(201,164,76,.25)" }}
          >
            Richiedi una consulenza
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
