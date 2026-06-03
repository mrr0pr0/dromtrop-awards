import NextAuth from "next-auth";
import { fullAuthConfig } from "@/lib/auth/config";
import { getAuthAdapter } from "@/lib/auth/get-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...fullAuthConfig,
  adapter: getAuthAdapter(),
});
