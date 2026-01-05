import { StatusBar } from 'expo-status-bar';
import AudioRecorder from '../components/AudioRecorder';

export default function Index() {
  return (
    <>
      <StatusBar style="auto" />
      <AudioRecorder />
    </>
  );
}
