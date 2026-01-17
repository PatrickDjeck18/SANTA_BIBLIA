// Test component for guest AI chat persistence
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testGuestAIChatPersistence, simulateAppRestart } from '@/utils/testGuestAIChatPersistence';
import { getGuestAIConversationCount, getGuestAIMessageCount } from '@/utils/guestAIChatStorage';

export const TestGuestAIChatPersistence: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runPersistenceTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🧪 Starting guest AI chat persistence test...');
      await testGuestAIChatPersistence();
      addResult('✅ Persistence test completed successfully!');
    } catch (error) {
      addResult(`❌ Persistence test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runRestartSimulation = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔄 Starting app restart simulation...');
      await simulateAppRestart();
      addResult('✅ App restart simulation completed successfully!');
    } catch (error) {
      addResult(`❌ App restart simulation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentData = async () => {
    try {
      const conversationCount = await getGuestAIConversationCount();
      const messageCount = await getGuestAIMessageCount();
      
      Alert.alert(
        'Current Guest AI Chat Data',
        `Conversations: ${conversationCount}\nMessages: ${messageCount}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to get data: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guest AI Chat Persistence Test</Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runPersistenceTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Test...' : 'Test Persistence'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runRestartSimulation}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Simulation...' : 'Simulate App Restart'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={checkCurrentData}
      >
        <Text style={styles.buttonText}>Check Current Data</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

