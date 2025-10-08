import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { User, ArrowRight } from 'lucide-react-native';

interface AuthGuardProps {
  children: React.ReactNode;
  message?: string;
  showGuestWarning?: boolean;
}

export default function AuthGuard({ children, message, showGuestWarning = true }: AuthGuardProps) {
  const { user, isGuest } = useAuth();

  // If user is authenticated (including guest users), show the content
  // Guest users can now access mood and prayer features
  if (user) {
    return <>{children}</>;
  }

  // If no user at all, show full auth required message
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.iconGradient}
            >
              <User size={48} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>
            Welcome to Daily Bread
          </Text>
          
          <Text style={styles.message}>
            {message || 'Please sign in to access all features and save your spiritual journey.'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/login')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign In</Text>
                <ArrowRight size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signUpText}>Create Account</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: Spacing['2xl'],
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.5,
    marginBottom: Spacing['3xl'],
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signInGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  signInText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  signUpButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary[400],
    alignItems: 'center',
  },
  signUpText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  guestButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  guestText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  guestNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});