import type { Session } from 'next-auth';
import type { UserRole, UserStatus } from '@/types';

/** @deprecated Use isAdmin for admin access. Producer is a jury-panel role only. */
export function isProducerOrAdmin(
	session: Session | null,
): boolean {
	return isAdmin(session);
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
	return isJuryPanel(session);
}

/** Jury panel members: Dommer (jury) and Produsent (producer). */
export function isJuryPanel(session: Session | null): boolean {
	if (!session?.user) return false;
	return (
		session.user.role === 'jury' ||
		session.user.role === 'producer'
	);
}

export function canJuryVote(session: Session | null): boolean {
	if (!isJuryPanel(session)) return false;
	if (session?.user?.status !== 'approved') return false;
	return process.env.JURY_VOTING_OPEN === 'true';
}

export function canVote(session: Session | null): boolean {
	if (!session?.user) return false;
	if (isJuryPanel(session)) return false;
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
