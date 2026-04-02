import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

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

const comparisonData = [
  {
    category: "Consumo Energetico per Ciclo",
    traditional: "4.8 kWh",
    optimized: "3.2 kWh",
    saving: "-33%",
    insight: "Il monitoraggio in tempo reale e gli algoritmi di ottimizzazione riducono il consumo senza impattare la produttività.",
  },
  {
    category: "Tempo Setup Macchina",
    traditional: "45 min",
    optimized: "12 min",
    saving: "-73%",
    insight: "Configurazione automatica dei parametri tramite ricette digitali e cambio formato assistito da HMI.",
  },
  {
    category: "Tasso di Scarto",
    traditional: "8%",
    optimized: "2.5%",
    saving: "-69%",
    insight: "L'ispezione AOI inline con AI predittiva intercetta i difetti prima che si propaghino nel processo.",
  },
  {
    category: "Tempo di Fermo Macchina",
    traditional: "12h/mese",
    optimized: "3h/mese",
    saving: "-75%",
    insight: "Manutenzione predittiva basata su dati vibrazionali e termici raccolti dalla sensoristica IoT integrata.",
  },
  {
    category: "Tracciabilità Componenti",
    traditional: "Manuale / Parziale",
    optimized: "100% Digitale",
    saving: "Full",
    insight: "Ogni componente è tracciato dal ricevimento allo stoccaggio, garantendo piena conformità e recall rapidi.",
  },
  {
    category: "Interazione Operatore",
    traditional: "Pannello fisico + carta",
    optimized: "HMI Touch + Dashboard",
    saving: "+80% UX",
    insight: "L'operatore visualizza KPI, allarmi e istruzioni sul display della macchina, riducendo errori del 40%.",
  },
];

const i40Pillars = [
  {
    icon: "⚡",
    title: "Riduzione Consumi",
    desc: "Ogni fase produttiva è monitorata per minimizzare i kWh per pezzo. Algoritmi di scheduling ottimizzano l'accensione e lo standby delle macchine in base al carico di lavoro.",
    metric: "Fino a -33% di consumo per ciclo",
  },
  {
    icon: "🔗",
    title: "Integrazione Verticale Dati",
    desc: "I dati fluiscono automaticamente dal sensore di macchina al MES, all'ERP e alla dashboard direzionale. Ogni reparto — dalla produzione alla qualità — accede agli stessi dati in tempo reale, eliminando silos informativi.",
    metric: "0 silos — dati condivisi con tutti i reparti",
  },
  {
    icon: "🖥️",
    title: "Contatto Uomo-Macchina (HMI)",
    desc: "Interfacce operatore touchscreen mostrano stato macchina, istruzioni di lavoro e alert in tempo reale. L'operaio non è sostituito dalla macchina: è potenziato dai dati, con procedure guidate che riducono gli errori e accelerano la formazione.",
    metric: "+80% usabilità rispetto ai pannelli tradizionali",
  },
  {
    icon: "📊",
    title: "Business Intelligence",
    desc: "La dashboard analizza consumi, tempi e qualità per ogni macchina e ordine. Il sistema non si limita a mostrare numeri: interpreta i dati e suggerisce azioni correttive, trasformando informazioni grezze in decisioni operative.",
    metric: "Analisi real-time su ogni ordine produttivo",
  },
];

const machines = [
  { name: "CNC Fresatrice 5-Assi", image: "/machines/cnc-5axis.svg", type: "optimized" },
  { name: "Pick & Place SMT", image: "/machines/pick-place.svg", type: "optimized" },
  { name: "Reflow Oven IR", image: "/machines/reflow-oven.svg", type: "optimized" },
  { name: "AOI Saki BF-Comet", image: "/machines/aoi-saki.svg", type: "optimized" },
  { name: "Stampante 3D SLS", image: "/machines/3d-sls.svg", type: "optimized" },
  { name: "Laser Cutter CO₂", image: "/machines/laser-cutter.svg", type: "optimized" },
  { name: "Saldatrice a Onda", image: "/machines/wave-solder.svg", type: "optimized" },
  { name: "Flying Probe Tester", image: "/machines/flying-probe.svg", type: "optimized" },
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
            Tecnologie & Industria 4.0
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            Il nostro <span className="text-gradient">Stack</span> Ottimizzato
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            Confronta le nostre macchine ottimizzate con gli standard di mercato.
            L&apos;integrazione Industria 4.0 riduce consumi, scarti e tempi, potenziando il lavoro dell&apos;operatore.
          </p>
        </div>
      </section>

      {/* Industry 4.0 Pillars */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Adattabilità</span>
          <h2 className="text-3xl font-black text-white mt-3">L&apos;Approccio Industria 4.0</h2>
          <p className="text-sm text-[#8899b4] max-w-xl mx-auto mt-3">
            Non solo automazione: i dati diventano il motore dell&apos;efficienza. Ecco i pilastri della nostra trasformazione digitale.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {i40Pillars.map(({ icon, title, desc, metric }) => (
            <div
              key={title}
              className="glow-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>
              <p className="text-sm text-[#8899b4] leading-relaxed mb-4">{desc}</p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.15)", color: "#4ade80" }}
              >
                ✓ {metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section: Traditional vs Optimized */}
      <section className="py-20 px-6" style={{ background: "rgba(201,164,76,.02)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Comparazione</span>
            <h2 className="text-3xl font-black text-white mt-3">Mercato vs MetaFan</h2>
            <p className="text-sm text-[#8899b4] max-w-xl mx-auto mt-3">
              Un confronto diretto tra macchine tradizionali e le nostre soluzioni ottimizzate per l&apos;Industria 4.0.
            </p>
          </div>

          {/* Comparison Table — Desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl" style={{ border: "1px solid rgba(201,164,76,.12)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(201,164,76,.06)" }}>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8899b4]">Parametro</th>
                  <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-red-400/80">
                    🏭 Macchine Tradizionali
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#4ade80" }}>
                    ⚡ MetaFan Ottimizzate
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a44c" }}>
                    Miglioramento
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(({ category, traditional, optimized, saving, insight }, i) => (
                  <tr
                    key={category}
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,.01)" : "rgba(255,255,255,.03)",
                      borderBottom: "1px solid rgba(201,164,76,.06)",
                    }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white text-sm">{category}</p>
                      <p className="text-[11px] text-[#8899b4] mt-1 leading-relaxed max-w-xs">{insight}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,.08)", color: "#f87171" }}>
                        {traditional}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(34,197,94,.08)", color: "#4ade80" }}>
                        {optimized}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black" style={{ color: "#c9a44c" }}>{saving}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparison Cards — Mobile */}
          <div className="md:hidden space-y-4">
            {comparisonData.map(({ category, traditional, optimized, saving, insight }) => (
              <div
                key={category}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(201,164,76,.12)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-sm">{category}</h4>
                  <span className="text-sm font-black" style={{ color: "#c9a44c" }}>{saving}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center rounded-lg p-2" style={{ background: "rgba(239,68,68,.06)" }}>
                    <p className="text-[10px] text-[#8899b4] uppercase mb-1">Tradizionale</p>
                    <p className="text-xs font-medium text-red-400">{traditional}</p>
                  </div>
                  <div className="text-center rounded-lg p-2" style={{ background: "rgba(34,197,94,.06)" }}>
                    <p className="text-[10px] text-[#8899b4] uppercase mb-1">MetaFan</p>
                    <p className="text-xs font-bold text-[#4ade80]">{optimized}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#8899b4] leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Machines Gallery */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Il Nostro Parco Macchine</span>
          <h2 className="text-3xl font-black text-white mt-3">Macchine Ottimizzate</h2>
          <p className="text-sm text-[#8899b4] max-w-xl mx-auto mt-3">
            Ogni macchina è integrata con sensoristica IoT per il monitoraggio in tempo reale, 
            interfacce HMI per l&apos;operatore e connessione diretta al sistema MES aziendale.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {machines.map(({ name, image }) => (
            <div
              key={name}
              className="glow-card rounded-xl p-5 flex flex-col items-center text-center"
            >
              <Image src={image} alt={name} width={80} height={80} className="mb-3 opacity-80" />
              <h4 className="font-bold text-white text-sm">{name}</h4>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,.1)", color: "#4ade80" }}>
                ✓ Industria 4.0
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech areas */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a44c" }}>Stack Tecnologico</span>
          <h2 className="text-3xl font-black text-white mt-3">Strumenti & Competenze</h2>
        </div>
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
