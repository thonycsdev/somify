import { faker } from '@faker-js/faker';
import type { TransactionRequest } from '@/schemas/transaction';
import orchestrator from '@/tests/common/orchestrator';

beforeAll(async () => {
  await orchestrator.resetDatabase();
});

async function createTransactionRequest() {
  const createdUser = await orchestrator.createUser();
  const createdSession = await orchestrator.createSession(createdUser.id);
  const createdCategory = await orchestrator.createCategory(createdUser.id);
  const transaction: TransactionRequest = {
    user_id: createdUser.id,
    amount_cents: +faker.finance.amount({ min: 10, max: 10000, dec: 0 }),
    type: 'income',
    description: faker.finance.transactionDescription(),
    category_id: createdCategory.id,
    occurred_at: faker.date.recent(),
  };
  return { createdUser, createdSession, createdCategory, transaction };
}

describe('POST /api/v1/transactions', () => {
  test('creates a transaction for the logged-in user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);
    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      amount_cents: +faker.finance.amount({ min: 10, max: 10000, dec: 0 }),
      type: 'income',
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: faker.date.recent(),
    };

    const response = await fetch('http://localhost:3000/api/v1/transaction', {
      method: 'POST',
      body: JSON.stringify(transaction),
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    const responseBody = await response.json();
    expect(response.status).toBe(201);
    expect(responseBody).toEqual({
      id: expect.any(String),
      user_id: transaction.user_id,
      amount_cents: transaction.amount_cents,
      type: transaction.type,
      description: transaction.description,
      category_id: transaction.category_id,
      category: {
        ...createdCategory,
        created_at: createdCategory.created_at.toISOString(),
        updated_at: createdCategory.updated_at.toISOString(),
      },
      occurred_at: transaction.occurred_at.toISOString(),
    });
  });
  test('rejects a non-positive amount', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      amount_cents: +faker.finance.amount({ max: -1, min: -100, dec: 0 }),
      type: 'expense',
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    const response = await fetch('http://localhost:3000/api/v1/transaction', {
      method: 'POST',
      body: JSON.stringify(transaction),
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      success: false,
      status: 422,
      message: 'O valor não pode ser menor ou igual a zero.',
    });
  });
});

describe('GET /api/v1/transactions', () => {
  test('only returns transactions belonging to the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdUser2 = await orchestrator.createUser();
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const createdSession = await orchestrator.createSession(createdUser.id);
    const transaction1: TransactionRequest = {
      user_id: createdUser.id,
      type: 'expense',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    await orchestrator.createTransaction(transaction1);
    const transaction2: TransactionRequest = {
      user_id: createdUser2.id,
      type: 'income',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    await orchestrator.createTransaction(transaction2);
    const response = await fetch('http://localhost:3000/api/v1/transaction', {
      method: 'GET',
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBe(1);
    expect(responseBody[0].user_id).toBe(createdUser.id);
  });
});

describe('GET /api/v1/transactions/[id]', () => {
  test('returns a single transaction owned by the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      type: 'income',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    const createdTransaction =
      await orchestrator.createTransaction(transaction);
    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'GET',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBeFalsy();
    expect(responseBody.user_id).toBe(createdUser.id);
    expect(responseBody).toEqual({
      ...createdTransaction,
      occurred_at: createdTransaction.occurred_at.toISOString(),
      category: {
        ...createdTransaction.category,
        created_at: createdTransaction.category.created_at.toISOString(),
        updated_at: createdTransaction.category.updated_at.toISOString(),
      },
    });
  });
  test('returns 404 for a nonexistent id', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${faker.string.uuid()}`,
      {
        method: 'GET',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Transaction não encontrada.');
  });
  test('returns 404 when the transaction belongs to another user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      type: 'income',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    const createdTransaction =
      await orchestrator.createTransaction(transaction);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'GET',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Transaction não encontrada.');
  });
});

describe('PATCH /api/v1/transactions/[id]', () => {
  test('updates fields on a transaction owned by the caller', async () => {
    const { transaction, createdUser, createdSession } =
      await createTransactionRequest();
    const createdTransaction =
      await orchestrator.createTransaction(transaction);
    const createdCategory2 = await orchestrator.createCategory(createdUser.id, {
      name: 'category2',
    });

    const updatedFields = {
      description: faker.finance.transactionDescription(),
      amount_cents: +faker.finance.amount({ max: 200, min: 101, dec: 0 }),
      category_id: createdCategory2.id,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      ...createdTransaction,
      occurred_at: createdTransaction.occurred_at.toISOString(),
      ...updatedFields,
      category: {
        ...createdCategory2,
        created_at: createdCategory2.created_at.toISOString(),
        updated_at: createdCategory2.updated_at.toISOString(),
      },
      category_id: createdCategory2.id,
    });
  });
  test('returns 404 when the transaction belongs to another user', async () => {
    const { transaction } = await createTransactionRequest();
    const createdTransaction =
      await orchestrator.createTransaction(transaction);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          description: faker.finance.transactionDescription(),
        }),
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Transaction não encontrada.');
  });
});

describe('DELETE /api/v1/transactions/[id]', () => {
  test('deletes a transaction owned by the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      type: 'income',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    const createdTransaction =
      await orchestrator.createTransaction(transaction);

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'GET',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );
    expect(getResponse.status).toBe(404);
  });
  test('returns 404 when the transaction belongs to another user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const transaction: TransactionRequest = {
      user_id: createdUser.id,
      type: 'income',
      amount_cents: +faker.finance.amount({ max: 100, min: 1, dec: 0 }),
      description: faker.finance.transactionDescription(),
      category_id: createdCategory.id,
      occurred_at: new Date(),
    };
    const createdTransaction =
      await orchestrator.createTransaction(transaction);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/transaction/${createdTransaction.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Transaction não encontrada.');
  });
});
