import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("mf_session")?.value === "1";
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
}

export type MachineType =
  | "CNC Fresatrice 5-Assi"
  | "Pick & Place SMT"
  | "Reflow Oven IR"
  | "AOI Saki BF-Comet"
  | "Stampante 3D SLS"
  | "Laser Cutter CO₂"
  | "Saldatrice a Onda"
  | "Flying Probe Tester";

export type OrderStatus = "Superato" | "Scarto" | "Necessita revisione";

export interface ProductionOrder {
  id: number;
  codice_ordine: string;
  macchina: MachineType;
  immagine_macchina: string;
  ore_lavorate: number;
  tempo_produzione_min: number;
  consumo_kwh: number;
  consumo_standard_kwh: number;
  risorse_utilizzate: string[];
  descrizione_ciclo: string;
  esito: OrderStatus;
  data_produzione: string;
  operatore: string;
  lotto: string;
}

const MACHINE_IMAGES: Record<MachineType, string> = {
  "CNC Fresatrice 5-Assi": "/machines/cnc-5axis.svg",
  "Pick & Place SMT": "/machines/pick-place.svg",
  "Reflow Oven IR": "/machines/reflow-oven.svg",
  "AOI Saki BF-Comet": "/machines/aoi-saki.svg",
  "Stampante 3D SLS": "/machines/3d-sls.svg",
  "Laser Cutter CO₂": "/machines/laser-cutter.svg",
  "Saldatrice a Onda": "/machines/wave-solder.svg",
  "Flying Probe Tester": "/machines/flying-probe.svg",
};

const MACHINE_SPECS: Record<MachineType, { risorse: string[]; descrizione: string }> = {
  "CNC Fresatrice 5-Assi": {
    risorse: ["Alluminio 6061-T6", "Utensili in carburo", "Refrigerante sintetico"],
    descrizione: "Fresatura multiasse ad alta precisione con tolleranze ±0.01mm.",
  },
  "Pick & Place SMT": {
    risorse: ["Componenti SMD", "Pasta saldante SAC305", "Stencil acciaio"],
    descrizione: "Posizionamento automatico componenti SMD a 35.000 CPH.",
  },
  "Reflow Oven IR": {
    risorse: ["Azoto N₂", "Profilo termico custom", "Conveyor belt"],
    descrizione: "Saldatura reflow a infrarossi con profilo termico a 5 zone.",
  },
  "AOI Saki BF-Comet": {
    risorse: ["Telecamere 20MP", "Illuminazione LED multiangolo", "Database difetti"],
    descrizione: "Ispezione ottica automatica post-reflow con AI per rilevamento difetti.",
  },
  "Stampante 3D SLS": {
    risorse: ["Nylon PA12", "Polvere riciclata 40%", "Laser 60W CO₂"],
    descrizione: "Sinterizzazione laser selettiva per prototipi funzionali e scocche.",
  },
  "Laser Cutter CO₂": {
    risorse: ["Lastra acrilica 5mm", "Gas assist aria", "Lente ZnSe"],
    descrizione: "Taglio e incisione laser fino a 25mm su materiali non metallici.",
  },
  "Saldatrice a Onda": {
    risorse: ["Lega Sn63/Pb37", "Flux no-clean", "Pallet di trasporto"],
    descrizione: "Saldatura a onda per componenti through-hole ad alta affidabilità.",
  },
  "Flying Probe Tester": {
    risorse: ["Sonde micro-punta", "Software test NetList", "Fixture reference"],
    descrizione: "Test elettrico in-circuit senza fixture dedicata, ideale per prototipi.",
  },
};

function generateOrders(): ProductionOrder[] {
  const machines = Object.keys(MACHINE_SPECS) as MachineType[];
  const esiti: OrderStatus[] = ["Superato", "Superato", "Superato", "Superato", "Scarto", "Necessita revisione"];
  const operatori = ["M. Rossi", "L. Bianchi", "A. Ferrari", "G. Conti", "P. Moretti"];
  const orders: ProductionOrder[] = [];

  for (let i = 1; i <= 24; i++) {
    const macchina = machines[(i - 1) % machines.length];
    const spec = MACHINE_SPECS[macchina];
    // Clamp ore to minimum 0.5 to prevent negative values from Math.sin oscillation
    const ore = Math.max(0.5, +(1.5 + Math.abs(Math.sin(i)) * 3 + Math.random() * 2).toFixed(1));
    const tempoMin = Math.max(1, Math.round(ore * 60 * (0.7 + Math.random() * 0.3)));
    const consumoStd = Math.max(0.1, +(ore * (3.5 + Math.random())).toFixed(1));
    const consumo = Math.max(0.1, +(consumoStd * (0.82 + Math.random() * 0.12)).toFixed(1));
    const giorno = String(Math.max(1, i % 28 + 1)).padStart(2, "0");

    orders.push({
      id: i,
      codice_ordine: `ORD-2026-${String(i).padStart(4, "0")}`,
      macchina,
      immagine_macchina: MACHINE_IMAGES[macchina],
      ore_lavorate: ore,
      tempo_produzione_min: tempoMin,
      consumo_kwh: consumo,
      consumo_standard_kwh: consumoStd,
      risorse_utilizzate: spec.risorse,
      descrizione_ciclo: spec.descrizione,
      esito: esiti[i % esiti.length],
      data_produzione: `2026-03-${giorno}`,
      operatore: operatori[i % operatori.length],
      lotto: `LOT-${String(Math.ceil(i / 4)).padStart(3, "0")}`,
    });
  }

  return orders;
}

export interface AggregatedStats {
  totale_ordini: number;
  ore_totali: number;
  consumo_totale_kwh: number;
  consumo_standard_totale_kwh: number;
  risparmio_percentuale: number;
  tasso_superamento: number;
  tempo_medio_min: number;
  per_macchina: {
    macchina: MachineType;
    ordini: number;
    ore: number;
    consumo_kwh: number;
    consumo_standard_kwh: number;
    risparmio_pct: number;
    tasso_superamento: number;
  }[];
}

function aggregateStats(orders: ProductionOrder[]): AggregatedStats {
  const totale = orders.length;
  const oreTotali = +orders.reduce((s, o) => s + o.ore_lavorate, 0).toFixed(1);
  const consumoTotale = +orders.reduce((s, o) => s + o.consumo_kwh, 0).toFixed(1);
  const consumoStdTotale = +orders.reduce((s, o) => s + o.consumo_standard_kwh, 0).toFixed(1);
  const superati = orders.filter((o) => o.esito === "Superato").length;
  const tempoMedio = Math.round(orders.reduce((s, o) => s + o.tempo_produzione_min, 0) / totale);

  const byMachine = new Map<MachineType, ProductionOrder[]>();
  for (const o of orders) {
    const existing = byMachine.get(o.macchina) ?? [];
    existing.push(o);
    byMachine.set(o.macchina, existing);
  }

  const perMacchina = Array.from(byMachine.entries()).map(([macchina, group]) => {
    const cons = +group.reduce((s, o) => s + o.consumo_kwh, 0).toFixed(1);
    const consStd = +group.reduce((s, o) => s + o.consumo_standard_kwh, 0).toFixed(1);
    return {
      macchina,
      ordini: group.length,
      ore: +group.reduce((s, o) => s + o.ore_lavorate, 0).toFixed(1),
      consumo_kwh: cons,
      consumo_standard_kwh: consStd,
      risparmio_pct: consStd > 0 ? +((1 - cons / consStd) * 100).toFixed(1) : 0,
      tasso_superamento: +((group.filter((o) => o.esito === "Superato").length / group.length) * 100).toFixed(0),
    };
  });

  return {
    totale_ordini: totale,
    ore_totali: oreTotali,
    consumo_totale_kwh: consumoTotale,
    consumo_standard_totale_kwh: consumoStdTotale,
    risparmio_percentuale: consumoStdTotale > 0 ? +((1 - consumoTotale / consumoStdTotale) * 100).toFixed(1) : 0,
    tasso_superamento: +((superati / totale) * 100).toFixed(0),
    tempo_medio_min: tempoMedio,
    per_macchina: perMacchina,
  };
}

const cachedOrders = generateOrders();
const cachedStats = aggregateStats(cachedOrders);

export async function GET() {
  if (!(await isAuth())) return unauthorized();

  return NextResponse.json({
    ok: true,
    orders: cachedOrders,
    stats: cachedStats,
  });
}
