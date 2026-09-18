import database from '@/infra/database';
import { NotFoundError } from '@/infra/error-handler';
import {
  type CategoryCreateRequest,
  CategoryResponseSchema,
  type CategoryUpdateRequest,
  DEFAULT_CATEGORY_NAMES,
} from '@/schemas/category';

const insertDefaultCategories = async (userId: string): Promise<void> => {
  const inserts = DEFAULT_CATEGORY_NAMES.map((name) =>
    database.query<{ [key: string]: unknown }>(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2);',
      [name, userId],
    ),
  );

  await Promise.all(inserts);
};

const createOne = async (payload: CategoryCreateRequest) => {
  const createdCategory = await insertNewCategory(payload);
  return CategoryResponseSchema.parse(createdCategory);

  async function insertNewCategory(payload: CategoryCreateRequest) {
    const result = await database.query(
      'INSERT INTO categories (name,user_id) VALUES ($1, $2) RETURNING *;',
      [payload.name, payload.user_id],
    );

    return result[0];
  }
};

const getManyByUserId = async (user_id: string) => {
  const result = await getAllCategoriesFromUser(user_id);
  return result.map((x) => CategoryResponseSchema.parse(x));

  async function getAllCategoriesFromUser(user_id: string) {
    const result = await database.query(
      'SELECT * FROM categories c WHERE c.user_id = $1',
      [user_id],
    );
    return result;
  }
};

const updateOne = async (
  id: string,
  userId: string,
  data: CategoryUpdateRequest,
) => {
  const result = await database.query(
    `UPDATE categories
    SET name = $1,
        updated_at = now()
    WHERE id = $2 AND user_id = $3
    RETURNING *;`,
    [data.name, id, userId],
  );
  if (!result.length) throw new NotFoundError('Categoria não encontrada.');
  return CategoryResponseSchema.parse(result[0]);
};

const deleteOne = async (id: string, userId: string): Promise<void> => {
  const result = await database.query(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id;',
    [id, userId],
  );
  if (!result.length) throw new NotFoundError('Categoria não encontrada.');
};

export const category = {
  insertDefaultCategories,
  createOne,
  getManyByUserId,
  updateOne,
  deleteOne,
};
