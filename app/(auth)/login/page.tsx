import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import {
  getDevMagicLink,
  isDevMagicLinkMode,
} from "@/lib/auth/dev-magic-link";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    verify?: string;
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const errorMessages: Record<string, string> = {
    pending:
      "Kontoen din venter på godkjenning. Kontakt arrangør for tilgang til stemming.",
    rejected: "Kontoen din er avvist. Kontakt arrangør hvis du mener dette er feil.",
    rejected_access: "Du har ikke tilgang til denne siden.",
  };

  const errorMessage = params.error
    ? errorMessages[params.error] ?? "Noe gikk galt. Prøv igjen."
    : null;

  const devMagicLink = params.verify ? getDevMagicLink() : null;
  const devMode = isDevMagicLinkMode();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-light text-gold md:text-6xl">
          Drømtorp Awards
        </h1>
        <p className="mt-2 text-sm text-gold-light">
          Offisiell publikumsstemme for Drømtorp Awards
        </p>
      </div>

      <Card className="w-full max-w-md">
        {params.verify ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              {devMode ? "Utviklingsmodus" : "Sjekk e-posten din"}
            </h2>
            {devMode ? (
              <div className="mt-3 space-y-4 text-sm text-gold-light">
                <p>
                  Ingen e-post ble sendt lokalt. Bruk innloggingslenken under
                  (kun synlig i utvikling).
                </p>
                {devMagicLink ? (
                  <a
                    href={devMagicLink.url}
                    className="block break-all rounded-lg border border-gold/40 bg-gold/10 px-3 py-3 text-left text-gold hover:bg-gold/20"
                  >
                    Logg inn som {devMagicLink.email}
                  </a>
                ) : (
                  <p className="text-left text-gold-light/80">
                    Lenken er utløpt. Gå tilbake og send innloggingslenke på nytt.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gold-light">
                Vi har sendt deg en magisk lenke for å logge inn. Klikk lenken i
                e-posten for å fortsette.
              </p>
            )}
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-semibold text-white">Logg inn</h2>
            {errorMessage && (
              <p className="mb-4 rounded-lg border border-gold-deep/50 bg-gold-deep/20 px-3 py-2 text-sm text-gold-light">
                {errorMessage}
              </p>
            )}
            <LoginForm callbackUrl={params.callbackUrl ?? "/vote"} />
          </>
        )}
      </Card>
    </div>
  );
}
