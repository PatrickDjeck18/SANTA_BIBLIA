import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as RNStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { FileText, Scale, Users, Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';

const { width } = Dimensions.get('window');

export default function TermsOfServiceScreen() {
  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar style="dark" />
      <BackgroundGradient>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ModernHeader
            title="Terms of Service"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={handleBack}
            readerText="Terms of Service. User agreement and service terms. Learn about your rights and responsibilities when using Daily Faith."
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction Card */}
          <View style={styles.introCard}>
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.introGradient}
            >
              <View style={styles.introHeader}>
                <View style={styles.introIcon}>
                  <FileText size={32} color={Colors.primary[600]} />
                </View>
                <View style={styles.introContent}>
                  <Text style={styles.introTitle}>Terms of Service</Text>
                  <Text style={styles.introSubtitle}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.introText}>
                Welcome to Daily Faith! These Terms of Service govern your use of our spiritual companion app. By using our service, you agree to these terms.
              </Text>
            </LinearGradient>
          </View>

          {/* Acceptance of Terms */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CheckCircle size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                By accessing or using Daily Faith, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• You must be at least 13 years old to use our service</Text>
                <Text style={styles.listItem}>• You are responsible for maintaining account security</Text>
                <Text style={styles.listItem}>• You agree to provide accurate information</Text>
                <Text style={styles.listItem}>• You understand these terms may be updated</Text>
              </View>
            </View>
          </View>

          {/* Service Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Users size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Service Description</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Daily Faith is a spiritual companion app that provides:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Bible reading plans and study tools</Text>
                <Text style={styles.listItem}>• Prayer journal and tracking features</Text>
                <Text style={styles.listItem}>• Dream interpretation with AI assistance</Text>
                <Text style={styles.listItem}>• Mood tracking and spiritual insights</Text>
                <Text style={styles.listItem}>• Bible quizzes and educational content</Text>
                <Text style={styles.listItem}>• Community features and sharing</Text>
              </View>
            </View>
          </View>

          {/* User Responsibilities */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>User Responsibilities</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                As a user of Daily Faith, you agree to:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Use the service for lawful purposes only</Text>
                <Text style={styles.listItem}>• Respect other users and maintain appropriate conduct</Text>
                <Text style={styles.listItem}>• Not share inappropriate or offensive content</Text>
                <Text style={styles.listItem}>• Protect your account credentials</Text>
                <Text style={styles.listItem}>• Report any security concerns immediately</Text>
                <Text style={styles.listItem}>• Comply with all applicable laws and regulations</Text>
              </View>
            </View>
          </View>

          {/* Prohibited Uses */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Prohibited Uses</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                You may not use Daily Faith for:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Illegal activities or harmful purposes</Text>
                <Text style={styles.listItem}>• Harassment, abuse, or intimidation</Text>
                <Text style={styles.listItem}>• Spreading misinformation or false teachings</Text>
                <Text style={styles.listItem}>• Attempting to hack or compromise security</Text>
                <Text style={styles.listItem}>• Commercial use without permission</Text>
                <Text style={styles.listItem}>• Violating intellectual property rights</Text>
              </View>
            </View>
          </View>

          {/* Intellectual Property */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Scale size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Intellectual Property</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Daily Faith and its content are protected by intellectual property laws:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• We own the app, software, and original content</Text>
                <Text style={styles.listItem}>• Bible text is used under appropriate licenses</Text>
                <Text style={styles.listItem}>• You retain ownership of your personal content</Text>
                <Text style={styles.listItem}>• You grant us license to use your content for service provision</Text>
                <Text style={styles.listItem}>• You may not copy or redistribute our content</Text>
              </View>
            </View>
          </View>

          {/* Privacy and Data */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Privacy and Data Protection</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                We are committed to protecting your privacy and spiritual data:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• Your spiritual content is encrypted and secure</Text>
                <Text style={styles.listItem}>• We never sell your personal information</Text>
                <Text style={styles.listItem}>• You control your data and can export it anytime</Text>
                <Text style={styles.listItem}>• We comply with GDPR and other privacy regulations</Text>
                <Text style={styles.listItem}>• See our Privacy Policy for detailed information</Text>
              </View>
            </View>
          </View>

          {/* Service Availability */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CheckCircle size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Service Availability</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                We strive to provide reliable service, but cannot guarantee:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• 100% uptime or availability</Text>
                <Text style={styles.listItem}>• Uninterrupted access to all features</Text>
                <Text style={styles.listItem}>• Compatibility with all devices</Text>
                <Text style={styles.listItem}>• Immediate response to technical issues</Text>
              </View>
              <Text style={styles.sectionText}>
                We will notify users of planned maintenance and work to resolve issues promptly.
              </Text>
            </View>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Daily Faith is provided "as is" without warranties:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• We do not guarantee spiritual outcomes</Text>
                <Text style={styles.listItem}>• AI interpretations are for guidance only</Text>
                <Text style={styles.listItem}>• We are not liable for indirect damages</Text>
                <Text style={styles.listItem}>• Our liability is limited to service fees paid</Text>
                <Text style={styles.listItem}>• You use the service at your own risk</Text>
              </View>
            </View>
          </View>

          {/* Termination */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={24} color={Colors.warning[600]} />
              </View>
              <Text style={styles.sectionTitle}>Account Termination</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account if:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• You violate these terms of service</Text>
                <Text style={styles.listItem}>• You engage in prohibited activities</Text>
                <Text style={styles.listItem}>• You fail to pay required fees</Text>
                <Text style={styles.listItem}>• We discontinue the service</Text>
              </View>
              <Text style={styles.sectionText}>
                You may terminate your account at any time through the app settings.
              </Text>
            </View>
          </View>

          {/* Changes to Terms */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText size={24} color={Colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Changes to Terms</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                We may update these terms from time to time:
              </Text>
              <View style={styles.listContainer}>
                <Text style={styles.listItem}>• We will notify users of significant changes</Text>
                <Text style={styles.listItem}>• Continued use constitutes acceptance</Text>
                <Text style={styles.listItem}>• You can review terms anytime in the app</Text>
                <Text style={styles.listItem}>• Contact us if you have questions about changes</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactCard}>
            <LinearGradient
              colors={[Colors.primary[50], Colors.primary[100]]}
              style={styles.contactGradient}
            >
              <View style={styles.contactHeader}>
                <View style={styles.contactIcon}>
                  <FileText size={24} color={Colors.primary[600]} />
                </View>
                <Text style={styles.contactTitle}>Questions About Terms</Text>
              </View>
              <Text style={styles.contactText}>
                If you have questions about these Terms of Service, please contact us:
              </Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>Email: legal@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Support: support@dailyfaith.me</Text>
                <Text style={styles.contactItem}>Response Time: We typically respond within 48 hours</Text>
                <Text style={styles.contactItem}>Website: https://dailyfaith.me</Text>
              </View>
              <Text style={styles.contactFooter}>
                These terms are governed by applicable laws and any disputes will be resolved through appropriate legal channels.
              </Text>
            </LinearGradient>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </BackgroundGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    zIndex: 1000,
    elevation: 4,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Introduction Card
  introCard: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introGradient: {
    padding: Spacing.xl,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  introSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
  },
  introText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    flex: 1,
  },
  sectionContent: {
    gap: Spacing.md,
  },
  sectionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  listContainer: {
    gap: Spacing.sm,
  },
  listItem: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    paddingLeft: Spacing.sm,
  },

  // Contact Card
  contactCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactGradient: {
    padding: Spacing.xl,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[800],
  },
  contactText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing.lg,
  },
  contactInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contactItem: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
  },
  contactFooter: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },

  bottomSpacing: {
    height: 100,
  },
});
