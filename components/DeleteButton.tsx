import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface DeleteButtonProps {
  onPress: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
    >
      <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
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
