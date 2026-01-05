import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceNote } from '../types/audio';

const VOICE_NOTES_KEY = 'voice_notes';

export class AudioStorage {
  static async initializeAudioDirectory(): Promise<void> {
    // For now, we'll skip file system initialization since we're using AsyncStorage
    // This can be implemented later when FileSystem API is properly configured
    console.log('AudioStorage initialized');
  }

  static async saveVoiceNote(voiceNote: VoiceNote): Promise<void> {
    try {
      const existingNotes = await this.getVoiceNotes();
      existingNotes.push(voiceNote);
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(existingNotes));
    } catch (error) {
      console.error('Error saving voice note:', error);
      throw error;
    }
  }

  static async getVoiceNotes(): Promise<VoiceNote[]> {
    try {
      const notes = await AsyncStorage.getItem(VOICE_NOTES_KEY);
      if (notes) {
        const parsed = JSON.parse(notes);
        return parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting voice notes:', error);
      return [];
    }
  }

  static async deleteVoiceNote(id: string): Promise<void> {
    try {
      const notes = await this.getVoiceNotes();
      const updatedNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error deleting voice note:', error);
      throw error;
    }
  }

  static async updateVoiceNoteName(id: string, newName: string): Promise<void> {
    try {
      const notes = await this.getVoiceNotes();
      const updatedNotes = notes.map(note => 
        note.id === id ? { ...note, name: newName } : note
      );
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error updating voice note name:', error);
      throw error;
    }
  }

  static async generateAudioFileName(): Promise<string> {
    // Generate a simple filename without file system dependencies
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `recording-${timestamp}.wav`;
  }

  static async getAudioFileDuration(uri: string): Promise<number> {
    try {
      // For now, return a default duration
      // In a real implementation, you'd use expo-av to get the actual duration
      return 30; // Default 30 seconds
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }
}
