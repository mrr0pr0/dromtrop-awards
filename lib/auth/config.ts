import type { NextAuthConfig } from "next-auth";
import { Resend } from "resend";
import Email from "next-auth/providers/email";
import { isEmailApproved } from "@/lib/db/approved-emails";
import {
  findUserByEmail,
  upsertUserOnSignIn,
} from "@/lib/db/users";
import type { UserRole, UserStatus } from "@/types";
import { authConfig } from "./auth.config";
import { isDevMagicLinkMode, setDevMagicLink } from "./dev-magic-link";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const fullAuthConfig: NextAuthConfig = {
  ...authConfig,
  providers: [
    Email({
      server: {
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY ?? "",
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        if (isDevMagicLinkMode()) {
          setDevMagicLink(identifier, url);
          console.info(
            `\n[auth] Magic link for ${identifier} (dev only, not sent via email):\n${url}\n`,
          );
          return;
        }

        const { error } = await getResend().emails.send({
          from:
            process.env.EMAIL_FROM ??
            "IT-Gullruten <onboarding@resend.dev>",
          to: identifier,
          subject: "Logg inn på IT-Gullruten",
          html: `
            <div style="font-family: Montserrat, sans-serif; background: #1C1C1C; color: #FFFFFF; padding: 32px;">
              <h1 style="color: #C9A84C; font-weight: 300;">IT-Gullruten</h1>
              <p>Klikk lenken under for å logge inn på Drømtorp Awards-stemmesystemet.</p>
              <a href="${url}" style="display: inline-block; background: #C9A84C; color: #1C1C1C; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                Logg inn
              </a>
              <p style="color: #E8D5A3; font-size: 12px; margin-top: 24px;">Hvis du ikke ba om denne e-posten, kan du ignorere den.</p>
            </div>
          `,
        });
        if (error) {
          throw new Error(`Kunne ikke sende e-post: ${error.message}`);
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      const approved = await isEmailApproved(user.email);
      const status: UserStatus = approved ? "approved" : "pending";

      const existing = await findUserByEmail(user.email);
      const userId = existing?.id ?? user.id ?? crypto.randomUUID();
      const dbUser = await upsertUserOnSignIn({
        id: userId,
        email: user.email,
        name: user.name,
        status,
      });

      Object.assign(user, {
        id: dbUser.id,
        role: dbUser.role,
        status: dbUser.status,
      });

      return true;
    },
    async jwt({ token, user, trigger }) {
      const email = token.email ?? user?.email;
      if (!email) return token;

      if (user || trigger === "update") {
        const dbUser = await findUserByEmail(email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      } else if (!token.id) {
        const dbUser = await findUserByEmail(email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      }

      return token;
    },
  },
};
