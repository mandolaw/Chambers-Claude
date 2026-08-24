import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/authGuard";

export async function POST(req: Request) {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { userId } = guard;

  const body = await req.json().catch(() => null);
  const code = String(body?.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });

  const cell = await prisma.cell.findUnique({ where: { inviteCode: code } });
  if (!cell) return NextResponse.json({ error: "No cell found with that code." }, { status: 404 });

  await prisma.membership.upsert({
    where: { userId_cellId: { userId, cellId: cell.id } },
    create: { userId, cellId: cell.id },
    update: {},
  });

  return NextResponse.json({ cell });
}
