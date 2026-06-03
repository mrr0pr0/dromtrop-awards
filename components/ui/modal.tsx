'use client';

import { cn } from '@/lib/utils/cn';
import { useEffect } from 'react';
import { Button } from './button';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
}: ModalProps) {
	useEffect(() => {
		if (!isOpen) return;
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handleEscape);
		return () =>
			document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
			onClick={onClose}
			role="presentation"
		>
			<div
				className={cn(
					'w-full max-w-md rounded-lg border border-gold/30 bg-charcoal p-6 shadow-xl',
				)}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div className="mb-4 flex items-center justify-between">
					<h2
						id="modal-title"
						className="text-xl font-semibold text-white"
					>
						{title}
					</h2>
					<Button
						variant="ghost"
						onClick={onClose}
						className="px-2 py-1"
					>
						✕
					</Button>
				</div>
				{children}
			</div>
		</div>
	);
}
