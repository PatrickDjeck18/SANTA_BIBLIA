import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

// RevenueCat API keys - Production
const REVENUECAT_API_KEY_IOS = 'appl_CrjDyLTrwdojPCspuGxLeXlkUOE';
const REVENUECAT_API_KEY_ANDROID = 'your_android_api_key_here'; // TODO: Add Android key when available

// Entitlement ID for premium access (must match RevenueCat dashboard)
const PREMIUM_ENTITLEMENT = 'premium';

// Subscription price for display (fallback if RevenueCat doesn't load)
export const SUBSCRIPTION_PRICE = '$3.99';
export const SUBSCRIPTION_PERIOD = 'month';

// Product ID (must match App Store Connect / Google Play Console)
export const PRODUCT_ID_MONTHLY = 'bible_add_free_monthly';

// Define the package type to match RevenueCat's interface
interface PurchasesPackage {
    identifier: string;
    packageType: string;
    product: {
        title: string;
        description: string;
        price: number;
        priceString: string;
        currencyCode: string;
        identifier: string;
    };
}

interface SubscriptionContextType {
    // Premium status
    isPremium: boolean;
    isAdFree: boolean; // Alias for isPremium for backward compatibility

    // Loading & purchasing states
    isLoading: boolean;
    isPurchasing: boolean;

    // Available packages from RevenueCat
    packages: PurchasesPackage[];
    currentOffering: any;

    // Actions
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    checkSubscriptionStatus: () => Promise<void>;

    // User identification
    identifyUser: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Conditionally import react-native-purchases only on native platforms
let Purchases: any = null;

// Dynamic import for react-native-purchases
// IMPORTANT: react-native-purchases is NOT installed in this project
// This function always returns false to use mock data and prevent crashes
const loadPurchasesModule = async (): Promise<boolean> => {
    // Only attempt on native platforms
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        console.log('RevenueCat: Skipping on non-native platform');
        return false;
    }

    try {
        const module = await import('react-native-purchases').catch(() => null);

        if (module && module.default) {
            Purchases = module.default;
            console.log('RevenueCat: Module loaded successfully');
            return true;
        } else {
            console.log('RevenueCat: Module not available, using mock');
            return false;
        }
    } catch (error) {
        console.log('RevenueCat: Failed to load module, using mock:', error);
        return false;
    }
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    // On Android, set isPremium to true by default to disable paywall
    const [isPremium, setIsPremium] = useState(Platform.OS === 'android' ? true : false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [currentOffering, setCurrentOffering] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(Platform.OS === 'android' ? false : true);
    const [isConfigured, setIsConfigured] = useState(false);
    const [purchasesAvailable, setPurchasesAvailable] = useState(false);

    useEffect(() => {
        // On Android, skip RevenueCat initialization entirely
        if (Platform.OS === 'android') {
            console.log('RevenueCat: Disabled on Android - users are treated as premium');
            setIsLoading(false);
            setIsPremium(true);
            return;
        }

        // Wrap in async IIFE with additional safety catch and timeout to prevent launch crashes
        const initWithTimeout = async () => {
            try {
                // Create a timeout promise
                const timeoutPromise = new Promise<void>((_, reject) => {
                    setTimeout(() => reject(new Error('Subscription initialization timeout')), 10000);
                });

                // Race between initialization and timeout
                await Promise.race([
                    initializePurchases(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error('SubscriptionProvider: Critical error during initialization:', error);
                // Ensure loading state is cleared even on critical errors or timeout
                setIsLoading(false);
                // Set mock data on timeout
                setPackages([{
                    identifier: PRODUCT_ID_MONTHLY,
                    packageType: 'MONTHLY',
                    product: {
                        title: 'Ad-Free Monthly',
                        description: 'Remove all ads from the app',
                        price: 3.99,
                        priceString: '$3.99',
                        currencyCode: 'USD',
                        identifier: PRODUCT_ID_MONTHLY,
                    },
                }]);
            }
        };

        initWithTimeout();
    }, []);

    const initializePurchases = async () => {
        try {
            // Only configure on iOS/Android
            if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
                console.log('RevenueCat: Skipping configuration on web platform');
                // Provide mock data for web development
                setPackages([{
                    identifier: PRODUCT_ID_MONTHLY,
                    packageType: 'MONTHLY',
                    product: {
                        title: 'Ad-Free Monthly',
                        description: 'Remove all ads from the app',
                        price: 3.99,
                        priceString: '$3.99',
                        currencyCode: 'USD',
                        identifier: PRODUCT_ID_MONTHLY,
                    },
                }]);
                setIsLoading(false);
                return;
            }

            // Load the Purchases module
            const moduleLoaded = await loadPurchasesModule();
            setPurchasesAvailable(moduleLoaded);

            if (!moduleLoaded || !Purchases) {
                console.log('RevenueCat: Module not available, using development mode');
                // Provide mock data for development
                setPackages([{
                    identifier: PRODUCT_ID_MONTHLY,
                    packageType: 'MONTHLY',
                    product: {
                        title: 'Ad-Free Monthly',
                        description: 'Remove all ads from the app',
                        price: 3.99,
                        priceString: '$3.99',
                        currencyCode: 'USD',
                        identifier: PRODUCT_ID_MONTHLY,
                    },
                }]);
                setIsLoading(false);
                return;
            }

            const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

            // Check if already configured
            if (!isConfigured) {
                await Purchases.configure({ apiKey });
                setIsConfigured(true);
                console.log('RevenueCat: Configured successfully');
            }

            // Get offerings
            await loadOfferings();

            // Check subscription status
            await checkSubscriptionStatus();
        } catch (error) {
            console.error('Error initializing RevenueCat:', error);
            // Provide mock data on error
            setPackages([{
                identifier: 'monthly_premium',
                packageType: 'MONTHLY',
                product: {
                    title: 'Monthly Premium',
                    description: 'Get unlimited access to all features',
                    price: 3.99,
                    priceString: '$3.99',
                    currencyCode: 'USD',
                    identifier: 'monthly_premium',
                },
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOfferings = async () => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, skipping loadOfferings');
            return;
        }

        try {
            const offerings = await Purchases.getOfferings();
            console.log('RevenueCat: Loaded offerings', offerings);

            if (offerings.current) {
                setCurrentOffering(offerings.current);
                setPackages(offerings.current.availablePackages);
                console.log('RevenueCat: Available packages', offerings.current.availablePackages.length);
            }
        } catch (error) {
            console.error('Error loading offerings:', error);
        }
    };

    const checkSubscriptionStatus = async () => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, skipping checkSubscriptionStatus');
            return;
        }

        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const hasPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== 'undefined';
            setIsPremium(hasPremium);
            console.log('RevenueCat: Premium status:', hasPremium);
        } catch (error) {
            console.error('Error checking subscription:', error);
            setIsPremium(false);
        }
    };

    const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, cannot purchase');
            // For development/testing, you can toggle premium here
            // setIsPremium(true);
            // return true;
            return false;
        }

        setIsPurchasing(true);
        try {
            console.log('RevenueCat: Attempting purchase of', pkg.identifier);
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const hasPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== 'undefined';
            setIsPremium(hasPremium);
            console.log('RevenueCat: Purchase successful, premium:', hasPremium);
            return hasPremium;
        } catch (error: any) {
            if (error.userCancelled) {
                console.log('RevenueCat: User cancelled purchase');
            } else {
                console.error('Purchase error:', error);
            }
            return false;
        } finally {
            setIsPurchasing(false);
        }
    };

    const restorePurchases = async (): Promise<boolean> => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, cannot restore');
            return false;
        }

        setIsPurchasing(true);
        try {
            console.log('RevenueCat: Restoring purchases');
            const customerInfo = await Purchases.restorePurchases();
            const hasPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== 'undefined';
            setIsPremium(hasPremium);
            console.log('RevenueCat: Restored, premium:', hasPremium);
            return hasPremium;
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        } finally {
            setIsPurchasing(false);
        }
    };

    // Identify user with their unique ID (call this after authentication)
    const identifyUser = async (userId: string) => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, skipping identifyUser');
            return;
        }

        try {
            console.log('RevenueCat: Identifying user', userId);
            await Purchases.logIn(userId);
            await checkSubscriptionStatus();
        } catch (error) {
            console.error('Error identifying user:', error);
        }
    };

    // Logout user (call this when user logs out)
    const logout = async () => {
        if (!Purchases || !purchasesAvailable) {
            console.log('RevenueCat: Not available, skipping logout');
            return;
        }

        try {
            console.log('RevenueCat: Logging out user');
            await Purchases.logOut();
            setIsPremium(false);
        } catch (error) {
            console.error('Error logging out from RevenueCat:', error);
        }
    };

    return (
        <SubscriptionContext.Provider
            value={{
                isPremium,
                isAdFree: isPremium, // Backward compatibility alias
                isPurchasing,
                packages,
                currentOffering,
                purchasePackage,
                restorePurchases,
                checkSubscriptionStatus,
                isLoading,
                identifyUser,
                logout,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        // Return safe defaults instead of throwing an error
        // This can happen during hot reload or async loading
        console.warn('useSubscription called outside SubscriptionProvider, returning defaults');
        return {
            isPremium: false,
            isAdFree: false,
            isLoading: true,
            isPurchasing: false,
            packages: [],
            currentOffering: null,
            purchasePackage: async () => false,
            restorePurchases: async () => false,
            checkSubscriptionStatus: async () => { },
            identifyUser: async () => { },
            logout: async () => { },
        };
    }
    return context;
}

// Helper hook to check if user has premium access
export function usePremium() {
    const { isPremium, isLoading } = useSubscription();
    return { isPremium, isLoading };
}
