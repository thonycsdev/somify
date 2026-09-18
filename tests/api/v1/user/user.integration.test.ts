import { faker } from '@faker-js/faker';
import database from '@/infra/database';
import type { CreateUserRequest } from '@/models/user';
import {
  CategoryResponseSchema,
  DEFAULT_CATEGORY_NAMES,
} from '@/schemas/category';
import orchestrator from '@/tests/common/orchestrator';

const BASE_URL = 'http://localhost:3000';
beforeAll(async () => {
  await orchestrator.resetDatabase();
});
const buildRequest = (
  overrides: Partial<CreateUserRequest> = {},
): CreateUserRequest => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.person.fullName(),
  ...overrides,
});

const postUser = (body: CreateUserRequest): Promise<Response> =>
  fetch(`${BASE_URL}/api/v1/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/v1/user', () => {
  it('returns the correct fields and does not expose password_hash', async () => {
    const request = buildRequest();
    const res = await postUser(request);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.email).toBe(request.email);
    expect(body.name).toBe(request.name);
    expect(body.created_at).toBeDefined();
    expect(body.password_hash).toBeUndefined();

    const userCategoriesRow = await database.query(
      'SELECT * FROM categories c WHERE c.user_id = $1',
      [body.id],
    );
    const userCategories = userCategoriesRow.map((x) =>
      CategoryResponseSchema.parse(x),
    );
    console.log({ userCategories });
    expect(Array.isArray(userCategories)).toBeTruthy();
    expect(userCategories.length).toBe(DEFAULT_CATEGORY_NAMES.length);
    userCategories.forEach((cat) => {
      expect(DEFAULT_CATEGORY_NAMES.includes(cat.name)).toBeTruthy();
    });
  });

  it('rejects duplicate email', async () => {
    const request = buildRequest();
    await postUser(request);

    const res = await postUser(buildRequest({ email: request.email }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
