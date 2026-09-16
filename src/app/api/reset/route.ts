import { NextRequest, NextResponse } from "next/server";
import { resetRoom } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const room = (body?.room || "").trim().toUpperCase();
  const pin = body?.pin || "";

  if (!room) {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }

  const facilitatorPin = process.env.FACILITATOR_PIN;
  if (facilitatorPin && pin !== facilitatorPin) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  await resetRoom(room);
  return NextResponse.json({ ok: true });
}
