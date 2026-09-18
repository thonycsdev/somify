import { Box, Container, Flex, HStack, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" borderBottomWidth="1px">
        <Container maxW="6xl">
          <HStack py="3">
            <Link asChild fontWeight="semibold" fontSize="lg">
              <NextLink href="/">somify</NextLink>
            </Link>
          </HStack>
        </Container>
      </Box>

      <Flex
        flex="1"
        align="center"
        justify="center"
        px="4"
        py={{ base: '12', md: '20' }}
      >
        <Container maxW="sm">{children}</Container>
      </Flex>
    </Flex>
  );
}
