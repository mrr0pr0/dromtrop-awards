import Link from "next/link";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;
  const isLoggedIn = !!user?.email;
  const isApproved = user?.status === "approved";
  const isStaff = user?.role === "admin" || user?.role === "producer";

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-light text-gold md:text-7xl">
          IT-Gullruten
        </h1>
        <p className="mt-4 max-w-lg text-sm text-gold-light">
          Velkommen til den offisielle publikumsstemmen for Drømtorp Awards.
          Stem på årets beste IT- og medieproduksjoner fra Drømtorp
          videregående skole.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {!isLoggedIn ? (
            <Link href="/login">
              <Button>Logg inn for å stemme</Button>
            </Link>
          ) : (
            <>
              {isApproved && (
                <Link href="/vote">
                  <Button>Stem nå</Button>
                </Link>
              )}
              <Link href="/results">
                <Button variant="outline">Se resultater</Button>
              </Link>
              {isStaff && (
                <Link href="/admin/dashboard">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
            </>
          )}
        </div>
        {!isLoggedIn && (
          <p className="mt-8 text-xs font-light italic text-gold-light/80">
            Arrangementet · ca. 12:00–13:15 · 10 hovedkategorier
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
