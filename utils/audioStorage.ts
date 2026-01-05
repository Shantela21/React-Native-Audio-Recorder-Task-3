import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { VoiceNote } from '../types/audio';

const VOICE_NOTES_KEY = 'voice_notes';

export class AudioStorage {
  static getAudioDir(): string {
    return `${FileSystem.cacheDirectory || ''}audio/`;
  }

  static async initializeAudioDirectory(): Promise<void> {
    const AUDIO_DIR = this.getAudioDir();
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
    }
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
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting voice notes:', error);
      return [];
    }
  }

  static async deleteVoiceNote(id: string): Promise<void> {
    try {
      const notes = await this.getVoiceNotes();
      const noteToDelete = notes.find(note => note.id === id);
      
      if (noteToDelete) {
        // Delete the audio file
        await FileSystem.deleteAsync(noteToDelete.uri, { idempotent: true });
        
        // Remove from storage
        const updatedNotes = notes.filter(note => note.id !== id);
        await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
      }
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${this.getAudioDir()}recording-${timestamp}.wav`;
  }

  static async getAudioFileDuration(uri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      // For now, we'll estimate duration based on file size
      // In a real app, you'd use a proper audio library to get exact duration
      if (info.exists && info.size) {
        // Rough estimation: 1MB ≈ 1 minute for typical audio quality
        return Math.round((info.size / (1024 * 1024)) * 60);
      }
      return 0;
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }
}
