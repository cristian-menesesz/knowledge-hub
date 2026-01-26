import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'tokens/index': 'src/tokens/index.ts',
    'components/index': 'src/components/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Disabled due to --incremental conflict with root tsconfig
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
