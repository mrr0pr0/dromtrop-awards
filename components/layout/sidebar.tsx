'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
	{ href: '/admin/dashboard', label: 'Oversikt' },
	{ href: '/admin/categories', label: 'Kategorier' },
	{ href: '/admin/nominees', label: 'Nominerte' },
	{ href: '/admin/users', label: 'Brukere' },
];

const adminOnlyLinks = [
	{ href: '/admin/users/roles', label: 'Roller' },
];

interface SidebarProps {
	isAdmin: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
	const pathname = usePathname();
	const allLinks = isAdmin
		? [...links, ...adminOnlyLinks]
		: links;

	return (
		<aside className="w-56 shrink-0 border-r border-gold/20 bg-charcoal p-4">
			<p className="mb-4 text-xs font-medium uppercase tracking-wider text-gold-light">
				Administrasjon
			</p>
			<ul className="space-y-1">
				{allLinks.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							className={cn(
								'block rounded-lg px-3 py-2 text-sm transition-all duration-200',
								pathname === link.href ||
									pathname.startsWith(`${link.href}/`)
									? 'bg-gold/20 text-gold'
									: 'text-gold-light hover:bg-gold/10 hover:text-white',
							)}
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}
