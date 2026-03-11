import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { InValue } from "@libsql/client";
import db from "@/lib/db";

const INTERNAL_ROW_ID = "__rowid__";

type ColumnInfo = {
  Field: string;
  Type: string;
  Key: string;
  Null: "YES" | "NO";
  Default: unknown;
};

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

function sanitizeIdentifier(name: string) {
  const safe = sanitize(name);
  if (!safe) {
    throw new Error("Identificatore non valido");
  }

  return safe;
}

function quoteIdentifier(name: string) {
  return `"${sanitizeIdentifier(name)}"`;
}

function rowToObj(row: unknown, columns: string[]): Record<string, unknown> {
  if (row && typeof row === "object" && !Array.isArray(row)) {
    return row as Record<string, unknown>;
  }

  const r = row as ArrayLike<unknown>;
  return Object.fromEntries(columns.map((col, i) => [col, r[i]]));
}

async function getTableColumns(table: string): Promise<ColumnInfo[]> {
  const safeTable = sanitizeIdentifier(table);
  const result = await db.execute(`SELECT * FROM pragma_table_info('${safeTable}')`);

  return result.rows.map((row) => {
    const data = rowToObj(row, result.columns);
    return {
      Field: String(data.name),
      Type: String(data.type ?? "TEXT"),
      Key: Number(data.pk ?? 0) > 0 ? "PRI" : "",
      Null: Number(data.notnull ?? 0) > 0 ? "NO" : "YES",
      Default: data.dflt_value ?? null,
    };
  });
}

function getIdentityColumns(columns: ColumnInfo[]) {
  const primaryKeys = columns.filter((column) => column.Key === "PRI").map((column) => column.Field);
  return primaryKeys.length > 0 ? primaryKeys : [INTERNAL_ROW_ID];
}

function normalizeValue(value: unknown, type = "TEXT"): InValue {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean" || typeof value === "bigint") {
    if (typeof value !== "string") {
      return value;
    }

    const normalizedType = type.toUpperCase();
    if (value === "") {
      return /INT|REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(normalizedType) ? null : value;
    }

    if (/INT/.test(normalizedType)) {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? value : parsed;
    }

    if (/REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(normalizedType)) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }

    return value;
  }

  return JSON.stringify(value);
}

function buildWhereClause(
  where: Record<string, unknown>,
  typeByColumn: Map<string, string>
) {
  const entries = Object.entries(where).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    throw new Error("Identificatore record mancante");
  }

  return {
    sql: entries
      .map(([column]) => (column === INTERNAL_ROW_ID ? "rowid = ?" : `${quoteIdentifier(column)} = ?`))
      .join(" AND "),
    args: entries.map(([column, value]) => normalizeValue(value, typeByColumn.get(column))),
  };
}

function toDbEntries(
  data: Record<string, unknown>,
  typeByColumn: Map<string, string>,
  excludedColumns = new Set<string>()
) {
  return Object.entries(data)
    .filter(([column, value]) => !excludedColumns.has(column) && value !== undefined && typeByColumn.has(column))
    .map(([column, value]) => [column, normalizeValue(value, typeByColumn.get(column))] as const);
}

export async function GET(req: NextRequest) {
  if (!(await isAuth())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "tables") {
      const result = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );
      const tables = result.rows.map((r) => r.name as string);
      return NextResponse.json({ ok: true, tables });
    }

    if (action === "columns") {
      const table = sanitizeIdentifier(searchParams.get("table") ?? "");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      const columns = await getTableColumns(table);
      return NextResponse.json({ ok: true, columns, identityColumns: getIdentityColumns(columns) });
    }

    if (action === "data") {
      const table = sanitizeIdentifier(searchParams.get("table") ?? "");
      if (!table) return NextResponse.json({ ok: false, error: "table required" }, { status: 400 });
      const columns = await getTableColumns(table);
      const result = await db.execute(`SELECT rowid AS "${INTERNAL_ROW_ID}", * FROM ${quoteIdentifier(table)} LIMIT 500`);
      const rows = result.rows.map((row) => rowToObj(row, result.columns));
      return NextResponse.json({ ok: true, rows, identityColumns: getIdentityColumns(columns) });
    }

    if (action === "stats") {
      const tablesResult = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );
      const tableNames = tablesResult.rows.map((r) => r.name as string);

      const stats = await Promise.all(
        tableNames.map(async (t) => {
          const safe = sanitizeIdentifier(t);
          const cnt = await db.execute(`SELECT COUNT(*) as cnt FROM ${quoteIdentifier(safe)}`);
          const countRow = rowToObj(cnt.rows[0], cnt.columns);
          return { table: t, count: Number(countRow.cnt ?? 0) };
        })
      );
      return NextResponse.json({ ok: true, stats });
    }

    if (action === "fk_options") {
      const table = sanitizeIdentifier(searchParams.get("table") ?? "");
      const col = searchParams.get("col") ?? "";
      if (!table || !col) return NextResponse.json({ ok: false, error: "table and col required" }, { status: 400 });

      const fkResult = await db.execute(
        `SELECT "table", "to" FROM pragma_foreign_key_list('${table}') WHERE "from" = ?`,
        [col]
      );

      if (fkResult.rows.length === 0) return NextResponse.json({ ok: true, options: null });

      const fkRow = rowToObj(fkResult.rows[0], fkResult.columns);
      const refTable = sanitizeIdentifier(String(fkRow.table));
      const refCol = sanitizeIdentifier(String(fkRow.to));
      const opts = await db.execute(`SELECT ${quoteIdentifier(refCol)} FROM ${quoteIdentifier(refTable)}`);
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
      const safe = sanitizeIdentifier(table);
      const columns = await getTableColumns(safe);
      const typeByColumn = new Map(columns.map((column) => [column.Field, column.Type]));
      const entries = toDbEntries(data, typeByColumn, new Set([INTERNAL_ROW_ID]));

      if (entries.length === 0) {
        return NextResponse.json({ ok: false, error: "Nessun campo valido da inserire" }, { status: 400 });
      }

      const cols = entries.map(([column]) => quoteIdentifier(column)).join(", ");
      const placeholders = entries.map(() => "?").join(", ");
      const args = entries.map(([, value]) => value);
      const result = await db.execute(`INSERT INTO ${quoteIdentifier(safe)} (${cols}) VALUES (${placeholders})`, args);
      return NextResponse.json({ ok: true, insertId: result.lastInsertRowid?.toString() ?? null });
    }

    if (action === "update") {
      const { table, data, where } = body as {
        table: string;
        data: Record<string, unknown>;
        where: Record<string, unknown>;
      };
      const safe = sanitizeIdentifier(table);
      const columns = await getTableColumns(safe);
      const typeByColumn = new Map(columns.map((column) => [column.Field, column.Type]));
      const entries = toDbEntries(data, typeByColumn, new Set([INTERNAL_ROW_ID]));
      if (entries.length === 0) {
        return NextResponse.json({ ok: false, error: "Nessun campo valido da aggiornare" }, { status: 400 });
      }

      const setClauses = entries.map(([column]) => `${quoteIdentifier(column)} = ?`).join(", ");
      const setArgs = entries.map(([, value]) => value);
      const whereClause = buildWhereClause(where, typeByColumn);

      await db.execute(
        `UPDATE ${quoteIdentifier(safe)} SET ${setClauses} WHERE ${whereClause.sql}`,
        [...setArgs, ...whereClause.args]
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { table, where } = body as { table: string; where: Record<string, unknown> };
      const safe = sanitizeIdentifier(table);
      const columns = await getTableColumns(safe);
      const typeByColumn = new Map(columns.map((column) => [column.Field, column.Type]));
      const whereClause = buildWhereClause(where, typeByColumn);
      await db.execute(`DELETE FROM ${quoteIdentifier(safe)} WHERE ${whereClause.sql}`, whereClause.args);
      return NextResponse.json({ ok: true });
    }

    if (action === "drop") {
      const { table } = body as { table: string };
      const safe = sanitizeIdentifier(table);
      await db.execute(`DROP TABLE ${quoteIdentifier(safe)}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
