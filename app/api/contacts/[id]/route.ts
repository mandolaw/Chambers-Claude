import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const contact = await prisma.contact.update({
    where: { id },
    data: {
      name: String(body?.name ?? existing.name).trim(),
      role: String(body?.role ?? existing.role).trim(),
      phone: String(body?.phone ?? existing.phone).trim(),
      email: String(body?.email ?? existing.email).trim(),
    },
  });

  return NextResponse.json({ contact });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
