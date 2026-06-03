import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import { isProducerOrAdmin, canVote } from "@/lib/auth/permissions";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const isStaff = isProducerOrAdmin(session);

  return (
    <header className="sticky top-0 z-20 border-b border-gold-light/20 bg-black/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-display)] text-2xl font-light text-gold transition-all duration-200 hover:text-gold-light"
        >
          Drømtorp Awards
        </Link>

        <div className="flex items-center gap-4 overflow-x-auto text-sm font-medium [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden">
          {user?.email ? (
            <>
              {canVote(session) && (
                <Link
                  href="/vote"
                  className="text-gold-light transition-all duration-200 hover:text-gold"
                >
                  Stem
                </Link>
              )}
              <Link
                href="/results"
                className="text-gold-light transition-all duration-200 hover:text-gold"
              >
                Resultater
              </Link>
              {isStaff && (
                <Link
                  href="/admin/dashboard"
                  className="text-gold-light transition-all duration-200 hover:text-gold"
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-gold-light/70 sm:inline">
                {user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-gold-light transition-all duration-200 hover:text-gold"
                >
                  Logg ut
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-gold px-4 py-2 font-semibold text-black transition-all duration-200 hover:bg-gold-deep"
            >
              Logg inn
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
