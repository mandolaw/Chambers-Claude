import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: "Already verified." }, { status: 400 });

  const result = await issueVerificationEmail(user.id, user.email, user.name);
  if (result === "cooldown") {
    return NextResponse.json({ error: "A verification email was just sent — check your inbox, or try again in a minute." }, { status: 429 });
  }
  return NextResponse.json({ ok: true });
}
