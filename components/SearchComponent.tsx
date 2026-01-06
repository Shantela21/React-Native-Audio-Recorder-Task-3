import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchComponentProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search recordings..."
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#16213E',
    padding: 18,
    paddingLeft: 52,
    borderRadius: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F3460',
  },
});
