'use client';

import { Button, Field, Input, NativeSelect, Stack } from '@chakra-ui/react';
import { type SubmitEvent, useEffect, useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import type { CategoryResponse } from '@/schemas/category';

type TransactionType = 'expense' | 'income';

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export function CreateTransactionForm(): React.JSX.Element {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [occurredAt, setOccurredAt] = useState(todayIsoDate());
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await fetch('/api/v1/category');
        if (!response.ok) return;
        const data: CategoryResponse[] = await response.json();
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      } catch {
        // Categories stay empty; the select shows no options.
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_cents: Math.round(Number(amount) * 100),
          type,
          description,
          category_id: categoryId,
          occurred_at: occurredAt,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? 'Não foi possível criar a transação.');
        return;
      }
      toaster.create({
        title: 'Transação criada com sucesso',
        type: 'success',
      });
      setAmount('');
      setDescription('');
      setOccurredAt(todayIsoDate());
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack asChild gap="4">
      <form onSubmit={handleSubmit}>
        <Field.Root required>
          <Field.Label>
            Valor <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Tipo <Field.RequiredIndicator />
          </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={type}
              onChange={(event) =>
                setType(event.target.value as TransactionType)
              }
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root required disabled={categories.length === 0}>
          <Field.Label>
            Categoria <Field.RequiredIndicator />
          </Field.Label>
          <NativeSelect.Root disabled={categories.length === 0}>
            <NativeSelect.Field
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              placeholder={
                categories.length === 0
                  ? 'Nenhuma categoria encontrada'
                  : undefined
              }
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Descrição <Field.RequiredIndicator />
          </Field.Label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Supermercado"
            maxLength={255}
          />
        </Field.Root>

        <Field.Root invalid={!!error} required>
          <Field.Label>
            Data <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="date"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
          />
          {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
        </Field.Root>

        <Button type="submit" size="lg" loading={isLoading}>
          Adicionar transação
        </Button>
      </form>
    </Stack>
  );
}
