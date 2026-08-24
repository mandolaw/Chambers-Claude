import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const appUrl = process.env.APP_URL || url.origin;

  const record = token ? await prisma.verificationToken.findUnique({ where: { token } }) : null;

  if (!record) {
    return NextResponse.redirect(`${appUrl}/verified?ok=0&reason=invalid`);
  }
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return NextResponse.redirect(`${appUrl}/verified?ok=0&reason=expired`);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.redirect(`${appUrl}/verified?ok=1`);
}
