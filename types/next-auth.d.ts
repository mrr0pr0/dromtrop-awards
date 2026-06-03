import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    status?: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}
