/**
 * Import Wallet — testIDs: import-wallet-title, import-paste-button, import-wallet-submit-button, seed-word-input-*
 */
import { SeedPhrase } from '@/components/SeedPhrase';
import { useWalletSetup } from '@/contexts/WalletSetupContext';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function ImportWalletScreen() {
  const router = useRouter();
  const { setSeedPhrase } = useWalletSetup();
  const insets = useSafeAreaInsets();
  const [secretWords, setSecretWords] = useState<string[]>(Array(12).fill(''));

  const handleWordChange = (index: number, text: string) => {
    const next = [...secretWords];
    next[index] = text;
    setSecretWords(next);
  };

  const handlePaste = async () => {
    try {
      const content = await Clipboard.getStringAsync();
      if (!content?.trim()) {
        Alert.alert('Empty Clipboard', 'No text found in clipboard');
        return;
      }
      const words = content.trim().split(/\s+/).slice(0, 12);
      if (words.length < 12) {
        Alert.alert('Invalid Phrase', `Found only ${words.length} words. Need 12.`);
        return;
      }
      const next = [...secretWords];
      words.forEach((w, i) => { if (i < 12) next[i] = w.toLowerCase().trim(); });
      setSecretWords(next);
    } catch {
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  const isFormValid = () => secretWords.every((w) => w.trim().length > 0);
  const validatePhrase = (phrase: string) => {
    const words = phrase.trim().split(/\s+/).filter(Boolean);
    if (words.length !== 12 && words.length !== 24) return false;
    return words.every((w) => w.length >= 3 && /^[a-z]+$/.test(w));
  };

  const handleImport = () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete', 'Please fill in all 12 words of your secret phrase', [{ text: 'OK' }]);
      return;
    }
    const phrase = secretWords.join(' ');
    if (!validatePhrase(phrase)) {
      Alert.alert(
        'Invalid Seed Phrase',
        'Please check your seed phrase. Make sure all words are spelled correctly and contain only lowercase letters.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSeedPhrase(phrase);
    router.push('/wallet-setup/import-name-wallet');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <Text testID="import-wallet-title" style={styles.title}>Import via Secret Phrase</Text>
          <SeedPhrase words={secretWords} editable onWordChange={handleWordChange} />
          <View style={styles.actions}>
            <TouchableOpacity testID="import-paste-button" style={styles.actionBtn} onPress={handlePaste}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.actionText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          testID="import-wallet-submit-button"
          style={[styles.importBtn, !isFormValid() && styles.importBtnDisabled]}
          onPress={handleImport}
        >
          <Text style={[styles.importText, !isFormValid() && styles.importTextDisabled]}>Import Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: colors.primary, fontSize: 16, marginLeft: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 32 },
  actions: { flexDirection: 'row', marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tintedBackground, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: colors.primary },
  actionText: { color: colors.primary, fontSize: 16, marginLeft: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 20 },
  importBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  importBtnDisabled: { backgroundColor: colors.card },
  importText: { fontSize: 18, fontWeight: '600', color: colors.black },
  importTextDisabled: { color: colors.textTertiary },
});
