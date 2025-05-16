const next = require('@next/eslint-plugin-next');

/** @type {import('eslint').FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': next,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...next.configs['core-web-vitals'].rules,
      'react/no-unescaped-entities': 'off', // Disable that rule
    },
  },
];
