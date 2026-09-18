import { faker } from '@faker-js/faker';
import {
  type CategoryCreateRequest,
  DEFAULT_CATEGORY_NAMES,
} from '@/schemas/category';
import orchestrator from '@/tests/common/orchestrator';

beforeAll(async () => {
  await orchestrator.resetDatabase();
});

describe('POST /api/v1/category', () => {
  test('creates a category for the logged-in user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const category: CategoryCreateRequest = {
      name: faker.finance.transactionType(),
      user_id: createdUser.id,
    };

    const response = await fetch('http://localhost:3000/api/v1/category', {
      method: 'POST',
      body: JSON.stringify(category),
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    const responseBody = await response.json();
    expect(response.status).toBe(201);
    expect(responseBody).toEqual({
      id: expect.any(String),
      name: category.name,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
      user_id: createdUser.id,
    });
    expect(new Date(responseBody.created_at).getTime()).toBeGreaterThan(
      Date.now() - 5000,
    );
    expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
      Date.now() - 5000,
    );
  });
});
describe('GET /api/v1/transactions', () => {
  test('only returns transactions belonging to the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdUser2 = await orchestrator.createUser();

    const createdSession = await orchestrator.createSession(createdUser.id);

    await orchestrator.createCategory(createdUser.id);

    await orchestrator.createCategory(createdUser2.id);

    const response = await fetch('http://localhost:3000/api/v1/category', {
      method: 'GET',
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBe(DEFAULT_CATEGORY_NAMES.length + 1);
    expect(responseBody[0].user_id).toBe(createdUser.id);
  });
});

describe('PATCH /api/v1/category/[id]', () => {
  test('updates the name of a category owned by the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const updatedFields = { name: faker.finance.transactionType() };

    const response = await fetch(
      `http://localhost:3000/api/v1/category/${createdCategory.id}`,
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
      ...createdCategory,
      created_at: createdCategory.created_at.toISOString(),
      updated_at: responseBody.updated_at,
      ...updatedFields,
    });
  });

  test('returns 404 when the category belongs to another user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdCategory = await orchestrator.createCategory(createdUser.id);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/category/${createdCategory.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name: faker.finance.transactionType() }),
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Categoria não encontrada.');
  });
});

describe('DELETE /api/v1/category/[id]', () => {
  test('deletes a category owned by the caller', async () => {
    const createdUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(createdUser.id);
    const createdCategory = await orchestrator.createCategory(createdUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/category/${createdCategory.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const listResponse = await fetch('http://localhost:3000/api/v1/category', {
      method: 'GET',
      headers: {
        Cookie: `session_token=${createdSession.token_hash}`,
      },
    });
    const listBody = await listResponse.json();
    expect(
      listBody.find((c: { id: string }) => c.id === createdCategory.id),
    ).toBeUndefined();
  });

  test('returns 404 when the category belongs to another user', async () => {
    const createdUser = await orchestrator.createUser();
    const createdCategory = await orchestrator.createCategory(createdUser.id);
    const loggedUser = await orchestrator.createUser();
    const createdSession = await orchestrator.createSession(loggedUser.id);

    const response = await fetch(
      `http://localhost:3000/api/v1/category/${createdCategory.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: `session_token=${createdSession.token_hash}`,
        },
      },
    );

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Categoria não encontrada.');
  });
});
