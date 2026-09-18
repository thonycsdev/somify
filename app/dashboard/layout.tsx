import { Box, Container, Flex, HStack, Link, Text } from '@chakra-ui/react';
import { cookies } from 'next/headers';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/dashboard/logout-button';
import session from '@/models/session';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) redirect('/account/login');

  try {
    await session.getTokenOwner(token);
  } catch {
    redirect('/account/login');
  }

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" borderBottomWidth="1px">
        <Container maxW="6xl">
          <HStack justify="space-between" py="3">
            <Link asChild fontWeight="semibold" fontSize="lg">
              <NextLink href="/dashboard">somify</NextLink>
            </Link>
            <LogoutButton />
          </HStack>
        </Container>
      </Box>

      <Container maxW="6xl" flex="1" py={{ base: '8', md: '12' }}>
        {children}
      </Container>

      <Box as="footer" borderTopWidth="1px">
        <Container maxW="6xl">
          <HStack justify="space-between" py="4">
            <Text fontSize="sm" color="fg.muted">
              &copy; {new Date().getFullYear()} somify. Todos os direitos
              reservados.
            </Text>
          </HStack>
        </Container>
      </Box>
    </Flex>
  );
}
