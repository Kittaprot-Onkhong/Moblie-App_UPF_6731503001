const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 🔥 FIX idb broken package
config.resolver.extraNodeModules = {
  idb: require.resolve('idb/with-async-ittr.js'),
};

module.exports = config;
