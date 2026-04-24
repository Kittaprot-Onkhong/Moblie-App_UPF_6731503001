const createExpoWebpackConfigAsync = require('@expo/webpack-config');
(async () => {
  const config = await createExpoWebpackConfigAsync({}, {});
  console.log('extensions:', config.resolve && config.resolve.extensions);
  console.log('mjs rules:', (config.module && config.module.rules && config.module.rules.filter(r => r.test && r.test.toString().includes('mjs'))) || []);
})();
