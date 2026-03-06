import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
}

async function isAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("mf_session")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!(await isAuth())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "tables") {
      const [rows] = await pool.query<RowDataPacket[]>("SHOW TABLES");
      const key = Object.keys(rows[0] || {})[0];
      const tables = rows.map((r) => r[key] as string);
      return NextResponse.json({ ok: true, tables });
    }

    if (action === "columns") {
      const table = searchParams.get("table");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      const [rows] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM ??", [table]);
      return NextResponse.json({ ok: true, columns: rows });
    }

    if (action === "data") {
      const table = searchParams.get("table");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM ?? LIMIT 500", [table]);
      return NextResponse.json({ ok: true, rows });
    }

    if (action === "stats") {
      const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES");
      const key = Object.keys(tables[0] || {})[0];
      const tableNames = tables.map((r) => r[key] as string);

      const stats = await Promise.all(
        tableNames.map(async (t) => {
          const [[cnt]] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as cnt FROM ??",
            [t]
          );
          return { table: t, count: cnt.cnt as number };
        })
      );
      return NextResponse.json({ ok: true, stats });
    }

    if (action === "fk_options") {
      const table = searchParams.get("table");
      const col = searchParams.get("col");
      if (!table || !col) return NextResponse.json({ ok: false, error: "table and col required" }, { status: 400 });
      // Try to find referenced table from information_schema
      const [fkRows] = await pool.query<RowDataPacket[]>(
        `SELECT REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [table, col]
      );
      if (fkRows.length === 0) return NextResponse.json({ ok: true, options: null });
      const refTable = fkRows[0].REFERENCED_TABLE_NAME as string;
      const refCol = fkRows[0].REFERENCED_COLUMN_NAME as string;
      const [opts] = await pool.query<RowDataPacket[]>("SELECT ?? FROM ??", [refCol, refTable]);
      return NextResponse.json({ ok: true, options: opts.map((r) => r[refCol]) });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuth())) return unauthorized();

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "insert") {
      const { table, data } = body as { table: string; data: Record<string, unknown> };
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const placeholders = cols.map(() => "?").join(", ");
      const colList = cols.map((c) => `\`${c}\``).join(", ");
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`,
        vals
      );
      return NextResponse.json({ ok: true, insertId: result.insertId });
    }

    if (action === "update") {
      const { table, data, where } = body as {
        table: string;
        data: Record<string, unknown>;
        where: Record<string, unknown>;
      };
      const setClauses = Object.keys(data).map((c) => `\`${c}\` = ?`).join(", ");
      const whereClauses = Object.keys(where).map((c) => `\`${c}\` = ?`).join(" AND ");
      const vals = [...Object.values(data), ...Object.values(where)];
      await pool.query(
        `UPDATE \`${table}\` SET ${setClauses} WHERE ${whereClauses}`,
        vals
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { table, where } = body as {
        table: string;
        where: Record<string, unknown>;
      };
      const whereClauses = Object.keys(where).map((c) => `\`${c}\` = ?`).join(" AND ");
      await pool.query(`DELETE FROM \`${table}\` WHERE ${whereClauses}`, Object.values(where));
      return NextResponse.json({ ok: true });
    }

    if (action === "drop") {
      const { table } = body as { table: string };
      await pool.query(`DROP TABLE \`${table}\``);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
