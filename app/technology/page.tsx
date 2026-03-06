import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const techAreas = [
  {
    area: "PCB & Circuiti",
    items: [
      { name: "Altium Designer", desc: "EDA di livello enterprise per layout multi-layer." },
      { name: "KiCad 8", desc: "Design open-source ad alto affidamento." },
      { name: "LTspice", desc: "Simulazione circuitale analogica avanzata." },
      { name: "ANSYS SIwave", desc: "Analisi SI/PI e compatibilità EMC." },
    ],
  },
  {
    area: "Firmware & Software",
    items: [
      { name: "ARM Cortex-M/A", desc: "Sviluppo bare-metal e RTOS su tutta la famiglia ARM." },
      { name: "Zephyr OS", desc: "OS embedded per IoT con stack BLE/WiFi integrato." },
      { name: "FPGA (Xilinx/Intel)", desc: "Logica custom per processamento segnali real-time." },
      { name: "Rust Embedded", desc: "Firmware memory-safe per applicazioni critiche." },
    ],
  },
  {
    area: "AR/VR & Imaging",
    items: [
      { name: "OpenXR", desc: "Standard unificato per headset AR/VR." },
      { name: "MIPI DSI/CSI", desc: "Interfacce display e camera ad alta velocità." },
      { name: "Computer Vision", desc: "SLAM, hand tracking e scene understanding." },
      { name: "Optical Design", desc: "Progettazione lenti e waveguide olografiche." },
    ],
  },
  {
    area: "Produzione & Test",
    items: [
      { name: "AOI Saki BF-Comet", desc: "Ispezione ottica automatica post-reflow." },
      { name: "X-Ray Feinfocus", desc: "Ispezione BGA e saldature nascoste." },
      { name: "Flying Probe", desc: "Test in-circuit senza fixture dedicata." },
      { name: "Climate Chamber", desc: "Test ambientali -40°C / +125°C, umidità." },
    ],
  },
];

const certifications = [
  { name: "ISO 9001:2015", desc: "Sistema di gestione qualità" },
  { name: "CE Marking", desc: "Conformità direttive europee" },
  { name: "IPC-A-610 Class 3", desc: "Accettabilità assemblaggi elettronici" },
  { name: "RoHS / REACH", desc: "Conformità materiali pericolosi" },
  { name: "UL Recognition", desc: "Certificazione sicurezza USA" },
  { name: "ISO 14001", desc: "Gestione ambientale" },
];

export default function TechnologyPage() {
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
            Tecnologie
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            Il nostro <span className="text-gradient">Stack</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            Utilizziamo strumenti di livello industriale e metodologie agili per garantire
            prodotti elettronici affidabili e all&apos;avanguardia.
          </p>
        </div>
      </section>

      {/* Tech areas */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {techAreas.map(({ area, items }) => (
          <div key={area} className="mb-16">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-0.5" style={{ background: "#c9a44c" }} />
              {area}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map(({ name, desc }) => (
                <div key={name} className="glow-card rounded-xl p-6">
                  <h4 className="font-bold text-white mb-2">{name}</h4>
                  <p className="text-sm text-[#8899b4] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Certifications */}
      <section className="py-16 px-6" style={{ background: "rgba(201,164,76,.03)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Qualità & Conformità</span>
            <h2 className="text-3xl font-black text-white mt-3">Certificazioni</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certifications.map(({ name, desc }) => (
              <div
                key={name}
                className="flex items-center gap-4 rounded-xl p-5"
                style={{ background: "rgba(201,164,76,.05)", border: "1px solid rgba(201,164,76,.12)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black"
                  style={{ background: "rgba(201,164,76,.15)", color: "#c9a44c" }}
                >
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{name}</h4>
                  <p className="text-xs text-[#8899b4]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
