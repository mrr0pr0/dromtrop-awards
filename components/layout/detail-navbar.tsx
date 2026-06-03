import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import { canVote, isProducerOrAdmin } from "@/lib/auth/permissions";

export async function DetailNavbar() {
  const session = await auth();
  const user = session?.user;
  const isStaff = isProducerOrAdmin(session);

  return (
    <header className="sticky top-0 z-10 border-b border-gold/25 bg-black/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex min-h-[72px] max-w-[1180px] items-center justify-between gap-6 px-4"
        aria-label="Hovedmeny"
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl text-gold transition-colors hover:text-gold-light sm:text-3xl"
        >
          Drømtorp Awards
        </Link>
        <div className="flex items-center gap-4 overflow-x-auto text-sm text-gold-light">
          {canVote(session) && (
            <Link href="/vote" className="min-h-11 whitespace-nowrap hover:border-b-2 hover:border-gold hover:text-white">
              Stem
            </Link>
          )}
          <Link href="/results" className="min-h-11 whitespace-nowrap hover:border-b-2 hover:border-gold hover:text-white">
            Resultater
          </Link>
          {isStaff && (
            <Link href="/admin/dashboard" className="min-h-11 whitespace-nowrap hover:border-b-2 hover:border-gold hover:text-white">
              Admin
            </Link>
          )}
          {user?.email && (
            <span className="hidden whitespace-nowrap sm:inline">{user.email}</span>
          )}
          {user?.email ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="min-h-11 whitespace-nowrap hover:text-white">
                Logg ut
              </button>
            </form>
          ) : (
            <Link href="/login" className="whitespace-nowrap text-gold hover:text-gold-light">
              Logg inn
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
