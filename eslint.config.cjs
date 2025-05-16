const next = require('@next/eslint-plugin-next');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': next,
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // optional but recommended if you have tsconfig
      },
    },
    rules: {
      ...next.configs['core-web-vitals'].rules,
      'react/no-unescaped-entities': 'off',
    },
  },
];
