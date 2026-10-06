import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, service: "atlas-coast" });
}

export function HEAD() {
  return new NextResponse(null, { status: 200 });
}
