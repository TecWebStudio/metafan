import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
}

async function isAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("mf_session")?.value === "1";
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

// @libsql/client Row objects are array-like: JSON.stringify loses named keys.
// This converts them to plain objects so column-name access works on the client.
function rowToObj(row: unknown, columns: string[]): Record<string, unknown> {
  const r = row as ArrayLike<unknown>;
  return Object.fromEntries(columns.map((col, i) => [col, r[i]]));
}

export async function GET(req: NextRequest) {
  if (!(await isAuth())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "tables") {
      const result = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      const tables = result.rows.map((r) => r.name as string);
      return NextResponse.json({ ok: true, tables });
    }

    if (action === "columns") {
      const table = sanitize(searchParams.get("table") ?? "");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      // Use index access — pragma rows are array-like; named props are lost on serialization
      const result = await db.execute(`SELECT name, type, pk FROM pragma_table_info(${table})`);
      const columns = result.rows.map((r) => {
        const row = r as unknown as unknown[];
        return {
          Field: row[0] as string,
          Type:  row[1] as string,
          Key:   Number(row[2]) > 0 ? "PRI" : "",
          Null:  "YES",
        };
      });
      return NextResponse.json({ ok: true, columns });
    }

    if (action === "data") {
      const table = sanitize(searchParams.get("table") ?? "");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      const result = await db.execute(`SELECT * FROM "${table}" LIMIT 500`);
      const rows = result.rows.map((row) => rowToObj(row, result.columns));
      return NextResponse.json({ ok: true, rows });
    }

    if (action === "stats") {
      const tablesResult = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      const tableNames = tablesResult.rows.map((r) => r.name as string);

      const stats = await Promise.all(
        tableNames.map(async (t) => {
          const safe = sanitize(t);
          const cnt = await db.execute(`SELECT COUNT(*) as cnt FROM "${safe}"`);
          const countRow = cnt.rows[0] as unknown as unknown[];
          return { table: t, count: Number(countRow?.[0] ?? 0) };
        })
      );
      return NextResponse.json({ ok: true, stats });
    }

    if (action === "fk_options") {
      const table = sanitize(searchParams.get("table") ?? "");
      const col = searchParams.get("col") ?? "";
      if (!table || !col) return NextResponse.json({ ok: false, error: "table and col required" }, { status: 400 });

      const fkResult = await db.execute(
        `SELECT "table", "to" FROM pragma_foreign_key_list(${table}) WHERE "from" = ?`,
        [col]
      );

      if (fkResult.rows.length === 0) return NextResponse.json({ ok: true, options: null });

      const fkRow = fkResult.rows[0] as unknown as unknown[];
      const refTable = sanitize(fkRow[0] as string);
      const refCol = fkRow[1] as string;
      const opts = await db.execute(`SELECT "${refCol}" FROM "${refTable}"`);
      const optsPlain = opts.rows.map((r) => rowToObj(r, opts.columns));
      return NextResponse.json({ ok: true, options: optsPlain.map((r) => r[refCol]) });
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
      const safe = sanitize(table);
      const cols = Object.keys(data).map((c) => `"${c}"`).join(", ");
      const placeholders = Object.keys(data).map((_, i) => `?${i + 1}`).join(", ");
      const result = await db.execute(
        { sql: `INSERT INTO "${safe}" (${cols}) VALUES (${placeholders})`, args: Object.values(data) }
      );
      return NextResponse.json({ ok: true, insertId: result.lastInsertRowid });
    }

    if (action === "update") {
      const { table, data, where } = body as {
        table: string;
        data: Record<string, unknown>;
        where: Record<string, unknown>;
      };
      const safe = sanitize(table);
      const dataVals = Object.values(data);
      const whereVals = Object.values(where);
      let idx = 1;
      const setClauses = Object.keys(data).map((c) => `"${c}" = ?${idx++}`).join(", ");
      const whereClauses = Object.keys(where).map((c) => `"${c}" = ?${idx++}`).join(" AND ");
      await db.execute({
        sql: `UPDATE "${safe}" SET ${setClauses} WHERE ${whereClauses}`,
        args: [...dataVals, ...whereVals],
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { table, where } = body as { table: string; where: Record<string, unknown> };
      const safe = sanitize(table);
      let idx = 1;
      const whereClauses = Object.keys(where).map((c) => `"${c}" = ?${idx++}`).join(" AND ");
      await db.execute({ sql: `DELETE FROM "${safe}" WHERE ${whereClauses}`, args: Object.values(where) });
      return NextResponse.json({ ok: true });
    }

    if (action === "drop") {
      const { table } = body as { table: string };
      const safe = sanitize(table);
      await db.execute(`DROP TABLE "${safe}"`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
