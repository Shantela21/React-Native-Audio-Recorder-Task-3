import { StatusBar } from 'expo-status-bar';
import AudioRecorder from '../components/AudioRecorder';

export default function Index() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0F0F23" />
      <AudioRecorder />
    </>
  );
}
