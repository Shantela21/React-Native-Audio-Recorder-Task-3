import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

interface PlayButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  pulseAnim: Animated.Value;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onPress, pulseAnim }) => {
  return (
    <Animated.View
      style={{
        transform: [{ scale: isPlaying ? pulseAnim : 1 }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.playButton,
          isPlaying && styles.playButtonActive,
        ]}
        onPress={onPress}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  playButton: {
    backgroundColor: '#E94560',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playButtonActive: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
});
