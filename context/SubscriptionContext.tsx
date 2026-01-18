import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Simplified Subscription Context - RevenueCat Removed
 * All users are treated as premium (no paywall functionality)
 */

interface SubscriptionContextType {
    isPremium: boolean;
    isAdFree: boolean;
    isLoading: boolean;
    isPurchasing: boolean;
    packages: any[];
    currentOffering: any;
    purchasePackage: (pkg: any) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    checkSubscriptionStatus: () => Promise<void>;
    identifyUser: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    // All users are treated as premium - no paywall
    const value: SubscriptionContextType = {
        isPremium: true,
        isAdFree: true,
        isLoading: false,
        isPurchasing: false,
        packages: [],
        currentOffering: null,
        purchasePackage: async () => true,
        restorePurchases: async () => true,
        checkSubscriptionStatus: async () => { },
        identifyUser: async () => { },
        logout: async () => { },
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        return {
            isPremium: true,
            isAdFree: true,
            isLoading: false,
            isPurchasing: false,
            packages: [],
            currentOffering: null,
            purchasePackage: async () => true,
            restorePurchases: async () => true,
            checkSubscriptionStatus: async () => { },
            identifyUser: async () => { },
            logout: async () => { },
        };
    }
    return context;
}

export function usePremium() {
    return { isPremium: true, isLoading: false };
}
