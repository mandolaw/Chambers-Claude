import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Cells are the one feature where other real people rely on knowing who
// they're accountable to — so creating or joining one requires a verified
// email, even though sign-in itself doesn't.
export async function requireVerifiedUser() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in.", status: 401 as const };

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  if (!user?.emailVerified) {
    return { error: "Verify your email before creating or joining a Cell.", status: 403 as const };
  }
  return { userId };
}
