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

	const schema = readFileSync(
		join(root, 'schema.sql'),
		'utf-8',
	);
	const seed = readFileSync(
		join(root, 'scripts', 'seed.sql'),
		'utf-8',
	);
	const authMigration = readFileSync(
		join(root, 'scripts', 'auth-migration.sql'),
		'utf-8',
	);

	console.log('Applying schema...');
	await pool.query(schema);

	console.log('Applying auth migration...');
	await pool.query(authMigration);

	console.log('Applying seed...');
	await pool.query(seed);

	await pool.end();
	console.log('Database ready.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
