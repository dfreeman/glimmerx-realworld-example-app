/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  plugins: ['@glimmerx', '@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  ignorePatterns: ['dist/', 'node_modules/', '!.*'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        '@dfreeman',
      ],
      rules: {
        'no-empty-pattern': 'off',

        // Covered by glint
        '@glimmerx/template-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['.babelrc.js', 'testem.js', 'webpack.config.js'],
      env: {
        node: true,
      },
    },
  ],
};
