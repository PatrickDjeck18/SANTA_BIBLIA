import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { Plus, X, Smile } from 'lucide-react-native';

interface AddNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddNote: (title: string, content: string, category: string, priority: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;

const AddNoteModal: React.FC<AddNoteModalProps> = ({ isVisible, onClose, onAddNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formCategory, setFormCategory] = useState('reflection');
  const [formPriority, setFormPriority] = useState('medium');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isVisible) {
      setTitle('');
      setContent('');
      setFormCategory('reflection');
      setFormPriority('medium');
    }
  }, [isVisible]);

  const categories = [
    { id: 'reflection', label: 'Reflexión', icon: '💭', color: Colors.secondary[500] },
    { id: 'prayer', label: 'Oración', icon: '✝️', color: Colors.success[500] },
    { id: 'study', label: 'Estudio', icon: '📚', color: Colors.error[500] },
    { id: 'journal', label: 'Diario', icon: '📖', color: Colors.primary[500] },
    { id: 'insight', label: 'Pensamiento', icon: '💡', color: Colors.warning[600] },
    { id: 'gratitude', label: 'Gratitud', icon: '🙌', color: Colors.warning[500] },
    { id: 'other', label: 'Otro', icon: '📝', color: Colors.primary[500] },
  ];

  const priorities = [
    { id: 'low', label: 'Baja', color: Colors.neutral[400], icon: '🟢' },
    { id: 'medium', label: 'Media', color: Colors.warning[500], icon: '🟡' },
    { id: 'high', label: 'Alta', color: Colors.error[500], icon: '🟠' },
    { id: 'urgent', label: 'Urgente', color: Colors.error[700], icon: '🔴' },
  ];

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
  ];

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAddNote = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la nota');
      return;
    }

    onAddNote(title, content, formCategory, formPriority);
    setTitle('');
    setContent('');
    setFormCategory("personal");
    setFormPriority("medium");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar nueva nota</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Título de la nota"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.neutral[400]}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <View style={styles.contentContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Contenido de la nota (opcional)"
                  multiline
                  numberOfLines={4}
                  value={content}
                  onChangeText={setContent}
                  placeholderTextColor={Colors.neutral[400]}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={20} color={Colors.neutral[600]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Categoría</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => setFormCategory(category.id)}
                  >
                    <Text style={styles.categoryText}>{category.icon} {category.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Prioridad</Text>
              <View style={styles.priorityGrid}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityButton,
                      formPriority === priority.id && styles.selectedPriority
                    ]}
                    onPress={() => setFormPriority(priority.id)}
                  >
                    <Text style={styles.priorityText}>{priority.icon} {priority.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddNote}
              >
                <Text style={styles.submitButtonText}>Agregar nota</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <Modal
            visible={showEmojiPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiModalOverlay}>
              <View style={styles.emojiModal}>
                <View style={styles.emojiModalHeader}>
                  <Text style={styles.emojiModalTitle}>Elegir un emoji</Text>
                  <TouchableOpacity
                    style={styles.emojiCloseButton}
                    onPress={() => setShowEmojiPicker(false)}
                  >
                    <X size={20} color={Colors.neutral[600]} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
                  <View style={styles.emojiRow}>
                    {emojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.emojiGridItem}
                        onPress={() => insertEmoji(emoji)}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for home indicator
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? Spacing.md : Spacing.lg,
    paddingVertical: isSmallScreen ? Spacing.md : Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  modalTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: Colors.neutral[900],
    flex: 1,
  },
  closeButton: {
    padding: isSmallScreen ? 8 : 12,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: isSmallScreen ? Spacing.md : Spacing.lg,
    flex: 1,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: isSmallScreen ? Spacing.xs : Spacing.sm,
    marginTop: isSmallScreen ? Spacing.sm : Spacing.md,
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    fontSize: isSmallScreen ? 15 : 16,
    color: Colors.neutral[900],
    marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: isSmallScreen ? 44 : 48, // Better touch target
  },
  contentContainer: {
    position: 'relative',
    marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
  },
  textArea: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    paddingRight: 50, // Make room for emoji button
    fontSize: isSmallScreen ? 15 : 16,
    color: Colors.neutral[900],
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: isSmallScreen ? 80 : 100,
  },
  emojiButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
    gap: isSmallScreen ? Spacing.xs : Spacing.sm,
  },
  categoryButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.xs : Spacing.sm,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    width: isSmallScreen ? '47%' : '48%',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: isSmallScreen ? 44 : 48, // Better touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
    borderWidth: 2,
  },
  categoryText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: Colors.neutral[700],
    textAlign: 'center',
    fontWeight: '500',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
    gap: isSmallScreen ? Spacing.xs : Spacing.sm,
  },
  priorityButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.xs : Spacing.sm,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    width: isSmallScreen ? '47%' : '48%',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: isSmallScreen ? 44 : 48, // Better touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
    borderWidth: 2,
  },
  priorityText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: Colors.neutral[700],
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    alignItems: 'center',
    marginTop: isSmallScreen ? Spacing.sm : Spacing.md,
    minHeight: isSmallScreen ? 48 : 52, // Better touch target
    justifyContent: 'center',
    ...Shadows.sm,
  },
  submitButtonText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Emoji Picker Styles
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    ...Shadows.lg,
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  emojiCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  emojiGrid: {
    maxHeight: 300,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emojiGridItem: {
    padding: 8,
    margin: 2,
    borderRadius: 8,
    backgroundColor: Colors.neutral[50],
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
});

export default AddNoteModal;