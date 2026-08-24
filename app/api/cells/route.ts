import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inviteCode } from "@/lib/week";
import { requireVerifiedUser } from "@/lib/authGuard";

// Create a new Cell and make the current user its first member.
export async function POST(req: Request) {
  const guard = await requireVerifiedUser();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { userId } = guard;

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim() || "My Cell";

  let code = inviteCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.cell.findUnique({ where: { inviteCode: code } });
    if (!clash) break;
    code = inviteCode();
  }

  const cell = await prisma.cell.create({
    data: {
      name,
      inviteCode: code,
      createdById: userId,
      memberships: { create: { userId } },
    },
  });

  return NextResponse.json({ cell });
}
