const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  if (config.resolve && config.resolve.extensions) {
    if (!config.resolve.extensions.includes('.mjs')) {
      config.resolve.extensions.push('.mjs');
    }
  }

  if (config.module && Array.isArray(config.module.rules)) {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
  }

  return config;
};
