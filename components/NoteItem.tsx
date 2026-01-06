import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { VoiceNote } from '../types/audio';
import { DeleteButton } from './DeleteButton';
import { EditButton } from './EditButton';
import { PlayButton } from './PlayButton';

interface NoteItemProps {
  note: VoiceNote;
  isPlaying: boolean;
  isEditing: boolean;
  editName: string;
  onPlay: () => void;
  onStop: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onEditNameChange: (text: string) => void;
  pulseAnim: Animated.Value;
  playbackDuration: number;
  onSeek: (position: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onChangeSpeed: () => void;
  playbackSpeed: number;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isPlaying,
  isEditing,
  editName,
  onPlay,
  onStop,
  onDelete,
  onEdit,
  onSaveEdit,
  onEditNameChange,
  pulseAnim,
  playbackDuration,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onChangeSpeed,
  playbackSpeed
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.noteItem,
        {
          opacity: 1,
        },
      ]}
    >
      <View style={styles.noteContent}>
        <View style={styles.noteHeader}>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={onEditNameChange}
              autoFocus
              onBlur={onSaveEdit}
              onSubmitEditing={onSaveEdit}
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.noteName}>🎵 {note.name}</Text>
          )}
          
          <View style={styles.noteActions}>
            {!isEditing && <EditButton onPress={onEdit} />}
            <DeleteButton onPress={onDelete} />
          </View>
        </View>
        
        <Text style={styles.noteDate}>📅 {formatDate(note.createdAt)}</Text>
        
        <View style={styles.playbackControls}>
          <PlayButton isPlaying={isPlaying} onPress={onPlay} pulseAnim={pulseAnim} />
          
          {isPlaying && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={onStop}
            >
              <Ionicons name="stop" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
          
          <View style={styles.durationInfo}>
            <Text style={styles.durationText}>
              ⏱️ {formatDuration(playbackDuration)} / {formatDuration(note.duration)}
            </Text>
            
            <TouchableOpacity
              style={styles.progressBar}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const progressBarWidth = 200;
                const clickPosition = (locationX / progressBarWidth) * note.duration * 1000;
                onSeek(clickPosition);
              }}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(playbackDuration || 0) / note.duration * 100}%`,
                  },
                ]}
              />
            </TouchableOpacity>
            
            <View style={styles.playbackSecondaryControls}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkipBackward}
              >
                <Ionicons name="play-back" size={16} color="#888" />
                <Text style={styles.skipButtonText}>10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.speedButton}
                onPress={onChangeSpeed}
              >
                <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkipForward}
              >
                <Text style={styles.skipButtonText}>10s</Text>
                <Ionicons name="play-forward" size={16} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  noteItem: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#E94560',
    marginHorizontal: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
    lineHeight: 24,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E94560',
    padding: 4,
    lineHeight: 24,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stopButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  durationInfo: {
    flex: 1,
  },
  durationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E94560',
    borderRadius: 2,
  },
  playbackSecondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 136, 136, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  skipButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  speedButton: {
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speedButtonText: {
    fontSize: 12,
    color: '#E94560',
    fontWeight: '600',
  },
});
