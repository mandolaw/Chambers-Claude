import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      if (token.id) recordActivity(token.id as string);
      return session;
    },
  },
});

// Fire-and-forget: mark the user active for today. Only ever recorded for
// signed-in accounts using the Cell/Brotherhood features — never for the
// local-only Rule/prayer/journal data, which stays untouched by design.
function recordActivity(userId: string) {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  prisma.user
    .updateMany({
      where: { id: userId, OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: startOfToday } }] },
      data: { lastActiveAt: new Date() },
    })
    .catch((err) => console.error("Failed to record activity:", err));
}
