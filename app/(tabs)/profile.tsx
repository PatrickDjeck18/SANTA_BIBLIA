import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Share,
} from 'react-native';

import { ArrowLeft, Book, Bell, Heart, Cloud, Shield, HelpCircle, LogOut, User, Settings as SettingsIcon, ChevronRight, X, CreditCard as Edit3, Save, TestTube, Trash2, Share2, Star as StarIcon } from 'lucide-react-native';
import { Colors } from '@/constants/DesignTokens';
import { AppTheme } from '@/constants/AppTheme';
import { router } from 'expo-router';


import { LinearGradient } from 'expo-linear-gradient';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useAds } from '@/hooks/useAds';
import { Crown, Zap, Star, Sparkles } from 'lucide-react-native';
import { ModernHeader } from '@/components/ModernHeader';
import { useMorningNotification } from '@/hooks/useMorningNotification';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAppRating } from '@/hooks/useAppRating';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SettingsScreen() {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const { isPremium: isAdsPremium, purchasePremium, restorePurchases: restoreAdsPurchases, isLoading: adsLoading } = useAds();
  const { isPremium, restorePurchases, isLoading: subscriptionLoading } = useSubscription();
  const {
    isEnabled: isNotificationEnabled,
    isLoading: isNotificationLoading,
    preferences: notificationPreferences,
    enableNotifications,
    disableNotifications,
    toggleNotifications,
  } = useMorningNotification();

  const { rateApp } = useAppRating();

  const handleShareApp = async () => {
    try {
      const iosUrl = 'https://apps.apple.com/us/app/daily-faith-bible-kjv/id6752252289';
      const androidUrl = 'https://play.google.com/store/apps/details?id=com.dailybread.dailyfaithbible';
      const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
      const message = Platform.OS === 'ios'
        ? 'Check out Daily Faith Bible KJV! Download it here:'
        : `Check out Daily Faith Bible KJV! Download it here: ${url}`;

      await Share.share({
        message,
        url: Platform.OS === 'ios' ? url : undefined, // Android adds text to message often
        title: 'Daily Faith Bible KJV',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Simple settings state (kept for other settings)
  const [dailyVerse, setDailyVerse] = useState(true);
  // Removed modal states - now using navigation


  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Simple entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();


  }, []);



  const [showHelpSupport, setShowHelpSupport] = useState(false);

  const handleHelpSupport = () => {
    setShowHelpSupport(true);
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTermsOfService = () => {
    router.push('/terms-of-service');
  };
  const SimpleSettingItem = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.simpleSettingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  // PrivacyPolicyModal removed - now using dedicated page

  // TermsOfServiceModal removed - now using dedicated page



  const HelpSupportModal = () => (
    <Modal
      visible={showHelpSupport}
      animationType="slide"
      presentationStyle={width >= 768 ? "pageSheet" : "overFullScreen"}
      onRequestClose={() => setShowHelpSupport(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity
              onPress={() => setShowHelpSupport(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <X size={width < 380 ? 20 : 24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            alwaysBounceVertical={false}
          >
            <View style={styles.helpContent}>
              <Text style={styles.helpSection}>How can we help you?</Text>

              <Text style={styles.helpHeading}>Frequently Asked Questions</Text>

              <Text style={styles.helpSubheading}>Getting Started</Text>
              <Text style={styles.helpText}>
                • Create an account to sync your data across devices
                • Set up daily reminders for Bible reading and prayer
                • Customize your spiritual journey preferences
              </Text>

              <Text style={styles.helpSubheading}>Bible Study Features</Text>
              <Text style={styles.helpText}>
                • Access the complete Bible with search functionality
                • Take quizzes to test your biblical knowledge
                • Save favorite verses and create study notes
              </Text>

              <Text style={styles.helpSubheading}>Prayer Tracking</Text>
              <Text style={styles.helpText}>
                • Add prayer requests and track answered prayers
                • Set prayer reminders and daily prayer times
                • View your prayer history and spiritual growth
              </Text>

              <Text style={styles.helpSubheading}>Mood Tracking</Text>
              <Text style={styles.helpText}>
                • Log your daily mood and spiritual well-being
                • View trends and patterns in your spiritual journey
                • Connect your mood with Bible verses and prayers
              </Text>

              <Text style={styles.helpHeading}>Contact Support</Text>
              <Text style={styles.helpText}>
                Need additional help? Our support team is here for you:
              </Text>

              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>📧 Support Email: support@dailyfaith.me</Text>
                <Text style={styles.contactItem}>📧 Contact Email: legal@dailyfaith.me</Text>
                <Text style={styles.contactItem}>🌐 Website: www.goodtechnologyllc.com</Text>
                <Text style={styles.contactItem}>📞 Phone: +13239168235</Text>
                <Text style={styles.contactItem}>⏰ Response Time: Within 24 hours</Text>
              </View>

              <Text style={styles.helpHeading}>App Version</Text>
              <Text style={styles.helpText}>
                Current Version: 1.0.0
                Last Updated: January 2025
              </Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <BackgroundGradient variant="warm" opacity={0.95}>
        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Modern Header */}
          <ModernHeader
            title="Settings"
            variant="simple"
            showBackButton={true}
            onBackPress={() => router.back()}
            showReaderButton={false}
            readerText="Settings. Manage your account and preferences. Customize your Daily Bread experience."
          />

          {/* Simple Profile Section */}




          {/* Simple Settings */}
          <Animated.View style={[styles.settingsSection, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <SimpleSettingItem
              icon={<Bell size={20} color={AppTheme.accent.primary} />}
              title="Morning Reminder"
              subtitle={
                isNotificationEnabled
                  ? `Daily at ${notificationPreferences.hour}:${notificationPreferences.minute.toString().padStart(2, '0')} AM`
                  : 'Get daily Bible verse reminders'
              }
              rightElement={
                <Switch
                  value={isNotificationEnabled}
                  onValueChange={toggleNotifications}
                  disabled={isNotificationLoading}
                  trackColor={{ false: AppTheme.border.medium, true: AppTheme.accent.primary }}
                  thumbColor={'#FFFFFF'}
                />
              }
            />

          </Animated.View>

          <Animated.View style={[styles.settingsSection, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.sectionTitle}>Support</Text>

            <SimpleSettingItem
              icon={<HelpCircle size={20} color={AppTheme.accent.primary} />}
              title="Help & Support"
              subtitle="Get help with the app"
              onPress={handleHelpSupport}
            />

            <SimpleSettingItem
              icon={<StarIcon size={20} color="#EAB308" />}
              title="Rate Us"
              subtitle="Love the app? Let us know!"
              onPress={rateApp}
            />

            <SimpleSettingItem
              icon={<Share2 size={20} color="#3B82F6" />}
              title="Share App"
              subtitle="Share with friends & family"
              onPress={handleShareApp}
            />

            <SimpleSettingItem
              icon={<Shield size={20} color="#6B7280" />}
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={handlePrivacyPolicy}
            />

            <SimpleSettingItem
              icon={<Book size={20} color="#6B7280" />}
              title="Terms & Conditions"
              subtitle="Terms and conditions"
              onPress={handleTermsOfService}
            />

            {/* Removed Delete Account and Sign Out Options */}

          </Animated.View>

          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>

        {/* Modals */}

        <HelpSupportModal />

        {/* Banner Ad */}
        {/* Removed BannerAd component */}
      </BackgroundGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20, // Reduced padding
  },
  gradient: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40, // Reduced space
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 100, // push title further down on mobile
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppTheme.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Profile Section
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'white',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppTheme.text.primary,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  editProfileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  // Settings Section
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppTheme.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 16,
  },

  // Simple Setting Item
  simpleSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: AppTheme.text.secondary,
    lineHeight: 18,
  },

  // Sign Out Button
  signOutSection: {
    marginTop: 20,
    alignItems: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width < 380 ? 16 : 20,
    paddingVertical: width < 380 ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: width < 380 ? 56 : 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalTitle: {
    fontSize: width < 380 ? 18 : 20,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  modalCloseButton: {
    padding: width < 380 ? 8 : 12,
    borderRadius: width < 380 ? 16 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: width < 380 ? 16 : 20,
    paddingTop: width < 380 ? 16 : 20,
    paddingBottom: width < 380 ? 32 : 40,
    // Enhanced mobile scrolling
    minHeight: height * 0.8, // Ensure minimum height for proper scrolling
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: width < 380 ? 60 : 80, // More bottom padding for mobile scrolling
    minHeight: height * 0.9, // Ensure content is tall enough to scroll
    // Better mobile content spacing
    paddingTop: width < 380 ? 8 : 12,
  },

  // Privacy Policy Styles
  privacyContent: {
    paddingBottom: width < 380 ? 60 : 80, // More bottom padding for mobile scrolling
    paddingHorizontal: width < 380 ? 4 : 8,
    // Ensure content is properly spaced for mobile
    minHeight: height * 0.7, // Ensure enough content height for scrolling
  },
  privacySection: {
    fontSize: width < 380 ? 13 : 14,
    color: '#6B7280',
    marginBottom: width < 380 ? 16 : 20,
    fontStyle: 'italic',
  },
  privacyHeading: {
    fontSize: width < 380 ? 16 : 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: width < 380 ? 10 : 12,
    marginTop: width < 380 ? 16 : 20,
    lineHeight: width < 380 ? 22 : 24,
  },
  privacySubheading: {
    fontSize: width < 380 ? 15 : 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: width < 380 ? 6 : 8,
    marginTop: width < 380 ? 12 : 16,
    lineHeight: width < 380 ? 20 : 22,
  },
  privacyText: {
    fontSize: width < 380 ? 14 : 15,
    color: '#4B5563',
    lineHeight: width < 380 ? 20 : 22,
    marginBottom: width < 380 ? 12 : 14,
  },

  // Terms of Service Styles
  termsContent: {
    paddingBottom: width < 380 ? 60 : 80, // More bottom padding for mobile scrolling
    paddingHorizontal: width < 380 ? 4 : 8,
    // Ensure content is properly spaced for mobile
    minHeight: height * 0.7, // Ensure enough content height for scrolling
  },
  termsSection: {
    fontSize: width < 380 ? 13 : 14,
    color: '#6B7280',
    marginBottom: width < 380 ? 16 : 20,
    fontStyle: 'italic',
  },
  termsHeading: {
    fontSize: width < 380 ? 16 : 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: width < 380 ? 10 : 12,
    marginTop: width < 380 ? 16 : 20,
    lineHeight: width < 380 ? 22 : 24,
  },
  termsSubheading: {
    fontSize: width < 380 ? 15 : 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: width < 380 ? 6 : 8,
    marginTop: width < 380 ? 12 : 16,
    lineHeight: width < 380 ? 20 : 22,
  },
  termsText: {
    fontSize: width < 380 ? 14 : 15,
    color: '#4B5563',
    lineHeight: width < 380 ? 20 : 22,
    marginBottom: width < 380 ? 12 : 14,
  },

  // Help & Support Styles
  helpContent: {
    paddingBottom: width < 380 ? 20 : 32,
  },
  helpSection: {
    fontSize: width < 380 ? 15 : 16,
    color: '#6B7280',
    marginBottom: width < 380 ? 16 : 20,
    fontStyle: 'italic',
  },
  helpHeading: {
    fontSize: width < 380 ? 16 : 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: width < 380 ? 10 : 12,
    marginTop: width < 380 ? 16 : 20,
    lineHeight: width < 380 ? 22 : 24,
  },
  helpSubheading: {
    fontSize: width < 380 ? 15 : 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: width < 380 ? 6 : 8,
    marginTop: width < 380 ? 12 : 16,
    lineHeight: width < 380 ? 20 : 22,
  },
  helpText: {
    fontSize: width < 380 ? 14 : 15,
    color: '#4B5563',
    lineHeight: width < 380 ? 20 : 22,
    marginBottom: width < 380 ? 12 : 14,
  },
  contactInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: width < 380 ? 10 : 12,
    padding: width < 380 ? 12 : 16,
    marginVertical: width < 380 ? 10 : 12,
  },
  contactItem: {
    fontSize: width < 380 ? 14 : 15,
    color: '#4B5563',
    lineHeight: width < 380 ? 20 : 22,
    marginBottom: width < 380 ? 6 : 8,
  },

  bottomSpacing: {
    height: 10,
  },
  // Premium Section Styles
  premiumSection: {
    marginBottom: 24,
  },
  premiumBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  upgradeButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  restoreButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },

  // Subscription Card Styles
  subscriptionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  subscriptionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTextContainer: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  subscriptionArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionFeatures: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscriptionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscriptionFeatureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Premium Status Card (for subscribed users)
  premiumStatusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  premiumStatusGradient: {
    padding: 16,
    borderRadius: 16,
  },
  premiumStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumStatusSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  // Restore Purchases Button
  restorePurchasesButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  restorePurchasesText: {
    fontSize: 14,
    color: AppTheme.accent.primary,
    fontWeight: '500',
  },
});
