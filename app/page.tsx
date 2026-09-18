import {
  Box,
  Button,
  Container,
  EmptyState,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';

const features = [
  {
    title: 'Registre seus gastos',
    description:
      'Anote cada despesa em segundos e tenha uma visão clara de para onde vai o seu dinheiro.',
  },
  {
    title: 'Defina metas de economia',
    description:
      'Estabeleça quanto quer guardar por mês e acompanhe o quanto falta para alcançar cada meta.',
  },
  {
    title: 'Acompanhe sua evolução',
    description:
      'Veja relatórios que mostram seu progresso rumo à liberdade financeira.',
  },
];

export default function Home(): React.JSX.Element {
  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" borderBottomWidth="1px">
        <Container maxW="6xl">
          <HStack justify="space-between" py="3">
            <Link asChild fontWeight="semibold" fontSize="lg">
              <NextLink href="/">somify</NextLink>
            </Link>
            <HStack gap="3">
              <Button asChild variant="ghost" size="sm">
                <NextLink href="/account/login">Entrar</NextLink>
              </Button>
              <Button asChild variant="solid" size="sm">
                <NextLink href="/account/create">Criar conta grátis</NextLink>
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="6xl" flex="1" py={{ base: '12', md: '20' }}>
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <Stack textAlign="center" gap="4">
              <EmptyState.Title as="h1" fontSize={{ base: '3xl', md: '5xl' }}>
                Economize. Cresça. Conquiste.
              </EmptyState.Title>
              <EmptyState.Description maxW="lg" mx="auto" fontSize="lg">
                Registre seus gastos, defina metas de economia e acompanhe sua
                evolução financeira até a liberdade financeira.
              </EmptyState.Description>
            </Stack>
            <HStack gap="3">
              <Button asChild size="lg">
                <NextLink href="/account/create">Criar conta grátis</NextLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#recursos">Ver como funciona</a>
              </Button>
            </HStack>
          </EmptyState.Content>
        </EmptyState.Root>

        <SimpleGrid
          id="recursos"
          columns={{ base: 1, md: 3 }}
          gap="8"
          mt={{ base: '16', md: '24' }}
        >
          {features.map((feature) => (
            <Stack key={feature.title} gap="2">
              <Heading as="h3" size="md">
                {feature.title}
              </Heading>
              <Text color="fg.muted">{feature.description}</Text>
            </Stack>
          ))}
        </SimpleGrid>
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
