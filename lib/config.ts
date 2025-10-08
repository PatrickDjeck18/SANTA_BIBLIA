import Constants from 'expo-constants';

// Environment configuration
export const config = {
  supabase: {
    url: Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  google: {
    clientId: Constants.expoConfig?.extra?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '354959331079-faisqnjq2nd81nrhnikm2t0clfc49kle.apps.googleusercontent.com',
    webClientId: '354959331079-faisqnjq2nd81nrhnikm2t0clfc49kle.apps.googleusercontent.com',
  },
  deepseek: {
    apiKey: Constants.expoConfig?.extra?.deepseekApiKey || process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
    apiUrl: 'https://api.deepseek.com/chat/completions',
  },
  // Debug environment variables
  debug: {
    deepseekApiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
    expoConfigDeepseekApiKey: Constants.expoConfig?.extra?.deepseekApiKey,
  },
  app: {
    scheme: typeof Constants.expoConfig?.scheme === 'string' ? Constants.expoConfig.scheme : 'daily-bread',
    name: Constants.expoConfig?.name || 'Daily Bread',
  },
};