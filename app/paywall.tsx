import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    ScrollView,
    Alert,
    Dimensions,
    Animated,
    Linking,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    X,
    Crown,
    Sparkles,
    BookOpen,
    Brain,
    Mic,
    Heart,
    Shield,
    Check,
    Star,
    Infinity,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ad-Free Benefits List
const AD_FREE_BENEFITS = [
    {
        icon: Shield,
        title: 'No Banner Ads',
        description: 'Remove distracting banner ads from all screens',
    },
    {
        icon: Sparkles,
        title: 'No Interstitial Ads',
        description: 'No more full-screen ads interrupting your experience',
    },
    {
        icon: Heart,
        title: 'Distraction-Free',
        description: 'Focus on your spiritual journey without interruptions',
    },
];

// Floating orb animation component
const FloatingOrb = ({ delay, size, color, startX, startY }: any) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 3000 + delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 3000 + delay,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        animate();
    }, []);

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 0.3],
    });

    return (
        <Animated.View
            style={[
                styles.floatingOrb,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    left: startX,
                    top: startY,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        />
    );
};

export default function PaywallScreen() {
    const {
        packages,
        isPurchasing,
        purchasePackage,
        restorePurchases,
        isLoading,
        isAdFree,
    } = useSubscription();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entry animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for CTA button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Redirect Android users away from paywall (subscriptions disabled on Android)
    useEffect(() => {
        if (Platform.OS === 'android') {
            router.back();
        }
    }, []);

    const handlePurchase = async (pkg: any) => {
        const success = await purchasePackage(pkg);
        if (success) {
            Alert.alert(
                '🎉 You\'re Ad-Free!',
                'Thank you for subscribing! Enjoy the app without any ads or interruptions.',
                [{ text: 'Continue', onPress: () => router.back() }]
            );
        }
    };

    const handleRestore = async () => {
        const success = await restorePurchases();
        if (success) {
            Alert.alert(
                '✅ Restored!',
                'Your subscription has been restored successfully.',
                [{ text: 'Continue', onPress: () => router.back() }]
            );
        } else {
            Alert.alert(
                'No Subscription Found',
                'We couldn\'t find any active subscription to restore. If you believe this is an error, please contact support.'
            );
        }
    };

    const handleClose = () => {
        router.back();
    };

    const openPrivacyPolicy = () => {
        Linking.openURL('https://dailybread.app/privacy');
    };

    const openTermsOfService = () => {
        Linking.openURL('https://dailybread.app/terms');
    };

    // Get the monthly ad-free package
    const monthlyPackage = packages.find(
        (pkg) =>
            pkg.identifier === 'bible_add_free_monthly' ||
            pkg.product?.identifier === 'bible_add_free_monthly' ||
            pkg.packageType === 'MONTHLY' ||
            pkg.identifier.toLowerCase().includes('monthly')
    ) || packages[0];

    // If already ad-free, show thank you screen
    if (isAdFree) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={styles.backgroundGradient}
                >
                    <View style={styles.premiumActiveContainer}>
                        <View style={styles.premiumBadge}>
                            <Shield size={60} color="#22C55E" />
                        </View>
                        <Text style={styles.premiumActiveTitle}>You're Ad-Free! 🎉</Text>
                        <Text style={styles.premiumActiveSubtitle}>
                            Thank you for your support. Enjoy the app without any interruptions!
                        </Text>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => router.back()}
                        >
                            <LinearGradient
                                colors={['#F97316', '#EA580C']}
                                style={styles.continueButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.backgroundGradient}
            >
                {/* Floating Orbs */}
                <FloatingOrb delay={0} size={120} color="rgba(249, 115, 22, 0.15)" startX={-30} startY={100} />
                <FloatingOrb delay={500} size={80} color="rgba(139, 92, 246, 0.15)" startX={SCREEN_WIDTH - 60} startY={200} />
                <FloatingOrb delay={1000} size={100} color="rgba(236, 72, 153, 0.1)" startX={50} startY={SCREEN_HEIGHT - 300} />
                <FloatingOrb delay={1500} size={60} color="rgba(34, 197, 94, 0.1)" startX={SCREEN_WIDTH - 100} startY={SCREEN_HEIGHT - 400} />
            </LinearGradient>

            <SafeAreaView style={styles.safeArea}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <BlurView intensity={20} tint="dark" style={styles.closeButtonBlur}>
                        <X size={24} color="#FFFFFF" />
                    </BlurView>
                </TouchableOpacity>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim },
                                ],
                            },
                        ]}
                    >
                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={styles.crownContainer}>
                                <LinearGradient
                                    colors={['#F97316', '#EA580C', '#C2410C']}
                                    style={styles.crownGradient}
                                >
                                    <Shield size={40} color="#FFFFFF" />
                                </LinearGradient>
                                <Sparkles size={20} color="#F97316" style={styles.sparkle1} />
                                <Sparkles size={16} color="#F97316" style={styles.sparkle2} />
                            </View>

                            <Text style={styles.heroTitle}>Go Ad-Free</Text>
                            <Text style={styles.heroSubtitle}>
                                Enjoy the app without any interruptions and focus on your spiritual journey
                            </Text>
                        </View>

                        {/* Benefits List */}
                        <View style={styles.featuresContainer}>
                            {AD_FREE_BENEFITS.map((feature, index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.featureItem,
                                        {
                                            opacity: fadeAnim,
                                            transform: [{
                                                translateX: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-20, 0],
                                                }),
                                            }],
                                        },
                                    ]}
                                >
                                    <View style={styles.featureIconContainer}>
                                        <feature.icon size={22} color="#F97316" />
                                    </View>
                                    <View style={styles.featureTextContainer}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureDescription}>{feature.description}</Text>
                                    </View>
                                    <Check size={18} color="#22C55E" />
                                </Animated.View>
                            ))}
                        </View>

                        {/* Pricing Card */}
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#F97316" />
                                <Text style={styles.loadingText}>Loading subscription...</Text>
                            </View>
                        ) : (
                            <View style={styles.pricingSection}>
                                <View style={styles.pricingCard}>
                                    <LinearGradient
                                        colors={['rgba(249, 115, 22, 0.1)', 'rgba(234, 88, 12, 0.05)']}
                                        style={styles.pricingCardGradient}
                                    >
                                        <View style={styles.popularBadge}>
                                            <Star size={12} color="#FFFFFF" />
                                            <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                                        </View>

                                        <Text style={styles.planName}>Ad-Free Monthly</Text>

                                        <View style={styles.priceContainer}>
                                            <Text style={styles.priceCurrency}>$</Text>
                                            <Text style={styles.priceAmount}>3</Text>
                                            <Text style={styles.priceCents}>.99</Text>
                                            <Text style={styles.pricePeriod}>/month</Text>
                                        </View>

                                        <Text style={styles.priceSubtext}>
                                            Cancel anytime • Billed monthly
                                        </Text>
                                    </LinearGradient>
                                </View>

                                {/* CTA Button */}
                                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                    <TouchableOpacity
                                        style={styles.ctaButton}
                                        onPress={() => monthlyPackage && handlePurchase(monthlyPackage)}
                                        disabled={isPurchasing || !monthlyPackage}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#F97316', '#EA580C', '#C2410C']}
                                            style={styles.ctaButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            {isPurchasing ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <>
                                                    <Shield size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                                    <Text style={styles.ctaButtonText}>
                                                        Remove Ads Now
                                                    </Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Restore Purchases */}
                                <TouchableOpacity
                                    style={styles.restoreButton}
                                    onPress={handleRestore}
                                    disabled={isPurchasing}
                                >
                                    <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Trust Badges */}
                        <View style={styles.trustSection}>
                            <View style={styles.trustBadge}>
                                <Shield size={16} color="#22C55E" />
                                <Text style={styles.trustText}>Secure Payment</Text>
                            </View>
                            <View style={styles.trustDivider} />
                            <View style={styles.trustBadge}>
                                <Check size={16} color="#22C55E" />
                                <Text style={styles.trustText}>Cancel Anytime</Text>
                            </View>
                        </View>

                        {/* Legal Section */}
                        <View style={styles.legalSection}>
                            <Text style={styles.legalText}>
                                Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account at confirmation of purchase.
                                Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
                                Your account will be charged for renewal within 24 hours prior to the end of the current period.
                            </Text>
                            <View style={styles.legalLinks}>
                                <TouchableOpacity onPress={openTermsOfService}>
                                    <Text style={styles.legalLink}>Terms of Service</Text>
                                </TouchableOpacity>
                                <Text style={styles.legalDivider}>•</Text>
                                <TouchableOpacity onPress={openPrivacyPolicy}>
                                    <Text style={styles.legalLink}>Privacy Policy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    floatingOrb: {
        position: 'absolute',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 20,
        zIndex: 100,
    },
    closeButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 70,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    crownContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    crownGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    sparkle1: {
        position: 'absolute',
        top: -5,
        right: -8,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 5,
        left: -10,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    featuresContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    pricingSection: {
        marginBottom: 24,
    },
    pricingCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#F97316',
    },
    pricingCardGradient: {
        padding: 24,
        alignItems: 'center',
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F97316',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
        gap: 4,
    },
    popularBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    planName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    priceCurrency: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 4,
    },
    priceAmount: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 60,
    },
    priceCents: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 4,
    },
    pricePeriod: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 30,
        marginLeft: 4,
    },
    priceSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    ctaButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    restoreButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 8,
    },
    restoreButtonText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
    trustSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    trustDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
    legalSection: {
        alignItems: 'center',
    },
    legalText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 12,
    },
    legalLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legalLink: {
        fontSize: 12,
        color: '#F97316',
        fontWeight: '500',
    },
    legalDivider: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    premiumActiveContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    premiumBadge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    premiumActiveTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    premiumActiveSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    continueButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 16,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
