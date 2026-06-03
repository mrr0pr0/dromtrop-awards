"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Kunne ikke sende innloggingslenke. Prøv igjen.");
      } else {
        window.location.href = "/login?verify=1";
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="E-postadresse"
        type="email"
        name="email"
        placeholder="din@epost.no"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Send innloggingslenke
      </Button>
      <p className="text-center text-xs font-light italic text-gold-light">
        Kun godkjente e-postadresser kan stemme. Andre får tilgang til
        resultater etter innlogging.
      </p>
    </form>
  );
}
