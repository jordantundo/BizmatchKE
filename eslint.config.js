import next from '@next/eslint-plugin-next';

export default [
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
      'react/no-unescaped-entities': 'off', // <-- disable the rule here
    },
  },
];
