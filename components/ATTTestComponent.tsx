import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useATT } from '../hooks/useATT';

export const ATTTestComponent: React.FC = () => {
  const { status, isAuthorized, isLoading, requestPermission, showPermissionDialog } = useATT();

  const handleTestATT = async () => {
    try {
      console.log('Testing ATT permission request...');
      const result = await requestPermission();
      Alert.alert(
        'ATT Result',
        `Permission ${result ? 'granted' : 'denied'}. Status: ${status}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('ATT test error:', error);
      Alert.alert('Error', 'Failed to request ATT permission');
    }
  };

  const handleShowDialog = async () => {
    try {
      console.log('Showing ATT dialog...');
      const result = await showPermissionDialog();
      Alert.alert(
        'ATT Dialog Result',
        `Permission ${result ? 'granted' : 'denied'}. Status: ${status}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('ATT dialog error:', error);
      Alert.alert('Error', 'Failed to show ATT dialog');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ATT Test Component</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.status}>Authorized: {isAuthorized ? 'Yes' : 'No'}</Text>
      <Text style={styles.status}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTestATT}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Test ATT Request</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleShowDialog}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Show ATT Dialog</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
