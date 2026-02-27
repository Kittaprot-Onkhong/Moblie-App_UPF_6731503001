const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// บังคับให้ Metro อ่านไฟล์นามสกุล .mjs และ .cjs ของ Firebase ให้เจอ
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;