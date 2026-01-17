import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, CheckCircle, Star, Zap, Shield, Infinity, BookOpen } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useSubscription, SUBSCRIPTION_PRICE, SUBSCRIPTION_PERIOD } from '@/context/SubscriptionContext';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  featureName?: string; // Optional: name of the feature that triggered the modal
}

const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
  featureName,
}) => {
  const {
    packages,
    isPurchasing,
    purchasePackage,
    restorePurchases,
    isPremium,
    isLoading,
  } = useSubscription();

  const handlePurchase = async () => {
    // Get the monthly package
    const monthlyPackage = packages.find(
      (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('monthly')
    ) || packages[0];

    if (!monthlyPackage) {
      Alert.alert('Error', 'No subscription packages available. Please try again later.');
      return;
    }

    try {
      const success = await purchasePackage(monthlyPackage);

      if (success) {
        Alert.alert(
          '🎉 Welcome to Premium!',
          'Thank you for subscribing! You now have unlimited access to all features.',
          [{
            text: 'Start Exploring',
            onPress: () => {
              onPurchaseSuccess?.();
              onClose();
            }
          }]
        );
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const handleRestore = async () => {
    try {
      const success = await restorePurchases();

      if (success) {
        Alert.alert(
          '✅ Restored!',
          'Your subscription has been restored successfully.',
          [{
            text: 'Continue',
            onPress: () => {
              onPurchaseSuccess?.();
              onClose();
            }
          }]
        );
      } else {
        Alert.alert(
          'No Subscription Found',
          'We couldn\'t find any active subscription to restore.'
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  const benefits = [
    { icon: Infinity, text: 'Unlimited AI Bible Studies' },
    { icon: Zap, text: 'Unlimited Sermon Recording' },
    { icon: BookOpen, text: 'Unlimited Journals & Notes' },
    { icon: Shield, text: 'Ad-Free Experience' },
  ];

  // Get the monthly package price (if available) or use fallback
  const monthlyPackage = packages.find(
    (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('monthly')
  ) || packages[0];

  const priceString = monthlyPackage?.product?.priceString || SUBSCRIPTION_PRICE;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonInner}>
                <X size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.crownContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.crownGradient}
                >
                  <Crown size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Unlock Premium</Text>
              {featureName && (
                <Text style={styles.featureText}>
                  {featureName} requires Premium
                </Text>
              )}
              <Text style={styles.subtitle}>
                Get unlimited access to all features
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <benefit.icon size={18} color="#F97316" />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                  <CheckCircle size={16} color="#22C55E" />
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricingCard}>
              <View style={styles.priceBadge}>
                <Star size={10} color="#FFFFFF" />
                <Text style={styles.priceBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>{priceString}</Text>
                <Text style={styles.periodText}>/{SUBSCRIPTION_PERIOD}</Text>
              </View>
              <Text style={styles.cancelText}>Cancel anytime</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={handlePurchase}
                disabled={isPurchasing || isLoading || packages.length === 0}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  style={styles.purchaseButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Crown size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.purchaseButtonText}>
                        Start Premium Now
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={isPurchasing}
              >
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>

            {/* Legal Text */}
            <Text style={styles.legalText}>
              Payment charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account.
              Auto-renews monthly unless cancelled 24h before period end.
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows['2xl'],
  },
  gradient: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  crownContainer: {
    marginBottom: Spacing.md,
  },
  crownGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureText: {
    fontSize: Typography.sizes.sm,
    color: '#F97316',
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  benefits: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: Typography.weights.medium,
  },
  pricingCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 36,
    fontWeight: Typography.weights.extraBold,
    color: '#FFFFFF',
  },
  periodText: {
    fontSize: Typography.sizes.lg,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  cancelText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  actions: {
    gap: Spacing.sm,
  },
  purchaseButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  purchaseButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  restoreButtonText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: Typography.weights.medium,
  },
  legalText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 14,
  },
});

export default PremiumPurchaseModal;