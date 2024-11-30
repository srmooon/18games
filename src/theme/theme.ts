import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#FFE5F3',
    100: '#FFB8E3',
    200: '#FF8AD3',
    300: '#FF5CC3',
    400: '#FF2EB3',
    500: '#FF00A3', // Principal (Rosa)
    600: '#CC0082',
    700: '#990062',
    800: '#660041',
    900: '#330021',
  },
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.900',
        color: 'white',
      },
    },
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            backgroundColor: 'gray.800',
            borderColor: 'gray.700',
            _hover: {
              borderColor: 'gray.600',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Button: {
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            _disabled: {
              bg: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;
