import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";
import { weekStart } from "@/lib/week";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    verifiedUsers,
    dau,
    wau,
    mau,
    totalCells,
    checkInsThisWeek,
    totalPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.cell.count(),
    prisma.checkIn.count({ where: { weekStart: weekStart() } }),
    prisma.cellPost.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    verifiedUsers,
    dau,
    wau,
    mau,
    totalCells,
    checkInsThisWeek,
    totalPosts,
    generatedAt: now.toISOString(),
  });
}
