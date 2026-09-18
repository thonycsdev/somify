import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string('A categoria precisa de um nome.'),
  user_id: z.uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryCreateRequestSchema = CategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CategoryUpdateRequestSchema = CategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
});

export const CategoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  user_id: z.uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const DEFAULT_CATEGORY_NAMES = [
  'Food',
  'Rent',
  'Transport',
  'Utilities',
  'Entertainment',
  'Other',
];

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type CategoryCreateRequest = z.infer<typeof CategoryCreateRequestSchema>;
export type CategoryUpdateRequest = z.infer<typeof CategoryUpdateRequestSchema>;
