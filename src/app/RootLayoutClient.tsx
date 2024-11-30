'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { UserContextProvider } from '@/contexts/UserContext';
import { ColorMode } from '@/components/ColorMode';
import Navbar from '@/components/Navbar';
import theme from '@/theme/theme';

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ChakraProvider theme={theme}>
          <UserContextProvider>
            <ColorMode />
            <Navbar />
            {children}
          </UserContextProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
