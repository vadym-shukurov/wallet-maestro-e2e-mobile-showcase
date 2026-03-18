/**
 * Minimal SeedPhrase component for E2E showcase.
 * testIDs: seed-word-input-{0..11}, seed-word-value-{0..11}
 */
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/constants/colors';

interface Props {
  words: string[];
  editable?: boolean;
  onWordChange?: (index: number, word: string) => void;
  isLoading?: boolean;
  hidden?: boolean;
}

export function SeedPhrase({ words, editable = false, onWordChange, isLoading = false, hidden = false }: Props) {
  const getDisplayWord = (word: string) => (hidden && word ? '••••••' : word);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Generating secure seed phrase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {words.map((word, index) => (
        <View key={index} style={styles.wordItem}>
          <Text style={styles.wordNum}>{index + 1}</Text>
          {editable ? (
            <TextInput
              testID={`seed-word-input-${index}`}
              style={styles.input}
              value={word}
              onChangeText={(t) => onWordChange?.(index, t.trim().toLowerCase())}
              placeholder=""
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Text testID={`seed-word-value-${index}`} style={styles.wordText}>{getDisplayWord(word)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 24 },
  wordItem: {
    width: '31.33%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: '1%',
  },
  wordNum: { color: colors.textTertiary, fontSize: 14, marginRight: 6 },
  wordText: { color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 },
  input: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  loading: { color: colors.textSecondary, fontSize: 16 },
});
