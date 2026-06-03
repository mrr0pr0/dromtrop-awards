import type { NextAuthConfig } from "next-auth";
import type { UserRole, UserStatus } from "@/types";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? "user";
        token.status =
          (user as { status?: UserStatus }).status ?? "pending";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "user";
        session.user.status = (token.status as UserStatus) ?? "pending";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
