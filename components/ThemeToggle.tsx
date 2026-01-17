import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle = () => {
  const { themeMode, setThemeMode, colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: themeMode === 'light' ? colors.primary : colors.surface },
            { borderColor: colors.border }
          ]}
          onPress={() => setThemeMode('light')}
        >
          <Sun size={20} color={themeMode === 'light' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[
            styles.buttonText,
            { color: themeMode === 'light' ? '#FFFFFF' : colors.text }
          ]}>
            Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: themeMode === 'dark' ? colors.primary : colors.surface },
            { borderColor: colors.border }
          ]}
          onPress={() => setThemeMode('dark')}
        >
          <Moon size={20} color={themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[
            styles.buttonText,
            { color: themeMode === 'dark' ? '#FFFFFF' : colors.text }
          ]}>
            Dark
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: themeMode === 'system' ? colors.primary : colors.surface },
            { borderColor: colors.border }
          ]}
          onPress={() => setThemeMode('system')}
        >
          <Monitor size={20} color={themeMode === 'system' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[
            styles.buttonText,
            { color: themeMode === 'system' ? '#FFFFFF' : colors.text }
          ]}>
            System
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

