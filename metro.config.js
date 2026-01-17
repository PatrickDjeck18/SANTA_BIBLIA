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
const path = require('path');
config.maxWorkers = 2;

// Ensure the polyfill directory is watched
config.watchFolders = [
  __dirname,
  path.resolve(__dirname, 'lib/polyfills')
];

// Add polyfills for Node.js modules that Supabase needs
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@supabase/node-fetch': path.resolve(__dirname, 'lib/polyfills/supabase-fetch.js')
};

// Add module resolution for Supabase packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@supabase/node-fetch') {
    return {
      filePath: path.resolve(__dirname, 'lib/polyfills/supabase-fetch.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Cache configuration for better performance
config.cacheVersion = '1.0';
config.cacheVersion = '1.0';
config.resetCache = true;

module.exports = config;