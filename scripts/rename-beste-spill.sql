-- Rename Beste spill → Beste Interaktiv
UPDATE categories
SET name = 'Beste Interaktiv', description = 'Årets beste interaktiv'
WHERE name = 'Beste spill';
