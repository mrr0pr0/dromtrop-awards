import { auth } from '@/auth';
import {
	isAdmin,
	
} from '@/lib/auth/permissions';
import {
	listUsers,
	listPendingUsers,
	updateUserStatus,
	updateUserRole,
} from '@/lib/db/users';
import {
	userStatusSchema,
	userRoleSchema,
} from '@/lib/validations/user';

export async function GET(req: Request) {
	const session = await auth();
	if (!isAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const { searchParams } = new URL(req.url);
	const pendingOnly =
		searchParams.get('pending') === 'true';

	const users = pendingOnly
		? await listPendingUsers()
		: await listUsers();
	return Response.json({ users });
}

export async function PATCH(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const body = await req.json();

	if ('role' in body) {
		if (!isAdmin(session)) {
			return Response.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}
		const parsed = userRoleSchema.safeParse(body);
		if (!parsed.success) {
			return Response.json(
				{ error: 'Ugyldig data' },
				{ status: 400 },
			);
		}
		const user = await updateUserRole(
			parsed.data.id,
			parsed.data.role,
		);
		return Response.json({ user });
	}

	if (!isAdmin(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	const parsed = userStatusSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: 'Ugyldig data' },
			{ status: 400 },
		);
	}

	const user = await updateUserStatus(
		parsed.data.id,
		parsed.data.status,
	);
	return Response.json({ user });
}
