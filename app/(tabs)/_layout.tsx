import { Tabs, usePathname } from 'expo-router';
import { House, BookOpen, Heart, Menu, Smile } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import BannerAd from '@/components/BannerAd';
import React from 'react';

// Tab configuration
const TABS = [
  { name: 'index', title: 'Inicio', icon: House },
  { name: 'bible', title: 'Biblia', icon: BookOpen },
  { name: 'mood-tracker', title: 'Ánimo', icon: Smile },
  { name: 'prayer-tracker', title: 'Oraciones', icon: Heart },
  { name: 'profile', title: 'Más', icon: Menu },
];

/**
 * Standard Tab Item Component (YouVersion style)
 * Vertical layout: Icon top, Label bottom
 */
const TabItem = ({
  label,
  icon: Icon,
  isFocused,
  onPress,
  onLongPress
}: {
  label: string;
  icon: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <View style={styles.tabItemInner}>
        <Icon
          size={24}
          color={isFocused ? '#F97316' : '#94A3B8'}
          strokeWidth={isFocused ? 2.5 : 2}
        />
        <Text style={[styles.tabLabel, { color: isFocused ? '#F97316' : '#94A3B8' }]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Custom Modern Tab Bar
const ModernTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Check if we're on the Bible tab - hide banner for better reading experience
  const isBibleTab = pathname.includes('/bible') || pathname === '/bible' || state.routes[state.index]?.name === 'bible';

  // Determine placement based on current route for ads
  const getPlacement = () => {
    if (pathname.includes('/bible')) return 'bible';
    if (pathname.includes('/prayer-tracker')) return 'prayer';
    if (pathname.includes('/mood-tracker')) return 'mood';
    if (pathname.includes('/quiz')) return 'quiz';
    if (pathname.includes('/profile')) return 'home';
    return 'home';
  };

  return (
    <View style={styles.tabBarWrapper}>
      {/* Banner Ad positioned above the tab bar - hidden on Bible tab */}
      {!isBibleTab && (
        <View style={styles.bannerContainer}>
          <BannerAd placement={getPlacement()} />
        </View>
      )}

      {/* Standard Bottom Tab Bar */}
      <View style={[styles.tabBarOuterContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];

            // Skip hidden tabs
            if (options.href === null) return null;

            const tabConfig = TABS.find(t => t.name === route.name);
            if (!tabConfig) return null;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={tabConfig.title}
                icon={tabConfig.icon}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Biblia',
        }}
      />
      <Tabs.Screen
        name="mood-tracker"
        options={{
          title: 'Ánimo',
        }}
      />
      <Tabs.Screen
        name="prayer-tracker"
        options={{
          title: 'Oraciones',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Más',
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: '#FFFFFF', // Solid background for the wrapper to avoid transparency issues
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  bannerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBarOuterContainer: {
    backgroundColor: '#FFFFFF',
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 2,
  },
});