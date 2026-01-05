export interface VoiceNote {
  id: string;
  name: string;
  uri: string;
  duration: number;
  createdAt: Date;
  size?: number;
}

export interface RecordingStatus {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
}
