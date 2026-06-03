# IT-Gullruten – Full Cursor Composer Prompt


## Prompt

# important 
the sites text is going to be in Norwagian bokmål but veribals and db will be in english

---

You are building **IT-Gullruten** – the official audience voting platform for Drømtorp Awards, an annual school awards show at Drømtorp videregående skole in Norway. This is a full-stack Next.js web application.

---

### Tech Stack
- **Next.js 15** – App Router, TypeScript strict mode
- **Neon DB** – PostgreSQL via `@neondatabase/serverless` (raw SQL, no ORM)
- **NextAuth.js v5** – Email magic link authentication, JWT sessions
- **Tailwind CSS v4** – Extended with the project's design tokens
- **pnpm** – Package manager (never npm, never yarn)
- **Cloudinary** – Image URLs stored as plain strings (no SDK needed in-app)

---

### Design System – IMMUTABLE
These colors and fonts come from the official Drømtorp Awards Design Manual and must never be changed.

**Colors (CSS variables):**
```
--color-gold:        #C9A84C   ← primary accent (buttons, highlights, borders)
--color-gold-light:  #E8D5A3   ← soft backgrounds, secondary text
--color-gold-deep:   #8B6914   ← shadows, hover states
--color-black:       #1C1C1C   ← main background
--color-charcoal:    #2D2D2D   ← card backgrounds, secondary surfaces
--color-parchment:   #FAF8F4   ← light mode surfaces
--color-white:       #FFFFFF   ← text on dark surfaces
```

**Fonts (Google Fonts):**
- **Cormorant Garamond** (weight 300) – display titles only
- **Montserrat** (weights 300, 400, 500, 600) – all other text

The overall aesthetic is a **dark, prestigious awards-night feel** – black backgrounds, gold accents, elegant typography. Think BAFTAs or Emmys, school edition.

---

### Authentication & User Flow
1. User enters their email on the login page
2. System checks the `approved_emails` table in the database
3. If email exists → user is `approved`, receives magic link, can vote
4. If email does not exist → user is `pending`, access denied until approved by admin/producer
5. Admins and Producers can approve or reject pending users from the dashboard

### Roles
- **user** – can view categories, vote once per category, view results
- **producer** – can manage categories, nominees, approve/reject users, view stats
- **admin** – all producer permissions + manage user roles, full access

### Voting Rules (enforce server-side)
- One vote per user per category (enforced by DB UNIQUE constraint on `user_id + category_id`)
- Only `approved` users can vote
- Votes are stored with user ID, category ID, nominee ID, and timestamp

---

### Award Categories (seed data)
The 10 official IT-Gullruten 2026 categories:
1. Beste medieprodukt
2. Beste IT-produkt
3. Beste nettside
4. Beste app
5. Beste konsept
6. Beste kortfilm
7. Mest originale idé
8. Beste Interaktiv
9. Beste animasjon
10. Beste historiefortelling

---

### Database Schema (raw SQL)
```sql
-- approved_emails: whitelist maintained by admin
CREATE TABLE approved_emails (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- from NextAuth session
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',   -- user | producer | admin
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- nominees
CREATE TABLE nominees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,  -- Cloudinary URL, plain string
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- votes (UNIQUE prevents duplicate voting)
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  nominee_id INTEGER REFERENCES nominees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);
```

---

### Pages to Build
| Route | Access | Description |
|---|---|---|
| `/login` | Public | Email sign-in |
| `/vote` | Approved users | All categories with nominees, vote buttons |
| `/results` | All logged-in | Live leaderboard sorted by votes descending |
| `/admin/dashboard` | Producer + Admin | Stats overview, recent activity |
| `/admin/categories` | Producer + Admin | CRUD for categories |
| `/admin/nominees` | Producer + Admin | CRUD for nominees |
| `/admin/users` | Producer + Admin | Approve/reject pending users |
| `/admin/users/roles` | Admin only | Change user roles |

---

### Results / Leaderboard Requirements
- Sorted by vote count descending within each category
- Tied nominees share the same rank number
- Show total votes cast, active categories count, approved user count
- Auto-updates (revalidate on each load or use polling)

---

### Folder Structure
```
src/
  app/
    (auth)/login/
    (protected)/
      vote/
      results/
      admin/
        dashboard/
        categories/
        nominees/
        users/
    api/auth/ votes/ categories/ nominees/ users/
  components/
    ui/           # Button, Card, Badge, Input, Modal
    layout/       # Navbar, Sidebar
    voting/       # VoteCard, NomineeCard, CategoryList
    admin/        # StatCard, DataTable, UserRow
    results/      # Leaderboard, RankCard
  lib/
    db/           # client.ts + query files per entity
    auth/         # NextAuth config
    validations/  # Zod schemas
    utils/
  types/
    index.ts
schema.sql        # source of truth for DB schema
```

---

### Constraints
- Use `pnpm` always, never `npm` or `yarn`
- No Prisma – raw SQL only with Neon serverless driver
- No Cloudinary SDK – image URLs are plain strings typed in by admin
- All role/auth checks must be server-side
- No `any` TypeScript types
- Validate all inputs with Zod

---

Start by scaffolding the project with `pnpm create next-app@latest` using TypeScript, Tailwind, App Router, and src directory. Then set up the global CSS variables and fonts before building any components.


