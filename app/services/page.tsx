"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface CoworkData {
  umano: string[];
  macchina: string[];
  sinergia: string;
  kpi: string;
}

interface Service {
  icon: string;
  title: string;
  desc: string;
  features: string[];
  cowork: CoworkData;
}

const services: Service[] = [
  {
    icon: "⚡",
    title: "Progettazione PCB",
    desc: "Schede mono e multi-layer ad alta densità. Design DFM, ottimizzazione termica, test AOI e X-Ray. Supporto da 1 prototipo a lotti industriali.",
    features: ["Fino a 16 layer", "Componenti SMD 0201", "Test ICT & Flying Probe", "Certificazione IPC-A-610"],
    cowork: {
      umano: [
        "Definisce i requisiti elettrici e i vincoli di progetto",
        "Approva le scelte topologiche e di routing",
        "Interpreta i risultati di simulazione e ottimizza",
      ],
      macchina: [
        "EDA esegue DRC/ERC in tempo reale ad ogni modifica",
        "AOI rileva automaticamente anomalie post-produzione",
        "Flying Probe testa ogni nodo elettrico senza fixture",
      ],
      sinergia:
        "L'ingegnere lavora con il feedback continuo dell'EDA: ogni errore viene segnalato istantaneamente, trasformando il progetto in un dialogo tra intuizione umana e validazione automatica.",
      kpi: "−65% errori di design grazie al DRC assistito in tempo reale",
    },
  },
  {
    icon: "🌐",
    title: "Soluzioni IoT",
    desc: "Ecosistemi IoT completi: sensori industriali, gateway, cloud integration e dashboard di monitoraggio real-time.",
    features: ["Protocolli MQTT/AMQP", "Edge computing", "OTA updates", "Dashboard personalizzate"],
    cowork: {
      umano: [
        "Configura soglie di allarme e logiche di risposta",
        "Interpreta le anomalie e prende decisioni operative",
        "Aggiorna le policy di monitoraggio e i KPI target",
      ],
      macchina: [
        "Raccoglie dati da sensori con latenza < 1 ms",
        "Invia alert intelligenti in tempo reale via MQTT",
        "Esegue OTA updates sui dispositivi da remoto",
      ],
      sinergia:
        "L'operatore riceve alert intelligenti dalla piattaforma IoT e può intervenire da remoto su qualsiasi nodo. La macchina porta i dati, l'uomo porta il giudizio decisionale.",
      kpi: "−70% tempo di risposta agli allarmi con monitoraggio continuo",
    },
  },
  {
    icon: "🥽",
    title: "Sistemi AR/VR",
    desc: "Hardware e firmware per headset AR/VR: display driver, sistema di tracking, ottimizzazione latenza.",
    features: ["Display 4K per occhio", "IMU 6-DoF", "Latenza < 10ms", "SDK dedicato"],
    cowork: {
      umano: [
        "Indossa l'headset e interagisce con ambienti misti",
        "Valida esperienze e fornisce feedback contestuale",
        "Prende decisioni guidato da overlay informativi AR",
      ],
      macchina: [
        "Traccia posizione e orientamento a 6 gradi di libertà",
        "Renderizza a 4K per occhio con < 10 ms di latenza",
        "Elabora il campo visivo con computer vision real-time",
      ],
      sinergia:
        "L'AR trasforma l'interfaccia uomo-macchina: l'operatore vede i dati della macchina sovrapposti alla realtà fisica, eliminando il gap tra contesto fisico e informazione digitale.",
      kpi: "−40% errori operativi con AR-assisted maintenance",
    },
  },
  {
    icon: "🖨️",
    title: "Stampa 3D",
    desc: "Prototipazione rapida e produzione di scocche funzionali con FDM, SLA e SLS.",
    features: ["Tolleranze ±0.1mm", "Materiali tecnici PEEK/Nylon", "Post-processing", "Reverse engineering"],
    cowork: {
      umano: [
        "Progetta il modello 3D e definisce le tolleranze",
        "Seleziona materiale e parametri di stampa",
        "Esegue il post-processing e valida la geometria finale",
      ],
      macchina: [
        "Calcola automaticamente il percorso di stampa ottimale",
        "Controlla temperatura e velocità con precisione ±0.1 mm",
        "Notifica anomalie (warping, layer delamination) in tempo reale",
      ],
      sinergia:
        "Il designer fornisce il progetto, la macchina interpreta e ottimizza la strategia di stampa. Se rileva geometrie critiche suggerisce supporti o reorienta il pezzo per massimizzare la resistenza.",
      kpi: "Iterazioni di prototipazione ridotte da 5 a 2 cicli in media",
    },
  },
  {
    icon: "⚙️",
    title: "Firmware & Embedded",
    desc: "Sviluppo software embedded per microcontrollori ARM, RISC-V e FPGA. BSP, driver e applicazioni real-time.",
    features: ["FreeRTOS / Zephyr", "Driver HAL custom", "Debug JTAG/SWD", "Certificazioni CE/FCC"],
    cowork: {
      umano: [
        "Scrive il codice e definisce le specifiche di timing",
        "Analizza il trace di debug e ottimizza gli algoritmi",
        "Valida il comportamento su hardware reale in campo",
      ],
      macchina: [
        "JTAG/SWD fornisce breakpoint hardware in tempo reale",
        "Analizzatore logico cattura forme d'onda e timing esatti",
        "Coverage tool misura automaticamente i path eseguiti",
      ],
      sinergia:
        "Il firmware engineer usa l'hardware come strumento di feedback: la macchina rivela cosa succede davvero nell'elettronica, il developer corregge in tempo reale attraverso un ciclo di sviluppo accelerato.",
      kpi: "−55% debug time con hardware tracing real-time",
    },
  },
  {
    icon: "🏭",
    title: "Manifattura & Collaudo",
    desc: "Assistenza alla produzione, setup linee automatizzate, procedure di collaudo e traceability.",
    features: ["Pick & Place automatico", "Reflow multizona", "Test bed su misura", "MES integration"],
    cowork: {
      umano: [
        "Imposta i parametri di produzione tramite HMI touchscreen",
        "Valida i risultati di collaudo e approva i lotti",
        "Interviene sulle anomalie segnalate dal sistema MES",
      ],
      macchina: [
        "Pick & Place posiziona 35.000 componenti/ora con precisione",
        "Il MES traccia ogni fase produttiva in tempo reale",
        "Il test bed esegue collaudi automatici e archivia i dati",
      ],
      sinergia:
        "L'operatore e la linea di produzione lavorano in sinergia: il MES guida l'operatore con istruzioni contestuali, mentre la macchina esegue operazioni ad alta precisione e segnala proattivamente le deviazioni.",
      kpi: "Tasso di scarto al 2.5% · produttività +73% rispetto alla media settore",
    },
  },
];

export default function ServicesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(title: string) {
    setExpandedId((prev) => (prev === title ? null : title));
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-36 pb-24 px-6"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,164,76,.12) 0%, transparent 60%), #060910",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block"
            style={{
              background: "rgba(201,164,76,.10)",
              border: "1px solid rgba(201,164,76,.3)",
              color: "#c9a44c",
            }}
          >
            Servizi
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            Soluzioni <span className="text-gradient">Complete</span>
          </h1>
          <p className="text-lg text-[#8899b4] max-w-2xl mx-auto">
            Dall&apos;idea al prodotto finito: MetaFan copre ogni fase dello sviluppo hardware con
            competenza, precisione e tecnologie all&apos;avanguardia. Ogni servizio è potenziato
            dall&apos;integrazione Industria 4.0 e dalla cooperazione uomo-macchina.
          </p>
        </div>
      </section>

      {/* I4.0 banner */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 mb-10">
        <div
          className="rounded-xl px-5 py-3.5 flex items-center gap-3"
          style={{
            background: "rgba(201,164,76,.06)",
            border: "1px solid rgba(201,164,76,.15)",
          }}
        >
          <span className="text-lg">🤝</span>
          <p className="text-xs text-[#8899b4]">
            <span className="text-[#c9a44c] font-semibold">Cowork Uomo-Macchina:</span>{" "}
            ogni scheda di servizio nasconde una sezione dedicata — clicca{" "}
            <span className="text-white font-medium">&quot;Scopri la cooperazione&quot;</span>{" "}
            per vedere come operatori e sistemi I4.0 collaborano in ogni ambito.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <section className="py-4 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map(({ icon, title, desc, features, cowork }) => {
            const isOpen = expandedId === title;
            return (
              <div
                key={title}
                className="rounded-2xl transition-all"
                style={{
                  background: isOpen
                    ? "rgba(201,164,76,.06)"
                    : "rgba(255,255,255,.03)",
                  border: `1px solid ${isOpen ? "rgba(201,164,76,.25)" : "rgba(201,164,76,.1)"}`,
                  boxShadow: isOpen
                    ? "0 8px 40px rgba(0,0,0,.4), 0 0 24px rgba(201,164,76,.1)"
                    : "none",
                  transition: "box-shadow .25s, border-color .25s, background .25s",
                }}
              >
                {/* Card header */}
                <div className="p-8 pb-6">
                  <div className="text-4xl mb-5">{icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm text-[#8899b4] leading-relaxed mb-6">{desc}</p>
                  <ul className="space-y-2 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "#c9a44c" }}
                        />
                        <span className="text-[#aabbcc]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggle(title)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{ color: isOpen ? "#c9a44c" : "#556680" }}
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] transition-all"
                      style={{
                        background: isOpen ? "rgba(201,164,76,.15)" : "rgba(255,255,255,.05)",
                        color: isOpen ? "#c9a44c" : "#8899b4",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
                    </span>
                    {isOpen ? "Chiudi dettaglio" : "Scopri la cooperazione Uomo-Macchina"}
                  </button>
                </div>

                {/* Expandable cowork panel */}
                {isOpen && (
                  <div
                    className="mx-4 mb-6 rounded-xl overflow-hidden"
                    style={{
                      border: "1px solid rgba(201,164,76,.12)",
                      background: "rgba(6,9,16,.6)",
                    }}
                  >
                    {/* Panel header */}
                    <div
                      className="px-5 py-3 flex items-center gap-2"
                      style={{
                        background: "rgba(201,164,76,.06)",
                        borderBottom: "1px solid rgba(201,164,76,.1)",
                      }}
                    >
                      <span className="text-sm">🤝</span>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#c9a44c]">
                        Cooperazione Industria 4.0 — Uomo & Macchina
                      </p>
                    </div>

                    <div className="p-5">
                      {/* Two-column roles */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Human column */}
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background: "rgba(59,130,246,.06)",
                            border: "1px solid rgba(59,130,246,.15)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">👤</span>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                              Operatore
                            </p>
                          </div>
                          <ul className="space-y-2">
                            {cowork.umano.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-[11px] text-[#8899b4] leading-snug"
                              >
                                <span className="text-blue-400 mt-px flex-shrink-0">▸</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Machine column */}
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background: "rgba(201,164,76,.06)",
                            border: "1px solid rgba(201,164,76,.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">🤖</span>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a44c" }}>
                              Sistema I4.0
                            </p>
                          </div>
                          <ul className="space-y-2">
                            {cowork.macchina.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-[11px] text-[#8899b4] leading-snug"
                              >
                                <span className="mt-px flex-shrink-0" style={{ color: "#c9a44c" }}>▸</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Bridge: sinergia */}
                      <div
                        className="rounded-xl p-4 mb-3"
                        style={{
                          background: "rgba(255,255,255,.02)",
                          border: "1px solid rgba(201,164,76,.08)",
                        }}
                      >
                        <p className="text-[11px] font-semibold text-[#c9a44c] uppercase tracking-wider mb-1.5">
                          Sinergia
                        </p>
                        <p className="text-xs text-[#8899b4] leading-relaxed italic">
                          &ldquo;{cowork.sinergia}&rdquo;
                        </p>
                      </div>

                      {/* KPI metric */}
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(34,197,94,.08)",
                          border: "1px solid rgba(34,197,94,.2)",
                        }}
                      >
                        <span className="text-[#4ade80] text-xs">✓</span>
                        <span className="text-[#4ade80] text-xs font-semibold">{cowork.kpi}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-4">Hai un progetto in mente?</h2>
          <p className="text-[#8899b4] mb-8">Contattaci per un&apos;analisi tecnica gratuita.</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-lg font-semibold text-[#060910] hover:-translate-y-0.5 transition-all"
            style={{
              background: "linear-gradient(135deg,#c9a44c,#a88630)",
              boxShadow: "0 8px 32px rgba(201,164,76,.25)",
            }}
          >
            Richiedi una consulenza
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
