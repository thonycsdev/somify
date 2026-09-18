import { Heading, Stack } from '@chakra-ui/react';
import { CreateTransactionForm } from '@/components/transactions/create-transaction-form';

export default function CreateTransactionPage(): React.JSX.Element {
  return (
    <Stack gap="6" maxW="md">
      <Heading as="h1" size="xl">
        Nova transação
      </Heading>
      <CreateTransactionForm />
    </Stack>
  );
}
