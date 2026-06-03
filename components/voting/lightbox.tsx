'use client';

import { useEffect } from 'react';

interface LightboxProps {
	isOpen: boolean;
	imageUrl: string;
	onClose: () => void;
}

export function Lightbox({
	isOpen,
	imageUrl,
	onClose,
}: LightboxProps) {
	useEffect(() => {
		if (!isOpen) return;

		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('keydown', handleEscape);
		return () =>
			document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
			onClick={onClose}
		>
			<div
				className="relative flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={imageUrl}
					alt="Fullscreen"
					className="max-h-[90vh] max-w-[90vw] object-contain"
				/>
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-4xl text-gold transition-colors hover:text-gold-light"
					aria-label="Close lightbox"
				>
					✕
				</button>
			</div>
		</div>
	);
}
