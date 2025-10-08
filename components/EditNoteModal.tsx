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
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { X, Palette, Tag, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StudyNote {
  id: string;
  reference: string;
  content: string;
  tags: string[];
  timestamp: number;
  lastModified: number;
  backgroundColor?: string;
  gradientColors?: string[];
}

interface EditNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpdateNote: (id: string, updates: Partial<StudyNote>) => void;
  note: StudyNote | null;
}

// Predefined background options using design tokens
const backgroundOptions = [
  { id: 'default', name: 'Default', type: 'color', value: Colors.glass.card },
  { id: 'spiritual', name: 'Spiritual', type: 'gradient', value: Colors.gradients.spiritual },
  { id: 'sunset', name: 'Sunset', type: 'gradient', value: Colors.gradients.sunset },
  { id: 'ocean', name: 'Ocean', type: 'gradient', value: Colors.gradients.ocean },
  { id: 'nature', name: 'Nature', type: 'gradient', value: Colors.gradients.nature },
  { id: 'golden', name: 'Golden', type: 'gradient', value: Colors.gradients.dawn },
  { id: 'aurora', name: 'Aurora', type: 'gradient', value: Colors.gradients.vibrant },
  { id: 'cosmic', name: 'Cosmic', type: 'gradient', value: Colors.gradients.purple },
  { id: 'light', name: 'Light', type: 'gradient', value: Colors.gradients.spiritualLight },
];

const EditNoteModal: React.FC<EditNoteModalProps> = ({ 
  isVisible, 
  onClose, 
  onUpdateNote, 
  note 
}) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(Colors.glass.card);
  const [gradientColors, setGradientColors] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTags(note.tags || []);
      setBackgroundColor(note.backgroundColor || Colors.glass.card);
      setGradientColors(note.gradientColors);
    }
  }, [note]);

  const handleSave = () => {
    if (!note || !content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    onUpdateNote(note.id, {
      content: content.trim(),
      tags,
      backgroundColor,
      gradientColors,
      lastModified: Date.now(),
    });
    handleClose();
  };

  const handleClose = () => {
    setContent('');
    setTags([]);
    setNewTag('');
    setShowColorPicker(false);
    setBackgroundColor(Colors.glass.card);
    setGradientColors(undefined);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBackgroundChange = (option: typeof backgroundOptions[0]) => {
    if (option.type === 'color') {
      setBackgroundColor(option.value as string);
      setGradientColors(undefined);
    } else {
      setGradientColors([...(option.value as readonly string[])]);
      setBackgroundColor(Colors.glass.card);
    }
    setShowColorPicker(false);
  };

  const renderNoteBackground = () => {
    if (gradientColors && gradientColors.length >= 2) {
      const colors = gradientColors.length >= 2
        ? [gradientColors[0], gradientColors[1], ...(gradientColors.slice(2))] as const
        : [gradientColors[0], gradientColors[0]] as const;
      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return null;
  };

  const ColorPicker = () => (
    <View style={styles.colorPickerContainer}>
      <Text style={styles.colorPickerTitle}>Choose Background</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorOptionsScroll}>
        {backgroundOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.colorOption}
            onPress={() => handleBackgroundChange(option)}
          >
            {option.type === 'gradient' ? (
              <LinearGradient
                colors={option.value as readonly string[] as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.colorPreview}
              />
            ) : (
              <View style={[styles.colorPreview, { backgroundColor: option.value as string }]} />
            )}
            <Text style={styles.colorOptionName}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (!note) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={[
              styles.modalContainer,
              { backgroundColor: backgroundColor, overflow: 'hidden' }
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {renderNoteBackground()}
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContentContainer}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Note</Text>
                  <Text style={styles.noteReference}>{note.reference}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <X size={24} color={Colors.neutral[600]} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.label}>Study Notes</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your study notes here..."
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.neutral[400]}
                />
                
                {/* Tags Section */}
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add a tag..."
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholderTextColor={Colors.neutral[400]}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                    <Plus size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
                
                {tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Tag size={12} color={Colors.primary[600]} />
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => removeTag(tag)}
                          style={styles.removeTagButton}
                        >
                          <Text style={styles.removeTagText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Background Options */}
                <TouchableOpacity
                  style={styles.backgroundOption}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette size={16} color={Colors.primary[600]} />
                  <Text style={styles.backgroundOptionText}>Change Background</Text>
                </TouchableOpacity>

                {showColorPicker && <ColorPicker />}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    ...Shadows.lg,
  },
  modalContent: {
    flexGrow: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.light,
  },
  modalTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  noteReference: {
    fontSize: Typography.sizes.lg,
    color: Colors.primary[600],
    fontWeight: Typography.weights.semiBold,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  textArea: {
    backgroundColor: Colors.glass.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[800],
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.glass.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[800],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginRight: Spacing.sm,
  },
  addTagButton: {
    backgroundColor: Colors.primary[600],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  tagText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[700],
    fontWeight: Typography.weights.semiBold,
  },
  removeTagButton: {
    marginLeft: Spacing.xs,
  },
  removeTagText: {
    color: Colors.error[500],
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  backgroundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  backgroundOptionText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  colorPickerContainer: {
    backgroundColor: Colors.glass.cardSoft,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  colorPickerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  colorOptionsScroll: {
    paddingVertical: Spacing.xs,
  },
  colorOption: {
    alignItems: 'center',
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.xs,
  },
  colorOptionName: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    minWidth: 80,
  },
  cancelButtonText: {
    color: Colors.neutral[600],
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});

export default EditNoteModal;