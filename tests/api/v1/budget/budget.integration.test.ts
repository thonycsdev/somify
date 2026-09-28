import budget from '@/models/budget';
import orchestrator from '@/tests/common/orchestrator';

beforeAll(async () => {
  await orchestrator.resetDatabase();
});

describe('POST /api/v1/budget', () => {
  test('creates a budget for the logged user', async () => {
    const { createdSession, budgetRequest } = await orchestrator.seedBudget();

    const result = await fetch('http://localhost:3000/api/v1/budget', {
      method: 'POST',
      body: JSON.stringify(budgetRequest),
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    expect(result.status).toBe(201);
  });
});
describe('GET /api/v1/budget', () => {
  test('get all budget from the current_user', async () => {
    await orchestrator.seedBudget();

    const { createdSession, createdUser } = await orchestrator.seedBudget();
    const result = await fetch('http://localhost:3000/api/v1/budget', {
      method: 'GET',
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    expect(result.status).toBe(200);
    const resultBody = await result.json();
    expect(Array.isArray(resultBody)).toBeTruthy();
    expect(resultBody.length).toBe(1);
    expect(resultBody[0].user_id).toBe(createdUser.id);
  });
});

describe('PATCH /api/v1/budget/[id]', () => {
  test('given an budget id, should update the category of the budget', async () => {
    const { budgetRequest, createdUser, createdSession } =
      await orchestrator.seedBudget();
    const createdCategory = await orchestrator.createCategory(createdUser.id);
    const createdBudget = await budget.getManyByUserId(createdUser.id);
    const result = await fetch(
      `http://localhost:3000/api/v1/budget/${createdBudget[0].id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...budgetRequest,
          category_id: createdCategory.id,
        }),
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(result.status).toBe(200);
    const resultBody = await result.json();
    expect(resultBody.category_id).toBe(createdCategory.id);
  });

  test('returns 404 when the budget belongs to another user', async () => {
    const { createdUser, budgetRequest } = await orchestrator.seedBudget();
    const [createdBudget] = await budget.getManyByUserId(createdUser.id);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const result = await fetch(
      `http://localhost:3000/api/v1/budget/${createdBudget.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(budgetRequest),
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(result.status).toBe(404);
    const resultBody = await result.json();
    expect(resultBody.message).toBe('Budget não encontrado.');
  });
});

describe('DELETE /api/v1/budget/[id]', () => {
  test('deletes a budget owned by the caller', async () => {
    const { createdUser, createdSession } = await orchestrator.seedBudget();
    const otherCategory = await orchestrator.createCategory(createdUser.id);
    await orchestrator.createBudget({
      user_id: createdUser.id,
      category_id: otherCategory.id,
    });
    const [budgetToDelete] = await budget.getManyByUserId(createdUser.id);

    const result = await fetch(
      `http://localhost:3000/api/v1/budget/${budgetToDelete.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(result.status).toBe(200);

    const remainingBudgets = await budget.getManyByUserId(createdUser.id);
    expect(
      remainingBudgets.find((b) => b.id === budgetToDelete.id),
    ).toBeUndefined();
  });

  test('returns 404 when the budget belongs to another user', async () => {
    const { createdUser } = await orchestrator.seedBudget();
    const [createdBudget] = await budget.getManyByUserId(createdUser.id);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const result = await fetch(
      `http://localhost:3000/api/v1/budget/${createdBudget.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(result.status).toBe(404);
    const resultBody = await result.json();
    expect(resultBody.message).toBe('Budget não encontrado.');
  });
});
