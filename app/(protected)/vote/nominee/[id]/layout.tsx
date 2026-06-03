import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NomineeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-8 pb-20 md:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
