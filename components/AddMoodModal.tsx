import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Animated,
    useWindowDimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignTokens';
import { X, ChevronRight, Check, Plus, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_MOODS_KEY = 'custom_moods_v1';

interface AddMoodModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAddMood: (mood: string, rating: number, influences: string[], note: string, emoji: string, verse?: {
        reference: string;
        text: string;
        explanation: string;
        application?: string;
        moodAlignment?: string;
    }) => void;
}

interface MoodItem {
    id: string;
    emoji: string;
    label: string;
    color: string;
    isCustom?: boolean;
}

interface MoodCategory {
    name: string;
    color: string;
    moods: MoodItem[];
}

// Comprehensive mood categories like the screenshot
const defaultMoodCategories: MoodCategory[] = [
    {
        name: 'Amor',
        color: '#EC4899',
        moods: [
            { id: 'love', emoji: '❤️', label: 'Amor', color: '#EC4899' },
            { id: 'tenderness', emoji: '🥰', label: 'Ternura', color: '#F472B6' },
            { id: 'compassion', emoji: '🙏', label: 'Compasión', color: '#A78BFA' },
            { id: 'bliss', emoji: '🤗', label: 'Dicha', color: '#FBBF24' },
            { id: 'gratitude', emoji: '😊', label: 'Gratitud', color: '#8B5CF6' },
            { id: 'pride', emoji: '😎', label: 'Orgullo', color: '#F59E0B' },
            { id: 'admiration', emoji: '🤩', label: 'Admiración', color: '#10B981' },
            { id: 'infatuation', emoji: '😍', label: 'Encaprichamiento', color: '#EF4444' },
            { id: 'enchantment', emoji: '💕', label: 'Encanto', color: '#EC4899' },
        ],
    },
    {
        name: 'Alegría',
        color: '#22C55E',
        moods: [
            { id: 'joy', emoji: '😊', label: 'Alegría', color: '#22C55E' },
            { id: 'happiness', emoji: '😄', label: 'Felicidad', color: '#16A34A' },
            { id: 'delight', emoji: '😁', label: 'Deleite', color: '#FBBF24' },
            { id: 'triumph', emoji: '🥳', label: 'Triunfo', color: '#8B5CF6' },
            { id: 'exhilaration', emoji: '😜', label: 'Regocijo', color: '#EC4899' },
            { id: 'interest', emoji: '🤓', label: 'Interés', color: '#06B6D4' },
            { id: 'anticipation', emoji: '🤔', label: 'Anticipación', color: '#F59E0B' },
            { id: 'hope', emoji: '🙏', label: 'Esperanza', color: '#10B981' },
            { id: 'curiosity', emoji: '🧐', label: 'Curiosidad', color: '#8B5CF6' },
            { id: 'enthusiasm', emoji: '🤗', label: 'Entusiasmo', color: '#22C55E' },
        ],
    },
    {
        name: 'Tristeza',
        color: '#6B7280',
        moods: [
            { id: 'sadness', emoji: '😢', label: 'Tristeza', color: '#6B7280' },
            { id: 'bitterness', emoji: '😞', label: 'Amargura', color: '#4B5563' },
            { id: 'longing', emoji: '😔', label: 'Anhelo', color: '#94A3B8' },
            { id: 'grief', emoji: '😭', label: 'Dolor', color: '#374151' },
            { id: 'pity', emoji: '🥺', label: 'Lástima', color: '#64748B' },
            { id: 'detachment', emoji: '😐', label: 'Desapego', color: '#9CA3AF' },
            { id: 'despair', emoji: '😩', label: 'Desesperación', color: '#4B5563' },
            { id: 'helplessness', emoji: '🆘', label: 'Impotencia', color: '#EF4444' },
            { id: 'alienation', emoji: '😶', label: 'Alienación', color: '#64748B' },
            { id: 'disappointment', emoji: '😕', label: 'Decepción', color: '#6B7280' },
            { id: 'shock', emoji: '😲', label: 'Conmoción', color: '#F59E0B' },
            { id: 'regret', emoji: '😣', label: 'Arrepentimiento', color: '#94A3B8' },
            { id: 'boredom', emoji: '😑', label: 'Aburrimiento', color: '#9CA3AF' },
            { id: 'hopelessness', emoji: '🚫', label: 'Desesperanza', color: '#374151' },
        ],
    },
    {
        name: 'Miedo',
        color: '#F59E0B',
        moods: [
            { id: 'fear', emoji: '😨', label: 'Miedo', color: '#F59E0B' },
            { id: 'anxiety', emoji: '😰', label: 'Ansiedad', color: '#F472B6' },
            { id: 'worry', emoji: '😟', label: 'Preocupación', color: '#EAB308' },
            { id: 'nervousness', emoji: '😬', label: 'Nerviosismo', color: '#FB923C' },
            { id: 'dread', emoji: '😱', label: 'Pavor', color: '#DC2626' },
            { id: 'panic', emoji: '🫣', label: 'Pánico', color: '#EF4444' },
        ],
    },
    {
        name: 'Paz',
        color: '#06B6D4',
        moods: [
            { id: 'calm', emoji: '😌', label: 'Calma', color: '#06B6D4' },
            { id: 'peaceful', emoji: '🕊️', label: 'Paz', color: '#0891B2' },
            { id: 'relaxed', emoji: '😎', label: 'Relajado', color: '#22D3EE' },
            { id: 'content', emoji: '☺️', label: 'Contento', color: '#67E8F9' },
            { id: 'serene', emoji: '😇', label: 'Sereno', color: '#A78BFA' },
            { id: 'blessed', emoji: '✨', label: 'Bendecido', color: '#FBBF24' },
        ],
    },
    {
        name: 'Energía',
        color: '#10B981',
        moods: [
            { id: 'motivated', emoji: '💪', label: 'Motivado', color: '#10B981' },
            { id: 'energetic', emoji: '⚡', label: 'Enérgico', color: '#22C55E' },
            { id: 'excited', emoji: '🤩', label: 'Emocionado', color: '#F59E0B' },
            { id: 'inspired', emoji: '💡', label: 'Inspirado', color: '#8B5CF6' },
            { id: 'determined', emoji: '🎯', label: 'Determinado', color: '#059669' },
            { id: 'tired', emoji: '😴', label: 'Cansado', color: '#94A3B8' },
            { id: 'stressed', emoji: '😓', label: 'Estresado', color: '#EF4444' },
            { id: 'exhausted', emoji: '🥱', label: 'Agotado', color: '#64748B' },
        ],
    },
];

const AddMoodModal: React.FC<AddMoodModalProps> = ({ isVisible, onClose, onAddMood }) => {
    const { width: screenWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);
    const [notes, setNotes] = useState('');
    const [moodCategories, setMoodCategories] = useState<MoodCategory[]>(defaultMoodCategories);
    const [showAddMoodModal, setShowAddMoodModal] = useState(false);
    const [addMoodCategory, setAddMoodCategory] = useState<string | null>(null);
    const [newMoodEmoji, setNewMoodEmoji] = useState('');
    const [newMoodLabel, setNewMoodLabel] = useState('');

    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    // Load custom moods on mount
    useEffect(() => {
        loadCustomMoods();
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (isVisible) {
            setSelectedMood(null);
            setNotes('');
        }
    }, [isVisible]);

    const loadCustomMoods = async () => {
        try {
            const stored = await AsyncStorage.getItem(CUSTOM_MOODS_KEY);
            if (stored) {
                const customMoods: { categoryName: string; mood: MoodItem }[] = JSON.parse(stored);
                const updatedCategories = [...defaultMoodCategories];
                customMoods.forEach(({ categoryName, mood }) => {
                    const category = updatedCategories.find(c => c.name === categoryName);
                    if (category && !category.moods.find(m => m.id === mood.id)) {
                        category.moods.push({ ...mood, isCustom: true });
                    }
                });
                setMoodCategories(updatedCategories);
            }
        } catch (error) {
            console.error('Error loading custom moods:', error);
        }
    };

    const saveCustomMood = async (categoryName: string, mood: MoodItem) => {
        try {
            const stored = await AsyncStorage.getItem(CUSTOM_MOODS_KEY);
            const customMoods: { categoryName: string; mood: MoodItem }[] = stored ? JSON.parse(stored) : [];
            customMoods.push({ categoryName, mood });
            await AsyncStorage.setItem(CUSTOM_MOODS_KEY, JSON.stringify(customMoods));
        } catch (error) {
            console.error('Error saving custom mood:', error);
        }
    };

    const handleMoodSelect = (mood: MoodItem) => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setSelectedMood(mood);
    };

    const handleAddMood = async () => {
        if (!selectedMood) return;

        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onAddMood(selectedMood.label, 5, [], notes.trim(), selectedMood.emoji);
        onClose();
    };

    const handleAddCustomMood = () => {
        if (!newMoodEmoji.trim() || !newMoodLabel.trim() || !addMoodCategory) {
            Alert.alert('Falta Información', 'Por favor ingresa un emoji y un nombre para tu estado de ánimo.');
            return;
        }

        const newMood: MoodItem = {
            id: `custom_${Date.now()}`,
            emoji: newMoodEmoji.trim(),
            label: newMoodLabel.trim(),
            color: moodCategories.find(c => c.name === addMoodCategory)?.color || '#6B7280',
            isCustom: true,
        };

        // Add to state
        const updatedCategories = moodCategories.map(cat => {
            if (cat.name === addMoodCategory) {
                return { ...cat, moods: [...cat.moods, newMood] };
            }
            return cat;
        });
        setMoodCategories(updatedCategories);

        // Save to storage
        saveCustomMood(addMoodCategory, newMood);

        // Reset and close
        setNewMoodEmoji('');
        setNewMoodLabel('');
        setShowAddMoodModal(false);
        setAddMoodCategory(null);

        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const openAddMoodFor = (categoryName: string) => {
        setAddMoodCategory(categoryName);
        setShowAddMoodModal(true);
    };

    const chipWidth = (screenWidth - Spacing.lg * 2 - Spacing.sm * 2) / 3;

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            statusBarTranslucent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <ArrowLeft size={24} color={Colors.neutral[600]} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Emociones</Text>
                        <View style={styles.headerPlaceholder} />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Mood Categories */}
                        {moodCategories.map((category) => (
                            <View key={category.name} style={styles.categorySection}>
                                <Text style={[styles.categoryTitle, { color: category.color }]}>
                                    {category.name}
                                </Text>
                                <View style={styles.moodChipsContainer}>
                                    {category.moods.map((mood) => {
                                        const isSelected = selectedMood?.id === mood.id;
                                        return (
                                            <TouchableOpacity
                                                key={mood.id}
                                                style={[
                                                    styles.moodChip,
                                                    isSelected && { backgroundColor: category.color, borderColor: category.color },
                                                ]}
                                                onPress={() => handleMoodSelect(mood)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.moodChipEmoji}>{mood.emoji}</Text>
                                                <Text style={[
                                                    styles.moodChipLabel,
                                                    isSelected && { color: '#FFFFFF' },
                                                ]}>
                                                    {mood.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {/* Add Custom Mood Button */}
                                    <TouchableOpacity
                                        style={styles.addChip}
                                        onPress={() => openAddMoodFor(category.name)}
                                        activeOpacity={0.7}
                                    >
                                        <Plus size={18} color={Colors.neutral[400]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Notes Section */}
                        {selectedMood && (
                            <View style={styles.notesSection}>
                                <Text style={styles.sectionTitle}>Añadir nota (opcional)</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="¿Qué tienes en mente?"
                                    placeholderTextColor={Colors.neutral[400]}
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                    textAlignVertical="top"
                                />
                            </View>
                        )}
                    </ScrollView>

                    {/* Save Button */}
                    <View style={[styles.buttonContainer, { paddingBottom: Math.max(Spacing.lg, insets.bottom + 20) }]}>
                        <TouchableOpacity
                            style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled]}
                            onPress={handleAddMood}
                            activeOpacity={0.9}
                            disabled={!selectedMood}
                        >
                            <Text style={[styles.saveButtonText, !selectedMood && styles.saveButtonTextDisabled]}>
                                Guardar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Add Custom Mood Modal */}
            <Modal
                visible={showAddMoodModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowAddMoodModal(false)}
            >
                <View style={styles.addMoodOverlay}>
                    <View style={styles.addMoodContainer}>
                        <Text style={styles.addMoodTitle}>Añadir Estado de Ánimo</Text>
                        <Text style={styles.addMoodSubtitle}>a {addMoodCategory}</Text>

                        <View style={styles.addMoodInputRow}>
                            <TextInput
                                style={styles.emojiInput}
                                placeholder="😀"
                                placeholderTextColor={Colors.neutral[300]}
                                value={newMoodEmoji}
                                onChangeText={setNewMoodEmoji}
                                maxLength={2}
                            />
                            <TextInput
                                style={styles.labelInput}
                                placeholder="Nombre de la emoción"
                                placeholderTextColor={Colors.neutral[400]}
                                value={newMoodLabel}
                                onChangeText={setNewMoodLabel}
                                maxLength={20}
                            />
                        </View>

                        <View style={styles.addMoodButtons}>
                            <TouchableOpacity
                                style={styles.cancelAddBtn}
                                onPress={() => {
                                    setShowAddMoodModal(false);
                                    setNewMoodEmoji('');
                                    setNewMoodLabel('');
                                }}
                            >
                                <Text style={styles.cancelAddBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmAddBtn}
                                onPress={handleAddCustomMood}
                            >
                                <Text style={styles.confirmAddBtnText}>Añadir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[100],
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
    categorySection: {
        marginBottom: Spacing.xl,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    moodChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    moodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        gap: 6,
    },
    moodChipEmoji: {
        fontSize: 18,
    },
    moodChipLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.neutral[700],
    },
    addChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notesSection: {
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[800],
        marginBottom: Spacing.md,
    },
    notesInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        fontSize: 15,
        color: Colors.neutral[900],
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        minHeight: 100,
        maxHeight: 150,
    },
    buttonContainer: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[100],
    },
    saveButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md + 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: Colors.neutral[200],
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    saveButtonTextDisabled: {
        color: Colors.neutral[400],
    },
    // Add Mood Modal
    addMoodOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addMoodContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: Spacing.xl,
        width: '85%',
        maxWidth: 340,
    },
    addMoodTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.neutral[900],
        textAlign: 'center',
    },
    addMoodSubtitle: {
        fontSize: 14,
        color: Colors.neutral[500],
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    addMoodInputRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    emojiInput: {
        width: 60,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        backgroundColor: Colors.neutral[50],
        fontSize: 28,
        textAlign: 'center',
    },
    labelInput: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        backgroundColor: Colors.neutral[50],
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.neutral[900],
    },
    addMoodButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    cancelAddBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        backgroundColor: Colors.neutral[100],
        alignItems: 'center',
    },
    cancelAddBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.neutral[600],
    },
    confirmAddBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
    },
    confirmAddBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default AddMoodModal;
