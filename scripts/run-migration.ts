import { Pool, neonConfig } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

function loadEnvFile() {
	try {
		const content = readFileSync(
			join(process.cwd(), '.env'),
			'utf-8',
		);
		for (const line of content.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq);
			const value = trimmed.slice(eq + 1);
			if (!process.env[key]) process.env[key] = value;
		}
	} catch {
		// .env optional when DATABASE_URL is already set
	}
}

async function main() {
	loadEnvFile();
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error(
			'DATABASE_URL is not set. Add it to .env first.',
		);
		process.exit(1);
	}

	const pool = new Pool({ connectionString: databaseUrl });
	const root = join(process.cwd());

	const nomineeFields = readFileSync(
		join(
			root,
			'scripts',
			'add-nominee-fields-migration.sql',
		),
		'utf-8',
	);
	const renameSpill = readFileSync(
		join(root, 'scripts', 'rename-beste-spill.sql'),
		'utf-8',
	);
	const nomineeStatus = readFileSync(
		join(
			root,
			'scripts',
			'add-nominee-status-migration.sql',
		),
		'utf-8',
	);

	console.log('Applying nominee fields migration...');
	await pool.query(nomineeFields);
	console.log('Renaming Beste spill → Beste Interaktiv...');
	await pool.query(renameSpill);
	console.log('Applying nominee status migration...');
	await pool.query(nomineeStatus);
	console.log('✓ Migrations complete!');

	await pool.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
