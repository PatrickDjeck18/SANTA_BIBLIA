// src/components/ChatMessage.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Book, User, Copy, Share, Trash2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
// Importing Colors as it's used in the original code, but not directly in the component's logic
import { Colors } from '@/constants/DesignTokens';
import { parseSimpleMarkdown } from '@/utils/textFormatting';

// Helper function to handle Firestore Timestamp objects and regular Dates
const convertTimestampToDate = (timestamp: Date | { toDate: () => Date }): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
};

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date | { toDate: () => Date }; // Updated type to handle Firestore Timestamps
  };
  onCopy?: (text: string) => void;
  onShare?: (text: string) => void;
  onDelete?: (messageId: string) => void;
  showDeleteButton?: boolean;
}

export function ChatMessage({ message, onCopy, onShare, onDelete, showDeleteButton = false }: ChatMessageProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  // Convert the timestamp to a Date object at the beginning of the component
  const timestamp = convertTimestampToDate(message.timestamp);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.text);
      Alert.alert('Copied', 'Message copied to clipboard');
      onCopy?.(message.text);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy message');
    }
  };

  const handleShare = () => {
    // You'd typically use `Share.share` from `react-native` or `expo-sharing` here.
    // The current implementation is a placeholder.
    Alert.alert('Share', `Sharing message: "${message.text}"`);
    onShare?.(message.text);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(message.id),
        },
      ]
    );
  };

  // Parse the message text for formatting
  const formattedTextElements = parseSimpleMarkdown(message.text);

  return (
    <View style={[
      styles.messageContainer,
      message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      {!message.isUser && (
        <View style={styles.aiMessageAvatar}>
          <Book size={16} color="white" />
        </View>
      )}
      
      <Pressable 
        style={[
          styles.messageBubble,
          message.isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          isPressed && showDeleteButton && styles.pressedBubble
        ]}
        onLongPress={showDeleteButton ? handleDelete : undefined}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        delayLongPress={500}
      >
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.aiMessageText
        ]}>
          {formattedTextElements.map((element, index) => (
            <Text key={index} style={element.style}>
              {element.text}
            </Text>
          ))}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            message.isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {formatTime(timestamp)}
          </Text>
          
          {!message.isUser && (
            <View style={styles.messageActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <Copy size={12} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={12} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {showDeleteButton && (
            <View style={styles.messageActions}>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <Trash2 size={12} color="#EF4444" />
              </TouchableOpacity>
              <Text style={styles.longPressHint}>Long press to delete</Text>
            </View>
          )}
        </View>
      </Pressable>
      
      {message.isUser && (
        <View style={styles.userMessageAvatar}>
          <User size={16} color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  aiMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  messageBubble: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  userMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 6,
    maxWidth: '80%',
  },
  aiMessageBubble: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  userMessageText: {
    color: 'white',
    fontWeight: '500',
  },
  aiMessageText: {
    color: '#111827',
    fontWeight: '400',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiMessageTime: {
    color: '#6B7280',
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pressedBubble: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  longPressHint: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginLeft: 4,
  },
});