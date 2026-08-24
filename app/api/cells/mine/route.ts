import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { weekStart } from "@/lib/week";

// Returns the current user's Cell (first membership, v1 supports one Cell
// per person), its members, and who has checked in this week.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { cell: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) return NextResponse.json({ cell: null, members: [], posts: [] });

  const cell = membership.cell;
  const start = weekStart();

  const [memberships, checkIns, posts] = await Promise.all([
    prisma.membership.findMany({
      where: { cellId: cell.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.checkIn.findMany({ where: { cellId: cell.id, weekStart: start } }),
    prisma.cellPost.findMany({
      where: { cellId: cell.id },
      include: {
        author: { select: { id: true, name: true } },
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const checkedInIds = new Set(checkIns.map((c) => c.userId));

  const members = memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    checkedIn: checkedInIds.has(m.user.id),
  }));

  const postsOut = posts.map((p) => {
    const counts = { cross: 0, flame: 0 } as Record<string, number>;
    let myMark: string | null = null;
    for (const r of p.reactions) {
      counts[r.kind] = (counts[r.kind] || 0) + 1;
      if (r.userId === userId) myMark = r.kind;
    }
    return {
      id: p.id,
      author: p.author.name,
      authorId: p.authorId,
      text: p.text,
      type: p.kind,
      createdAt: p.createdAt,
      marks: counts,
      myMark,
    };
  });

  return NextResponse.json({
    cell: { id: cell.id, name: cell.name, inviteCode: cell.inviteCode },
    members,
    posts: postsOut,
  });
}
