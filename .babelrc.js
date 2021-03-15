module.exports = function (api) {
  return {
    plugins: [
      ['@glimmer/babel-plugin-glimmer-env', { DEBUG: !api.env('production') }],
      '@glimmerx/babel-plugin-component-templates',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
  };
};
