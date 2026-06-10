import { createHash } from 'crypto';
import { auth } from '@/auth';
import { canVote, isAdmin, isNominationsOpen } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

function signCloudinaryParams(
	params: Record<string, string>,
	apiSecret: string,
): string {
	const sorted = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');
	return createHash('sha1')
		.update(sorted + apiSecret)
		.digest('hex');
}

export async function POST(req: Request) {
	const session = await auth();
	const canManageNominees = isAdmin(session);

	if (!canManageNominees && !canVote(session)) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!canManageNominees && !isNominationsOpen()) {
		return Response.json(
			{ error: 'Nominasjoner er stengt.' },
			{ status: 403 },
		);
	}

	const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;

	if (!cloudName || !apiKey || !apiSecret) {
		return Response.json(
			{ error: 'Cloudinary er ikke konfigurert.' },
			{ status: 500 },
		);
	}

	const timestamp = Math.round(Date.now() / 1000).toString();
	const folder = 'nominees';
	const params = { folder, timestamp };
	const signature = signCloudinaryParams(params, apiSecret);

	return Response.json({
		signature,
		timestamp,
		folder,
		apiKey,
		cloudName,
	});
}
