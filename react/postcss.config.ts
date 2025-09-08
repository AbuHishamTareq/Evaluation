import type { Plugin } from 'postcss';

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
} satisfies { plugins: Record<string, Plugin | unknown> };

export default config;
