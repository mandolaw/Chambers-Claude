import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { weekStart } from "@/lib/week";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id: cellId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_cellId: { userId, cellId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member of this cell." }, { status: 403 });

  const start = weekStart();
  await prisma.checkIn.upsert({
    where: { userId_cellId_weekStart: { userId, cellId, weekStart: start } },
    create: { userId, cellId, weekStart: start },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
