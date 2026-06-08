import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { pathname } = req.nextUrl;
	const session = req.auth;
	const isLoggedIn = !!session;

	const role = session?.user?.role;
	const status = session?.user?.status;

	const isProtected =
		pathname.startsWith('/vote') ||
		pathname.startsWith('/nominate') ||
		pathname.startsWith('/results') ||
		pathname.startsWith('/admin') ||
		pathname.startsWith('/jury');

	if (!isProtected) {
		if (pathname === '/login' && isLoggedIn) {
			if (role === 'admin') {
				return NextResponse.redirect(
					new URL('/admin/dashboard', req.url),
				);
			}
			if (
				(role === 'jury' || role === 'producer') &&
				status === 'approved'
			) {
				return NextResponse.redirect(
					new URL('/jury', req.url),
				);
			}
			if (status === 'approved') {
				return NextResponse.redirect(
					new URL('/vote', req.url),
				);
			}
			return NextResponse.redirect(
				new URL('/results', req.url),
			);
		}
		return NextResponse.next();
	}

	if (!isLoggedIn) {
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (status === 'rejected') {
		return NextResponse.redirect(
			new URL('/login?error=rejected', req.url),
		);
	}

	if (role === 'jury' || role === 'producer') {
		if (status !== 'approved') {
			return NextResponse.redirect(
				new URL('/login?error=pending', req.url),
			);
		}
		if (!pathname.startsWith('/jury')) {
			return NextResponse.redirect(new URL('/jury', req.url));
		}
	}

	if (
		(pathname.startsWith('/vote') ||
			pathname.startsWith('/nominate')) &&
		status !== 'approved' &&
		role !== 'admin'
	) {
		return NextResponse.redirect(
			new URL('/login?error=pending', req.url),
		);
	}

	if (pathname.startsWith('/admin')) {
		if (role !== 'admin') {
			if (role === 'jury' || role === 'producer') {
				return NextResponse.redirect(new URL('/jury', req.url));
			}
			return NextResponse.redirect(
				new URL('/results', req.url),
			);
		}
	}

	if (pathname.startsWith('/jury')) {
		if (role !== 'jury' && role !== 'producer') {
			if (role === 'admin') {
				return NextResponse.redirect(
					new URL('/admin/dashboard', req.url),
				);
			}
			return NextResponse.redirect(new URL('/vote', req.url));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		'/vote/:path*',
		'/nominate/:path*',
		'/results/:path*',
		'/admin/:path*',
		'/jury/:path*',
		'/login',
	],
};
