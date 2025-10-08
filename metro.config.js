const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove CSS support since there are no CSS files in the project
// config.resolver.assetExts.push('css');
// config.resolver.sourceExts.push('css');

// Remove CSS transformer as it's causing conflicts
// config.transformer = {
//   ...config.transformer,
//   babelTransformerPath: require.resolve('react-native-css-transformer'),
// };

// Basic configuration to prevent file watcher timeouts
config.watchFolders = [__dirname];
config.maxWorkers = 2;

// Add polyfills for Node.js modules that Supabase needs
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@supabase/node-fetch': require.resolve('@supabase/node-fetch'),
  'node-fetch': require.resolve('@supabase/node-fetch'),
};

// Add global polyfill for fetch in React Native
config.resolver.extraNodeModules['@supabase/node-fetch/polyfill/global'] = require.resolve('@supabase/node-fetch');

// Cache configuration for better performance
config.cacheVersion = '1.0';

module.exports = config;