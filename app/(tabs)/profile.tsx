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
} from 'react-native';

import { ArrowLeft, Book, Bell, Heart, Cloud, Shield, HelpCircle, LogOut, User, Settings as SettingsIcon, ChevronRight, X, CreditCard as Edit3, Save, TestTube, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useAds } from '@/hooks/useAds';
import { Crown, Zap, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SettingsScreen() {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  const { user, signOut, deleteAccount, loading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { isPremium, purchasePremium, restorePurchases, isLoading: adsLoading } = useAds();
  
  // Simple settings state
  const [dailyVerse, setDailyVerse] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

    // Set initial edit name when profile loads
    if (profile?.full_name) {
      setEditName(profile.full_name);
    }
  }, [profile]);

  const handleSignOut = async () => {
    console.log('🔴 Sign out button pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 User confirmed sign out');
            try {
              // Show loading state if needed
              const { error } = await signOut();
              console.log('🔴 Sign out result:', { error });
              
              if (error) {
                console.error('🔴 Sign out error:', error);
                Alert.alert('Error', error.message || 'Failed to sign out');
              } else {
                console.log('🔴 Successfully signed out');
                // The auth state change will trigger navigation to login
                // Add a small delay to ensure state updates properly
                setTimeout(() => {
                  console.log('🔴 Navigation should have occurred by now');
                }, 100);
              }
            } catch (error) {
              console.error('🔴 Unexpected sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditName(profile?.full_name || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      const { error } = await updateProfile({ full_name: editName.trim() });
      if (error) {
        Alert.alert('Error', 'Failed to update profile');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        setShowEditProfile(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const [showHelpSupport, setShowHelpSupport] = useState(false);

  const handleHelpSupport = () => {
    setShowHelpSupport(true);
  };

  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const handleTermsOfService = () => {
    setShowTermsOfService(true);
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

  const PrivacyPolicyModal = () => (
    <Modal
      visible={showPrivacyPolicy}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPrivacyPolicy(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.privacyContent}>
              <Text style={styles.privacySection}>Last updated: 9/30/2025</Text>

              <Text style={styles.privacyHeading}>Information We Collect</Text>
              <Text style={styles.privacyText}>
                Daily Faith Bible is committed to protecting your privacy. We collect minimal information necessary to provide you with the best spiritual experience:
              </Text>

              <Text style={styles.privacySubheading}>Account Information</Text>
              <Text style={styles.privacyText}>
                • Email address and password (when you create an account)
                • Profile information you choose to provide (name, preferences)
                • Authentication tokens for secure access
              </Text>

              <Text style={styles.privacySubheading}>App Usage Data</Text>
              <Text style={styles.privacyText}>
                • Bible reading history and bookmarks (stored locally and optionally synced)
                • Prayer requests and mood tracking data (with your explicit consent)
                • Quiz results and study progress
                • App usage analytics (anonymized)
                • Device information for app optimization
              </Text>

              <Text style={styles.privacySubheading}>Advertising Data</Text>
              <Text style={styles.privacyText}>
                • Device advertising ID (for personalized ads)
                • Ad interaction data (clicks, views, conversions)
                • General location (country/region level) for relevant ads
              </Text>

              <Text style={styles.privacyHeading}>How We Use Your Information</Text>
              <Text style={styles.privacyText}>
                We use your information to provide and improve our services:
              </Text>

              <Text style={styles.privacySubheading}>Core App Functions</Text>
              <Text style={styles.privacyText}>
                • Provide daily Bible verses and devotional content
                • Sync your reading preferences and progress across devices
                • Enable AI-powered Bible study assistance
                • Track prayers, moods, and spiritual wellness metrics
                • Deliver personalized Bible study recommendations
              </Text>

              <Text style={styles.privacySubheading}>Advertising & Monetization</Text>
              <Text style={styles.privacyText}>
                • Display relevant advertisements through Google AdMob
                • Measure ad performance and optimize ad delivery
                • Support the free availability of our app
              </Text>

              <Text style={styles.privacySubheading}>Communication & Support</Text>
              <Text style={styles.privacyText}>
                • Send important app updates and notifications (with your permission)
                • Provide customer support and respond to inquiries
                • Improve app performance and user experience
              </Text>

              <Text style={styles.privacyHeading}>Third-Party Services & Advertising</Text>

              <Text style={styles.privacySubheading}>Google AdMob</Text>
              <Text style={styles.privacyText}>
                Our app displays advertisements provided by Google AdMob. AdMob may collect and use information to provide personalized ads:
              </Text>
              <Text style={styles.privacyText}>
                • Device advertising identifiers
                • Ad interaction data (impressions, clicks)
                • General location information
                • Device and network information
              </Text>

              <Text style={styles.privacySubheading}>Other Third-Party Services</Text>
              <Text style={styles.privacyText}>
                • Google Analytics: For app usage insights (anonymized)
                • Firebase: For app performance monitoring and authentication
                • AI Services: For Bible study assistance (content only, no personal data)
              </Text>
              <Text style={styles.privacyText}>
                Each third-party service operates under their own privacy policies. We recommend reviewing:
              </Text>
              <Text style={styles.privacyText}>
                • Google Privacy Policy
                • AdMob Privacy Policy
              </Text>

              <Text style={styles.privacyHeading}>Data Security & Storage</Text>
              <Text style={styles.privacyText}>
                We implement industry-standard security measures to protect your information:
              </Text>
              <Text style={styles.privacyText}>
                • All data transmission is encrypted using SSL/TLS
                • Personal data is stored securely with access controls
                • Regular security audits and vulnerability assessments
                • Data is stored in secure, compliant data centers
                • Authentication data is handled by secure Firebase Auth
              </Text>

              <Text style={styles.privacyHeading}>Data Retention</Text>
              <Text style={styles.privacyText}>
                • Account data: Retained until account deletion
                • App usage analytics: Retained for 26 months (Google Analytics standard)
                • Ad data: Retained per AdMob policies (typically 2 years)
                • Support communications: Retained for 3 years
              </Text>

              <Text style={styles.privacyHeading}>Your Privacy Rights & Choices</Text>

              <Text style={styles.privacySubheading}>Account Management</Text>
              <Text style={styles.privacyText}>
                • Access and review your personal data through app settings
                • Update your profile information and preferences
                • Delete your account and associated data at any time
                • Export your data (prayer logs, reading history)
              </Text>

              <Text style={styles.privacySubheading}>Advertising Controls</Text>
              <Text style={styles.privacyText}>
                • Opt out of personalized ads in device settings (iOS: Settings {'>'} Privacy {'>'} Apple Advertising, Android: Settings {'>'} Google {'>'} Ads)
                • Reset your advertising ID to limit tracking
                • Use "Limit Ad Tracking" (iOS) or "Opt out of Ads Personalization" (Android)
              </Text>

              <Text style={styles.privacySubheading}>Data Controls</Text>
              <Text style={styles.privacyText}>
                • Disable analytics and crash reporting
                • Turn off cross-device syncing
                • Opt out of push notifications
                • Use the app offline without data collection
              </Text>

              <Text style={styles.privacyHeading}>Children's Privacy (COPPA Compliance)</Text>
              <Text style={styles.privacyText}>
                Our app is designed for users of all ages including children. We are committed to COPPA compliance:
              </Text>
              <Text style={styles.privacyText}>
                • We do not knowingly collect personal information from children under 13 without parental consent
                • Ads shown to children are family-friendly and non-personalized
                • Parents can contact us to review, modify, or delete their child's information
                • We recommend parental supervision for children's app usage
              </Text>

              <Text style={styles.privacyHeading}>International Users & Data Transfers</Text>
              <Text style={styles.privacyText}>
                Our app is available worldwide. Your data may be processed and stored in:
              </Text>
              <Text style={styles.privacyText}>
                • United States (primary servers)
                • Other countries where our service providers operate
                • Countries with adequate data protection laws
              </Text>
              <Text style={styles.privacyText}>
                We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and adequacy decisions.
              </Text>

              <Text style={styles.privacyHeading}>Updates to This Policy</Text>
              <Text style={styles.privacyText}>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:
              </Text>
              <Text style={styles.privacyText}>
                • Material changes will be communicated through the app
                • Updated policies will be posted at dailyfaith.me/privacy
                • Continued use of the app constitutes acceptance of updates
                • You can always review the current policy in the app settings
              </Text>

              <Text style={styles.privacyHeading}>Contact Us</Text>
              <Text style={styles.privacyText}>
                If you have questions about this Privacy Policy, your data, or our privacy practices:
              </Text>
              <Text style={styles.privacyText}>
                Email: privacy@dailyfaith.me
                Data Protection Officer: dpo@dailyfaith.me
                Response Time: We typically respond within 48 hours
                Mailing Address: Available upon request for legal matters
                Website: https://dailyfaith.me
              </Text>
              <Text style={styles.privacyText}>
                For EU residents: You have the right to lodge a complaint with your local data protection authority if you believe your data has been processed unlawfully.
              </Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  const TermsOfServiceModal = () => (
    <Modal
      visible={showTermsOfService}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowTermsOfService(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTermsOfService(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.termsContent}>
              <Text style={styles.termsSection}>Last updated: September 30, 2025</Text>

              <Text style={styles.termsHeading}>1. Acceptance of Terms</Text>
              <Text style={styles.termsText}>
                By downloading, installing, accessing, or using the Daily Faith Bible mobile application ("App"), you ("User" or "You") agree to be bound by these Terms and Conditions ("Terms"). These Terms constitute a legally binding agreement between you and Daily Faith Bible ("Company", "We", "Our", or "Us").
              </Text>
              <Text style={styles.termsText}>
                By using our App, you represent that:
              </Text>
              <Text style={styles.termsText}>
                • You are at least 13 years old and have the legal capacity to enter into these Terms
                • You will comply with all applicable laws and regulations
                • You accept these Terms and our Privacy Policy
                • If you are under 18, you have obtained parental or guardian consent
              </Text>

              <Text style={styles.termsHeading}>2. Description of Service</Text>
              <Text style={styles.termsText}>
                Daily Faith Bible is a mobile application that provides:
              </Text>
              <Text style={styles.termsText}>
                • Complete King James Version (KJV) Bible text
                • AI-powered Bible study assistance and explanations
                • Prayer tracking and organization tools
                • Mood and spiritual wellness monitoring
                • Bible knowledge quizzes and testing
                • Dream interpretation guidance from Biblical perspectives
                • Daily inspirational verses and reading plans
                • Offline Bible reading capabilities
              </Text>

              <Text style={styles.termsHeading}>3. License Grant and Restrictions</Text>

              <Text style={styles.termsSubheading}>3.1 License Grant</Text>
              <Text style={styles.termsText}>
                We grant you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the App for personal, non-commercial purposes on mobile devices that you own or control.
              </Text>

              <Text style={styles.termsSubheading}>3.2 Prohibited Uses</Text>
              <Text style={styles.termsText}>
                You may not:
              </Text>
              <Text style={styles.termsText}>
                • Modify, adapt, translate, or reverse engineer the App
                • Distribute, rent, lease, or sell the App or any part thereof
                • Use the App for commercial purposes without written permission
                • Remove, alter, or obscure any copyright, trademark, or proprietary notices
                • Use the App to violate any laws or regulations
                • Interfere with or disrupt the App's functionality or servers
                • Attempt to gain unauthorized access to other users' accounts or data
              </Text>

              <Text style={styles.termsHeading}>4. User Accounts and Data</Text>

              <Text style={styles.termsSubheading}>4.1 Account Creation</Text>
              <Text style={styles.termsText}>
                The App may allow optional account creation for enhanced features such as prayer tracking, reading progress synchronization, and personalized content.
              </Text>

              <Text style={styles.termsSubheading}>4.2 Data Storage and Privacy</Text>
              <Text style={styles.termsText}>
                Your personal data, prayer entries, notes, and usage information are stored securely. By using the App, you agree to our data collection and usage practices as detailed in our Privacy Policy.
              </Text>

              <Text style={styles.termsSubheading}>4.3 Data Backup and Loss</Text>
              <Text style={styles.termsText}>
                While we implement reasonable security measures, we cannot guarantee against data loss. You are responsible for backing up your personal data and notes.
              </Text>

              <Text style={styles.termsHeading}>5. Content and Intellectual Property</Text>

              <Text style={styles.termsSubheading}>5.1 Bible Content</Text>
              <Text style={styles.termsText}>
                The King James Version Bible text is in the public domain and may be freely used. However, our presentation, formatting, and additional study materials are proprietary.
              </Text>

              <Text style={styles.termsSubheading}>5.2 Original Content</Text>
              <Text style={styles.termsText}>
                Daily devotionals, AI-generated insights, commentary, and study materials are original works protected by copyright. You may share Bible verses but not our proprietary content without permission.
              </Text>

              <Text style={styles.termsSubheading}>5.3 User-Generated Content</Text>
              <Text style={styles.termsText}>
                By sharing notes, prayers, or other content through the App, you grant us a non-exclusive, royalty-free license to use such content to provide and improve our services.
              </Text>

              <Text style={styles.termsHeading}>6. AI Features and Disclaimers</Text>

              <Text style={styles.termsSubheading}>6.1 AI-Generated Content</Text>
              <Text style={styles.termsText}>
                The App uses artificial intelligence to provide Bible study assistance, explanations, and insights. AI-generated content is for informational purposes only and should not replace professional spiritual guidance.
              </Text>

              <Text style={styles.termsSubheading}>6.2 No Theological Authority</Text>
              <Text style={styles.termsText}>
                We are not a religious institution and do not claim theological authority. AI interpretations and explanations are generated based on Biblical scholarship and should be verified against authoritative sources.
              </Text>

              <Text style={styles.termsSubheading}>6.3 Consultation Recommendation</Text>
              <Text style={styles.termsText}>
                For spiritual guidance, personal counseling, or interpretation of religious matters, we recommend consulting qualified religious leaders, pastors, or spiritual advisors.
              </Text>

              <Text style={styles.termsHeading}>7. In-App Purchases and Subscriptions</Text>
              <Text style={styles.termsText}>
                The App is free to download and use. Future premium features, if any, will be clearly marked and require separate consent.
              </Text>
              <Text style={styles.termsText}>
                • All billing is handled through the Apple App Store or Google Play Store
                • Subscription fees, if applicable, are non-refundable except as required by law
                • We reserve the right to change pricing with advance notice
                • Refunds are subject to the respective app store's refund policies
              </Text>

              <Text style={styles.termsHeading}>8. User Conduct and Community Guidelines</Text>
              <Text style={styles.termsText}>
                You agree to use the App responsibly and in accordance with Christian values:
              </Text>
              <Text style={styles.termsText}>
                • Treat other users with respect and kindness
                • Do not post offensive, harmful, or inappropriate content
                • Respect intellectual property rights
                • Do not attempt to hack, damage, or disrupt the App
                • Use the App only for lawful purposes
                • Report any violations or concerns to our support team
              </Text>

              <Text style={styles.termsHeading}>9. Privacy and Data Protection</Text>
              <Text style={styles.termsText}>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </Text>
              <Text style={styles.termsText}>
                • We collect only necessary data to provide App functionality
                • Personal data is stored securely and not sold to third parties
                • You can request data deletion by contacting our support team
                • We comply with applicable data protection laws including GDPR
              </Text>

              <Text style={styles.termsHeading}>10. Third-Party Services</Text>
              <Text style={styles.termsText}>
                The App may integrate with or link to third-party services:
              </Text>
              <Text style={styles.termsText}>
                • Apple App Store and Google Play Store for downloads and updates
                • Cloud services for data synchronization (iCloud, Google Drive)
                • Social media platforms for content sharing
                • Analytics services to improve App performance
              </Text>
              <Text style={styles.termsText}>
                Your use of third-party services is subject to their respective terms and conditions. We are not responsible for third-party services or their data practices.
              </Text>

              <Text style={styles.termsHeading}>11. Disclaimers and Limitations</Text>

              <Text style={styles.termsSubheading}>11.1 Service "As Is"</Text>
              <Text style={styles.termsText}>
                The App is provided "as is" and "as available" without warranties of any kind, either express or implied.
              </Text>

              <Text style={styles.termsSubheading}>11.2 Religious Content Disclaimer</Text>
              <Text style={styles.termsText}>
                The App provides access to religious texts and AI-generated interpretations for educational purposes. We do not endorse specific religious interpretations or guarantee theological accuracy.
              </Text>

              <Text style={styles.termsSubheading}>11.3 Technical Limitations</Text>
              <Text style={styles.termsText}>
                We do not guarantee uninterrupted access to the App. Technical issues, maintenance, or external factors may cause temporary disruptions.
              </Text>

              <Text style={styles.termsHeading}>12. Limitation of Liability</Text>
              <Text style={styles.termsText}>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </Text>
              <Text style={styles.termsText}>
                • Daily Faith Bible and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                • Our total liability shall not exceed the amount you paid for the App (if any)
                • We are not liable for damages resulting from your use or inability to use the App
                • We are not responsible for how you interpret or apply religious content
              </Text>
              <Text style={styles.termsText}>
                This limitation applies even if we have been advised of the possibility of such damages.
              </Text>

              <Text style={styles.termsHeading}>13. Indemnification</Text>
              <Text style={styles.termsText}>
                You agree to indemnify and hold harmless Daily Faith Bible, its officers, directors, employees, and agents from any claims, damages, losses, costs, and expenses arising from:
              </Text>
              <Text style={styles.termsText}>
                • Your use of the App
                • Your violation of these Terms
                • Your violation of any rights of another party
                • Any user-generated content you provide
              </Text>

              <Text style={styles.termsHeading}>14. Termination</Text>

              <Text style={styles.termsSubheading}>14.1 Termination by You</Text>
              <Text style={styles.termsText}>
                You may stop using the App at any time and delete it from your device.
              </Text>

              <Text style={styles.termsSubheading}>14.2 Termination by Us</Text>
              <Text style={styles.termsText}>
                We may terminate or suspend your access to the App immediately, without prior notice, for any reason, including breach of these Terms.
              </Text>

              <Text style={styles.termsSubheading}>14.3 Effect of Termination</Text>
              <Text style={styles.termsText}>
                Upon termination, your license to use the App ends, and you must delete all copies of the App from your devices.
              </Text>

              <Text style={styles.termsHeading}>15. Updates and Modifications</Text>
              <Text style={styles.termsText}>
                We may update, modify, or discontinue the App at any time without liability. We may also update these Terms from time to time. Material changes will be communicated through the App or our website. Continued use of the App after changes constitutes acceptance of the updated Terms.
              </Text>

              <Text style={styles.termsHeading}>16. Governing Law and Dispute Resolution</Text>

              <Text style={styles.termsSubheading}>16.1 Governing Law</Text>
              <Text style={styles.termsText}>
                These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.
              </Text>

              <Text style={styles.termsSubheading}>16.2 Dispute Resolution</Text>
              <Text style={styles.termsText}>
                Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive the right to participate in class actions.
              </Text>

              <Text style={styles.termsHeading}>17. Severability and Entire Agreement</Text>
              <Text style={styles.termsText}>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect. These Terms, together with our Privacy Policy, constitute the entire agreement between you and Daily Faith Bible regarding the App.
              </Text>

              <Text style={styles.termsHeading}>18. Age Restrictions</Text>
              <Text style={styles.termsText}>
                The App is intended for users aged 13 and older. By using the App, you represent that you meet this age requirement. Parents and guardians are responsible for supervising minors' use of the App.
              </Text>

              <Text style={styles.termsHeading}>19. Export Controls</Text>
              <Text style={styles.termsText}>
                You agree to comply with all applicable export control laws and regulations. You may not download or use the App in countries where such use is prohibited.
              </Text>

              <Text style={styles.termsHeading}>20. Contact Information</Text>
              <Text style={styles.termsText}>
                For questions, concerns, or legal matters regarding these Terms and Conditions:
              </Text>
              <Text style={styles.termsText}>
                Email: legal@dailyfaith.me
                Support Email: support@dailyfaith.me
                Response Time: We typically respond within 48 hours for support inquiries and 5-7 business days for legal matters.
                Mailing Address: Available upon request for formal legal correspondence.
              </Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  const EditProfileModal = () => {
    // Responsive styles based on screen dimensions
    const modalStyles = {
      modalContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
      },
      modalGradient: {
        flex: 1,
      },
      modalHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        paddingHorizontal: width < 380 ? 16 : 20,
        paddingVertical: width < 380 ? 12 : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      },
      modalTitle: {
        fontSize: width < 380 ? 18 : 20,
        fontWeight: '700' as const,
        color: '#374151',
      },
      editProfileContent: {
        flex: 1,
        paddingHorizontal: width < 380 ? 16 : 20,
        paddingTop: width < 380 ? 16 : 20,
        justifyContent: width < 380 ? ('center' as const) : ('flex-start' as const),
      },
      editProfileForm: {
        gap: width < 380 ? 16 : 20,
        maxWidth: width < 768 ? 400 : width,
        alignSelf: 'center' as const,
        width: width,
      },
      editLabel: {
        fontSize: width < 380 ? 14 : 16,
        fontWeight: '600' as const,
        color: '#374151',
        marginBottom: width < 380 ? 6 : 8,
      },
      editInput: {
        backgroundColor: 'white',
        borderRadius: width < 380 ? 10 : 12,
        padding: width < 380 ? 12 : 16,
        fontSize: width < 380 ? 14 : 16,
        color: '#374151',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      saveProfileButton: {
        borderRadius: width < 380 ? 12 : 16,
        overflow: 'hidden' as const,
        marginTop: width < 380 ? 16 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      saveProfileGradient: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: width < 380 ? 12 : 16,
        gap: width < 380 ? 6 : 8,
      },
      saveProfileText: {
        fontSize: width < 380 ? 14 : 16,
        fontWeight: '600' as const,
        color: 'white',
      },
    };

    return (
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle={width >= 768 ? "pageSheet" : "overFullScreen"}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <SafeAreaView style={modalStyles.modalContainer}>
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={modalStyles.modalGradient}
            >
              <View style={modalStyles.modalHeader}>
                <Text style={modalStyles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowEditProfile(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={width < 380 ? 20 : 24} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={modalStyles.editProfileContent}>
                <View style={modalStyles.editProfileForm}>
                  <Text style={modalStyles.editLabel}>Full Name</Text>
                  <TextInput
                    style={modalStyles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      handleSaveProfile();
                    }}
                    blurOnSubmit={false}
                  />

                  <TouchableOpacity
                    style={modalStyles.saveProfileButton}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSaveProfile();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={modalStyles.saveProfileGradient}
                    >
                      <Save size={width < 380 ? 16 : 20} color="white" />
                      <Text style={modalStyles.saveProfileText}>Save Changes</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const HelpSupportModal = () => (
    <Modal
      visible={showHelpSupport}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowHelpSupport(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity onPress={() => setShowHelpSupport(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
      <BackgroundGradient>
        <Animated.ScrollView 
          style={[styles.scrollView, { opacity: fadeAnim }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Simple Header */}
          <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Settings</Text>
              <SettingsIcon size={24} color="#6B7280" />
            </View>
          </Animated.View>

          {/* Simple Profile Section */}
          <Animated.View style={[styles.profileSection, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.profileCard}>
              <View style={styles.profileImage}>
                <User size={32} color="#6B7280" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user ? (profile?.full_name || user.email || 'User') : 'Guest User'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user ? (user.email || 'No email') : 'guest@example.com'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Edit3 size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Premium Section removed per request */}

          {/* Simple Settings */}
          <Animated.View style={[styles.settingsSection, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            
            <SimpleSettingItem
              icon={<Book size={20} color="#3B82F6" />}
              title="Daily Verse"
              subtitle="Morning inspiration"
              rightElement={
                <Switch
                  value={dailyVerse}
                  onValueChange={setDailyVerse}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={dailyVerse ? '#FFFFFF' : '#FFFFFF'}
                />
              }
            />
            
          </Animated.View>


          <Animated.View style={[styles.settingsSection, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <SimpleSettingItem
              icon={<HelpCircle size={20} color="#8B5CF6" />}
              title="Help & Support"
              subtitle="Get help with the app"
              onPress={handleHelpSupport}
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

            {/* Delete Account Option */}
            {!user?.isGuest && (
              <SimpleSettingItem
                icon={<Trash2 size={20} color="#EF4444" />}
                title={isDeletingAccount ? "Deleting Account..." : "Delete Account"}
                subtitle={isDeletingAccount ? "Please wait while we delete your data..." : "Permanently delete your account and data"}
                onPress={() => {
                  if (isDeletingAccount) return;
                  Alert.alert(
                    'Delete Account',
                    'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n• All your prayers and prayer history\n• Mood tracking data\n• Bible study notes and highlights\n• Quiz progress and statistics\n• Dream interpretations\n• Profile information\n\nThis action is irreversible.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete Account',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            console.log('🔴 User confirmed account deletion');
                            setIsDeletingAccount(true);

                            const { error } = await deleteAccount();

                            if (error) {
                              console.error('🔴 Account deletion error:', error);
                              Alert.alert(
                                'Deletion Failed',
                                'There was an error deleting your account: ' + (error.message || 'Unknown error') + '\n\nPlease try again or contact support if the problem persists.'
                              );
                            } else {
                              console.log('🔴 Account deletion successful');
                              Alert.alert(
                                'Account Deleted',
                                'Your account and all associated data have been permanently deleted.',
                                [
                                  {
                                    text: 'OK',
                                    onPress: () => {
                                      // Force navigation to login screen
                                      router.replace('/login');
                                    }
                                  }
                                ]
                              );
                            }
                          } catch (error) {
                            console.error('🔴 Unexpected error during account deletion:', error);
                            Alert.alert(
                              'Error',
                              'An unexpected error occurred while deleting your account. Please try again or contact support.'
                            );
                          } finally {
                            setIsDeletingAccount(false);
                          }
                        }
                      },
                    ]
                  );
                }}
              />
            )}

            {/* Logout Option in Settings */}
            <SimpleSettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              title="Sign Out"
              subtitle="Log out of your account"
              onPress={async () => {
                console.log('🔴 Direct logout from settings pressed');
                console.log('🔴 User object:', user);
                console.log('🔴 signOut function:', typeof signOut);
                
                try {
                  console.log('🔴 Calling signOut...');
                  const result = await signOut();
                  console.log('🔴 signOut result:', result);
                  
                  if (result.error) {
                    console.error('🔴 Logout error:', result.error);
                    Alert.alert('Error', result.error.message || 'Failed to sign out');
                  } else {
                    console.log('🔴 Logout successful');
                    Alert.alert('Success', 'Logged out successfully');
                    
                    // Force clear user state manually
                    console.log('🔴 Manually clearing user state...');
                    
                    // Manually navigate to login screen
                    setTimeout(() => {
                      console.log('🔴 Manually navigating to login...');
                      router.replace('/login');
                    }, 500);
                  }
                } catch (error) {
                  console.error('🔴 Logout exception:', error);
                  Alert.alert('Error', 'Failed to sign out');
                }
              }}
            />
          </Animated.View>

          {/* Sign Out Button */}
          {user && (
            <Animated.View style={[styles.signOutSection, { transform: [{ scale: scaleAnim }] }]}>
              {/* Empty section - logout moved to settings */}
            </Animated.View>
          )}

          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>

        {/* Modals */}
        <PrivacyPolicyModal />
        <TermsOfServiceModal />
        <EditProfileModal />
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
    paddingBottom: 80, // Reduced padding since tab bar is no longer floating
  },
  gradient: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for floating tab bar
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
    color: Colors.neutral[800],
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
    color: Colors.neutral[800],
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
    color: Colors.neutral[800],
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
    color: '#374151',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Privacy Policy Styles
  privacyContent: {
    paddingBottom: 20,
  },
  privacySection: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  privacyHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 20,
  },
  privacySubheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 16,
  },
  privacyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 14,
  },

  // Terms of Service Styles
  termsContent: {
    paddingBottom: 20,
  },
  termsSection: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  termsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 20,
  },
  termsSubheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 16,
  },
  termsText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 14,
  },

  // Help & Support Styles
  helpContent: {
    paddingBottom: 20,
  },
  helpSection: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  helpHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 20,
  },
  helpSubheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 16,
  },
  helpText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 14,
  },
  contactInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  contactItem: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },

  bottomSpacing: {
    height: 40,
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
});
