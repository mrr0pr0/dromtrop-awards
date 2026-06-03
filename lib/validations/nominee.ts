import { z } from 'zod';

export const nomineeSchema = z.object({
	name: z.string().min(1, 'Navn er påkrevd'),
	category_id: z.coerce.number().int().positive(),
	user_id: z.string().optional().nullable(),
	image_url: z
		.union([z.string().url(), z.literal(''), z.null()])
		.optional()
		.transform((v) => (v === '' ? null : (v ?? null))),
	description: z
		.union([z.string(), z.literal(''), z.null()])
		.optional()
		.transform((v) => (v === '' ? null : (v ?? null))),
	site_url: z
		.union([z.string().url(), z.literal(''), z.null()])
		.optional()
		.transform((v) => (v === '' ? null : (v ?? null))),
	video_url: z
		.union([z.string().url(), z.literal(''), z.null()])
		.optional()
		.transform((v) => (v === '' ? null : (v ?? null))),
	what_we_made: z
		.union([z.string(), z.literal(''), z.null()])
		.optional()
		.transform((v) => (v === '' ? null : (v ?? null))),
});

export const nomineeUpdateSchema = nomineeSchema
	.partial()
	.extend({
		id: z.coerce.number().int().positive(),
	});

export type NomineeInput = z.infer<typeof nomineeSchema>;
