import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-display",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "IT-Gullruten | Drømtorp Awards",
  description: "Offisiell publikumsstemme for Drømtorp Awards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
