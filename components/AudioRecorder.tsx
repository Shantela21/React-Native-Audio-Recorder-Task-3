import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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

  useEffect(() => {
    loadVoiceNotes();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Recorder</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recordings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.notesList}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mic-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No recordings found' : 'No recordings yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {!searchQuery && 'Tap the record button to start'}
            </Text>
          </View>
        ) : (
          filteredNotes.map(note => (
            <View key={note.id} style={styles.noteItem}>
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
                    />
                  ) : (
                    <Text style={styles.noteName}>{note.name}</Text>
                  )}
                  <View style={styles.noteActions}>
                    {editingNote !== note.id && (
                      <TouchableOpacity onPress={() => startEditingNote(note)}>
                        <Ionicons name="create-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => deleteVoiceNote(note.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                
                <View style={styles.playbackControls}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playSound(note)}
                  >
                    <Ionicons 
                      name={isPlaying === note.id ? "pause" : "play"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>
                      {formatDuration(playbackDuration[note.id] || 0)} / {formatDuration(note.duration)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.recordingControls}>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... {formatDuration(recordingDuration)}</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notesList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  editInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    padding: 2,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationInfo: {
    flex: 1,
  },
  durationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  recordingControls: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
  },
  recordingText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600',
  },
  recordButton: {
    backgroundColor: '#ccc',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordButtonActive: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default AudioRecorder;
