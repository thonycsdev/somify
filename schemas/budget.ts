import { z } from 'zod';

export const BudgetSchema = z.object({
  id: z.uuid(),
  category_id: z.uuid(),
  user_id: z.uuid(),
  period: z.coerce.date(),
  limit_cents: z.coerce.bigint(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Budget = z.infer<typeof BudgetSchema>;

export const BudgetCreateRequestSchema = BudgetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const BudgetUpdateRequestSchema = BudgetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
});

export const BudgetResponseSchema = z.object({
  id: z.uuid(),
  category_id: z.uuid(),
  user_id: z.uuid(),
  period: z.coerce.date(),
  limit_cents: z.coerce.bigint(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
export type BudgetCreateRequest = z.infer<typeof BudgetCreateRequestSchema>;
export type BudgetUpdateRequest = z.infer<typeof BudgetUpdateRequestSchema>;
