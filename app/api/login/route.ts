import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CREDENTIALS = { username: "metafan", password: "metapassword" };

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      const cookieStore = await cookies();
      cookieStore.set("mf_session", "1", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
        sameSite: "lax",
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Credenziali non valide" }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Errore interno" }, { status: 500 });
  }
}
