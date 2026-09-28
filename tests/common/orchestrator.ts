import path from 'node:path';
import { faker } from '@faker-js/faker';
import { runner } from 'node-pg-migrate';
import database from '@/infra/database';
import budget from '@/models/budget';
import { category } from '@/models/category';
import session from '@/models/session';
import transaction from '@/models/transaction';
import user, { type CreateUserResponse } from '@/models/user';
import type { BudgetCreateRequest } from '@/schemas/budget';
import type { CategoryCreateRequest } from '@/schemas/category';
import type { TransactionRequest } from '@/schemas/transaction';

const dropSchema = async (): Promise<void> => {
  await database.query('DROP SCHEMA public CASCADE');
  await database.query('CREATE SCHEMA public');
};

const runMigrations = async (): Promise<void> => {
  const client = await database.getPool().connect();
  try {
    await runner({
      dbClient: client,
      dir: path.resolve(process.cwd(), 'migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
    });
  } finally {
    client.release();
  }
};

const resetDatabase = async (): Promise<void> => {
  await dropSchema();
  await runMigrations();
};

const createUser = async (
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {},
): Promise<CreateUserResponse & { password: string }> => {
  const data = {
    email: overrides.email ?? faker.internet.email(),
    password: overrides.password ?? faker.internet.password({ length: 12 }),
    name: overrides.name ?? faker.person.fullName(),
  };
  const created = await user.createNewUser(data);
  return { ...created, password: data.password };
};

const createSession = async (user_id: string) => {
  const createdSession = await session.createSession({
    user_id: user_id,
    user_agent: '',
  });
  if (!createdSession) throw new Error('Test Error: Session not created!');
  return createdSession;
};

const createTransaction = async (
  overrides: Partial<TransactionRequest> = {},
) => {
  const createdTransaction = await transaction.createOne({
    user_id: overrides.user_id ?? '',
    amount_cents:
      overrides.amount_cents ?? +faker.finance.amount({ min: 10, dec: 0 }),
    description:
      overrides.description ?? faker.finance.transactionDescription(),
    category_id: overrides.category_id ?? '',
    type: overrides.type ?? 'expense',
    occurred_at: overrides.occurred_at ?? new Date(),
  });

  return createdTransaction;
};

const createCategory = async (
  user_id: string,
  overrides: Partial<CategoryCreateRequest> = {},
) => {
  const createdTransaction = await category.createOne({
    user_id,
    name: overrides.name ?? faker.finance.transactionType(),
  });

  return createdTransaction;
};

const createBudget = async (overrides: Partial<BudgetCreateRequest> = {}) => {
  const createdBudget = await budget.createOne({
    user_id: overrides.user_id ?? '',
    category_id: overrides.category_id ?? '',
    period: overrides.period ?? new Date(),
    limit_cents: overrides.limit_cents ?? faker.number.bigInt({ min: 10000 }),
  });

  return createdBudget;
};

const seedBudget = async () => {
  const createdUser = await createUser();
  const createdSession = await createSession(createdUser.id);
  const createdCategory = await createCategory(createdUser.id);
  const budgetRequest: BudgetCreateRequest = {
    user_id: createdUser.id,
    category_id: createdCategory.id,
    period: new Date(),
    limit_cents: faker.number.bigInt({ min: 10000 }),
  };
  await createBudget(budgetRequest);

  return { createdUser, createdSession, createdCategory, budgetRequest };
};

const orchestrator = {
  dropSchema,
  runMigrations,
  resetDatabase,
  createUser,
  createSession,
  createTransaction,
  createCategory,
  createBudget,
  seedBudget,
};

export default orchestrator;
