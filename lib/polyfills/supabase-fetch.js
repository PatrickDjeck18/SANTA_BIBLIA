// Polyfill for @supabase/node-fetch in React Native environment
// This provides a fetch implementation that works with Supabase

// Import the React Native fetch polyfill
const fetchPolyfill = require('react-native-fetch-polyfill');

// Export as both default and named export for compatibility
module.exports = fetchPolyfill;
module.exports.default = fetchPolyfill;

// Also export as ES module for compatibility with dynamic imports
if (typeof module.exports.default === 'function') {
  module.exports.__esModule = true;
}