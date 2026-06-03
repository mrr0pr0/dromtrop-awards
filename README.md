# IT-Gullruten – Drømtorp Awards

Offisiell publikumsstemme-plattform for Drømtorp Awards ved Drømtorp videregående skole.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Neon PostgreSQL (`@neondatabase/serverless`)
- NextAuth.js v5 (e-post magic link via Resend)
- Tailwind CSS v4

## Kom i gang

### 1. Installer avhengigheter

```bash
pnpm install
```

### 2. Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn:

| Variabel | Beskrivelse |
|----------|-------------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` (produksjon: din domene-URL) |
| `RESEND_API_KEY` | Fra [Resend](https://resend.com) |
| `EMAIL_FROM` | Verifisert avsender hos Resend |
| `BOOTSTRAP_ADMIN_EMAIL` | (valgfritt) Første innlogging med denne e-posten får `admin`-rolle |

### 3. Database

Kjør schema og seed mot tom Neon-database:

```bash
pnpm db:push
```

Eller lim inn `schema.sql` og `scripts/seed.sql` manuelt i Neon SQL Editor.

Legg godkjente stemmere i `approved_emails`:

```sql
INSERT INTO approved_emails (email) VALUES ('elev@skole.no');
```

### 4. Start utviklingsserver

```bash
pnpm dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Ruter

| Rute | Tilgang |
|------|---------|
| `/login` | Offentlig |
| `/vote` | Godkjente brukere |
| `/results` | Innloggede |
| `/admin/*` | Produsent / admin |
| `/admin/users/roles` | Kun admin |

## Første admin

1. Sett `BOOTSTRAP_ADMIN_EMAIL` i `.env` til din e-post, **eller**
2. Etter første innlogging: `UPDATE users SET role = 'admin' WHERE email = 'din@epost.no';`

## Produksjon (Vercel)

- Legg inn alle miljøvariabler i Vercel-prosjektet
- Sett `AUTH_URL` til produksjons-URL
- Verifiser domene hos Resend for `EMAIL_FROM`

## Lisens

Privat skoleprosjekt – Drømtorp videregående skole.
