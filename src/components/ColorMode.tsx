'use client';

import { useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';

export function ColorMode() {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode('dark');
  }, [setColorMode]);

  return null;
}
