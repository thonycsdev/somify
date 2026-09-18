'use client';

import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={isLoading}
      onClick={handleLogout}
    >
      Sair
    </Button>
  );
}
