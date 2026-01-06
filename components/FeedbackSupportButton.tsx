import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FeedbackSupportButtonProps {
  onPress: () => void;
}

export const FeedbackSupportButton: React.FC<FeedbackSupportButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.feedbackButton} onPress={onPress}>
      <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  feedbackButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#16213E",
    borderWidth: 1,
    borderColor: "#0F3460",
  },
});
