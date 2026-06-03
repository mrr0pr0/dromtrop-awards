import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'dark' | 'light';
}

export function Card({
	className,
	variant = 'dark',
	children,
	...props
}: CardProps) {
	return (
		<div
			className={cn(
				'rounded-lg border p-6 transition-all duration-200',
				variant === 'dark'
					? 'border-gold/20 bg-charcoal'
					: 'border-gold/30 bg-parchment text-black',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
