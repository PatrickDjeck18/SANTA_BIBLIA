import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🙏 Daily Bread</Text>
        <Text style={styles.subtitle}>Bible Companion App</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>📖</Text>
          <Text style={styles.cardTitle}>Read Bible</Text>
          <Text style={styles.cardSubtitle}>Discover God's Word</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>🙏</Text>
          <Text style={styles.cardTitle}>Prayer Journal</Text>
          <Text style={styles.cardSubtitle}>Track your prayers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>✨</Text>
          <Text style={styles.cardTitle}>Daily Verse</Text>
          <Text style={styles.cardSubtitle}>Inspiration for today</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ready for Google Play Store</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
