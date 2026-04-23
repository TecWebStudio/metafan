import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// All valid credentials — add new accounts here
const VALID_CREDENTIALS = [
  { username: "metafan",  password: "metapassword",  role: "admin" },
  { username: "azienda",  password: "MetaFan2026!",  role: "company" },
];

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const credential = VALID_CREDENTIALS.find(
      (c) => c.username === username && c.password === password
    );

    if (credential) {
      const cookieStore = await cookies();
      // Session cookie (httpOnly — not readable by JS)
      cookieStore.set("mf_session", "1", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
        sameSite: "lax",
      });
      // User cookie (readable by JS for display purposes)
      cookieStore.set("mf_user", credential.username, {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 8,
        sameSite: "lax",
      });
      return NextResponse.json({ ok: true, role: credential.role });
    }

    return NextResponse.json(
      { ok: false, error: "Credenziali non valide" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Errore interno" }, { status: 500 });
  }
}
