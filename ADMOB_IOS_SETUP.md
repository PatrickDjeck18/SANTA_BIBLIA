# AdMob iOS Setup Guide for Daily Faith App

This guide covers the complete AdMob setup for your React Native Expo iOS app, including App Tracking Transparency (ATT) compliance.

## ✅ What's Already Configured

Your app already has the following AdMob setup:

### 1. AdMob Configuration (`app.json`)
- ✅ iOS App ID: `ca-app-pub-2813380177518944~5140638548`
- ✅ Android App ID: `ca-app-pub-2813380177518944~4613013173`
- ✅ NSUserTrackingUsageDescription for ATT compliance
- ✅ SKAdNetworkItems for iOS 14+ tracking
- ✅ react-native-google-mobile-ads plugin configured

### 2. Ad Unit IDs (`lib/adsConfig.ts`)
- ✅ iOS Banner: `ca-app-pub-2813380177518944/8888311868`
- ✅ iOS Interstitial: `ca-app-pub-2813380177518944/3188250868`
- ✅ iOS Rewarded: `ca-app-pub-2813380177518944/7383658507`

### 3. App Tracking Transparency (ATT)
- ✅ ATT service implemented (`lib/attService.ts`)
- ✅ ATT hook created (`hooks/useATT.ts`)
- ✅ Automatic permission request on app launch
- ✅ Personalized/non-personalized ad handling

## 🚀 New Features Added

### 1. Enhanced AdMob Service (`lib/adMobService.ts`)
- Integrated with ATT for personalized/non-personalized ads
- Improved error handling and timeout management
- Better iOS-specific optimizations

### 2. App Tracking Transparency (`lib/attService.ts`)
- Automatic ATT permission request
- Personalized vs non-personalized ad handling
- iOS 14+ compliance

### 3. Ad Components
- **BannerAdComponent**: Enhanced with ATT integration
- **InterstitialAdComponent**: New component with loading states
- **RewardedAdComponent**: New component with reward handling

### 4. ATT Hook (`hooks/useATT.ts`)
- Easy ATT status management
- Automatic permission dialogs
- Cross-platform compatibility

## 📱 How to Use Ad Components

### Banner Ads
```tsx
import BannerAdComponent from '../components/BannerAd';

<BannerAdComponent placement="home" />
```

### Interstitial Ads
```tsx
import InterstitialAdComponent from '../components/InterstitialAdComponent';

<InterstitialAdComponent 
  placement="home"
  onAdShown={() => console.log('Ad shown')}
  onAdFailed={(error) => console.log('Ad failed:', error)}
/>
```

### Rewarded Ads
```tsx
import RewardedAdComponent from '../components/RewardedAdComponent';

<RewardedAdComponent 
  placement="bible_chat"
  buttonText="Watch Ad for Reward"
  onRewardEarned={(reward) => console.log('Reward:', reward)}
/>
```

### Programmatic Ad Control
```tsx
import { useAds } from '../hooks/useAds';

const { showInterstitialAd, showRewardedAd } = useAds();

// Show interstitial ad
await showInterstitialAd('home');

// Show rewarded ad
const result = await showRewardedAd('bible_chat');
```

## 🏗️ Building for iOS

### 1. EAS Build Configuration
Your `eas.json` is already configured for production iOS builds:

```json
{
  "production": {
    "autoIncrement": true,
    "ios": {
      "buildConfiguration": "Release",
      "simulator": false
    }
  }
}
```

### 2. Build Commands
```bash
# Build for iOS production
eas build --platform ios --profile production

# Build for iOS preview
eas build --platform ios --profile preview
```

### 3. Required Dependencies
All required packages are already installed:
- ✅ `react-native-google-mobile-ads`
- ✅ `react-native-tracking-transparency``

## 🔧 iOS-Specific Optimizations

### 1. ATT Compliance
- Automatic permission request on first launch
- Personalized ads only when user consents
- Non-personalized ads when user denies tracking
- Proper error handling for ATT failures

### 2. Ad Request Optimization
- iOS-specific banner sizes
- Proper keyword targeting
- ATT-based personalization settings
- Error handling for iOS-specific issues

### 3. App Store Compliance
- NSUserTrackingUsageDescription included
- SKAdNetworkItems configured
- Privacy policy mentions ad tracking
- COPPA compliance considerations

## 📊 Ad Placement Strategy

### Banner Ads
- Home screen bottom
- Bible reader top/bottom
- Prayer journal bottom
- Mood tracker bottom

### Interstitial Ads
- Between major screen transitions
- After completing actions (prayer, reading)
- Before premium features

### Rewarded Ads
- AI Bible chat (unlock more questions)
- Dream interpretation (unlock analysis)
- Quiz features (unlock hints)

## 🚨 Important Notes

### 1. Testing
- Use test ad unit IDs in development
- Test on real iOS devices
- Verify ATT permission flow
- Test both personalized and non-personalized ads

### 2. App Store Submission
- Ensure ATT permission is requested before showing ads
- Include privacy policy with ad tracking information
- Test on iOS 14+ devices
- Verify SKAdNetwork configuration

### 3. Revenue Optimization
- Monitor ad performance in AdMob dashboard
- A/B test ad placements
- Optimize for user experience
- Consider premium ad-free option

## 🔍 Troubleshooting

### Common Issues
1. **Ads not showing**: Check ATT permission status
2. **Build errors**: Ensure all dependencies are installed
3. **ATT not working**: Verify iOS 14+ device and proper configuration
4. **Ad loading failures**: Check network connectivity and ad unit IDs

### Debug Commands
```bash
# Check if AdMob is available
console.log('AdMob available:', AdManager.isAvailable());

# Check ATT status
const attStatus = attService.getCurrentStatus();
console.log('ATT status:', attStatus);
```

## 📈 Next Steps

1. **Test the implementation** on iOS devices
2. **Integrate ad components** into your screens
3. **Build and test** with EAS
4. **Submit to App Store** with proper ATT compliance
5. **Monitor performance** in AdMob dashboard

Your AdMob setup is now complete and ready for iOS App Store submission! 🎉
