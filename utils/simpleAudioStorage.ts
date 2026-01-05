import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceNote } from '../types/audio';

const VOICE_NOTES_KEY = 'voice_notes';

export class SimpleAudioStorage {
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
}
