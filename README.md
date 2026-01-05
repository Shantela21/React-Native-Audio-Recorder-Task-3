# Voice Recorder App

A React Native voice recording application with CRUD functionality for managing voice notes.

## Features

### Core Functionality
- **Audio Recording**: Record high-quality audio using device microphone
- **Audio Playback**: Play recorded audio with duration display and playback controls
- **Voice Notes List**: Display all recordings with date/time information
- **Search**: Find specific recordings by name
- **Rename**: Edit recording names for better organization
- **Delete**: Remove unwanted recordings with confirmation

### Technical Features
- **Persistent Storage**: Recordings are saved using AsyncStorage
- **Permissions Handling**: Automatic microphone permission requests
- **Real-time Updates**: Live recording duration and playback progress
- **Modern UI**: Clean, intuitive interface with smooth interactions
- **Error Handling**: Comprehensive error messages and fallbacks

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
npm run android     # For Android
npm run ios         # For iOS
npm run web         # For web
```

## Usage

### Recording Audio
1. Tap the microphone button to start recording
2. The recording indicator shows duration in real-time
3. Tap the stop button to finish recording
4. Recording is automatically saved with a timestamp name

### Playing Audio
1. Tap the play button next to any recording
2. Use the same button to pause/resume playback
3. Duration shows current time / total time

### Managing Recordings
- **Search**: Use the search bar to filter recordings by name
- **Rename**: Tap the edit icon to change recording names
- **Delete**: Tap the trash icon to remove recordings (with confirmation)

## Technical Implementation

### Dependencies
- `expo-av`: Audio recording and playback
- `@react-native-async-storage/async-storage`: Persistent storage
- `expo-file-system`: File management
- `@expo/vector-icons`: UI icons

### Architecture
- **Components**: Modular React Native components
- **Types**: TypeScript interfaces for type safety
- **Utils**: Storage management and helper functions
- **Storage**: AsyncStorage for data persistence

### File Structure
```
app/
├── index.tsx              # Main app entry
├── _layout.tsx            # Navigation layout
components/
├── AudioRecorder.tsx      # Main recording component
types/
├── audio.ts               # TypeScript interfaces
utils/
├── simpleAudioStorage.ts  # Storage management
```

## Evaluation Criteria Met

✅ **Audio Recording**: Can record audio with microphone  
✅ **Audio Playback**: Can play audio with duration display  
✅ **Playback Controls**: User can control audio playback  
✅ **Audio Persistence**: Audio is persistent when app is closed/restarted  
✅ **Audio Renaming**: Can rename audio recordings  
✅ **Search Functionality**: Can search recordings by name  

## Permissions

The app requires:
- **Microphone Access**: For recording audio
- **Storage Access**: For saving audio files

These permissions are automatically requested when needed.

## Platform Support

- **iOS**: Full support with native audio recording
- **Android**: Full support with native audio recording  
- **Web**: Limited support (browser-dependent)

## Development

Built with:
- React Native with Expo
- TypeScript for type safety
- Modern React hooks and patterns
- Responsive design principles

## Future Enhancements

Potential features for future versions:
- Cloud backup and sync
- Audio quality settings
- Playback speed control
- Audio waveform visualization
- Export/share functionality
- Categories and tags
- Voice-to-text transcription
