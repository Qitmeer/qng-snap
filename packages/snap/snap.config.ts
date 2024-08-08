import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
  customizeWebpackConfig: (conf) =>
    merge(conf, {
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
      },
      resolve: {
        alias: {
          name: 'tiny-secp256k1',
          alias: resolve(__dirname, 'node_modules/tiny-secp256k1'),
        },
      },
      module: {
        rules: [
          {
            test: /\.wasm$/u,
            type: 'webassembly/async',
          },
        ],
      },
    }),
};

export default config;
