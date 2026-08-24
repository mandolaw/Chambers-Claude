import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const contacts = await prisma.contact.findMany({ where: { userId }, orderBy: { name: "asc" } });
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const contact = await prisma.contact.create({
    data: {
      userId,
      name,
      role: String(body?.role || "").trim(),
      phone: String(body?.phone || "").trim(),
      email: String(body?.email || "").trim(),
    },
  });

  return NextResponse.json({ contact });
}
