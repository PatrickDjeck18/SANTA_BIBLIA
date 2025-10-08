// AdMob Configuration
export const ADS_CONFIG = {
  // AdMob Production IDs
  ADMOB: {
    BANNER_ID: 'ca-app-pub-2813380177518944/1447793786', // Android Banner ad ID
    INTERSTITIAL_ID: 'ca-app-pub-2813380177518944/9482196478', // Android Interstitial ad ID
    REWARDED_ID: 'ca-app-pub-2813380177518944/3547343510', // Android Reward ad ID
    APP_ID: 'ca-app-pub-2813380177518944~4613013173', // Android App ID
    IOS_APP_ID: 'ca-app-pub-2813380177518944~5140638548', // iOS App ID
    IOS_BANNER_ID: 'ca-app-pub-2813380177518944/8888311868', // iOS Banner ad ID
    IOS_INTERSTITIAL_ID: 'ca-app-pub-2813380177518944/3188250868', // iOS Interstitial ad ID
    IOS_REWARDED_ID: 'ca-app-pub-2813380177518944/7383658507', // iOS Reward ad ID
  },
};

// Ad placement configuration
export const AD_PLACEMENTS = {
  BANNER: {
    HOME: 'home_banner',
    BIBLE: 'bible_banner',
    PRAYER: 'prayer_banner',
    MOOD: 'mood_banner',
    QUIZ: 'quiz_banner',
    DREAM: 'dream_banner',
    NOTES: 'notes_banner',
  },
  INTERSTITIAL: {
    HOME: 'home_interstitial',
    BIBLE: 'bible_interstitial',
    PRAYER: 'prayer_interstitial',
    MOOD: 'mood_interstitial',
    QUIZ: 'quiz_interstitial',
    DREAM: 'dream_interstitial',
    NOTES: 'notes_interstitial',
  },
  REWARDED: {
    BIBLE_CHAT: 'bible_chat_rewarded',
    QUIZ: 'quiz_rewarded',
    DREAM: 'dream_rewarded',
  },
};