import type { Session } from 'next-auth';
import type { UserRole, UserStatus } from '@/types';

export function isProducerOrAdmin(
	session: Session | null,
): boolean {
	if (!session?.user) return false;
	return (
		session.user.role === 'producer' ||
		session.user.role === 'admin'
	);
}

export function isAdmin(session: Session | null): boolean {
	return session?.user?.role === 'admin';
}

export function isApproved(
	session: Session | null,
): boolean {
	return session?.user?.status === 'approved';
}

export function isJury(session: Session | null): boolean {
	return session?.user?.role === 'jury';
}

export function canJuryVote(session: Session | null): boolean {
	if (!isJury(session)) return false;
	if (session?.user?.status !== 'approved') return false;
	return process.env.JURY_VOTING_OPEN === 'true';
}

export function canVote(session: Session | null): boolean {
	if (!session?.user) return false;
	if (session.user.role === 'jury') return false;
	return isApproved(session) || isAdmin(session);
}

export function hasRole(
	session: Session | null,
	roles: UserRole[],
): boolean {
	if (!session?.user) return false;
	return roles.includes(session.user.role);
}

export function hasStatus(
	session: Session | null,
	statuses: UserStatus[],
): boolean {
	if (!session?.user) return false;
	return statuses.includes(session.user.status);
}
