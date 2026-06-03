import { cn } from '@/lib/utils/cn';

interface BadgeProps {
	children: React.ReactNode;
	variant?: 'gold' | 'muted' | 'success' | 'warning';
	className?: string;
}

const variants = {
	gold: 'bg-gold/20 text-gold border-gold/40',
	muted: 'bg-charcoal text-gold-light border-gold/20',
	success: 'bg-gold/10 text-gold-light border-gold/30',
	warning:
		'bg-gold-deep/30 text-gold-light border-gold-deep',
};

export function Badge({
	children,
	variant = 'gold',
	className,
}: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
				variants[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
