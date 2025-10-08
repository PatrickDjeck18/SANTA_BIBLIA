import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { Mail, Eye, EyeOff, Lock, ArrowRight, User, ExternalLink } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

// Modern Components
import ModernAuthCard from '@/components/auth/ModernAuthCard';
import FloatingLabelInput from '@/components/auth/FloatingLabelInput';
import ModernButton from '@/components/auth/ModernButton';
import SocialLoginButton from '@/components/auth/SocialLoginButton';

// Mobile responsiveness helpers
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375; // iPhone SE and similar
const isMediumScreen = width >= 375 && width < 768; // Most phones
const isLargeScreen = width >= 768; // Tablets and large phones

// Responsive spacing helpers
const getResponsiveSpacing = (base: number, multiplier: number = 0.02) => {
  return Math.max(base, width * multiplier);
};

const getResponsiveFontSize = (base: number, maxSize?: number) => {
  const calculatedSize = Math.min(base, width * 0.045);
  return maxSize ? Math.min(calculatedSize, maxSize) : calculatedSize;
};

export default function LoginScreen() {
  const { signInWithEmail, signInAsGuest, forgotPassword, resetPasswordWithCode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [passwordMismatchError, setPasswordMismatchError] = useState('');
  const isEmailValid = email.length > 0 && !emailError;
  const isPasswordValid = password.length >= 6 && !passwordError;
  const isEmailFormValid = isEmailValid && isPasswordValid;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };


  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      validateEmail(text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      validatePassword(text);
    }
  };


  const handleSignIn = async () => {
    const emailOk = validateEmail(email);
    const passOk = validatePassword(password);
    if (!emailOk || !passOk) return;

    try {
      setLoading(true);
      const { data, error } = await signInWithEmail(email.trim(), password);
      
      if (error) {
        // Use the improved error handling from authErrors
        Alert.alert('Sign In Error', error.userFriendlyMessage || error.message || 'Failed to sign in. Please try again.');
      } else if (data?.user) {
        console.log('Sign in successful, user:', data.user.uid);
        // Redirect to main app after successful sign-in
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await signInAsGuest();

      if (error) {
        Alert.alert('Guest Login Error', error.userFriendlyMessage || error.message || 'Failed to login as guest. Please try again.');
      } else if (data?.user) {
        console.log('Guest login successful, user:', data.user.uid);
        // Redirect to main app after successful guest login
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Guest login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (resetStep === 'email') {
      // Email reset
      if (!resetEmail.trim()) {
        setResetEmailError('Email is required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetEmail.trim())) {
        setResetEmailError('Please enter a valid email address');
        return;
      }

      try {
        setLoading(true);
        const { error } = await forgotPassword(resetEmail.trim());

        if (error) {
          Alert.alert('Reset Password Error', error.userFriendlyMessage || error.message || 'Failed to send reset email. Please try again.');
        } else {
          // Automatically advance to code entry step
          setResetStep('code');
          Alert.alert(
            'Reset Code Sent',
            `We've sent a password reset code to ${resetEmail.trim()}. Please enter the 6-digit code below.`
          );
        }
      } catch (error) {
        console.error('Email reset password error:', error);
        Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Step 2: Verify code and reset password
      if (!resetCode.trim()) {
        Alert.alert('Code Required', 'Please enter the reset code.');
        return;
      }

      if (!newPassword.trim()) {
        Alert.alert('Password Required', 'Please enter your new password.');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMismatchError('Passwords do not match. Please make sure both fields are identical.');
        return;
      } else {
        setPasswordMismatchError('');
      }

      try {
        setLoading(true);
        const result = await resetPasswordWithCode(resetEmail.trim(), resetCode.trim(), newPassword);
        const error = result.error;

        if (error) {
          Alert.alert('Reset Password Error', error.userFriendlyMessage || error.message || 'Failed to reset password. Please check your code and try again.');
        } else {
          Alert.alert(
            'Password Reset Successful',
            'Your password has been successfully reset. You can now sign in with your new password.',
            [
              {
                text: 'Go to Login',
                onPress: () => {
                  setShowForgotPassword(false);
                  setResetStep('email');
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setResetEmail('');
                  setPasswordMismatchError('');
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Password reset error:', error);
        Alert.alert('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const handleVisitWebsite = async () => {
    try {
      const url = 'https://dailyfaith.me/';
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'Please visit https://dailyfaith.me/ in your web browser for additional support.'
        );
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert(
        'Error',
        'Unable to open the website. Please visit https://dailyfaith.me/ in your web browser.'
      );
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.welcomeText}>Welcome back to</Text>
            <Text style={styles.appName}>Daily Bread</Text>
            <Text style={styles.tagline}>
              Continue your spiritual journey with AI-powered Bible study and guidance
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <ModernAuthCard>
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your account
              </Text>

              
              {/* Email Input */}
              <FloatingLabelInput
                label="Email Address"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                error={emailError}
                icon={<Mail size={20} color={Colors.neutral[600]} />}
              />

              {/* Password Input */}
              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
                error={passwordError}
                icon={<Lock size={20} color={Colors.neutral[600]} />}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={20} color={Colors.neutral[600]} />
                  ) : (
                    <Eye size={20} color={Colors.neutral[600]} />
                  )
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={() => setShowForgotPassword(true)}
                style={styles.forgotPasswordContainer}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

                {/* Sign In Button */}
                <ModernButton
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={!isEmailFormValid || loading}
                  rightIcon={<ArrowRight size={20} color="white" />}
                  style={styles.signInButton}
                />

                {/* Guest Login Button */}
                <ModernButton
                  title="Continue as Guest"
                  onPress={handleGuestLogin}
                  loading={loading}
                  variant="outline"
                  icon={<User size={20} color={Colors.primary[600]} />}
                  style={styles.guestButton}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  {/* Social login buttons removed */}
                 </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.signUpLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>

                {/* Privacy and Terms Links */}
                <View style={styles.legalContainer}>
                  <TouchableOpacity
                    onPress={() => setShowPrivacyPolicy(true)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.legalLink}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.legalText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.separator}>•</Text>
                  <TouchableOpacity
                    onPress={() => setShowTermsOfService(true)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.legalLink}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.legalText}>Terms & Conditions</Text>
                  </TouchableOpacity>
                </View>
            </ModernAuthCard>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
        </SafeAreaView>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsOfService}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsOfService(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTermsOfService(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
        </SafeAreaView>
      </Modal>

      {/* Forgot Password Modal - Mobile Optimized */}
      <Modal
        visible={showForgotPassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TouchableOpacity
              onPress={() => setShowForgotPassword(false)}
              style={styles.modalCloseButtonContainer}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
          >
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[
                styles.forgotPasswordContent,
                {
                  minHeight: isSmallScreen ? height * 0.75 : height * 0.7, // More height for small screens
                  paddingBottom: isSmallScreen ? getResponsiveSpacing(40) : getResponsiveSpacing(32)
                }
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentInset={{
                bottom: isSmallScreen ? 120 : 100 // More space for small screens
              }}
              automaticallyAdjustKeyboardInsets={true}
            >
              {resetStep === 'email' ? (
                <>
                  <Text style={[
                    styles.forgotPasswordDescription,
                    { marginBottom: Spacing.xl, marginTop: Spacing.md }
                  ]}>
                    Enter your email address to receive a password reset code:
                  </Text>

                  {/* Email Input - Enhanced Mobile Layout */}
                  <FloatingLabelInput
                    label="Email Address"
                    value={resetEmail}
                    onChangeText={(text) => {
                      setResetEmail(text);
                      if (resetEmailError) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(text)) {
                          setResetEmailError('');
                        }
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="go"
                    error={resetEmailError}
                    icon={<Mail size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />}
                    style={[
                      {
                        minHeight: isSmallScreen ? 64 : 60, // Larger touch target for small screens
                        marginBottom: Spacing.xl,
                        borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                      }
                    ]}
                    placeholder="Enter your email address"
                    placeholderTextColor={Colors.neutral[400]}
                  />

                  {/* Error Message - Better Mobile Positioning */}
                  {resetEmailError ? (
                    <View style={[
                      styles.errorContainer,
                      {
                        marginBottom: getResponsiveSpacing(Spacing.lg),
                        paddingHorizontal: getResponsiveSpacing(Spacing.md),
                        paddingVertical: getResponsiveSpacing(Spacing.sm),
                        borderRadius: isSmallScreen ? 10 : BorderRadius.md,
                        backgroundColor: Colors.error[50],
                        borderWidth: 1,
                        borderColor: Colors.error[200]
                      }
                    ]}>
                      <Text style={[
                        styles.errorText,
                        {
                          fontSize: getResponsiveFontSize(Typography.sizes.sm, 13),
                          color: Colors.error[700],
                          textAlign: 'center',
                          fontWeight: Typography.weights.medium
                        }
                      ]}>{resetEmailError}</Text>
                    </View>
                  ) : null}

                  <ModernButton
                    title="Send Reset Code"
                    onPress={handleForgotPassword}
                    loading={loading}
                    disabled={!resetEmail.trim() || loading || !!resetEmailError}
                    style={[
                      styles.resetButton,
                      {
                        minHeight: isSmallScreen ? 64 : 60, // Larger touch target for mobile
                        marginBottom: getResponsiveSpacing(Spacing.xl),
                        borderRadius: isSmallScreen ? 12 : BorderRadius.lg,
                      }
                    ]}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setShowForgotPassword(false);
                      setResetStep('email');
                      setResetEmail('');
                      setResetEmailError('');
                    }}
                    style={[
                      styles.cancelButton,
                      {
                        minHeight: isSmallScreen ? 52 : 48, // Larger touch target for small screens
                        paddingVertical: getResponsiveSpacing(Spacing.lg),
                        paddingHorizontal: getResponsiveSpacing(Spacing.xl),
                        borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                        backgroundColor: isSmallScreen ? Colors.neutral[100] : Colors.neutral[50]
                      }
                    ]}
                    hitSlop={isSmallScreen ? { top: 16, bottom: 16, left: 16, right: 16 } : { top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.6}
                  >
                    <Text style={[
                      styles.cancelButtonText,
                      {
                        fontSize: getResponsiveFontSize(Typography.sizes.base, 15),
                        fontWeight: isSmallScreen ? Typography.weights.semibold : Typography.weights.medium,
                        color: isSmallScreen ? Colors.neutral[700] : Colors.neutral[600]
                      }
                    ]}>Cancel</Text>
                  </TouchableOpacity>

                  {/* Website Support Link */}
                  <TouchableOpacity
                    onPress={handleVisitWebsite}
                    style={styles.websiteLinkContainer}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                  >
                    <ExternalLink size={16} color={Colors.primary[600]} />
                    <Text style={styles.websiteLinkText}>
                      Need help? Visit dailyfaith.me
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[
                    styles.forgotPasswordDescription,
                    {
                      marginBottom: getResponsiveSpacing(Spacing.xl),
                      marginTop: getResponsiveSpacing(Spacing.md),
                      paddingHorizontal: getResponsiveSpacing(Spacing.md),
                      fontSize: getResponsiveFontSize(Typography.sizes.base, 15),
                      lineHeight: getResponsiveFontSize(Typography.sizes.base * 1.5, 22.5)
                    }
                  ]}>
                    Enter the 6-digit code from your email and your new password.
                  </Text>

                  {/* Reset Code Input - Enhanced for Mobile */}
                  <FloatingLabelInput
                    label="Reset Code"
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="one-time-code"
                    returnKeyType="next"
                    maxLength={6}
                    icon={<Lock size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />}
                    style={{
                      minHeight: isSmallScreen ? 64 : 60, // Larger touch target
                      marginBottom: getResponsiveSpacing(Spacing.lg),
                      borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                    }}
                    placeholder="000000"
                    placeholderTextColor={Colors.neutral[400]}
                  />

                  {/* New Password Input - Enhanced for Mobile */}
                  <FloatingLabelInput
                    label="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    returnKeyType="next"
                    icon={<Lock size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />}
                    rightIcon={
                      showNewPassword ? (
                        <EyeOff size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />
                      ) : (
                        <Eye size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />
                      )
                    }
                    onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      minHeight: isSmallScreen ? 64 : 60, // Larger touch target
                      marginBottom: getResponsiveSpacing(Spacing.lg),
                      borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                    }}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={Colors.neutral[400]}
                  />

                  {/* Confirm Password Input - Enhanced for Mobile */}
                  <FloatingLabelInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    returnKeyType="go"
                    icon={<Lock size={isSmallScreen ? 22 : 20} color={Colors.neutral[600]} />}
                    style={{
                      minHeight: isSmallScreen ? 64 : 60, // Larger touch target
                      marginBottom: getResponsiveSpacing(Spacing.xl),
                      borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                    }}
                    placeholder="Re-enter your password"
                    placeholderTextColor={Colors.neutral[400]}
                  />

                  {/* Password Mismatch Error */}
                  {passwordMismatchError ? (
                    <View style={[
                      styles.errorContainer,
                      {
                        marginBottom: getResponsiveSpacing(Spacing.lg),
                        paddingHorizontal: getResponsiveSpacing(Spacing.md),
                        paddingVertical: getResponsiveSpacing(Spacing.sm),
                        borderRadius: isSmallScreen ? 10 : BorderRadius.md,
                        backgroundColor: Colors.error[50],
                        borderWidth: 1,
                        borderColor: Colors.error[200]
                      }
                    ]}>
                      <Text style={[
                        styles.errorText,
                        {
                          fontSize: getResponsiveFontSize(Typography.sizes.sm, 13),
                          color: Colors.error[700],
                          textAlign: 'center',
                          fontWeight: Typography.weights.medium
                        }
                      ]}>{passwordMismatchError}</Text>
                    </View>
                  ) : null}


                  <ModernButton
                    title="Reset Password"
                    onPress={handleForgotPassword}
                    loading={loading}
                    disabled={!resetCode.trim() || !newPassword.trim() || !confirmPassword.trim() || loading}
                    style={[
                      styles.resetButton,
                      {
                        minHeight: isSmallScreen ? 64 : 60, // Larger touch target for mobile
                        marginBottom: getResponsiveSpacing(Spacing.xl),
                        borderRadius: isSmallScreen ? 12 : BorderRadius.lg,
                      }
                    ]}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setResetStep('email');
                      setResetCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setResetEmail('');
                    }}
                    style={[
                      styles.cancelButton,
                      {
                        minHeight: isSmallScreen ? 52 : 48, // Larger touch target for small screens
                        paddingVertical: getResponsiveSpacing(Spacing.lg),
                        paddingHorizontal: getResponsiveSpacing(Spacing.xl),
                        borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                        backgroundColor: isSmallScreen ? Colors.neutral[100] : Colors.neutral[50]
                      }
                    ]}
                    hitSlop={isSmallScreen ? { top: 16, bottom: 16, left: 16, right: 16 } : { top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.6}
                  >
                    <Text style={[
                      styles.cancelButtonText,
                      {
                        fontSize: getResponsiveFontSize(Typography.sizes.base, 15),
                        fontWeight: isSmallScreen ? Typography.weights.semibold : Typography.weights.medium,
                        color: isSmallScreen ? Colors.neutral[700] : Colors.neutral[600]
                      }
                    ]}>Back</Text>
                  </TouchableOpacity>

                  {/* Website Support Link - Enhanced for Mobile */}
                  <TouchableOpacity
                    onPress={handleVisitWebsite}
                    style={[
                      styles.websiteLinkContainer,
                      {
                        marginTop: getResponsiveSpacing(Spacing.xl),
                        paddingVertical: getResponsiveSpacing(Spacing.md),
                        paddingHorizontal: getResponsiveSpacing(Spacing.lg),
                        minHeight: isSmallScreen ? 52 : 44,
                        borderRadius: isSmallScreen ? 12 : BorderRadius.md,
                        backgroundColor: isSmallScreen ? Colors.primary[50] : 'transparent'
                      }
                    ]}
                    hitSlop={isSmallScreen ? { top: 16, bottom: 16, left: 16, right: 16 } : { top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.6}
                  >
                    <ExternalLink size={isSmallScreen ? 18 : 16} color={Colors.primary[600]} />
                    <Text style={[
                      styles.websiteLinkText,
                      {
                        fontSize: getResponsiveFontSize(Typography.sizes.sm, 14),
                        color: Colors.primary[600],
                        marginLeft: getResponsiveSpacing(Spacing.xs),
                        fontWeight: isSmallScreen ? Typography.weights.semibold : Typography.weights.medium
                      }
                    ]}>
                      {isSmallScreen ? "Need help? Visit dailyfaith.me" : "Having trouble? Visit dailyfaith.me for support"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: Spacing.sm,
    maxWidth: 500, // Limit max width on large screens
    alignSelf: 'center',
    width: '100%',
  },

  // Hero Section - Mobile Responsive
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
    minHeight: height * 0.2,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.xl,
  },
  welcomeText: {
    fontSize: Typography.sizes.xl,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  appName: {
    fontSize: Math.min(Typography.sizes['5xl'], width * 0.15), // Responsive font size
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.5,
    paddingHorizontal: Spacing.lg,
    fontWeight: Typography.weights.regular,
    maxWidth: width * 0.8, // Prevent text from being too wide on large screens
  },

  // Form Section - Mobile Responsive
  formSection: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  formTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.base * 1.5,
    paddingHorizontal: Spacing.sm,
  },
  signInButton: {
    marginBottom: Spacing.md,
  },
  guestButton: {
    marginBottom: Spacing.lg,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginHorizontal: Spacing.lg,
    fontWeight: Typography.weights.medium,
  },
  
  // Social Login
  socialContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  
  // Sign Up Link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signUpText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.regular,
  },
  signUpLink: {
    fontSize: Typography.sizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.weights.bold,
  },

  // Forgot Password
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },

  // Legal Links
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  legalLink: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 24,
    justifyContent: 'center',
  },
  legalText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    fontWeight: Typography.weights.medium,
  },
  separator: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    marginHorizontal: Spacing.xs,
  },

  bottomSpacing: {
    height: Spacing.md,
  },



  // Modal Styles - Mobile Responsive
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: Platform.OS === 'ios' ? 60 : 56,
  },
  modalTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButtonContainer: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    color: '#374151',
    padding: Platform.OS === 'ios' ? 4 : 8,
    minWidth: 44,
    minHeight: 44,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  modalContent: {
    flex: 1,
  },

  // Privacy Policy Styles
  privacyContent: {
    paddingBottom: 40,
  },
  privacySection: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  privacyHeading: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: Platform.OS === 'ios' ? 24 : 20,
  },
  privacySubheading: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: Platform.OS === 'ios' ? 16 : 14,
  },
  privacyText: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#4B5563',
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
    marginBottom: 16,
  },

  // Terms of Service Styles
  termsContent: {
    paddingBottom: 40,
  },
  termsSection: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  termsHeading: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: Platform.OS === 'ios' ? 24 : 20,
  },
  termsSubheading: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: Platform.OS === 'ios' ? 16 : 14,
  },
  termsText: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#4B5563',
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
    marginBottom: 16,
  },

  // Forgot Password Modal Styles - Mobile Optimized
  forgotPasswordContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.lg, 0.05), // Responsive padding
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    minHeight: isSmallScreen ? height * 0.75 : height * 0.6, // Better height for small screens
  },
  forgotPasswordDescription: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, 15), // Responsive font size
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.5,
    marginBottom: getResponsiveSpacing(Spacing.xl),
    paddingHorizontal: getResponsiveSpacing(Spacing.sm),
  },
  resetButton: {
    marginBottom: getResponsiveSpacing(Spacing.lg),
    minHeight: isSmallScreen ? 64 : 56, // Larger touch target for mobile
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: getResponsiveSpacing(Spacing.md),
    paddingHorizontal: getResponsiveSpacing(Spacing.xl),
    minHeight: isSmallScreen ? 52 : 44, // Larger for small screens
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(Spacing.md),
    borderRadius: isSmallScreen ? 12 : BorderRadius.md,
    backgroundColor: isSmallScreen ? Colors.neutral[100] : Colors.neutral[50],
  },
  cancelButtonText: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, 15),
    color: isSmallScreen ? Colors.neutral[700] : Colors.neutral[600],
    fontWeight: isSmallScreen ? Typography.weights.semibold : Typography.weights.medium,
  },
  websiteLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveSpacing(Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.md),
    paddingHorizontal: getResponsiveSpacing(Spacing.lg),
    minHeight: isSmallScreen ? 52 : 44, // Larger for small screens
    borderRadius: isSmallScreen ? 12 : BorderRadius.md,
    backgroundColor: isSmallScreen ? Colors.primary[50] : 'transparent',
  },
  websiteLinkText: {
    fontSize: getResponsiveFontSize(Typography.sizes.sm, 14),
    color: Colors.primary[600],
    fontWeight: isSmallScreen ? Typography.weights.semibold : Typography.weights.medium,
    marginLeft: getResponsiveSpacing(Spacing.xs),
  },

  // Error Message Styles - Mobile Friendly
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error[200],
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error[700],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },

});
