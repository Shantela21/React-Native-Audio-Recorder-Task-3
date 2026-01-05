import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { VoiceNote } from '../types/audio';
import { SimpleAudioStorage } from '../utils/simpleAudioStorage';

const { width } = Dimensions.get('window');

interface AudioRecorderProps {}

const AudioRecorder: React.FC<AudioRecorderProps> = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState<{[key: string]: number}>({});
  const recordingInterval = useRef<number | null>(null);
  const playbackInterval = useRef<number | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVoiceNotes();
    
    // Initial fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, []);

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const loadVoiceNotes = async () => {
    try {
      const notes = await SimpleAudioStorage.getVoiceNotes();
      setVoiceNotes(notes);
    } catch (error) {
      console.error('Error loading voice notes:', error);
    }
  };

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please grant microphone permission to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    console.log('Stopping recording..');
    setIsRecording(false);
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          uri,
          duration: recordingDuration,
          createdAt: new Date(),
        };

        await SimpleAudioStorage.saveVoiceNote(newNote);
        setVoiceNotes(prev => [newNote, ...prev]);
        Alert.alert('Success', 'Recording saved successfully!');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }

    setRecording(null);
    setRecordingDuration(0);
  };

  const playSound = async (note: VoiceNote) => {
    if (sound) {
      await sound.unloadAsync();
    }

    if (isPlaying === note.id) {
      // Stop playing
      setIsPlaying(null);
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
      return;
    }

    try {
      console.log('Loading Sound');
      const { sound: playbackSound } = await Audio.Sound.createAsync(
        { uri: note.uri },
        { shouldPlay: true }
      );
      
      setSound(playbackSound);
      setIsPlaying(note.id);
      
      // Start playback duration tracking
      const startTime = Date.now();
      playbackInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setPlaybackDuration(prev => ({ ...prev, [note.id]: elapsed }));
        
        if (elapsed >= note.duration) {
          clearInterval(playbackInterval.current!);
          setIsPlaying(null);
          setPlaybackDuration(prev => ({ ...prev, [note.id]: 0 }));
        }
      }, 1000);

      playbackSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(null);
          if (playbackInterval.current) {
            clearInterval(playbackInterval.current);
          }
          setPlaybackDuration(prev => ({ ...prev, [note.id]: 0 }));
        }
      });

    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const deleteVoiceNote = async (id: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SimpleAudioStorage.deleteVoiceNote(id);
              setVoiceNotes(prev => prev.filter(note => note.id !== id));
              if (isPlaying === id) {
                setIsPlaying(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recording');
            }
          }
        }
      ]
    );
  };

  const startEditingNote = (note: VoiceNote) => {
    setEditingNote(note.id);
    setEditName(note.name);
  };

  const saveEditNote = async () => {
    if (editingNote && editName.trim()) {
      try {
        await SimpleAudioStorage.updateVoiceNoteName(editingNote, editName.trim());
        setVoiceNotes(prev => 
          prev.map(note => 
            note.id === editingNote ? { ...note, name: editName.trim() } : note
          )
        );
        setEditingNote(null);
        setEditName('');
      } catch (error) {
        Alert.alert('Error', 'Failed to update recording name');
      }
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditName('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const filteredNotes = voiceNotes.filter(note =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎙️ Voice Recorder</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recordings..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="mic-off" size={64} color="#666" />
            </Animated.View>
            <Text style={styles.emptyText}>
              {searchQuery ? '🔍 No recordings found' : '🎵 No recordings yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {!searchQuery && 'Tap the microphone button below to start recording'}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note, index) => (
            <Animated.View
              key={note.id}
              style={[
                styles.noteItem,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.noteContent}>
                <View style={styles.noteHeader}>
                  {editingNote === note.id ? (
                    <TextInput
                      style={styles.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      onBlur={saveEditNote}
                      onSubmitEditing={saveEditNote}
                      placeholderTextColor="#888"
                    />
                  ) : (
                    <Text style={styles.noteName}>🎵 {note.name}</Text>
                  )}
                  <View style={styles.noteActions}>
                    {editingNote !== note.id && (
                      <TouchableOpacity
                        onPress={() => startEditingNote(note)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="create-outline" size={22} color="#E94560" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => deleteVoiceNote(note.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.noteDate}>📅 {formatDate(note.createdAt)}</Text>
                
                <View style={styles.playbackControls}>
                  <Animated.View
                    style={{
                      transform: [{ scale: isPlaying === note.id ? pulseAnim : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.playButton,
                        isPlaying === note.id && styles.playButtonActive,
                      ]}
                      onPress={() => playSound(note)}
                    >
                      <Ionicons
                        name={isPlaying === note.id ? "pause" : "play"}
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                  
                  <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>
                      ⏱️ {formatDuration(playbackDuration[note.id] || 0)} / {formatDuration(note.duration)}
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(playbackDuration[note.id] || 0) / note.duration * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <View style={styles.recordingControls}>
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
              🔴 Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}
        
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={36}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
        
        <Text style={styles.recordButtonText}>
          {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#16213E',
    padding: 16,
    paddingLeft: 48,
    borderRadius: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  notesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 120, // Extra padding for recording controls
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  noteItem: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#E94560',
    marginHorizontal: 4, // Small horizontal margin for better spacing
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E94560',
    padding: 2,
    lineHeight: 22,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  durationInfo: {
    flex: 1,
  },
  durationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E94560',
    borderRadius: 2,
  },
  recordingControls: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  recordButtonText: {
    fontSize: 16,
    color: '#AAA',
    fontWeight: '600',
  },
});

export default AudioRecorder;
