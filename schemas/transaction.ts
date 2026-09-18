import { z } from 'zod';
import { category } from '@/models/category';
import { CategoryResponseSchema, CategorySchema } from './category';

export const TransactionSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nonoptional(),
  type: z.enum(['income', 'expense']),
  amount_cents: z
    .number()
    .positive('O valor não pode ser menor ou igual a zero.'),
  description: z.string().max(255),
  category: CategorySchema,
  occurred_at: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const TransactionRequestSchema = z.object({
  user_id: z.uuid().nonoptional(),
  amount_cents: z
    .number()
    .positive('O valor não pode ser menor ou igual a zero.'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(255),
  category_id: z.uuid().nonoptional(),
  occurred_at: z.coerce.date(),
});

export const TransactionUpdateRequestSchema = TransactionRequestSchema.omit({
  user_id: true,
}).partial();

export const TransactionCreateRequestSchema = TransactionRequestSchema.omit({
  user_id: true,
});

export const TransactionResponseSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nonoptional(),
  type: z.enum(['income', 'expense']),
  amount_cents: z.number().nonnegative(),
  description: z.string().max(255),
  category_id: z.uuid().nonoptional(),
  category: CategoryResponseSchema,
  occurred_at: z.coerce.date(),
});

export type TransactionRequest = z.infer<typeof TransactionRequestSchema>;
export type TransactionCreateRequest = z.infer<
  typeof TransactionCreateRequestSchema
>;
export type TransactionUpdateRequest = z.infer<
  typeof TransactionUpdateRequestSchema
>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
