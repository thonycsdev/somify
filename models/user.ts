import database from '@/infra/database';
import { BadRequestError, DatabaseError } from '@/infra/error-handler';
import {
  type CreateUserRequest,
  CreateUserRequestSchema,
  type CreateUserResponse,
  CreateUserResponseSchema,
  type User,
  UserSchema,
} from '@/schemas/users';
import auth from './auth';
import { category } from './category';

export type { CreateUserRequest, CreateUserResponse };

const createNewUser = async (data: unknown): Promise<CreateUserResponse> => {
  const parsed = CreateUserRequestSchema.parse(data);
  await checkIfEmailIsRegistered(parsed.email);
  const passwordHashed = await auth.hashPassword(parsed.password);
  const result = await insertNewUser({ ...parsed, password: passwordHashed });
  if (!result) throw new DatabaseError('Erro while creating a new user');
  await category.insertDefaultCategories(result.id);
  return CreateUserResponseSchema.parse(result);
};

const insertNewUser = async (
  userData: CreateUserRequest,
): Promise<User | null> => {
  const rows = await database.query<{ [key: string]: unknown }>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [userData.email, userData.password, userData.name],
  );
  const row = rows[0];
  return row ? UserSchema.parse(row) : null;
};

const checkIfEmailIsRegistered = async (email: string): Promise<void> => {
  const user = await getUserByEmail(email);
  if (user) throw new BadRequestError('email already registered');
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const rows = await database.query<{ [key: string]: unknown }>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  const row = rows[0];
  return row ? UserSchema.parse(row) : null;
};

const getUserById = async (userId: string): Promise<User | null> => {
  const rows = await database.query('SELECT * FROM users WHERE id = $1', [
    userId,
  ]);
  const row = rows[0];
  return row ? UserSchema.parse(row) : null;
};

const user = { createNewUser, getUserByEmail, getUserById };

export default user;
