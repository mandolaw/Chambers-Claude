import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inviteCode } from "@/lib/week";

// Create a new Cell and make the current user its first member.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim() || "My Cell";
  const userId = (session.user as any).id as string;

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
