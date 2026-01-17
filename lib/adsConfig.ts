// AdMob Configuration
export const ADS_CONFIG = {
  // AdMob Production IDs
  ADMOB: {
    BANNER_ID: 'ca-app-pub-4253750298784159/2650837113', // Android Banner ad ID
    INTERSTITIAL_ID: 'ca-app-pub-4253750298784159/6398510433', // Android Interstitial ad ID
    REWARDED_ID: 'ca-app-pub-2813380177518944/3547343510', // Android Reward ad ID (Keep old or ask user?)
    APP_ID: 'ca-app-pub-4253750298784159~6198188122', // Android App ID
    IOS_APP_ID: 'ca-app-pub-4253750298784159~6004098078', // iOS App ID
    IOS_BANNER_ID: 'ca-app-pub-4253750298784159/5085428764', // iOS Banner ad ID
    IOS_INTERSTITIAL_ID: 'ca-app-pub-4253750298784159/8441208085', // iOS Interstitial ad ID
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