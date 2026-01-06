import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SettingsButtonProps {
  onPress: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.settingsButton}
      onPress={onPress}
    >
      <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#16213E",
    borderWidth: 1,
    borderColor: "#0F3460",
  },
});
