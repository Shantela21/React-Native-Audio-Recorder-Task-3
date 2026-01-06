import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FeedbackSupportComponentProps {
  onClose: () => void;
}

export const FeedbackSupportComponent: React.FC<FeedbackSupportComponentProps> = ({ onClose }) => {
  const handleSendFeedback = () => {
    const email = 'support@voicerecorder.com';
    const subject = 'Voice Recorder App Feedback';
    const body = `Voice Recorder App Feedback\n\nDevice: ${require('react-native').Platform.OS}\nApp Version: 1.0.0\n\nPlease describe your feedback or issue:`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Email Not Available',
        'Please send your feedback to: support@voicerecorder.com',
        [{ text: 'OK' }]
      );
    });
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App',
      'Enjoying the Voice Recorder? Please take a moment to rate it!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => {
          // In a real app, this would open app store
          Alert.alert('Thank You!', 'Thank you for rating our app!');
        }}
      ]
    );
  };

  const handleReportBug = () => {
    const email = 'bugs@voicerecorder.com';
    const subject = 'Bug Report - Voice Recorder App';
    const body = `Bug Report\n\nDevice: ${require('react-native').Platform.OS}\nApp Version: 1.0.0\n\nDescribe the bug:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Email Not Available',
        'Please send bug reports to: bugs@voicerecorder.com',
        [{ text: 'OK' }]
      );
    });
  };

  const handleFeatureRequest = () => {
    const email = 'features@voicerecorder.com';
    const subject = 'Feature Request - Voice Recorder App';
    const body = `Feature Request\n\nDevice: ${require('react-native').Platform.OS}\nApp Version: 1.0.0\n\nFeature Description:\n\nUse Case:\n\nWhy this feature would be helpful:`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Email Not Available',
        'Please send feature requests to: features@voicerecorder.com',
        [{ text: 'OK' }]
      );
    });
  };

  const handleGetHelp = () => {
    Alert.alert(
      'Get Help',
      'Need help using the Voice Recorder?\n\n1. Check the user guide in settings\n2. Email us at support@voicerecorder.com\n3. Visit our website: www.voicerecorder.com',
      [
        { text: 'Email Support', onPress: handleSendFeedback },
        { text: 'Visit Website', onPress: () => {
          Linking.openURL('https://www.voicerecorder.com').catch(() => {
            Alert.alert('Website', 'Visit us at: www.voicerecorder.com');
          });
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderSupportOption = (
    icon: any,
    title: string,
    description: string,
    onPress: () => void,
    color: string = '#533483'
  ) => (
    <TouchableOpacity style={styles.supportOption} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Feedback & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          
          {renderSupportOption(
            'help-circle-outline',
            'User Guide',
            'Learn how to use all features',
            handleGetHelp,
            '#2196F3'
          )}
          
          {renderSupportOption(
            'chatbubble-outline',
            'Contact Support',
            'Get help from our support team',
            handleSendFeedback,
            '#4CAF50'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Feedback</Text>
          
          {renderSupportOption(
            'star-outline',
            'Rate App',
            'Rate your experience and help others',
            handleRateApp,
            '#FF9800'
          )}
          
          {renderSupportOption(
            'paper-plane-outline',
            'Send Feedback',
            'Share your thoughts and suggestions',
            handleSendFeedback,
            '#9C27B0'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Issues</Text>
          
          {renderSupportOption(
            'bug-outline',
            'Report a Bug',
            'Help us fix issues and improve the app',
            handleReportBug,
            '#F44336'
          )}
          
          {renderSupportOption(
            'bulb-outline',
            'Request Feature',
            'Suggest new features or improvements',
            handleFeatureRequest,
            '#FF5722'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutText}>Voice Recorder App</Text>
            <Text style={styles.aboutSubtext}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A professional voice recording application with advanced features for capturing and managing your audio recordings.
            </Text>
            
            <View style={styles.aboutLinks}>
              <TouchableOpacity 
                style={styles.aboutLink}
                onPress={() => Linking.openURL('https://www.voicerecorder.com/privacy').catch(() => {})}
              >
                <Text style={styles.aboutLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aboutLink}
                onPress={() => Linking.openURL('https://www.voicerecorder.com/terms').catch(() => {})}
              >
                <Text style={styles.aboutLinkText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    backgroundColor: '#1A1A2E',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
  },
  aboutContainer: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  aboutLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  aboutLink: {
    paddingVertical: 8,
  },
  aboutLinkText: {
    fontSize: 14,
    color: '#E94560',
    textDecorationLine: 'underline',
  },
});
