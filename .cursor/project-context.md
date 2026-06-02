# Drømtorp Awards – Project Context

## What is this project?
IT-Gullruten is the annual awards show for IT & media students at Drømtorp videregående skole. This web platform handles:
- Email-based login with an approved-users whitelist
- Voting for 10 award categories (jury decides final winners, but this platform handles audience/public voting)
- Admin/producer management of categories, nominees, and users
- Live leaderboard sorted by vote count

## Event Schedule Context (for copy/UX reference)
- Doors open: 11:50
- Show starts: 12:00
- Main categories announced: 12:15–13:00
- Top 3 revealed: 13:05
- Winners announced: 13:10
- End: 13:15

## Branding
- Event name: **IT-Gullruten** / **Drømtorp Awards**
- School: Drømtorp videregående skole
- Theme: Prestige awards show – black and gold, elegant

## Color Reference (DO NOT CHANGE)
- Primary Gold: `#C9A84C`
- Light Gold: `#E8D5A3`
- Deep Gold: `#8B6914`
- Background: `#1C1C1C`
- Secondary BG: `#2D2D2D`
- Light surface: `#FAF8F4`
- White text: `#FFFFFF`

## Font Reference (DO NOT CHANGE)
- Titles: Cormorant Garamond 300
- Everything else: Montserrat (400, 500, 600)

## Key Business Rules
1. Users sign in by email. If email is in `approved_emails` table → access granted. Otherwise → pending.
2. Producers and Admins approve/reject pending users.
3. Each approved user votes once per category. Duplicate vote = error.
4. Nominees have an optional Cloudinary image URL (no SDK – just store the URL string).
5. Results page is public to all logged-in users; it auto-updates rankings by vote count descending.
6. Ties show nominees at the same rank position.
