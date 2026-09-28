import database from '@/infra/database';
import { NotFoundError } from '@/infra/error-handler';
import {
  type BudgetCreateRequest,
  type BudgetResponse,
  BudgetResponseSchema,
  type BudgetUpdateRequest,
} from '@/schemas/budget';

async function createOne(
  payload: BudgetCreateRequest,
): Promise<BudgetResponse> {
  const result = await database.query(
    `
      INSERT INTO budgets
      (user_id, category_id, period, limit_cents)
      VALUES
      ($1,$2,$3,$4) 
      RETURNING *;
      `,
    [payload.user_id, payload.category_id, payload.period, payload.limit_cents],
  );
  return BudgetResponseSchema.parse(result[0]);
}

async function getManyByUserId(user_id: string): Promise<BudgetResponse[]> {
  const userBudgets = await database.query(
    `
        SELECT * FROM budgets b
        WHERE
        b.user_id = $1;
        `,
    [user_id],
  );
  if (!userBudgets.length) throw new NotFoundError('Budget não encontrado.');

  return userBudgets.map((itens) => BudgetResponseSchema.parse(itens));
}

async function updateUserBudgetOneById(
  budget_id: string,
  user_id: string,
  data: BudgetUpdateRequest,
): Promise<BudgetResponse> {
  const result = await database.query(
    `
      UPDATE budgets
      SET category_id = $1,
          period = $2,
          limit_cents = $3,
          updated_at = now()
      WHERE id = $4 AND user_id = $5
      RETURNING *;
      `,
    [data.category_id, data.period, data.limit_cents, budget_id, user_id],
  );
  if (!result.length) throw new NotFoundError('Budget não encontrado.');
  return BudgetResponseSchema.parse(result[0]);
}

async function deleteOne(budget_id: string, user_id: string): Promise<void> {
  const result = await database.query(
    'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id;',
    [budget_id, user_id],
  );
  if (!result.length) throw new NotFoundError('Budget não encontrado.');
}

const budget = Object.freeze({
  createOne,
  getManyByUserId,
  updateUserBudgetOneById,
  deleteOne,
});
export default budget;
