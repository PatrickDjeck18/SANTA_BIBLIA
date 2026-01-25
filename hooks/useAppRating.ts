import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    FIRST_LAUNCH_DATE: 'app_launch_first_date',
    HAS_RATED: 'app_has_rated_dialog_shown',
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const useAppRating = () => {


    // Function to manually request review (e.g. from settings)
    const rateApp = async () => {
        // For manual "Rate Us" buttons, it's better to open the store page directly
        const androidPackageName = 'com.daily.santa.biblia';
        const iosAppId = '6752252289';

        if (Platform.OS === 'android') {
            try {
                // Try market:// scheme first
                await Linking.openURL(`market://details?id=${androidPackageName}`);
            } catch (err) {
                // Fallback to web URL
                await Linking.openURL(`https://play.google.com/store/apps/details?id=${androidPackageName}`);
            }
        } else {
            // iOS
            const url = `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${iosAppId}?action=write-review`;
            try {
                await Linking.openURL(url);
            } catch (err) {
                await Linking.openURL(`https://apps.apple.com/us/app/id${iosAppId}`);
            }
        }
    };

    return { rateApp };
};
