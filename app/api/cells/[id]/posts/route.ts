import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const KINDS = new Set(["verse", "weight", "prayer"]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id: cellId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_cellId: { userId, cellId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member of this cell." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const text = String(body?.text || "").trim();
  const kind = KINDS.has(body?.type) ? body.type : "prayer";
  if (!text) return NextResponse.json({ error: "Post text is required." }, { status: 400 });

  const post = await prisma.cellPost.create({
    data: { cellId, authorId: userId, text: text.slice(0, 2000), kind },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({
    post: {
      id: post.id,
      author: post.author.name,
      authorId: post.authorId,
      text: post.text,
      type: post.kind,
      createdAt: post.createdAt,
      marks: { cross: 0, flame: 0 },
      myMark: null,
    },
  });
}
