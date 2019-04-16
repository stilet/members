import alias from 'rollup-plugin-alias'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import yaml from 'rollup-plugin-yaml'
import { terser } from 'rollup-plugin-terser'

import postcssSass from '@csstools/postcss-sass'
import postcss from 'rollup-plugin-postcss'

import config from 'sapper/config/rollup.js'
import pkg from './package.json'
import preprocess from 'svelte-preprocess'
import path from 'path'

const mode = process.env.NODE_ENV
const dev = mode === 'development'
const legacy = !!process.env.SAPPER_LEGACY_BUILD

const aliased = {
  resolve: ['.html', '.js', '.svelte', '.yaml', '.yml'],
  src: path.resolve('src'),
}

const clientOutput = config.client.output()
const postcssPlugins = [
  postcssSass()
]
const sveltePreprocessor = {
  style: preprocess({
    postcss: {
      plugins: postcssPlugins
    }
  }).style
}

export default {
  client: {
    input: config.client.input(),
    output: clientOutput,
    plugins: [
      alias(aliased),
      yaml(),
      postcss({
        plugins: postcssPlugins,
        extract: path.join(clientOutput.dir, 'styles.css'),
      }),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        preprocess: sveltePreprocessor
      }),
      resolve({
        mainFields: ["module", "browser"]
      }),
      commonjs(),

      legacy && babel({
        extensions: ['.js', '.mjs', '.html', '.svelte'],
        runtimeHelpers: true,
        exclude: ['node_modules/@babel/**'],
        presets: [
          ['@babel/preset-env', {
            targets: '> 0.25%, not dead'
          }]
        ],
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          ['@babel/plugin-transform-runtime', {
            useESModules: true
          }]
        ]
      }),

      !dev && terser({
        module: true
      })
    ],
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      alias(aliased),
      yaml(),
      replace({
        'process.browser': false,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        generate: 'ssr',
        dev,
        css: false,
        preprocess: sveltePreprocessor
      }),
      resolve(),
      commonjs()
    ],
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules || Object.keys(process.binding('natives'))
    )
      .filter(name => !name.startsWith('@dxlb/svelte-')),

  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      commonjs(),
      !dev && terser()
    ]
  }
}
