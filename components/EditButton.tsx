import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface EditButtonProps {
  onPress: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
    >
      <Ionicons name="create-outline" size={22} color="#E94560" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
