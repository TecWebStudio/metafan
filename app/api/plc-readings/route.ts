import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

async function isAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("mf_session")?.value === "1";
}

export interface PlcReading {
  id_rilevazione: number;
  id_linea: number;
  id_parametro: string;
  nome_parametro: string;
  unita_misura: string;
  valore: number;
  timestamp: string;
}

export async function GET() {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const result = await db.execute(`
      SELECT
        r.id_rilevazione,
        r.id_linea,
        r.id_parametro,
        COALESCE(p.nome_parametro, r.id_parametro) AS nome_parametro,
        COALESCE(p.unita_misura, '')               AS unita_misura,
        r.valore,
        r.timestamp
      FROM rilevazione_processo r
      LEFT JOIN parametro_processo p ON p.id_parametro = r.id_parametro
      ORDER BY r.timestamp DESC, r.id_rilevazione DESC
      LIMIT 500
    `);

    const readings: PlcReading[] = result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id_rilevazione: Number(r.id_rilevazione ?? 0),
        id_linea:        Number(r.id_linea ?? 0),
        id_parametro:    String(r.id_parametro ?? ""),
        nome_parametro:  String(r.nome_parametro ?? ""),
        unita_misura:    String(r.unita_misura ?? ""),
        valore:          Number(r.valore ?? 0),
        timestamp:       String(r.timestamp ?? ""),
      };
    });

    return NextResponse.json({ ok: true, readings });
  } catch (error) {
    console.error("Errore lettura rilevazioni PLC:", error);
    return NextResponse.json({ ok: false, error: "Errore caricamento dati PLC" }, { status: 500 });
  }
}
