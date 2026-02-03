// Modern Components Index
// Export all modern UI components for easy importing

// Layout Components
export {
    HeroSection,
    ModernCard,
    StatCard,
    ActionCard,
    SectionHeader,
    FeatureItem,
    EmptyState,
} from './ModernUI';

// Button Components
export {
    ModernButton,
    FloatingActionButton,
    IconButton,
} from './ModernButtons';

// Input Components
export {
    ModernInput,
    SearchInput,
    TextArea,
    Chip,
    ChipGroup,
} from './ModernInputs';

// Glass Components
export {
    GlassCard,
    GlassButton,
    FloatingPill,
    StatBadge,
} from './GlassCard';

// Mood Components
export {
    MoodOrb,
    MoodGrid,
    MoodSlider,
    MoodCard,
    MoodSummary,
    MoodConfigs,
    type MoodType,
} from './MoodOrb';

// Timeline Components
export {
    TimelineItem,
    TimelineHeader,
    TimelineEmpty,
    ActivityTimeline,
} from './TimelineItem';

// Shimmer/Loading Components
export {
    ShimmerText,
    SkeletonCard,
    SkeletonList,
    SkeletonAvatar,
    SkeletonRow,
    PulseDot,
    LoadingOverlay,
} from './ShimmerText';

// Theme Hook and Utilities
export {
    useModernTheme,
    getTheme,
    GradientPresets,
    lightTheme,
    darkTheme,
} from '@/hooks/useModernTheme';

// Types
export type {
    Theme,
    ThemeColors,
    ThemeGradients,
} from '@/hooks/useModernTheme';
