import { NextRequest, NextResponse } from "next/server";
import { deleteResponse, resetRoom } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const room = (body?.room || "").trim().toUpperCase();
  const pin = body?.pin || "";
  const id = body?.id as string | undefined;

  if (!room) {
    return NextResponse.json({ error: "Falta el código de sesión" }, { status: 400 });
  }

  const facilitatorPin = process.env.FACILITATOR_PIN;
  if (facilitatorPin && pin !== facilitatorPin) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  if (id) {
    await deleteResponse(room, id);
  } else {
    await resetRoom(room);
  }
  return NextResponse.json({ ok: true });
}
