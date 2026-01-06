import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {
    FeedbackSupportButton,
    FeedbackSupportComponent,
    NoteItem,
    RecordButton,
    SearchComponent,
    SettingsButton,
    SettingsComponent
} from '../components';
import { Settings } from '../components/SettingsComponent';
import { VoiceNote } from '../types/audio';
import { SettingsStorage } from '../utils/settingsStorage';
import { SimpleAudioStorage } from '../utils/simpleAudioStorage';

const { width } = Dimensions.get('window');

interface AudioRecorderProps {}

const AudioRecorder: React.FC<AudioRecorderProps> = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState<{[key: string]: number}>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playbackPosition, setPlaybackPosition] = useState<{[key: string]: number}>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const recordingInterval = useRef<number | null>(null);
  const playbackInterval = useRef<number | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVoiceNotes();
    loadSettings();
    
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

  const loadSettings = async () => {
    try {
      const loadedSettings = await SettingsStorage.loadSettings();
      setSettings(loadedSettings);
      setPlaybackSpeed(loadedSettings.defaultPlaybackSpeed);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await SettingsStorage.saveSettings(newSettings);
      setSettings(newSettings);
      setPlaybackSpeed(newSettings.defaultPlaybackSpeed);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

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
      setIsPaused(false);
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

  const pauseRecording = async () => {
    if (recording && !isPaused) {
      try {
        await recording.pauseAsync();
        setIsPaused(true);
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
        }
      } catch (error) {
        console.error('Error pausing recording:', error);
      }
    }
  };

  const resumeRecording = async () => {
    if (recording && isPaused) {
      try {
        await recording.startAsync();
        setIsPaused(false);
        recordingInterval.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error resuming recording:', error);
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    console.log('Stopping recording..');
    setIsRecording(false);
    setIsPaused(false);
    
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
        { 
          shouldPlay: true,
          rate: playbackSpeed,
          shouldCorrectPitch: true,
        }
      );
      
      setSound(playbackSound);
      setIsPlaying(note.id);
      
      // Start playback duration tracking
      const startTime = Date.now();
      playbackInterval.current = setInterval(async () => {
        if (playbackSound) {
          const status = await playbackSound.getStatusAsync();
          if (status.isLoaded && status.positionMillis) {
            const currentSeconds = Math.floor(status.positionMillis / 1000);
            setPlaybackDuration(prev => ({ ...prev, [note.id]: currentSeconds }));
            setPlaybackPosition(prev => ({ ...prev, [note.id]: status.positionMillis! }));
          }
        }
      }, 100);

      playbackSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(null);
          if (playbackInterval.current) {
            clearInterval(playbackInterval.current);
          }
          setPlaybackDuration(prev => ({ ...prev, [note.id]: 0 }));
          setPlaybackPosition(prev => ({ ...prev, [note.id]: 0 }));
        }
      });

    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const seekToPosition = async (note: VoiceNote, position: number) => {
    if (sound && isPlaying === note.id) {
      try {
        await sound.setPositionAsync(position);
        setPlaybackPosition(prev => ({ ...prev, [note.id]: position }));
        setPlaybackDuration(prev => ({ ...prev, [note.id]: Math.floor(position / 1000) }));
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const skipForward = async (note: VoiceNote, seconds?: number) => {
    const skipDuration = seconds || settings?.skipDuration || 10;
    if (sound && isPlaying === note.id) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.positionMillis) {
          const newPosition = Math.min(status.positionMillis + (skipDuration * 1000), note.duration * 1000);
          await seekToPosition(note, newPosition);
        }
      } catch (error) {
        console.error('Error skipping forward:', error);
      }
    }
  };

  const skipBackward = async (note: VoiceNote, seconds?: number) => {
    const skipDuration = seconds || settings?.skipDuration || 10;
    if (sound && isPlaying === note.id) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.positionMillis) {
          const newPosition = Math.max(status.positionMillis - (skipDuration * 1000), 0);
          await seekToPosition(note, newPosition);
        }
      } catch (error) {
        console.error('Error skipping backward:', error);
      }
    }
  };

  const changePlaybackSpeed = async (speed: number) => {
    setPlaybackSpeed(speed);
    if (sound && isPlaying) {
      try {
        await sound.setRateAsync(speed, true);
      } catch (error) {
        console.error('Error changing speed:', error);
      }
    }
  };

  const handleRecordingControl = async () => {
    if (!isRecording) {
      await startRecording();
    } else if (isPaused) {
      await resumeRecording();
    } else {
      await pauseRecording();
    }
  };

  // Add a separate save function for when user wants to save while paused
  const cancelRecording = async () => {
    if (isRecording && isPaused) {
      try {
        // Stop the recording without saving
        setIsRecording(false);
        setIsPaused(false);
        
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
        }

        if (recording) {
          await recording.stopAndUnloadAsync();
        }

        setRecording(null);
        setRecordingDuration(0);
        
        Alert.alert('Cancelled', 'Recording has been cancelled');
      } catch (error) {
        console.error('Error cancelling recording:', error);
        Alert.alert('Error', 'Failed to cancel recording');
      }
    }
  };

  const saveRecording = async () => {
    if (isRecording && isPaused) {
      await stopRecording();
    }
  };

  const stopPlayback = async (note: VoiceNote) => {
    if (sound && isPlaying === note.id) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(null);
        setPlaybackDuration(prev => ({ ...prev, [note.id]: 0 }));
        setPlaybackPosition(prev => ({ ...prev, [note.id]: 0 }));
        if (playbackInterval.current) {
          clearInterval(playbackInterval.current);
        }
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNotes = voiceNotes.filter(note =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎙️ Voice Recorder</Text>
        <View style={styles.headerActions}>
          <SearchComponent 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FeedbackSupportButton onPress={() => setShowFeedback(true)} />
          <SettingsButton onPress={() => setShowSettings(true)} />
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
            <NoteItem
              key={note.id}
              note={note}
              isPlaying={isPlaying === note.id}
              isEditing={editingNote === note.id}
              editName={editName}
              onPlay={() => playSound(note)}
              onStop={() => stopPlayback(note)}
              onDelete={() => deleteVoiceNote(note.id)}
              onEdit={() => startEditingNote(note)}
              onSaveEdit={saveEditNote}
              onEditNameChange={setEditName}
              pulseAnim={pulseAnim}
              playbackDuration={playbackDuration[note.id] || 0}
              onSeek={(position) => seekToPosition(note, position)}
              onSkipForward={() => skipForward(note)}
              onSkipBackward={() => skipBackward(note)}
              onChangeSpeed={() => {
                const speeds = settings?.playbackSpeeds || [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                const currentIndex = speeds.indexOf(playbackSpeed);
                const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                changePlaybackSpeed(nextSpeed);
              }}
              playbackSpeed={playbackSpeed}
            />
          ))
        )}
      </ScrollView>

      <RecordButton
        isRecording={isRecording}
        isPaused={isPaused}
        recordingDuration={recordingDuration}
        onPress={handleRecordingControl}
        onSave={saveRecording}
        onCancel={cancelRecording}
        pulseAnim={pulseAnim}
      />

      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SettingsComponent
          settings={settings || {
            recordingQuality: 'medium',
            playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
            defaultPlaybackSpeed: 1.0,
            skipDuration: 10,
            autoSaveRecordings: true,
            showRecordingDuration: true,
            enableAnimations: true,
            theme: 'dark',
          }}
          onSettingsChange={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      </Modal>

      <Modal
        visible={showFeedback}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <FeedbackSupportComponent
          onClose={() => setShowFeedback(false)}
        />
      </Modal>
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  notesList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 140,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AudioRecorder;
