import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const code = String(body?.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });

  const userId = (session.user as any).id as string;
  const cell = await prisma.cell.findUnique({ where: { inviteCode: code } });
  if (!cell) return NextResponse.json({ error: "No cell found with that code." }, { status: 404 });

  await prisma.membership.upsert({
    where: { userId_cellId: { userId, cellId: cell.id } },
    create: { userId, cellId: cell.id },
    update: {},
  });

  return NextResponse.json({ cell });
}
