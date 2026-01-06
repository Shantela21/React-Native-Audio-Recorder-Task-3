import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export interface Settings {
  recordingQuality: 'low' | 'medium' | 'high';
  playbackSpeeds: number[];
  defaultPlaybackSpeed: number;
  autoSaveRecordings: boolean;
  showRecordingDuration: boolean;
  enableAnimations: boolean;
  theme: 'dark' | 'light';
  skipDuration: number;
}

interface SettingsComponentProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

const defaultSettings: Settings = {
  recordingQuality: 'high',
  playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
  defaultPlaybackSpeed: 1.0,
  autoSaveRecordings: true,
  showRecordingDuration: true,
  enableAnimations: true,
  theme: 'dark',
  skipDuration: 10,
};

const recordingQualityOptions = [
  { value: 'low', label: 'Low (8kHz)', description: 'Smallest file size' },
  { value: 'medium', label: 'Medium (22kHz)', description: 'Balanced quality' },
  { value: 'high', label: 'High (44kHz)', description: 'Best quality' },
];

const playbackSpeedOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' },
];

const skipDurationOptions = [
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
];

export const SettingsComponent: React.FC<SettingsComponentProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderOption = (
    title: string,
    description: string,
    value: any,
    options: Array<{ value: any; label: string; description?: string }>,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.optionContainer}>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        {description && <Text style={styles.optionDescription}>{description}</Text>}
      </View>
      <View style={styles.optionsList}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionButtonText,
              value === option.value && styles.optionButtonTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderToggle = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View style={styles.optionContainer}>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        {description && <Text style={styles.optionDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3e3e3e', true: '#E94560' }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color="#E94560" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection('Recording Quality', (
          renderOption(
            'Recording Quality',
            'Higher quality uses more storage space',
            localSettings.recordingQuality,
            recordingQualityOptions,
            (value) => updateSetting('recordingQuality', value as 'low' | 'medium' | 'high')
          )
        ))}

        {renderSection('Playback Settings', (
          <>
            {renderOption(
              'Default Playback Speed',
              'Default speed when playing recordings',
              localSettings.defaultPlaybackSpeed,
              playbackSpeedOptions,
              (value) => updateSetting('defaultPlaybackSpeed', value as number)
            )}
            
            {renderOption(
              'Skip Duration',
              'Time to skip forward/backward',
              localSettings.skipDuration,
              skipDurationOptions,
              (value) => updateSetting('skipDuration', value as number)
            )}
          </>
        ))}

        {renderSection('User Interface', (
          <>
            {renderToggle(
              'Auto-save Recordings',
              'Automatically save recordings when stopped',
              localSettings.autoSaveRecordings,
              (value) => updateSetting('autoSaveRecordings', value)
            )}
            
            {renderToggle(
              'Show Recording Duration',
              'Display duration while recording',
              localSettings.showRecordingDuration,
              (value) => updateSetting('showRecordingDuration', value)
            )}
            
            {renderToggle(
              'Enable Animations',
              'Show animations for better user experience',
              localSettings.enableAnimations,
              (value) => updateSetting('enableAnimations', value)
            )}
          </>
        ))}

        {renderSection('Theme', (
          renderOption(
            'App Theme',
            'Choose your preferred color scheme',
            localSettings.theme,
            [
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ],
            (value) => updateSetting('theme', value as 'dark' | 'light')
          )
        ))}

        {renderSection('About', (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutText}>🎙️ Voice Recorder</Text>
            <Text style={styles.aboutSubtext}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A modern voice recording app with playback controls and customizable settings.
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  content: {
    flex: 1,
    padding: 24,
    
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E94560',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#1A1A2E',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0F3460',
    
  },
  optionContent: {
    flex: 1,
    marginRight: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: '#0F3460',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#E94560',
    borderColor: '#E94560',
  },
  optionButtonText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  aboutContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  aboutText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export { defaultSettings };

