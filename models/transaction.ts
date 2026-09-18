import database from '@/infra/database';
import { DatabaseError, NotFoundError } from '@/infra/error-handler';
import {
  type TransactionRequest,
  type TransactionResponse,
  TransactionResponseSchema,
  type TransactionUpdateRequest,
} from '@/schemas/transaction';

const createOne = async (data: TransactionRequest) => {
  const createdTransaction = await insertOneTransaction(data);
  if (!createdTransaction)
    throw new DatabaseError('Erro ao criar uma nova transação.');
  return createdTransaction;
};

const insertOneTransaction = async (
  data: TransactionRequest,
): Promise<TransactionResponse | null> => {
  const result = await database.query(
    `WITH inserted AS (
      INSERT INTO
          transactions
          (user_id,amount_cents,description,category_id,type,occurred_at)
      VALUES
          ($1,$2,$3,$4,$5,$6)
      RETURNING *
    )
    SELECT
      i.id,
      i.user_id,
      i.type,
      i.amount_cents,
      i.description,
      i.occurred_at,
      i.category_id,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'user_id', c.user_id,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category
    FROM inserted i
    JOIN categories c ON c.id = i.category_id;`,
    [
      data.user_id,
      data.amount_cents,
      data.description,
      data.category_id,
      data.type,
      data.occurred_at,
    ],
  );
  return result.length ? TransactionResponseSchema.parse(result[0]) : null;
};

const getManyByUserId = async (
  userId: string,
): Promise<TransactionResponse[]> => {
  const result = await database.query(
    `SELECT
      t.id,
      t.user_id,
      t.type,
      t.amount_cents,
      t.description,
      t.category_id,
      t.occurred_at,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'user_id', c.user_id,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category
    FROM transactions t
    INNER JOIN categories c
    ON c.id = t.category_id
    WHERE t.user_id = $1;`,
    [userId],
  );

  const data = result.map((x) => TransactionResponseSchema.parse(x));
  return data;
};

const getOneById = async (
  id: string,
  userId: string,
): Promise<TransactionResponse> => {
  const result = await database.query(
    `SELECT
      t.id,
      t.user_id,
      t.type,
      t.amount_cents,
      t.description,
      t.category_id,
      t.occurred_at,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'user_id', c.user_id,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category
    FROM transactions t
    INNER JOIN categories c
    ON c.id = t.category_id  
    WHERE t.id = $1
    AND t.user_id = $2;
         `,
    [id, userId],
  );
  if (!result.length) throw new NotFoundError('Transaction não encontrada.');
  const data = TransactionResponseSchema.parse(result[0]);
  return data;
};

const updateOne = async (
  id: string,
  userId: string,
  data: TransactionUpdateRequest,
): Promise<TransactionResponse> => {
  const result = await database.query(
    `WITH updated AS (
      UPDATE transactions
      SET amount_cents = COALESCE($1, amount_cents),
          description = COALESCE($2, description),
          category_id = $3,
          occurred_at = COALESCE($4, occurred_at),
          updated_at = now()
      WHERE id = $5 AND user_id = $6
      RETURNING *
    )
    SELECT
      u.id,
      u.user_id,
      u.type,
      u.amount_cents,
      u.description,
      u.category_id,
      u.occurred_at,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'user_id', c.user_id,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category
    FROM updated u
    JOIN categories c ON c.id = u.category_id;`,
    [
      data.amount_cents,
      data.description,
      data.category_id,
      data.occurred_at,
      id,
      userId,
    ],
  );
  if (!result.length) throw new NotFoundError('Transaction não encontrada.');
  return TransactionResponseSchema.parse(result[0]);
};

const deleteOne = async (id: string, userId: string): Promise<void> => {
  const result = await database.query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id;`,
    [id, userId],
  );
  if (!result.length) throw new NotFoundError('Transaction não encontrada.');
};

const transaction = {
  createOne,
  getManyByUserId,
  getOneById,
  updateOne,
  deleteOne,
};
export default transaction;
