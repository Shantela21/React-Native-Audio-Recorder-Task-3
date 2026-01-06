import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecordButtonProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  onPress: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  pulseAnim: Animated.Value;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  isPaused, 
  recordingDuration, 
  onPress, 
  onSave,
  onCancel,
  pulseAnim 
}) => {
  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <View style={[styles.recordingDot, styles.recordingDotPulse]} />
          </Animated.View>
          <Text style={styles.recordingText}>
            🔴 {isPaused ? 'Paused' : 'Recording'}... {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {isRecording && isPaused && (
          <>
            {onSave && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={onSave}
              >
                <Ionicons name="checkmark" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
        
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            style={[
              styles.recordButton, 
              isRecording && !isPaused && styles.recordButtonActive,
              isRecording && isPaused && styles.recordButtonPaused
            ]}
            onPress={onPress}
          >
            <Ionicons
              name={
                !isRecording ? "mic" : 
                isPaused ? "play" : "pause"
              }
              size={36}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <Text style={styles.recordButtonText}>
        {
          !isRecording ? '🎤 Start Recording' :
          isPaused ? '▶️ Resume Recording' : '⏸️ Pause Recording'
        }
      </Text>
    </View>
  );
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  recordingDotPulse: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  recordingText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  recordButton: {
    backgroundColor: '#533483',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#533483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#E94560',
    shadowColor: '#E94560',
  },
  recordButtonPaused: {
    backgroundColor: '#FFA500',
    shadowColor: '#FFA500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonText: {
    fontSize: 16,
    color: '#AAA',
    fontWeight: '600',
  },
});
