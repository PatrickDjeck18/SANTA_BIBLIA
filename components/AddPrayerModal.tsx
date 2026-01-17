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
import { Plus, X } from 'lucide-react-native';

interface AddPrayerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAddPrayer: (title: string, description: string, category: string, priority: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;

const AddPrayerModal: React.FC<AddPrayerModalProps> = ({ isVisible, onClose, onAddPrayer }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [formCategory, setFormCategory] = useState('personal');
    const [formPriority, setFormPriority] = useState('medium');
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isVisible) {
            setTitle('');
            setDescription('');
            setFormCategory('personal');
            setFormPriority('medium');
        }
    }, [isVisible]);

  const categories = [
    { id: 'personal', label: 'Personal', icon: '🙏', color: Colors.primary[500] },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: Colors.error[500] },
    { id: 'health', label: 'Health', icon: '🏥', color: Colors.success[500] },
    { id: 'work', label: 'Work', icon: '💼', color: Colors.warning[500] },
    { id: 'financial', label: 'Financial', icon: '💰', color: Colors.secondary[500] },
    { id: 'spiritual', label: 'Spiritual', icon: '✝️', color: Colors.primary[600] },
    { id: 'community', label: 'Community', icon: '🏘️', color: Colors.primary[500] },
    { id: 'gratitude', label: 'Gratitude', icon: '🙌', color: Colors.warning[500] },
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: Colors.neutral[400], icon: '🟢' },
    { id: 'medium', label: 'Medium', color: Colors.warning[500], icon: '🟡' },
    { id: 'high', label: 'High', color: Colors.error[500], icon: '🟠' },
    { id: 'urgent', label: 'Urgent', color: Colors.error[700], icon: '🔴' },
  ];

  const handleAddPrayer = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a prayer title');
      return;
    }

    onAddPrayer(title, description, formCategory, formPriority);
    setTitle('');
    setDescription('');
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
              <Text style={styles.modalTitle}>Add New Prayer</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Prayer Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.neutral[400]}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              
              <TextInput
                style={styles.textArea}
                placeholder="Description (optional)"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={Colors.neutral[400]}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              
              <Text style={styles.sectionTitle}>Category</Text>
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

              <Text style={styles.sectionTitle}>Priority</Text>
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
                onPress={handleAddPrayer}
              >
                <Text style={styles.submitButtonText}>Add Prayer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  textArea: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    fontSize: isSmallScreen ? 15 : 16,
    color: Colors.neutral[900],
    marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: isSmallScreen ? 80 : 100,
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
});

export default AddPrayerModal;