import commonjs from 'rollup-plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const externals = {
  'react': 'React',
  'react-dom': 'ReactDOM',
}

const createConf = (page) => {
  return {
    input: `./examples/${page}.tsx`,
    output: [
      {
        file: `./dist/js/${page}.js`,
        format: 'iife',
        sourcemap: true,
        globals: externals,
      }
    ],
    external: Object.keys(externals),
    plugins: [
      resolve(),
      commonjs({
        namedExports: {
          'examples/node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer',
          ],
          'examples/node_modules/use-sync-external-store/shim/with-selector.js': [
            'useSyncExternalStoreWithSelector'
          ],
          'examples/node_modules/use-sync-external-store/shim/index.js': [
            'useSyncExternalStore'
          ]
        }
      }),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: path.resolve(__dirname, './tsconfig.dev.json')
      }),
      sourcemaps(),
      injectProcessEnv({
        NODE_ENV: 'production'
      }),
    ]
  };
};

export default [
  createConf('develop')
];