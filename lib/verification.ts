import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESEND_COOLDOWN_MS = 60 * 1000; // don't let one click fire 10 emails

// Creates a fresh verification token for a user and emails it. Returns
// "cooldown" instead of sending if a token was issued too recently.
export async function issueVerificationEmail(userId: string, email: string, name: string) {
  const recent = await prisma.verificationToken.findFirst({
    where: { userId, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) return "cooldown" as const;

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  await sendVerificationEmail(email, name, token);
  return "sent" as const;
}
