const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    languageOptions: {
      parser: tsParser, // not a string!
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        project: './tsconfig.json', // if you use TypeScript
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@next/next': require('@next/eslint-plugin-next'),
    },

    rules: {
      ...next.configs['core-web-vitals'].rules,
      'react/no-unescaped-entities': 'off',
    },
  },
];
