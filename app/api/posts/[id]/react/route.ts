import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const KINDS = new Set(["cross", "flame"]);

// Toggle the current user's reaction on a post. Sending the same kind again
// removes it; sending a different kind replaces it — one mark per user.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id: postId } = await params;

  const body = await req.json().catch(() => null);
  const kind = body?.kind;
  if (!KINDS.has(kind)) return NextResponse.json({ error: "Invalid reaction kind." }, { status: 400 });

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing?.kind === kind) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.reaction.update({ where: { id: existing.id }, data: { kind } });
  } else {
    await prisma.reaction.create({ data: { postId, userId, kind } });
  }

  const reactions = await prisma.reaction.findMany({ where: { postId } });
  const counts = { cross: 0, flame: 0 } as Record<string, number>;
  for (const r of reactions) counts[r.kind] = (counts[r.kind] || 0) + 1;
  const mine = reactions.find((r) => r.userId === userId);

  return NextResponse.json({ marks: counts, myMark: mine?.kind || null });
}
