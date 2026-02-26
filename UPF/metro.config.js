const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Customize Metro to exclude built-in Node modules
config.resolver.blacklistRE = /node_modules\/(react-native|expo)\/.+\.native\.js$/;
config.resolver.sourceExts = ['web.js', 'web.ts', 'web.tsx', 'js', 'jsx', 'ts', 'tsx', 'json'];

module.exports = config;
