'use client';

import {
  Badge,
  Button,
  EmptyState,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import type { TransactionResponse } from '@/schemas/transaction';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export default function Dashboard(): React.JSX.Element {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async (): Promise<void> => {
      try {
        const response = await fetch('/api/v1/transaction');
        if (!response.ok) {
          setError('Não foi possível carregar suas transações.');
          return;
        }
        const data: TransactionResponse[] = await response.json();
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.occurred_at).getTime() -
            new Date(a.occurred_at).getTime(),
        );
        setTransactions(sorted);
      } catch {
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <Flex justify="center" py="20">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" py="20">
        <Text color="fg.error">{error}</Text>
      </Flex>
    );
  }

  return (
    <Stack gap="6">
      <Flex justify="space-between" align="center">
        <Heading as="h1" size="xl">
          Transações
        </Heading>
        <Button asChild>
          <NextLink href="/dashboard/transaction/create">
            Nova transação
          </NextLink>
        </Button>
      </Flex>

      {transactions.length === 0 ? (
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <EmptyState.Title>Nenhuma transação ainda</EmptyState.Title>
            <EmptyState.Description>
              Suas transações aparecerão aqui assim que você registrar a
              primeira.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Data</Table.ColumnHeader>
              <Table.ColumnHeader>Categoria</Table.ColumnHeader>
              <Table.ColumnHeader>Descrição</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Valor</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.map((transaction) => (
              <Table.Row key={transaction.id}>
                <Table.Cell>
                  {dateFormatter.format(new Date(transaction.occurred_at))}
                </Table.Cell>
                <Table.Cell>{transaction.category.name}</Table.Cell>
                <Table.Cell>{transaction.description}</Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={
                      transaction.type === 'income' ? 'green' : 'red'
                    }
                  >
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {currencyFormatter.format(transaction.amount_cents / 100)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Stack>
  );
}
