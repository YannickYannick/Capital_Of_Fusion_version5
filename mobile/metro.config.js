const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// adb reverse → 127.0.0.1 — écouter sur toutes les interfaces (incl. IPv4).
config.server = {
  ...config.server,
  host: '0.0.0.0',
};

module.exports = config;
