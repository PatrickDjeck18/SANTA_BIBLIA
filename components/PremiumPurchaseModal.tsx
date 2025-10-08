import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, CheckCircle, Star, Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useAds } from '@/hooks/useAds';

interface PremiumPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
}) => {
  const { purchasePremium, restorePurchases, isPremium } = useAds();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      // Since RevenueCat is removed, no packages are available
      setPackages([]);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert('Error', 'Failed to load purchase options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const success = await purchasePremium();
      
      if (success) {
        Alert.alert('Success', '🎉 Thank you for upgrading to Premium! Ads have been removed.');
        onPurchaseSuccess?.();
        onClose();
      } else {
        Alert.alert('Purchase Failed', 'Premium purchases are not currently available.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const success = await restorePurchases();
      
      if (success) {
        Alert.alert('Restored', 'Your previous purchases have been restored!');
        onPurchaseSuccess?.();
        onClose();
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, text: 'Remove all banner ads' },
    { icon: Crown, text: 'Remove interstitial ads' },
    { icon: Star, text: 'Remove reward ads' },
    { icon: CheckCircle, text: 'Support app development' },
  ];

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
            colors={Colors.gradients.main}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Crown size={32} color={Colors.primary[600]} />
                <Text style={styles.title}>Go Premium</Text>
                <Text style={styles.subtitle}>Remove ads and support development</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <benefit.icon size={20} color={Colors.primary[500]} />
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              ))}
            </View>

            {/* Package Selection - Disabled since RevenueCat is removed */}
            <View style={styles.packages}>
              <View style={styles.disabledPackage}>
                <Text style={styles.disabledPackageText}>
                  Premium purchases are not currently available
                </Text>
                <Text style={styles.disabledPackageSubtext}>
                  In-app purchases have been temporarily disabled
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.purchaseButton, styles.disabledButton]}
                onPress={handlePurchase}
                disabled={true}
              >
                <Text style={styles.purchaseButtonText}>
                  Premium Unavailable
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.restoreButton, styles.disabledButton]}
                onPress={handleRestore}
                disabled={true}
              >
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  gradient: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  benefits: {
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    marginLeft: Spacing.sm,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.sm,
  },
  packages: {
    marginBottom: Spacing.xl,
  },
  disabledPackage: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  disabledPackageText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  disabledPackageSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  packageButton: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackage: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  packageContent: {
    flex: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  packageTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
  },
  packagePrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  packageDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  actions: {
    gap: Spacing.md,
  },
  purchaseButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  restoreButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
  },
});

export default PremiumPurchaseModal;