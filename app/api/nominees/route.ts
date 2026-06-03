import { auth } from '@/auth';
import { isProducerOrAdmin } from '@/lib/auth/permissions';
import {
	listAllNominees,
	createNominee,
	updateNominee,
	deleteNominee,
} from '@/lib/db/nominees';
import {
	nomineeSchema,
	nomineeUpdateSchema,
} from '@/lib/validations/nominee';

export async function GET() {
	const session = await auth();
	if (!isProducerOrAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}
	const nominees = await listAllNominees();
	return Response.json({ nominees });
}

export async function POST(req: Request) {
	const session = await auth();
	if (!isProducerOrAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const body = await req.json();
	const parsed = nomineeSchema.safeParse({
		...body,
		image_url: body.image_url || null,
	});
	if (!parsed.success) {
		return Response.json(
			{ error: 'Ugyldig data' },
			{ status: 400 },
		);
	}

	const nominee = await createNominee(parsed.data);
	return Response.json({ nominee }, { status: 201 });
}

export async function PATCH(req: Request) {
	const session = await auth();
	if (!isProducerOrAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const body = await req.json();
	const parsed = nomineeUpdateSchema.safeParse({
		...body,
		image_url:
			body.image_url === '' ? null : body.image_url,
	});
	if (!parsed.success) {
		return Response.json(
			{ error: 'Ugyldig data' },
			{ status: 400 },
		);
	}

	const { id, ...data } = parsed.data;
	const nominee = await updateNominee(id, data);
	if (!nominee) {
		return Response.json(
			{ error: 'Ikke funnet' },
			{ status: 404 },
		);
	}
	return Response.json({ nominee });
}

export async function DELETE(req: Request) {
	const session = await auth();
	if (!isProducerOrAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) {
		return Response.json(
			{ error: 'Mangler id' },
			{ status: 400 },
		);
	}

	await deleteNominee(id);
	return Response.json({ success: true });
}
