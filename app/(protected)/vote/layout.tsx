import { VoteNavbar } from "@/components/layout/vote-navbar";
import { Footer } from "@/components/layout/footer";

export default function VoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-parchment bg-[linear-gradient(180deg,rgba(232,213,163,0.22),transparent_330px)] text-black">
      <VoteNavbar activePath="vote" />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-3 py-7 sm:px-4 sm:py-10 md:py-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}
