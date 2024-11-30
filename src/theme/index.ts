import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#FFE5F3',
    100: '#FFB8E3',
    200: '#FF8AD3',
    300: '#FF5CC3',
    400: '#FF2EB3',
    500: '#FF00A3', // Rosa principal
    600: '#CC0082',
    700: '#990062',
    800: '#660041',
    900: '#330021',
  },
  gray: {
    50: '#F7F7F7',
    100: '#EFEFEF',
    200: '#DFDFDF',
    300: '#CCCCCC',
    400: '#B8B8B8',
    500: '#999999', // Cinza principal
    600: '#666666',
    700: '#4D4D4D',
    800: '#333333', // Cinza escuro
    900: '#1A1A1A',
  },
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export default extendTheme({
  colors,
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});
