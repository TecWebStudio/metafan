import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("mf_session");
  cookieStore.delete("mf_user");
  return NextResponse.json({ ok: true });
}
