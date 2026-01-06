import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../components/SettingsComponent';

const SETTINGS_KEY = 'voice_recorder_settings';

export class SettingsStorage {
  static async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static async loadSettings(): Promise<Settings> {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      return {
        recordingQuality: 'high',
        playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
        defaultPlaybackSpeed: 1.0,
        autoSaveRecordings: true,
        showRecordingDuration: true,
        enableAnimations: true,
        theme: 'dark',
        skipDuration: 10,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        recordingQuality: 'high',
        playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
        defaultPlaybackSpeed: 1.0,
        autoSaveRecordings: true,
        showRecordingDuration: true,
        enableAnimations: true,
        theme: 'dark',
        skipDuration: 10,
      };
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}
