import globals from 'globals';
import pluginJs from '@eslint/js';

// See https://eslint.org/docs/latest/use/configure/configuration-files
// See https://eslint.org/docs/latest/use/configure/migration-guide
export default [
	{
		languageOptions: {
			globals: globals.browser,
		}
	},
	pluginJs.configs.recommended,
];
