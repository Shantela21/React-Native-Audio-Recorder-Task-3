import { StatusBar } from 'expo-status-bar';
import AudioRecorder from '../pages/audioRecorder';

export default function Index() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0F0F23" />
      <AudioRecorder />
    </>
  );
}
