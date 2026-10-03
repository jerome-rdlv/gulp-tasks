import compat from 'eslint-plugin-compat';
import babelParser from '@babel/eslint-parser';
import babelPlugin from '@babel/eslint-plugin';
import polyfills from './polyfills.mjs';
import {defineConfig} from 'eslint/config';

// See https://eslint.org/docs/latest/use/configure/configuration-files
// See https://eslint.org/docs/latest/use/configure/migration-guide
export default defineConfig([
	compat.configs['flat/recommended'],
	{
		plugins: {
			babelPlugin,
		},
		languageOptions: {
			parser: babelParser,
			parserOptions: {
				requireConfigFile: false,
				// requireConfigFile: __dirname + "/babel.config.js",
			},
		},
		settings: {
			polyfills,
		},
	},
]);
