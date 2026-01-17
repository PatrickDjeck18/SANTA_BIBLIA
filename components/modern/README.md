# Modern UI Components

A comprehensive set of reusable modern UI components with consistent theming, animations, and styling.

## Installation

All components are available from `@/components/modern`:

```tsx
import {
  // Layout Components
  HeroSection,
  ModernCard,
  StatCard,
  ActionCard,
  SectionHeader,
  FeatureItem,
  EmptyState,
  
  // Button Components
  ModernButton,
  FloatingActionButton,
  IconButton,
  
  // Input Components
  ModernInput,
  SearchInput,
  TextArea,
  Chip,
  ChipGroup,
  
  // Theme
  useModernTheme,
  GradientPresets,
} from '@/components/modern';
```

## Theme Hook

The `useModernTheme()` hook provides consistent theming for light and dark modes:

```tsx
const theme = useModernTheme();

// Access colors
theme.colors.background  // '#F8FAFC' (light) or '#0F0F1A' (dark)
theme.colors.text        // '#1E293B' (light) or '#F1F5F9' (dark)
theme.colors.accent      // '#8B5CF6' (light) or '#A78BFA' (dark)
theme.colors.isDark      // boolean indicating current mode

// Access gradients
theme.gradients.primary  // ['#EC4899', '#DB2777', '#BE185D']
theme.gradients.hero     // Hero section gradient
```

## Layout Components

### HeroSection

Large gradient header with decorative elements:

```tsx
<HeroSection
  title="Bible Quiz"
  subtitle="Challenge yourself with questions from Scripture"
  badge={{
    icon: <Sparkles size={14} color="#FCD34D" />,
    text: "Test Your Knowledge"
  }}
  gradient={GradientPresets.features.quiz}
  icon={<Brain size={80} color="rgba(255,255,255,0.2)" />}
/>
```

### ModernCard

Glass-morphism card with optional gradient:

```tsx
<ModernCard
  onPress={() => handlePress()}
  animated={true}
  delay={100}
>
  <Text>Card Content</Text>
</ModernCard>
```

### StatCard

Compact stat display with icon:

```tsx
<StatCard
  icon={<Trophy size={20} color="white" />}
  value={42}
  label="Correct"
  gradient={GradientPresets.success}
  delay={100}
/>
```

### ActionCard

Horizontal card for navigation/actions:

```tsx
<ActionCard
  icon={<BookOpen size={24} color="white" />}
  title="Read Bible"
  subtitle="Continue your reading"
  onPress={() => router.push('/bible')}
  gradient={GradientPresets.features.bible}
  badge="NEW"
  delay={200}
/>
```

### SectionHeader

Styled section title with optional action:

```tsx
<SectionHeader
  title="Recent Prayers"
  subtitle="Your prayer history"
  action={{
    label: "See All",
    onPress: () => router.push('/prayers')
  }}
/>
```

### EmptyState

Centered empty state display:

```tsx
<EmptyState
  icon={<Heart size={40} color={theme.colors.textMuted} />}
  title="No Prayers Yet"
  message="Start your prayer journey by adding your first prayer."
  action={{
    label: "Add Prayer",
    onPress: () => setShowModal(true)
  }}
/>
```

## Button Components

### ModernButton

Primary button with variants:

```tsx
// Primary (gradient)
<ModernButton
  title="Start Quiz"
  onPress={handleStart}
  variant="primary"
  size="large"
  icon={<Play size={20} color="white" />}
/>

// Secondary
<ModernButton
  title="Cancel"
  onPress={handleCancel}
  variant="secondary"
/>

// Outline
<ModernButton
  title="Learn More"
  onPress={handleLearn}
  variant="outline"
/>
```

### FloatingActionButton

Floating action button:

```tsx
<FloatingActionButton
  icon={<Plus size={24} color="white" />}
  onPress={handleAdd}
  gradient={GradientPresets.primary}
  size="medium"
/>
```

### IconButton

Icon-only button:

```tsx
<IconButton
  icon={<Settings size={24} color={theme.colors.text} />}
  onPress={handleSettings}
  variant="ghost"
  size={44}
/>
```

## Input Components

### ModernInput

Styled text input:

```tsx
<ModernInput
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  leftIcon={<Mail size={20} color={theme.colors.textMuted} />}
/>
```

### SearchInput

Search-specific input:

```tsx
<SearchInput
  placeholder="Search verses..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  onSearch={handleSearch}
/>
```

### ChipGroup

Selectable chips:

```tsx
<ChipGroup
  options={[
    { value: 'happy', label: '😊 Happy' },
    { value: 'calm', label: '😌 Calm' },
    { value: 'sad', label: '😢 Sad' },
  ]}
  selected={selectedMood}
  onSelect={setSelectedMood}
  color={theme.colors.accent}
/>
```

## Gradient Presets

Pre-defined gradients for common use cases:

```tsx
import { GradientPresets } from '@/components/modern';

// Feature gradients
GradientPresets.features.bible     // Purple
GradientPresets.features.prayer    // Pink
GradientPresets.features.mood      // Orange
GradientPresets.features.gratitude // Gold
GradientPresets.features.quiz      // Purple

// Mood gradients
GradientPresets.mood.happy    // Yellow/Orange
GradientPresets.mood.calm     // Purple
GradientPresets.mood.sad      // Blue
GradientPresets.mood.grateful // Green

// Time-based (for hero sections)
GradientPresets.timeOfDay.morning   // Warm yellow
GradientPresets.timeOfDay.afternoon // Light blue
GradientPresets.timeOfDay.evening   // Soft purple
GradientPresets.timeOfDay.night     // Deep purple
```

## Example: Complete Screen

```tsx
import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import {
  HeroSection,
  StatCard,
  ActionCard,
  SectionHeader,
  useModernTheme,
  GradientPresets,
} from '@/components/modern';
import { Spacing } from '@/constants/DesignTokens';

export default function MyScreen() {
  const theme = useModernTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
        }}
      >
        <HeroSection
          title="Welcome Back"
          subtitle="Continue your spiritual journey"
          gradient={GradientPresets.features.bible}
        />
        
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl }}>
          <StatCard
            icon={<Trophy size={20} color="white" />}
            value={7}
            label="Streak"
            gradient={GradientPresets.mood.grateful}
          />
          <StatCard
            icon={<Heart size={20} color="white" />}
            value={23}
            label="Prayers"
            gradient={GradientPresets.features.prayer}
          />
        </View>
        
        <SectionHeader title="Quick Actions" />
        
        <ActionCard
          icon={<BookOpen size={24} color="white" />}
          title="Read Bible"
          subtitle="Pick up where you left off"
          onPress={() => {}}
          gradient={GradientPresets.features.bible}
        />
      </ScrollView>
    </View>
  );
}
```
